import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function DashboardPage() {
  const reducedMotion = useReducedMotion();

  return (
    <AppShell title="Dashboard">
      <motion.div
        className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto]"
        variants={reducedMotion ? undefined : staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.section className="lg:col-span-4 lg:row-start-1" variants={reducedMotion ? undefined : staggerItem}>
          <Card variant="glass" className="p-4 h-full flex flex-col">
            <div className="text-sm font-semibold text-zinc-700">User & Progress</div>
            <div className="mt-4 grid grid-cols-1 gap-4 flex-1">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-violet-900 p-5 text-white ring-1 ring-white/10 min-h-[168px]">
                <div className="text-sm opacity-90">Your Robo</div>
                <div className="mt-1 text-lg font-semibold">Robo</div>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-indigo-300 ring-1 ring-white/20" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-xs opacity-80">User IQ</div>
                      <div className="text-2xl font-bold">190</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs opacity-80">Next level</div>
                    <div className="rounded-full bg-white/10 px-3 py-1 text-xs inline-block">Beginner</div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
              </div>

              <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 min-h-[188px] flex flex-col">
                <div className="text-sm font-semibold text-zinc-700">User IQ Growth</div>
                <div className="mt-3 flex-1">
                  <MiniLineChart
                    height={120}
                    labelLeft="60"
                    labelMid="100"
                    labelRight="150"
                    points={[18, 24, 28, 30, 36, 34, 38]}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>Weekly trend</span>
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 ring-1 ring-primary/20">
                    +12%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-stretch">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 min-h-[110px] flex flex-col justify-between">
                  <div className="text-xs text-zinc-500">User Mood</div>
                  <div className="mt-1 text-lg font-semibold">Status</div>
                  <div className="mt-2 text-sm text-zinc-600">Focused + steady</div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200 min-h-[110px] flex flex-col justify-between">
                  <div className="text-xs text-zinc-500">Next Goal</div>
                  <div className="mt-1 text-lg font-semibold">Level up</div>
                  <div className="mt-2 text-sm text-zinc-600">Keep streak alive</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        <motion.section className="lg:col-span-4 lg:row-start-1" variants={reducedMotion ? undefined : staggerItem}>
          <Card variant="glass" className="p-4 h-full flex flex-col">
            <div className="text-sm font-semibold text-zinc-700">Daily Goals</div>
            <div className="mt-4 rounded-2xl bg-white ring-1 ring-zinc-200 overflow-hidden flex-1">
              <div className="flex items-center justify-between gap-3 px-4 pt-4 md:px-5 md:pt-5">
                <div className="text-xs text-zinc-500">Today</div>
                <div className="inline-flex shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200 whitespace-nowrap">
                  +15 IQ per goal
                </div>
              </div>

              <div className="mt-3 flex flex-col h-full">
                <div className="px-4 pb-4 md:px-5 md:pb-5">
                  <div className="grid place-items-center">
                    <ProgressRing value={0.33} size={92} />
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-3xl font-semibold text-zinc-900">1/3</div>
                    <div className="mt-1 text-[11px] leading-snug text-zinc-500">challenges completed</div>
                  </div>
                </div>

                <div className="border-t border-zinc-100 flex-1 overflow-hidden">
                  <div className="grid grid-rows-3 h-full divide-y divide-zinc-100">
                    <div className="flex items-center">
                      <DailyGoalRow title="Mock Test" subtitle="1/3 challenges completed" points="+15 IQ" />
                    </div>
                    <div className="flex items-center">
                      <DailyGoalRow title="Viva Prep" subtitle="Complete structured answers" points="+15 IQ" />
                    </div>
                    <div className="flex items-center">
                      <DailyGoalRow title="Viva Challenges" subtitle="Practice 5 viva questions" points="+15 IQ" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        <motion.section className="lg:col-span-4 lg:row-start-1" variants={reducedMotion ? undefined : staggerItem}>
          <Card variant="glass" className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-zinc-700">This Week’s Leaderboard</div>
                <div className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 ring-1 ring-zinc-200 shrink-0">
                  This week
                </div>
              </div>
              <div className="mt-4 min-h-[188px] flex flex-col flex-1">
                <MiniAreaChart height={150} points={[42, 44, 55, 58, 74, 70, 76]} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                <span>Rank change</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  +2
                </span>
              </div>


              <div className="mt-5">
                <div className="text-sm font-semibold text-zinc-700">Quick Actions</div>
                <div className="mt-3 grid grid-cols-3 gap-3 items-stretch">
                  <QuickAction label="Book Mock Test" tone="violet" />
                  <QuickAction label="Practice Prep Question" tone="amber" />
                  <QuickAction label="Accept a Viva Challenge" tone="indigo" />
                </div>
              </div>

              <div className="mt-5">
                <div className="text-sm font-semibold text-zinc-700">Pet Community Highlights</div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <HighlightCard title="High Scores" desc="Community achievements" tone="gold" />
                  <HighlightCard title="Favorite Robo Care" desc="Tips, guides" tone="violet" />
                </div>
              </div>
          </Card>
        </motion.section>
      </motion.div>
    </AppShell>
  );
}

function QuickAction({ label, tone }: { label: string; tone: "violet" | "amber" | "indigo" }) {
  const t =
    tone === "violet"
      ? "from-violet-200 to-white"
      : tone === "amber"
        ? "from-amber-200 to-white"
        : "from-indigo-200 to-white";
  return (
    <div
      className={`group rounded-2xl bg-gradient-to-br ${t} p-3 ring-1 ring-zinc-200 transition-transform duration-normal min-h-[110px] flex flex-col justify-between`}
    >
      <div className="h-9 w-9 rounded-2xl bg-white ring-1 ring-zinc-200 grid place-items-center">
        <span className="h-5 w-5 rounded-lg bg-gradient-to-br from-zinc-900 to-violet-900/80" aria-hidden />
      </div>
      <div className="mt-2 text-[11px] font-semibold text-zinc-800 leading-snug">{label}</div>
      <div className="mt-2 inline-flex items-center rounded-full bg-white/70 px-2.5 py-1 text-[11px] text-zinc-700 ring-1 ring-zinc-200">
        start
      </div>
    </div>
  );
}

function HighlightCard({
  title,
  desc,
  tone,
}: {
  title: string;
  desc: string;
  tone: "gold" | "violet";
}) {
  const badge = tone === "gold" ? "from-amber-200 to-white" : "from-violet-200 to-white";
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-zinc-200">
      <div className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${badge} ring-1 ring-zinc-200 grid place-items-center`}>
        <span className="h-5 w-5 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-700" aria-hidden />
      </div>
      <div className="mt-3 text-sm font-semibold text-zinc-800">{title}</div>
      <div className="mt-1 text-xs text-zinc-500">{desc}</div>
    </div>
  );
}

function DailyGoalRow({ title, subtitle, points }: { title: string; subtitle: string; points: string }) {
  return (
    <div className="px-4 py-3 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span
            className="mt-1.5 h-2.5 w-2.5 rounded-full bg-zinc-300 ring-2 ring-white shrink-0"
            aria-hidden
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900">{title}</div>
            <div className="mt-1 text-xs text-zinc-500 leading-snug">{subtitle}</div>
          </div>
        </div>

        <div className="shrink-0 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 ring-1 ring-primary/20 whitespace-nowrap">
          {points}
        </div>
      </div>
    </div>
  );
}

function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const v = Math.max(0, Math.min(1, value));
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * v;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(228,228,231,1)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-sm font-semibold text-zinc-900">{Math.round(v * 100)}%</div>
    </div>
  );
}

function MiniLineChart({
  height,
  points,
  labelLeft,
  labelMid,
  labelRight,
}: {
  height: number;
  points: number[];
  labelLeft: string;
  labelMid: string;
  labelRight: string;
}) {
  const w = 280;
  const h = height;
  const pad = 14;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const step = (w - pad * 2) / (points.length - 1);

  const d = points
    .map((p, i) => {
      const x = pad + i * step;
      const y = pad + (h - pad * 2) * (1 - (p - min) / range);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <div className="rounded-xl bg-gradient-to-b from-violet-50 to-white ring-1 ring-zinc-200 p-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }} aria-hidden>
        <path d={d} fill="none" stroke="rgba(124,58,237,0.9)" strokeWidth="2.5" />
        {points.map((p, i) => {
          const x = pad + i * step;
          const y = pad + (h - pad * 2) * (1 - (p - min) / range);
          return <circle key={i} cx={x} cy={y} r={3.2} fill="white" stroke="rgba(79,70,229,0.8)" strokeWidth="2" />;
        })}
      </svg>
      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
        <span>{labelLeft}</span>
        <span>{labelMid}</span>
        <span>{labelRight}</span>
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1 text-[10px] text-zinc-500">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d2) => (
          <div key={d2} className="text-center">
            {d2}
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniAreaChart({ height, points }: { height: number; points: number[] }) {
  const w = 300;
  const h = height;
  const pad = 14;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const step = (w - pad * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = pad + i * step;
    const y = pad + (h - pad * 2) * (1 - (p - min) / range);
    return { x, y };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(" ");

  const area = `${line} L ${(pad + (points.length - 1) * step).toFixed(2)} ${(h - pad).toFixed(2)} L ${pad.toFixed(2)} ${(h - pad).toFixed(2)} Z`;

  return (
    <div className="rounded-2xl bg-gradient-to-b from-violet-50 to-white ring-1 ring-zinc-200 p-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: h }} aria-hidden>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(124,58,237,0.35)" />
            <stop offset="1" stopColor="rgba(124,58,237,0.02)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#areaGrad)" />
        <path d={line} fill="none" stroke="rgba(124,58,237,0.95)" strokeWidth="2.5" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={3.2} fill="white" stroke="rgba(79,70,229,0.8)" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 grid grid-cols-7 gap-1 text-[10px] text-zinc-500">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d2) => (
          <div key={d2} className="text-center">
            {d2}
          </div>
        ))}
      </div>
    </div>
  );
}
