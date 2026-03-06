import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  title: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/practice", label: "Practice" },
  { href: "/learning", label: "Learning Hub" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/analytics", label: "Analytics" },
  { href: "/community", label: "Community" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({ title, children }: Props) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { user, logout } = useAuth();
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "Guest";
  const aiCoachAvatarSrc = "/Assets/Robo/Ai.png";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen text-zinc-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-5 px-4 py-4 sm:px-5 sm:py-6">
        {/* Desktop sidebar — hidden on mobile */}
        <aside className="hidden lg:block w-56 shrink-0 lg:w-64">
          <div className="sticky top-6 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-zinc-200/80 backdrop-blur-md border border-white/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-glow-sm overflow-hidden ring-1 ring-white/40">
                  <img src={aiCoachAvatarSrc} alt="" className="h-full w-full object-cover" decoding="async" />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-sm font-semibold truncate">ACE REBO</div>
                  <div className="text-xs text-zinc-500 truncate">{displayName}</div>
                </div>
              </div>
              <div className="shrink-0 hidden xl:block">
                <div className="text-[10px] font-black tracking-[0.22em] text-zinc-800 leading-none text-right">
                  <div>ACE</div>
                  <div>REBO</div>
                </div>
              </div>
            </div>

            <nav className="mt-4 space-y-0.5" aria-label="Main">
              {navItems.map((it) => {
                const isActive = pathname === it.href;
                return (
                  <Link
                    key={it.label}
                    to={it.href}
                    className={`relative block rounded-xl px-3 py-2.5 text-sm transition-colors duration-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ${isActive
                      ? "text-zinc-900 font-medium bg-violet-50"
                      : "text-zinc-700 hover:bg-violet-50/70 hover:text-zinc-900"
                      }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && !reducedMotion && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-xl bg-violet-100/80 ring-1 ring-primary/20 -z-10"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        aria-hidden
                      />
                    )}
                    {isActive && reducedMotion && (
                      <span
                        className="absolute inset-0 rounded-xl bg-violet-100/80 ring-1 ring-primary/20 -z-10"
                        aria-hidden
                      />
                    )}
                    {it.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <header className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 shadow-sm ring-1 ring-zinc-200/80 backdrop-blur-md border border-white/50 sm:px-5 sm:py-4">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileNavOpen(true)}
                className="lg:hidden grid h-9 w-9 place-items-center rounded-xl bg-zinc-100 ring-1 ring-zinc-200 hover:bg-zinc-50 transition-colors"
                aria-label="Open navigation"
              >
                <svg className="h-5 w-5 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold sm:text-xl lg:text-2xl">{title}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full bg-zinc-100 px-2.5 py-1.5 sm:px-3 sm:py-2 ring-1 ring-zinc-200 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 transition-colors"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-7 w-7 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 shrink-0 flex items-center justify-center text-white text-[10px] font-bold">
                    {user ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() : "?"}
                  </div>
                )}
                <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
              </Link>
              <button
                onClick={async () => { await logout(); navigate("/login"); }}
                className="rounded-full bg-zinc-100 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium ring-1 ring-zinc-200 hover:bg-red-50 hover:text-red-600 hover:ring-red-200 transition-colors"
                aria-label="Sign out"
              >
                <span className="hidden sm:inline">Sign out</span>
                <svg className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </button>
            </div>
          </header>

          <main id="main-content" className="mt-4 sm:mt-5" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-md shadow-xl border-r border-zinc-200 p-5 lg:hidden overflow-y-auto"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white overflow-hidden ring-1 ring-white/40">
                    <img src={aiCoachAvatarSrc} alt="" className="h-full w-full object-cover" decoding="async" />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <div className="text-sm font-semibold truncate">ACE REBO</div>
                    <div className="text-xs text-zinc-500 truncate">{displayName}</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-zinc-100 transition-colors"
                  aria-label="Close navigation"
                >
                  <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-1" aria-label="Mobile navigation">
                {navItems.map((it) => {
                  const isActive = pathname === it.href;
                  return (
                    <Link
                      key={it.label}
                      to={it.href}
                      onClick={() => setMobileNavOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive
                        ? "text-violet-700 bg-violet-50 ring-1 ring-violet-200"
                        : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                    >
                      {it.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
