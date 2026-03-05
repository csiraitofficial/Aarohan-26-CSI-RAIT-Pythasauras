import React, { useEffect, useMemo, useRef } from "react";

export type VideoEffectsQuality = "off" | "low" | "high";

export type RealTimeVideoEffectsProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  quality: VideoEffectsQuality;
  timeOfDay: "dawn" | "day" | "dusk" | "night";
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function applyChromaticAberration(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const a = Math.max(0, amount);
  if (a === 0) return;

  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = 0.12;

  // Red shift
  ctx.filter = "none";
  ctx.drawImage(ctx.canvas, -a, 0, w, h);

  // Cyan shift
  ctx.globalAlpha = 0.08;
  ctx.drawImage(ctx.canvas, a, 0, w, h);

  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function applyVignette(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  const s = clamp01(strength);
  if (s <= 0) return;

  const g = ctx.createRadialGradient(w * 0.5, h * 0.55, Math.min(w, h) * 0.15, w * 0.5, h * 0.55, Math.max(w, h) * 0.7);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${0.55 * s})`);

  ctx.globalCompositeOperation = "multiply";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "source-over";
}

function applyFilmGrain(ctx: CanvasRenderingContext2D, w: number, h: number, strength: number) {
  const s = clamp01(strength);
  if (s <= 0) return;

  const count = Math.round(180 + 420 * s);
  ctx.globalAlpha = 0.06 + 0.10 * s;
  ctx.fillStyle = "rgba(255,255,255,1)";
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = Math.random() * (1.2 + 1.2 * s);
    ctx.fillRect(x, y, r, r);
  }
  ctx.globalAlpha = 1;
}

export function RealTimeVideoEffects({ videoRef, quality, timeOfDay }: RealTimeVideoEffectsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | undefined>(undefined);

  const preset = useMemo(() => {
    if (quality === "off") {
      return {
        brightness: 1,
        contrast: 1,
        saturate: 1,
        blurPx: 0,
        ca: 0,
        grain: 0,
        vignette: 0,
      };
    }

    const base = quality === "high"
      ? { brightness: 1.07, contrast: 1.12, saturate: 1.16, blurPx: 0.35, ca: 1.2, grain: 0.22, vignette: 0.32 }
      : { brightness: 1.04, contrast: 1.08, saturate: 1.10, blurPx: 0.15, ca: 0.8, grain: 0.14, vignette: 0.24 };

    // Time-of-day grading
    if (timeOfDay === "night") return { ...base, contrast: base.contrast + 0.05, vignette: base.vignette + 0.06 };
    if (timeOfDay === "dawn") return { ...base, brightness: base.brightness + 0.03, saturate: base.saturate + 0.04 };
    if (timeOfDay === "dusk") return { ...base, brightness: base.brightness + 0.01, saturate: base.saturate + 0.06 };
    return base;
  }, [quality, timeOfDay]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
    };

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      if (video.paused || video.ended) {
        rafRef.current = window.requestAnimationFrame(draw);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (quality !== "off") {
        ctx.filter = `brightness(${preset.brightness}) contrast(${preset.contrast}) saturate(${preset.saturate}) blur(${preset.blurPx}px)`;
      } else {
        ctx.filter = "none";
      }

      ctx.drawImage(video, 0, 0, w, h);
      ctx.filter = "none";

      if (quality !== "off") {
        applyChromaticAberration(ctx, w, h, preset.ca);
        applyFilmGrain(ctx, w, h, preset.grain);
        applyVignette(ctx, w, h, preset.vignette);
      }

      rafRef.current = window.requestAnimationFrame(draw);
    };

    const start = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(draw);
    };

    const stop = () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    };

    const onPlay = () => start();
    const onPause = () => stop();

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    start();

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [preset, quality, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ mixBlendMode: "normal", opacity: quality === "off" ? 0 : 1 }}
    />
  );
}
