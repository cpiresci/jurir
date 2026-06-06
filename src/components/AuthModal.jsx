import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { login, register, getMe } from '../lib/api';

export default function AuthModal() {
  const { modalOpen, closeModal, setAuth, addToast } = useStore();
  const [tab,     setTab]     = useState(modalOpen === 'register' ? 'register' : 'login');
  const [email,   setEmail]   = useState('');
  const [pwd,     setPwd]     = useState('');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');

  if (!modalOpen) return null;

  const handleLogin = async () => {
    if (!email || !pwd) { setErr('Preencha todos os campos.'); return; }
    setLoading(true); setErr('');
    try {
      const { access_token } = await login(email, pwd);
      const user = await getMe(access_token);
      setAuth(access_token, user);
      addToast(`Bem-vindo, ${user.email?.split('@')[0]}!`, 'success');
      closeModal();
    } catch (e) { setErr(e.message || 'Erro ao entrar.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!email || !pwd) { setErr('Preencha todos os campos.'); return; }
    if (pwd.length < 8) { setErr('Senha mínima de 8 caracteres.'); return; }
    setLoading(true); setErr('');
    try {
      await register(email, pwd);
      addToast('Conta criada! Faça login.', 'success');
      setTab('login');
    } catch (e) { setErr(e.message || 'Erro ao cadastrar.'); }
    finally { setLoading(false); }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegister();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--n0)' }}>
              {tab === 'login' ? 'Entrar' : 'Criar conta'}
            </h2>
            <p style={{ fontSize: '.78rem', color: 'var(--n5)', marginTop: 4 }}>
              {tab === 'login' ? 'Bem-vindo de volta.' : 'Comece sua análise jurídica.'}
            </p>
          </div>
          <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--n4)', cursor: 'pointer', padding: 4 }}>
            <X size={18}/>
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 3, marginBottom: 28,
          background: 'rgba(9,8,15,0.6)', border: '1px solid var(--br-n)',
          borderRadius: 'var(--r-pill)', padding: 4,
        }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setErr(''); }} style={{
              flex: 1, padding: '9px', border: 'none', cursor: 'pointer',
              borderRadius: 'var(--r-pill)',
              background: tab === t ? 'var(--surface)' : 'transparent',
              color: tab === t ? 'var(--n0)' : 'var(--n5)',
              fontFamily: 'var(--f-sans)', fontSize: '.85rem', fontWeight: 600,
              transition: 'all .2s',
            }}>
              {t === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', letterSpacing: '.1em', marginBottom: 7 }}>
              E-MAIL
            </label>
            <input
              className="fg-input"
              type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="seu@email.com"
              autoFocus
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', letterSpacing: '.1em', marginBottom: 7 }}>
              SENHA
            </label>
            <input
              className="fg-input"
              type="password" value={pwd}
              onChange={e => setPwd(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={tab === 'register' ? 'Mínimo 8 caracteres' : '••••••••'}
            />
          </div>

          {err && (
            <div style={{ background: 'rgba(176,30,30,0.1)', border: '1px solid var(--br-cr)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: '.82rem', color: 'var(--cr5)' }}>
              {err}
            </div>
          )}

          <button
            className="btn btn-flame"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            disabled={loading}
            onClick={tab === 'login' ? handleLogin : handleRegister}
          >
            {loading
              ? <><Loader2 size={14} className="spin"/> Aguarde…</>
              : tab === 'login' ? 'Entrar' : 'Criar conta'
            }
          </button>
        </div>
      </div>
    </div>
  );
}
