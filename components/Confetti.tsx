
import React, { useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  drag: number;
}

export const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { confettiTrigger } = useStore();
  const particlesRef = useRef<Particle[]>([]);
  const animationIdRef = useRef<number>(0);

  const colors = ['#2D9C8E', '#FF8A75', '#F4D35E', '#A7ACD9', '#1A2A3A'];

  useEffect(() => {
    if (confettiTrigger === 0) return;

    const createParticles = () => {
        const count = 150;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        for (let i = 0; i < count; i++) {
            particlesRef.current.push({
                x: width / 2,
                y: height / 2,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20 - 10, // Upward bias
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 8 + 4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                drag: 0.96 + Math.random() * 0.03
            });
        }
    };

    createParticles();

    if (!animationIdRef.current) {
        animate();
    }
  }, [confettiTrigger]);

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize logic inline for performance
    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();

        // Remove off-screen particles
        if (p.y > canvas.height + 100) {
             particlesRef.current.splice(index, 1);
        }
    });

    if (particlesRef.current.length > 0) {
        animationIdRef.current = requestAnimationFrame(animate);
    } else {
        animationIdRef.current = 0;
    }
  };

  return (
    <canvas 
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{ display: particlesRef.current.length > 0 ? 'block' : 'none' }}
    />
  );
};
