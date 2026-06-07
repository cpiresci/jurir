import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Zap, Shield, Scale, ChevronRight } from 'lucide-react';
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
  { val: '16',    suffix: '',    label: 'Agentes Especialistas', icon: '⚖️',  color: 'var(--co7)' },
  { val: '3',     suffix: 'min', label: 'Análise Completa',      icon: '⚡',  color: 'var(--jade2)' },
  { val: '100',   suffix: '%',   label: 'Contraditório Real',    icon: '🛡️', color: 'var(--am4)' },
  { val: '50000', suffix: '+',   label: 'Análises Realizadas',   icon: '📋',  color: 'var(--au6)' },
];

const AREAS = [
  'Direito Civil', 'Direito Penal', 'Direito Trabalhista',
  'Direito de Família', 'Direito Digital', 'Direito Tributário',
  'Direito Empresarial', 'Direito Constitucional',
  'Direito do Consumidor', 'Direito Previdenciário',
];

/* ─── JURIR Score Ring — quantum animated ── */
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
      const ease = 1 - Math.pow(1 - t, 3);
      setAnimScore(Math.round(ease * score));
      if (t < 1) requestAnimationFrame(run);
    };
    const raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [visible, score]);

  const fill = C - (animScore / 100) * C;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }}>
      <defs>
        <filter id="ring-glow-h" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <linearGradient id="ring-grad-h" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="var(--co8)"/>
          <stop offset="50%"  stopColor="var(--co7)"/>
          <stop offset="100%" stopColor="var(--am4)"/>
        </linearGradient>
        <filter id="score-glow-h">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(20,114,217,0.10)" strokeWidth={7}/>
      {/* Glow track */}
      <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(20,114,217,0.04)" strokeWidth={14}/>
      {/* Arc */}
      <circle
        cx={size/2} cy={size/2} r={R}
        fill="none"
        stroke="url(#ring-grad-h)"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={fill}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        filter="url(#ring-glow-h)"
        style={{ transition: 'stroke-dashoffset .04s linear' }}
      />
      {/* Center */}
      <text x="50%" y="43%" textAnchor="middle" dominantBaseline="middle"
        filter="url(#score-glow-h)"
        style={{ fontFamily:'var(--f-display)', fontSize: size*0.24, fontWeight:600, fill:'var(--co7)' }}>
        {animScore}
      </text>
      <text x="50%" y="63%" textAnchor="middle" dominantBaseline="middle"
        style={{ fontFamily:'var(--f-mono)', fontSize: size*0.085, fill:'var(--t4)', letterSpacing:'0.10em' }}>
        SCORE
      </text>
    </svg>
  );
}

/* ─── LIVE FEED TICKER ── */
const VERDICTS = [
  { area: 'Trabalhista', result: 'PROCEDENTE',    score: 84, color: 'var(--jade2)' },
  { area: 'Consumidor',  result: 'FAVORÁVEL',      score: 91, color: 'var(--jade2)' },
  { area: 'Civil',       result: 'PARCIAL',        score: 62, color: 'var(--au6)'   },
  { area: 'Previdência', result: 'PROCEDENTE',     score: 77, color: 'var(--jade2)' },
  { area: 'Empresarial', result: 'CONTESTADO',     score: 45, color: 'var(--cr3)'   },
];

function LiveFeed({ visible }) {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setIdx(v => (v + 1) % VERDICTS.length);
        setShow(true);
      }, 300);
    }, 2800);
    return () => clearInterval(t);
  }, [visible]);

  const v = VERDICTS[idx];

  return (
    <div style={{
      opacity: visible && show ? 1 : 0,
      transition: 'opacity .3s',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: v.color,
        boxShadow: `0 0 8px ${v.color}`,
        animation: 'pulse 1.4s ease-in-out infinite',
        flexShrink: 0,
      }}/>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--t4)', letterSpacing: '.06em' }}>
        {v.area}
      </span>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: v.color, fontWeight: 500, letterSpacing: '.06em' }}>
        {v.result}
      </span>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.58rem', color: 'var(--t5)', letterSpacing: '.06em' }}>
        {v.score}/100
      </span>
    </div>
  );
}

export default function Hero() {
  const { openModal } = useStore();
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  const [visible, setVisible] = useState(false);
  const [activeArea, setActiveArea] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveArea(v => (v + 1) % AREAS.length), 2400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 28px', paddingTop: 72,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Marble column accent lines ── */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:1, background:'linear-gradient(180deg, transparent, rgba(20,114,217,0.14), rgba(139,92,246,0.08), transparent)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:1, background:'linear-gradient(180deg, transparent, rgba(20,114,217,0.14), rgba(139,92,246,0.08), transparent)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', left:'8%', top:0, bottom:0, width:1, background:'linear-gradient(180deg, transparent 20%, rgba(20,114,217,0.04), transparent 80%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', right:'8%', top:0, bottom:0, width:1, background:'linear-gradient(180deg, transparent 20%, rgba(20,114,217,0.04), transparent 80%)', pointerEvents:'none' }}/>

      {/* ── Floating legal area badge — top right ── */}
      <div style={{
        position:'absolute', top:96, right:'7%',
        background:'var(--bg-card)', border:'1px solid var(--b-cobalt)',
        borderRadius:'var(--r-md)', padding:'10px 18px',
        boxShadow:'var(--shadow-cobalt)',
        fontFamily:'var(--f-mono)', fontSize:'.67rem',
        color:'var(--co7)', letterSpacing:'.09em',
        opacity: visible ? 1 : 0,
        transition:'opacity .7s .6s',
        display:'flex', alignItems:'center', gap:9,
        pointerEvents:'none',
      }}>
        <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--co7)', boxShadow:'0 0 8px rgba(20,114,217,0.6)', animation:'pulse 2s ease-in-out infinite', flexShrink:0 }}/>
        <span style={{ color:'var(--t4)', marginRight:2 }}>ÁREA ATIVA</span>
        <span style={{ color:'var(--co7)', fontWeight:500 }}>{AREAS[activeArea]}</span>
      </div>

      {/* ── Jurir Score Ring — bottom left ── */}
      <div style={{
        position:'absolute', bottom:'16%', left:'4%',
        background:'var(--bg-card)', border:'1px solid var(--b-main)',
        borderRadius:'var(--r-lg)', padding:'22px 24px',
        boxShadow:'var(--shadow-float)',
        opacity: visible ? 1 : 0,
        transition:'opacity .7s .8s',
        pointerEvents:'none',
        display:'flex', flexDirection:'column', alignItems:'center', gap:10,
      }}>
        {/* Quantum ring decoration */}
        <div style={{
          position:'absolute', inset:-8, borderRadius:'var(--r-xl)',
          border:'1px solid rgba(20,114,217,0.06)',
          pointerEvents:'none',
        }}/>
        <ScoreRing size={108} score={87} visible={visible} />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
          <span style={{ fontFamily:'var(--f-mono)', fontSize:'.52rem', color:'var(--t5)', letterSpacing:'.16em', textTransform:'uppercase' }}>JURIR SCORE</span>
          <span style={{ fontFamily:'var(--f-mono)', fontSize:'.48rem', color:'var(--jade2)', letterSpacing:'.1em' }}>FORTEMENTE FAVORÁVEL</span>
        </div>
      </div>

      {/* ── Live verdicts feed — bottom right ── */}
      <div style={{
        position:'absolute', bottom:'26%', right:'4%',
        background:'var(--bg-card)', border:'1px solid var(--b-main)',
        borderRadius:'var(--r-md)', padding:'16px 20px',
        boxShadow:'var(--shadow-float)',
        opacity: visible ? 1 : 0,
        transition:'opacity .7s 1.0s',
        pointerEvents:'none',
        minWidth:220,
      }}>
        <div style={{ fontFamily:'var(--f-mono)', fontSize:'.56rem', color:'var(--t5)', letterSpacing:'.18em', marginBottom:10 }}>
          TRIBUNAL AO VIVO
        </div>
        <LiveFeed visible={visible} />
      </div>

      {/* ── Quantum axiom — top left floating ── */}
      <div style={{
        position:'absolute', top:108, left:'5%',
        opacity: visible ? 0.55 : 0,
        transition:'opacity .7s 1.2s',
        pointerEvents:'none',
        display:'none',
      }}>
        <div style={{ fontFamily:'var(--f-display)', fontStyle:'italic', fontSize:'.72rem', color:'var(--t5)', letterSpacing:'.04em', writingMode:'vertical-rl', transform:'rotate(180deg)' }}>
          Lex iniusta non est lex
        </div>
      </div>

      {/* ────────────────── MAIN CONTENT ────────────────── */}
      <div style={{ maxWidth:920, textAlign:'center', position:'relative', zIndex:1 }}>

        {/* Top label */}
        <div className="hero-badge fade-up" style={{ marginBottom:44, opacity: visible ? 1 : 0 }}>
          <Zap size={9} style={{ color:'var(--co7)' }}/>
          <span style={{ color:'var(--t4)' }}>Inteligência Jurídica Quântica</span>
          <span style={{ width:3, height:3, borderRadius:'50%', background:'var(--t5)', flexShrink:0 }}/>
          <span style={{ color:'var(--co7)', fontWeight:500 }}>Plataforma v10.0</span>
          <span style={{ width:3, height:3, borderRadius:'50%', background:'var(--t5)', flexShrink:0 }}/>
          <span style={{ color:'var(--am4)' }}>16 AGENTES</span>
        </div>

        {/* ── HEADLINE PRINCIPAL ── */}
        <h1 className="hero-title fade-up fade-up-1" style={{ marginBottom:8, opacity: visible ? 1 : 0 }}>
          O tribunal do futuro
        </h1>
        <h1 className="hero-title fade-up fade-up-1" style={{
          marginBottom:36, opacity: visible ? 1 : 0,
          background:'linear-gradient(135deg, var(--co8) 0%, var(--co7) 40%, var(--am4) 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          fontStyle:'italic',
        }}>
          analisa o seu caso.
        </h1>

        {/* ── SUBLINE ── */}
        <p className="fade-up fade-up-2" style={{
          fontSize:'1.08rem', color:'var(--t2)',
          maxWidth:600, margin:'0 auto 14px',
          lineHeight:1.78, opacity: visible ? 1 : 0,
          fontFamily:'var(--f-display)', fontWeight:400,
          letterSpacing:'.01em',
        }}>
          Dezesseis agentes de IA especializados analisam cada faceta do seu processo em paralelo.
          O <em style={{ color:'var(--cr3)' }}>Advogado do Diabo</em> confronta. O{' '}
          <em style={{ color:'var(--co7)' }}>Juiz IA Quantum</em> prolata o veredicto final.
        </p>

        {/* ── Latim ── */}
        <div className="fade-up fade-up-3" style={{ opacity: visible ? 1 : 0, marginBottom:52 }}>
          <span style={{
            fontFamily:'var(--f-display)', fontStyle:'italic',
            fontSize:'.88rem', color:'var(--t5)', letterSpacing:'.05em',
          }}>
            "Iustitia est constans et perpetua voluntas ius suum cuique tribuendi"
          </span>
          <div style={{ fontFamily:'var(--f-mono)', fontSize:'.52rem', color:'var(--t5)', letterSpacing:'.2em', marginTop:5, textTransform:'uppercase' }}>
            — Ulpiano, Digesto
          </div>
        </div>

        {/* ── CTA BUTTONS ── */}
        <div className="fade-up fade-up-3" style={{
          display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap',
          marginBottom:76, opacity: visible ? 1 : 0,
        }}>
          <button className="btn btn-cobalt-ultra btn-lg" onClick={() => scrollTo('analise')}>
            Analisar Meu Caso Agora
            <ArrowRight size={16}/>
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => openModal('register')}>
            Criar Conta Gratuita
          </button>
        </div>

        {/* ── STATS BAR ULTRA ── */}
        <div className="fade-up fade-up-3" style={{
          opacity: visible ? 1 : 0,
          display:'grid', gridTemplateColumns:'repeat(4, 1fr)',
          gap:1, background:'var(--b-main)',
          borderRadius:'var(--r-lg)', overflow:'hidden',
          boxShadow:'var(--shadow-cobalt)',
          maxWidth:740, margin:'0 auto',
          border:'1px solid var(--b-cobalt)',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              background:'var(--bg-card)', padding:'26px 18px',
              textAlign:'center', position:'relative',
              transition:'background .2s',
            }}>
              {/* Top color bar */}
              <div style={{
                position:'absolute', top:0, left:0, right:0, height:2,
                background: i===0 ? 'linear-gradient(90deg, transparent, var(--co7), transparent)' :
                            i===1 ? 'linear-gradient(90deg, transparent, var(--jade2), transparent)' :
                            i===2 ? 'linear-gradient(90deg, transparent, var(--am4), transparent)' :
                                    'linear-gradient(90deg, transparent, var(--au6), transparent)',
              }}/>
              <div style={{ fontSize:'.9rem', marginBottom:10 }}>{s.icon}</div>
              <div style={{
                fontFamily:'var(--f-display)',
                fontSize:'clamp(1.7rem, 3.2vw, 2.4rem)',
                fontWeight:600, color:s.color, lineHeight:1,
                marginBottom:7,
              }}>
                <CountUp target={s.val}/>{s.suffix}
              </div>
              <div style={{
                fontFamily:'var(--f-mono)',
                fontSize:'.58rem', color:'var(--t4)',
                letterSpacing:'.12em', textTransform:'uppercase',
                lineHeight:1.4,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trust row */}
        <div className="fade-up fade-up-4" style={{
          marginTop:32, opacity: visible ? 1 : 0,
          display:'flex', justifyContent:'center', gap:28, flexWrap:'wrap',
        }}>
          {[
            { icon:'🔒', text:'Dados protegidos por SSL' },
            { icon:'⚡', text:'Resposta em até 3 minutos' },
            { icon:'🏛️', text:'Legislação brasileira atualizada' },
            { icon:'🛡️', text:'Contraditório garantido' },
          ].map((item, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:5,
              fontFamily:'var(--f-mono)', fontSize:'.62rem', color:'var(--t4)',
              letterSpacing:'.07em',
            }}>
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* ── Scroll hint ── */}
        <div style={{
          marginTop:52, opacity: visible ? 0.38 : 0,
          transition:'opacity .7s 1.4s',
          display:'flex', flexDirection:'column', alignItems:'center', gap:8,
        }}>
          <div style={{
            width:1, height:40,
            background:'linear-gradient(180deg, var(--co7), transparent)',
          }}/>
          <span style={{ fontFamily:'var(--f-mono)', fontSize:'.58rem', color:'var(--t4)', letterSpacing:'.22em' }}>
            SCROLL
          </span>
        </div>
      </div>
    </section>
  );
}
