import { useEffect, useState, useRef } from "react";

type SpeechStatus = "idle" | "connecting" | "running" | "closed" | "error";

type Props = {
  status: SpeechStatus;
  transcript: string;
  metrics: { filler_count: number; pause_seconds: number; total_words: number };
  sessionId?: string;
  category?: string;
  topic?: string;
  onStart?: () => void;
  onStop?: () => void;
};

type Message = {
  type: "user" | "ai";
  content: string;
  timestamp: number;
  isRealTime?: boolean; // For real-time STT responses
};

export function SectionTranscript({ status, transcript, sessionId, category, topic, onStart, onStop }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [realTimeTranscript, setRealTimeTranscript] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [wsStatus, setWsStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const lastTranscriptTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (sessionId && category && topic) {
      // Connect to WebSocket
      setWsStatus("connecting");
      const wsUrl = `ws://localhost:8000/ws/${sessionId}`;
      console.log('Connecting to WebSocket:', wsUrl);
      console.log('Session ID:', sessionId);
      console.log('Category:', category);
      console.log('Topic:', topic);
      
      const websocket = new WebSocket(wsUrl);
      wsRef.current = websocket;
      
      websocket.onopen = () => {
        console.log('Connected to WebSocket');
        setWsStatus("connected");
        // Start session with topic_id
        websocket.send(JSON.stringify({
          type: "start_session",
          category: category,
          topic_id: topic
        }));
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data.type, data);
        
        if (data.type === "ai_message") {
          // Set current question and popup
          setCurrentQuestion(data.content);
          
          // Clear real-time transcript for new question
          setRealTimeTranscript("");
          
          // Request TTS audio for the question
          websocket.send(JSON.stringify({
            type: "get_audio",
            text: data.content
          }));
        }
        
        if (data.type === "audio_response") {
          // Play TTS audio
          playAudio(data.data);
          
          // After TTS finishes playing, restart STT
          if (audioRef.current) {
            audioRef.current.onended = () => {
              if (onStart && status !== "running") {
                setTimeout(() => onStart(), 500); // Small delay before restarting
              }
            };
          }
        }
        
        if (data.type === "realtime_transcript") {
          // Update real-time transcript
          console.log('Real-time transcript:', data.text);
          setRealTimeTranscript(data.text);
          
          // Reset silence timer when we get transcript
          lastTranscriptTimeRef.current = Date.now();
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          
          // Set new silence timer - stop recording after 5 seconds of silence
          silenceTimerRef.current = window.setTimeout(() => {
            console.log('User stopped speaking - stopping recording');
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
              mediaRecorderRef.current.stop();
            }
          }, 5000);
        }
        
        if (data.type === "final_transcript") {
          console.log('Final transcript:', data.text);
          // Add both question and answer to message history
          setMessages(prev => [
            ...prev,
            {
              type: "ai",
              content: currentQuestion,
              timestamp: Date.now()
            },
            {
              type: "user",
              content: data.text,
              timestamp: Date.now()
            }
          ]);
          
          // Clear current question and real-time transcript
          setCurrentQuestion("");
          setRealTimeTranscript("");
        }
        
        if (data.type === "stt_error") {
          console.error('STT Error:', data.message);
        }
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.error('WebSocket readyState:', websocket.readyState);
        console.error('WebSocket URL:', wsUrl);
        setWsStatus("disconnected");
        
        // Try to reconnect after a short delay
        setTimeout(() => {
          if (sessionId && category && topic) {
            console.log('Attempting to reconnect WebSocket...');
            const newWebSocket = new WebSocket(`ws://localhost:8000/ws/${sessionId}`);
            wsRef.current = newWebSocket;
            
            newWebSocket.onopen = () => {
              console.log('WebSocket reconnected');
              newWebSocket.send(JSON.stringify({
                type: "start_session",
                category: category,
                topic: topic
              }));
            };
            
            newWebSocket.onmessage = (event) => {
              const data = JSON.parse(event.data);
              console.log('WebSocket message received:', data.type, data);
              
              if (data.type === "ai_message") {
                setCurrentQuestion(data.content);
                setRealTimeTranscript("");
                
                newWebSocket.send(JSON.stringify({
                  type: "get_audio",
                  text: data.content
                }));
              }
              
              if (data.type === "audio_response") {
                playAudio(data.data);
                
                if (audioRef.current) {
                  audioRef.current.onended = () => {
                    if (onStart && status !== "running") {
                      setTimeout(() => onStart(), 500);
                    }
                  };
                }
              }
              
              if (data.type === "realtime_transcript") {
                console.log('Real-time transcript received:', data.text);
                setRealTimeTranscript(data.text);
                
                // Reset silence timer when we get transcript
                lastTranscriptTimeRef.current = Date.now();
                if (silenceTimerRef.current) {
                  clearTimeout(silenceTimerRef.current);
                }
                
                // Set new silence timer
                silenceTimerRef.current = window.setTimeout(() => {
                  console.log('User stopped speaking - stopping recording');
                  stopAudioRecording();
                }, 3000); // 3 seconds of silence
              }
              
              if (data.type === "final_transcript") {
                console.log('Final transcript received:', data.text);
                
                // Add to message history
                if (currentQuestion) {
                  setMessages(prev => [
                    ...prev,
                    {
                      type: "ai",
                      content: currentQuestion,
                      timestamp: Date.now()
                    },
                    {
                      type: "user",
                      content: data.text,
                      timestamp: Date.now()
                    }
                  ]);
                }
                
                // Clear current question and transcript
                setCurrentQuestion("");
                setRealTimeTranscript("");
              }
              
              if (data.type === "stt_error") {
                console.error('STT Error:', data.message);
              }
            };
            
            newWebSocket.onclose = () => {
              console.log('WebSocket reconnection closed');
            };
            
            newWebSocket.onerror = (err) => {
              console.error('WebSocket reconnection error:', err);
            };
          }
        }, 2000);
      };

      websocket.onclose = () => {
        console.log('WebSocket connection closed');
        setWsStatus("disconnected");
      };

      return () => {
        websocket.close();
      };
    }
  }, [sessionId, category, topic]);

  const playAudio = (base64Audio: string) => {
    try {
      const audioBlob = new Blob([Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      });
      streamRef.current = stream;
      
      // Use Web Audio API for better audio processing
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContext.destination);
      
      processor.onaudioprocess = (event) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          const inputData = event.inputBuffer.getChannelData(0);
          
          // Convert Float32Array to Int16Array (16-bit PCM)
          const pcmData = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
          }
          
          // Convert to bytes and send to backend
          const pcmBytes = new Uint8Array(pcmData.buffer);
          const base64Audio = btoa(String.fromCharCode(...pcmBytes));
          
          console.log(`Sending audio chunk: ${pcmBytes.length} bytes`);
          
          wsRef.current!.send(JSON.stringify({
            type: "audio_data",
            data: base64Audio
          }));
        }
      };
      
      // Store processor reference for cleanup
      (mediaRecorderRef.current as any) = { audioContext, processor, source };
      
      console.log('Audio streaming started - sending PCM chunks to backend...');
      
    } catch (error) {
      console.error('Error starting audio streaming:', error);
    }
  };
  
  const stopAudioRecording = () => {
    // Clear silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    
    // Stop audio processing
    const audioProcessor = mediaRecorderRef.current as any;
    if (audioProcessor && audioProcessor.audioContext) {
      audioProcessor.processor.disconnect();
      audioProcessor.source.disconnect();
      audioProcessor.audioContext.close();
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    console.log('Audio streaming stopped');
  };

  const handleNextQuestion = () => {
    if (wsRef.current) {
      setIsLoading(true);
      
      // If there's a current question, add it to history
      if (currentQuestion) {
        setMessages(prev => [
          ...prev,
          {
            type: "ai",
            content: currentQuestion,
            timestamp: Date.now()
          }
        ]);
      }
      
      // Stop STT/recording first
      if (onStop && status === "running") {
        onStop();
      }
      
      // Clear current question and transcript
      setCurrentQuestion("");
      setRealTimeTranscript("");
      
      // Request next question
      wsRef.current.send(JSON.stringify({
        type: "next_question"
      }));
      
      // Reset loading after a short delay
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  // Start/stop audio recording based on status
  useEffect(() => {
    if (status === "running" && currentQuestion) {
      startAudioRecording();
    } else {
      stopAudioRecording();
    }
    
    return () => {
      stopAudioRecording();
    };
  }, [status, currentQuestion]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-zinc-200/80 backdrop-blur border border-white/50 min-h-[500px] max-h-[600px] flex flex-col">
      {/* Hidden audio element for TTS playback */}
      <audio ref={audioRef} className="hidden" />
      
      {/* Headline */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-zinc-700">section transcript</div>
        <div className="flex items-center gap-2 text-xs">
          <div className={`h-2 w-2 rounded-full ${
            wsStatus === "connected" ? "bg-emerald-500" : 
            wsStatus === "connecting" ? "bg-yellow-500 animate-pulse" : 
            "bg-red-500"
          }`}></div>
          <span className="text-zinc-500">
            {wsStatus === "connected" ? "Connected" : 
             wsStatus === "connecting" ? "Connecting..." : 
             "Disconnected"}
          </span>
        </div>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {/* Current Question Popup */}
        {currentQuestion && (
          <div className="p-4 bg-violet-50 border border-violet-200 rounded-2xl">
            <div className="flex items-start gap-2 mb-3">
              <div className="text-sm font-semibold text-violet-700">Question:</div>
              <div className="flex-1 text-sm text-violet-900">{currentQuestion}</div>
            </div>
            
            {/* Real-time STT response */}
            <div className="p-4 bg-white border-2 border-violet-300 rounded-xl">
              <div className="flex items-start gap-2">
                <div className="text-sm font-semibold text-violet-600 min-w-fit">User:</div>
                <div className="flex-1 text-base text-zinc-800 leading-relaxed">
                  {realTimeTranscript || "Speak your response..."}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Message History */}
        <div className="space-y-3">
          {messages.length === 0 && !currentQuestion ? (
            <div className="text-zinc-400 text-sm italic">
              Waiting for session to start...
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    message.type === "user"
                      ? "bg-violet-500 text-white"
                      : "bg-zinc-100 text-zinc-800"
                  }`}
                >
                  <div className="font-medium mb-1">
                    {message.type === "ai" ? "AI Coach" : "You"}
                  </div>
                  <div>{message.content}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {status === "running" ? (
            <>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Listening...
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-zinc-400"></span>
              Ready
            </>
          )}
        </div>
        
        {/* Next Question Button */}
        <button
          onClick={handleNextQuestion}
          disabled={isLoading || !wsRef.current}
          className="px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Loading..." : "Next Question"}
        </button>
      </div>
    </div>
  );
}
