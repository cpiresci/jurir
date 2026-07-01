import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import { useStore } from '../store';

function CountUp({ target, suffix = '' }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const dur = 2000;
    const start = performance.now();
    const num = parseFloat(target);
    if (isNaN(num)) { setVal(target); return; }
    const run = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(ease * num));
      if (t < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }, [target]);
  return <>{isNaN(parseFloat(target)) ? target : val}{suffix}</>;
}

const STATS = [
  { val: '16',  suffix: '',    label: 'Agentes\nEspecialistas', icon: '⚖️',  color: 'var(--co7)' },
  { val: '3',   suffix: 'min', label: 'Análise\nCompleta',      icon: '⚡',  color: 'var(--jade2)' },
  { val: '100', suffix: '%',   label: 'Contraditório\nReal',    icon: '🛡️', color: 'var(--am4)' },
  { val: '10',  suffix: '+',   label: 'Áreas do\nDireito',      icon: '📋',  color: 'var(--au6)' },
];

const AREAS = [
  'Direito Civil','Direito Penal','Direito Trabalhista',
  'Direito de Família','Direito Digital','Direito Tributário',
  'Direito Empresarial','Direito Constitucional',
  'Direito do Consumidor','Direito Previdenciário',
];

function ScoreRing({ size = 120, score = 87, visible }) {
  const R = (size / 2) - 10;
  const C = 2 * Math.PI * R;
  const [animScore, setAnimScore] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let start = null;
    const dur = 2600;
    const run = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / dur, 1);
      setAnimScore(Math.round((1 - Math.pow(1 - t, 3)) * score));
      if (t < 1) requestAnimationFrame(run);
    };
    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [visible, score]);
  const fill = C - (animScore / 100) * C;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block' }}>
      <defs>
        <filter id="rg-h" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="rgrad-h" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--co8)"/>
          <stop offset="50%" stopColor="var(--co7)"/>
          <stop offset="100%" stopColor="var(--am4)"/>
        </linearGradient>
      </defs>
      <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(0,242,254,0.10)" strokeWidth={8}/>
      <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="url(#rgrad-h)" strokeWidth={7}
        strokeLinecap="round" strokeDasharray={C} strokeDashoffset={fill}
        transform={`rotate(-90 ${size/2} ${size/2})`} filter="url(#rg-h)"
        style={{ transition:'stroke-dashoffset .04s linear' }}/>
      <text x="50%" y="44%" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily:'var(--f-display)', fontSize:size*0.26, fontWeight:700, fill:'var(--co7)' }}>
        {animScore}
      </text>
      <text x="50%" y="65%" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily:'var(--f-mono)', fontSize:size*0.09, fill:'var(--t3)', letterSpacing:'0.10em' }}>
        SCORE
      </text>
    </svg>
  );
}

const VERDICTS = [
  { area:'Trabalhista', result:'PROCEDENTE', score:84, color:'var(--jade2)' },
  { area:'Consumidor',  result:'FAVORÁVEL',  score:91, color:'var(--jade2)' },
  { area:'Civil',       result:'PARCIAL',    score:62, color:'var(--au6)'   },
  { area:'Previdência', result:'PROCEDENTE', score:77, color:'var(--jade2)' },
  { area:'Empresarial', result:'CONTESTADO', score:45, color:'var(--cr3)'   },
];

function scoreLabel(score) {
  return score >= 80 ? 'FORTEMENTE FAVORÁVEL'
    : score >= 65 ? 'FAVORÁVEL'
    : score >= 50 ? 'PARCIALMENTE FAVORÁVEL'
    : score >= 35 ? 'RISCO MODERADO'
    : 'ALTO RISCO';
}

function LiveFeed({ visible, verdict, show }) {
  const v = verdict;
  return (
    <div style={{ opacity: visible&&show?1:0, transition:'opacity .3s', display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
      <div style={{ width:8, height:8, borderRadius:'50%', background:v.color, boxShadow:`0 0 8px ${v.color}`, animation:'pulse 1.4s ease-in-out infinite', flexShrink:0 }}/>
      <span style={{ fontFamily:'var(--f-mono)', fontSize:'.72rem', color:'var(--t2)', letterSpacing:'.06em', fontWeight:500 }}>{v.area}</span>
      <span style={{ fontFamily:'var(--f-mono)', fontSize:'.76rem', color:v.color, fontWeight:700, letterSpacing:'.06em' }}>{v.result}</span>
      <span style={{ fontFamily:'var(--f-mono)', fontSize:'.68rem', color:'var(--t3)', letterSpacing:'.06em' }}>{v.score}/100</span>
    </div>
  );
}

export default function Hero() {
  const { openModal } = useStore();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth' });
  const [visible, setVisible] = useState(false);
  const [activeArea, setActiveArea] = useState(0);
  const [feedIdx, setFeedIdx] = useState(0);
  const [feedShow, setFeedShow] = useState(true);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    const i = setInterval(() => setActiveArea(v => (v+1) % AREAS.length), 2400);
    return () => clearInterval(i);
  }, []);
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => {
      setFeedShow(false);
      setTimeout(() => { setFeedIdx(v => (v+1) % VERDICTS.length); setFeedShow(true); }, 300);
    }, 2800);
    return () => clearInterval(t);
  }, [visible]);
  const verdict = VERDICTS[feedIdx];

  return (
    <>
      <style>{`
        .hero-section {
          align-items: flex-start;
          justify-content: center;
          padding: clamp(88px, 11vh, 100px) 48px 24px;
          position: relative;
          overflow: hidden;
        }
        .hero-inner {
          max-width: 980px;
          width: 100%;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .hero-float { display: flex; }
        .hero-mobile-card { display: none; }
        .hero-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .hero-desktop-cards {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-bottom: clamp(20px, 3vw, 32px);
        }
        @media (max-width: 768px) {
          .hero-section { padding: 88px 20px 48px; }
          .hero-float { display: none !important; }
          .hero-mobile-card { display: flex !important; }
          .hero-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-desktop-cards { display: none !important; }
          .hero-trust-row { gap: 14px !important; }
        }
        @media (max-width: 420px) {
          .hero-section { padding: 80px 16px 40px; }
        }
      `}</style>

      <section className="hero-section">

        {/* Column lines */}
        {[0,'8%','8%',0].map((l,i) => (
          <div key={i} style={{
            position:'absolute', top:0, bottom:0, width:1,
            left: i<2 ? (i===0?0:'8%') : undefined,
            right: i>=2 ? (i===2?'8%':0) : undefined,
            background:'linear-gradient(180deg,transparent,rgba(0,242,254,0.12),rgba(139,92,246,0.06),transparent)',
            pointerEvents:'none',
          }}/>
        ))}

        {/* Area badge — desktop */}
        <div className="hero-float" style={{
          position:'absolute', top:96, right:'7%',
          background:'var(--bg-card)', border:'1px solid var(--b-cobalt)',
          borderRadius:'var(--r-md)', padding:'10px 18px',
          boxShadow:'var(--shadow-cobalt)', fontFamily:'var(--f-mono)', fontSize:'.67rem',
          color:'var(--co7)', letterSpacing:'.09em',
          opacity:visible?1:0, transition:'opacity .7s .6s',
          alignItems:'center', gap:9, pointerEvents:'none',
        }}>
          <span style={{ width:6,height:6,borderRadius:'50%',background:'var(--co7)',boxShadow:'0 0 8px rgba(20,114,217,0.6)',animation:'pulse 2s ease-in-out infinite',flexShrink:0 }}/>
          <span style={{ color:'var(--t3)',marginRight:2 }}>ÁREA ATIVA</span>
          <span style={{ color:'var(--co7)',fontWeight:600 }}>{AREAS[activeArea]}</span>
        </div>

        {/* Score ring — desktop */}
        <div className="hero-float" style={{
          position:'absolute', top:'clamp(120px, 14vh, 150px)', left:'2%',
          background:'var(--bg-card)', border:'1px solid var(--b-main)',
          borderRadius:'var(--r-lg)', padding:'22px 24px',
          boxShadow:'var(--shadow-float)',
          opacity:visible?1:0, transition:'opacity .7s .8s',
          pointerEvents:'none', flexDirection:'column', alignItems:'center', gap:10,
        }}>
          <ScoreRing size={110} score={verdict.score} visible={visible}/>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:2 }}>
            <span style={{ fontFamily:'var(--f-mono)',fontSize:'.54rem',color:'var(--t3)',letterSpacing:'.16em',textTransform:'uppercase' }}>JURIR SCORE</span>
            <span style={{ fontFamily:'var(--f-mono)',fontSize:'.5rem',color:verdict.color,letterSpacing:'.1em',transition:'color .3s' }}>{scoreLabel(verdict.score)}</span>
          </div>
        </div>

        {/* Live feed — desktop */}
        <div className="hero-float" style={{
          position:'absolute', bottom:'clamp(20px, 4vh, 40px)', right:'2%',
          background:'var(--bg-card)', border:'1px solid var(--b-main)',
          borderRadius:'var(--r-md)', padding:'16px 20px',
          boxShadow:'var(--shadow-float)',
          opacity:visible?1:0, transition:'opacity .7s 1.0s',
          pointerEvents:'none', minWidth:220,
          flexDirection:'column', gap:10,
        }}>
          <div style={{ fontFamily:'var(--f-mono)',fontSize:'.58rem',color:'var(--t3)',letterSpacing:'.18em',marginBottom:2 }}>TRIBUNAL AO VIVO</div>
          <LiveFeed visible={visible} verdict={verdict} show={feedShow}/>
        </div>

        {/* ── MAIN ── */}
        <div className="hero-inner">

          {/* Badge */}
          <div className="hero-badge fade-up" style={{ marginBottom:'clamp(14px,2.5vw,20px)', opacity:visible?1:0 }}>
            <Zap size={9} style={{ color:'var(--co7)' }}/>
            <span style={{ color:'var(--t2)' }}>Análise Jurídica por IA</span>
            <span style={{ width:3,height:3,borderRadius:'50%',background:'var(--t4)',flexShrink:0 }}/>
            <span style={{ color:'var(--co7)',fontWeight:600 }}>16 Agentes Especializados</span>
            <span style={{ width:3,height:3,borderRadius:'50%',background:'var(--t4)',flexShrink:0 }}/>
            <span style={{ color:'var(--am4)',fontWeight:500 }}>JURIR SCORE</span>
          </div>

          {/* Headline */}
          <h1 className="hero-title fade-up fade-up-1" style={{ marginBottom:'clamp(22px,4vw,36px)', opacity:visible?1:0 }}>
            <span style={{ display:'block', marginBottom:6 }}>Você tem chance</span>
            <span style={{
              display:'block',
              background:'linear-gradient(135deg,var(--co8) 0%,var(--co7) 40%,var(--am4) 100%)',
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
              fontStyle:'italic',
            }}>
              de ganhar?
            </span>
          </h1>

          {/* Subline */}
          <p className="fade-up fade-up-2" style={{
            fontSize:'clamp(1rem,2.4vw,1.12rem)', color:'var(--t1)',
            maxWidth:780, margin:'0 auto clamp(22px,3.5vw,32px)',
            lineHeight:1.8, opacity:visible?1:0,
            fontFamily:'var(--f-display)', fontWeight:400, letterSpacing:'.01em',
          }}>
            Cole seu caso. Em até 3 minutos, dezesseis agentes especializados analisam cada faceta
            do seu processo. O{' '}
            <em style={{ color:'var(--cr3)' }}>Advogado do Diabo</em> confronta. O{' '}
            <em style={{ color:'var(--co7)' }}>Juiz IA</em> prolata o veredicto — com JURIR Score.
          </p>

          {/* CTAs */}
          <div className="fade-up fade-up-3" style={{
            display:'flex', gap:'clamp(10px,2vw,14px)',
            justifyContent:'center', flexWrap:'wrap',
            marginBottom:'clamp(20px,3vw,28px)', opacity:visible?1:0,
          }}>
            <button className="btn btn-cobalt-ultra btn-lg" onClick={() => scrollTo('analise')}
              style={{ fontSize:'clamp(.86rem,2.5vw,.96rem)',padding:'clamp(13px,3vw,16px) clamp(26px,5vw,38px)' }}>
              Descobrir Minhas Chances <ArrowRight size={16}/>
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => openModal('register')}
              style={{ fontSize:'clamp(.86rem,2.5vw,.96rem)',padding:'clamp(13px,3vw,16px) clamp(26px,5vw,38px)' }}>
              Criar Conta Gratuita
            </button>
          </div>


          {/* Mobile score + live card */}
          <div className="hero-mobile-card" style={{
            marginBottom:32,
            background:'var(--bg-card)', border:'1px solid var(--b-cobalt)',
            borderRadius:'var(--r-lg)', padding:'20px 20px',
            boxShadow:'var(--shadow-cobalt)',
            alignItems:'center', gap:20,
            opacity:visible?1:0, transition:'opacity .7s .5s',
          }}>
            <div style={{ flexShrink:0 }}>
              <ScoreRing size={96} score={verdict.score} visible={visible}/>
            </div>
            <div style={{ textAlign:'left', flex:1 }}>
              <div style={{ fontFamily:'var(--f-mono)',fontSize:'.66rem',color:'var(--co7)',fontWeight:700,letterSpacing:'.1em',marginBottom:3 }}>JURIR SCORE</div>
              <div style={{ fontFamily:'var(--f-mono)',fontSize:'.6rem',color:verdict.color,letterSpacing:'.08em',marginBottom:14,transition:'color .3s' }}>{scoreLabel(verdict.score)}</div>
              <div style={{ fontFamily:'var(--f-mono)',fontSize:'.58rem',color:'var(--t3)',letterSpacing:'.14em',marginBottom:8 }}>TRIBUNAL AO VIVO</div>
              <LiveFeed visible={visible} verdict={verdict} show={feedShow}/>
            </div>
          </div>

          {/* Stats */}
          <div className="hero-stats-grid fade-up fade-up-3" style={{
            opacity:visible?1:0,
            gap:1, background:'var(--b-main)',
            borderRadius:'var(--r-lg)', overflow:'hidden',
            boxShadow:'var(--shadow-cobalt)',
            maxWidth: 860, margin: '0 auto',
            border:'1px solid var(--b-cobalt)',
          }}>
            {STATS.map((s,i) => (
              <div key={i} style={{
                background:'var(--bg-card)',
                padding:'clamp(18px,3vw,28px) clamp(10px,2vw,18px)',
                textAlign:'center', position:'relative',
              }}>
                <div style={{
                  position:'absolute',top:0,left:0,right:0,height:2,
                  background:`linear-gradient(90deg,transparent,${['var(--co7)','var(--jade2)','var(--am4)','var(--au6)'][i]},transparent)`,
                }}/>
                <div style={{ fontSize:'clamp(.8rem,.95rem,1.1rem)',marginBottom:8 }}>{s.icon}</div>
                <div style={{
                  fontFamily:'var(--f-display)',
                  fontSize:'clamp(1.5rem,3.8vw,2.5rem)',
                  fontWeight:700, color:s.color, lineHeight:1, marginBottom:7,
                }}>
                  <CountUp target={s.val}/>{s.suffix}
                </div>
                <div style={{
                  fontFamily:'var(--f-mono)',
                  fontSize:'clamp(.5rem,.58rem,.66rem)',
                  color:'var(--t2)', letterSpacing:'.08em',
                  textTransform:'uppercase', lineHeight:1.5, whiteSpace:'pre-line',
                }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div className="hero-trust-row fade-up fade-up-4" style={{
            marginTop:'clamp(12px,2vw,18px)', opacity:visible?1:0,
            display:'flex', justifyContent:'center',
            gap:'clamp(14px,3vw,28px)', flexWrap:'wrap',
          }}>
            {[
              { icon:'🔒', text:'Dados protegidos por SSL' },
              { icon:'⚡', text:'Resposta em até 3 minutos' },
              { icon:'🏛️', text:'Legislação brasileira atualizada' },
              { icon:'🛡️', text:'Contraditório garantido' },
            ].map((item,i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:5,
                fontFamily:'var(--f-mono)', fontSize:'clamp(.6rem,.64rem,.72rem)',
                color:'var(--t2)', letterSpacing:'.07em',
              }}>
                <span>{item.icon}</span><span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Scroll hint */}
          <div style={{
            marginTop:'clamp(32px,5vw,52px)', opacity:visible?0.4:0,
            transition:'opacity .7s 1.4s',
            display:'flex', flexDirection:'column', alignItems:'center', gap:8,
          }}>
            <div style={{ width:1, height:38, background:'linear-gradient(180deg,var(--co7),transparent)' }}/>
            <span style={{ fontFamily:'var(--f-mono)',fontSize:'.54rem',color:'var(--t3)',letterSpacing:'.22em' }}>SCROLL</span>
          </div>
        </div>
      </section>
    </>
  );
}
