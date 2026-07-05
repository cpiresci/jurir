import { Scale, Shield, Download, AlertTriangle, CheckCircle2, Loader2, ExternalLink, BookOpen } from 'lucide-react';
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
      els.push(<div key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--co7)', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: 18, marginBottom: 6 }}>{line.slice(4)}</div>);
      i++; continue;
    }
    if (line.startsWith('## ')) {
      els.push(<div key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--t0)', marginTop: 20, marginBottom: 8 }}>{line.slice(3)}</div>);
      i++; continue;
    }
    if (line.startsWith('# ')) {
      els.push(<div key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-md)', fontWeight: 700, color: 'var(--t0)', marginTop: 22, marginBottom: 8, letterSpacing: '-.01em' }}>{line.slice(2)}</div>);
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
            <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-md)', color: baseColor, lineHeight: 1.7, letterSpacing: '.01em' }}>
              <span style={{ color: 'var(--co7)', flexShrink: 0, marginTop: 3, fontSize: 'var(--fs-xs)' }}>◆</span>
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
            <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-md)', color: baseColor, lineHeight: 1.7, letterSpacing: '.01em' }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--co7)', flexShrink: 0, marginTop: 4, minWidth: 18 }}>{j+1}.</span>
              <span>{parseInline(it)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }
    els.push(
      <p key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-md)', fontWeight: 400, color: baseColor, lineHeight: 1.75, margin: '0 0 2px', letterSpacing: '.01em' }}>
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
          <span style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-3xl)', fontWeight: 700, color: 'var(--t0)', lineHeight: 1, letterSpacing: '-.03em' }}>{score}</span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t4)', letterSpacing: '.1em', marginTop: 2 }}>/100</span>
        </div>
      </div>
      <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t4)', letterSpacing: '.18em', textTransform: 'uppercase' }}>JURIR SCORE</span>
      <span style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-xs)', color, fontWeight: 600, textAlign: 'center', letterSpacing: '.02em', lineHeight: 1.3 }}>{SCORE_LABEL(score)}</span>
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
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.10em' }}>{display}</span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color, fontWeight: 600 }}>{value}</span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 3, height: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: color, width: `${value}%`, transition: 'width 1s cubic-bezier(.22,1,.36,1)' }} />
      </div>
    </div>
  );
}

// ── Citações estruturadas (chips clicáveis → fonte oficial) ───────────────────
function CitationChips({ citations }) {
  if (!citations || !citations.length) return null;
  return (
    <div style={{ marginTop: 22, borderTop: '1px solid var(--b-subtle)', paddingTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
        <BookOpen size={12} style={{ color: 'var(--co7)' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t4)', letterSpacing: '.16em', textTransform: 'uppercase' }}>
          Fontes Citadas
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {citations.map((c) => {
          // [wire-citation-validation] c.verified só existe depois do evento
          // 'citations_validated' (pós-veredito). undefined = ainda não
          // validado (ex. job interrompido antes do veredito) — trata como
          // neutro, igual ao comportamento anterior.
          const unverified = c.verified === false;
          const color = unverified ? 'var(--t4)' : 'var(--co7)';
          const bg    = unverified ? 'rgba(255,255,255,0.03)' : 'rgba(0,242,254,0.05)';
          const border = unverified ? 'rgba(255,255,255,0.10)' : 'rgba(0,242,254,0.18)';
          const bgHover    = unverified ? 'rgba(255,255,255,0.06)' : 'rgba(0,242,254,0.10)';
          const borderHover = unverified ? 'rgba(255,255,255,0.18)' : 'rgba(0,242,254,0.32)';
          const tooltip = unverified
            ? `${c.texto}\n\n⚠ Recuperado como contexto, mas não identificado no texto do veredito.`
            : c.verified
              ? `${c.texto}\n\n✓ Confirmado no texto do veredito.`
              : c.texto;
          return (
            <a
              key={c.id}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              title={tooltip}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: bg, border: `1px solid ${border}`,
                borderRadius: 999, padding: '5px 12px', textDecoration: 'none',
                fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color,
                letterSpacing: '.02em', opacity: unverified ? 0.62 : 1,
                transition: 'background .15s ease, border-color .15s ease, opacity .15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = bgHover; e.currentTarget.style.borderColor = borderHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = border; }}
            >
              {c.verified === true && <CheckCircle2 size={10} style={{ flexShrink: 0, color: 'var(--ok, #2ecc71)' }} />}
              <span>{c.diploma} {c.artigo}</span>
              <ExternalLink size={10} style={{ flexShrink: 0, opacity: .7 }} />
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ── Alerta de jurisprudência conflitante (mesmo processo, anos diferentes) ────
function CaselawWarningBanner({ warnings }) {
  if (!warnings || !warnings.length) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)',
      borderRadius: 'var(--r-md)', padding: '13px 18px',
    }}>
      <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-sm)', color: '#f59e0b', lineHeight: 1.5, fontWeight: 600 }}>
          Jurisprudência conflitante detectada
        </span>
        <span style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-xs)', color: 'var(--t3)', lineHeight: 1.6 }}>
          {warnings.map(w => `${w.citation} (anos: ${w.anosEncontrados.join(', ')})`).join(' · ')} — mesmo número citado com dados diferentes entre pareceres. Confirme na fonte oficial antes de usar.
        </span>
      </div>
    </div>
  );
}

// ── Alerta de artigo citado que não bate com o corpus de legislação ──────────
function CitationAuditBanner({ audit }) {
  const unsourced = audit?.unsourced;
  if (!unsourced || !unsourced.length) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)',
      borderRadius: 'var(--r-md)', padding: '13px 18px',
    }}>
      <AlertTriangle size={14} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 2 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-sm)', color: '#f59e0b', lineHeight: 1.5, fontWeight: 600 }}>
          Citação não localizada na base de legislação
        </span>
        <span style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-xs)', color: 'var(--t3)', lineHeight: 1.6 }}>
          {unsourced.map(c => `${c.diploma}, ${c.artigo}`).join(' · ')} — dispositivo citado na análise não foi encontrado no corpus de legislação. Confirme na fonte oficial antes de usar.
        </span>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function VerdictSection() {
  const {
    verdictText, devilText, jurirScore, scoreDims,
    vetoActive, analysisId, authToken, addToast, running,
    citations, caselawWarnings, citationAudit,
  } = useStore(s => ({
    verdictText: s.verdictText, devilText: s.devilText,
    jurirScore:  s.jurirScore,  scoreDims: s.scoreDims,
    vetoActive:  s.vetoActive,  analysisId: s.analysisId,
    authToken:   s.authToken,   addToast:  s.addToast,
    running:     s.running,     citations: s.citations,
    caselawWarnings: s.caselawWarnings,
    citationAudit:   s.citationAudit,
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
          <span style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-sm)', color: 'var(--cr4)', lineHeight: 1.5 }}>
            VETO ATIVADO — Caso de alta criticidade detectado. Consulte um advogado imediatamente.
          </span>
        </div>
      )}

      {/* Jurisprudência conflitante */}
      <CaselawWarningBanner warnings={caselawWarnings} />

      {/* Citação de artigo que não bate com o corpus */}
      <CitationAuditBanner audit={citationAudit} />

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
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--cr3)', letterSpacing: '.15em', textTransform: 'uppercase' }}>
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
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t3)' }}>
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
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--co7)', letterSpacing: '.15em', textTransform: 'uppercase' }}>
              Veredicto do Juiz IA Quantum
            </span>
            {jurirScore != null && (
              <span style={{
                marginLeft: 'auto',
                background: `${scoreColor(jurirScore)}12`,
                border: `1px solid ${scoreColor(jurirScore)}30`,
                borderRadius: 999, padding: '2px 10px',
                fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
                color: scoreColor(jurirScore), letterSpacing: '.10em',
              }}>
                {SCORE_LABEL(jurirScore).toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ height: 1, background: 'var(--b-subtle)', marginBottom: 20 }} />

          {/* Corpo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ minWidth: 0 }}>
              <MarkdownBlock text={verdictText} baseColor="var(--t1)" />
            </div>
            {jurirScore != null && (
              <div style={{
                display: 'flex', justifyContent: 'center',
                borderTop: '1px solid var(--b-subtle)',
                paddingTop: 24,
              }}>
                <ScoreGauge score={jurirScore} />
              </div>
            )}
          </div>

          {/* Dimensões */}
          {scoreDims && Object.keys(scoreDims).length > 0 && (
            <div style={{ marginTop: 22, borderTop: '1px solid var(--b-subtle)', paddingTop: 18 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t4)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 12 }}>
                Dimensões do Score
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 10 }}>
                {Object.entries(scoreDims)
                  .filter(([k, v]) => typeof v === 'number' && k in DIM_LABELS)
                  .map(([k, v]) => <DimBar key={k} label={k} value={v} />)}
              </div>
            </div>
          )}

          <CitationChips citations={citations} />

          {/* Ações */}
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--b-subtle)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {analysisId && (
              <button className="btn btn-ghost-sm" onClick={handlePdf}>
                <Download size={12} /> Baixar PDF
              </button>
            )}
            {analysisId && (
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t4)' }}>
                ID #{analysisId}
              </span>
            )}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={12} style={{ color: 'var(--jade2)' }} />
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t3)' }}>Análise concluída</span>
            </div>
          </div>

          {/* Aviso legal — reforço específico no rodapé do veredito */}
          <div style={{
            marginTop: 14, padding: '10px 14px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--b-subtle)',
            borderRadius: 'var(--r-md)',
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <AlertTriangle size={12} style={{ color: 'var(--t4)', flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontFamily: 'var(--f-sans)', fontSize: 'var(--fs-xs)', color: 'var(--t4)', lineHeight: 1.6 }}>
              Este veredito foi gerado por IA e tem caráter informativo. Não substitui a análise de um advogado habilitado pela OAB e não constitui aconselhamento jurídico vinculante.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
