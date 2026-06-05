import { useEffect, useState } from 'react';
import { Clock, ChevronRight, FileText } from 'lucide-react';
import { useStore } from '../store';
import { getAnalyses, getAnalysis, downloadPdf } from '../lib/api';

export default function HistoricoPage() {
  const { authToken, openModal, addToast } = useStore();
  const [analyses, setAnalyses] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!authToken) return;
    setLoading(true);
    getAnalyses(authToken)
      .then(d => setAnalyses(Array.isArray(d) ? d : d.analyses || []))
      .catch(e => addToast(`Erro: ${e.message}`, 'error'))
      .finally(() => setLoading(false));
  }, [authToken]);

  const viewAnalysis = async (id) => {
    try {
      const data = await getAnalysis(id, authToken);
      setSelected(data);
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    }
  };

  if (!authToken) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexDirection: 'column', gap: 16,
      }}>
        <Clock size={32} style={{ color: 'var(--n5)' }}/>
        <p style={{ color: 'var(--n4)' }}>Faça login para ver seu histórico.</p>
        <button className="btn btn-crimson" onClick={() => openModal('login')}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 60px' }}>
      <h1 className="t-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
        Histórico de Análises
      </h1>
      <p style={{ color: 'var(--n4)', fontSize: '.88rem', marginBottom: 32 }}>
        Todas as suas análises jurídicas anteriores.
      </p>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--n5)', padding: 60 }}>Carregando…</div>
      ) : analyses.length === 0 ? (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--bn)',
          borderRadius: 'var(--r-lg)', padding: 48, textAlign: 'center',
        }}>
          <FileText size={32} style={{ color: 'var(--n5)', marginBottom: 12 }}/>
          <p style={{ color: 'var(--n4)' }}>Nenhuma análise encontrada.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {analyses.map(a => (
            <div
              key={a.id}
              style={{
                background: 'var(--surface)', border: '1px solid var(--bn)',
                borderRadius: 'var(--r-md)', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                transition: 'border-color .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--br)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bn)'}
              onClick={() => viewAnalysis(a.id)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.88rem', color: 'var(--n1)', marginBottom: 4, fontWeight: 500 }}>
                  {a.prompt?.slice(0, 100) || `Análise #${a.id}`}
                  {(a.prompt?.length || 0) > 100 ? '…' : ''}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)' }}>
                  {a.created_at ? new Date(a.created_at).toLocaleString('pt-BR') : '—'}
                  {a.jurir_score != null && ` · Score: ${a.jurir_score}`}
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--n5)' }}/>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div
            className="modal-box"
            style={{ maxWidth: 700, maxHeight: '85vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 className="t-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Análise #{selected.id}
              </h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => downloadPdf(selected.id, authToken).catch(e => addToast(e.message, 'error'))}
                >
                  PDF
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>
            </div>
            <p style={{ fontSize: '.82rem', color: 'var(--n4)', marginBottom: 16, fontStyle: 'italic' }}>{selected.prompt}</p>
            {selected.verdict && (
              <div>
                <div style={{ fontSize: '.72rem', color: 'var(--g4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>VEREDICTO</div>
                <p style={{ fontSize: '.88rem', color: 'var(--n2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.verdict}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
