import { useState } from 'react';
import { GitCompare, Loader2, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import { analyzeDelta } from '../lib/api';

export default function DeltaPage() {
  const { authToken, openModal, addToast } = useStore();
  const [doc1,    setDoc1]    = useState('');
  const [doc2,    setDoc2]    = useState('');
  const [lang,    setLang]    = useState('pt');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

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

  const RISK_COLOR = { critica: 'var(--r3)', alta: 'var(--r4)', media: 'var(--g3)', baixa: 'var(--emerald2)' };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--lift)', border: '1px solid var(--br)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: '.72rem', color: 'var(--r3)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <GitCompare size={11}/> DELTA ANALYSIS
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, marginBottom: 8 }}>
          Comparativo Jurídico
        </h1>
        <p style={{ color: 'var(--n4)', fontSize: '.9rem' }}>
          Analisa diferenças entre duas versões de um documento jurídico — contratos, petições, cláusulas.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {[
          { label: 'Documento Original (V1)', value: doc1, set: setDoc1, placeholder: 'Cole aqui a versão original…' },
          { label: 'Documento Revisado (V2)',  value: doc2, set: setDoc2, placeholder: 'Cole aqui a versão revisada…' },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <label style={{ display: 'block', fontSize: '.78rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>
              {label}
            </label>
            <textarea value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
              style={{ width: '100%', minHeight: 280, resize: 'vertical',
                background: 'rgba(12,12,30,0.7)', border: '1px solid var(--bn)',
                borderRadius: 'var(--r-md)', color: 'var(--n1)', fontFamily: 'var(--f-sans)',
                fontSize: '.85rem', lineHeight: 1.6, padding: '14px 16px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--r2)'}
              onBlur={e  => e.target.style.borderColor = 'var(--bn)'}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 32, flexWrap: 'wrap' }}>
        <select value={lang} onChange={e => setLang(e.target.value)}
          style={{ background: 'var(--lift)', color: 'var(--n2)', border: '1px solid var(--bn)',
            borderRadius: 'var(--r-sm)', padding: '9px 12px', fontFamily: 'var(--f-sans)', fontSize: '.82rem', outline: 'none' }}>
          <option value="pt">🇧🇷 Português</option>
          <option value="en">🇺🇸 English</option>
        </select>
        <button className="btn btn-crimson btn-lg" onClick={run} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
          {loading ? <><Loader2 size={15} className="spin"/> Analisando…</> : <><GitCompare size={14}/> Comparar Documentos</>}
        </button>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
            {[
              { label: 'Delta Risk Score', val: result.delta_risk_score ?? '—', color: result.delta_risk_score > 70 ? 'var(--r3)' : 'var(--g4)' },
              { label: 'Mudança Total',    val: result.overall_change_pct != null ? `${result.overall_change_pct.toFixed(1)}%` : '—', color: 'var(--n1)' },
              { label: 'Blocos Críticos',  val: result.critical_count ?? result.blocks?.filter(b => b.criticality === 'critica').length ?? '—', color: 'var(--r4)' },
              { label: 'Total de Blocos',  val: result.blocks?.length ?? '—', color: 'var(--n3)' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
                <div style={{ fontSize: '.68rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--f-display)', color }}>{val}</div>
              </div>
            ))}
          </div>

          {result.semantic_impact && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-md)', padding: 20 }}>
              <div style={{ fontSize: '.78rem', color: 'var(--g4)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 12 }}>ANÁLISE SEMÂNTICA</div>
              {result.semantic_impact.summary && (
                <p style={{ fontSize: '.88rem', color: 'var(--n2)', lineHeight: 1.7, marginBottom: 12 }}>{result.semantic_impact.summary}</p>
              )}
              {result.semantic_impact.recommendations?.length > 0 && (
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.semantic_impact.recommendations.map((rec, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, fontSize: '.84rem', color: 'var(--n3)' }}>
                      <TrendingUp size={14} style={{ color: 'var(--g4)', flexShrink: 0, marginTop: 2 }}/>{rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {result.blocks?.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-md)', padding: 20 }}>
              <div style={{ fontSize: '.78rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 16 }}>
                BLOCOS DE MUDANÇA ({result.blocks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 500, overflowY: 'auto' }}>
                {result.blocks.map((b, i) => {
                  const crit  = b.criticality || 'baixa';
                  const color = RISK_COLOR[crit] || 'var(--n4)';
                  return (
                    <div key={i} style={{ border: `1px solid ${color}30`, borderLeft: `3px solid ${color}`,
                      borderRadius: 'var(--r-sm)', padding: '12px 14px', background: 'var(--lift)' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '.68rem', background: `${color}20`, color, borderRadius: 4, padding: '2px 7px', fontFamily: 'var(--f-mono)', textTransform: 'uppercase' }}>{crit}</span>
                        {b.category && <span style={{ fontSize: '.7rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)' }}>{b.category}</span>}
                        {b.change_type && <span style={{ fontSize: '.7rem', color: 'var(--n4)' }}>{b.change_type}</span>}
                      </div>
                      {b.original && (
                        <div style={{ fontSize: '.8rem', color: 'var(--r4)', background: 'rgba(185,28,28,0.06)',
                          borderRadius: 4, padding: '6px 10px', marginBottom: 6, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          − {b.original}
                        </div>
                      )}
                      {b.revised && (
                        <div style={{ fontSize: '.8rem', color: 'var(--emerald2)', background: 'rgba(16,185,129,0.06)',
                          borderRadius: 4, padding: '6px 10px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                          + {b.revised}
                        </div>
                      )}
                      {b.legal_context && (
                        <p style={{ fontSize: '.76rem', color: 'var(--n4)', marginTop: 8, lineHeight: 1.5 }}>{b.legal_context}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
