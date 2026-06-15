import { ArrowRight } from 'lucide-react';

export default function CtaFinal() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section style={{
      position: 'relative', overflow: 'hidden',
      padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,60px)',
      zIndex: 1, textAlign: 'center',
      background: 'radial-gradient(ellipse 800px 600px at 50% 50%, rgba(0,242,254,0.04) 0%, transparent 70%)',
    }}>
      <div style={{
        position: 'absolute', inset: 0, borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(180deg, var(--void), var(--abyss))', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 480, height: 480, borderRadius: '50%', border: '1px solid rgba(0,242,254,0.06)',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(79,172,254,0.05)',
        pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
        <div className="section-label" style={{ marginBottom: 18, display: 'inline-flex', justifyContent: 'center' }}>
          O Momento é Agora
        </div>
        <h2 className="t-display" style={{
          fontSize: 'clamp(2.4rem,5vw,4rem)', fontWeight: 300, color: 'var(--t0)',
          lineHeight: 1.1, letterSpacing: '-.025em', marginBottom: 8,
        }}>
          Pare de navegar no escuro.
        </h2>
        <h2 style={{
          fontSize: 'clamp(2.4rem,5vw,4rem)', fontWeight: 600, fontStyle: 'italic',
          lineHeight: 1.1, letterSpacing: '-.025em', marginBottom: 24,
          background: 'var(--g-quantum)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          Descubra sua verdade jurídica.
        </h2>
        <p style={{
          fontFamily: 'var(--f-display)', fontSize: '.98rem', color: 'var(--t3)',
          lineHeight: 1.8, marginBottom: 36,
        }}>
          Em menos de 3 minutos você vai saber o que nenhum amigo pode te dizer,
          o que um advogado cobra R$500 por hora para analisar — e o que pode
          mudar completamente a sua estratégia.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <button
            className="btn btn-cobalt-ultra btn-lg"
            onClick={() => scrollTo('analise')}
            style={{ fontSize: '.9rem', padding: '18px 44px' }}
          >
            Analisar Meu Caso Agora — Grátis <ArrowRight size={15}/>
          </button>
        </div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--t4)', letterSpacing: '.1em' }}>
          Sem cadastro · Resultado em 3 minutos · 100% gratuito para começar
        </div>
      </div>
    </section>
  );
}
