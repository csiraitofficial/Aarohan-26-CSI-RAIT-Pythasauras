import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/motion";

type Difficulty = "beginner" | "intermediate" | "advanced";

type ResourceType = "video" | "article" | "exercise" | "template" | "quiz";

type LearningResource = {
  id: string;
  title: string;
  type: ResourceType;
  category: string;
  difficulty: Difficulty;
  duration?: number;
  description: string;
  tags: string[];
  rating: number;
  downloadCount: number;
};

const resources: LearningResource[] = [
  {
    id: "r1",
    title: "Behavioral STAR Masterclass",
    type: "video",
    category: "Communication",
    difficulty: "beginner",
    duration: 18,
    description: "Learn structured storytelling for interviews with tight, memorable answers.",
    tags: ["star", "behavioral", "clarity"],
    rating: 4.7,
    downloadCount: 1204,
  },
  {
    id: "r2",
    title: "System Design Templates",
    type: "template",
    category: "Technical",
    difficulty: "intermediate",
    description: "Reusable frameworks for requirements, tradeoffs, and scaling narratives.",
    tags: ["system-design", "framework"],
    rating: 4.6,
    downloadCount: 860,
  },
  {
    id: "r3",
    title: "DSA Explanation Drills",
    type: "exercise",
    category: "Logic",
    difficulty: "intermediate",
    description: "Practice thinking aloud: constraints, approach, complexity, and edge cases.",
    tags: ["dsa", "explain"],
    rating: 4.5,
    downloadCount: 532,
  },
  {
    id: "r4",
    title: "Confidence & Voice Warmups",
    type: "article",
    category: "Vocal",
    difficulty: "beginner",
    description: "A quick routine for steady pace, breathing, and presence before sessions.",
    tags: ["voice", "confidence"],
    rating: 4.3,
    downloadCount: 420,
  },
  {
    id: "r5",
    title: "Weekly Quiz: Interview Patterns",
    type: "quiz",
    category: "Mixed",
    difficulty: "advanced",
    description: "Timed quiz with instant feedback and progress tracking.",
    tags: ["quiz", "timed"],
    rating: 4.4,
    downloadCount: 311,
  },
  {
    id: "r6",
    title: "Negotiation Basics: Ask With Confidence",
    type: "article",
    category: "Job Interview Preparation",
    difficulty: "beginner",
    duration: 12,
    description: "A practical playbook for salary conversations: framing, anchors, and calm pushback.",
    tags: ["negotiation", "salary", "confidence"],
    rating: 4.6,
    downloadCount: 504,
  },
  {
    id: "r7",
    title: "Deep Work Sprint: 25-Min Focus Protocol",
    type: "exercise",
    category: "Skill Development",
    difficulty: "intermediate",
    duration: 25,
    description: "Train distraction control with a repeatable sprint routine and quick reflection prompts.",
    tags: ["focus", "productivity", "habits"],
    rating: 4.5,
    downloadCount: 678,
  },
  {
    id: "r8",
    title: "Resume Bullets That Get Interviews",
    type: "template",
    category: "Job Interview Preparation",
    difficulty: "beginner",
    description: "Plug-and-play bullet formulas with impact verbs and measurable outcomes.",
    tags: ["resume", "impact", "templates"],
    rating: 4.7,
    downloadCount: 932,
  },
];

function formatDifficulty(d: Difficulty) {
  return d === "beginner" ? "Beginner" : d === "intermediate" ? "Intermediate" : "Advanced";
}

function buildSummaryQA(r: LearningResource) {
  const durationText = r.duration ? `${r.duration} min` : "Self-paced";
  const difficultyText = formatDifficulty(r.difficulty);
  const topics = r.tags.length ? r.tags.map((t) => t.replace(/-/g, " ")).join(", ") : r.category;

  const audience =
    r.difficulty === "beginner"
      ? "Great if you're getting started and want a clear structure."
      : r.difficulty === "intermediate"
        ? "Best if you already know the basics and want stronger consistency."
        : "Ideal if you're ready for faster pace, deeper nuance, and tougher prompts.";

  return [
    {
      q: "What will I learn from this resource?",
      a: `In ${r.title}, you’ll focus on: ${r.description}`,
    },
    {
      q: "How long does it take to complete?",
      a: `Estimated time: ${durationText}. You can split it into smaller sessions if needed.`,
    },
    {
      q: "What difficulty level is this?",
      a: `${difficultyText}. ${audience}`,
    },
    {
      q: "What are the key topics covered?",
      a: `Key topics: ${topics}.`,
    },
  ] as const;
}

export function LearningResourcePage() {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const { id } = useParams();

  const resource = useMemo(() => {
    return resources.find((r) => r.id === id);
  }, [id]);

  if (!resource) {
    return (
      <AppShell title="Learning Hub">
        <Card variant="glass" className="p-6">
          <div className="text-sm font-semibold text-zinc-700">Resource not found</div>
          <div className="mt-2 text-sm text-zinc-600">Please go back and choose a resource.</div>
          <div className="mt-4">
            <Button href="/learning" variant="primary" size="md">
              Back
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const qa = buildSummaryQA(resource);

  return (
    <AppShell title="Learning Hub">
      <motion.div variants={reducedMotion ? undefined : staggerContainer} initial="initial" animate="animate" className="space-y-5">
        <motion.section variants={reducedMotion ? undefined : staggerItem}>
          <Card variant="glass" className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-violet-700">Resource</div>
                <div className="mt-1 text-xl font-semibold text-zinc-900 truncate">{resource.title}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                  <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{resource.type}</span>
                  <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{formatDifficulty(resource.difficulty)}</span>
                  <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{resource.category}</span>
                  {resource.duration ? (
                    <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{resource.duration} min</span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-zinc-600">{resource.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    navigate(-1);
                  }}
                >
                  Back
                </Button>
                <Button href="/practice" variant="primary" size="md">
                  Practice now
                </Button>
              </div>
            </div>
          </Card>
        </motion.section>

        <motion.section variants={reducedMotion ? undefined : staggerItem}>
          <Card variant="glass" className="p-5">
            <div className="text-sm font-semibold text-zinc-700">Questions & Answers</div>
            <div className="mt-4 space-y-3">
              {qa.map((row) => (
                <div key={row.q} className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                  <div className="text-xs font-semibold text-zinc-700">Q: {row.q}</div>
                  <div className="mt-2 text-sm text-zinc-700">A: {row.a}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.section>
      </motion.div>
    </AppShell>
  );
}
