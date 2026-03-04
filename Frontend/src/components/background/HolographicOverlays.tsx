import React, { useRef, useEffect, useMemo } from 'react';

export interface HolographicPanel {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string[];
  opacity: number;
  scanlineOffset: number;
}

export interface TextOverlay {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  opacity: number;
  glitchIntensity: number;
}

export interface DataStream {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number;
  color: string;
  particles: Array<{ progress: number; size: number }>;
}

export const HolographicOverlays: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const panels = useMemo(() => {
    return [
      {
        id: 1,
        x: 0.1,
        y: 0.15,
        width: 0.15,
        height: 0.2,
        content: ['SYSTEM STATUS', 'ONLINE', 'CPU: 42%', 'MEM: 67%'],
        opacity: 0.6,
        scanlineOffset: 0
      },
      {
        id: 2,
        x: 0.75,
        y: 0.1,
        width: 0.2,
        height: 0.15,
        content: ['NEURAL NET', 'LAYERS: 5', 'NODES: 30', 'ACTIVE'],
        opacity: 0.5,
        scanlineOffset: 0.5
      },
      {
        id: 3,
        x: 0.8,
        y: 0.7,
        width: 0.15,
        height: 0.25,
        content: ['DATA STREAM', 'IN: 1.2MB/s', 'OUT: 0.8MB/s', 'PACKETS: 142'],
        opacity: 0.4,
        scanlineOffset: 0.3
      }
    ] as HolographicPanel[];
  }, []);

  const textOverlays = useMemo(() => {
    return [
      {
        id: 1,
        text: 'ROBOBUDDY SYSTEM',
        x: 0.5,
        y: 0.05,
        fontSize: 24,
        opacity: 0.7,
        glitchIntensity: 0.1
      },
      {
        id: 2,
        text: '> INITIALIZING...',
        x: 0.1,
        y: 0.9,
        fontSize: 14,
        opacity: 0.8,
        glitchIntensity: 0.2
      },
      {
        id: 3,
        text: 'AI CORE v2.0',
        x: 0.85,
        y: 0.95,
        fontSize: 12,
        opacity: 0.6,
        glitchIntensity: 0.05
      }
    ] as TextOverlay[];
  }, []);

  const dataStreams = useMemo(() => {
    return [
      {
        id: 1,
        startX: 0,
        startY: 0.3,
        endX: 1,
        endY: 0.35,
        speed: 0.002,
        color: 'rgba(139, 92, 246, 0.6)',
        particles: Array.from({ length: 8 }, () => ({
          progress: Math.random(),
          size: 2 + Math.random() * 3
        }))
      },
      {
        id: 2,
        startX: 0.2,
        startY: 0,
        endX: 0.25,
        endY: 1,
        speed: 0.0015,
        color: 'rgba(6, 182, 212, 0.5)',
        particles: Array.from({ length: 6 }, () => ({
          progress: Math.random(),
          size: 1 + Math.random() * 2
        }))
      },
      {
        id: 3,
        startX: 0.7,
        startY: 1,
        endX: 0.75,
        endY: 0,
        speed: 0.0025,
        color: 'rgba(251, 191, 36, 0.4)',
        particles: Array.from({ length: 10 }, () => ({
          progress: Math.random(),
          size: 1 + Math.random() * 4
        }))
      }
    ] as DataStream[];
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawHolographicPanel = (panel: HolographicPanel, time: number) => {
      const x = panel.x * canvas.width;
      const y = panel.y * canvas.height;
      const width = panel.width * canvas.width;
      const height = panel.height * canvas.height;

      // Panel background with holographic effect
      const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = panel.opacity;
      ctx.fillRect(x, y, width, height);

      // Panel border
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Scanlines
      const scanlineSpacing = 4;
      const scanlineOffset = (time * 0.05 + panel.scanlineOffset * 100) % scanlineSpacing;
      
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
      ctx.lineWidth = 1;
      
      for (let sy = y - scanlineOffset; sy < y + height; sy += scanlineSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, sy);
        ctx.lineTo(x + width, sy);
        ctx.stroke();
      }

      // Text content
      ctx.fillStyle = 'rgba(139, 92, 246, 0.9)';
      ctx.font = '10px monospace';
      
      panel.content.forEach((line, index) => {
        const textY = y + 15 + index * 15;
        ctx.fillText(line, x + 5, textY);
      });

      ctx.globalAlpha = 1;
    };

    const drawTextOverlay = (overlay: TextOverlay, time: number) => {
      const x = overlay.x * canvas.width;
      const y = overlay.y * canvas.height;

      // Glitch effect
      const glitch = Math.sin(time * 0.01 + overlay.id) * overlay.glitchIntensity;
      
      ctx.save();
      ctx.translate(x + glitch * 2, y + glitch);
      
      // Text shadow/glow
      ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
      ctx.shadowBlur = 10;
      
      ctx.fillStyle = `rgba(139, 92, 246, ${overlay.opacity})`;
      ctx.font = `${overlay.fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(overlay.text, 0, 0);
      
      ctx.restore();
    };

    const drawDataStream = (stream: DataStream, time: number) => {
      const startX = stream.startX * canvas.width;
      const startY = stream.startY * canvas.height;
      const endX = stream.endX * canvas.width;
      const endY = stream.endY * canvas.height;

      // Draw stream path
      ctx.strokeStyle = stream.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Draw particles
      const timeMod = 0.85 + Math.sin(time * 0.001 + stream.id) * 0.15;
      stream.particles.forEach(particle => {
        particle.progress = (particle.progress + stream.speed * timeMod) % 1;
        
        const px = startX + (endX - startX) * particle.progress;
        const py = startY + (endY - startY) * particle.progress;
        
        // Particle glow
        const gradient = ctx.createRadialGradient(px, py, 0, px, py, particle.size);
        gradient.addColorStop(0, stream.color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(px, py, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw all holographic elements
      panels.forEach(panel => drawHolographicPanel(panel, time));
      textOverlays.forEach(overlay => drawTextOverlay(overlay, time));
      dataStreams.forEach(stream => drawDataStream(stream, time));

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [panels, textOverlays, dataStreams]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ 
        opacity: 0.8, 
        mixBlendMode: 'screen',
        filter: 'contrast(1.2) brightness(1.1)'
      }}
    />
  );
};
