import { Scale, Shield, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store';
import { downloadPdf } from '../lib/api';

const SCORE_LABEL = (s) =>
  s >= 80 ? 'Fortemente Favorável' :
  s >= 65 ? 'Favorável' :
  s >= 50 ? 'Parcialmente Favorável' :
  s >= 35 ? 'Risco Moderado' :
  'Alto Risco';

function ScoreGauge({ score }) {
  const angle = (score / 100) * 360;
  const color =
    score >= 70 ? 'var(--emerald2)' :
    score >= 40 ? 'var(--g4)' : 'var(--r3)';
  const ringClass =
    score >= 70 ? 'score-ring-high' :
    score >= 40 ? 'score-ring-mid' : 'score-ring-low';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        className={ringClass}
        style={{
          width: 96, height: 96, borderRadius: '50%',
          background: `conic-gradient(${color} ${angle}deg, var(--bn2) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          background: 'var(--surface)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 0,
        }}>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--n0)', lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: '.52rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', letterSpacing: '.04em' }}>
            / 100
          </span>
        </div>
      </div>
      <span style={{ fontSize: '.62rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', letterSpacing: '.1em', textAlign: 'center' }}>
        JURIR SCORE
      </span>
      <span style={{ fontSize: '.7rem', color, fontWeight: 600, textAlign: 'center' }}>
        {SCORE_LABEL(score)}
      </span>
    </div>
  );
}

function DimBar({ label, value }) {
  const color =
    value >= 70 ? 'var(--emerald2)' :
    value >= 40 ? 'var(--g4)' : 'var(--r3)';
  return (
    <div style={{ background: 'var(--lift)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '.68rem', color: 'var(--n4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          {label}
        </span>
        <span style={{ fontSize: '.7rem', color, fontFamily: 'var(--f-mono)', fontWeight: 600 }}>
          {value}
        </span>
      </div>
      <div className="conf-bar">
        <div className="conf-fill" style={{ width: `${value}%`, background: color }}/>
      </div>
    </div>
  );
}

export default function VerdictSection() {
  const {
    verdictText, devilText, jurirScore, scoreDims,
    vetoActive, analysisId, authToken, addToast, running,
  } = useStore(s => ({
    verdictText: s.verdictText, devilText: s.devilText,
    jurirScore: s.jurirScore,   scoreDims: s.scoreDims,
    vetoActive: s.vetoActive,   analysisId: s.analysisId,
    authToken: s.authToken,     addToast: s.addToast,
    running: s.running,
  }));

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

  if (!verdictText && !running) return null;

  return (
    <div style={{ marginTop: 32 }}>

      {/* Veto banner */}
      {vetoActive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(185,28,28,.12)', border: '1px solid var(--br)',
          borderRadius: 'var(--r-sm)', padding: '12px 16px', marginBottom: 16,
        }}>
          <AlertTriangle size={14} style={{ color: 'var(--r4)', flexShrink: 0 }}/>
          <span style={{ fontSize: '.82rem', color: 'var(--r4)' }}>
            VETO ATIVADO — Caso de alta criticidade detectado. Consulte um advogado imediatamente.
          </span>
        </div>
      )}

      {/* Devil's Advocate */}
      {devilText && (
        <div className="devil-card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Shield size={14} style={{ color: 'var(--r3)' }}/>
            <span style={{
              fontSize: '.75rem', fontWeight: 700, color: 'var(--r3)',
              letterSpacing: '.1em', fontFamily: 'var(--f-mono)',
            }}>
              ADVOGADO DO DIABO · CONTRADITÓRIO
            </span>
          </div>
          <p style={{ fontSize: '.85rem', color: 'var(--n3)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
            {devilText}
          </p>
        </div>
      )}

      {/* Judge verdict */}
      {verdictText && (
        <div className="verdict-box-v2">

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Scale size={15} style={{ color: 'var(--g4)' }}/>
                <span style={{
                  fontSize: '.75rem', fontWeight: 700, color: 'var(--g4)',
                  letterSpacing: '.1em', fontFamily: 'var(--f-mono)',
                }}>
                  VEREDICTO DO JUIZ IA QUANTUM
                </span>
                {jurirScore != null && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(202,138,4,.1)', border: '1px solid rgba(202,138,4,.2)',
                    borderRadius: 'var(--r-pill)', padding: '2px 8px',
                    fontSize: '.62rem', color: 'var(--g4)', fontFamily: 'var(--f-mono)',
                  }}>
                    {SCORE_LABEL(jurirScore).toUpperCase()}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '.88rem', color: 'var(--n1)', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>
                {verdictText}
              </p>
            </div>

            {/* Score gauge */}
            {jurirScore != null && (
              <div style={{ flexShrink: 0, paddingTop: 4 }}>
                <ScoreGauge score={jurirScore}/>
              </div>
            )}
          </div>

          {/* Score dimensions */}
          {scoreDims && Object.keys(scoreDims).length > 0 && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--bn2)', paddingTop: 16 }}>
              <div style={{ fontSize: '.68rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', letterSpacing: '.1em', marginBottom: 10 }}>
                DIMENSÕES DO SCORE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 8 }}>
                {Object.entries(scoreDims).map(([k, v]) => (
                  <DimBar key={k} label={k} value={v}/>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--bn2)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {analysisId && (
              <button className="btn btn-ghost btn-sm" onClick={handlePdf}>
                <Download size={13}/> Baixar PDF
              </button>
            )}
            {analysisId && (
              <span style={{ fontSize: '.7rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)' }}>
                ID: #{analysisId}
              </span>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={12} style={{ color: 'var(--emerald2)' }}/>
              <span style={{ fontSize: '.68rem', color: 'var(--n5)' }}>Análise concluída</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
