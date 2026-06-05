import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, AlertTriangle, ChevronRight, Zap } from 'lucide-react';
import { useStore } from '../store';
import { analyzeDocument } from '../lib/api';

export default function DocumentosPage() {
  const { authToken, openModal, addToast } = useStore();
  const [context,  setContext]  = useState('');
  const [file,     setFile]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (!f.name.match(/\.(pdf|docx|txt)$/i)) { addToast('Somente PDF, DOCX ou TXT.', 'error'); return; }
    if (f.size > 10 * 1024 * 1024)           { addToast('Máximo 10 MB.', 'error'); return; }
    setFile(f); setResult(null);
  };

  const run = async () => {
    if (!authToken) { openModal('login'); return; }
    if (!file) { addToast('Selecione um arquivo.', 'info'); return; }
    setLoading(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('context', context);
      const data = await analyzeDocument(fd, authToken);
      setResult(data);
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const useAsPrompt = () => {
    if (!result?.enriched_prompt) return;
    sessionStorage.setItem('jurir_doc_prompt', result.enriched_prompt);
    window.location.href = '/#analise';
    addToast('Prompt enriquecido carregado! Selecione o modo Premium.', 'success');
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--lift)', border: '1px solid var(--br)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: '.72rem', color: 'var(--r3)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <FileText size={11}/> ANÁLISE DE DOCUMENTOS
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, marginBottom: 8 }}>
          Upload de Documentos
        </h1>
        <p style={{ color: 'var(--n4)', fontSize: '.9rem' }}>
          Faça upload de contratos, petições ou qualquer documento jurídico. O sistema extrai cláusulas críticas e gera um prompt enriquecido para análise completa.
        </p>
      </div>

      <div onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${dragging ? 'var(--r3)' : file ? 'var(--emerald2)' : 'var(--bn)'}`,
          borderRadius: 'var(--r-lg)', padding: '48px 24px',
          textAlign: 'center', cursor: 'pointer', marginBottom: 20,
          background: dragging ? 'rgba(185,28,28,0.04)' : 'var(--surface)',
          transition: 'border-color .2s, background .2s',
        }}>
        <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])} />
        {file ? (
          <>
            <FileText size={32} style={{ color: 'var(--emerald2)', marginBottom: 10 }}/>
            <div style={{ fontWeight: 600, color: 'var(--n1)', marginBottom: 4 }}>{file.name}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)' }}>
              {(file.size / 1024).toFixed(0)} KB · clique para trocar
            </div>
          </>
        ) : (
          <>
            <Upload size={32} style={{ color: 'var(--n5)', marginBottom: 10 }}/>
            <div style={{ fontWeight: 600, color: 'var(--n2)', marginBottom: 4 }}>Arraste ou clique para selecionar</div>
            <div style={{ fontSize: '.78rem', color: 'var(--n5)' }}>PDF · DOCX · TXT · máx. 10 MB</div>
          </>
        )}
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontSize: '.78rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>
          CONTEXTO ADICIONAL (opcional)
        </label>
        <textarea value={context} onChange={e => setContext(e.target.value)}
          placeholder="Ex: Contrato de trabalho — verificar cláusulas de não-concorrência…"
          style={{ width: '100%', minHeight: 80, resize: 'vertical',
            background: 'rgba(12,12,30,0.7)', border: '1px solid var(--bn)',
            borderRadius: 'var(--r-md)', color: 'var(--n1)', fontFamily: 'var(--f-sans)',
            fontSize: '.88rem', lineHeight: 1.6, padding: '12px 16px', outline: 'none' }}
          onFocus={e => e.target.style.borderColor = 'var(--r2)'}
          onBlur={e  => e.target.style.borderColor = 'var(--bn)'}
        />
      </div>

      <button className="btn btn-crimson btn-lg" onClick={run} disabled={loading || !file}
        style={{ width: '100%', justifyContent: 'center', marginBottom: 32 }}>
        {loading ? <><Loader2 size={15} className="spin"/> Processando…</> : <><Upload size={14}/> Analisar Documento</>}
      </button>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
            {[
              { label: 'Tipo',              val: result.tipo_documento || '—' },
              { label: 'Páginas',           val: result.paginas ?? '—' },
              { label: 'Cláusulas Críticas',val: result.warnings_count ?? 0 },
              { label: 'Valor Envolvido',   val: result.valor_envolvido || '—' },
            ].map(({ label, val }) => (
              <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-md)', padding: '14px 16px' }}>
                <div style={{ fontSize: '.68rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--n1)' }}>{val}</div>
              </div>
            ))}
          </div>

          {result.partes && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-md)', padding: 18 }}>
              <div style={{ fontSize: '.72rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginBottom: 10 }}>PARTES</div>
              {Object.entries(result.partes).map(([k, v]) => v && (
                <div key={k} style={{ display: 'flex', gap: 10, fontSize: '.85rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--n5)', minWidth: 90, textTransform: 'capitalize' }}>{k}:</span>
                  <span style={{ color: 'var(--n1)' }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {result.clausulas_criticas?.length > 0 && (
            <div style={{ background: 'var(--surface)', border: '1px solid rgba(185,28,28,0.2)', borderRadius: 'var(--r-md)', padding: 18 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                <AlertTriangle size={14} style={{ color: 'var(--r3)' }}/>
                <div style={{ fontSize: '.72rem', color: 'var(--r3)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em' }}>
                  CLÁUSULAS CRÍTICAS ({result.clausulas_criticas.length})
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.clausulas_criticas.map((c, i) => (
                  <div key={i} style={{ background: 'rgba(185,28,28,0.05)', border: '1px solid rgba(185,28,28,0.15)',
                    borderRadius: 'var(--r-sm)', padding: '10px 14px' }}>
                    <div style={{ fontSize: '.82rem', color: 'var(--n2)', lineHeight: 1.6 }}>{c}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.texto_preview && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-md)', padding: 18 }}>
              <div style={{ fontSize: '.72rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginBottom: 10 }}>PREVIEW DO TEXTO</div>
              <p style={{ fontSize: '.82rem', color: 'var(--n4)', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{result.texto_preview}…</p>
            </div>
          )}

          {result.enriched_prompt && (
            <div style={{ background: 'linear-gradient(135deg, var(--surface), var(--lift))',
              border: '1px solid var(--br)', borderRadius: 'var(--r-lg)', padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: '.88rem', color: 'var(--n2)', marginBottom: 12 }}>
                Documento processado. Envie para análise jurídica completa pelos 16 agentes.
              </div>
              <button className="btn btn-crimson" onClick={useAsPrompt}>
                <Zap size={14}/> Analisar com os 16 Agentes <ChevronRight size={14}/>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
