const AGENTS = [
  { id:'#01', emoji:'⚖️',  name:'Direito Civil' },
  { id:'#02', emoji:'🔒', name:'Direito Penal' },
  { id:'#03', emoji:'👷', name:'Direito Trabalhista' },
  { id:'#04', emoji:'👨‍👩‍👧', name:'Direito de Família' },
  { id:'#05', emoji:'🛒', name:'Direito do Consumidor' },
  { id:'#06', emoji:'💰', name:'Direito Tributário' },
  { id:'#07', emoji:'🏢', name:'Direito Empresarial' },
  { id:'#08', emoji:'🏠', name:'Direito Imobiliário' },
  { id:'#09', emoji:'💻', name:'Direito Digital' },
  { id:'#10', emoji:'🏥', name:'Direito Previdenciário' },
  { id:'#11', emoji:'🌿', name:'Direito Ambiental' },
  { id:'#12', emoji:'📜', name:'Direito Constitucional' },
  { id:'#13', emoji:'❤️',  name:'Direito à Saúde' },
  { id:'#14', emoji:'🌐', name:'Direito Internacional' },
  { id:'#15', emoji:'🗳️', name:'Direito Eleitoral' },
  { id:'#16', emoji:'🌾', name:'Direito Agrário' },
];

export default function AgentsSection() {
  return (
    <section id="agentes" style={{
      padding: 'clamp(60px,8vw,120px) 28px',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>

        <div className="section-label" style={{ marginBottom: 18 }}>O Conselho Jurídico Quântico</div>
        <h2 className="t-display" style={{
          fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300,
          color: 'var(--t0)', marginBottom: 14,
          letterSpacing: '-.025em', lineHeight: 1.1,
        }}>
          Dezesseis especialistas.{' '}
          <br />
          <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>Um único veredicto.</span>
        </h2>
        <p style={{
          fontFamily: 'var(--f-display)', fontSize: '.9rem', color: 'var(--t3)',
          lineHeight: 1.75, maxWidth: 540, margin: '0 auto 48px',
        }}>
          Cada agente é treinado exclusivamente na sua área do direito brasileiro.
          Em paralelo, simultâneos — cada um analisa do ângulo que domina.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 10,
        }}>
          {AGENTS.map(a => (
            <div
              key={a.id}
              style={{
                background: 'var(--card)',
                border: '1px solid rgba(0,242,254,0.10)',
                borderRadius: 'var(--r-md)',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                transition: 'all .3s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--card-hover)';
                e.currentTarget.style.borderColor = 'rgba(0,242,254,0.20)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,242,254,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--card)';
                e.currentTarget.style.borderColor = 'rgba(0,242,254,0.10)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Barra lateral cyan */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                background: 'linear-gradient(180deg,#00f2fe,#4facfe)',
                opacity: .4,
              }} />

              <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{a.emoji}</span>
              <div>
                <div style={{
                  fontFamily: 'var(--f-sans)', fontSize: '.77rem', fontWeight: 600,
                  color: 'var(--t1)', lineHeight: 1.3,
                }}>
                  {a.name}
                </div>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: '.55rem', color: 'var(--t4)',
                  letterSpacing: '.09em', marginTop: 3,
                }}>
                  ESPECIALISTA {a.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
