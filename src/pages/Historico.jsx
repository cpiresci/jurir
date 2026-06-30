import { useEffect, useState } from 'react';
import { Clock, ChevronRight, FileText, Download, CheckSquare, Square, Archive } from 'lucide-react';
import { useStore } from '../store';
import { getAnalyses, getAnalysis, downloadPdf, downloadZip } from '../lib/api';

export default function HistoricoPage() {
  const { authToken, userData, openModal, addToast } = useStore();
  const [analyses,  setAnalyses]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [checked,   setChecked]   = useState(new Set());
  const [zipping,   setZipping]   = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const isEscritorio = userData?.is_escritorio;

  useEffect(() => {
    if (!authToken) return;
    setLoading(true);
    getAnalyses(authToken)
      .then(d => setAnalyses(Array.isArray(d) ? d : d.analyses || []))
      .catch(e => addToast(`Erro: ${e.message}`, 'error'))
      .finally(() => setLoading(false));
  }, [authToken]);

  const viewAnalysis = async (id) => {
    try { setSelected(await getAnalysis(id, authToken)); }
    catch (e) { addToast(`Erro: ${e.message}`, 'error'); }
  };

  const toggleCheck = (id, e) => {
    e.stopPropagation();
    setChecked(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleZip = async () => {
    if (checked.size < 2) return;
    setZipping(true);
    try { await downloadZip([...checked], authToken); addToast('ZIP baixado!', 'success'); }
    catch (e) { addToast(e.message, 'error'); }
    finally { setZipping(false); }
  };

  if (!authToken) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <Clock size={32} style={{ color: 'var(--p5)' }}/>
      <p style={{ color: 'var(--p4)' }}>Faça login para ver seu histórico.</p>
      <button className="btn btn-crimson" onClick={() => openModal('login')}>Entrar</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>
      <h1 className="t-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
        Histórico de Análises
      </h1>
      <p style={{ color: 'var(--p4)', fontSize: '.88rem', marginBottom: 24 }}>
        Todas as suas análises jurídicas anteriores.
      </p>

      {/* Barra de exportação ZIP — aparece apenas Plano Escritório e ≥ 2 selecionadas */}
      {isEscritorio && checked.size >= 2 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
          background: 'rgba(0,242,254,0.07)', border: '1px solid var(--b-main)',
          borderRadius: 'var(--r-md)', padding: '10px 16px',
        }}>
          <Archive size={15} style={{ color: 'var(--co7)' }} />
          <span style={{ fontSize: '.82rem', color: 'var(--co7)', fontWeight: 600 }}>
            {checked.size} análises selecionadas
          </span>
          <button className="btn btn-cobalt btn-sm" onClick={handleZip} disabled={zipping}>
            <Download size={13}/> {zipping ? 'Gerando ZIP…' : 'Exportar ZIP'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setChecked(new Set())}>Limpar</button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--p5)', padding: 60 }}>Carregando…</div>
      ) : analyses.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-lg)', padding: 48, textAlign: 'center' }}>
          <FileText size={32} style={{ color: 'var(--p5)', marginBottom: 12 }}/>
          <p style={{ color: 'var(--p4)' }}>Nenhuma análise encontrada.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {analyses.map(a => {
            const isChecked = checked.has(a.id);
            return (
              <div key={a.id} style={{
                background: isChecked ? 'rgba(0,242,254,0.04)' : 'var(--surface)',
                border: `1px solid ${isChecked ? 'var(--b-main)' : 'var(--b-neutral)'}`,
                borderRadius: 'var(--r-md)', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                transition: 'border-color .2s, background .2s',
              }}
              onMouseEnter={e => { if (!isChecked) e.currentTarget.style.borderColor = 'var(--b-crimson)'; }}
              onMouseLeave={e => { if (!isChecked) e.currentTarget.style.borderColor = 'var(--b-neutral)'; }}
              onClick={() => viewAnalysis(a.id)}
              >
                {/* Checkbox — só para Plano Escritório */}
                {isEscritorio && (
                  <div onClick={e => toggleCheck(a.id, e)} style={{ flexShrink: 0, color: isChecked ? 'var(--co7)' : 'var(--p5)', cursor: 'pointer' }}>
                    {isChecked ? <CheckSquare size={16}/> : <Square size={16}/>}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.88rem', color: 'var(--p1)', marginBottom: 4, fontWeight: 500 }}>
                    {a.prompt?.slice(0, 100) || `Análise #${a.id}`}{(a.prompt?.length || 0) > 100 ? '…' : ''}
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)' }}>
                    {a.created_at ? new Date(a.created_at).toLocaleString('pt-BR') : '—'}
                    {a.jurir_score != null && ` · Score: ${a.jurir_score}`}
                    {a.tribunal && ` · ${a.tribunal}`}
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--p5)', flexShrink: 0 }}/>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" style={{ maxWidth: 700, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 className="t-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>Análise #{selected.id}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" disabled={pdfLoading}
                  onClick={async () => {
                    setPdfLoading(true);
                    try { await downloadPdf(selected.id, authToken); }
                    catch (e) { addToast(e.message, 'error'); }
                    finally { setPdfLoading(false); }
                  }}>
                  {pdfLoading ? '…' : 'PDF'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>
            </div>
            <p style={{ fontSize: '.82rem', color: 'var(--p4)', marginBottom: 16, fontStyle: 'italic' }}>{selected.prompt}</p>
            {selected.verdict && (
              <div>
                <div style={{ fontSize: '.75rem', color: 'var(--au6)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>VEREDICTO</div>
                <p style={{ fontSize: '.88rem', color: 'var(--p2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.verdict}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
