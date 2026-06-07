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
      rx += (mx - rx) * 0.10;
      ry += (my - ry) * 0.10;
      dot.style.left  = mx + 'px';
      dot.style.top   = my + 'px';
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';

      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      t += 0.0032;

      // ── AMBIENT ORBS — quantum judicial atmosphere ──
      const orbs = [
        { x: 0.12, y: 0.18, r: 0.42, c1: 'rgba(20,114,217,0.065)', c2: 'rgba(43,138,245,0.02)' },
        { x: 0.85, y: 0.10, r: 0.35, c1: 'rgba(43,138,245,0.050)', c2: 'rgba(90,174,255,0.01)' },
        { x: 0.52, y: 0.82, r: 0.48, c1: 'rgba(11,79,160,0.055)',  c2: 'rgba(20,114,217,0.01)' },
        { x: 0.90, y: 0.68, r: 0.30, c1: 'rgba(139,92,246,0.035)', c2: 'transparent' },
        { x: 0.25, y: 0.75, r: 0.28, c1: 'rgba(20,114,217,0.040)', c2: 'transparent' },
        { x: 0.72, y: 0.38, r: 0.22, c1: 'rgba(90,174,255,0.030)', c2: 'transparent' },
      ];

      orbs.forEach((o, i) => {
        const ox = W * (o.x + Math.sin(t + i * 1.3) * 0.045);
        const oy = H * (o.y + Math.cos(t * 0.65 + i * 0.8) * 0.045);
        const rr = Math.min(W, H) * (o.r + Math.sin(t * 0.45 + i) * 0.025);
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, rr);
        g.addColorStop(0, o.c1);
        g.addColorStop(0.5, o.c2 !== 'transparent' ? o.c2 : 'rgba(20,114,217,0.008)');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      });

      // ── FINE GRID — tribunal chamber ──
      ctx.strokeStyle = 'rgba(180,188,210,0.075)';
      ctx.lineWidth = 0.5;
      const gSize = 56;
      for (let x = 0; x < W; x += gSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ── QUANTUM DOTS at intersections ──
      const dotAlpha = 0.06 + Math.sin(t * 2) * 0.02;
      ctx.fillStyle = `rgba(20,114,217,${dotAlpha})`;
      for (let x = gSize; x < W; x += gSize) {
        for (let y = gSize; y < H; y += gSize) {
          if (Math.random() > 0.998) {
            ctx.fillStyle = `rgba(43,138,245,${0.25 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(180,188,210,${dotAlpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // ── TOP QUANTUM BEAM (navbar line) ──
      const beamY = 64;
      const beamAnim = 0.07 + Math.sin(t * 1.4) * 0.022;
      const bGrad = ctx.createLinearGradient(0, beamY, W, beamY);
      bGrad.addColorStop(0, 'transparent');
      bGrad.addColorStop(0.20, `rgba(20,114,217,${beamAnim})`);
      bGrad.addColorStop(0.45, `rgba(43,138,245,${beamAnim + 0.02})`);
      bGrad.addColorStop(0.70, `rgba(139,92,246,${beamAnim * 0.7})`);
      bGrad.addColorStop(0.88, `rgba(20,114,217,${beamAnim * 0.5})`);
      bGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = bGrad;
      ctx.fillRect(0, beamY - 1, W, 1.5);

      // ── DIAGONAL LIGHT RAYS — subtle, luxurious ──
      const rayAlpha = 0.012 + Math.sin(t * 0.8) * 0.004;
      ctx.save();
      for (let r = 0; r < 3; r++) {
        const rayX = W * (0.2 + r * 0.3 + Math.sin(t * 0.3 + r) * 0.05);
        const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + H * 0.4, H);
        rayGrad.addColorStop(0, `rgba(20,114,217,${rayAlpha + r * 0.003})`);
        rayGrad.addColorStop(0.5, `rgba(43,138,245,${rayAlpha * 0.5})`);
        rayGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = rayGrad;
        ctx.beginPath();
        ctx.moveTo(rayX - 30, 0);
        ctx.lineTo(rayX + 30, 0);
        ctx.lineTo(rayX + 30 + H * 0.45, H);
        ctx.lineTo(rayX - 30 + H * 0.35, H);
        ctx.fill();
      }
      ctx.restore();

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
