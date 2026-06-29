import { useState, useRef } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { login, register, getMe, wakeUp, forgotPassword } from '../lib/api';

export default function AuthModal() {
  const { modalOpen, closeModal, setAuth, addToast } = useStore();
  const [tab,     setTab]     = useState(modalOpen === 'register' ? 'register' : 'login');
  const [email,   setEmail]   = useState('');
  const [pwd,     setPwd]     = useState('');
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState('');
  const [wakeMsg, setWakeMsg] = useState('');
  const [forgot,  setForgot]  = useState(false);
  const [sentMsg, setSentMsg] = useState('');
  const abortRef = useRef(null);

  if (!modalOpen) return null;

  const handleLogin = async () => {
    if (!email || !pwd) { setErr('Preencha todos os campos.'); return; }
    setLoading(true); setErr(''); setWakeMsg('');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setWakeMsg('Conectando ao servidor…');
    const awake = await wakeUp(ctrl.signal);
    setWakeMsg('');
    if (ctrl.signal.aborted) { setLoading(false); return; }
    if (!awake) { setErr('Servidor indisponível. Tente em instantes.'); setLoading(false); return; }
    try {
      const data = await login(email, pwd);
      const token = data.token || data.access_token;
      // Sempre busca /me após login para garantir is_escritorio, is_api_plan, org_role
      const user = await getMe(token);
      setAuth(token, user);
      addToast(`Bem-vindo, ${user.email?.split('@')[0]}!`, 'success');
      closeModal();
    } catch (e) { setErr(e.message || 'Erro ao entrar.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!email || !pwd) { setErr('Preencha todos os campos.'); return; }
    if (pwd.length < 8) { setErr('Senha mínima de 8 caracteres.'); return; }
    setLoading(true); setErr(''); setWakeMsg('');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setWakeMsg('Conectando ao servidor…');
    const awake = await wakeUp(ctrl.signal);
    setWakeMsg('');
    if (ctrl.signal.aborted) { setLoading(false); return; }
    if (!awake) { setErr('Servidor indisponível. Tente em instantes.'); setLoading(false); return; }
    try {
      await register(email, pwd);
      addToast('Conta criada! Faça login.', 'success');
      setTab('login');
    } catch (e) { setErr(e.message || 'Erro ao cadastrar.'); }
    finally { setLoading(false); }
  };

  const handleForgot = async () => {
    if (!email) { setErr('Informe seu email.'); return; }
    setLoading(true); setErr('');
    try {
      await forgotPassword(email);
      setSentMsg('Email enviado! Verifique sua caixa de entrada.');
    } catch (e) { setErr(e.message || 'Erro ao enviar email.'); }
    finally { setLoading(false); }
  };

  const onKeyDown = e => { if (e.key === 'Enter') tab === 'login' ? handleLogin() : handleRegister(); };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
      <div className="modal-box">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t5)', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 8 }}>
              JURIR · ACESSO
            </div>
            <h2 className="t-display" style={{ fontSize: '1.7rem', fontWeight: 400, color: 'var(--t0)' }}>
              {tab === 'login' ? 'Bem-vindo de volta' : 'Criar conta'}
            </h2>
          </div>
          <button onClick={closeModal} style={{ background: 'var(--bg-card2)', border: '1px solid var(--b-main)', borderRadius: 'var(--r-sm)', color: 'var(--t3)', padding: 6, cursor: 'pointer', display: 'flex', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--b-cobalt)'; e.currentTarget.style.color = 'var(--co7)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--b-main)'; e.currentTarget.style.color = 'var(--t3)'; }}
          >
            <X size={15}/>
          </button>
        </div>

        {/* Tab */}
        <div className="mode-pill" style={{ width: '100%', marginBottom: 24 }}>
          {['login', 'register'].map(t => (
            <button key={t} className={`mode-pill-btn${tab === t ? ' active' : ''}`}
              onClick={() => { setTab(t); setErr(''); }}
              style={{ flex: 1, justifyContent: 'center' }}>
              {t === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 7, display: 'block' }}>
              E-mail
            </label>
            <input type="email" className="modal-input" placeholder="seu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKeyDown}/>
          </div>
          <div>
            <label style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 7, display: 'block' }}>
              Senha
            </label>
            <input type="password" className="modal-input" placeholder="••••••••"
              value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={onKeyDown}/>
          </div>

          {wakeMsg && (
            <p style={{ color: 'var(--co7)', fontSize: '.78rem', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--f-mono)' }}>
              <Loader2 size={12} className="spin"/> {wakeMsg}
            </p>
          )}
          {err && (
            <p style={{ color: 'var(--cr3)', fontSize: '.8rem', padding: '9px 12px', background: 'rgba(192,24,24,0.05)', border: '1px solid rgba(192,24,24,0.2)', borderRadius: 'var(--r-sm)' }}>
              {err}
            </p>
          )}

          <button className="btn btn-cobalt" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            disabled={loading} onClick={tab === 'login' ? handleLogin : handleRegister}>
            {loading
              ? <><Loader2 size={15} className="spin"/> Aguarde…</>
              : tab === 'login' ? 'Entrar' : 'Criar conta'
            }
          </button>
        </div>

        {tab === 'login' && !forgot && (
          <button onClick={() => { setForgot(true); setErr(''); setSentMsg(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--t4)', fontSize: '.78rem', cursor: 'pointer', marginTop: 12, width: '100%', textAlign: 'center' }}>
            Esqueci minha senha
          </button>
        )}

        {forgot && (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '.82rem', color: 'var(--t3)' }}>Informe seu email para receber o link de redefinição.</p>
            {sentMsg
              ? <p style={{ color: 'var(--jade2)', fontSize: '.82rem', padding: '9px 12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--r-sm)' }}>{sentMsg}</p>
              : <button className="btn btn-cobalt" style={{ width: '100%', justifyContent: 'center' }} disabled={loading} onClick={handleForgot}>
                  {loading ? <><Loader2 size={15} className="spin"/> Enviando…</> : 'Enviar link de redefinição'}
                </button>
            }
            <button onClick={() => { setForgot(false); setSentMsg(''); setErr(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--t4)', fontSize: '.78rem', cursor: 'pointer', textAlign: 'center' }}>
              ← Voltar ao login
            </button>
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--t4)', marginTop: 20 }}>
          {tab === 'login'
            ? <>Não tem conta?{' '}<button onClick={() => setTab('register')} style={{ background: 'none', border: 'none', color: 'var(--co7)', fontSize: 'inherit', cursor: 'pointer' }}>Cadastrar</button></>
            : <>Já tem conta?{' '}<button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: 'var(--co7)', fontSize: 'inherit', cursor: 'pointer' }}>Entrar</button></>
          }
        </p>
      </div>
    </div>
  );
}
