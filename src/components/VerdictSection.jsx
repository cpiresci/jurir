import { useEffect, useRef, useState } from 'react';
import { Scale, Download, CheckCircle2, Zap, Brain, Gavel, Swords, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store';
import { downloadPdf } from '../lib/api';

const SCORE_LABEL = s =>
  s >= 80 ? 'Fortemente Favorável' :
  s >= 65 ? 'Favorável' :
  s >= 50 ? 'Parcialmente Favorável' :
  s >= 35 ? 'Risco Moderado' : 'Alto Risco';

const scoreColor = s => s >= 70 ? '#10B981' : s >= 40 ? '#EAB308' : '#EF4444';

function ScoreRing({ score }) {
  const r = 44; const cx = 52; const cy = 52;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  const [anim, setAnim] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 1400;
    const run = now => {
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 104, height: 104 }}>
        <div style={{
          position: 'absolute', inset: -8, borderRadius: '50%',
          background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
          filter: 'blur(8px)', animation: 'haloBreath 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}/>
        <svg width={104} height={104} viewBox="0 0 104 104" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(180,188,210,0.20)" strokeWidth={7}/>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={`${animDash} ${circ - animDash}`} strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke .1s' }}/>
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.7rem', fontWeight: 600, color, lineHeight: 1 }}>
            {Math.round(anim)}
          </span>
          <span style={{ fontSize: '.48rem', color: 'var(--t5)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em' }}>/100</span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '.7rem', fontWeight: 600, color, fontFamily: 'var(--f-mono)', letterSpacing: '.06em' }}>
          {SCORE_LABEL(score)}
        </div>
        <div style={{ fontSize: '.6rem', color: 'var(--t5)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginTop: 2 }}>
          JURIR SCORE
        </div>
      </div>
    </div>
  );
}

function TextBlock({ text, label, color = 'var(--co7)' }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW = 600;
  const needsExpand = text.length > PREVIEW;
  const displayText = expanded ? text : text.slice(0, PREVIEW);

  return (
    <div>
      <div style={{
        fontFamily: 'var(--f-display)', fontSize: '.98rem', fontWeight: 400,
        color: 'var(--t1)', lineHeight: 1.8, whiteSpace: 'pre-wrap',
      }}>
        {displayText}
        {!expanded && needsExpand && <span style={{ color: 'var(--t5)' }}>…</span>}
      </div>
      {needsExpand && (
        <button onClick={() => setExpanded(v => !v)} style={{
          marginTop: 10, background: 'none', border: 'none',
          color, fontSize: '.7rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
          fontFamily: 'var(--f-mono)', padding: 0,
        }}>
          {expanded ? <><ChevronUp size={12}/> Recolher</> : <><ChevronDown size={12}/> Ler completo</>}
        </button>
      )}
    </div>
  );
}

export default function VerdictSection() {
  const { verdictText, devilText, jurirScore, scoreDims, vetoActive, analysisId, authToken, addToast, running, devilState, judgeState } = useStore();

  const hasVerdict = !!verdictText;
  const hasDevil   = !!devilText;
  const [downloading, setDownloading] = useState(false);

  if (!hasVerdict && !hasDevil && jurirScore === null) return null;

  const handleDownload = async () => {
    if (!analysisId || !authToken) { addToast('Faça login para baixar o PDF.', 'info'); return; }
    setDownloading(true);
    try { await downloadPdf(analysisId, authToken); addToast('✅ PDF gerado!', 'success'); }
    catch (e) { addToast(`Erro ao gerar PDF: ${e.message}`, 'error'); }
    finally { setDownloading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>

      {/* Verdict + Score row */}
      {(hasVerdict || jurirScore !== null) && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--b-cobalt)',
          borderRadius: 'var(--r-xl)', padding: 32,
          boxShadow: 'var(--shadow-cobalt)',
          display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 40,
          alignItems: 'start',
        }}>
          {/* Score ring */}
          {jurirScore !== null && (
            <div style={{ paddingTop: 8 }}>
              <ScoreRing score={jurirScore}/>
              {/* Dimensions */}
              {scoreDims && (
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 130 }}>
                  {Object.entries(scoreDims).map(([k, v]) => (
                    <div key={k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.56rem', color: 'var(--t4)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
                          {k.replace(/_/g, ' ')}
                        </span>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.56rem', color: scoreColor(v) }}>{v}</span>
                      </div>
                      <div style={{ height: 2, background: 'var(--shell)', borderRadius: 9, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${v}%`, background: scoreColor(v), borderRadius: 9, transition: 'width .8s var(--ease-out-expo)' }}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Verdict text */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 'var(--r-sm)',
                background: 'rgba(20,114,217,0.08)', border: '1px solid var(--b-cobalt)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
              }}>🏛️</div>
              <div>
                <div style={{ fontFamily: 'var(--f-sans)', fontSize: '.78rem', fontWeight: 600, color: 'var(--t0)', letterSpacing: '.02em' }}>
                  Veredicto Final — Juiz IA Quantum
                </div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--co7)', letterSpacing: '.1em' }}>
                  {judgeState?.status === 'running' ? 'DELIBERANDO…' : 'PROLATO'}
                </div>
              </div>
              {judgeState?.status === 'running' && <Loader2 size={14} className="spin" style={{ color: 'var(--co7)', marginLeft: 'auto' }}/>}
            </div>

            {vetoActive && (
              <div style={{
                background: 'rgba(192,24,24,0.05)', border: '1px solid rgba(192,24,24,0.2)',
                borderRadius: 'var(--r-sm)', padding: '10px 14px',
                fontFamily: 'var(--f-mono)', fontSize: '.7rem', color: 'var(--cr3)',
                letterSpacing: '.06em', marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>⚠</span> CASO VETADO PELO TRIBUNAL — ILEGALIDADE DETECTADA
              </div>
            )}

            {hasVerdict && <TextBlock text={verdictText} color="var(--co7)"/>}

            {/* PDF button */}
            {analysisId && (
              <button className="btn btn-ghost btn-sm" onClick={handleDownload} disabled={downloading}
                style={{ marginTop: 20, opacity: downloading ? 0.7 : 1 }}>
                {downloading ? <><Loader2 size={12} className="spin"/> Gerando…</> : <><Download size={12}/> Baixar PDF</>}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Devil's Advocate */}
      {hasDevil && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid rgba(192,24,24,0.18)',
          borderRadius: 'var(--r-xl)', padding: 32,
          boxShadow: '0 0 0 1px rgba(192,24,24,0.08), 0 4px 24px rgba(192,24,24,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--r-sm)',
              background: 'rgba(192,24,24,0.06)', border: '1px solid rgba(192,24,24,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            }}>⚔️</div>
            <div>
              <div style={{ fontFamily: 'var(--f-sans)', fontSize: '.78rem', fontWeight: 600, color: 'var(--t0)' }}>
                Advogado do Diabo
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--cr3)', letterSpacing: '.1em' }}>
                CONTRADITÓRIO COMPLETO
              </div>
            </div>
          </div>
          <TextBlock text={devilText} color="var(--cr3)"/>
        </div>
      )}
    </div>
  );
}
