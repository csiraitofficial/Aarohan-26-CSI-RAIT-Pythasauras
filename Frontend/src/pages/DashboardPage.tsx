import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { staggerContainer, staggerItem } from "@/lib/motion";

const dashboardImages = {
  roboCompanion: {
    src: "/Assets/Robo/Decent.png",
    alt: "RoboBuddy Dashboard Companion",
    sizes: "(max-width: 768px) 100vw, 50vw",
    loading: "eager" as const,
  },
};

function OptimizedImage({
  src,
  alt,
  className,
  sizes,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: "lazy" | "eager";
}) {
  return <img src={src} alt={alt} className={className} sizes={sizes} loading={loading} decoding="async" />;
}

export function DashboardPage() {
  const reducedMotion = useReducedMotion();
  useEffect(() => { }, []);

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
                {/* Decorative blurs */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-600/15 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-indigo-600/10 blur-3xl" aria-hidden />

                {/* Top: robo name + avatar */}
                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-medium tracking-wide uppercase text-white/60">Your Robo</div>
                    <div className="mt-1.5 text-xl font-bold tracking-tight">Robo</div>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/10">
                      <span className="text-amber-400">★</span>
                      <span className="text-white/90">Beginner</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className="rounded-2xl bg-white/10 ring-1 ring-white/15 p-2 backdrop-blur-sm">
                      <motion.div
                        initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="h-20 w-20 sm:h-24 sm:w-24"
                      >
                        <OptimizedImage
                          src={dashboardImages.roboCompanion.src}
                          alt={dashboardImages.roboCompanion.alt}
                          sizes={dashboardImages.roboCompanion.sizes}
                          loading={dashboardImages.roboCompanion.loading}
                          className="h-full w-full object-contain drop-shadow-2xl"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Bottom: IQ gauge + XP bar */}
                <div className="relative mt-5 flex items-center gap-4">
                  {/* IQ ring */}
                  <div className="shrink-0">
                    <div className="relative grid place-items-center" style={{ width: 56, height: 56 }}>
                      <svg width={56} height={56} viewBox="0 0 56 56" aria-hidden>
                        <circle cx={28} cy={28} r={23} stroke="rgba(255,255,255,0.1)" strokeWidth={4} fill="none" />
                        <circle
                          cx={28} cy={28} r={23}
                          stroke="url(#iqRingGrad)" strokeWidth={4} fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 23 * 0.76} ${2 * Math.PI * 23 * 0.24}`}
                          transform="rotate(-90 28 28)"
                        />
                        <defs>
                          <linearGradient id="iqRingGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#f59e0b" />
                            <stop offset="1" stopColor="#f97316" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute text-sm font-bold">190</div>
                    </div>
                  </div>

                  {/* IQ label + XP progress bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <div className="text-xs font-semibold text-white/80">User IQ</div>
                      <div className="text-[10px] text-white/50">210 to next level</div>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: "76%" }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                    <div className="mt-1.5 text-[10px] text-white/40">190 / 250 XP</div>
                  </div>
                </div>
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
                  <div className="divide-y divide-zinc-100">
                    <DailyGoalRow title="Mock Test" subtitle="1/3 challenges completed" points="+15 IQ" done navigateTo="/practice/mock" />
                    <DailyGoalRow title="Viva Prep" subtitle="Complete structured answers" points="+15 IQ" navigateTo="/practice" />
                    <DailyGoalRow title="Viva Challenges" subtitle="Practice 5 viva questions" points="+15 IQ" navigateTo="/community" />
                    <DailyGoalRow title="Quick Revision" subtitle="Review key concepts" points="+15 IQ" navigateTo="/learning" />
                    <DailyGoalRow title="AI Feedback" subtitle="Analyze last session" points="+15 IQ" navigateTo="/analytics" />
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
                <QuickAction label="Book Mock Test" tone="violet" icon="test" />
                <QuickAction label="Practice Prep Question" tone="amber" icon="practice" />
                <QuickAction label="Accept a Viva Challenge" tone="indigo" icon="challenge" />
              </div>
            </div>

            {/* Robo greeting */}
            <div className="mt-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-100 via-violet-50 to-white p-4 ring-1 ring-violet-200/60">
              <div className="pointer-events-none absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-violet-300/20 blur-2xl" aria-hidden />
              <div className="relative flex items-center gap-4">
                <img
                  src="/Assets/Robo/Hello.png"
                  alt="RoboBuddy greeting"
                  className="h-20 w-auto object-contain drop-shadow-lg shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-violet-900">Hello, Genius! 👋</div>
                  <div className="mt-1 text-xs text-violet-700/70 leading-relaxed">Ready to level up your IQ today? Complete your daily goals to unlock rewards.</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>
      </motion.div>
    </AppShell>
  );
}

function QuickAction({ label, tone, icon }: { label: string; tone: "violet" | "amber" | "indigo"; icon: "test" | "practice" | "challenge" }) {
  const navigate = useNavigate();
  const t =
    tone === "violet"
      ? "from-violet-200 to-white"
      : tone === "amber"
        ? "from-amber-200 to-white"
        : "from-indigo-200 to-white";

  const href =
    icon === "test"
      ? "/practice/mock"
      : icon === "practice"
        ? "/practice"
        : "/community";

  const iconPath =
    icon === "test"
      ? "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      : icon === "practice"
        ? "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        : "M13 10V3L4 14h7v7l9-11h-7z";

  return (
    <button
      type="button"
      onClick={() => navigate(href)}
      className={`group rounded-2xl bg-gradient-to-br ${t} p-3 ring-1 ring-zinc-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 min-h-[110px] flex flex-col justify-between text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 focus-visible:outline-offset-2`}
      aria-label={`${label} (start)`}
    >
      <div className="h-9 w-9 rounded-2xl bg-white ring-1 ring-zinc-200 grid place-items-center shadow-sm">
        <svg className="h-4 w-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
        </svg>
      </div>
      <div className="mt-2 text-[11px] font-semibold text-zinc-800 leading-snug">{label}</div>
      <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-zinc-200 group-hover:bg-white group-hover:text-violet-700 group-hover:ring-violet-200 transition-colors">
        start →
      </div>
    </button>
  );
}



function DailyGoalRow({ title, subtitle, points, done, navigateTo }: { 
  title: string; 
  subtitle: string; 
  points: string; 
  done?: boolean;
  navigateTo: string;
}) {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center gap-3 px-4 py-3 sm:px-5 transition-colors hover:bg-zinc-50/60">
      {/* Status dot — fixed width column */}
      <span
        className={`h-2.5 w-2.5 rounded-full shrink-0 ring-2 ring-white ${done ? "bg-emerald-500" : "bg-zinc-300"
          }`}
        aria-hidden
      />

      {/* Title + subtitle — flex-1 to fill remaining space */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold leading-snug ${done ? "text-zinc-400 line-through" : "text-zinc-900"}`}>{title}</div>
        <div className="text-xs text-zinc-500 leading-snug mt-0.5">{subtitle}</div>
      </div>

      {/* Points badge + Go button — stacked vertically */}
      <div className="shrink-0 flex flex-col items-end gap-2">
        <div className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 ring-1 ring-primary/20 whitespace-nowrap">
          {points}
        </div>
        <button
          type="button"
          onClick={() => navigate(navigateTo)}
          className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500 focus-visible:outline-offset-2 ${
            done 
              ? "bg-zinc-100 text-zinc-400 cursor-not-allowed" 
              : "bg-violet-600 text-white hover:bg-violet-700 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
          }`}
          disabled={done}
          aria-label={`Go to ${title}`}
        >
          Go
        </button>
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
