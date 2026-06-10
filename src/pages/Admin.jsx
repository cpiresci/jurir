import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart3, Zap, RefreshCw, Search, ChevronDown, ChevronUp, Plus, Minus, Settings } from 'lucide-react';
import { useStore } from '../store';
import { API_BASE } from '../lib/constants';

const INTERNAL_KEY = import.meta.env.VITE_JURIR_INTERNAL_KEY || '';

async function adminFetch(path, token, opts = {}) {
  const r = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Internal-Key': INTERNAL_KEY,
      ...opts.headers,
    },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export default function AdminPage() {
  const { authToken, userData } = useStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [creditInput, setCreditInput] = useState('');
  const [creditAction, setCreditAction] = useState(null);

  useEffect(() => {
    if (!authToken || !userData?.is_admin) { navigate('/'); return; }
    loadAll();
  }, [authToken]);

  async function loadAll() {
    setLoading(true); setErr('');
    try {
      // Wake-up: acorda o backend antes dos fetches reais
      try { await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(8000) }); } catch (_) {}
      const [s, u] = await Promise.all([
        adminFetch('/api/admin/stats', authToken),
        adminFetch('/api/admin/users', authToken),
      ]);
      setStats(s); setUsers(u);
    } catch (e) {
      // Retry único após 4s (cold start pode demorar até 50s no free tier)
      try {
        await new Promise(r => setTimeout(r, 4000));
        const [s, u] = await Promise.all([
          adminFetch('/api/admin/stats', authToken),
          adminFetch('/api/admin/users', authToken),
        ]);
        setStats(s); setUsers(u);
      } catch (e2) { setErr(e2.message); }
    }
    finally { setLoading(false); }
  }

  async function handleCredits(userId, action) {
    const amount = parseInt(creditInput);
    if (!amount || amount < 1) return;
    try {
      await adminFetch(`/api/admin/${action}-credits`, authToken, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, amount }),
      });
      setCreditInput(''); setCreditAction(null);
      loadAll();
    } catch (e) { setErr(e.message); }
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <RefreshCw size={24} className="spin" style={{ color: 'var(--co7)' }} />
    </div>
  );

  if (err) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', flexDirection: 'column', gap: 12 }}>
      <p style={{ color: 'var(--cr3)' }}>{err}</p>
      <button className="btn btn-cobalt" onClick={loadAll}>Tentar novamente</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '80px 16px 40px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t5)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 6 }}>JURIR · ADMIN</div>
            <h1 style={{ fontFamily: 'var(--f-display)', fontSize: '1.8rem', fontWeight: 400, color: 'var(--t0)', margin: 0 }}>Painel Administrativo</h1>
          </div>
          <button onClick={loadAll} style={{ background: 'none', border: '1px solid var(--b-main)', borderRadius: 'var(--r-sm)', padding: '8px 12px', cursor: 'pointer', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>

        {/* Stats cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Usuários', value: stats.total_users, icon: <Users size={16} /> },
              { label: 'Análises', value: stats.total_analyses, icon: <BarChart3 size={16} /> },
              { label: 'Hoje', value: stats.analyses_today, icon: <BarChart3 size={16} /> },
              { label: 'Jobs Ativos', value: stats.active_jobs, icon: <Zap size={16} /> },
              { label: 'SSE Conexões', value: stats.sse_active, icon: <Zap size={16} /> },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--b-main)', borderRadius: 'var(--r-md)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--t4)', marginBottom: 8, fontFamily: 'var(--f-mono)', fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  {icon} {label}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--t0)', fontFamily: 'var(--f-display)' }}>{value ?? '—'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Providers */}
        {stats?.providers && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--b-main)', borderRadius: 'var(--r-md)', padding: '16px 20px', marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Providers Ativos</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {stats.providers.map(p => (
                <span key={p} style={{ background: 'var(--bg-card2)', border: '1px solid var(--b-main)', borderRadius: 'var(--r-sm)', padding: '4px 10px', fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--co7)' }}>{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Users table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--b-main)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--b-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              Usuários ({filtered.length})
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-main)', border: '1px solid var(--b-main)', borderRadius: 'var(--r-sm)', padding: '6px 12px' }}>
              <Search size={13} style={{ color: 'var(--t4)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar email..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--t1)', fontSize: '.85rem', width: 180 }} />
            </div>
          </div>

          {filtered.map(u => (
            <div key={u.id} style={{ borderBottom: '1px solid var(--b-main)' }}>
              <div onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.85rem', color: 'var(--t1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--t4)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>
                    {u.created_at} · {u.analyses_count} análises
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--co7)' }}>{u.credits}cr</span>
                  {u.premium_credits > 0 && <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--co9)' }}>{u.premium_credits}pr</span>}
                  {expandedUser === u.id ? <ChevronUp size={14} style={{ color: 'var(--t4)' }} /> : <ChevronDown size={14} style={{ color: 'var(--t4)' }} />}
                </div>
              </div>

              {expandedUser === u.id && (
                <div style={{ padding: '0 20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="number" min="1" value={creditInput} onChange={e => setCreditInput(e.target.value)}
                      placeholder="Quantidade" style={{ background: 'var(--bg-main)', border: '1px solid var(--b-main)', borderRadius: 'var(--r-sm)', padding: '6px 10px', color: 'var(--t1)', fontSize: '.85rem', width: 120, outline: 'none' }} />
                    <button onClick={() => handleCredits(u.id, 'add')}
                      style={{ background: 'var(--co9)', border: 'none', borderRadius: 'var(--r-sm)', padding: '6px 14px', color: '#fff', cursor: 'pointer', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Plus size={13} /> Adicionar
                    </button>
                    <button onClick={() => handleCredits(u.id, 'remove')}
                      style={{ background: 'var(--cr3)', border: 'none', borderRadius: 'var(--r-sm)', padding: '6px 14px', color: '#fff', cursor: 'pointer', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Minus size={13} /> Remover
                    </button>
                    <button onClick={async () => { await adminFetch('/api/admin/set-credits', authToken, { method: 'POST', body: JSON.stringify({ user_id: u.id, amount: parseInt(creditInput) }) }); loadAll(); }}
                      style={{ background: 'var(--bg-card2)', border: '1px solid var(--b-main)', borderRadius: 'var(--r-sm)', padding: '6px 14px', color: 'var(--t2)', cursor: 'pointer', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Settings size={13} /> Definir
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
