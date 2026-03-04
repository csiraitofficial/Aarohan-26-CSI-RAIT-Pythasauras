import React, { useState, useEffect, useRef } from 'react';

export interface MousePosition {
  x: number;
  y: number;
}

export const MouseTrackingEffect: React.FC = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
  }>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      setMousePosition({ x, y });
      
      // Add particle at mouse position
      if (particlesRef.current.length < 50) {
        particlesRef.current.push({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 3 + 1,
          life: 1
        });
      }
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => {
      setIsHovering(false);
      particlesRef.current = [];
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw mouse-following light
      if (isHovering) {
        const mouseX = mousePosition.x * canvas.width;
        const mouseY = mousePosition.y * canvas.height;

        // Main glow
        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 150);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.1)');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 150, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        const innerGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 30);
        innerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        innerGradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)');
        
        ctx.fillStyle = innerGradient;
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 30, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;
        particle.vy += 0.05; // Gravity

        if (particle.life > 0) {
          ctx.globalAlpha = particle.life * 0.6;
          ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Particle glow
          ctx.globalAlpha = particle.life * 0.3;
          ctx.fillStyle = 'rgba(139, 92, 246, 0.4)';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          ctx.fill();
          
          return true;
        }
        return false;
      });

      ctx.globalAlpha = 1;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mousePosition, isHovering]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Mouse-following light using CSS for smooth performance */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20 transition-all duration-300 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.8) 0%, transparent 70%)',
          left: `${mousePosition.x * 100}%`,
          top: `${mousePosition.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(40px)',
          display: isHovering ? 'block' : 'none'
        }}
      />
      
      {/* Secondary light ring */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-15 transition-all duration-500 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.6) 0%, transparent 60%)',
          left: `${mousePosition.x * 100}%`,
          top: `${mousePosition.y * 100}%`,
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
          display: isHovering ? 'block' : 'none'
        }}
      />

      {/* Canvas for particle effects */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
};
