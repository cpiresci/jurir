import { Scale, Shield, Download } from 'lucide-react';
import { useStore } from '../store';
import { downloadPdf } from '../lib/api';

function ScoreGauge({ score }) {
  const pct   = `${Math.round((score / 100) * 360)}deg`;
  const color = score >= 70 ? 'var(--emerald2)' : score >= 40 ? 'var(--g4)' : 'var(--r3)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 100, height: 100, borderRadius: '50%',
        background: `conic-gradient(${color} ${pct}, var(--bn2) 0%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 10, borderRadius: '50%',
          background: 'var(--surface)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--n0)' }}>
            {score}
          </span>
        </div>
      </div>
      <span style={{ fontSize: '.7rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', letterSpacing: '.1em' }}>
        JURIR SCORE
      </span>
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
          background: 'rgba(185,28,28,0.12)',
          border: '1px solid var(--br)',
          borderRadius: 'var(--r-sm)',
          padding: '10px 16px', marginBottom: 16,
          fontSize: '.82rem', color: 'var(--r4)',
          display: 'flex', gap: 8, alignItems: 'center',
        }}>
          ⚠️ VETO ATIVADO — Caso de alta criticidade detectado
        </div>
      )}

      {/* Devil's advocate */}
      {devilText && (
        <div style={{
          background: 'rgba(120,15,15,0.10)',
          border: '1px solid rgba(185,28,28,0.2)',
          borderRadius: 'var(--r-md)',
          padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Shield size={15} style={{ color: 'var(--r3)' }}/>
            <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--r3)', letterSpacing: '.08em', fontFamily: 'var(--f-mono)' }}>
              ADVOGADO DO DIABO
            </span>
          </div>
          <p style={{ fontSize: '.85rem', color: 'var(--n3)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>
            {devilText}
          </p>
        </div>
      )}

      {/* Judge verdict */}
      {verdictText && (
        <div className="verdict-box">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Scale size={16} style={{ color: 'var(--g4)' }}/>
                <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--g4)', letterSpacing: '.08em', fontFamily: 'var(--f-mono)' }}>
                  VEREDICTO DO JUIZ IA
                </span>
              </div>
              <p style={{ fontSize: '.9rem', color: 'var(--n1)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
                {verdictText}
              </p>
            </div>

            {jurirScore != null && (
              <div style={{ flexShrink: 0 }}>
                <ScoreGauge score={jurirScore}/>
              </div>
            )}
          </div>

          {/* Score dimensions */}
          {scoreDims && (
            <div style={{
              marginTop: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 10,
            }}>
              {Object.entries(scoreDims).map(([k, v]) => (
                <div key={k} style={{ background: 'var(--lift)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
                  <div style={{ fontSize: '.7rem', color: 'var(--n4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>{k}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 4, background: 'var(--bn2)', borderRadius: 'var(--r-pill)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${v}%`,
                        background: 'linear-gradient(90deg, var(--r2), var(--g4))',
                        borderRadius: 'var(--r-pill)',
                      }}/>
                    </div>
                    <span style={{ fontSize: '.72rem', color: 'var(--n3)', fontFamily: 'var(--f-mono)', flexShrink: 0 }}>{v}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {analysisId && (
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={handlePdf}>
                <Download size={13}/> Baixar PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
