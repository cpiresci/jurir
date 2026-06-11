import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BarChart3, Zap, RefreshCw, Search, ChevronDown, ChevronUp, Plus, Minus, Settings } from 'lucide-react';
import { useStore } from '../store';
import { apiFetch } from '../lib/api';
import { API_BASE } from '../lib/constants';

const INTERNAL_KEY = import.meta.env.VITE_JURIR_INTERNAL_KEY || '';

async function adminFetch(path, token, opts = {}) {
  const r = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Jurir-Key': INTERNAL_KEY,
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

  useEffect(() => {
    if (!authToken) { navigate('/'); return; }
    // Busca /api/auth/me para garantir is_admin atualizado
    apiFetch('/api/auth/me', {}, authToken)
      .then(me => {
        if (!me?.is_admin) { navigate('/'); return; }
        loadAll();
      })
      .catch(() => navigate('/'));
  }, [authToken]);

  async function loadAll() {
    setLoading(true); setErr('');
    try {
      const [s, u] = await Promise.all([
        adminFetch('/api/admin/stats', authToken),
        adminFetch('/api/admin/users', authToken),
      ]);
      setStats(s); setUsers(u);
    } catch (e) { setErr(e.message); }
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
      setCreditInput(''); loadAll();
    } catch (e) { setErr(e.message); }
  }

  async function handleSetCredits(userId) {
    const amount = parseInt(creditInput);
    if (!amount || amount < 1) return;
    try {
      await adminFetch('/api/admin/set-credits', authToken, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId, amount }),
      });
      setCreditInput(''); loadAll();
    } catch (e) { setErr(e.message); }
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <RefreshCw size={24} className="spin" style={{ color: 'var(--r3)' }} />
    </div>
  );

  if (err) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <p style={{ color: 'var(--r3)' }}>{err}</p>
      <button className="btn btn-crimson" onClick={loadAll}>Tentar novamente</button>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', padding: '100px 16px 60px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--n4)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 6 }}>JURIR · ADMIN</div>
            <h1 className="t-display" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--n0)', margin: 0 }}>Painel Administrativo</h1>
          </div>
          <button onClick={loadAll} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Atualizar
          </button>
        </div>
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
            {[
              { label: 'Usuários',    value: stats.total_users,    icon: <Users size={16} /> },
              { label: 'Análises',    value: stats.total_analyses, icon: <BarChart3 size={16} /> },
              { label: 'Hoje',        value: stats.analyses_today, icon: <BarChart3 size={16} /> },
              { label: 'Jobs Ativos', value: stats.active_jobs,    icon: <Zap size={16} /> },
              { label: 'SSE Ativas',  value: stats.sse_active,     icon: <Zap size={16} /> },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-md)', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--n4)', marginBottom: 8, fontFamily: 'var(--f-mono)', fontSize: '.65rem', letterSpacing: '.1em', textTransform: 'uppercase' }}>
                  {icon} {label}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--n0)', fontFamily: 'var(--f-display)' }}>{value ?? '—'}</div>
              </div>
            ))}
          </div>
        )}
        {stats?.providers && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-md)', padding: '16px 20px', marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--n4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Providers Ativos</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {stats.providers.map(p => (
                <span key={p} style={{ background: 'var(--lift)', border: '1px solid var(--bn)', borderRadius: 'var(--r-sm)', padding: '4px 10px', fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--r3)' }}>{p}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bn)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--n4)', letterSpacing: '.1em', textTransform: 'uppercase' }}>
              Usuários ({filtered.length})
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--lift)', border: '1px solid var(--bn)', borderRadius: 'var(--r-sm)', padding: '6px 12px' }}>
              <Search size={13} style={{ color: 'var(--n4)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar email..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--n1)', fontSize: '.85rem', width: 180 }} />
            </div>
          </div>
          {filtered.map(u => (
            <div key={u.id} style={{ borderBottom: '1px solid var(--bn2)' }}>
              <div onClick={() => setExpandedUser(expandedUser === u.id ? null : u.id)}
                style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.85rem', color: 'var(--n1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>
                    {u.created_at} · {u.analyses_count} análises
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--r3)' }}>{u.credits}cr</span>
                  {u.premium_credits > 0 && <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--g4)' }}>{u.premium_credits}pr</span>}
                  {expandedUser === u.id ? <ChevronUp size={14} style={{ color: 'var(--n4)' }} /> : <ChevronDown size={14} style={{ color: 'var(--n4)' }} />}
                </div>
              </div>
              {expandedUser === u.id && (
                <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="number" min="1" value={creditInput} onChange={e => setCreditInput(e.target.value)}
                    placeholder="Qtd" style={{ background: 'var(--lift)', border: '1px solid var(--bn)', borderRadius: 'var(--r-sm)', padding: '6px 10px', color: 'var(--n1)', fontSize: '.85rem', width: 100, outline: 'none' }} />
                  <button onClick={() => handleCredits(u.id, 'add')} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Plus size={13} /> Adicionar
                  </button>
                  <button onClick={() => handleCredits(u.id, 'remove')} className="btn btn-ghost btn-sm" style={{ color: 'var(--r3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Minus size={13} /> Remover
                  </button>
                  <button onClick={() => handleSetCredits(u.id)} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Settings size={13} /> Definir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
