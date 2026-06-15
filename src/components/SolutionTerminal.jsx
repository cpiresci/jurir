import { useEffect, useRef, useState } from 'react';

const STEPS = [
  {
    delay: 0,
    agent: 'AGENTE #03 · DIREITO TRABALHISTA',
    text: 'Art. 477 da CLT confirma obrigatoriedade de pagamento das verbas rescisórias em caso de dispensa sem justa causa. Prazo: até 10 dias corridos da rescisão. A empresa está em mora — aplicável multa do Art. 477 §8º.',
    badge: { label: 'FAVORÁVEL AO AUTOR', kind: 'jade' },
  },
  {
    delay: 600,
    agent: 'AGENTE #01 · DIREITO CIVIL · DANOS MORAIS',
    text: 'Considerando o contexto da demissão relatado — exposição pública do funcionário, comunicação vexatória — há fundamento para pleito de danos morais (Art. 186 CC). Jurisprudência TST favorável para casos similares: ticket médio de 3x salário.',
    badge: { label: 'RECOMENDADO INCLUIR', kind: 'jade' },
  },
  {
    delay: 1300,
    agent: '⚔️ ADVOGADO DO DIABO · CONTRADITÓRIO',
    text: 'ATENÇÃO: A ausência de documentação comprobatória da comunicação vexatória fragiliza o pleito de danos morais. Sem testemunhas ou registros, o réu pode sustentar que a demissão foi procedimento padrão. Risco: improcedência parcial.',
    badge: { label: 'PONTO CRÍTICO DE VULNERABILIDADE', kind: 'red' },
  },
  {
    delay: 2100,
    agent: '🏛️ JUIZ IA QUANTUM · DELIBERAÇÃO FINAL',
    text: 'Análise conclusiva: O mérito principal (verbas rescisórias) é incontestável e de alta probabilidade de procedência. O pleito de danos morais possui mérito, mas requer fortalecimento probatório. Recomendo: ação conjunta com prioridade nas verbas rescisórias.',
    badge: { label: 'VEREDICTO EMITIDO', kind: 'cy' },
  },
];

const BADGE_STYLES = {
  jade: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.2)', color: 'var(--jade2)' },
  red:  { bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.18)', color: '#f87171' },
  cy:   { bg: 'rgba(0,242,254,0.04)',  border: 'rgba(0,242,254,0.10)', color: 'var(--cy1)' },
};

function Badge({ badge }) {
  const s = BADGE_STYLES[badge.kind];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6,
      padding: '2px 9px', background: s.bg, border: `1px solid ${s.border}`,
      borderRadius: 999, fontFamily: 'var(--f-mono)', fontSize: '.52rem',
      color: s.color, letterSpacing: '.1em',
    }}>
      {badge.label}
    </span>
  );
}

export default function SolutionTerminal() {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [scoreVisible, setScoreVisible] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        setStarted(true);
        STEPS.forEach((s, i) => {
          setTimeout(() => setVisibleSteps(v => [...v, i]), s.delay);
        });
        setTimeout(() => {
          setScoreVisible(true);
          const dur = 1600;
          const t0 = performance.now();
          const run = (now) => {
            const p = Math.min((now - t0) / dur, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setScore(Math.round(e * 89));
            if (p < 1) requestAnimationFrame(run);
          };
          requestAnimationFrame(run);
        }, 3200);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [started]);

  return (
    <div ref={ref} style={{
      maxWidth: 860, margin: '48px auto 0',
      background: 'rgba(5,5,7,0.9)', border: '1px solid rgba(0,242,254,0.10)',
      borderRadius: 'var(--r-xl)', boxShadow: 'var(--shadow-card)', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px',
        background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: .7 }}/>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', opacity: .7 }}/>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', opacity: .7 }}/>
        </div>
        <span style={{
          fontFamily: 'var(--f-mono)', fontSize: '.58rem', color: 'var(--t4)',
          letterSpacing: '.14em', margin: '0 auto', textAlign: 'center',
        }}>
          ANÁLISE EM EXECUÇÃO — CASO TRABALHISTA · REF #JQ-2024-0847
        </span>
      </div>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {STEPS.map((s, i) => {
          const visible = visibleSteps.includes(i);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 16,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-12px)',
              transition: 'all .5s cubic-bezier(.19,1,.22,1)',
            }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--cy1)', width: 22, flexShrink: 0, paddingTop: 3 }}>→</span>
              <div style={{ width: 2, alignSelf: 'stretch', background: 'linear-gradient(180deg,var(--cy1),var(--co8))', borderRadius: 2, flexShrink: 0, opacity: .3 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.66rem', color: 'var(--co8)', letterSpacing: '.09em', marginBottom: 4 }}>
                  {s.agent}
                </div>
                <div style={{ fontFamily: 'var(--f-sans)', fontSize: '.82rem', color: 'var(--t2)', lineHeight: 1.6 }}>
                  {s.text}
                </div>
                <Badge badge={s.badge}/>
              </div>
            </div>
          );
        })}

        <div style={{
          marginTop: 8, padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(0,242,254,0.04), rgba(79,172,254,0.03))',
          border: '1px solid rgba(0,242,254,0.10)', borderRadius: 'var(--r-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
          opacity: scoreVisible ? 1 : 0,
          transform: scoreVisible ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all .6s .2s',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--t4)', letterSpacing: '.18em', marginBottom: 4 }}>
              JURIR SCORE · ANÁLISE #JQ-2024-0847
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.1rem', fontWeight: 600, fontStyle: 'italic', color: 'var(--jade2)', marginBottom: 4 }}>
              Fortemente Favorável ao Autor
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.58rem', color: 'var(--t4)', letterSpacing: '.09em' }}>
              Verbas rescisórias: 97% · Danos morais: 68% · Estimativa: 3-8 meses
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--f-display)', fontSize: '2.6rem', fontWeight: 700, lineHeight: 1,
              background: 'var(--g-quantum)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {score}
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.52rem', color: 'var(--t4)', letterSpacing: '.12em' }}>/100</div>
          </div>
        </div>
      </div>
    </div>
  );
}
