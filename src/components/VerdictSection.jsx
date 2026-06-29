import { Scale, Shield, Download, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { downloadPdf } from '../lib/api';

// ── Reutiliza o mesmo renderer do AnalysisPanel ──────────────────────────────
function parseInline(str) {
  const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} style={{ color: 'var(--t0)', fontWeight: 600 }}>{p.slice(2,-2)}</strong>;
    if (p.startsWith('*') && p.endsWith('*'))
      return <em key={i}>{p.slice(1,-1)}</em>;
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} style={{ fontFamily: 'var(--f-mono)', fontSize: '.85em', color: 'var(--co7)', background: 'rgba(0,242,254,0.06)', borderRadius: 3, padding: '1px 5px' }}>{p.slice(1,-1)}</code>;
    return p;
  });
}

function MarkdownBlock({ text, baseColor = 'var(--t2)' }) {
  if (!text) return null;
  const cleaned = text.replace(/⟦JURIR:[^⟧]*⟧/g, '').trim();
  const lines = cleaned.split('\n');
  const els = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { els.push(<div key={i} style={{ height: 8 }} />); i++; continue; }

    if (line.startsWith('### ')) {
      els.push(<div key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: '.75rem', fontWeight: 600, color: 'var(--co7)', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 18, marginBottom: 6 }}>{line.slice(4)}</div>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      els.push(<div key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: '.82rem', fontWeight: 700, color: 'var(--t0)', marginTop: 20, marginBottom: 8 }}>{line.slice(3)}</div>);
      i++; continue;
    }
    if (line.startsWith('# ')) {
      els.push(<div key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--t0)', marginTop: 22, marginBottom: 8, letterSpacing: '-.01em' }}>{line.slice(2)}</div>);
      i++; continue;
    }
    if (/^[-_─━═]{3,}$/.test(line.trim())) {
      els.push(<div key={i} style={{ height: 1, background: 'var(--b-subtle)', margin: '14px 0' }} />);
      i++; continue;
    }
    if (/^[•\-\*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[•\-\*]\s/.test(lines[i])) { items.push(lines[i].replace(/^[•\-\*]\s/, '')); i++; }
      els.push(
        <ul key={`ul${i}`} style={{ margin: '6px 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {items.map((it, j) => (
            <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--f-sans)', fontSize: '1rem', color: baseColor, lineHeight: 1.7, letterSpacing: '.01em' }}>
              <span style={{ color: 'var(--co7)', flexShrink: 0, marginTop: 3, fontSize: '.65rem' }}>◆</span>
              <span>{parseInline(it)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }
    if (/^\d+[.)\s]/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+[.)\s]/.test(lines[i])) { items.push(lines[i].replace(/^\d+[.)\s]+/, '')); i++; }
      els.push(
        <ol key={`ol${i}`} style={{ margin: '6px 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
          {items.map((it, j) => (
            <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--f-sans)', fontSize: '1rem', color: baseColor, lineHeight: 1.7, letterSpacing: '.01em' }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--co7)', flexShrink: 0, marginTop: 4, minWidth: 18 }}>{j+1}.</span>
              <span>{parseInline(it)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }
    els.push(
      <p key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: '1rem', fontWeight: 400, color: baseColor, lineHeight: 1.75, margin: '0 0 2px', letterSpacing: '.01em' }}>
        {parseInline(line)}
      </p>
    );
    i++;
  }
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{els}</div>;
}

// ── Score gauge ───────────────────────────────────────────────────────────────
const SCORE_LABEL = s =>
  s >= 80 ? 'Fortemente Favorável' :
  s >= 65 ? 'Favorável' :
  s >= 50 ? 'Parcialmente Favorável' :
  s >= 35 ? 'Risco Moderado' : 'Alto Risco';

const scoreColor = s =>
  s >= 65 ? 'var(--jade2)' :
  s >= 40 ? '#F59E0B' : 'var(--cr3)';

function ScoreGauge({ score }) {
  const color = scoreColor(score);
  const angle = Math.min((score / 100) * 360, 360);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0, width: 120 }}>
      <div style={{
        width: 110, height: 110, borderRadius: '50%',
        background: `conic-gradient(${color} ${angle}deg, rgba(255,255,255,0.04) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 28px ${color}44`,
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          background: 'var(--abyss)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--f-sans)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--t0)', lineHeight: 1, letterSpacing: '-.03em' }}>{score}</span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.48rem', color: 'var(--t4)', letterSpacing: '.1em', marginTop: 2 }}>/100</span>
        </div>
      </div>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.52rem', color: 'var(--t4)', letterSpacing: '.18em', textTransform: 'uppercase' }}>JURIR SCORE</span>
      <span style={{ fontFamily: 'var(--f-sans)', fontSize: '.72rem', color, fontWeight: 600, textAlign: 'center', letterSpacing: '.02em', lineHeight: 1.3 }}>{SCORE_LABEL(score)}</span>
    </div>
  );
}

const DIM_LABELS = {
  viabilidade_juridica:    'Viabilidade Jurídica',
  risco_financeiro:        'Risco Financeiro',
  complexidade_processual: 'Complexidade Processual',
  urgencia:                'Urgência',
  score_consolidado:       'Score Consolidado',
};

function DimBar({ label, value }) {
  const display = DIM_LABELS[label] || label.replace(/_/g, ' ');
  const color = scoreColor(value);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.58rem', color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.10em' }}>{display}</span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color, fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 3, height: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: color, width: `${value}%`, transition: 'width 1s cubic-bezier(.22,1,.36,1)' }} />
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function VerdictSection() {
  const {
    verdictText, devilText, jurirScore, scoreDims,
    vetoActive, analysisId, authToken, addToast, running,
  } = useStore(s => ({
    verdictText: s.verdictText, devilText: s.devilText,
    jurirScore:  s.jurirScore,  scoreDims: s.scoreDims,
    vetoActive:  s.vetoActive,  analysisId: s.analysisId,
    authToken:   s.authToken,   addToast:  s.addToast,
    running:     s.running,
  }));

  const judgeState = useStore(s => s.judgeState);
  const hasContent = verdictText || devilText || running ||
    judgeState?.status === 'running' || judgeState?.status === 'done';
  if (!hasContent) return null;

  const handlePdf = async () => {
    if (!authToken || !analysisId) { addToast('Faça login para baixar o PDF.', 'info'); return; }
    try { await downloadPdf(analysisId, authToken); addToast('PDF gerado!', 'success'); }
    catch (e) { addToast(`Erro PDF: ${e.message}`, 'error'); }
  };

  return (
    <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Veto */}
      {vetoActive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--r-md)', padding: '13px 18px',
        }}>
          <AlertTriangle size={14} style={{ color: 'var(--cr3)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--f-sans)', fontSize: '.82rem', color: 'var(--cr4)', lineHeight: 1.5 }}>
            VETO ATIVADO — Caso de alta criticidade detectado. Consulte um advogado imediatamente.
          </span>
        </div>
      )}

      {/* Advogado do Diabo */}
      {devilText && (
        <div style={{
          background: 'rgba(239,68,68,0.03)',
          border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 'var(--r-xl)',
          padding: '24px 26px',
          boxShadow: '0 0 0 1px rgba(239,68,68,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
            <Shield size={13} style={{ color: 'var(--cr3)' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', fontWeight: 700, color: 'var(--cr3)', letterSpacing: '.15em', textTransform: 'uppercase' }}>
              Advogado do Diabo · Contraditório
            </span>
          </div>
          <div style={{ height: 1, background: 'rgba(239,68,68,0.10)', marginBottom: 18 }} />
          <MarkdownBlock text={devilText} baseColor="var(--t2)" />
        </div>
      )}

      {/* Loading do Juiz */}
      {devilText && !verdictText && (running || judgeState?.status === 'running') && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '13px 18px',
          background: 'rgba(0,242,254,0.03)', border: '1px solid var(--b-main)',
          borderRadius: 'var(--r-md)',
        }}>
          <Loader2 size={13} className="spin" style={{ color: 'var(--co7)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.72rem', color: 'var(--t3)' }}>
            ⚖️ Juiz IA deliberando o veredito final…
          </span>
        </div>
      )}

      {/* Veredicto do Juiz */}
      {verdictText && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--b-main)',
          borderRadius: 'var(--r-xl)',
          padding: '26px 26px 22px',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <Scale size={13} style={{ color: 'var(--co7)' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', fontWeight: 700, color: 'var(--co7)', letterSpacing: '.15em', textTransform: 'uppercase' }}>
              Veredicto do Juiz IA Quantum
            </span>
            {jurirScore != null && (
              <span style={{
                marginLeft: 'auto',
                background: `${scoreColor(jurirScore)}12`,
                border: `1px solid ${scoreColor(jurirScore)}30`,
                borderRadius: 999, padding: '2px 10px',
                fontFamily: 'var(--f-mono)', fontSize: '.56rem',
                color: scoreColor(jurirScore), letterSpacing: '.10em',
              }}>
                {SCORE_LABEL(jurirScore).toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ height: 1, background: 'var(--b-subtle)', marginBottom: 20 }} />

          {/* Corpo */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <MarkdownBlock text={verdictText} baseColor="var(--t1)" />
            </div>
            {jurirScore != null && (
              <div style={{ flexShrink: 0, paddingTop: 4 }}>
                <ScoreGauge score={jurirScore} />
              </div>
            )}
          </div>

          {/* Dimensões */}
          {scoreDims && Object.keys(scoreDims).length > 0 && (
            <div style={{ marginTop: 22, borderTop: '1px solid var(--b-subtle)', paddingTop: 18 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.55rem', color: 'var(--t4)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                Dimensões do Score
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 10 }}>
                {Object.entries(scoreDims)
                  .filter(([k, v]) => typeof v === 'number' && k in DIM_LABELS)
                  .map(([k, v]) => <DimBar key={k} label={k} value={v} />)}
              </div>
            </div>
          )}

          {/* Ações */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--b-subtle)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {analysisId && (
              <button className="btn btn-ghost-sm" onClick={handlePdf}>
                <Download size={12} /> Baixar PDF
              </button>
            )}
            {analysisId && (
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--t4)' }}>
                ID #{analysisId}
              </span>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={12} style={{ color: 'var(--jade2)' }} />
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--t3)' }}>Análise concluída</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
