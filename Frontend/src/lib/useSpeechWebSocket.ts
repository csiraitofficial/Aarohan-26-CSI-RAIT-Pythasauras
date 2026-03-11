import { useCallback, useEffect, useRef, useState } from "react";

type SpeechStatus = "idle" | "connecting" | "running" | "closed" | "error" | "reconnecting";

type Metrics = { filler_count: number; pause_seconds: number; total_words: number };

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;

function getWsUrl() {
  const envUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (envUrl) return envUrl;
  
  // In development, use relative URL which Vite proxy will handle
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = window.location.host;
  return `${protocol}//${host}/api/speech/ws`;
}

export function useSpeechWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isManualCloseRef = useRef(false);

  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [metrics, setMetrics] = useState<Metrics>({ filler_count: 0, pause_seconds: 0, total_words: 0 });
  const [error, setError] = useState<string | null>(null);

  const cleanupAudio = useCallback(() => {
    processorRef.current?.disconnect();
    processorRef.current = null;

    mediaRef.current?.getTracks().forEach((t) => t.stop());
    mediaRef.current = null;

    const ctx = audioCtxRef.current;
    audioCtxRef.current = null;
    if (ctx && ctx.state !== "closed") {
      ctx.close().catch(() => {
        // ignore
      });
    }
  }, []);

  const cleanupReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    if (wsRef.current) return;
    
    isManualCloseRef.current = false;
    setError(null);
    
    if (reconnectAttemptsRef.current === 0) {
      setStatus("connecting");
    } else {
      setStatus("reconnecting");
    }

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = async () => {
      reconnectAttemptsRef.current = 0;
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }, 
          video: false 
        });
        mediaRef.current = stream;

        const ctx = new AudioContext({ sampleRate: 16000 });
        audioCtxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);

        const processor = ctx.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        source.connect(processor);
        processor.connect(ctx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;

          const input = e.inputBuffer.getChannelData(0);
          const pcm16 = new Int16Array(input.length);
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i] ?? 0));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          const bytes = new Uint8Array(pcm16.buffer);
          let binary = "";
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
          const b64 = btoa(binary);

          try {
            ws.send(JSON.stringify({ type: "audio", pcm16_b64: b64, sample_rate: 16000 }));
          } catch (sendError) {
            console.error("Failed to send audio data:", sendError);
          }
        };

        setStatus("running");
      } catch (mediaError) {
        console.error("Media access error:", mediaError);
        setStatus("error");
        setError(mediaError instanceof Error ? mediaError.message : "Failed to access microphone");
        cleanupAudio();
        wsRef.current = null;
        try {
          ws.close();
        } catch {
          // ignore
        }
      }
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "transcript") {
          setTranscript((prev) => {
            if (msg.is_final) return prev + (prev ? " " : "") + msg.text;
            return prev;
          });
          if (msg.metrics) setMetrics(msg.metrics);
        }
        if (msg.type === "closed") {
          if (msg.metrics) setMetrics(msg.metrics);
          setStatus("closed");
        }
        if (msg.type === "error") {
          setError(msg.message || "WebSocket error occurred");
          setStatus("error");
        }
      } catch (parseError) {
        console.error("Failed to parse WebSocket message:", parseError);
      }
    };

    ws.onerror = (event) => {
      console.error("WebSocket error:", event);
      setStatus("error");
      setError("WebSocket connection error");
      cleanupAudio();
    };

    ws.onclose = () => {
      cleanupAudio();
      wsRef.current = null;
      
      if (isManualCloseRef.current) {
        setStatus("closed");
        return;
      }
      
      // Attempt reconnection if not manually closed
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current++;
        setStatus("reconnecting");
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          start();
        }, RECONNECT_DELAY_MS);
      } else {
        setStatus("error");
        setError(`Connection failed after ${MAX_RECONNECT_ATTEMPTS} attempts`);
      }
    };
  }, [cleanupAudio]);

  const stop = useCallback(() => {
    isManualCloseRef.current = true;
    cleanupReconnect();
    
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: "end" }));
      } catch (e) {
        // ignore send errors on close
      }
    }

    cleanupAudio();

    try {
      ws?.close();
    } catch {
      // ignore
    }
    wsRef.current = null;
    reconnectAttemptsRef.current = 0;
    setStatus("closed");
  }, [cleanupAudio, cleanupReconnect]);

  const reset = useCallback(() => {
    stop();
    setTranscript("");
    setMetrics({ filler_count: 0, pause_seconds: 0, total_words: 0 });
    setError(null);
    reconnectAttemptsRef.current = 0;
  }, [stop]);

  useEffect(() => {
    return () => {
      cleanupReconnect();
      cleanupAudio();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [cleanupAudio, cleanupReconnect]);

  return { 
    status, 
    transcript, 
    metrics, 
    error,
    start, 
    stop,
    reset,
    reconnectAttempts: reconnectAttemptsRef.current 
  };
}
