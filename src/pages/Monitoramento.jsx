import { useState, useEffect } from 'react';
import SoloBanner from '../components/SoloBanner';
import { Bell, Plus, Trash2, Loader2, RefreshCw, Activity } from 'lucide-react';
import { useStore } from '../store';
import { addMonitoring, listMonitoring, removeMonitoring, checkMonitoring } from '../lib/api';

const TRIBUNAIS = ['TJSP','TJRJ','TJMG','TJRS','TJPR','TJSC','TJBA','TJPE','TJCE','TJGO','STJ','STF','TRT2','TRT15','TRF1','TRF3'];

export default function MonitoramentoPage() {
  const { authToken, userData, openModal, addToast } = useStore();
  // Guard: exige plano Solo+
  if (authToken && userData && !userData.is_unlimited) {
    return <SoloBanner feature="Monitoramento Processual" />;
  }

  const [list,     setList]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [adding,   setAdding]   = useState(false);
  const [removing, setRemoving] = useState(null);
  const [checking, setChecking] = useState(null);
  const [form, setForm] = useState({ numero_processo: '', tribunal: 'TJSP' });

  const load = async () => {
    if (!authToken) return;
    setLoading(true);
    try {
      const data = await listMonitoring(authToken);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [authToken]);

  const handleAdd = async () => {
    if (!authToken) { openModal('login'); return; }
    if (!form.numero_processo.trim()) { addToast('Informe o número do processo.', 'info'); return; }
    setAdding(true);
    try {
      await addMonitoring(form, authToken);
      addToast('Processo adicionado ao monitoramento.', 'success');
      setForm(f => ({ ...f, numero_processo: '' }));
      await load();
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (num) => {
    setRemoving(num);
    try {
      await removeMonitoring(num, authToken);
      addToast('Processo removido.', 'info');
      setList(l => l.filter(p => p.numero_processo !== num));
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setRemoving(null);
    }
  };

  const handleCheck = async (id) => {
    setChecking(id);
    try {
      const data = await checkMonitoring(id, authToken);
      if (data.houve_atualizacao) {
        addToast('Nova movimentação encontrada!', 'success');
        await load();
      } else {
        addToast('Sem novas movimentações.', 'info');
      }
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setChecking(null);
    }
  };

  if (!authToken) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <Bell size={32} style={{ color: 'var(--p5)' }}/>
      <p style={{ color: 'var(--p4)' }}>Faça login para monitorar processos.</p>
      <button className="btn btn-crimson" onClick={() => openModal('login')}>Entrar</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ridge)', border: '1px solid var(--b-crimson)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: 'var(--fs-xs)', color: 'var(--cr4)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <Activity size={11}/> MONITORAMENTO PROCESSUAL
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, marginBottom: 8 }}>Monitorar Processos</h1>
        <p style={{ color: 'var(--p4)', fontSize: 'var(--fs-base)' }}>Acompanhe movimentações via DATAJUD com atualizações automáticas diárias.</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>NÚMERO DO PROCESSO (CNJ)</label>
            <input className="fg-input" value={form.numero_processo} placeholder="0000000-00.0000.0.00.0000"
              onChange={e => setForm(f => ({ ...f, numero_processo: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>TRIBUNAL</label>
            <select className="fg-input" value={form.tribunal} onChange={e => setForm(f => ({ ...f, tribunal: e.target.value }))}>
              {TRIBUNAIS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn btn-crimson" onClick={handleAdd} disabled={adding} style={{ alignSelf: 'flex-end' }}>
            {adding ? <Loader2 size={15} className="spin"/> : <Plus size={15}/>} Adicionar
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'var(--fs-lg)', fontWeight: 600 }}>Processos Monitorados ({list.length})</h2>
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'spin' : ''}/> Atualizar
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--p5)', padding: 40 }}>Carregando…</div>
      ) : list.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-lg)', padding: 48, textAlign: 'center' }}>
          <Bell size={32} style={{ color: 'var(--p5)', marginBottom: 12 }}/>
          <p style={{ color: 'var(--p4)' }}>Nenhum processo em monitoramento.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(p => (
            <div key={p.numero_processo} style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)',
              borderRadius: 'var(--r-md)', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-base)', color: 'var(--p1)', fontWeight: 600 }}>{p.numero_processo}</span>
                  <span style={{ fontSize: 'var(--fs-xs)', background: 'var(--ridge)', border: '1px solid var(--b-neutral)', borderRadius: 4, padding: '1px 8px', color: 'var(--p4)', fontFamily: 'var(--f-mono)' }}>{p.tribunal}</span>
                  {p.score_atual != null && <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--au6)', fontFamily: 'var(--f-mono)' }}>Score: {p.score_atual}</span>}
                </div>
                {p.ultima_mov && <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--p3)', marginBottom: 4 }}>Última mov: {p.ultima_mov}</div>}
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', fontFamily: 'var(--f-mono)' }}>
                  Atualizado: {p.updated_at ? new Date(p.updated_at).toLocaleString('pt-BR') : '—'}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => handleCheck(p.id)}
                disabled={checking === p.id}
                style={{ borderColor: 'rgba(99,102,241,0.2)', color: 'var(--p3)' }}>
                {checking === p.id ? <Loader2 size={13} className="spin"/> : <RefreshCw size={13}/>}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(p.numero_processo)}
                disabled={removing === p.numero_processo}
                style={{ borderColor: 'rgba(185,28,28,0.2)', color: 'var(--cr5)' }}>
                {removing === p.numero_processo ? <Loader2 size={13} className="spin"/> : <Trash2 size={13}/>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
