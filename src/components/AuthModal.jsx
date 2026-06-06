import { useState, useRef } from 'react';
import { X, Loader2, Gavel } from 'lucide-react';
import { useStore } from '../store';
import { login, register, getMe, wakeUp } from '../lib/api';

export default function AuthModal() {
  const { modalOpen, closeModal, setAuth, addToast } = useStore();
  const [tab,     setTab]     = useState(modalOpen === 'register' ? 'register' : 'login');
  const [email,   setEmail]   = useState('');
  const [pwd,     setPwd]     = useState('');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');
  const [wakeMsg, setWakeMsg] = useState('');
  const abortRef = useRef(null);

  if (!modalOpen) return null;

  const handleLogin = async () => {
    if (!email || !pwd) { setErr('Preencha todos os campos.'); return; }
    setLoading(true); setErr(''); setWakeMsg('');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setWakeMsg('⚡ Conectando ao servidor…');
    const awake = await wakeUp(ctrl.signal);
    setWakeMsg('');
    if (ctrl.signal.aborted) { setLoading(false); return; }
    if (!awake) { setErr('Servidor indisponível. Tente novamente em instantes.'); setLoading(false); return; }
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
    if (pwd.length < 8) { setErr('Senha mínima de 8 caracteres.'); return; }
    setLoading(true); setErr(''); setWakeMsg('');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setWakeMsg('⚡ Conectando ao servidor…');
    const awake = await wakeUp(ctrl.signal);
    setWakeMsg('');
    if (ctrl.signal.aborted) { setLoading(false); return; }
    if (!awake) { setErr('Servidor indisponível. Tente novamente em instantes.'); setLoading(false); return; }
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

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            {/* Mini logo */}
            <div style={{
              fontFamily: 'var(--f-display)',
              fontSize: '.75rem', color: 'var(--p5)',
              letterSpacing: '.18em', textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              JURIR · ACESSO
            </div>
            <h2 className="t-display" style={{
              fontSize: '1.7rem', fontWeight: 700,
              color: 'var(--p0)',
            }}>
              {tab === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
            </h2>
          </div>
          <button
            onClick={closeModal}
            style={{
              background: 'rgba(250,247,242,0.04)', border: '1px solid var(--b-neutral)',
              borderRadius: 'var(--r-sm)', color: 'var(--p4)', padding: 6,
              transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--b-gold)'; e.currentTarget.style.color = 'var(--au6)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b-neutral)'; e.currentTarget.style.color = 'var(--p4)'; }}
          >
            <X size={16}/>
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 28,
          background: 'rgba(10,10,32,0.8)',
          border: '1px solid var(--b-neutral)',
          borderRadius: 'var(--r-md)', padding: 4,
        }}>
          {['login', 'register'].map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setErr(''); }}
              className={t === tab ? 'mode-tab active' : 'mode-tab'}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {t === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{
              fontSize: '.72rem', color: 'var(--p4)',
              fontFamily: 'var(--f-mono)', letterSpacing: '.1em',
              textTransform: 'uppercase', marginBottom: 8, display: 'block',
            }}>
              E-mail
            </label>
            <input
              type="email" className="fg-input"
              placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <div>
            <label style={{
              fontSize: '.72rem', color: 'var(--p4)',
              fontFamily: 'var(--f-mono)', letterSpacing: '.1em',
              textTransform: 'uppercase', marginBottom: 8, display: 'block',
            }}>
              Senha
            </label>
            <input
              type="password" className="fg-input"
              placeholder="••••••••"
              value={pwd} onChange={e => setPwd(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>

          {/* Status messages */}
          {wakeMsg && (
            <p style={{
              color: 'var(--au5)', fontSize: '.8rem', margin: 0,
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--f-mono)',
            }}>
              <Loader2 size={12} className="spin"/>
              {wakeMsg}
            </p>
          )}
          {err && (
            <p style={{
              color: 'var(--cr5)', fontSize: '.8rem', margin: 0,
              padding: '8px 12px',
              background: 'rgba(192,30,30,0.08)',
              border: '1px solid var(--b-crimson)',
              borderRadius: 'var(--r-sm)',
            }}>
              {err}
            </p>
          )}

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

        {/* Footer switcher */}
        <p style={{
          textAlign: 'center', fontSize: '.78rem',
          color: 'var(--p5)', marginTop: 24,
        }}>
          {tab === 'login'
            ? <>Não tem conta?{' '}
                <button onClick={() => setTab('register')}
                  style={{ background: 'none', border: 'none', color: 'var(--au6)', fontSize: 'inherit', letterSpacing: '.02em' }}>
                  Cadastrar
                </button>
              </>
            : <>Já tem conta?{' '}
                <button onClick={() => setTab('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--au6)', fontSize: 'inherit', letterSpacing: '.02em' }}>
                  Entrar
                </button>
              </>
          }
        </p>
      </div>
    </div>
  );
}
