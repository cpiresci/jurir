const PAINS = [
  {
    icon: '😰',
    title: '"Meu advogado disse que tenho razão, mas não sei se posso confiar"',
    desc: 'A segunda opinião imparcial que você precisa — sem custo de consulta.',
  },
  {
    icon: '⏳',
    title: '"Já faz anos e o processo ainda não acabou"',
    desc: 'Entenda agora se vale a pena continuar ou buscar um acordo.',
  },
  {
    icon: '💸',
    title: '"Não sei se tenho dinheiro para bancar um processo longo"',
    desc: 'Calcule o risco real antes de comprometer seus recursos financeiros.',
  },
  {
    icon: '🤷',
    title: '"A empresa me ignorou — não sei quais são meus direitos"',
    desc: '16 especialistas identificam suas garantias legais em minutos.',
  },
];

function PainCard({ p }) {
  return (
    <div
      style={{
        background: 'rgba(239,68,68,0.04)',
        border: '1px solid rgba(239,68,68,0.12)',
        borderRadius: 'var(--r-lg)',
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        transition: 'all .3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'rgba(239,68,68,0.07)';
        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.20)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'rgba(239,68,68,0.04)';
        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.12)';
      }}
    >
      <div style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 1 }}>{p.icon}</div>
      <div>
        <div style={{
          fontFamily: 'var(--f-sans)', fontSize: '.85rem', fontWeight: 600,
          color: 'var(--t0)', marginBottom: 5, lineHeight: 1.45,
        }}>
          {p.title}
        </div>
        <div style={{
          fontFamily: 'var(--f-display)', fontSize: '.82rem', color: 'var(--t3)', lineHeight: 1.6,
        }}>
          {p.desc}
        </div>
      </div>
    </div>
  );
}

export default function PainSection() {
  return (
    <section style={{
      padding: 'clamp(60px,8vw,110px) 28px',
      background: 'linear-gradient(180deg, var(--void) 0%, var(--abyss) 100%)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="pain-grid-responsive" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,4vw,64px)', alignItems: 'center',
        }}>
          <div>
            <div className="section-label" style={{ marginBottom: 18 }}>O Problema Real</div>
            <h2 className="t-display" style={{
              fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300,
              color: 'var(--t0)', marginBottom: 14,
              letterSpacing: '-.025em', lineHeight: 1.1,
            }}>
              Por que tantos{' '}
              <br/>
              <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>processos são perdidos</span>
            </h2>
            <p style={{
              fontFamily: 'var(--f-display)', fontSize: '.9rem', color: 'var(--t3)',
              lineHeight: 1.8, maxWidth: 480, marginBottom: 18,
            }}>
              A maioria das pessoas entra em batalhas judiciais no escuro — sem saber
              o peso dos seus argumentos, as falhas da sua tese ou o que o lado
              oposto vai usar contra você.
            </p>
            <p style={{
              fontFamily: 'var(--f-display)', fontSize: '.9rem', color: 'var(--t3)',
              lineHeight: 1.8, maxWidth: 480,
            }}>
              O resultado? Processos que poderiam ser ganhos são perdidos por falta
              de estratégia. E processos sem fundamento drenam tempo e dinheiro por anos.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PAINS.map((p, i) => <PainCard key={i} p={p} />)}
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .pain-grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
