import { Suspense, useEffect, useMemo, useRef, useState, lazy } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { spring } from "@/lib/motion";
import { RoboticSceneFallback } from "@/components/hero/RoboticSceneFallback";

// Import new cinematic background components
import { VideoBackgroundLayer } from "./background/VideoBackgroundLayer";
import { NeuralNetworkAnimation } from "./background/NeuralNetworkAnimation";
import { GeometricMotionGraphics } from "./background/GeometricMotionGraphics";
import { HolographicOverlays } from "./background/HolographicOverlays";
import { VolumetricLighting } from "./background/VolumetricLighting";
import { AtmosphericFog } from "./background/AtmosphericFog";
import { MouseTrackingEffect } from "./background/MouseTrackingEffect";
import { ScrollParallaxLayers } from "./background/ScrollParallaxLayers";
import { useBackgroundOptimization } from "./background/LayerManager";
import "./background/BackgroundAnimations.css";

const RoboticScene = lazy(() => import("@/components/hero/RoboticScene").then((m) => ({ default: m.RoboticScene })));

export type CinematicTheme = "study" | "analytics" | "practice" | "community";
export type TimeOfDay = "dawn" | "day" | "dusk" | "night";

export type CinematicBackgroundProps = {
  theme?: CinematicTheme;
  timeOfDay?: TimeOfDay;
  /** 0..1 */
  robotDensity?: number;
  /** 0..1 */
  neuralActivity?: number;
  /** 0..1 */
  particleIntensity?: number;
  /** Optional class for the wrapper. */
  className?: string;
  /** Content rendered above the background. */
  children?: React.ReactNode;
};

/**
 * Cinematic background system with themed layers, parallax depth,
 * and reduced-motion aware rendering.
 * Respects prefers-reduced-motion (disables or simplifies animation).
 */
export function CinematicBackground({
  theme = "study",
  timeOfDay = "day",
  robotDensity = 0.55,
  neuralActivity = 0.6,
  particleIntensity = 0.5,
  className = "",
  children,
}: CinematicBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const deviceTier = useDeviceTier();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [hasPointer, setHasPointer] = useState(false);

  const renderMode = useMemo(() => {
    if (reducedMotion) return "static" as const;
    if (deviceTier === "low") return "lite" as const;
    return "cinematic" as const; // New cinematic mode
  }, [deviceTier, reducedMotion]);

  const allowParallax = renderMode === "cinematic";
  const allowStreams = renderMode === "cinematic";
  const allowRobots = renderMode !== "static";
  const allowParticles = renderMode === "cinematic";
  const allow3d = renderMode === "cinematic" && deviceTier === "high";

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, spring.soft);
  const sy = useSpring(py, spring.soft);

  const x10 = useTransform(sx, (v: number) => v * 10);
  const y10 = useTransform(sy, (v: number) => v * 10);
  const x16 = useTransform(sx, (v: number) => v * 16);
  const y16 = useTransform(sy, (v: number) => v * 16);
  const x20 = useTransform(sx, (v: number) => v * 20);
  const y20 = useTransform(sy, (v: number) => v * 20);
  const x26 = useTransform(sx, (v: number) => v * 26);
  const y26 = useTransform(sy, (v: number) => v * 26);

  useEffect(() => {
    if (!allowParallax) return;
    const el = rootRef.current;
    if (el === null) return;

    function onMove(e: PointerEvent) {
      const cur = rootRef.current;
      if (cur === null) return;
      const rect = cur.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      px.set(nx);
      py.set(ny);
    }

    function onEnter() {
      setHasPointer(true);
    }
    function onLeave() {
      setHasPointer(false);
      px.set(0);
      py.set(0);
    }

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [allowParallax, px, py]);

  const scene = useMemo(() => {
    const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
    const r = clamp01(robotDensity);
    const n = clamp01(neuralActivity);
    const p = clamp01(particleIntensity);

    const perf = renderMode === "cinematic" ? 1 : renderMode === "lite" ? 0.55 : 0;

    const base = {
      fogOpacity: 0.95,
      gridOpacity: 0.13,
      scanOpacity: 0.035,
      streamOpacity: 0.18 + p * 0.12,
      particleCount: Math.max(0, Math.round((18 + p * 36) * perf)),
      robotCount: Math.max(0, Math.round((1 + r * 4) * (renderMode === "lite" ? 0.5 : 1))),
      neuralCount: Math.max(8, Math.round((10 + n * 18) * (renderMode === "static" ? 0.65 : 1))),
    } as const;

    const timeOverlay =
      timeOfDay === "night"
        ? "from-zinc-900/10 via-violet-900/5 to-transparent"
        : timeOfDay === "dusk"
          ? "from-violet-100/35 via-transparent to-zinc-900/5"
          : timeOfDay === "dawn"
            ? "from-violet-100/45 via-zinc-50/10 to-transparent"
            : "from-violet-100/30 via-transparent to-zinc-900/5";

    const accentDot =
      theme === "analytics" ? "bg-neural/40" : theme === "practice" ? "bg-energy/35" : "bg-primary/30";

    return { ...base, timeOverlay, accentDot } as const;
  }, [neuralActivity, particleIntensity, renderMode, robotDensity, theme, timeOfDay]);

  const { shouldReduceEffects, shouldLowerQuality } = useBackgroundOptimization();

  return (
    <div ref={rootRef} className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Video Background Layer */}
      {renderMode === "cinematic" && !shouldReduceEffects && (
        <VideoBackgroundLayer theme={theme} timeOfDay={timeOfDay} />
      )}
      
      {/* Motion Graphics Layer */}
      {renderMode === "cinematic" && !shouldReduceEffects && (
        <div className="absolute inset-0">
          <NeuralNetworkAnimation />
          <GeometricMotionGraphics />
          <HolographicOverlays />
        </div>
      )}
      
      {/* Atmospheric Effects */}
      <div className="absolute inset-0">
        <AtmosphericFog density={shouldLowerQuality ? 0.2 : 0.4} timeOfDay={timeOfDay} />
        <VolumetricLighting intensity={shouldLowerQuality ? 0.3 : 0.6} angle={45} timeOfDay={timeOfDay} />
        {allowParticles && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70" aria-hidden>
            <Particles count={scene.particleCount} dotClass={scene.accentDot} />
          </div>
        )}
      </div>
      
      {/* Interactive Layer */}
      {renderMode === "cinematic" && !shouldReduceEffects && (
        <div className="absolute inset-0">
          <MouseTrackingEffect />
          <ScrollParallaxLayers />
        </div>
      )}
      
      {/* Original Layers (fallback and compatibility) */}
      {/* Layer 1: deep environment base */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-50 via-zinc-50 to-violet-100" aria-hidden />
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${scene.timeOverlay}`} aria-hidden />

      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden>
        <div className="absolute left-1/2 top-[10%] h-[280px] w-[420px] -translate-x-1/2 sm:h-[360px] sm:w-[560px] lg:top-[6%] lg:h-[420px] lg:w-[680px] opacity-[0.9]">
          {allow3d ? (
            <Suspense fallback={<RoboticSceneFallback className="h-full w-full" />}>
              <RoboticScene className="h-full w-full" />
            </Suspense>
          ) : allowRobots ? (
            <RoboticSceneFallback className="h-full w-full" />
          ) : null}
        </div>
      </div>

      {/* Layer A: gradient fog */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-fog"
        style={{ opacity: scene.fogOpacity }}
        aria-hidden
      />

      {/* Layer 2: animated grid + circuitry */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={
          allowParallax
            ? { opacity: scene.gridOpacity, x: hasPointer ? x10 : 0, y: hasPointer ? y10 : 0 }
            : { opacity: scene.gridOpacity }
        }
      >
        <div
          className={`h-full w-full bg-[linear-gradient(rgba(139,92,246,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.16)_1px,transparent_1px)] bg-[size:32px_32px] ${
            reducedMotion ? "" : "animate-[gridMove_26s_linear_infinite]"
          }`}
        />
        <div className="absolute inset-0 opacity-[0.45] bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.18),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.14),transparent_40%)]" />
      </motion.div>

      {/* Layer 3: scanlines + noise */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden>
        <div
          className={`h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.15)_2px,rgba(0,0,0,0.15)_4px)] ${
            reducedMotion ? "" : "animate-[scanline_8s_linear_infinite]"
          }`}
        />
      </div>

      {/* Layer 4: neural network overlay (SVG) */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={
          allowParallax
            ? { opacity: 0.22 + scene.neuralCount / 100, x: hasPointer ? x16 : 0, y: hasPointer ? y16 : 0 }
            : { opacity: 0.22 + scene.neuralCount / 100 }
        }
      >
        <NeuralField theme={theme} nodeCount={scene.neuralCount} reducedMotion={reducedMotion} />
      </motion.div>

      {/* Layer 5: data streams (binary / packets) */}
      {allowStreams && (
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
          style={
            allowParallax
              ? { opacity: scene.streamOpacity, x: hasPointer ? x20 : 0, y: hasPointer ? y20 : 0 }
              : { opacity: scene.streamOpacity }
          }
        >
          <DataStreams theme={theme} />
        </motion.div>
      )}

      {/* Layer 6: robots + study glyphs */}
      {allowRobots && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={allowParallax ? { opacity: 0.65, x: hasPointer ? x26 : 0, y: hasPointer ? y26 : 0 } : { opacity: 0.65 }}
        >
          <RobotLayer theme={theme} count={scene.robotCount} />
          <StudyGlyphs theme={theme} />
        </motion.div>
      )}

      {/* Layer 7: particles (foreground nodes) */}
      {allowParticles && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70" aria-hidden>
          <Particles count={scene.particleCount} dotClass={scene.accentDot} />
        </div>
      )}

      {/* Content */}
      {children != null ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
}

function Particles({ count, dotClass }: { count: number; dotClass: string }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`absolute h-1 w-1 rounded-full ${dotClass}`}
          style={{
            left: `${(i * 7 + 13) % 100}%`,
            top: `${(i * 11 + 7) % 100}%`,
            animation: `particleFloat ${8 + (i % 6)}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </>
  );
}

function NeuralField({
  theme,
  nodeCount,
  reducedMotion,
}: {
  theme: CinematicTheme;
  nodeCount: number;
  reducedMotion: boolean;
}) {
  const color =
    theme === "analytics" ? "rgba(6,182,212,0.35)" : theme === "practice" ? "rgba(251,191,36,0.28)" : "rgba(139,92,246,0.28)";

  const nodes = useMemo(() => {
    const arr = Array.from({ length: nodeCount }, (_, i) => {
      const x = (i * 37) % 100;
      const y = (i * 19 + 13) % 100;
      return { x, y, r: 1.2 + (i % 3) * 0.6 };
    });
    return arr;
  }, [nodeCount]);

  const edges = useMemo(() => {
    const e: Array<[number, number]> = [];
    for (let i = 0; i < nodes.length - 1; i += 2) {
      e.push([i, (i + 5) % nodes.length]);
      if (i % 6 === 0) e.push([i, (i + 11) % nodes.length]);
    }
    return e;
  }, [nodes.length]);

  return (
    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <g opacity={0.9}>
        {edges.map(([a, b], idx) => (
          <path
            key={idx}
            d={`M ${nodes[a]!.x} ${nodes[a]!.y} L ${nodes[b]!.x} ${nodes[b]!.y}`}
            stroke={color}
            strokeWidth={0.25}
            strokeLinecap="round"
            fill="none"
            style={
              reducedMotion
                ? undefined
                : {
                    strokeDasharray: "2 6",
                    animation: `dashFlow ${6 + (idx % 5)}s linear infinite`,
                  }
            }
          />
        ))}
        {nodes.map((n, idx) => (
          <circle
            key={idx}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={color}
            style={
              reducedMotion
                ? undefined
                : {
                    animation: `neuralPulse ${2.2 + (idx % 7) * 0.25}s ease-in-out infinite`,
                    animationDelay: `${(idx % 10) * 0.15}s`,
                  }
            }
          />
        ))}
      </g>
    </svg>
  );
}

function DataStreams({ theme }: { theme: CinematicTheme }) {
  const hue =
    theme === "analytics"
      ? "rgba(6,182,212,0.7)"
      : theme === "practice"
        ? "rgba(251,191,36,0.6)"
        : theme === "community"
          ? "rgba(16,185,129,0.55)"
          : "rgba(139,92,246,0.55)";

  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="absolute top-0 h-full w-1/3"
          style={{
            left: `${(i * 17) % 100}%`,
            transform: `skewX(${-12 + (i % 3) * 6}deg)`,
            filter: "blur(0.2px)",
          }}
        >
          <div
            className="absolute top-0 h-full w-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${hue}, transparent)`,
              opacity: 0.25,
              animation: `dataStream ${6 + i}s linear infinite`,
              animationDelay: `${i * 0.7}s`,
            }}
          />
          <div
            className="absolute top-0 h-full w-full"
            style={{
              background:
                "repeating-linear-gradient(180deg, transparent 0px, transparent 10px, rgba(255,255,255,0.15) 10px, rgba(255,255,255,0.15) 11px)",
              opacity: 0.08,
            }}
          />
        </div>
      ))}
    </>
  );
}

function RobotLayer({ theme, count }: { theme: CinematicTheme; count: number }) {
  const botColor =
    theme === "analytics" ? "rgba(100,116,139,0.55)" : theme === "practice" ? "rgba(100,116,139,0.5)" : "rgba(100,116,139,0.45)";
  const eye =
    theme === "analytics" ? "rgba(6,182,212,0.7)" : theme === "practice" ? "rgba(251,191,36,0.7)" : "rgba(99,102,241,0.7)";

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${12 + ((i * 23) % 76)}%`,
            top: `${18 + ((i * 17) % 64)}%`,
            width: `${160 - (i % 3) * 30}px`,
            height: `${120 - (i % 3) * 18}px`,
          }}
          animate={{
            y: [0, -6 - (i % 3) * 2, 0],
            rotate: [-0.8, 0.8, -0.8],
          }}
          transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg className="h-full w-full" viewBox="0 0 160 120" fill="none">
            <rect x="24" y="28" width="96" height="64" rx="14" fill={botColor} opacity="0.5" />
            <rect x="28" y="32" width="88" height="56" rx="12" stroke={eye} strokeOpacity="0.25" />
            <circle cx="60" cy="58" r="6" fill={eye} opacity="0.55" />
            <circle cx="88" cy="58" r="6" fill={eye} opacity="0.55" />
            <path d="M54 74 H94" stroke={eye} strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
            <path d="M120 48 L146 34" stroke={botColor} strokeOpacity="0.45" strokeWidth="10" strokeLinecap="round" />
            <path d="M120 72 L146 86" stroke={botColor} strokeOpacity="0.45" strokeWidth="10" strokeLinecap="round" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

function StudyGlyphs({ theme }: { theme: CinematicTheme }) {
  const fg =
    theme === "analytics"
      ? "text-neural/50"
      : theme === "practice"
        ? "text-energy/40"
        : theme === "community"
          ? "text-status-success/40"
          : "text-primary/40";

  return (
    <>
      {[
        { left: "10%", top: "68%", text: "∑  λ  π  θ" },
        { left: "74%", top: "22%", text: "01001101 01100001" },
        { left: "62%", top: "78%", text: "O(n log n)  →  O(n)" },
        { left: "18%", top: "24%", text: "function train(model) {…}" },
      ].map((g, i) => (
        <motion.div
          key={i}
          className={`absolute ${fg} font-mono text-[10px] sm:text-xs tracking-wide`}
          style={{ left: g.left, top: g.top }}
          animate={{ opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 5 + i * 0.7, repeat: Infinity, ease: "easeInOut" }}
        >
          {g.text}
        </motion.div>
      ))}
    </>
  );
}
