import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { CinematicBackground } from "@/components/CinematicBackground";
import { PageTransition } from "@/components/PageTransition";
import { getBackgroundForPath, getThemeForPath, getTimeOfDay } from "@/config/uiTheme";
import { useDeviceTier, type DeviceTier } from "@/hooks/useDeviceTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { createLenis, type LenisInstance } from "@/lib/lenis";

export type AppAmbientValue = {
  pathname: string;
  now: Date;
  theme: ReturnType<typeof getThemeForPath>;
  timeOfDay: ReturnType<typeof getTimeOfDay>;
  background: ReturnType<typeof getBackgroundForPath>;
  deviceTier: DeviceTier;
  reducedMotion: boolean;
};

export const AppAmbientContext = createContext<AppAmbientValue | null>(null);

export function AppAmbient({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [now, setNow] = useState(() => new Date());
  const deviceTier = useDeviceTier();
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<LenisInstance | null>(null);
  const rafRef = useRef<number | null>(null);

  // Update time-of-day cheaply (once per minute).
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Smooth scrolling (Lenis)
  useEffect(() => {
    // Avoid stacking instances
    lenisRef.current?.destroy();
    lenisRef.current = createLenis({ reducedMotion });

    const lenis = lenisRef.current;
    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = window.requestAnimationFrame(raf);
    };

    rafRef.current = window.requestAnimationFrame(raf);

    return () => {
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  // Route changes: scroll to top via Lenis to keep motion smooth
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }
    lenis.scrollTo(0, { immediate: reducedMotion });
  }, [pathname, reducedMotion]);

  const bg = useMemo(() => getBackgroundForPath(pathname, now), [pathname, now]);
  const theme = useMemo(() => getThemeForPath(pathname), [pathname]);
  const timeOfDay = useMemo(() => getTimeOfDay(now), [now]);

  const ctx = useMemo(
    () => ({ pathname, now, theme, timeOfDay, background: bg, deviceTier, reducedMotion }) satisfies AppAmbientValue,
    [bg, deviceTier, now, pathname, reducedMotion, theme, timeOfDay],
  );

  return (
    <AppAmbientContext.Provider value={ctx}>
      <CinematicBackground {...bg}>
        <PageTransition>{children}</PageTransition>
      </CinematicBackground>
    </AppAmbientContext.Provider>
  );
}
