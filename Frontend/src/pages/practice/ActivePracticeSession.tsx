import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CameraFeed } from "@/components/CameraFeed";
import { FocusMeter } from "@/components/FocusMeter";
import { useSpeechWebSocket } from "@/lib/useSpeechWebSocket";
import { getTopic, type TopicCategory } from "@/pages/practice/practiceCatalog";

type RecordingMode = "video" | "audio" | "both";

type FeedbackIntensity = "gentle" | "balanced" | "intensive";

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

function readSession(sessionId: string): SessionConfig | null {
  const v = window.localStorage.getItem(`robobuddy.practice.session.${sessionId}`);
  if (!v) return null;
  try {
    return JSON.parse(v) as SessionConfig;
  } catch {
    return null;
  }
}

function bumpProgress(category: TopicCategory, topic: string) {
  const key = "robobuddy.practice.progress";
  const id = `${category}/${topic}`;
  const raw = window.localStorage.getItem(key);
  let data: Record<string, number> = {};
  try {
    if (raw) data = JSON.parse(raw) as Record<string, number>;
  } catch {
    data = {};
  }
  const next = Math.max(0, Math.min(100, Math.round((data[id] ?? 0) + 8)));
  data[id] = next;
  window.localStorage.setItem(key, JSON.stringify(data));
}

export function ActivePracticeSession() {
  const navigate = useNavigate();
  const { sessionId = "" } = useParams();

  const [focusPercent, setFocusPercent] = useState(0);
  const { status, start, stop } = useSpeechWebSocket();

  const running = status === "running";

  const session = useMemo(() => {
    if (!sessionId) return null;
    return readSession(sessionId);
  }, [sessionId]);

  const topic = useMemo(() => {
    if (!session) return null;
    return getTopic(session.category, session.topic);
  }, [session]);

  const onFocus = useCallback((p: number) => {
    setFocusPercent(p);
  }, []);

  useEffect(() => {
    if (session?.microphoneEnabled) start();
    return () => {
      stop();
      if (session) bumpProgress(session.category, session.topic);
    };
  }, [session, start, stop]);

  if (!session) {
    return (
      <AppShell title="Practice Session">
        <Card variant="glass" className="p-6">
          <div className="text-sm font-semibold text-zinc-700">Session not found</div>
          <div className="mt-2 text-sm text-zinc-600">Go back and start a new practice session.</div>
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
    <AppShell title="Practice Session">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Card variant="glass" className="px-4 py-3">
          <div className="text-xs text-zinc-500">Topic</div>
          <div className="text-sm font-semibold text-zinc-800 truncate max-w-[220px] sm:max-w-none" title={topic?.title ?? session.topic}>
            {topic?.title ?? session.topic}
          </div>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              stop();
              navigate("/practice");
            }}
          >
            End
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-5">
          {session.cameraEnabled ? <CameraFeed onFocus={onFocus} /> : <Card variant="glass" className="p-5">Camera disabled for this session.</Card>}
        </div>
        <div className="space-y-5 lg:col-span-7">
          <FocusMeter value={focusPercent} />
        </div>
      </div>
    </AppShell>
  );
}
