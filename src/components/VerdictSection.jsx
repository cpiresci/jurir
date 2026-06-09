import { Scale, Shield, Download, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
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
    score >= 40 ? 'var(--flame)' : 'var(--flame)';
  const ringClass =
    score >= 70 ? 'score-ring-high' :
    score >= 40 ? 'score-ring-mid' : 'score-ring-low';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div className={ringClass} style={{
        width: 104, height: 104, borderRadius: '50%',
        background: `conic-gradient(${color} ${angle}deg, rgba(250,248,244,0.04) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          background: 'var(--deep)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--n0)', lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: '.5rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em' }}>
            / 100
          </span>
        </div>
      </div>
      <span style={{ fontSize: '.6rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', letterSpacing: '.12em', textAlign: 'center' }}>
        JURIR SCORE
      </span>
      <span style={{ fontSize: '.72rem', color, fontWeight: 600, textAlign: 'center' }}>
        {SCORE_LABEL(score)}
      </span>
    </div>
  );
}

function DimBar({ label, value }) {
  const color =
    value >= 70 ? 'var(--emerald2)' :
    value >= 40 ? 'var(--flame)' : 'var(--flame)';
  return (
    <div className="dim-bar-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <span style={{ fontSize: '.65rem', color: 'var(--n4)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          {label}
        </span>
        <span style={{ fontSize: '.68rem', color, fontFamily: 'var(--f-mono)', fontWeight: 600 }}>
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
    if (!authToken || !analysisId) { addToast('Faça login para baixar o PDF.', 'info'); return; }
    try { await downloadPdf(analysisId, authToken); addToast('PDF gerado!', 'success'); }
    catch (e) { addToast(`Erro PDF: ${e.message}`, 'error'); }
  };

  // [FIX v7.0] Mantém seção visível se devil já chegou mas juiz ainda não
  // (evita que VerdictSection desapareça quando running=false antes do verdict)
  const judgeState = useStore(s => s.judgeState);
  if (!verdictText && !devilText && !running && judgeState.status !== "done") return null;

  return (
    <div style={{ marginTop: 36 }}>

      {/* Veto */}
      {vetoActive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(176,30,30,0.10)', border: '1px solid var(--br-cr)',
          borderRadius: 'var(--r-sm)', padding: '13px 18px', marginBottom: 16,
        }}>
          <AlertTriangle size={14} style={{ color: 'var(--flame-lt)', flexShrink: 0 }}/>
          <span style={{ fontSize: '.82rem', color: 'var(--flame-lt)' }}>
            VETO ATIVADO — Caso de alta criticidade detectado. Consulte um advogado imediatamente.
          </span>
        </div>
      )}

      {/* Devil */}
      {devilText && (
        <div className="devil-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Shield size={13} style={{ color: 'var(--flame)' }}/>
            <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--flame)', letterSpacing: '.12em', fontFamily: 'var(--f-mono)' }}>
              ADVOGADO DO DIABO · CONTRADITÓRIO
            </span>
          </div>
          <p style={{ fontSize: '.86rem', color: 'var(--n3)', lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>
            {devilText}
          </p>
        </div>
      )}

      {/* Loading do Juiz — devil chegou mas veredito ainda não */}
      {devilText && !verdictText && (running || judgeState.status === 'running') && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px', marginTop: 16,
          background: 'rgba(194,136,10,0.06)',
          border: '1px solid var(--br-flame)', borderRadius: 'var(--r-sm)',
        }}>
          <Loader2 size={13} className="spin" style={{ color: 'var(--flame)', flexShrink: 0 }}/>
          <span style={{ fontSize: '.82rem', color: 'var(--n4)' }}>
            ⚖️ Juiz IA deliberando o veredito final…
          </span>
        </div>
      )}

      {/* Verdict */}
      {verdictText && (
        <div className="verdict-box">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Scale size={14} style={{ color: 'var(--flame)' }}/>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--flame)', letterSpacing: '.12em', fontFamily: 'var(--f-mono)' }}>
                  VEREDICTO DO JUIZ IA QUANTUM
                </span>
                {jurirScore != null && (
                  <span style={{
                    marginLeft: 'auto',
                    background: 'rgba(194,136,10,0.08)', border: '1px solid var(--br-flame)',
                    borderRadius: 'var(--r-pill)', padding: '2px 10px',
                    fontSize: '.62rem', color: 'var(--flame)', fontFamily: 'var(--f-mono)',
                  }}>
                    {SCORE_LABEL(jurirScore).toUpperCase()}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '.9rem', color: 'var(--n1)', lineHeight: 1.85, whiteSpace: 'pre-wrap', margin: 0 }}>
                {verdictText}
              </p>
            </div>

            {jurirScore != null && (
              <div style={{ flexShrink: 0, paddingTop: 2 }}>
                <ScoreGauge score={jurirScore}/>
              </div>
            )}
          </div>

          {/* Dimensions */}
          {scoreDims && Object.keys(scoreDims).length > 0 && (
            <div style={{ marginTop: 24, borderTop: '1px solid var(--br-n2)', paddingTop: 20 }}>
              <div style={{ fontSize: '.65rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', letterSpacing: '.12em', marginBottom: 12 }}>
                DIMENSÕES DO SCORE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px,1fr))', gap: 8 }}>
                {Object.entries(scoreDims).map(([k, v]) => (
                  <DimBar key={k} label={k} value={v}/>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--br-n2)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {analysisId && (
              <button className="btn btn-ghost btn-sm" onClick={handlePdf}>
                <Download size={13}/> Baixar PDF
              </button>
            )}
            {analysisId && (
              <span style={{ fontSize: '.68rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)' }}>
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
