import React from 'react';
import type { TimeOfDay } from '../CinematicBackground';

export interface VolumetricLightingProps {
  intensity: number;
  angle: number;
  color?: string;
  timeOfDay?: TimeOfDay;
}

export const VolumetricLighting: React.FC<VolumetricLightingProps> = ({ 
  intensity, 
  angle, 
  color,
  timeOfDay = 'day'
}) => {
  const getLightColor = () => {
    if (color) return color;
    
    switch (timeOfDay) {
      case 'night':
        return 'rgba(139, 92, 246, 0.4)';
      case 'dawn':
        return 'rgba(251, 207, 232, 0.5)';
      case 'dusk':
        return 'rgba(254, 240, 138, 0.6)';
      default:
        return 'rgba(125, 211, 252, 0.5)';
    }
  };

  const lightColor = getLightColor();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* God rays effect */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(${angle}deg, 
            transparent 0%, 
            ${lightColor.replace(/[\d.]+\)$/, '0.2)')} 40%, 
            ${lightColor.replace(/[\d.]+\)$/, '0.4)')} 50%, 
            ${lightColor.replace(/[\d.]+\)$/, '0.2)')} 60%, 
            transparent 100%)`,
          filter: 'blur(40px)',
          animation: `volumetricPulse ${8 / intensity}s ease-in-out infinite` 
        }}
      />
      
      {/* Light shafts */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute h-full w-1 opacity-20"
          style={{
            left: `${20 + i * 15}%`,
            background: `linear-gradient(to bottom, 
              transparent, 
              ${lightColor.replace(/[\d.]+\)$/, '0.6)')}, 
              transparent)`,
            filter: 'blur(2px)',
            animation: `lightShaft ${10 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s` 
          }}
        />
      ))}

      {/* Volumetric fog */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 40%, 
            ${lightColor.replace(/[\d.]+\)$/, '0.1)')} 0%, 
            transparent 50%)`,
          filter: 'blur(60px)',
          animation: `volumetricDrift ${15 / intensity}s ease-in-out infinite`
        }}
      />

      {/* Additional light beams */}
      {[...Array(3)].map((_, i) => (
        <div
          key={`beam-${i}`}
          className="absolute inset-0 opacity-20"
          style={{
            background: `conic-gradient(from ${angle + i * 30}deg at 50% 50%, 
              transparent 0deg, 
              ${lightColor.replace(/[\d.]+\)$/, '0.3)')} 10deg, 
              transparent 20deg)`,
            filter: 'blur(30px)',
            animation: `beamRotate ${20 + i * 5}s linear infinite`,
            animationDelay: `${i * 2}s`
          }}
        />
      ))}

      <style>{`
        @keyframes volumetricPulse {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
          50% { 
            opacity: 0.6; 
            transform: scale(1.05); 
          }
        }

        @keyframes lightShaft {
          0%, 100% { 
            opacity: 0.1; 
            transform: translateY(-10px); 
          }
          50% { 
            opacity: 0.3; 
            transform: translateY(10px); 
          }
        }

        @keyframes volumetricDrift {
          0%, 100% { 
            transform: translate(0, 0) scale(1); 
          }
          33% { 
            transform: translate(20px, -10px) scale(1.1); 
          }
          66% { 
            transform: translate(-10px, 20px) scale(0.9); 
          }
        }

        @keyframes beamRotate {
          0% { 
            transform: rotate(0deg); 
          }
          100% { 
            transform: rotate(360deg); 
          }
        }
      `}</style>
    </div>
  );
};
