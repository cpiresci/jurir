const TESTIMONIALS = [
  {
    score: 91, verdict: 'FORTEMENTE FAVORÁVEL',
    text: '"Meu caso trabalhista parecia perdido. O JURIR apontou uma irregularidade na CTPS que meu advogado não havia visto. Com esse dado, renegociamos o acordo — recebi 3x mais do que a oferta inicial."',
    name: 'Marcos A.', role: 'ANALISTA LOGÍSTICO · SÃO PAULO', initial: 'M',
  },
  {
    score: 78, verdict: 'FAVORÁVEL',
    text: '"O Advogado do Diabo me mostrou que minha ação de danos morais tinha um ponto fraco fatal na documentação. Parei antes de gastar R$8.000 em honorários em um processo que perderia."',
    name: 'Carla M.', role: 'EMPRESÁRIA · CURITIBA', initial: 'C',
  },
  {
    score: 84, verdict: 'FORTEMENTE FAVORÁVEL',
    text: '"Empresa recusou estorno de R$4.200. Em 4 minutos o JURIR gerou a petição ao Procon com os artigos corretos do CDC. Recebi o reembolso em 15 dias sem advogado."',
    name: 'Rafael S.', role: 'ARQUITETO · BELO HORIZONTE', initial: 'R',
  },
];

const AUTHORITY = [
  { val: '16',   label: 'Agentes Jurídicos\nEspecializados', color: 'var(--cy1)' },
  { val: '97%',  label: 'Taxa de Satisfação\ndos Usuários',  color: 'var(--jade2)' },
  { val: '3min', label: 'Tempo Médio\nde Análise',           color: 'var(--co8)' },
  { val: '100%', label: 'Contraditório\nGarantido',          color: 'var(--am5)' },
];

function TestimonialCard({ t }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid rgba(0,242,254,0.10)',
      borderRadius: 'var(--r-lg)', padding: 28,
      position: 'relative', overflow: 'hidden', transition: 'all .3s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--card-hover)'; e.currentTarget.style.borderColor = 'rgba(0,242,254,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)'; e.currentTarget.style.borderColor = 'rgba(0,242,254,0.10)'; }}
    >
      <div style={{
        position: 'absolute', top: -8, left: 18, fontFamily: 'var(--f-display)',
        fontSize: 'var(--fs-8xl)', color: 'rgba(0,242,254,0.08)', lineHeight: 1, pointerEvents: 'none',
      }}>&ldquo;</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, position: 'relative' }}>
        <div style={{
          fontFamily: 'var(--f-display)', fontSize: 'var(--fs-2xl)', fontWeight: 700,
          background: 'var(--g-quantum)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{t.score}</div>
        <span style={{
          fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--jade2)',
          letterSpacing: '.12em', background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.2)', borderRadius: 999, padding: '2px 9px',
        }}>{t.verdict}</span>
      </div>
      <div style={{
        fontFamily: 'var(--f-display)', fontSize: 'var(--fs-base)', color: 'var(--t2)',
        lineHeight: 1.75, marginBottom: 18, fontStyle: 'italic', position: 'relative',
      }}>{t.text}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: 'var(--g-quantum)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--fs-sm)',
          color: 'var(--void)', fontFamily: 'var(--f-sans)', fontWeight: 700, flexShrink: 0,
        }}>{t.initial}</div>
        <div>
          <div style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--t1)' }}>{t.name}</div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t4)', letterSpacing: '.07em' }}>{t.role}</div>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section id="depoimentos" style={{
      padding: 'clamp(60px,8vw,120px) 28px', background: 'var(--abyss)',
      borderTop: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div className="section-label" style={{ marginBottom: 18 }}>Resultados Reais</div>
        <h2 className="t-display" style={{
          fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300, color: 'var(--t0)',
          marginBottom: 14, letterSpacing: '-.025em', lineHeight: 1.1,
        }}>
          O que acontece quando você{' '}
          <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>sabe a verdade</span>
        </h2>
        <p style={{
          fontFamily: 'var(--f-display)', fontSize: 'var(--fs-base)', color: 'var(--t3)',
          lineHeight: 1.75, maxWidth: 540, margin: '0 auto 48px',
        }}>
          Casos reais de usuários que tomaram decisões mais inteligentes com o JURIR Score.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} t={t} />)}
        </div>
        <div style={{
          marginTop: 48, background: 'var(--card)', border: '1px solid rgba(0,242,254,0.10)',
          borderRadius: 'var(--r-lg)', padding: '28px 36px',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24,
        }} className="authority-grid-responsive">
          {AUTHORITY.map((a, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 clamp(8px,2vw,16px)', position: 'relative' }}>
              {i < AUTHORITY.length - 1 && (
                <div style={{
                  position: 'absolute', right: 0, top: '10%', bottom: '10%', width: 1,
                  background: 'rgba(0,242,254,0.08)',
                }} className="authority-divider"/>
              )}
              <div style={{
                fontFamily: 'var(--f-display)', fontSize: 'clamp(1.5rem,3.5vw,2.2rem)', fontWeight: 700,
                color: a.color, lineHeight: 1, marginBottom: 6,
              }}>{a.val}</div>
              <div style={{
                fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t4)',
                letterSpacing: '.1em', lineHeight: 1.5, whiteSpace: 'pre-line',
              }}>{a.label}</div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          .authority-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
          .authority-divider { display: none !important; }
        }
      `}</style>
    </section>
  );
}
