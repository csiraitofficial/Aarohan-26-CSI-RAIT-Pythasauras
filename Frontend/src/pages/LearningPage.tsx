import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
  isBookmarked: boolean;
  progress: number;
};

export function LearningPage() {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ResourceType | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);

  const [resources, setResources] = useState<LearningResource[]>(() => [
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
      isBookmarked: true,
      progress: 0.35,
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
      isBookmarked: false,
      progress: 0.1,
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
      isBookmarked: false,
      progress: 0.0,
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
      isBookmarked: false,
      progress: 0.6,
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
      isBookmarked: true,
      progress: 0.2,
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
      isBookmarked: false,
      progress: 0.0,
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
      isBookmarked: false,
      progress: 0.0,
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
      isBookmarked: false,
      progress: 0.0,
    },
    {
      id: "r9",
      title: "Mock Interview: Rapid-Fire Behavioral Prompts",
      type: "exercise",
      category: "Communication",
      difficulty: "intermediate",
      duration: 15,
      description: "A timed drill to practice concise STAR answers with follow-up questions and strong closes.",
      tags: ["behavioral", "star", "mock", "timed"],
      rating: 4.6,
      downloadCount: 389,
      isBookmarked: false,
      progress: 0.0,
    },
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter((r) => {
      if (onlyBookmarked && !r.isBookmarked) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (difficultyFilter !== "all" && r.difficulty !== difficultyFilter) return false;
      if (!q) return true;
      const hay = `${r.title} ${r.description} ${r.category} ${r.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [difficultyFilter, onlyBookmarked, query, resources, typeFilter]);

  const counts = useMemo(() => {
    return {
      all: resources.length,
      bookmarked: resources.filter((r) => r.isBookmarked).length,
    };
  }, [resources]);

  function toggleBookmark(id: string) {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, isBookmarked: !r.isBookmarked } : r)));
  }

  return (
    <AppShell title="Learning Hub">
      <motion.div
        className="grid grid-cols-1 gap-5 lg:grid-cols-12"
        variants={reducedMotion ? undefined : staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.section className="lg:col-span-12" variants={reducedMotion ? undefined : staggerItem}>
          <div className="relative overflow-hidden rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-zinc-200/80 backdrop-blur-md border border-white/50 sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-100/60 via-transparent to-indigo-100/40" aria-hidden />
            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-xs font-semibold text-violet-700">Learning Hub</div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
                  Keep building your edge — one small session a day
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                  Browse curated resources, bookmark what matters, and track progress. Use Practice when you’re ready to test it live.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button href="/practice" variant="primary" size="lg">
                  Start Practice
                </Button>
                <Button href="/dashboard" variant="secondary" size="lg">
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section className="lg:col-span-12" variants={reducedMotion ? undefined : staggerItem}>
          <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <Card variant="glass" className="h-full p-5">
                <div className="text-sm font-semibold text-zinc-700">Search & Filters</div>
                <div className="mt-4">
                  <label className="sr-only" htmlFor="resource-search">
                    Search resources
                  </label>
                  <input
                    id="resource-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search videos, exercises, templates..."
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:outline-none"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`rounded-full px-3 py-1 text-xs ring-1 transition-colors ${
                      onlyBookmarked
                        ? "bg-violet-100 text-violet-700 ring-primary/30"
                        : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
                    }`}
                    onClick={() => setOnlyBookmarked((v) => !v)}
                    aria-pressed={onlyBookmarked}
                  >
                    Bookmarks ({counts.bookmarked})
                  </button>
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200">
                    {filtered.length} shown
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <FilterChip<ResourceType | "all">
                    label="Type"
                    value={typeFilter}
                    options={["all", "video", "article", "exercise", "template", "quiz"]}
                    onChange={setTypeFilter}
                  />
                  <FilterChip<Difficulty | "all">
                    label="Difficulty"
                    value={difficultyFilter}
                    options={["all", "beginner", "intermediate", "advanced"]}
                    onChange={setDifficultyFilter}
                  />
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4">
              <Card variant="glass" className="h-full p-5">
                <div className="text-sm font-semibold text-zinc-700">Today’s Plan</div>
                <div className="mt-3 space-y-3">
                  <PlanRow title="Watch 1 resource" meta="10–20 min" />
                  <PlanRow title="Do 1 drill" meta="5–10 min" />
                  <PlanRow title="Practice live" meta="10 min" />
                </div>
                <div className="mt-4">
                  <Button href="/practice" variant="robotic" size="md" className="w-full">
                    Quick practice check
                  </Button>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-12">
              <Card variant="glass" className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-zinc-700">Continue Learning</div>
                    <div className="mt-1 text-xs text-zinc-500">Pick up where you left off</div>
                  </div>
                  <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200">
                    {resources.filter((r) => r.progress > 0 && r.progress < 1).length} in progress
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {resources
                    .filter((r) => r.progress > 0 && r.progress < 1)
                    .slice(0, 2)
                    .map((r) => (
                      <FeaturedResource
                        key={r.id}
                        r={r}
                        onToggleBookmark={() => toggleBookmark(r.id)}
                        onOpenResources={() => navigate(`/learning/resource/${r.id}`)}
                      />
                    ))}
                  {resources.filter((r) => r.progress > 0 && r.progress < 1).length === 0 ? (
                    <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200 md:col-span-2">
                      <div className="text-sm font-semibold text-zinc-800">No active progress yet</div>
                      <div className="mt-1 text-sm text-zinc-600">Start any resource below to see it here.</div>
                    </div>
                  ) : null}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-12">
              <Card variant="glass" className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-zinc-700">All Resources</div>
                    <div className="mt-1 text-xs text-zinc-500">Cleaner cards, better scanning, faster actions</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {filtered.map((r) => (
                    <ResourceCard
                      key={r.id}
                      r={r}
                      onToggleBookmark={() => toggleBookmark(r.id)}
                      onOpenResources={() => navigate(`/learning/resource/${r.id}`)}
                    />
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </AppShell>
  );
}

function FilterChip<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white p-2 ring-1 ring-zinc-200">
      <div className="px-2 text-xs font-semibold text-zinc-600">{label}</div>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const active = opt === value;
          return (
            <button
              key={opt}
              type="button"
              className={`rounded-xl px-2.5 py-1 text-xs ring-1 transition-colors ${
                active ? "bg-violet-100 text-violet-700 ring-primary/30" : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
              }`}
              onClick={() => onChange(opt)}
              aria-pressed={active}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ResourceCard({
  r,
  onToggleBookmark,
  onOpenResources,
}: {
  r: LearningResource;
  onToggleBookmark: () => void;
  onOpenResources: () => void;
}) {
  return (
    <Card variant="default" className="p-0">
      <div className="flex h-full gap-4 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-200 via-white to-indigo-200 ring-1 ring-zinc-200 grid place-items-center">
          <span className="h-8 w-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-violet-900/80" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-zinc-900 truncate">{r.title}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 ring-1 ring-zinc-200">
                  {r.type}
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 ring-1 ring-zinc-200">
                  {r.difficulty}
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-zinc-600 ring-1 ring-zinc-200">
                  {r.category}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggleBookmark}
              className={`shrink-0 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition-colors ${
                r.isBookmarked ? "bg-violet-100 text-violet-700 ring-primary/30" : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
              }`}
              aria-pressed={r.isBookmarked}
              aria-label={r.isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {r.isBookmarked ? "Saved" : "Save"}
            </button>
          </div>

          <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{r.description}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">★ {r.rating.toFixed(1)}</span>
              {r.duration ? <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{r.duration} min</span> : null}
              <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{r.downloadCount}</span>
            </div>

            <button
              type="button"
              onClick={onOpenResources}
              className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition-colors ${
                "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
              }`}
            >
              Resources
            </button>

            <div className="w-full">
              <div className="flex items-center justify-between text-xs">
                <div className="text-zinc-500">Progress</div>
                <div className="text-zinc-500">{Math.round(r.progress * 100)}%</div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-zinc-100 ring-1 ring-zinc-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                  style={{ width: `${Math.round(r.progress * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FeaturedResource({
  r,
  onToggleBookmark,
  onOpenResources,
}: {
  r: LearningResource;
  onToggleBookmark: () => void;
  onOpenResources: () => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div whileHover={reducedMotion ? undefined : { y: -3 }}>
      <Card variant="holographic" className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-zinc-900 truncate">{r.title}</div>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[11px] text-zinc-700 ring-1 ring-zinc-200">
                {r.type}
              </span>
            </div>
            <div className="mt-1 text-xs text-zinc-600">{r.category}</div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenResources}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50"
            >
              Resources
            </button>

            <button
              type="button"
              onClick={onToggleBookmark}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ring-1 transition-colors ${
                r.isBookmarked ? "bg-violet-100 text-violet-700 ring-primary/30" : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
              }`}
              aria-pressed={r.isBookmarked}
              aria-label={r.isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {r.isBookmarked ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-zinc-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-500">Progress</div>
            <div className="text-xs font-semibold text-zinc-700">{Math.round(r.progress * 100)}%</div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-zinc-100 ring-1 ring-zinc-200 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" style={{ width: `${Math.round(r.progress * 100)}%` }} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {r.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-white/70 px-2.5 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200">
                {t}
              </span>
            ))}
          </div>
          <Button href="/practice" variant="robotic" size="sm">
            Practice now
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function PlanRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
      <div>
        <div className="text-sm font-semibold text-zinc-800">{title}</div>
        <div className="mt-1 text-xs text-zinc-500">{meta}</div>
      </div>
      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-primary/20">
        today
      </span>
    </div>
  );
}
