import { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let t = 0;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Custom cursor
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cursor-dot';
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -100, my = -100;
    let rx = -100, ry = -100;
    const onMove = e => { mx = e.clientX; my = e.clientY; };
    const onDown = () => ring.classList.add('active');
    const onUp   = () => ring.classList.remove('active');
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseup',   onUp);

    const draw = () => {
      // Lerp ring
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      t += 0.004;

      // Subtle gradient orbs — cold blue tones
      const orbs = [
        { x: 0.15, y: 0.22, r: 0.38, c: 'rgba(20,114,217,0.055)' },
        { x: 0.82, y: 0.12, r: 0.32, c: 'rgba(43,138,245,0.04)' },
        { x: 0.55, y: 0.78, r: 0.42, c: 'rgba(11,79,160,0.045)' },
        { x: 0.92, y: 0.65, r: 0.28, c: 'rgba(90,174,255,0.03)' },
      ];

      orbs.forEach((o, i) => {
        const ox = W * (o.x + Math.sin(t + i * 1.5) * 0.04);
        const oy = H * (o.y + Math.cos(t * 0.7 + i) * 0.04);
        const rr = Math.min(W, H) * (o.r + Math.sin(t * 0.5 + i) * 0.02);
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, rr);
        g.addColorStop(0, o.c);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // Fine grid — very subtle
      ctx.strokeStyle = 'rgba(180,188,210,0.09)';
      ctx.lineWidth = 0.5;
      const gSize = 52;
      for (let x = 0; x < W; x += gSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Top horizontal light beam
      const beamY = 64;
      const beamGrad = ctx.createLinearGradient(0, beamY, W, beamY);
      beamGrad.addColorStop(0, 'transparent');
      beamGrad.addColorStop(0.25, `rgba(20,114,217,${0.06 + Math.sin(t) * 0.015})`);
      beamGrad.addColorStop(0.55, `rgba(43,138,245,${0.08 + Math.cos(t * 0.8) * 0.015})`);
      beamGrad.addColorStop(0.80, `rgba(20,114,217,${0.05 + Math.sin(t * 1.2) * 0.01})`);
      beamGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, beamY - 1, W, 2);

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseup',   onUp);
      dot.remove();
      ring.remove();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
