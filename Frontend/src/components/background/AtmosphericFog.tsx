import React, { useMemo } from 'react';
import type { TimeOfDay } from '../CinematicBackground';

export interface FogProps {
  density: number;
  timeOfDay?: TimeOfDay;
  movementSpeed?: number;
}

export const AtmosphericFog: React.FC<FogProps> = ({ 
  density, 
  timeOfDay = 'day',
  movementSpeed = 1
}) => {
  const fogColor = useMemo(() => {
    switch (timeOfDay) {
      case 'dawn': 
        return 'rgba(251, 207, 232, 0.3)';
      case 'day': 
        return 'rgba(219, 234, 254, 0.2)';
      case 'dusk': 
        return 'rgba(254, 240, 138, 0.3)';
      case 'night': 
        return 'rgba(139, 92, 246, 0.4)';
      default: 
        return 'rgba(219, 234, 254, 0.2)';
    }
  }, [timeOfDay]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Multiple fog layers for depth */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, 
              ${fogColor} 0%, 
              transparent 70%)`,
            opacity: density * (0.3 + i * 0.2),
            filter: `blur(${20 + i * 10}px)`,
            animation: `fogDrift ${30 / movementSpeed + i * 10}s ease-in-out infinite`,
            transform: `translateX(${Math.sin(i) * 10}%)`,
            animationDelay: `${i * 2}s`
          }}
        />
      ))}

      {/* Ground fog layer */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          background: `linear-gradient(to top, 
            ${fogColor} 0%, 
            ${fogColor.replace(/[\d.]+\)$/, '0.1)')} 30%, 
            transparent 100%)`,
          opacity: density * 0.6,
          filter: 'blur(30px)',
          animation: `groundFog ${40 / movementSpeed}s ease-in-out infinite`
        }}
      />

      {/* Mist particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`mist-${i}`}
          className="absolute w-32 h-32 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, 
              ${fogColor} 0%, 
              transparent 70%)`,
            opacity: density * 0.2,
            filter: 'blur(20px)',
            animation: `mistFloat ${20 + i * 5}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
            transform: `scale(${0.5 + Math.random() * 1})`
          }}
        />
      ))}

      <style>{`
        @keyframes fogDrift {
          0%, 100% { 
            transform: translateX(0) translateY(0); 
          }
          25% { 
            transform: translateX(20px) translateY(-10px); 
          }
          50% { 
            transform: translateX(-10px) translateY(20px); 
          }
          75% { 
            transform: translateX(15px) translateY(10px); 
          }
        }

        @keyframes groundFog {
          0%, 100% { 
            transform: translateY(0) scaleY(1); 
            opacity: ${density * 0.6};
          }
          50% { 
            transform: translateY(-20px) scaleY(1.2); 
            opacity: ${density * 0.8};
          }
        }

        @keyframes mistFloat {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
            opacity: ${density * 0.2};
          }
          25% { 
            transform: translate(30px, -20px) scale(1.1); 
          }
          50% { 
            transform: translate(-20px, 30px) scale(0.9); 
          }
          75% { 
            transform: translate(20px, 20px) scale(1.05); 
          }
        }
      `}</style>
    </div>
  );
};
