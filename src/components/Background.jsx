export default function Background() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(185,28,28,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(202,138,4,0.03) 0%, transparent 50%)',
    }}/>
  );
}
