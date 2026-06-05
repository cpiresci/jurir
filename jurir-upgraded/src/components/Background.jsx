import { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;
    const N = 90, MAX_D = 160;

    class P {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.28;
        this.vy = (Math.random() - 0.5) * 0.28;
        this.r  = Math.random() * 1.8 + 0.4;
        this.a  = Math.random() * 0.3 + 0.05;
        // each particle has a color variation — red or gold
        this.isGold = Math.random() < 0.15;
      }
      move() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
      }
    }

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      particles = Array.from({ length: N }, () => new P());
    };

    let scanY = H * 0.3;
    let scanDir = 1;
    let scanSpeed = 0.35;
    let frame = 0;

    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, W, H);

      // Draw connections
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.hypot(dx, dy);
          if (d < MAX_D) {
            const alpha = (1 - d / MAX_D) * 0.055;
            const color = particles[i].isGold || particles[j].isGold
              ? `rgba(202,138,4,${alpha * 1.2})`
              : `rgba(185,28,28,${alpha})`;
            ctx.strokeStyle = color;
            ctx.lineWidth   = 0.4;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.isGold
          ? `rgba(202,138,4,${p.a})`
          : `rgba(185,28,28,${p.a})`;
        ctx.fill();
        p.move();
      }

      // Scanning line — bounces vertically
      scanY += scanSpeed * scanDir;
      if (scanY > H * 0.9) scanDir = -1;
      if (scanY < H * 0.1) scanDir = 1;

      const g = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      g.addColorStop(0,   'transparent');
      g.addColorStop(0.5, 'rgba(185,28,28,0.12)');
      g.addColorStop(1,   'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, scanY - 20, W, 40);

      // Subtle pulsing orb at top-right
      const pulse = Math.sin(frame * 0.008) * 0.5 + 0.5;
      const orb = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, W * 0.25);
      orb.addColorStop(0, `rgba(100,65,0,${0.04 * pulse})`);
      orb.addColorStop(1, 'transparent');
      ctx.fillStyle = orb;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(loop);
    };

    resize();
    loop();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />
      <div className="atm-orb atm-orb-1" />
      <div className="atm-orb atm-orb-2" />
      <div className="lex-grid" />
      <div className="vignette" />
    </>
  );
}
