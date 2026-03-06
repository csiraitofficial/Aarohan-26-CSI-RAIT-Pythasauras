import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { getTopic, type TopicCategory } from "@/pages/practice/practiceCatalog";

type PermissionState = "prompt" | "granted" | "denied";

type FeedbackIntensity = "gentle" | "balanced" | "intensive";

type RecordingMode = "video" | "audio" | "both";

type SessionConfig = {
  category: TopicCategory;
  topic: string;
  duration: number;
  difficulty: string;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  realTimeFeedback: boolean;
  recordingMode: RecordingMode;
  feedbackIntensity: FeedbackIntensity;
};

export function PracticeSetupPage() {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const params = useParams();

  const category = (params.category as TopicCategory | undefined) ?? "job-interview";
  const topicId = params.topic ?? "";

  const topic = useMemo(() => {
    return getTopic(category, topicId);
  }, [category, topicId]);

  const [duration] = useState<number>(topic?.duration ?? 30);
  const [difficulty] = useState<string>("difficulty" in (topic ?? {}) ? (topic as any).difficulty : "balanced");
  const [questionCount] = useState(10);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [realTimeFeedback] = useState(true);
  const [recordingMode] = useState<RecordingMode>("both");
  const [feedbackIntensity] = useState<FeedbackIntensity>("balanced");

  const [perm, setPerm] = useState<PermissionState>("prompt");
  const [previewOn, setPreviewOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  async function requestDevices() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraEnabled,
        audio: microphoneEnabled,
      });
      streamRef.current = stream;
      setPerm("granted");
      setPreviewOn(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch {
      setPerm("denied");
      setPreviewOn(false);
    }
  }

  function startSession() {
    const sessionId = crypto.randomUUID();
    const config: SessionConfig = {
      category,
      topic: topicId,
      duration,
      difficulty,
      cameraEnabled,
      microphoneEnabled,
      realTimeFeedback,
      recordingMode,
      feedbackIntensity,
    };

    window.localStorage.setItem(`robobuddy.practice.session.${sessionId}`, JSON.stringify(config));
    navigate(`/practice/session/${sessionId}`);
  }

  if (!topic) {
    return (
      <AppShell title="Practice Setup">
        <Card variant="glass" className="p-6">
          <div className="text-sm font-semibold text-zinc-700">Topic not found</div>
          <div className="mt-2 text-sm text-zinc-600">Please go back and select a practice topic.</div>
          <div className="mt-4">
            <Button href="/practice" variant="primary" size="md">
              Back to topics
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Practice Setup">
      <motion.div variants={reducedMotion ? undefined : staggerContainer} initial="initial" animate="animate">
        <motion.section variants={reducedMotion ? undefined : staggerItem}>
          <Card variant="glass" className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-violet-700">Selected Topic</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="text-3xl">{topic.icon}</div>
                  <div>
                    <div className="text-lg font-semibold text-zinc-900">{topic.title}</div>
                    <div className="mt-1 text-sm text-zinc-600">{topic.description}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button href="/practice" variant="secondary" size="md">
                  Change topic
                </Button>
              </div>
            </div>
          </Card>
        </motion.section>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <motion.section variants={reducedMotion ? undefined : staggerItem} className="lg:col-span-7 space-y-5">
            <Card variant="glass" className="p-5">
              <div className="text-sm font-semibold text-zinc-700">Overview</div>
              
              <div className="mt-4 overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-200">
                <div className="relative h-56 w-full bg-gradient-to-br from-zinc-800 to-zinc-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white/80">Camera Preview</div>
                      <div className="mt-2 text-sm text-white/60">Your camera feed will appear here</div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200 ring-1 ring-blue-500/25">
                        <span className="h-2 w-2 rounded-full bg-blue-300 animate-pulse" aria-hidden />
                        Preview Mode
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <Stat label="Duration" value="Min:5 minutes" />
                <Stat label="Level" value={difficulty} />
                <Stat label=" Total Questions" value={questionCount.toString()} />
              </div>

              <div className="mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={startSession}
                  disabled={perm !== "granted" && !(microphoneEnabled && !cameraEnabled)}
                  className="w-full"
                >
                  Start session
                </Button>
                <div className="mt-2 text-xs text-zinc-500">
                  Tip: If camera is denied, disable it and continue with microphone-only.
                </div>
              </div>
            </Card>
          </motion.section>

          <motion.aside variants={reducedMotion ? undefined : staggerItem} className="lg:col-span-5 space-y-5">
            <Card variant="glass" className="p-5">
              <div className="text-sm font-semibold text-zinc-700">Focus areas</div>
              <div className="mt-2 text-sm text-zinc-600">This is where we'll add selectable focus areas + comparisons.</div>
            </Card>

            <Card variant="glass" className="p-5">
              <div className="text-sm font-semibold text-zinc-700">Permissions</div>
              <div className="mt-2 text-sm text-zinc-600">
                Camera and microphone are requested here (not on the topic selection page).
              </div>

              <div className="mt-4">
                {perm === "prompt" ? (
                  <Button variant="primary" size="lg" onClick={requestDevices}>
                    Enable Camera & Microphone
                  </Button>
                ) : null}

                {perm === "granted" && previewOn ? (
                  <div className="mt-4 overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-200">
                    <video ref={videoRef} className="h-56 w-full object-cover" autoPlay playsInline muted />
                    <div className="flex items-center justify-between gap-3 bg-black/40 px-4 py-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-500/25">
                        <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" aria-hidden />
                        Camera Active
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          streamRef.current?.getTracks().forEach((t) => t.stop());
                          streamRef.current = null;
                          setPerm("prompt");
                          setPreviewOn(false);
                        }}
                        className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
                      >
                        Disable
                      </button>
                    </div>
                  </div>
                ) : null}

                {perm === "denied" ? (
                  <div className="mt-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                    <div className="text-sm font-semibold text-amber-900">Permissions denied</div>
                    <div className="mt-1 text-sm text-amber-700">
                      You can still continue with audio-only mode. Enable camera/microphone in your browser settings for full experience.
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => {
                          setCameraEnabled(false);
                          setMicrophoneEnabled(true);
                          setPerm("prompt");
                        }}
                      >
                        Switch to audio-only
                      </Button>
                      <Button variant="ghost" size="md" onClick={() => setPerm("prompt")}>
                        Try again
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          </motion.aside>
        </div>
      </motion.div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-zinc-800">{value}</div>
    </div>
  );
}
