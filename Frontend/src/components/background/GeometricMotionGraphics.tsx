import React, { useRef, useEffect, useMemo } from 'react';

export interface GeometricPrimitive {
  id: number;
  type: 'triangle' | 'square' | 'hexagon' | 'circle';
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  opacity: number;
  rotationSpeed: number;
  scaleOscillation: number;
}

export const GeometricMotionGraphics: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const primitives = useMemo(() => {
    const shapes: GeometricPrimitive[] = [];
    const shapeTypes: GeometricPrimitive['type'][] = ['triangle', 'square', 'hexagon', 'circle'];
    
    for (let i = 0; i < 25; i++) {
      shapes.push({
        id: i,
        type: shapeTypes[i % shapeTypes.length],
        x: Math.random(),
        y: Math.random(),
        size: 20 + Math.random() * 60,
        rotation: Math.random() * Math.PI * 2,
        color: `hsl(${260 + Math.random() * 60}, ${50 + Math.random() * 30}%, ${60 + Math.random() * 20}%)`,
        opacity: 0.1 + Math.random() * 0.3,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        scaleOscillation: 0.5 + Math.random() * 0.5
      });
    }
    
    return shapes;
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

    const drawShape = (ctx: CanvasRenderingContext2D, primitive: GeometricPrimitive, time: number) => {
      const x = primitive.x * canvas.width;
      const y = primitive.y * canvas.height;
      const scale = 1 + Math.sin(time * primitive.scaleOscillation * 0.001) * 0.3;
      const rotation = primitive.rotation + time * primitive.rotationSpeed * 0.001;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.globalAlpha = primitive.opacity;

      // Create gradient for shape
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, primitive.size);
      gradient.addColorStop(0, primitive.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;

      ctx.beginPath();

      switch (primitive.type) {
        case 'triangle':
          for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
            const px = Math.cos(angle) * primitive.size;
            const py = Math.sin(angle) * primitive.size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          break;

        case 'square':
          ctx.rect(-primitive.size, -primitive.size, primitive.size * 2, primitive.size * 2);
          break;

        case 'hexagon':
          for (let i = 0; i < 6; i++) {
            const angle = (i * 2 * Math.PI) / 6;
            const px = Math.cos(angle) * primitive.size;
            const py = Math.sin(angle) * primitive.size;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          break;

        case 'circle':
          ctx.arc(0, 0, primitive.size, 0, Math.PI * 2);
          break;
      }

      ctx.closePath();
      ctx.fill();

      // Add glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = primitive.color;
      ctx.fill();

      ctx.restore();
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connection lines between nearby shapes
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < primitives.length; i++) {
        for (let j = i + 1; j < primitives.length; j++) {
          const p1 = primitives[i];
          const p2 = primitives[j];
          
          const dx = (p1.x - p2.x) * canvas.width;
          const dy = (p1.y - p2.y) * canvas.height;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.globalAlpha = (1 - distance / 150) * 0.3;
            ctx.beginPath();
            ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
            ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
            ctx.stroke();
          }
        }
      }

      // Draw all shapes
      primitives.forEach(primitive => {
        drawShape(ctx, primitive, time);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [primitives]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ 
        opacity: 0.5, 
        mixBlendMode: 'overlay',
        filter: 'blur(0.3px)'
      }}
    />
  );
};
