import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <Card variant="glass" className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-zinc-700">Resources</div>
                <div className="mt-1 text-xs text-zinc-500">Search, bookmark, and track progress</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200">
                  {filtered.length} shown
                </span>
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-xs ring-1 transition-colors ${
                    onlyBookmarked ? "bg-violet-100 text-violet-700 ring-primary/30" : "bg-white text-zinc-600 ring-zinc-200 hover:bg-zinc-50"
                  }`}
                  onClick={() => setOnlyBookmarked((v) => !v)}
                  aria-pressed={onlyBookmarked}
                >
                  Bookmarks ({counts.bookmarked})
                </button>
              </div>
            </div>

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

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {filtered.map((r) => (
                <ResourceCard key={r.id} r={r} onToggleBookmark={() => toggleBookmark(r.id)} />
              ))}
            </div>
          </Card>
        </section>

        <section className="lg:col-span-4">
          <Card variant="glass" className="p-5">
            <div className="text-sm font-semibold text-zinc-700">Quick Actions</div>
            <div className="mt-4 space-y-3">
              <Button href="/practice" variant="primary" size="lg" className="w-full">
                Start Practice Session
              </Button>
              <Button href="/dashboard" variant="secondary" size="lg" className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </section>
      </div>
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

function ResourceCard({ r, onToggleBookmark }: { r: LearningResource; onToggleBookmark: () => void }) {
  return (
    <Card variant="default" className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-zinc-900 truncate">{r.title}</div>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 ring-1 ring-zinc-200">
              {r.type}
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600 ring-1 ring-zinc-200">
              {r.difficulty}
            </span>
          </div>
          <div className="mt-1 text-xs text-zinc-500">{r.category}</div>
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
          {r.isBookmarked ? "Bookmarked" : "Bookmark"}
        </button>
      </div>

      <p className="mt-3 text-sm text-zinc-600">{r.description}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">★ {r.rating.toFixed(1)}</span>
          <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{r.downloadCount} downloads</span>
          {r.duration ? <span className="rounded-full bg-white px-2 py-1 ring-1 ring-zinc-200">{r.duration} min</span> : null}
        </div>

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
    </Card>
  );
}
