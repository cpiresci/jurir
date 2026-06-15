export default function Background() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      background: [
        'radial-gradient(ellipse 900px 600px at 5% 15%, rgba(0,242,254,0.045) 0%, transparent 55%)',
        'radial-gradient(ellipse 700px 500px at 95% 85%, rgba(79,172,254,0.055) 0%, transparent 55%)',
        'radial-gradient(ellipse 500px 350px at 50% 50%, rgba(0,242,254,0.02) 0%, transparent 65%)',
        'radial-gradient(ellipse 300px 200px at 20% 70%, rgba(139,92,246,0.03) 0%, transparent 55%)',
      ].join(', '),
    }}/>
  );
}
