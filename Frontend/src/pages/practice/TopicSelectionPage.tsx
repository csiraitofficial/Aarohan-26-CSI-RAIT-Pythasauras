import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { jobInterviewTopics, skillDevelopmentTopics, type TopicCategory } from "@/pages/practice/practiceCatalog";

type Tab = {
  id: TopicCategory;
  title: string;
  description: string;
};

const tabs: Tab[] = [
  {
    id: "job-interview",
    title: "Job Interview Preparation",
    description: "Role-based mock interviews and domain-specific drills",
  },
  {
    id: "skill-development",
    title: "Skill Development",
    description: "Behavioral, communication, leadership, and productivity coaching",
  },
];

export function TopicSelectionPage() {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState<TopicCategory>("job-interview");

  const topics = useMemo(() => {
    return active === "job-interview" ? jobInterviewTopics : skillDevelopmentTopics;
  }, [active]);

  return (
    <AppShell title="Practice">
      <motion.div variants={reducedMotion ? undefined : staggerContainer} initial="initial" animate="animate">
        <motion.section variants={reducedMotion ? undefined : staggerItem} className="relative overflow-hidden rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-zinc-200/80 backdrop-blur-md border border-white/50 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-100/60 via-transparent to-indigo-100/40" aria-hidden />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold text-violet-700">Choose Your Practice Path</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">Pick a topic before the camera turns on</h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                Select a practice area to begin a personalized AI coaching session. You’ll configure session settings and permissions on the next step.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button href="/learning" variant="secondary" size="md">
                Explore Learning Hub
              </Button>
              <Button href="/dashboard" variant="ghost" size="md">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </motion.section>

        <motion.section variants={reducedMotion ? undefined : staggerItem} className="mt-5">
          <Card variant="glass" className="p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-zinc-700">Categories</div>
                <div className="mt-1 text-xs text-zinc-500">Switch between roles and skill-building tracks</div>
              </div>
              <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-2">
                {tabs.map((t) => {
                  const isActive = t.id === active;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActive(t.id)}
                      className={`relative rounded-2xl px-4 py-3 text-left ring-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${
                        isActive ? "bg-violet-50 ring-primary/25" : "bg-white hover:bg-zinc-50 ring-zinc-200"
                      }`}
                      aria-pressed={isActive}
                    >
                      {!reducedMotion && isActive ? (
                        <motion.span
                          layoutId="practice-tab"
                          className="absolute inset-0 rounded-2xl bg-violet-100/70 ring-1 ring-primary/20"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                          aria-hidden
                        />
                      ) : null}
                      <div className="relative z-10">
                        <div className="text-sm font-semibold text-zinc-900">{t.title}</div>
                        <div className="mt-1 text-xs text-zinc-600">{t.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </motion.section>

        <motion.section variants={reducedMotion ? undefined : staggerItem} className="mt-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((t) => (
              <TopicCard
                key={t.id}
                title={t.title}
                description={t.description}
                metaLeft={`${t.duration} min`}
                metaRight={"difficulty" in t ? t.difficulty : t.focusArea}
                tags={"skills" in t ? t.skills : t.benefits}
                icon={t.icon}
                onSelect={() => navigate(`/practice/${active}/${t.id}`)}
              />
            ))}
          </div>
        </motion.section>
      </motion.div>
    </AppShell>
  );
}

function TopicCard({
  title,
  description,
  metaLeft,
  metaRight,
  tags,
  icon,
  onSelect,
}: {
  title: string;
  description: string;
  metaLeft: string;
  metaRight: string;
  tags: string[];
  icon: string;
  onSelect: () => void;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      whileHover={reducedMotion ? undefined : { scale: 1.02, y: -4 }}
      whileTap={reducedMotion ? undefined : { scale: 0.98 }}
      className="h-full"
    >
      <Card variant="glass" className="p-0 h-full">
        <button
          type="button"
          onClick={onSelect}
          className="block w-full h-full text-left p-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-2xl"
          aria-label={`Select ${title}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-4xl leading-none">{icon}</div>
            <div className="text-right">
              <div className="text-xs text-zinc-500">{metaLeft}</div>
              <div className="mt-1 inline-flex rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200">
                {metaRight}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-lg font-semibold text-zinc-900">{title}</div>
            <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{description}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-white/70 px-2.5 py-1 text-xs text-zinc-700 ring-1 ring-zinc-200">
                {tag}
              </span>
            ))}
            {tags.length > 4 ? (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200">+{tags.length - 4}</span>
            ) : null}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-xs text-zinc-500">Ready when you are</div>
            <motion.div whileHover={reducedMotion ? undefined : { x: 4 }} className="text-sm font-semibold text-violet-700">
              Start
            </motion.div>
          </div>
        </button>
      </Card>
    </motion.div>
  );
}
