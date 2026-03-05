import { useEffect, useMemo, useRef } from "react";
import { useDeviceTier } from "@/hooks/useDeviceTier";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type CircuitHexGridProps = {
  intensity?: number; // 0..1
};

type HexCell = {
  cx: number;
  cy: number;
  r: number;
  phase: number;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function hexPoints(cx: number, cy: number, r: number) {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return pts;
}

export function CircuitHexGrid({ intensity = 0.65 }: CircuitHexGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const deviceTier = useDeviceTier();
  const reducedMotion = useReducedMotion();

  const cfg = useMemo(() => {
    const i = clamp01(intensity);
    const quality = deviceTier === "high" ? 1 : deviceTier === "mid" ? 0.75 : 0.55;
    return {
      cellR: 14 + (1 - quality) * 4,
      glow: 10 + i * 14,
      alpha: 0.10 + i * 0.18,
      lineAlpha: 0.08 + i * 0.16,
      circuitAlpha: 0.12 + i * 0.20,
      nodes: Math.round((deviceTier === "high" ? 140 : deviceTier === "mid" ? 90 : 60) * i),
      motion: reducedMotion ? 0 : 1,
    } as const;
  }, [deviceTier, intensity, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const seedCells = () => {
      const cells: HexCell[] = [];
      const w = canvas.width;
      const h = canvas.height;
      const r = cfg.cellR;
      const dx = r * 1.7;
      const dy = r * 1.5;

      for (let y = -dy; y < h + dy; y += dy) {
        const odd = Math.round(y / dy) % 2;
        for (let x = -dx; x < w + dx; x += dx) {
          const cx = x + (odd ? dx / 2 : 0);
          const cy = y;
          if (Math.random() < 0.12) continue;
          cells.push({ cx, cy, r, phase: Math.random() * Math.PI * 2 });
        }
      }
      return cells;
    };

    const cells = seedCells();

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Soft background glow
      const g = ctx.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.45, Math.max(w, h) * 0.6);
      g.addColorStop(0, `rgba(139, 92, 246, ${0.06 + cfg.alpha * 0.4})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const time = t * 0.001 * cfg.motion;

      // Hex grid strokes
      ctx.lineWidth = 1;
      ctx.shadowBlur = cfg.glow;
      ctx.shadowColor = "rgba(139, 92, 246, 0.45)";

      for (let i = 0; i < cells.length; i++) {
        const c = cells[i]!;
        const pulse = 0.55 + Math.sin(time * 0.8 + c.phase) * 0.45;
        const a = cfg.lineAlpha * (0.35 + pulse * 0.65);

        const pts = hexPoints(c.cx, c.cy, c.r);
        ctx.beginPath();
        ctx.moveTo(pts[0]![0], pts[0]![1]);
        for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k]![0], pts[k]![1]);
        ctx.closePath();
        ctx.strokeStyle = `rgba(139, 92, 246, ${a})`;
        ctx.stroke();

        // Minimal node dots
        if (i % 7 === 0) {
          ctx.fillStyle = `rgba(6, 182, 212, ${0.08 + pulse * 0.12})`;
          ctx.beginPath();
          ctx.arc(c.cx, c.cy, 1.2 + pulse * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;

      // Circuit traces: sparse animated polylines
      const traces = cfg.nodes;
      ctx.lineWidth = 1;
      for (let i = 0; i < traces; i++) {
        const x0 = (i * 97) % w;
        const y0 = (i * 53 + 120) % h;
        const x1 = x0 + (Math.sin(time * 0.9 + i) * 140 + 120);
        const y1 = y0 + (Math.cos(time * 0.7 + i) * 90 + 60);

        const midX = (x0 + x1) * 0.5;

        const flow = (Math.sin(time * 2.2 + i) * 0.5 + 0.5);
        ctx.strokeStyle = `rgba(6, 182, 212, ${cfg.circuitAlpha * (0.35 + flow * 0.65)})`;

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(midX, y0);
        ctx.lineTo(midX, y1);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        // moving packet
        const px = midX + (x1 - midX) * flow;
        const py = y1;
        ctx.fillStyle = `rgba(251, 191, 36, ${0.10 + flow * 0.25})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = window.requestAnimationFrame(draw);
    };

    rafRef.current = window.requestAnimationFrame(draw);

    return () => {
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
      window.removeEventListener("resize", resize);
    };
  }, [cfg]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.8, mixBlendMode: "screen" }}
    />
  );
}
