import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function AnalyticsPage() {
  const reducedMotion = useReducedMotion();

  const overview = {
    totalPracticeTime: 312,
    skillsImproved: 7,
    achievementCount: 12,
    weeklyStreak: 5,
  } as const;

  const realtime = {
    currentSessionTime: 14,
    focusLevel: 0.74,
    speechClarity: 0.68,
    confidenceScore: 0.62,
  } as const;

  return (
    <AppShell title="Analytics">
      <motion.div
        className="grid grid-cols-1 gap-5"
        variants={reducedMotion ? undefined : staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.section variants={reducedMotion ? undefined : staggerItem}>
          <Card variant="glass" className="p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-zinc-700">Overview</div>
                <div className="mt-1 text-xs text-zinc-500">Weekly metrics + skill benchmarks</div>
              </div>
              <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200">
                Mock data
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <KpiCard label="Practice Time" value={`${overview.totalPracticeTime} min`} hint="This week" />
              <KpiCard label="Skills Improved" value={`${overview.skillsImproved}`} hint="Last 30 days" />
              <KpiCard label="Achievements" value={`${overview.achievementCount}`} hint="Unlocked" />
              <KpiCard label="Weekly Streak" value={`${overview.weeklyStreak} days`} hint="Consistency" />
            </div>
          </Card>
        </motion.section>

        <motion.section className="grid grid-cols-1 gap-5 lg:grid-cols-12" variants={reducedMotion ? undefined : staggerItem}>
          <div className="lg:col-span-8 space-y-5">
            <Card variant="glass" className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">Skill Radar</div>
                  <div className="mt-1 text-xs text-zinc-500">Communication • Technical • Confidence</div>
                </div>
                <div className="text-xs text-zinc-500">Mocked</div>
              </div>
              <div className="mt-4 h-56 rounded-2xl bg-gradient-to-br from-violet-100/80 to-white ring-1 ring-zinc-200" />
            </Card>

            <Card variant="glass" className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">Activity Heatmap</div>
                  <div className="mt-1 text-xs text-zinc-500">Hover/tap cells to inspect days</div>
                </div>
                <div className="text-xs text-zinc-500">Mocked</div>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-6 rounded-lg ring-1 ring-zinc-200 ${i % 7 === 0 ? "bg-violet-200/70" : i % 5 === 0 ? "bg-violet-100" : "bg-white"}`}
                  />
                ))}
              </div>
            </Card>

            <Card variant="glass" className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">Peer Benchmark</div>
                  <div className="mt-1 text-xs text-zinc-500">Compare performance vs similar level</div>
                </div>
                <div className="text-xs text-zinc-500">Mocked</div>
              </div>
              <div className="mt-4 h-40 rounded-2xl bg-white ring-1 ring-zinc-200" />
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-5">
            <Card variant="glass" className="p-4 sm:p-5" roboticBorder particleEffect>
              <div className="text-sm font-semibold text-zinc-700">Real-time Metrics</div>
              <div className="mt-4 space-y-4">
                <MetricRow label="Session" value={`${realtime.currentSessionTime} min`} />
                <MetricBar label="Focus" value={realtime.focusLevel} />
                <MetricBar label="Speech clarity" value={realtime.speechClarity} />
                <MetricBar label="Confidence" value={realtime.confidenceScore} />
              </div>
            </Card>

            <Card variant="glass" className="p-4 sm:p-5">
              <div className="text-sm font-semibold text-zinc-700">Milestones</div>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Complete 3 mock interviews", p: 0.66 },
                  { label: "Reach 75% focus avg", p: 0.52 },
                  { label: "Reduce fillers under 6/min", p: 0.4 },
                ].map((m) => (
                  <div key={m.label} className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-zinc-800">{m.label}</div>
                      <div className="text-xs text-zinc-500">{Math.round(m.p * 100)}%</div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-zinc-100 ring-1 ring-zinc-200 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                        initial={reducedMotion ? false : { width: 0 }}
                        animate={{ width: `${Math.round(m.p * 100)}%` }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.section>
      </motion.div>
    </AppShell>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-zinc-800">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{hint}</div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs font-semibold text-zinc-700">{label}</div>
      <div className="text-xs text-zinc-500">{value}</div>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  const p = Math.max(0, Math.min(1, value));
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-zinc-700">{label}</div>
        <div className="text-xs text-zinc-500">{Math.round(p * 100)}%</div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-zinc-100 ring-1 ring-zinc-200 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600" style={{ width: `${Math.round(p * 100)}%` }} />
      </div>
    </div>
  );
}
