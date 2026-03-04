import React, { useRef, useEffect, useMemo, useState } from 'react';

export interface NeuralNode {
  id: number;
  x: number;
  y: number;
  z: number;
  phase: number;
  connections: number[];
  activity: number;
  color: string;
}

export interface NeuralConnection {
  from: number;
  to: number;
  strength: number;
  dataFlow: number;
}

export interface DataPacket {
  connectionId: number;
  progress: number;
  speed: number;
  color: string;
}

export const NeuralNetworkAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  // Generate neural network structure
  const neuralNodes = useMemo(() => {
    const nodes: NeuralNode[] = [];
    const layers = [4, 8, 6, 8, 4]; // Network architecture
    let nodeId = 0;

    layers.forEach((layerSize, layerIndex) => {
      const layerX = (layerIndex / (layers.length - 1)) * 0.8 + 0.1; // Normalize to 0.1-0.9
      
      for (let i = 0; i < layerSize; i++) {
        const layerY = (i / Math.max(1, layerSize - 1)) * 0.8 + 0.1; // Normalize to 0.1-0.9
        const z = Math.random() * 0.2 - 0.1; // Small depth variation
        
        nodes.push({
          id: nodeId++,
          x: layerX,
          y: layerY,
          z,
          phase: Math.random() * Math.PI * 2,
          connections: [],
          activity: Math.random() * 0.5 + 0.5,
          color: `hsl(${260 + Math.random() * 40}, 70%, ${60 + Math.random() * 20}%)`
        });
      }
    });

    // Create connections between adjacent layers
    let startIdx = 0;
    for (let layer = 0; layer < layers.length - 1; layer++) {
      const endIdx = startIdx + layers[layer];
      const nextLayerStart = endIdx;
      const nextLayerEnd = nextLayerStart + layers[layer + 1];

      for (let i = startIdx; i < endIdx; i++) {
        for (let j = nextLayerStart; j < nextLayerEnd; j++) {
          if (Math.random() < 0.6) { // 60% connection probability
            nodes[i].connections.push(j);
            nodes[j].connections.push(i);
          }
        }
      }
      startIdx = endIdx;
    }

    return nodes;
  }, []);

  const connections = useMemo(() => {
    const conn: NeuralConnection[] = [];
    const processed = new Set<string>();

    neuralNodes.forEach(node => {
      node.connections.forEach(targetId => {
        const key = `${Math.min(node.id, targetId)}-${Math.max(node.id, targetId)}`;
        if (!processed.has(key)) {
          conn.push({
            from: node.id,
            to: targetId,
            strength: Math.random() * 0.5 + 0.5,
            dataFlow: 0
          });
          processed.add(key);
        }
      });
    });

    return conn;
  }, [neuralNodes]);

  const dataPackets = useMemo(() => {
    return connections.map((_, index) => ({
      connectionId: index,
      progress: Math.random(),
      speed: 0.001 + Math.random() * 0.003,
      color: `hsl(${260 + Math.random() * 40}, 80%, 70%)`
    }));
  }, [connections]);

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.05)');
      gradient.addColorStop(1, 'rgba(76, 29, 149, 0.02)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections with data flow
      connections.forEach((connection, index) => {
        const fromNode = neuralNodes[connection.from];
        const toNode = neuralNodes[connection.to];
        
        if (!fromNode || !toNode) return;

        const fromX = fromNode.x * canvas.width;
        const fromY = fromNode.y * canvas.height;
        const toX = toNode.x * canvas.width;
        const toY = toNode.y * canvas.height;

        // Draw connection line
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        
        // Create curved path
        const controlX = (fromX + toX) / 2 + (fromNode.z - toNode.z) * 100;
        const controlY = (fromY + toY) / 2 + (fromNode.z + toNode.z) * 50;
        ctx.quadraticCurveTo(controlX, controlY, toX, toY);
        
        ctx.strokeStyle = `rgba(139, 92, 246, ${connection.strength * 0.3})`;
        ctx.lineWidth = 1 + connection.strength;
        ctx.stroke();

        // Draw data packet
        const packet = dataPackets[index];
        if (packet) {
          packet.progress = (packet.progress + packet.speed) % 1;
          
          const t = packet.progress;
          const packetX = (1 - t) * (1 - t) * fromX + 2 * (1 - t) * t * controlX + t * t * toX;
          const packetY = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * controlY + t * t * toY;
          
          // Glowing packet effect
          const glowGradient = ctx.createRadialGradient(packetX, packetY, 0, packetX, packetY, 8);
          glowGradient.addColorStop(0, packet.color);
          glowGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(packetX, packetY, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw pulsing nodes
      neuralNodes.forEach(node => {
        const pulse = Math.sin(time * 0.002 + node.phase) * 0.3 + 0.7;
        const activity = Math.sin(time * 0.003 + node.phase * 2) * 0.2 + 0.8;
        
        const x = node.x * canvas.width;
        const y = node.y * canvas.height;
        const size = 4 + pulse * 3 + node.z * 10;

        // Node glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
        glowGradient.addColorStop(0, node.color);
        glowGradient.addColorStop(0.3, node.color.replace('70%', '50%'));
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.globalAlpha = activity * 0.6;
        ctx.beginPath();
        ctx.arc(x, y, size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node core
        ctx.globalAlpha = activity;
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.globalAlpha = 1;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [neuralNodes, connections, dataPackets, dimensions]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ 
        opacity: 0.7, 
        mixBlendMode: 'screen',
        filter: 'blur(0.5px)'
      }}
    />
  );
};
