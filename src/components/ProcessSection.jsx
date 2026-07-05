const STEPS = [
  {
    num: '01',
    emoji: '📋',
    title: 'Caso Submetido',
    desc: 'Seu caso é processado, classificado por área e distribuído simultaneamente aos 16 agentes do Conselho.',
  },
  {
    num: '02',
    emoji: '⚡',
    title: '16 Análises em Paralelo',
    desc: 'Cada especialista analisa de forma independente: jurisprudência, legislação vigente e probabilidade de êxito.',
  },
  {
    num: '03',
    emoji: '⚔️',
    title: 'Advogado do Diabo',
    desc: 'O contraditório é apresentado com máxima rigorosidade — fraquezas, riscos e argumentos adversos à sua tese.',
  },
  {
    num: '04',
    emoji: '🏛️',
    title: 'Juiz IA Quantum + Score',
    desc: 'Deliberação final com todo o material. Prolata o veredicto e determina o JURIR Score dimensional do seu caso.',
  },
];

function ProcessCard({ step }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid rgba(0,242,254,0.10)',
        borderRadius: 'var(--r-lg)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
        transition: 'all .3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--card-hover)';
        e.currentTarget.style.borderColor = 'rgba(0,242,254,0.20)';
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,242,254,0.2), 0 8px 48px rgba(0,0,0,0.7), 0 0 60px rgba(0,242,254,0.10)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--card)';
        e.currentTarget.style.borderColor = 'rgba(0,242,254,0.10)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Circle com número */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'rgba(0,242,254,0.06)',
        border: '1px solid rgba(0,242,254,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 'var(--fs-xl)', marginBottom: 16,
        position: 'relative',
        boxShadow: '0 0 0 6px rgba(0,242,254,0.03)',
        flexShrink: 0,
      }}>
        {step.emoji}
        {/* Badge número */}
        <div style={{
          position: 'absolute', top: -5, right: -5,
          width: 19, height: 19, borderRadius: '50%',
          background: 'linear-gradient(135deg,#00f2fe,#4facfe)',
          fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', fontWeight: 700,
          color: '#050507',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {step.num}
        </div>
      </div>

      <h3 style={{
        fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-sm)', fontWeight: 700,
        color: 'var(--t0)', marginBottom: 9, letterSpacing: '.01em',
      }}>
        {step.title}
      </h3>
      <p style={{
        fontFamily: 'var(--f-display)', fontSize: 'var(--fs-xs)', color: 'var(--t3)',
        lineHeight: 1.65, fontWeight: 400,
      }}>
        {step.desc}
      </p>
    </div>
  );
}

function Connector() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', paddingTop: 40, flexShrink: 0,
    }}>
      <div style={{ width: 24, height: 1, background: 'rgba(0,242,254,0.20)' }} />
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(0,242,254,0.40)', flexShrink: 0 }} />
      <div style={{ width: 24, height: 1, background: 'rgba(0,242,254,0.20)' }} />
    </div>
  );
}

export default function ProcessSection() {
  return (
    <section style={{
      padding: 'clamp(60px,8vw,100px) 28px',
      background: 'var(--abyss)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>

        <div className="section-label" style={{ marginBottom: 18 }}>Processo de Análise por IA</div>
        <h2 className="t-display" style={{
          fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300,
          color: 'var(--t0)', marginBottom: 14,
          letterSpacing: '-.025em', lineHeight: 1.1,
        }}>
          Como o tribunal{' '}
          <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>funciona</span>
        </h2>
        <p style={{
          fontFamily: 'var(--f-display)', fontSize: 'var(--fs-base)', color: 'var(--t3)',
          lineHeight: 1.75, maxWidth: 540, margin: '0 auto 56px',
        }}>
          Quatro etapas que transformam a descrição do seu caso em um veredicto
          técnico preciso, com contraditório real e score dimensional.
        </p>

        {/* Desktop: flex com conectores */}
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 0,
        }}
          className="process-grid-responsive"
        >
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'stretch', flex: 1, minWidth: 0 }}>
              <div style={{ flex: 1 }}>
                <ProcessCard step={step} />
              </div>
              {i < STEPS.length - 1 && <Connector />}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .process-grid-responsive {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .process-grid-responsive > div {
            flex: none !important;
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
