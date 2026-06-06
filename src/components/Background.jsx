import { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef(null);
  const dotRef    = useRef(null);
  const ringRef   = useRef(null);
  const mouse     = useRef({ x: -200, y: -200 });
  const ringPos   = useRef({ x: -200, y: -200 });

  // ── Custom cursor ──
  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top  = e.clientY + 'px';
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    let rafId;
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      ringPos.current.x = lerp(ringPos.current.x, mouse.current.x, 0.12);
      ringPos.current.y = lerp(ringPos.current.y, mouse.current.y, 0.12);
      if (ringRef.current) {
        ringRef.current.style.left = ringPos.current.x + 'px';
        ringRef.current.style.top  = ringPos.current.y + 'px';
      }
      rafId = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ── Neural particle canvas ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;
    const N = 90, MAX_D = 140;

    class P {
      constructor() { this.reset(); }
      reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.r  = Math.random() * 1.4 + 0.4;
        this.a  = Math.random() * 0.28 + 0.04;
        // alternating gold / crimson particles
        this.type = Math.random() > 0.6 ? 'gold' : 'cr';
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

      // connections
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.hypot(dx, dy);
          if (d < MAX_D) {
            const alpha = (1 - d / MAX_D) * 0.055;
            // mix gold and crimson lines
            const sameType = particles[i].type === particles[j].type;
            ctx.strokeStyle = sameType && particles[i].type === 'gold'
              ? `rgba(196,137,10,${alpha})`
              : `rgba(158,21,21,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 'gold'
          ? `rgba(228,168,36,${p.a})`
          : `rgba(192,30,30,${p.a})`;
        ctx.fill();
        p.move();
      }

      // scanner line — slow gold sweep
      scanY = (scanY + 0.3) % H;
      const g = ctx.createLinearGradient(0, scanY - 22, 0, scanY + 22);
      g.addColorStop(0,   'transparent');
      g.addColorStop(0.5, 'rgba(228,168,36,0.06)');
      g.addColorStop(1,   'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, scanY - 22, W, 44);

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
      {/* Cursor elements */}
      <div className="cursor-dot"  ref={dotRef}  />
      <div className="cursor-ring" ref={ringRef} />

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
      />

      {/* Atmospheric orbs */}
      <div className="atm-orb atm-orb-1" />
      <div className="atm-orb atm-orb-2" />
      <div className="atm-orb atm-orb-3" />

      {/* Hex grid */}
      <div className="hex-grid" />

      {/* Scales of justice watermark */}
      <div className="lex-watermark" />

      {/* Edge vignette */}
      <div className="vignette" />
    </>
  );
}
