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
    } catch (e) {
      setErr(e.message || 'Erro ao entrar.');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!email || !pwd) { setErr('Preencha todos os campos.'); return; }
    if (pwd.length < 6)  { setErr('Senha mínima de 6 caracteres.'); return; }
    setLoading(true); setErr('');
    try {
      await register(email, pwd);
      addToast('Conta criada! Faça login.', 'success');
      setTab('login');
    } catch (e) {
      setErr(e.message || 'Erro ao cadastrar.');
    } finally { setLoading(false); }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegister();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
      <div className="modal-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 className="t-display" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {tab === 'login' ? 'Entrar' : 'Criar conta'}
          </h2>
          <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'var(--n4)', cursor: 'pointer' }}>
            <X size={18}/>
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--lift)', borderRadius: 'var(--r-sm)', padding: 4 }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setErr(''); }}
              style={{
                flex: 1, padding: '8px', border: 'none', cursor: 'pointer',
                borderRadius: 'calc(var(--r-sm) - 2px)',
                background: tab === t ? 'var(--surface)' : 'transparent',
                color: tab === t ? 'var(--n0)' : 'var(--n4)',
                fontFamily: 'var(--f-sans)', fontSize: '.85rem', fontWeight: 600,
                transition: 'all .2s',
              }}
            >
              {t === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '.78rem', color: 'var(--n4)', marginBottom: 6, display: 'block' }}>E-mail</label>
            <input
              type="email" className="fg-input"
              placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <div>
            <label style={{ fontSize: '.78rem', color: 'var(--n4)', marginBottom: 6, display: 'block' }}>Senha</label>
            <input
              type="password" className="fg-input"
              placeholder="••••••••"
              value={pwd} onChange={e => setPwd(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>

          {err && <p style={{ color: 'var(--r4)', fontSize: '.8rem', margin: 0 }}>{err}</p>}

          <button
            className="btn btn-crimson"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            disabled={loading}
            onClick={tab === 'login' ? handleLogin : handleRegister}
          >
            {loading
              ? <><Loader2 size={15} className="spin"/> Aguarde…</>
              : tab === 'login' ? 'Entrar' : 'Criar conta'
            }
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--n5)', marginTop: 20 }}>
          {tab === 'login'
            ? <>Não tem conta?{' '}
                <button onClick={() => setTab('register')} style={{ background: 'none', border: 'none', color: 'var(--r3)', cursor: 'pointer', fontSize: 'inherit' }}>
                  Cadastrar
                </button>
              </>
            : <>Já tem conta?{' '}
                <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: 'var(--r3)', cursor: 'pointer', fontSize: 'inherit' }}>
                  Entrar
                </button>
              </>
          }
        </p>
      </div>
    </div>
  );
}
