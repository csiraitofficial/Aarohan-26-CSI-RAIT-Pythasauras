import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { jobInterviewTopics, skillDevelopmentTopics, type TopicCategory } from "@/pages/practice/practiceCatalog";

export function LearningPage() {
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<TopicCategory>("job-interview");

  const allTopics = useMemo(() => {
    return activeCategory === "job-interview" ? jobInterviewTopics : skillDevelopmentTopics;
  }, [activeCategory]);

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTopics;
    return allTopics.filter((t) => {
      const hay = `${t.title} ${t.description} ${"skills" in t ? t.skills.join(" ") : t.benefits.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, allTopics]);

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
                <div className="text-sm font-semibold text-zinc-700">Search</div>
                <div className="mt-4">
                  <label className="sr-only" htmlFor="resource-search">
                    Search resources
                  </label>
                  <input
                    id="resource-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search domains..."
                    className="w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-zinc-200 placeholder:text-zinc-400 focus:outline-none"
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200">
                    {filteredTopics.length} shown
                  </span>
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
                  <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200">0 in progress</div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-5 ring-1 ring-zinc-200 md:col-span-2">
                    <div className="text-sm font-semibold text-zinc-800">No active progress yet</div>
                    <div className="mt-1 text-sm text-zinc-600">Open a domain below to start learning.</div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-12">
              <Card variant="glass" className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-zinc-700">Learning Domains</div>
                    <div className="mt-1 text-xs text-zinc-500">Choose a category to see curated videos and reading links</div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("job-interview")}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
                      activeCategory === "job-interview"
                        ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                        : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    Job Interviews
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCategory("skill-development")}
                    className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${
                      activeCategory === "skill-development"
                        ? "bg-violet-100 text-violet-700 ring-1 ring-violet-200"
                        : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-zinc-50"
                    }`}
                  >
                    Skill Development
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredTopics.map((t) => (
                    <DomainCard
                      key={t.id}
                      topic={t}
                      onPractice={() => navigate(`/practice/${activeCategory}/${t.id}`)}
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

function DomainCard({
  topic,
  onPractice,
}: {
  topic: typeof jobInterviewTopics[0] | typeof skillDevelopmentTopics[0];
  onPractice: () => void;
}) {
  const hasVideo = topic.videoLectureUrl;
  const hasText = topic.textualInfoUrl;

  return (
    <Card variant="default" className="p-0">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="text-3xl leading-none">{topic.icon}</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-900 truncate">{topic.title}</div>
                <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{topic.description}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onPractice}
            className="shrink-0 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-zinc-600 ring-1 ring-zinc-200 transition-colors hover:bg-zinc-50"
          >
            Practice
          </button>
        </div>

        {hasVideo || hasText ? (
          <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
            <div className="text-xs font-semibold text-zinc-700">Learning Resources</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {hasVideo ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => window.open(topic.videoLectureUrl, "_blank", "noopener,noreferrer")}
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Lectures
                </Button>
              ) : null}
              {hasText ? (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => window.open(topic.textualInfoUrl, "_blank", "noopener,noreferrer")}
                  className="flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Textual Info
                </Button>
              ) : null}
            </div>
            <div className="mt-3 text-xs text-zinc-500">
              {hasVideo && "📺 Video lectures available"}
              {hasVideo && hasText && " • "}
              {hasText && "📚 Reading materials available"}
            </div>
          </div>
        ) : null}
      </div>
    </Card>
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
