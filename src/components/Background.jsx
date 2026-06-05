import { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;
    const N = 80, MAX_D = 150;

    class P {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.r  = Math.random() * 1.5 + 0.5;
        this.a  = Math.random() * 0.35 + 0.05;
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

    let scanY = 0;
    const loop = () => {
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.hypot(dx, dy);
          if (d < MAX_D) {
            ctx.strokeStyle = `rgba(185,28,28,${(1 - d / MAX_D) * 0.07})`;
            ctx.lineWidth   = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(185,28,28,${p.a})`;
        ctx.fill();
        p.move();
      }

      scanY = (scanY + 0.4) % H;
      const g = ctx.createLinearGradient(0, scanY - 18, 0, scanY + 18);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.5, 'rgba(185,28,28,0.15)');
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, scanY - 18, W, 36);

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
