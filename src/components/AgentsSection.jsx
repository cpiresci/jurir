import { AGENT_AREAS } from '../lib/constants';

export default function AgentsSection() {
  return (
    <section id="agentes" style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, marginBottom: 12 }}>
            O Conselho de 16 Agentes
          </h2>
          <p style={{ color: 'var(--n4)', fontSize: '.9rem' }}>
            Cada agente é um especialista dedicado à sua área do Direito brasileiro.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12, marginBottom: 40,
        }}>
          {AGENT_AREAS.map(({ id, area, icon }) => (
            <div
              key={id}
              style={{
                background: 'var(--surface)', border: '1px solid var(--bn)',
                borderRadius: 'var(--r-md)', padding: '16px',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'border-color .25s, transform .2s',
                cursor: 'default',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--br)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bn)'; e.currentTarget.style.transform = 'none'; }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--n1)', lineHeight: 1.3 }}>{area}</div>
                <div style={{ fontSize: '.68rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>{id}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Special agents */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 16 }}>
          <SpecialAgent
            icon="⚔️"
            title="Advogado do Diabo"
            sub="Contraditório Obrigatório"
            desc="Apresenta todos os argumentos contrários ao caso. Nenhuma decisão sem o contraditório completo."
            color="var(--r3)"
          />
          <SpecialAgent
            icon="⚖️"
            title="Juiz IA Quantum"
            sub="Veredicto Final"
            desc="Pondera todos os 16 pareceres + contraditório e prolata o veredicto jurídico definitivo com JURIR Score."
            color="var(--g4)"
          />
        </div>
      </div>
    </section>
  );
}

function SpecialAgent({ icon, title, sub, desc, color }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--surface), var(--lift))',
      border: `1px solid ${color}30`,
      borderRadius: 'var(--r-lg)', padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
      }}/>
      <div style={{ fontSize: '1.8rem', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: '.72rem', color, fontFamily: 'var(--f-mono)', letterSpacing: '.1em', marginBottom: 10, textTransform: 'uppercase' }}>{sub}</div>
      <p style={{ fontSize: '.85rem', color: 'var(--n4)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}
