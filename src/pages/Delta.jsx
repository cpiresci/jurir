import { useState, useRef } from 'react';
import SoloBanner from '../components/SoloBanner';
import { GitCompare, Loader2, TrendingUp, Paperclip } from 'lucide-react';
import { useStore } from '../store';
import { analyzeDelta, deltaHtml, analyzeDocument } from '../lib/api';

export default function DeltaPage() {
  const { authToken, userData, openModal, addToast } = useStore();
  // Guard: exige plano Solo+
  if (authToken && userData && !userData.is_unlimited) {
    return <SoloBanner feature="Delta Analysis" />;
  }

  const [doc1,    setDoc1]    = useState('');
  const [doc2,    setDoc2]    = useState('');
  const [lang,    setLang]    = useState('pt');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [htmlDiff, setHtmlDiff] = useState(null);
  const [htmlLoading, setHtmlLoading] = useState(false);
  // [fix-delta-anexar] Antes só existia colagem manual nos textareas.
  // Agora dá pra anexar PDF/DOCX/TXT direto — reaproveita o mesmo
  // extrator de texto (analyzeDocument → /api/document/analyze) já
  // usado na tela de Upload de Documentos.
  const [attaching, setAttaching] = useState({ 1: false, 2: false });
  const fileInput1 = useRef(null);
  const fileInput2 = useRef(null);

  const attachFile = async (file, slot) => {
    if (!file) return;
    if (!file.name.match(/\.(pdf|docx|txt)$/i)) { addToast('Somente PDF, DOCX ou TXT.', 'error'); return; }
    if (file.size > 10 * 1024 * 1024)           { addToast('Máximo 10 MB.', 'error'); return; }
    if (!authToken) { openModal('login'); return; }
    setAttaching(s => ({ ...s, [slot]: true }));
    try {
      const data = await analyzeDocument(file, authToken);
      const texto = data.texto_completo || data.document_analysis?.textoLimpo || '';
      if (!texto) { addToast('Não foi possível extrair texto do arquivo.', 'error'); return; }
      if (slot === 1) setDoc1(texto); else setDoc2(texto);
      addToast(`${file.name} anexado e extraído.`, 'success');
    } catch (e) {
      addToast(`Erro ao anexar: ${e.message}`, 'error');
    } finally {
      setAttaching(s => ({ ...s, [slot]: false }));
    }
  };

  const run = async () => {
    if (!authToken) { openModal('login'); return; }
    if (!doc1.trim() || !doc2.trim()) { addToast('Cole os dois documentos.', 'info'); return; }
    setLoading(true); setResult(null);
    try {
      const data = await analyzeDelta({ doc_v1: doc1, doc_v2: doc2, language: lang }, authToken);
      setResult(data);
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const runHtml = async () => {
    if (!authToken) { openModal('login'); return; }
    if (!doc1.trim() || !doc2.trim()) { addToast('Cole os dois documentos.', 'info'); return; }
    setHtmlLoading(true); setHtmlDiff(null);
    try {
      const html = await deltaHtml({ doc_v1: doc1, doc_v2: doc2, language: lang }, authToken);
      setHtmlDiff(html);
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setHtmlLoading(false);
    }
  };

  const RISK_COLOR = { critica: 'var(--cr4)', alta: 'var(--cr5)', media: 'var(--au5)', baixa: 'var(--jade2)' };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ridge)', border: '1px solid var(--b-crimson)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: '.72rem', color: 'var(--cr4)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <GitCompare size={11}/> DELTA ANALYSIS
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, marginBottom: 8 }}>
          Comparativo Jurídico
        </h1>
        <p style={{ color: 'var(--p4)', fontSize: '.9rem' }}>
          Analisa diferenças entre duas versões de um documento jurídico — contratos, petições, cláusulas.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {[
          { label: 'Documento Original (V1)', value: doc1, set: setDoc1, placeholder: 'Cole aqui a versão original…', slot: 1, ref: fileInput1 },
          { label: 'Documento Revisado (V2)',  value: doc2, set: setDoc2, placeholder: 'Cole aqui a versão revisada…', slot: 2, ref: fileInput2 },
        ].map(({ label, value, set, placeholder, slot, ref }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: '.78rem', color: 'var(--p4)', fontFamily: 'var(--f-mono)' }}>
                {label}
              </label>
              <input ref={ref} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }}
                onChange={e => attachFile(e.target.files[0], slot)} />
              <button type="button" className="btn btn-ghost btn-sm" disabled={attaching[slot]}
                onClick={() => ref.current?.click()}
                style={{ fontSize: '.74rem', padding: '4px 10px', whiteSpace: 'nowrap' }}>
                {attaching[slot] ? <Loader2 size={12} className="spin"/> : <Paperclip size={12}/>}
                {attaching[slot] ? ' Extraindo…' : ' Anexar arquivo'}
              </button>
            </div>
            <textarea value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
              style={{ width: '100%', minHeight: 280, resize: 'vertical',
                background: 'rgba(12,12,30,0.7)', border: '1px solid var(--b-neutral)',
                borderRadius: 'var(--r-md)', color: 'var(--p1)', fontFamily: 'var(--f-sans)',
                fontSize: '.85rem', lineHeight: 1.6, padding: '14px 16px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--cr3)'}
              onBlur={e  => e.target.style.borderColor = 'var(--b-neutral)'}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
        <select value={lang} onChange={e => setLang(e.target.value)}
          style={{ background: 'var(--ridge)', color: 'var(--p2)', border: '1px solid var(--b-neutral)',
            borderRadius: 'var(--r-sm)', padding: '9px 12px', fontFamily: 'var(--f-sans)', fontSize: '.82rem', outline: 'none' }}>
          <option value="pt">🇧🇷 Português</option>
          <option value="en">🇺🇸 English</option>
        </select>
        <button className="btn btn-ghost" onClick={runHtml} disabled={htmlLoading} style={{ whiteSpace: 'nowrap' }}>
          {htmlLoading ? <Loader2 size={14} className="spin"/> : <GitCompare size={14}/>} Diff Visual
        </button>
        <button className="btn btn-crimson btn-lg" onClick={run} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
          {loading ? <><Loader2 size={15} className="spin"/> Analisando…</> : <><GitCompare size={14}/> Comparar Documentos</>}
        </button>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
            {[
              { label: 'Delta Risk Score', val: result.delta_risk_score ?? '—', color: result.delta_risk_score > 70 ? 'var(--cr4)' : 'var(--au6)' },
              { label: 'Mudança Total',    val: result.overall_change_pct != null ? `${result.overall_change_pct.toFixed(1)}%` : '—', color: 'var(--p1)' },
              { label: 'Blocos Críticos',  val: result.critical_count ?? result.blocks?.filter(b => b.criticality === 'critica').length ?? '—', color: 'var(--cr5)' },
              { label: 'Total de Blocos',  val: result.blocks?.length ?? '—', color: 'var(--p3)' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
                <div style={{ fontSize: '.68rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--f-display)', color }}>{val}</div>
              </div>
            ))}
          </div>

          {result.semantic_impact && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: 20 }}>
              <div style={{ fontSize: '.78rem', color: 'var(--au6)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 12 }}>ANÁLISE SEMÂNTICA</div>
              {result.semantic_impact.summary && (
                <p style={{ fontSize: '.88rem', color: 'var(--p2)', lineHeight: 1.7, marginBottom: 12 }}>{result.semantic_impact.summary}</p>
              )}
              {result.semantic_impact.recommendations?.length > 0 && (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.semantic_impact.recommendations.map((rec, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, fontSize: '.84rem', color: 'var(--p3)' }}>
                      <TrendingUp size={14} style={{ color: 'var(--au6)', flexShrink: 0, marginTop: 2 }}/>{rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {result.blocks?.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: 20 }}>
              <div style={{ fontSize: '.78rem', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 16 }}>
                BLOCOS DE MUDANÇA ({result.blocks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto' }}>
                {result.blocks.map((b, i) => {
                  const crit  = b.criticality || 'baixa';
                  const color = RISK_COLOR[crit] || 'var(--p4)';
                  return (
                    <div key={i} style={{ border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`,
                      borderRadius: 'var(--r-sm)', padding: '12px 14px', background: 'var(--ridge)' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '.68rem', background: `${color}20`, color, borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--f-mono)', textTransform: 'uppercase' }}>{crit}</span>
                        {b.category && <span style={{ fontSize: '.7rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)' }}>{b.category}</span>}
                        {b.change_type && <span style={{ fontSize: '.7rem', color: 'var(--p4)' }}>{b.change_type}</span>}
                      </div>
                      {b.original && (
                        <div style={{ fontSize: '.8rem', color: 'var(--cr5)', background: 'rgba(185,28,28,0.06)',
                          borderRadius: 4, padding: '6px 10px', marginBottom: 6, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          − {b.original}
                        </div>
                      )}
                      {b.revised && (
                        <div style={{ fontSize: '.8rem', color: 'var(--jade2)', background: 'rgba(16,185,129,0.06)',
                          borderRadius: 4, padding: '6px 10px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          + {b.revised}
                        </div>
                      )}
                      {b.legal_context && (
                        <p style={{ fontSize: '.76rem', color: 'var(--p4)', marginTop: 8, lineHeight: 1.5 }}>{b.legal_context}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {htmlDiff && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000,
          display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--b-neutral)' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.8rem', color: 'var(--p3)' }}>DIFF VISUAL</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setHtmlDiff(null)}>Fechar ✕</button>
          </div>
          <iframe srcDoc={htmlDiff} style={{ flex: 1, border: 'none', background: '#fff' }} title="Delta Diff" />
        </div>
      )}
    </div>
  );
}
