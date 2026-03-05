import React, { useRef, useEffect, useMemo } from 'react';
import type { CinematicTheme, TimeOfDay } from '../CinematicBackground';
import { useDeviceTier } from '@/hooks/useDeviceTier';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getPreferredQuality, pickVideoSources } from './videoAssets';
import { RealTimeVideoEffects } from './RealTimeVideoEffects';

export interface VideoBackgroundProps {
  theme: CinematicTheme;
  timeOfDay: TimeOfDay;
}

export const VideoBackgroundLayer: React.FC<VideoBackgroundProps> = ({ theme, timeOfDay }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const deviceTier = useDeviceTier();
  const reducedMotion = useReducedMotion();

  const quality = useMemo(() => getPreferredQuality(deviceTier), [deviceTier]);
  const sources = useMemo(() => pickVideoSources({ theme, timeOfDay, quality }), [quality, theme, timeOfDay]);

  const effectsQuality = useMemo(() => {
    if (reducedMotion) return "off" as const;
    if (deviceTier === "low") return "off" as const;
    if (deviceTier === "mid") return "off" as const;
    return "high" as const;
  }, [deviceTier, reducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video
    const resizeCanvas = () => {
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
    };

    video.addEventListener('loadedmetadata', resizeCanvas);
    video.addEventListener('play', resizeCanvas);

    // When compositor is enabled, we avoid running the legacy overlay loop.
    if (reducedMotion || effectsQuality !== "off") return;

    // Create atmospheric overlay effect (GPU-friendly, low-frequency)
    const drawOverlay = () => {
      if (!ctx || !canvas.width || !canvas.height) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient overlay based on time of day
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      
      switch (timeOfDay) {
        case 'night':
          gradient.addColorStop(0, 'rgba(76, 29, 149, 0.3)');
          gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)');
          gradient.addColorStop(1, 'rgba(76, 29, 149, 0.3)');
          break;
        case 'dawn':
          gradient.addColorStop(0, 'rgba(251, 207, 232, 0.3)');
          gradient.addColorStop(0.5, 'rgba(254, 240, 138, 0.2)');
          gradient.addColorStop(1, 'rgba(251, 207, 232, 0.3)');
          break;
        case 'dusk':
          gradient.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
          gradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.2)');
          gradient.addColorStop(1, 'rgba(254, 240, 138, 0.3)');
          break;
        default: // day
          gradient.addColorStop(0, 'rgba(219, 234, 254, 0.2)');
          gradient.addColorStop(0.5, 'rgba(125, 211, 252, 0.1)');
          gradient.addColorStop(1, 'rgba(219, 234, 254, 0.2)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Film grain (lightweight): sparse sampling to avoid per-pixel loops
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = 'rgba(255,255,255,1)';
      for (let i = 0; i < 220; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const s = Math.random() * 1.6;
        ctx.fillRect(x, y, s, s);
      }
      ctx.globalAlpha = 1;
    };

    let raf: number | undefined;

    const tick = () => {
      drawOverlay();
      raf = window.requestAnimationFrame(tick);
    };

    const start = () => {
      if (raf != null) return;
      // Prefer syncing to video frames when supported
      const anyVideo = video as HTMLVideoElement & {
        requestVideoFrameCallback?: (cb: () => void) => number;
        cancelVideoFrameCallback?: (handle: number) => void;
      };

      if (typeof anyVideo.requestVideoFrameCallback === 'function') {
        let handle: number | undefined;
        const onFrame = () => {
          drawOverlay();
          handle = anyVideo.requestVideoFrameCallback?.(onFrame);
        };
        handle = anyVideo.requestVideoFrameCallback(onFrame);

        return () => {
          if (handle != null) anyVideo.cancelVideoFrameCallback?.(handle);
        };
      }

      tick();
      return () => {
        if (raf != null) window.cancelAnimationFrame(raf);
        raf = undefined;
      };
    };

    // Start animation when video plays
    let stop: (() => void) | undefined;
    const onPlay = () => {
      stop = start();
    };
    video.addEventListener('play', onPlay);
    if (!video.paused) onPlay();

    return () => {
      video.removeEventListener('loadedmetadata', resizeCanvas);
      video.removeEventListener('play', resizeCanvas);
      video.removeEventListener('play', onPlay);
      stop?.();
    };
  }, [effectsQuality, reducedMotion, timeOfDay]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          filter: 'brightness(0.7) contrast(1.1) saturate(1.2)',
          transform: 'scale(1.05)' // Slight zoom to cover edges
        }}
      >
        {sources.webm != null ? <source src={sources.webm} type="video/webm" /> : null}
        {sources.mp4 != null ? <source src={sources.mp4} type="video/mp4" /> : null}
      </video>

      {/* Real-time video compositor (enterprise-grade post processing) */}
      {effectsQuality !== "off" ? (
        <RealTimeVideoEffects videoRef={videoRef} quality={effectsQuality} timeOfDay={timeOfDay} />
      ) : null}
      
      {/* Canvas overlay for atmospheric effects */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          mixBlendMode: 'screen',
          opacity: effectsQuality === "off" ? 0.6 : 0
        }}
      />
      
      {/* Additional atmospheric fog layer */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at center, 
            ${timeOfDay === 'night' ? 'rgba(76, 29, 149, 0.4)' : 
              timeOfDay === 'dawn' ? 'rgba(251, 207, 232, 0.3)' :
              timeOfDay === 'dusk' ? 'rgba(254, 240, 138, 0.3)' :
              'rgba(219, 234, 254, 0.2)'} 0%, 
            transparent 70%)`,
          filter: 'blur(40px)',
          animation: 'fogDrift 30s ease-in-out infinite'
        }}
      />
    </div>
  );
};
