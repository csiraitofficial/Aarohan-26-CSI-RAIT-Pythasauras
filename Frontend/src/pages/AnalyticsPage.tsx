import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { useMemo } from "react";

type IQPoints = {
  total: number;
  byCategory: Record<string, number>;
  byTopic: Record<string, number>;
  bySection: Record<string, number>;
  weekly: number;
  monthly: number;
};

function readIQPoints(): IQPoints {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { total: 0, byCategory: { "job-interview": 0, "skill-development": 0 }, byTopic: {}, bySection: {}, weekly: 0, monthly: 0 };
  }
  const v = window.localStorage.getItem("robobuddy.iq.points");
  if (!v) return { total: 0, byCategory: { "job-interview": 0, "skill-development": 0 }, byTopic: {}, bySection: {}, weekly: 0, monthly: 0 };
  try {
    return JSON.parse(v) as IQPoints;
  } catch {
    return { total: 0, byCategory: { "job-interview": 0, "skill-development": 0 }, byTopic: {}, bySection: {}, weekly: 0, monthly: 0 };
  }
}

export function AnalyticsPage() {
  const reducedMotion = useReducedMotion();
  const iqData = useMemo(() => readIQPoints(), []);

  const overview = {
    totalPracticeTime: 312,
    skillsImproved: Object.keys(iqData.bySection).length,
    achievementCount: 12,
  } as const;

  const totalPracticeSeconds = useMemo(() => {
    // Read actual practice time from session storage
    if (typeof window === 'undefined' || !window.localStorage) {
      return 0;
    }
    let totalSeconds = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('robobuddy.practice.session.') && key.endsWith('.iq')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          totalSeconds += data.timeSpent || 0;
        } catch {
          // Skip invalid data
        }
      }
    }
    return totalSeconds;
  }, []);

  const topSections = useMemo(() => {
    const sections = Object.entries(iqData.bySection);
    return sections.sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [iqData.bySection]);

  const highestSection = useMemo(() => {
    const sections = Object.entries(iqData.bySection);
    return sections.sort((a, b) => b[1] - a[1]).slice(0, 1);
  }, [iqData.bySection]);

  const radar = useMemo(() => {
    // Map sections to radar labels and normalize points
    const sectionEntries = Object.entries(iqData.bySection);
    const maxValue = Math.max(...sectionEntries.map(([, pts]) => pts), 1);
    const labels = sectionEntries.map(([section]) => section);
    const values = sectionEntries.map(([, pts]) => pts / maxValue);
    return { labels, values };
  }, [iqData.bySection]);

  const heat = Array.from({ length: 35 }, (_, i) => {
    const base = (i * 17) % 11;
    const v = base / 10;
    return Math.max(0, Math.min(1, i % 7 === 0 ? 0.75 : v));
  });

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
              <KpiCard label="Practice Time" value={`${totalPracticeSeconds} sec`} hint="Total Seconds" />
              <KpiCard label="Skills Improved" value={`${overview.skillsImproved}`} hint="Last 30 days" />
              <KpiCard label="Achievements" value={`${overview.achievementCount}`} hint="Unlocked" />
              {highestSection.map(([section, pts]) => (
                <KpiCard key={section} label="Highest Section Points" value={`${Math.floor(pts)}`} hint={section} />
              ))}
            </div>
          </Card>
        </motion.section>

        <motion.section className="grid grid-cols-1 gap-5 lg:grid-cols-12" variants={reducedMotion ? undefined : staggerItem}>
          <div className="lg:col-span-8 space-y-5">
            <Card variant="glass" className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">Skill Radar</div>
                  <div className="mt-1 text-xs text-zinc-500">Section IQ distribution</div>
                </div>
                <div className="text-xs text-zinc-500">Live</div>
              </div>
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-violet-100/80 to-white ring-1 ring-zinc-200 p-4">
                <RadarChart labels={radar.labels} values={radar.values} />
              </div>
            </Card>

            <Card variant="glass" className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">IQ by Section</div>
                  <div className="mt-1 text-xs text-zinc-500">Points per section</div>
                </div>
                <div className="text-xs text-zinc-500">Live</div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Object.entries(iqData.bySection).map(([section, pts]) => (
                  <div key={section} className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-zinc-700">{section}</div>
                      <div className="text-sm font-bold text-zinc-900">{Math.floor(pts)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="glass" className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">Weekly & Monthly IQ</div>
                  <div className="mt-1 text-xs text-zinc-500">Points this week and month</div>
                </div>
                <div className="text-xs text-zinc-500">Live</div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                  <div className="text-xs font-semibold text-zinc-700">This Week</div>
                  <div className="mt-2 text-center">
                    <div className="text-2xl font-bold text-zinc-900">{iqData.weekly}</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                  <div className="text-xs font-semibold text-zinc-700">This Month</div>
                  <div className="mt-2 text-center">
                    <div className="text-2xl font-bold text-zinc-900">{iqData.monthly}</div>
                  </div>
                </div>
              </div>
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
                {heat.map((v, i) => (
                  <div
                    key={i}
                    className="h-6 rounded-lg ring-1 ring-zinc-200"
                    style={{ backgroundColor: `rgba(124,58,237,${0.08 + v * 0.32})` }}
                    title={`${Math.round(v * 100)}% activity`}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div className="text-xs text-zinc-500">Less</div>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-gradient-to-r from-violet-200/60 via-violet-300/70 to-violet-500/70 ring-1 ring-zinc-200" aria-hidden />
                </div>
                <div className="text-xs text-zinc-500">More</div>
              </div>
            </Card>

            <Card variant="glass" className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">Peer Benchmark</div>
                  <div className="mt-1 text-xs text-zinc-500">You vs similar level (last 7 sessions)</div>
                </div>
                <div className="text-xs text-zinc-500">Mocked</div>
              </div>

              <div className="mt-4 space-y-4">
                <BenchmarkRow label="Focus" you={0.74} peer={0.66} />
                <BenchmarkRow label="Speech clarity" you={0.68} peer={0.62} />
                <BenchmarkRow label="Confidence" you={0.62} peer={0.58} />
                <BenchmarkRow label="Fillers" you={0.58} peer={0.64} invert />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-600" aria-hidden />
                  You
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-zinc-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" aria-hidden />
                  Peers
                </span>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-5">
            <Card variant="glass" className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">Top Sections</div>
                  <div className="mt-1 text-xs text-zinc-500">Highest IQ sections</div>
                </div>
                <div className="text-xs text-zinc-500">Live</div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                {topSections.map(([section, pts]) => (
                  <div key={section} className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-zinc-700">{section}</div>
                      <div className="text-sm font-bold text-zinc-900">{Math.floor(pts)}</div>
                    </div>
                  </div>
                ))}
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

            <Card variant="glass" className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-zinc-700">Session Insights</div>
                  <div className="mt-1 text-xs text-zinc-500">What to keep • What to improve next</div>
                </div>
                <div className="text-xs text-zinc-500">Mocked</div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <InsightStat label="Filler words" value="5.8/min" hint="Target < 6/min" />
                <InsightStat label="Speaking pace" value="142 wpm" hint="Ideal 130–160" />
                <InsightStat label="Avg pause" value="0.7s" hint="Clear thinking" />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                  <div className="text-xs font-semibold text-zinc-700">Strongest</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Clear structure", "Good eye contact", "Concise answers"].map((t) => (
                      <span key={t} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
                  <div className="text-xs font-semibold text-zinc-700">Needs work</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Reduce fillers", "Stronger examples", "Slow down on key points"].map((t) => (
                      <span key={t} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-primary/20">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.section>
      </motion.div>
    </AppShell>
  );
}

function RadarChart({ labels, values }: { labels: readonly string[]; values: readonly number[] }) {
  const size = 240;
  const c = size / 2;
  const r = 84;
  const rings = [0.25, 0.5, 0.75, 1];
  const n = Math.min(labels.length, values.length);
  const step = (Math.PI * 2) / n;

  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + i * step;
    const rr = r * Math.max(0, Math.min(1, values[i] ?? 0));
    return { x: c + Math.cos(a) * rr, y: c + Math.sin(a) * rr };
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  const axes = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + i * step;
    return {
      x: c + Math.cos(a) * r,
      y: c + Math.sin(a) * r,
      lx: c + Math.cos(a) * (r + 22),
      ly: c + Math.sin(a) * (r + 22),
      label: labels[i],
    };
  });

  return (
    <div className="grid place-items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        {rings.map((k) => (
          <circle key={k} cx={c} cy={c} r={r * k} fill="none" stroke="rgba(228,228,231,1)" strokeWidth="1" />
        ))}
        {axes.map((a, i) => (
          <line key={i} x1={c} y1={c} x2={a.x} y2={a.y} stroke="rgba(228,228,231,1)" strokeWidth="1" />
        ))}
        <path d={path} fill="rgba(124,58,237,0.18)" stroke="rgba(124,58,237,0.9)" strokeWidth="2" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.2} fill="white" stroke="rgba(79,70,229,0.9)" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-zinc-600">
        {labels.slice(0, n).map((l, i) => (
          <div key={l} className="flex items-center justify-between gap-3">
            <span className="text-zinc-600">{l}</span>
            <span className="font-semibold text-zinc-800">{Math.round((values[i] ?? 0) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
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

function InsightStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-zinc-800">{value}</div>
      <div className="mt-1 text-xs text-zinc-500">{hint}</div>
    </div>
  );
}

function BenchmarkRow({
  label,
  you,
  peer,
  invert,
}: {
  label: string;
  you: number;
  peer: number;
  invert?: boolean;
}) {
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const y = clamp(you);
  const p = clamp(peer);
  const youScore = invert ? 1 - y : y;
  const peerScore = invert ? 1 - p : p;

  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs font-semibold text-zinc-700">{label}</div>
        <div className="text-xs text-zinc-500">
          You {Math.round(youScore * 100)}% • Peers {Math.round(peerScore * 100)}%
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>You</span>
            <span>{invert ? `${Math.round((1 - y) * 100)}%` : `${Math.round(y * 100)}%`}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-zinc-100 ring-1 ring-zinc-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
              style={{ width: `${Math.round(youScore * 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>Peers</span>
            <span>{invert ? `${Math.round((1 - p) * 100)}%` : `${Math.round(p * 100)}%`}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-zinc-100 ring-1 ring-zinc-200 overflow-hidden">
            <div className="h-full rounded-full bg-zinc-300" style={{ width: `${Math.round(peerScore * 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

