import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CameraFeed } from "@/components/CameraFeed";
import { FocusMeter } from "@/components/FocusMeter";
import { SectionTranscript } from "@/components/SectionTranscript";
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

type SessionIQ = {
  questionsAnswered: number;
  timeSpent: number; // Total seconds across all sessions
  sessionStartTime: number;
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

function readSessionIQ(sessionId: string): SessionIQ {
  const v = window.localStorage.getItem(`robobuddy.practice.session.${sessionId}.iq`);
  if (!v) return { questionsAnswered: 0, timeSpent: 0, sessionStartTime: Date.now() };
  try {
    return JSON.parse(v) as SessionIQ;
  } catch {
    return { questionsAnswered: 0, timeSpent: 0, sessionStartTime: Date.now() };
  }
}

function writeSessionIQ(sessionId: string, iq: SessionIQ): void {
  window.localStorage.setItem(`robobuddy.practice.session.${sessionId}.iq`, JSON.stringify(iq));
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
  const { start, stop } = useSpeechWebSocket();

  const session = useMemo(() => {
    if (!sessionId) return null;
    return readSession(sessionId);
  }, [sessionId]);

  const [sessionIQ, setSessionIQ] = useState<SessionIQ>(() => 
    sessionId ? readSessionIQ(sessionId) : { questionsAnswered: 0, timeSpent: 0, sessionStartTime: Date.now() }
  );

  const sessionStartTime = sessionIQ.sessionStartTime;
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  // Update current session time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = Math.floor((Date.now() - sessionStartTime) / 1000);
      setCurrentSessionTime(newTime);
      
      // Update sessionIQ with current time even if no question answered
      setSessionIQ(prev => ({
        ...prev,
        timeSpent: newTime
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  const topic = useMemo(() => {
    if (!session) return null;
    return getTopic(session.category, session.topic);
  }, [session]);

  const [questionDb, setQuestionDb] = useState<Record<string, Record<string, string[]>> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/questionDatabase.json")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setQuestionDb(data as Record<string, Record<string, string[]>>);
      })
      .catch(() => {
        if (cancelled) return;
        setQuestionDb(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const questions = useMemo(() => {
    if (!session || !questionDb) return [] as string[];
    const byCategory = questionDb[session.category];
    if (!byCategory) return [] as string[];
    return byCategory[session.topic] ?? [];
  }, [questionDb, session]);

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

        <Card variant="glass" className="px-4 py-3">
          <div className="text-xs text-zinc-500">Session Time</div>
          <div className="text-sm font-semibold text-zinc-800">{currentSessionTime} sec</div>
        </Card>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              stop();
              navigate(`/practice/session/${sessionId}/results`);
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
          <SectionTranscript questions={questions} />
        </div>
      </div>
    </AppShell>
  );
}
