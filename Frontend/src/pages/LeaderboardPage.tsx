import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMemo, useState } from "react";

export function LeaderboardPage() {
  const [showAll, setShowAll] = useState(false);
  const leaderboardData = [
    { name: "Reyna", score: 10000, streak: 15, trend: "up", avatar: "🌟", level: "Ascendant" },
    { name: "Neon", score: 9200, streak: 12, trend: "up", avatar: "⭐", level: "Ascendant" },
    { name: "Omen", score: 8400, streak: 8, trend: "down", avatar: "💫", level: "Diamond" },
    { name: "Sage", score: 7600, streak: 10, trend: "up", avatar: "✨", level: "Platinum" },
    { name: "Phoenix", score: 6800, streak: 5, trend: "same", avatar: "🎯", level: "Gold" },
    { name: "Tejo", score: 6200, streak: 7, trend: "up", avatar: "🎨", level: "Gold" },
    { name: "Raze", score: 5700, streak: 4, trend: "down", avatar: "🎭", level: "Silver" },
    { name: "Jett", score: 5100, streak: 6, trend: "up", avatar: "🎪", level: "Silver" },
    { name: "Cypher", score: 5000, streak: 3, trend: "up", avatar: "🕶️", level: "Bronze" },
    { name: "Viper", score: 4800, streak: 3, trend: "up", avatar: "🐍", level: "Bronze" },
    { name: "Yoru", score: 3900, streak: 2, trend: "same", avatar: "🌀", level: "Iron" },
  ] as const;

  type Tier = (typeof leaderboardData)[number]["level"];

  const visibleLeaderboard = useMemo(() => {
    const previewCount = 5;
    return showAll ? leaderboardData : leaderboardData.slice(0, previewCount);
  }, [leaderboardData, showAll]);

  const getTierBadgeStyle = (tier: Tier) => {
    if (tier === "Ascendant") return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    if (tier === "Diamond") return "bg-purple-100 text-purple-700 ring-1 ring-purple-200";
    if (tier === "Platinum") return "bg-sky-100 text-sky-700 ring-1 ring-sky-200";
    if (tier === "Gold") return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
    if (tier === "Silver") return "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200";
    if (tier === "Bronze") return "bg-orange-100 text-orange-700 ring-1 ring-orange-200";
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  };

  const getTierRowStyle = (tier: Tier, rank: number) => {
    if (rank <= 3) return "bg-gradient-to-r from-violet-50 to-white ring-1 ring-primary/20";
    if (tier === "Ascendant") return "bg-gradient-to-r from-emerald-50 to-white ring-1 ring-emerald-200";
    if (tier === "Diamond") return "bg-gradient-to-r from-purple-50 to-white ring-1 ring-purple-200";
    if (tier === "Platinum") return "bg-gradient-to-r from-sky-50 to-white ring-1 ring-sky-200";
    if (tier === "Gold") return "bg-gradient-to-r from-amber-50 to-white ring-1 ring-amber-200";
    if (tier === "Silver") return "bg-gradient-to-r from-zinc-50 to-white ring-1 ring-zinc-200";
    if (tier === "Bronze") return "bg-gradient-to-r from-orange-50 to-white ring-1 ring-orange-200";
    return "bg-gradient-to-r from-slate-50 to-white ring-1 ring-slate-200";
  };

  const getTierAvatarRing = (tier: Tier) => {
    if (tier === "Ascendant") return "ring-emerald-200 bg-emerald-50";
    if (tier === "Diamond") return "ring-purple-200 bg-purple-50";
    if (tier === "Platinum") return "ring-sky-200 bg-sky-50";
    if (tier === "Gold") return "ring-amber-200 bg-amber-50";
    if (tier === "Silver") return "ring-zinc-200 bg-zinc-50";
    if (tier === "Bronze") return "ring-orange-200 bg-orange-50";
    return "ring-slate-200 bg-slate-50";
  };

  const getRankStyle = (rank: number, tier: Tier) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-200";
    if (rank === 2) return "bg-gradient-to-br from-zinc-300 to-zinc-400 text-white shadow-lg shadow-zinc-200";
    if (rank === 3) return "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-200";
    if (tier === "Ascendant") return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    if (tier === "Diamond") return "bg-purple-50 text-purple-700 ring-1 ring-purple-200";
    if (tier === "Platinum") return "bg-sky-50 text-sky-700 ring-1 ring-sky-200";
    if (tier === "Gold") return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    if (tier === "Silver") return "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200";
    if (tier === "Bronze") return "bg-orange-50 text-orange-700 ring-1 ring-orange-200";
    return "bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  };

  const getTrendIcon = (trend: "up" | "down" | "same") => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  const getTrendColor = (trend: "up" | "down" | "same") => {
    if (trend === "up") return "text-emerald-700";
    if (trend === "down") return "text-red-600";
    return "text-zinc-400";
  };

  return (
    <AppShell title="Leaderboard">
      <div className="space-y-6">
        <Card variant="glass" className="bg-gradient-to-r from-violet-600 to-violet-700 p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Weekly Champions</h2>
                <span className="text-2xl" aria-hidden>
                  🏆
                </span>
              </div>
              <p className="mt-1 text-violet-100">Top performers this week</p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-sm font-medium">Live Now:</span>
              <span className="font-bold">127</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card variant="glass" className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 ring-1 ring-primary/20">
            <div className="text-3xl mb-2" aria-hidden>
              👥
            </div>
            <div className="text-sm text-violet-700 font-medium">Total Players</div>
            <div className="text-2xl font-bold text-violet-950">1,234</div>
            <div className="text-xs text-violet-700/70 mt-1">+48 new</div>
          </Card>
          <Card variant="glass" className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 ring-1 ring-primary/20">
            <div className="text-3xl mb-2" aria-hidden>
              📊
            </div>
            <div className="text-sm text-violet-700 font-medium">Average Score</div>
            <div className="text-2xl font-bold text-violet-950">8,240</div>
            <div className="text-xs text-violet-700/70 mt-1">↑ 12%</div>
          </Card>
          <Card variant="glass" className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 ring-1 ring-primary/20">
            <div className="text-3xl mb-2" aria-hidden>
              🎯
            </div>
            <div className="text-sm text-violet-700 font-medium">Goals Achieved</div>
            <div className="text-2xl font-bold text-violet-950">1,892</div>
            <div className="text-xs text-violet-700/70 mt-1">this week</div>
          </Card>
        </div>

        <Card variant="glass" className="overflow-hidden bg-white p-0">
            <div className="bg-gradient-to-r from-violet-100 to-violet-50 p-5 border-b border-violet-100">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-violet-950">Today's Rankings</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    UPDATING
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-violet-700">Sort by:</span>
                  <select className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-violet-700 ring-1 ring-primary/20 focus:outline-none">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                  </select>
                </div>
              </div>
            </div>

          <div className="p-5 space-y-2 max-h-[520px] overflow-y-auto">
            {visibleLeaderboard.map((player, i) => (
              <div
                key={player.name}
                className={`group relative flex items-center justify-between rounded-xl p-3 transition-all duration-200 hover:shadow-md ${getTierRowStyle(
                  player.level,
                  i + 1,
                )}`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium ${getRankStyle(i + 1, player.level)}`}
                  >
                    {i + 1}
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ring-1 ${getTierAvatarRing(player.level)}`}
                    aria-hidden
                  >
                    {player.avatar}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 truncate">{player.name}</span>
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${getTierBadgeStyle(player.level)}`}
                      >
                        {player.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span>🔥 {player.streak} days</span>
                      <span>•</span>
                      <span className={`flex items-center gap-1 ${getTrendColor(player.trend)}`}>
                        {getTrendIcon(player.trend)}
                        {player.trend === "up" ? "rising" : player.trend === "down" ? "down" : "steady"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-zinc-900">{player.score.toLocaleString()}</div>
                    <div className="text-xs text-zinc-500">points</div>
                  </div>
                  {i < 3 ? (
                    <div className="text-xl" aria-hidden>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-zinc-100 p-4">
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => setShowAll((s) => !s)}
            >
              <span>{showAll ? "Show Less" : "View Full Leaderboard"}</span>
              <span aria-hidden>{showAll ? "↑" : "→"}</span>
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
