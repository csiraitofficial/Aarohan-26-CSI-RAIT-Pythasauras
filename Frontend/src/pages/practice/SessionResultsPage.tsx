import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { getTopic, type TopicCategory } from "@/pages/practice/practiceCatalog";

type SessionConfig = {
  category: TopicCategory;
  topic: string;
  duration: number;
  difficulty: string;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  realTimeFeedback: boolean;
  recordingMode: "video" | "audio" | "both";
  feedbackIntensity: "gentle" | "balanced" | "intensive";
};

type IQPoints = {
  total: number;
  byCategory: Record<TopicCategory, number>;
  byTopic: Record<string, number>;
  bySection: Record<string, number>;
  weekly: number;
  monthly: number;
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

function readIQPoints(): IQPoints {
  const v = window.localStorage.getItem("robobuddy.iq.points");
  if (!v) return { total: 0, byCategory: { "job-interview": 0, "skill-development": 0 }, byTopic: {}, bySection: {}, weekly: 0, monthly: 0 };
  try {
    return JSON.parse(v) as IQPoints;
  } catch {
    return { total: 0, byCategory: { "job-interview": 0, "skill-development": 0 }, byTopic: {}, bySection: {}, weekly: 0, monthly: 0 };
  }
}

function readSessionIQ(sessionId: string): { questionsAnswered: number; timeSpent: number } {
  const v = window.localStorage.getItem(`robobuddy.practice.session.${sessionId}.iq`);
  if (!v) return { questionsAnswered: 0, timeSpent: 0 };
  try {
    const data = JSON.parse(v);
    return { questionsAnswered: data.questionsAnswered || 0, timeSpent: data.timeSpent || 0 };
  } catch {
    return { questionsAnswered: 0, timeSpent: 0 };
  }
}

function writeIQPoints(iq: IQPoints): void {
  window.localStorage.setItem("robobuddy.iq.points", JSON.stringify(iq));
}

function calculateSectionPoints(questionsAnswered: number, timeSpentSeconds: number): number {
  // Convert seconds to minutes for calculation
  const timeSpentMinutes = Math.floor(timeSpentSeconds / 60);
  const avgTimePerQuestion = timeSpentMinutes / Math.max(questionsAnswered, 1);
  
  // Efficiency factor: faster answers = more points
  // Ideal time per question is 2-3 minutes
  let efficiencyMultiplier = 1;
  if (avgTimePerQuestion <= 2) {
    efficiencyMultiplier = 1.5; // Very fast: 50% bonus
  } else if (avgTimePerQuestion <= 3) {
    efficiencyMultiplier = 1.2; // Good pace: 20% bonus
  } else if (avgTimePerQuestion > 6) {
    efficiencyMultiplier = 0.8; // Slow: 20% penalty
  }
  
  // Base points from questions (10 points each)
  const questionPoints = questionsAnswered * 10;
  
  // Apply efficiency multiplier and ensure integer result
  const adjustedPoints = Math.floor(questionPoints * efficiencyMultiplier);
  
  // Add time bonus (encourages longer sessions but with diminishing returns)
  const timeBonus = Math.min(timeSpentMinutes, 20);
  
  return adjustedPoints + timeBonus;
}

function calculateSessionIQ(session: SessionConfig, focusScore: number, questionsAnswered: number, timeSpent: number): number {
  // Base points by difficulty
  const baseMap = { beginner: 10, intermediate: 20, advanced: 30 };
  const basePoints = baseMap[session.difficulty as keyof typeof baseMap] ?? 15;
  
  // Section points based on question-time relationship (already integer from calculateSectionPoints)
  const sectionPoints = calculateSectionPoints(questionsAnswered, timeSpent);
  
  // Bonus for focus (integer)
  const focusBonus = Math.floor(focusScore / 10);
  
  // Ensure total is integer
  return Math.floor(basePoints + sectionPoints + focusBonus);
}

function getSectionFromTopic(category: TopicCategory, topic: string): string {
  // Map topics to sections (e.g., software-engineer -> "Software Development")
  if (category === "job-interview") {
    if (["software-engineer", "web-developer", "app-developer"].includes(topic)) return "Software Development";
    if (["ui-ux-designer"].includes(topic)) return "Design";
    if (["devops-engineer", "data-scientist"].includes(topic)) return "Data & Infrastructure";
    return "Technical";
  }
  if (category === "skill-development") {
    if (["public-speaking", "negotiation"].includes(topic)) return "Communication";
    if (["leadership", "teamwork"].includes(topic)) return "Soft Skills";
    return "Professional Skills";
  }
  return "General";
}

export function SessionResultsPage() {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { sessionId = "" } = useParams();

  const session = useMemo(() => readSession(sessionId), [sessionId]);
  const topic = useMemo(() => (session ? getTopic(session.category, session.topic) : null), [session]);

  // Mock focus score for now (in real app, pass from session)
  const mockFocusScore = 75;

  const sessionIQ = useMemo(() => 
    sessionId ? readSessionIQ(sessionId) : { questionsAnswered: 0, timeSpent: 0 }
  , [sessionId]);

  const iqGain = useMemo(() => {
    if (!session) return 0;
    return calculateSessionIQ(session, mockFocusScore, sessionIQ.questionsAnswered, sessionIQ.timeSpent);
  }, [session, mockFocusScore, sessionIQ]);

  const iqAfter = useMemo(() => {
    const before = readIQPoints();
    const after = { ...before };
    after.total += iqGain;
    after.byCategory[session!.category] = (after.byCategory[session!.category] ?? 0) + iqGain;
    after.byTopic[`${session!.category}/${session!.topic}`] = (after.byTopic[`${session!.category}/${session!.topic}`] ?? 0) + iqGain;
    // Update section points
    const section = getSectionFromTopic(session!.category, session!.topic);
    after.bySection[section] = (after.bySection[section] ?? 0) + iqGain;
    // Update weekly and monthly (simple increment for demo)
    after.weekly = Math.floor(after.weekly) + Math.floor(iqGain);
    after.monthly = Math.floor(after.monthly) + Math.floor(iqGain);
    writeIQPoints(after);
    return after;
  }, [iqGain, session]);

  if (!session) {
    return (
      <AppShell title="Session Results">
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
    <AppShell title="Session Results">
      <motion.div variants={reducedMotion ? undefined : staggerContainer} initial="initial" animate="animate" className="space-y-5">
        <motion.section variants={reducedMotion ? undefined : staggerItem}>
          <Card variant="glass" className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-violet-700">Session Complete</div>
                <div className="mt-1 text-xl font-semibold text-zinc-900 truncate">{topic?.title ?? session.topic}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                  <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{session.category}</span>
                  <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{session.difficulty}</span>
                  <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{session.duration} min</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="md" onClick={() => navigate("/practice")}>
                  More Practice
                </Button>
                <Button href="/dashboard" variant="primary" size="md">
                  Dashboard
                </Button>
              </div>
            </div>
          </Card>
        </motion.section>

        <motion.section variants={reducedMotion ? undefined : staggerItem}>
          <Card variant="glass" className="p-5">
            <div className="text-sm font-semibold text-zinc-700">IQ Points Earned</div>
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 p-6 ring-1 ring-violet-200/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-900">+{Math.floor(iqGain)}</div>
                <div className="text-xs text-violet-700">points this session</div>
              </div>
            </div>
          </Card>
        </motion.section>

        <motion.section variants={reducedMotion ? undefined : staggerItem}>
          <Card variant="glass" className="p-5">
            <div className="text-sm font-semibold text-zinc-700">Total IQ Overview</div>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <div className="text-xs font-semibold text-zinc-700">Overall IQ</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-zinc-900">{Math.floor(iqAfter.total)}</div>
                  <div className="text-xs text-green-600">+{Math.floor(iqGain)}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <div className="text-xs font-semibold text-zinc-700">This Week</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-zinc-900">{Math.floor(iqAfter.weekly)}</div>
                  <div className="text-xs text-green-600">+{Math.floor(iqGain)}</div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                <div className="text-xs font-semibold text-zinc-700">This Month</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-zinc-900">{Math.floor(iqAfter.monthly)}</div>
                  <div className="text-xs text-green-600">+{Math.floor(iqGain)}</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>
      </motion.div>
    </AppShell>
  );
}
