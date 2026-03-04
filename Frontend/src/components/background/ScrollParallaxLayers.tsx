import React, { useState, useEffect, useRef } from 'react';

export const ScrollParallaxLayers: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        void containerRef.current.offsetWidth;
        void containerRef.current.offsetHeight;
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const FloatingGeometricShapes = () => (
    <div className="absolute inset-0">
      {[...Array(8)].map((_, i) => (
        <div
          key={`geo-${i}`}
          className="absolute opacity-20"
          style={{
            left: `${10 + (i * 12)}%`,
            top: `${15 + (i * 8)}%`,
            width: `${30 + (i % 3) * 20}px`,
            height: `${30 + (i % 3) * 20}px`,
            transform: `rotate(${i * 45}deg) translateY(${scrollY * 0.5}px)`,
            background: `linear-gradient(45deg, 
              rgba(139, 92, 246, 0.3), 
              rgba(6, 182, 212, 0.2))`,
            clipPath: i % 2 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            filter: 'blur(1px)',
            animation: `float ${8 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}
    </div>
  );

  const DataStreamParticles = () => (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(12)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full opacity-40"
          style={{
            left: `${(i * 8.3) % 100}%`,
            top: `${(i * 13.7) % 100}%`,
            background: 'rgba(139, 92, 246, 0.8)',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.6)',
            transform: `translateY(${scrollY * 0.3}px) translateX(${Math.sin(scrollY * 0.001 + i) * 20}px)`,
            animation: `particleRise ${10 + i * 1.5}s linear infinite`,
            animationDelay: `${i * 0.8}s`
          }}
        />
      ))}
    </div>
  );

  const HolographicFragments = () => (
    <div className="absolute inset-0">
      {[...Array(6)].map((_, i) => (
        <div
          key={`holo-${i}`}
          className="absolute opacity-30"
          style={{
            left: `${20 + (i * 15)}%`,
            top: `${25 + (i * 10)}%`,
            width: `${60 + (i % 2) * 30}px`,
            height: '2px',
            background: `linear-gradient(90deg, 
              transparent, 
              rgba(6, 182, 212, 0.8), 
              transparent)`,
            transform: `translateY(${scrollY * 0.1}px) rotateX(${i * 30}deg)`,
            filter: 'blur(1px)',
            animation: `fragmentPulse ${6 + i}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`
          }}
        />
      ))}
    </div>
  );

  const NeuralConnections = () => (
    <svg className="absolute inset-0 w-full h-full" style={{ transform: `translateY(${scrollY * 0.2}px)` }}>
      <defs>
        <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
          <stop offset="100%" stopColor="rgba(6, 182, 212, 0.3)" />
        </linearGradient>
      </defs>
      {[...Array(5)].map((_, i) => (
        <g key={`neural-${i}`}>
          <line
            x1={`${10 + i * 18}%`}
            y1={`${20 + (i % 2) * 30}%`}
            x2={`${30 + i * 15}%`}
            y2={`${40 + (i % 3) * 20}%`}
            stroke="url(#neuralGradient)"
            strokeWidth="1"
            opacity="0.5"
            strokeDasharray="5, 10"
            style={{
              animation: `dashFlow ${8 + i * 2}s linear infinite`,
              animationDelay: `${i * 0.6}s`
            }}
          />
          <circle
            cx={`${10 + i * 18}%`}
            cy={`${20 + (i % 2) * 30}%`}
            r="3"
            fill="rgba(139, 92, 246, 0.6)"
            style={{
              animation: `neuralPulse ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`
            }}
          />
          <circle
            cx={`${30 + i * 15}%`}
            cy={`${40 + (i % 3) * 20}%`}
            r="3"
            fill="rgba(6, 182, 212, 0.6)"
            style={{
              animation: `neuralPulse ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3 + 0.5}s`
            }}
          />
        </g>
      ))}
    </svg>
  );

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Background parallax layer - slowest */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          opacity: 0.3
        }}
      >
        <FloatingGeometricShapes />
      </div>
      
      {/* Midground parallax layer - medium speed */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: 0.5
        }}
      >
        <DataStreamParticles />
      </div>
      
      {/* Neural connections layer */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.2}px)`,
          opacity: 0.4
        }}
      >
        <NeuralConnections />
      </div>
      
      {/* Foreground parallax layer - fastest */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
          opacity: 0.7
        }}
      >
        <HolographicFragments />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
          }
        }

        @keyframes particleRise {
          0% { 
            transform: translateY(100vh) translateX(0); 
            opacity: 0;
          }
          10% { 
            opacity: 0.4;
          }
          90% { 
            opacity: 0.4;
          }
          100% { 
            transform: translateY(-100px) translateX(50px); 
            opacity: 0;
          }
        }

        @keyframes fragmentPulse {
          0%, 100% { 
            opacity: 0.3; 
            transform: scaleY(1);
          }
          50% { 
            opacity: 0.6; 
            transform: scaleY(1.5);
          }
        }

        @keyframes dashFlow {
          0% { 
            stroke-dashoffset: 0; 
          }
          100% { 
            stroke-dashoffset: -15; 
          }
        }

        @keyframes neuralPulse {
          0%, 100% { 
            r: 3; 
            opacity: 0.6;
          }
          50% { 
            r: 5; 
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
};
