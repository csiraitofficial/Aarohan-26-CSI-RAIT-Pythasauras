  import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Props = {
  title?: string;
<<<<<<< HEAD
  questions: string[];
  onNextQuestion?: () => void;
};

export function SectionTranscript({ title = "Section transcript", questions, onNextQuestion }: Props) {
=======
  category: string;
  sectionId: string;
};

export function SectionTranscript({ title = "Section transcript", category, sectionId }: Props) {
>>>>>>> 856ef0f90e3e904ca8c4d5c370fa69b141ddcd00
  const [index, setIndex] = useState(0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastAudioUrlRef = useRef<string | null>(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);

  // STT Test State
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string>("");
  const [sttLoading, setSttLoading] = useState(false);
  const [sttError, setSttError] = useState<string | null>(null);
  const [realTimeText, setRealTimeText] = useState<string>("");
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const realTimeIntervalRef = useRef<number | null>(null);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching questions for:', { category, sectionId });
        const baseUrl = ""; // Use proxy configuration
        const url = `${baseUrl}/questions/${category}/${sectionId}`;
        console.log('Fetching from URL:', url);
        
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
        });

        console.log('Response status:', res.status);

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error('Error response:', text);
          throw new Error(text || `Failed to fetch questions (${res.status})`);
        }

        const data = await res.json();
        console.log('Received data:', data);
        setQuestions(data.questions || []);
        setIndex(0);
      } catch (e) {
        console.error('Fetch error:', e);
        setError(e instanceof Error ? e.message : "Failed to load questions");
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [category, sectionId]);

  const total = questions.length;
  const current = useMemo(() => {
    if (total === 0) return null;
    return questions[Math.max(0, Math.min(total - 1, index))] ?? null;
  }, [questions, index, total]);

  const canNext = total > 0 && index < total - 1;
  const canRestart = total > 0 && index !== 0;

  const handleNext = useCallback(() => {
    if (!canNext) return;
    setIndex((i) => Math.min(total - 1, i + 1));
    onNextQuestion?.();
  }, [canNext, total, onNextQuestion]);

  const playTts = useCallback(async () => {
    if (!current) return;
    setTtsLoading(true);
    setTtsError(null);

    try {
      const baseUrl = ""; // Use proxy configuration
      const res = await fetch(`${baseUrl}/tts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: current }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `TTS request failed (${res.status})`);
      }

      // Check if response is JSON (fallback) or audio blob
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.fallback) {
          setTtsError(data.message || "TTS not available");
          return;
        }
      }

      const blob = await res.blob();
      const nextUrl = URL.createObjectURL(blob);

      if (lastAudioUrlRef.current) {
        URL.revokeObjectURL(lastAudioUrlRef.current);
      }
      lastAudioUrlRef.current = nextUrl;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      audioRef.current.src = nextUrl;

      try {
        await audioRef.current.play();
      } catch {
        setTtsError("Click Replay to hear the question.");
      }
    } catch (e) {
      setTtsError(e instanceof Error ? e.message : "Failed to generate audio");
    } finally {
      setTtsLoading(false);
    }
  }, [current]);

  useEffect(() => {
    void playTts();
  }, [playTts]);

  // STT Functions
  const startRecording = useCallback(async () => {
    try {
      setSttError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      setSttError(error instanceof Error ? error.message : "Failed to start recording");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const transcribeAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setSttLoading(true);
      setSttError(null);
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      
      const baseUrl = ""; // Use proxy configuration
      const response = await fetch(`${baseUrl}/stt/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || `STT request failed (${response.status})`);
      }

      const result = await response.json();
      setTranscribedText(result.text || "No speech detected");
    } catch (error) {
      setSttError(error instanceof Error ? error.message : "Failed to transcribe audio");
      setTranscribedText("");
    } finally {
      setSttLoading(false);
    }
  }, []);

  // Real-time STT Functions
  const startRealTimeSTT = useCallback(async () => {
    try {
      console.log('🎤 Starting real-time STT...');
      setSttError(null);
      setRealTimeText("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      
      // Start real-time transcription
      setIsRealTimeActive(true);
      console.log('🔴 Real-time STT activated');
      
      // Use sliding window approach for audio chunks
      let audioBuffer: Blob[] = [];
      let transcriptionInterval: number;
      const CHUNK_PROCESSING_INTERVAL = 1500; // Process every 1.5 seconds for better responsiveness
      const MAX_BUFFER_SIZE = 6; // Keep last 6 chunks (3 seconds of audio)
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && isRealTimeActive) {
          audioBuffer.push(event.data);
          console.log('📦 Audio chunk added to buffer, total chunks:', audioBuffer.length);
          
          // Maintain sliding window - keep only recent chunks
          if (audioBuffer.length > MAX_BUFFER_SIZE) {
            audioBuffer = audioBuffer.slice(-MAX_BUFFER_SIZE);
            console.log('🔄 Sliding window: removed old chunks, current size:', audioBuffer.length);
          }
        }
      };

      // Process accumulated audio more frequently
      transcriptionInterval = window.setInterval(async () => {
        if (audioBuffer.length >= 2 && isRealTimeActive) { // Need at least 2 chunks for meaningful audio
          try {
            console.log('🔄 Processing audio chunks with sliding window...');
            console.log(`📊 Buffer stats: ${audioBuffer.length} chunks, total size: ${audioBuffer.reduce((acc, chunk) => acc + chunk.size, 0)} bytes`);
            
            const audioBlob = new Blob(audioBuffer, { type: 'audio/webm' });
            console.log(`🎵 Created audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
            
            // Validate blob size before sending
            if (audioBlob.size < 1000) {
              console.warn('⚠️ Audio blob too small, skipping transcription');
              return;
            }
            
            const formData = new FormData();
            formData.append('file', audioBlob, 'recording.webm');
            
            const baseUrl = ""; // Use proxy configuration
            console.log('📤 Sending audio chunk to:', `${baseUrl}/stt/transcribe`);
            
            const startTime = Date.now();
            const response = await fetch(`${baseUrl}/stt/transcribe`, {
              method: 'POST',
              body: formData
            });
            const endTime = Date.now();

            console.log(`📥 STT response: ${response.status} (${endTime - startTime}ms)`);

            if (response.ok) {
              const result = await response.json();
              console.log('📝 Transcription result:', result);
              
              if (result.text && result.text.trim()) {
                const newText = result.text.trim();
                console.log(`🗣️ New transcription: "${newText}"`);
                
                setRealTimeText(prev => {
                  // Better text merging strategy
                  if (!prev) {
                    console.log('🆕 First transcription segment');
                    return newText;
                  }
                  
                  // Avoid duplicate text at the end
                  const prevWords = prev.split(' ').slice(-3).join(' ');
                  const newWords = newText.split(' ').slice(0, 3).join(' ');
                  
                  if (prevWords === newWords) {
                    console.log('🔄 Duplicate detected, not adding text');
                    return prev;
                  }
                  
                  const updatedText = prev + " " + newText;
                  console.log(`✏️ Updated text: "${updatedText}"`);
                  return updatedText;
                });
              } else {
                console.log('🔇 No speech detected in audio chunk');
              }
            } else {
              const errorText = await response.text().catch(() => "");
              console.error('❌ STT error:', response.status, errorText);
              setSttError(`Transcription failed: ${response.status} ${errorText}`);
            }
            
          } catch (error) {
            console.error('🚨 Real-time transcription error:', error);
            const errorMessage = error instanceof Error ? error.message : "Unknown transcription error";
            console.error('🚨 Error details:', errorMessage);
            setSttError(errorMessage);
          }
        } else if (audioBuffer.length < 2 && isRealTimeActive) {
          console.log('⏳ Waiting for more audio chunks...', audioBuffer.length);
        }
      }, CHUNK_PROCESSING_INTERVAL);

      // Store interval for cleanup
      realTimeIntervalRef.current = transcriptionInterval;
      
      // Record in 500ms chunks for continuous capture
      mediaRecorder.start(500);
      console.log(`⏱️ MediaRecorder started with 500ms chunks, processing every ${CHUNK_PROCESSING_INTERVAL}ms`);
      
      // Clean up on stop
      mediaRecorder.onstop = () => {
        console.log('⏹️ MediaRecorder stopped');
        if (transcriptionInterval) {
          clearInterval(transcriptionInterval);
        }
        stream.getTracks().forEach(track => track.stop());
        setIsRealTimeActive(false);
      };

    } catch (error) {
      console.error('🚨 Failed to start real-time STT:', error);
      setSttError(error instanceof Error ? error.message : "Failed to start real-time recording");
      setIsRealTimeActive(false);
    }
  }, [isRealTimeActive]);

  const stopRealTimeSTT = useCallback(() => {
    console.log('🛑 Stopping real-time STT...');
    if (mediaRecorderRef.current && isRealTimeActive) {
      mediaRecorderRef.current.stop();
      setIsRealTimeActive(false);
      
      // Clear transcription interval if exists
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
        realTimeIntervalRef.current = null;
      }
      console.log('✅ Real-time STT stopped');
    }
  }, [isRealTimeActive]);

  useEffect(() => {
    return () => {
      if (lastAudioUrlRef.current) {
        URL.revokeObjectURL(lastAudioUrlRef.current);
        lastAudioUrlRef.current = null;
      }
    };
  }, []);

  return (
    <Card variant="glass" className="p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-zinc-700">{title}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        {loading ? (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <div className="text-center text-sm text-violet-700">Loading questions...</div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="text-center text-sm text-red-700">Error: {error}</div>
          </div>
        ) : (
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-violet-700">Question</div>
                <div className="mt-2 text-sm text-violet-900">
                  {current ?? "No questions available for this section."}
                </div>
              </div>
              {total > 0 ? (
                <div className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200">
                  {Math.min(total, index + 1)} / {total}
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              <Button variant="ghost" size="sm" disabled={!current || ttsLoading} onClick={playTts}>
                {ttsLoading ? "Speaking..." : "Replay"}
              </Button>
              <Button variant="secondary" size="sm" disabled={!canRestart} onClick={() => setIndex(0)}>
                Restart
              </Button>
              <Button variant="primary" size="sm" disabled={!canNext} onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}>
                Next
              </Button>
            </div>

            {ttsError ? (
              <div className="mt-3 text-xs font-semibold text-zinc-600">{ttsError}</div>
            ) : null}
          </div>
        )}
      </div>

<<<<<<< HEAD
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Button variant="ghost" size="sm" disabled={!current || ttsLoading} onClick={playTts}>
              {ttsLoading ? "Speaking..." : "Replay"}
            </Button>
            <Button variant="secondary" size="sm" disabled={!canRestart} onClick={() => setIndex(0)}>
              Restart
            </Button>
            <Button variant="primary" size="sm" disabled={!canNext} onClick={handleNext}>
              Next
            </Button>
=======
      {/* STT Test Component */}
      <div className="mt-6">
        <Card variant="glass" className="p-5">
          <div className="text-sm font-semibold text-zinc-700 mb-4">🎤 Real-time STT - Speech to Text</div>
          
          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="flex flex-wrap items-center gap-2">
              <Button 
                variant={isRealTimeActive ? "primary" : "ghost"} 
                size="sm" 
                onClick={isRealTimeActive ? stopRealTimeSTT : startRealTimeSTT}
                disabled={sttLoading}
              >
                {isRealTimeActive ? "⏹️ Stop Real-time" : "🔴 Start Real-time"}
              </Button>
              
              <Button 
                variant={isRecording ? "secondary" : "ghost"} 
                size="sm" 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={sttLoading || isRealTimeActive}
              >
                {isRecording ? "⏹️ Stop Recording" : "🎤 Record & Transcribe"}
              </Button>
              
              {sttLoading && (
                <div className="text-sm text-zinc-600">🔄 Processing...</div>
              )}
            </div>

            {/* Real-time Status */}
            {isRealTimeActive && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                Real-time transcription active...
              </div>
            )}

            {/* Recording Status */}
            {isRecording && !isRealTimeActive && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Recording in progress...
              </div>
            )}

            {/* STT Error */}
            {sttError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="text-sm text-red-700">❌ {sttError}</div>
              </div>
            )}

            {/* Real-time Transcription */}
            {realTimeText && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <div className="text-xs font-semibold text-blue-700 mb-2">🔴 Real-time Transcription:</div>
                <div className="text-sm text-blue-800 whitespace-pre-wrap">{realTimeText}</div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setRealTimeText("")}
                  className="mt-2"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Final Transcribed Text */}
            {transcribedText && !isRealTimeActive && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="text-xs font-semibold text-green-700 mb-2">📝 Final Transcription:</div>
                <div className="text-sm text-green-800">{transcribedText}</div>
              </div>
            )}

            {/* Instructions */}
            {!realTimeText && !transcribedText && !sttLoading && !isRecording && !isRealTimeActive && (
              <div className="text-xs text-zinc-500 space-y-1">
                <div>� <strong>Real-time:</strong> Click "Start Real-time" for continuous transcription as you speak</div>
                <div>🎤 <strong>Traditional:</strong> Click "Record & Transcribe" to record then transcribe</div>
                <div>💡 Real-time provides immediate feedback, traditional gives more accurate results</div>
              </div>
            )}
>>>>>>> 856ef0f90e3e904ca8c4d5c370fa69b141ddcd00
          </div>
        </Card>
      </div>
    </Card>
  );
}
