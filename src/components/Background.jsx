import { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;
    const N = 55;
    const MAX_D = 160;

    class P {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.18;
        this.vy = (Math.random() - 0.5) * 0.18;
        this.r  = Math.random() * 1.2 + 0.2;
        this.a  = Math.random() * 0.2 + 0.03;
        this.isCrimson = Math.random() < 0.35;
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

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.hypot(dx, dy);
          if (d < MAX_D) {
            const alpha = (1 - d / MAX_D) * 0.04;
            ctx.strokeStyle = particles[i].isCrimson || particles[j].isCrimson
              ? `rgba(255,0,77,${alpha * 1.6})`
              : `rgba(200,200,230,${alpha * 0.5})`;
            ctx.lineWidth = 0.5;
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
        ctx.fillStyle = p.isCrimson
          ? `rgba(255,0,77,${p.a})`
          : `rgba(200,200,230,${p.a * 0.5})`;
        ctx.fill();
        p.move();
      }
      raf = requestAnimationFrame(loop);
    };

    resize();
    loop();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div className="bg-layer bg-grid" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
      <div className="bg-layer bg-vignette" />
      <div className="bg-beam" />
    </>
  );
}
