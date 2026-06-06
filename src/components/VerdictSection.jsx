/**
 * VerdictSection.jsx — JURIR Obsidian Codex v3.0
 * Cards do Advogado do Diabo e do Juiz IA Quantum
 * Ultra-max level — drop-in replacement
 */

import { useEffect, useRef, useState } from 'react';
import {
  Scale, Shield, Download, AlertTriangle, CheckCircle2,
  Zap, Brain, FlameKindling, Gavel, Swords, Eye, TrendingUp,
  Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useStore } from '../store';
import { downloadPdf } from '../lib/api';

/* ─── helpers ─────────────────────────────────────────────────── */
const SCORE_LABEL = s =>
  s >= 80 ? 'Fortemente Favorável' :
  s >= 65 ? 'Favorável' :
  s >= 50 ? 'Parcialmente Favorável' :
  s >= 35 ? 'Risco Moderado' : 'Alto Risco';

const scoreColor = s =>
  s >= 70 ? '#10B981' : s >= 40 ? '#EAB308' : '#EF4444';

const scoreGlow = s =>
  s >= 70 ? 'rgba(16,185,129,.45)' :
  s >= 40 ? 'rgba(234,179,8,.45)' : 'rgba(239,68,68,.45)';

/* ─── SCORE RING — SVG vectorial com animação ─────────────────── */
function ScoreRing({ score }) {
  const r = 44;
  const cx = 52;
  const cy = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = scoreColor(score);
  const glow  = scoreGlow(score);
  const label = SCORE_LABEL(score);
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur   = 1400;
    const run   = now => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setAnim(ease * score);
      if (t < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const animDash = (anim / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: 104, height: 104 }}>
        {/* Glow halo */}
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
          filter: 'blur(8px)', animation: 'haloBreath 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}/>
        <svg width={104} height={104} viewBox="0 0 104 104" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke="rgba(248,244,238,0.05)" strokeWidth={7} />
          {/* Glow duplicate */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={3} strokeOpacity={0.18}
            strokeDasharray={`${animDash} ${circ - animDash}`}
            strokeLinecap="round" />
          {/* Main arc */}
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={color} strokeWidth={6}
            strokeDasharray={`${animDash} ${circ - animDash}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke .1s' }} />
        </svg>
        {/* Center */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 0,
        }}>
          <span style={{
            fontFamily: 'var(--f-display)', fontSize: '1.65rem',
            fontWeight: 700, color, lineHeight: 1,
            textShadow: `0 0 16px ${glow}`,
          }}>
            {Math.round(anim)}
          </span>
          <span style={{ fontSize: '.48rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em' }}>
            / 100
          </span>
        </div>
      </div>
      <span style={{ fontSize: '.58rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
        JURIR SCORE
      </span>
      <span style={{ fontSize: '.72rem', color, fontWeight: 700, letterSpacing: '.04em' }}>
        {label}
      </span>
    </div>
  );
}

/* ─── DIM BAR ─────────────────────────────────────────────────── */
function DimBar({ label, value }) {
  const color = scoreColor(value);
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 120);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div style={{
      background: 'rgba(248,244,238,0.025)', border: '1px solid rgba(248,244,238,0.05)',
      borderRadius: 'var(--r-sm)', padding: '10px 14px',
      transition: 'border-color .25s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = `${color}30`}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(248,244,238,0.05)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
        <span style={{ fontSize: '.64rem', color: 'var(--p5)', textTransform: 'uppercase', letterSpacing: '.1em', fontFamily: 'var(--f-mono)' }}>
          {label}
        </span>
        <span style={{ fontSize: '.68rem', color, fontFamily: 'var(--f-mono)', fontWeight: 700 }}>
          {value}
        </span>
      </div>
      <div style={{ height: 3, borderRadius: 99, background: 'rgba(248,244,238,0.04)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${w}%`, background: color,
          borderRadius: 99, transition: 'width .8s cubic-bezier(.4,0,.2,1)',
          boxShadow: `0 0 8px ${color}80`,
        }}/>
      </div>
    </div>
  );
}

/* ─── VETO BANNER ─────────────────────────────────────────────── */
function VetoBanner() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'rgba(127,7,7,.18)',
      border: '1px solid rgba(220,38,38,.35)',
      borderRadius: 'var(--r-md)', padding: '14px 18px',
      marginBottom: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* Pulse stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent, #EF4444, transparent)',
        animation: 'pulseLine 2.4s ease-in-out infinite',
      }}/>
      <AlertTriangle size={16} style={{ color: '#EF4444', flexShrink: 0 }}/>
      <div>
        <div style={{ fontSize: '.72rem', fontFamily: 'var(--f-mono)', color: '#EF4444', fontWeight: 700, letterSpacing: '.12em', marginBottom: 3 }}>
          VETO ATIVADO
        </div>
        <div style={{ fontSize: '.82rem', color: 'var(--p3)', lineHeight: 1.5 }}>
          Caso de alta criticidade detectado. Consulte um advogado imediatamente.
        </div>
      </div>
    </div>
  );
}

/* ─── DEVIL CARD ──────────────────────────────────────────────── */
function DevilCard({ text, isStreaming }) {
  const [expanded, setExpanded] = useState(true);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(135deg, rgba(90,8,8,.22) 0%, rgba(60,5,5,.14) 60%, rgba(12,12,30,.18) 100%)',
        border: '1px solid rgba(185,28,28,.28)',
        boxShadow: '0 0 60px rgba(185,28,28,.10), inset 0 1px 0 rgba(220,38,38,.12)',
        marginBottom: 20,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity .5s ease, transform .5s ease',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent 0%, #DC2626 30%, #991515 70%, transparent 100%)',
      }}/>

      {/* Bg watermark sword */}
      <div style={{
        position: 'absolute', right: -10, top: -10,
        fontSize: '7rem', opacity: .035, pointerEvents: 'none',
        lineHeight: 1, userSelect: 'none', color: '#DC2626',
        filter: 'blur(1px)',
      }}>⚔</div>

      {/* Corner glow */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(185,28,28,.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '18px 22px', cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(185,28,28,.15)' : 'none',
          transition: 'border-color .3s',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--r-sm)',
          background: 'rgba(185,28,28,.15)', border: '1px solid rgba(185,28,28,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, position: 'relative',
        }}>
          {isStreaming
            ? <Loader2 size={15} style={{ color: '#DC2626', animation: 'spin 1s linear infinite' }}/>
            : <Swords size={15} style={{ color: '#DC2626' }}/>
          }
          {!isStreaming && (
            <div style={{
              position: 'absolute', inset: -3, borderRadius: 'var(--r-sm)',
              border: '1px solid rgba(220,38,38,.2)',
              animation: 'ringPulse 2.5s ease-in-out infinite',
              pointerEvents: 'none',
            }}/>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '.72rem', fontWeight: 800, color: '#DC2626',
              letterSpacing: '.14em', fontFamily: 'var(--f-mono)', textTransform: 'uppercase',
            }}>
              Advogado do Diabo
            </span>
            <span style={{
              background: 'rgba(185,28,28,.15)', border: '1px solid rgba(185,28,28,.25)',
              borderRadius: 'var(--r-pill)', padding: '1px 8px',
              fontSize: '.58rem', color: '#EF4444', fontFamily: 'var(--f-mono)', letterSpacing: '.1em',
            }}>
              CONTRADITÓRIO
            </span>
            {isStreaming && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: '.6rem', color: '#DC2626', fontFamily: 'var(--f-mono)',
                animation: 'fadeFlicker 1.4s ease-in-out infinite',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#DC2626', display: 'inline-block', animation: 'breathDot 1.2s ease-in-out infinite' }}/>
                analisando…
              </span>
            )}
          </div>
          <div style={{ fontSize: '.68rem', color: 'var(--p5)', marginTop: 3, fontFamily: 'var(--f-sans)' }}>
            Argumentos contrários ao caso — contraditório obrigatório
          </div>
        </div>

        <div style={{ color: 'var(--p5)', flexShrink: 0, transition: 'transform .25s', transform: expanded ? 'rotate(0)' : 'rotate(-180deg)' }}>
          <ChevronUp size={14}/>
        </div>
      </div>

      {/* Body */}
      <div style={{
        maxHeight: expanded ? '600px' : 0,
        overflow: 'hidden',
        transition: 'max-height .45s cubic-bezier(.4,0,.2,1)',
      }}>
        <div style={{ padding: '20px 22px' }}>
          {isStreaming && !text ? (
            <DevilSkeleton/>
          ) : (
            <>
              {/* Decorative left rule */}
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{
                  width: 2, flexShrink: 0, alignSelf: 'stretch',
                  background: 'linear-gradient(to bottom, #DC2626, transparent)',
                  borderRadius: 1, minHeight: 40,
                }}/>
                <p style={{
                  fontSize: '.88rem', color: 'var(--p2)', lineHeight: 1.85,
                  whiteSpace: 'pre-wrap', margin: 0,
                  fontFamily: 'var(--f-sans)',
                }}>
                  {text}
                </p>
              </div>

              {/* Footer tags */}
              <div style={{
                display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap',
                paddingTop: 14, borderTop: '1px solid rgba(185,28,28,.1)',
              }}>
                {['Retry automático 2×', 'devil_is_real™', 'Síntese local'].map(t => (
                  <span key={t} style={{
                    fontSize: '.6rem', fontFamily: 'var(--f-mono)', letterSpacing: '.08em',
                    color: 'var(--p5)', background: 'rgba(185,28,28,.07)',
                    border: '1px solid rgba(185,28,28,.12)',
                    borderRadius: 'var(--r-pill)', padding: '2px 8px',
                  }}>{t}</span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DevilSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[100, 88, 92, 72].map((w, i) => (
        <div key={i} style={{
          height: 13, borderRadius: 6, width: `${w}%`,
          background: 'linear-gradient(90deg, rgba(185,28,28,.08) 25%, rgba(185,28,28,.16) 50%, rgba(185,28,28,.08) 75%)',
          backgroundSize: '400px 100%',
          animation: `shimmer 1.6s ease-in-out ${i * 0.1}s infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ─── JUDGE CARD ──────────────────────────────────────────────── */
function JudgeCard({ verdictText, jurirScore, scoreDims, isDeliberating, analysisId, authToken, addToast }) {
  const [visible, setVisible] = useState(false);
  const [dimExpanded, setDimExpanded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  const handlePdf = async () => {
    if (!authToken || !analysisId) {
      addToast('Faça login para baixar o PDF.', 'info');
      return;
    }
    try {
      await downloadPdf(analysisId, authToken);
      addToast('PDF gerado!', 'success');
    } catch (e) {
      addToast(`Erro PDF: ${e.message}`, 'error');
    }
  };

  const scoreLabel = jurirScore != null ? SCORE_LABEL(jurirScore) : null;
  const color      = jurirScore != null ? scoreColor(jurirScore) : 'var(--au6)';
  const glow       = jurirScore != null ? scoreGlow(jurirScore) : 'rgba(234,179,8,.3)';

  return (
    <div style={{
      position: 'relative', overflow: 'hidden',
      borderRadius: 'var(--r-lg)',
      background: 'linear-gradient(135deg, rgba(8,8,24,.88) 0%, rgba(12,12,30,.95) 100%)',
      border: '1px solid rgba(202,138,4,.28)',
      boxShadow: `0 0 80px rgba(202,138,4,.10), inset 0 1px 0 rgba(234,179,8,.14)`,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'opacity .55s ease .08s, transform .55s ease .08s',
    }}>
      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: 'linear-gradient(90deg, transparent 0%, #CA8A04 25%, #EAB308 50%, #CA8A04 75%, transparent 100%)',
      }}/>
      {/* Bottom accent */}
      <div style={{
        position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(202,138,4,.35), transparent)',
      }}/>

      {/* Bg scale watermark */}
      <div style={{
        position: 'absolute', right: -20, bottom: -20,
        fontSize: '9rem', opacity: .022, pointerEvents: 'none',
        lineHeight: 1, userSelect: 'none', color: '#CA8A04',
        filter: 'blur(2px)',
      }}>⚖</div>

      {/* Corner orb */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 240, height: 240, borderRadius: '50%',
        background: `radial-gradient(circle, ${glow} 0%, transparent 65%)`,
        pointerEvents: 'none', opacity: .6,
        animation: 'haloBreath 4s ease-in-out infinite',
      }}/>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 16,
        padding: '22px 26px 20px',
        borderBottom: '1px solid rgba(202,138,4,.12)',
      }}>
        {/* Icon cluster */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'rgba(202,138,4,.12)', border: '1px solid rgba(202,138,4,.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            boxShadow: `0 0 20px rgba(202,138,4,.15)`,
          }}>
            {isDeliberating
              ? <Brain size={18} style={{ color: '#EAB308', animation: 'brainPulse 1.4s ease-in-out infinite' }}/>
              : <Gavel size={18} style={{ color: '#EAB308' }}/>
            }
            {!isDeliberating && (
              <>
                <div style={{
                  position: 'absolute', inset: -4, borderRadius: 'var(--r-md)',
                  border: '1px solid rgba(234,179,8,.18)',
                  animation: 'ringPulse 3s ease-in-out infinite',
                  pointerEvents: 'none',
                }}/>
                <div style={{
                  position: 'absolute', inset: -8, borderRadius: 'var(--r-md)',
                  border: '1px solid rgba(234,179,8,.08)',
                  animation: 'ringPulse 3s ease-in-out infinite .6s',
                  pointerEvents: 'none',
                }}/>
              </>
            )}
          </div>

          {/* Status dot */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: '.54rem', fontFamily: 'var(--f-mono)', color: isDeliberating ? '#EAB308' : 'var(--jade2)',
            letterSpacing: '.08em', whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: isDeliberating ? '#EAB308' : 'var(--jade2)',
              display: 'inline-block',
              animation: isDeliberating ? 'breathDot 1.1s ease-in-out infinite' : 'none',
              boxShadow: isDeliberating ? '0 0 8px #EAB308' : '0 0 8px var(--jade2)',
            }}/>
            {isDeliberating ? 'deliberando' : 'prolatado'}
          </div>
        </div>

        {/* Title block */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
            <span style={{
              fontSize: '.72rem', fontWeight: 800, color: '#EAB308',
              letterSpacing: '.14em', fontFamily: 'var(--f-mono)', textTransform: 'uppercase',
            }}>
              Juiz IA Quantum
            </span>
            <span style={{
              background: 'rgba(202,138,4,.12)', border: '1px solid rgba(202,138,4,.22)',
              borderRadius: 'var(--r-pill)', padding: '1px 8px',
              fontSize: '.58rem', color: '#CA8A04', fontFamily: 'var(--f-mono)', letterSpacing: '.1em',
            }}>
              VEREDICTO FINAL
            </span>
            {scoreLabel && (
              <span style={{
                background: `${color}15`, border: `1px solid ${color}30`,
                borderRadius: 'var(--r-pill)', padding: '1px 10px',
                fontSize: '.6rem', color, fontFamily: 'var(--f-mono)', letterSpacing: '.08em', fontWeight: 700,
              }}>
                {scoreLabel.toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ fontSize: '.7rem', color: 'var(--p5)', fontFamily: 'var(--f-sans)' }}>
            Pondera 16 pareceres + contraditório · JURIR Score dimensional 0–100
          </div>
        </div>

        {/* Score ring */}
        {jurirScore != null && (
          <div style={{ flexShrink: 0, paddingTop: 2 }}>
            <ScoreRing score={jurirScore}/>
          </div>
        )}
      </div>

      {/* ── VERDICT TEXT ── */}
      <div style={{ padding: '22px 26px' }}>
        {isDeliberating && !verdictText ? (
          <JudgeSkeleton/>
        ) : (
          <div style={{ display: 'flex', gap: 18 }}>
            {/* Left accent bar */}
            <div style={{
              width: 2, flexShrink: 0, alignSelf: 'stretch',
              background: 'linear-gradient(to bottom, #CA8A04, rgba(202,138,4,.1))',
              borderRadius: 1, minHeight: 50,
            }}/>
            <p style={{
              fontSize: '.9rem', color: 'var(--p1)', lineHeight: 1.85,
              whiteSpace: 'pre-wrap', margin: 0, flex: 1,
              fontFamily: 'var(--f-sans)',
            }}>
              {verdictText}
            </p>
          </div>
        )}

        {/* ── SCORE DIMENSIONS ── */}
        {scoreDims && Object.keys(scoreDims).length > 0 && (
          <div style={{ marginTop: 22 }}>
            <button
              onClick={() => setDimExpanded(e => !e)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, marginBottom: dimExpanded ? 14 : 0,
                color: 'var(--p5)', fontSize: '.66rem', fontFamily: 'var(--f-mono)',
                letterSpacing: '.1em', textTransform: 'uppercase',
                transition: 'color .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#EAB308'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--p5)'}
            >
              <TrendingUp size={11}/>
              Dimensões do Score
              <span style={{ marginLeft: 'auto', color: 'var(--p5)', transition: 'transform .25s', transform: dimExpanded ? 'rotate(0)' : 'rotate(-180deg)', display: 'inline-block' }}>
                <ChevronUp size={11}/>
              </span>
            </button>

            <div style={{
              maxHeight: dimExpanded ? '400px' : 0,
              overflow: 'hidden',
              transition: 'max-height .4s cubic-bezier(.4,0,.2,1)',
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 8, paddingTop: 2,
              }}>
                {Object.entries(scoreDims).map(([k, v]) => (
                  <DimBar key={k} label={k} value={v}/>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ACTIONS ── */}
        <div style={{
          marginTop: 22, paddingTop: 16,
          borderTop: '1px solid rgba(202,138,4,.1)',
          display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
        }}>
          {analysisId && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={handlePdf}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(202,138,4,.08)', border: '1px solid rgba(202,138,4,.2)',
                color: '#CA8A04', transition: 'background .2s, border-color .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(202,138,4,.15)'; e.currentTarget.style.borderColor = 'rgba(202,138,4,.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(202,138,4,.08)'; e.currentTarget.style.borderColor = 'rgba(202,138,4,.2)'; }}
            >
              <Download size={12}/>
              Baixar PDF
            </button>
          )}
          {analysisId && (
            <span style={{ fontSize: '.66rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)' }}>
              ID: #{analysisId}
            </span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={11} style={{ color: 'var(--jade2)' }}/>
            <span style={{ fontSize: '.65rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)' }}>
              Análise concluída
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function JudgeSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {[100, 90, 95, 75, 82].map((w, i) => (
        <div key={i} style={{
          height: 13, borderRadius: 6, width: `${w}%`,
          background: 'linear-gradient(90deg, rgba(202,138,4,.06) 25%, rgba(202,138,4,.13) 50%, rgba(202,138,4,.06) 75%)',
          backgroundSize: '400px 100%',
          animation: `shimmer 1.6s ease-in-out ${i * 0.12}s infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ─── INJECTED KEYFRAMES ──────────────────────────────────────── */
const KEYFRAMES = `
@keyframes haloBreath {
  0%,100% { opacity:.6; transform:scale(1); }
  50%      { opacity:1;  transform:scale(1.06); }
}
@keyframes ringPulse {
  0%,100% { opacity:.7; transform:scale(1); }
  50%      { opacity:0;  transform:scale(1.25); }
}
@keyframes breathDot {
  0%,100% { opacity:1;  box-shadow: 0 0 8px currentColor; }
  50%      { opacity:.3; box-shadow: none; }
}
@keyframes brainPulse {
  0%,100% { opacity:1;  transform:scale(1); }
  50%      { opacity:.5; transform:scale(0.9); }
}
@keyframes fadeFlicker {
  0%,100% { opacity:1; }
  50%      { opacity:.45; }
}
@keyframes pulseLine {
  0%,100% { opacity:.7; }
  50%      { opacity:.2; }
}
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

/* ─── ROOT EXPORT ─────────────────────────────────────────────── */
export default function VerdictSection() {
  const {
    verdictText, devilText, jurirScore, scoreDims,
    vetoActive, analysisId, authToken, addToast, running,
    statusMessage,
  } = useStore(s => ({
    verdictText:   s.verdictText,
    devilText:     s.devilText,
    jurirScore:    s.jurirScore,
    scoreDims:     s.scoreDims,
    vetoActive:    s.vetoActive,
    analysisId:    s.analysisId,
    authToken:     s.authToken,
    addToast:      s.addToast,
    running:       s.running,
    statusMessage: s.statusMessage,
  }));

  // FASE 1 — agentes rodando: nada aparece ainda
  // FASE 2 — devil_thinking ou devil_done: card do Diabo aparece
  const devilPhase = statusMessage?.includes('Diabo') || !!devilText;
  // FASE 3 — judge_thinking ou verdict: card do Juiz aparece
  const judgePhase = statusMessage?.includes('Juiz') || !!verdictText;

  const isDevilStreaming  = running && devilPhase && !devilText;
  const isJudgeDeliberat = running && judgePhase && !verdictText;

  const showDevil = devilPhase || !!devilText;
  const showJudge = judgePhase || !!verdictText;

  if (!showDevil && !showJudge && !vetoActive) return null;

  return (
    <>
      {/* Keyframes injection */}
      <style>{KEYFRAMES}</style>

      <div style={{ marginTop: 36 }}>
        {vetoActive && <VetoBanner/>}

        {showDevil && (
          <DevilCard
            text={devilText}
            isStreaming={isDevilStreaming}
          />
        )}

        {showJudge && (
          <JudgeCard
            verdictText={verdictText}
            jurirScore={jurirScore}
            scoreDims={scoreDims}
            isDeliberating={isJudgeDeliberat}
            analysisId={analysisId}
            authToken={authToken}
            addToast={addToast}
          />
        )}
      </div>
    </>
  );
}
