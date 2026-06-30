import { useState, useRef, useEffect } from 'react';
import { X, Loader2, Eye, EyeOff, Mail, Lock, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, RotateCcw, KeyRound } from 'lucide-react';
import { useStore } from '../store';
import { login, register, getMe, wakeUp, forgotPassword } from '../lib/api';

/* ─── Constantes de fase ─── */
const PHASE = { LOGIN: 'login', REGISTER: 'register', FORGOT: 'forgot', SENT: 'sent' };

/* ─── Partícula decorativa ─── */
function QuantumOrb({ style }) {
  return (
    <div style={{
      position: 'absolute', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(0,242,254,0.18) 0%, transparent 70%)',
      filter: 'blur(24px)', pointerEvents: 'none', ...style
    }} />
  );
}

/* ─── Linha decorativa animada ─── */
function ScanLine() {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(0,242,254,0.4), transparent)',
      animation: 'scan-line 3s ease-in-out infinite',
      top: '50%', pointerEvents: 'none',
    }} />
  );
}

/* ─── Campo de input avançado ─── */
function QuantumInput({ label, icon: Icon, type = 'text', value, onChange, onKeyDown, placeholder, hint, autoFocus }) {
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const isPwd = type === 'password';
  const inputType = isPwd ? (showPwd ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: focused ? 'var(--cy1)' : 'var(--t4)',
        letterSpacing: '.14em', textTransform: 'uppercase',
        transition: 'color .2s', display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <Icon size={10} style={{ opacity: focused ? 1 : 0.5 }} />
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={inputType}
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: focused ? 'rgba(0,242,254,0.04)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${focused ? 'rgba(0,242,254,0.35)' : 'rgba(0,242,254,0.09)'}`,
            borderRadius: 10,
            padding: '13px 16px 13px 16px',
            paddingRight: isPwd ? 44 : 16,
            fontFamily: 'var(--f-sans)', fontSize: '.88rem', color: 'var(--t1)',
            outline: 'none', transition: 'all .2s',
            boxShadow: focused ? '0 0 0 3px rgba(0,242,254,0.07), inset 0 1px 0 rgba(0,242,254,0.04)' : 'none',
          }}
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setShowPwd(v => !v)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--t3)', display: 'flex', padding: 4,
              transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cy1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
        {/* Barra de foco animada na base */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%',
          width: focused ? '100%' : '0%', height: 1,
          background: 'var(--g-quantum)',
          transform: 'translateX(-50%)',
          transition: 'width .3s var(--ease-out-expo)',
          borderRadius: '0 0 10px 10px',
        }} />
      </div>
      {hint && (
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--t4)', letterSpacing: '.06em' }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ─── Barra de força da senha ─── */
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
  const colors = ['', '#ef4444', '#f59e0b', '#10b981', '#00f2fe'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= score ? colors[score] : 'rgba(255,255,255,0.06)',
            transition: 'background .3s',
            boxShadow: i <= score && score === 4 ? `0 0 6px ${colors[score]}66` : 'none',
          }} />
        ))}
      </div>
      {score > 0 && (
        <p style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: colors[score], letterSpacing: '.08em' }}>
          Senha {labels[score]}
        </p>
      )}
    </div>
  );
}

/* ─── Banner de erro / sucesso ─── */
function Banner({ type, children }) {
  const styles = {
    error: { color: 'var(--cr3)', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.18)' },
    success: { color: 'var(--jade2)', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.20)' },
    info: { color: 'var(--cy1)', bg: 'rgba(0,242,254,0.05)', border: 'rgba(0,242,254,0.15)' },
  }[type];

  return (
    <div style={{
      padding: '10px 14px', borderRadius: 9,
      background: styles.bg, border: `1px solid ${styles.border}`,
      color: styles.color, fontSize: '.8rem',
      display: 'flex', alignItems: 'flex-start', gap: 8,
      animation: 'fade-in .2s',
    }}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════ */
export default function AuthModal() {
  const { modalOpen, closeModal, setAuth, addToast } = useStore();
  const [phase, setPhase]     = useState(modalOpen === 'register' ? PHASE.REGISTER : PHASE.LOGIN);
  const [email, setEmail]     = useState('');
  const [pwd,   setPwd]       = useState('');
  const [loading, setLoading] = useState(false);
  const [err,   setErr]       = useState('');
  const [wakeMsg, setWakeMsg] = useState('');
  const abortRef = useRef(null);

  /* Resetar ao abrir */
  useEffect(() => {
    setPhase(modalOpen === 'register' ? PHASE.REGISTER : PHASE.LOGIN);
    setErr(''); setEmail(''); setPwd('');
  }, [modalOpen]);

  if (!modalOpen) return null;

  /* ── Handlers ── */
  const goTo = (p) => { setPhase(p); setErr(''); };

  const doWakeAndRun = async (fn) => {
    setLoading(true); setErr(''); setWakeMsg('');
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setWakeMsg('Conectando ao servidor…');
    const awake = await wakeUp(ctrl.signal);
    setWakeMsg('');
    if (ctrl.signal.aborted) { setLoading(false); return; }
    if (!awake) { setErr('Servidor indisponível. Tente em instantes.'); setLoading(false); return; }
    try { await fn(); } catch (e) { setErr(e.message || 'Erro inesperado.'); }
    finally { setLoading(false); }
  };

  const handleLogin = () => doWakeAndRun(async () => {
    if (!email || !pwd) { throw new Error('Preencha todos os campos.'); }
    const data = await login(email, pwd);
    const token = data.token || data.access_token;
    const user = await getMe(token);
    setAuth(token, user);
    addToast(`Bem-vindo, ${user.email?.split('@')[0]}! ⚖`, 'success');
    closeModal();
  });

  const handleRegister = () => doWakeAndRun(async () => {
    if (!email || !pwd) { throw new Error('Preencha todos os campos.'); }
    if (pwd.length < 8) { throw new Error('Senha mínima de 8 caracteres.'); }
    await register(email, pwd);
    addToast('Conta criada! Faça login.', 'success');
    goTo(PHASE.LOGIN);
  });

  const handleForgot = async () => {
    if (!email) { setErr('Informe seu email.'); return; }
    setLoading(true); setErr('');
    try {
      await forgotPassword(email);
      goTo(PHASE.SENT);
    } catch (e) { setErr(e.message || 'Erro ao enviar email.'); }
    finally { setLoading(false); }
  };

  const onKey = (e) => {
    if (e.key !== 'Enter') return;
    if (phase === PHASE.LOGIN) handleLogin();
    else if (phase === PHASE.REGISTER) handleRegister();
    else if (phase === PHASE.FORGOT) handleForgot();
  };

  /* ── Conteúdo por fase ── */
  const phaseContent = {

    /* ═══ LOGIN ═══ */
    [PHASE.LOGIN]: (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <QuantumInput label="E-mail" icon={Mail} type="email"
            value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey}
            placeholder="seu@email.com" autoFocus />
          <QuantumInput label="Senha" icon={Lock} type="password"
            value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={onKey}
            placeholder="••••••••" />
        </div>

        {wakeMsg && (
          <Banner type="info">
            <Loader2 size={13} className="spin" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem' }}>{wakeMsg}</span>
          </Banner>
        )}
        {err && <Banner type="error">{err}</Banner>}

        <button className="btn btn-cobalt" style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: '.88rem', marginTop: 4 }}
          disabled={loading} onClick={handleLogin}>
          {loading
            ? <><Loader2 size={15} className="spin" /> Autenticando…</>
            : <><ArrowRight size={15} /> Entrar no Jurir</>
          }
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--t4)', letterSpacing: '.1em' }}>OU</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <button onClick={() => goTo(PHASE.FORGOT)}
          style={{ background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 9,
            color: 'var(--t3)', fontSize: '.78rem', cursor: 'pointer', width: '100%', padding: '10px 0',
            transition: 'all .2s', fontFamily: 'var(--f-sans)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,242,254,0.18)'; e.currentTarget.style.color = 'var(--cy1)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--t3)'; }}>
          🔑 Esqueci minha senha
        </button>
      </>
    ),

    /* ═══ REGISTER ═══ */
    [PHASE.REGISTER]: (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <QuantumInput label="E-mail" icon={Mail} type="email"
            value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey}
            placeholder="seu@email.com" autoFocus />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <QuantumInput label="Senha" icon={Lock} type="password"
              value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={onKey}
              placeholder="mín. 8 caracteres" hint="Use letras, números e símbolos para maior segurança" />
            <PasswordStrength password={pwd} />
          </div>
        </div>

        {/* Benefícios */}
        <div style={{
          background: 'rgba(0,242,254,0.04)', border: '1px solid rgba(0,242,254,0.10)',
          borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {[
            { icon: '⚖', text: '5 análises jurídicas gratuitas' },
            { icon: '🤖', text: 'Acesso ao swarm de agentes IA' },
            { icon: '📄', text: 'Geração de petições e relatórios' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '.8rem' }}>{icon}</span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--t2)', letterSpacing: '.04em' }}>{text}</span>
            </div>
          ))}
        </div>

        {wakeMsg && (
          <Banner type="info">
            <Loader2 size={13} className="spin" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem' }}>{wakeMsg}</span>
          </Banner>
        )}
        {err && <Banner type="error">{err}</Banner>}

        <button className="btn btn-cobalt" style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: '.88rem', marginTop: 4 }}
          disabled={loading} onClick={handleRegister}>
          {loading
            ? <><Loader2 size={15} className="spin" /> Criando conta…</>
            : <><Sparkles size={15} /> Criar conta gratuita</>
          }
        </button>

        <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--t4)', fontFamily: 'var(--f-mono)' }}>
          Ao criar uma conta você concorda com nossos{' '}
          <a href="/#/privacidade" style={{ color: 'var(--cy1)', textDecoration: 'none' }}>Termos de Uso</a>
        </p>
      </>
    ),

    /* ═══ FORGOT ═══ */
    [PHASE.FORGOT]: (
      <>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px',
          background: 'rgba(0,242,254,0.04)', border: '1px solid rgba(0,242,254,0.10)',
          borderRadius: 10, marginBottom: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={14} style={{ color: 'var(--cy1)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--t2)', letterSpacing: '.04em' }}>
              Enviaremos um link seguro para o seu email. O link expira em 1 hora.
            </span>
          </div>
        </div>

        <QuantumInput label="E-mail cadastrado" icon={Mail} type="email"
          value={email} onChange={e => setEmail(e.target.value)} onKeyDown={onKey}
          placeholder="seu@email.com" autoFocus />

        {err && <Banner type="error">{err}</Banner>}

        <button className="btn btn-cobalt" style={{ width: '100%', justifyContent: 'center', height: 46, fontSize: '.88rem' }}
          disabled={loading} onClick={handleForgot}>
          {loading
            ? <><Loader2 size={15} className="spin" /> Enviando…</>
            : <><Mail size={15} /> Enviar link de redefinição</>
          }
        </button>

        <button onClick={() => goTo(PHASE.LOGIN)}
          style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.78rem',
            cursor: 'pointer', width: '100%', textAlign: 'center', fontFamily: 'var(--f-sans)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '4px 0',
            transition: 'color .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--cy1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}>
          <RotateCcw size={12} /> Voltar ao login
        </button>
      </>
    ),

    /* ═══ SENT ═══ */
    [PHASE.SENT]: (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '16px 0 8px' }}>
        {/* Ícone animado */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,242,254,0.12) 0%, transparent 70%)',
          border: '1px solid rgba(0,242,254,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 30px rgba(0,242,254,0.15)',
          animation: 'scale-in .4s var(--ease-spring)',
        }}>
          <CheckCircle2 size={32} style={{ color: 'var(--cy1)' }} />
        </div>

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.3rem', fontWeight: 500, color: 'var(--t0)' }}>
            Email enviado!
          </h3>
          <p style={{ color: 'var(--t2)', fontSize: '.85rem', lineHeight: 1.6 }}>
            Verifique a caixa de entrada de{' '}
            <strong style={{ color: 'var(--cy1)' }}>{email}</strong>
            {' '}e clique no link para redefinir sua senha.
          </p>
          <p style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--t4)', letterSpacing: '.06em' }}>
            O link expira em 1 hora · Verifique também o spam
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <button className="btn btn-cobalt" style={{ width: '100%', justifyContent: 'center', height: 44 }}
            onClick={() => { goTo(PHASE.FORGOT); }}>
            <RotateCcw size={14} /> Reenviar email
          </button>
          <button onClick={() => goTo(PHASE.LOGIN)}
            style={{ background: 'none', border: 'none', color: 'var(--t3)', fontSize: '.8rem',
              cursor: 'pointer', fontFamily: 'var(--f-sans)', padding: '6px 0', transition: 'color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cy1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}>
            ← Voltar ao login
          </button>
        </div>
      </div>
    ),
  };

  /* ── Títulos por fase ── */
  const titles = {
    [PHASE.LOGIN]:    { tag: 'JURIR · ACESSO', h2: 'Bem-vindo de volta' },
    [PHASE.REGISTER]: { tag: 'JURIR · CADASTRO', h2: 'Criar sua conta' },
    [PHASE.FORGOT]:   { tag: 'JURIR · SEGURANÇA', h2: 'Recuperar acesso' },
    [PHASE.SENT]:     { tag: 'JURIR · CONFIRMAÇÃO', h2: 'Verifique seu email' },
  };
  const { tag, h2 } = titles[phase];

  /* ── Tabs visíveis apenas em login/register ── */
  const showTabs = phase === PHASE.LOGIN || phase === PHASE.REGISTER;

  return (
    <>
      {/* Keyframes adicionais inline para animações do modal */}
      <style>{`
        @keyframes scan-line {
          0%   { opacity: 0; top: 0%; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { opacity: 0; top: 100%; }
        }
        @keyframes scale-in {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes modal-glow-pulse {
          0%, 100% { box-shadow: 0 0 0 1px rgba(0,242,254,0.08), 0 40px 120px rgba(0,0,0,0.92), 0 0 60px rgba(0,242,254,0.05); }
          50%       { box-shadow: 0 0 0 1px rgba(0,242,254,0.16), 0 40px 120px rgba(0,0,0,0.92), 0 0 90px rgba(0,242,254,0.10); }
        }
        .auth-modal-box {
          background: rgba(8,8,14,0.98);
          border: 1px solid rgba(0,242,254,0.13);
          border-radius: 20px;
          padding: 44px 44px 36px;
          width: min(500px, 95vw);
          position: relative;
          overflow: hidden;
          animation: fade-up .28s var(--ease-spring), modal-glow-pulse 4s ease-in-out 1s infinite;
        }
        .auth-phase-content {
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: fade-in .22s ease;
        }
        .auth-tab-btn {
          flex: 1;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--f-sans);
          font-size: .8rem;
          font-weight: 600;
          letter-spacing: .05em;
          padding: 9px 0;
          border-radius: 8px;
          transition: all .2s;
          color: var(--t3);
          position: relative;
        }
        .auth-tab-btn.active {
          background: rgba(0,242,254,0.08);
          color: var(--cy1);
          box-shadow: inset 0 0 0 1px rgba(0,242,254,0.18);
        }
        .auth-tab-btn:not(.active):hover {
          color: var(--t1);
          background: rgba(255,255,255,0.03);
        }
      `}</style>

      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
        <div className="auth-modal-box">

          {/* ── Orbs decorativos ── */}
          <QuantumOrb style={{ width: 200, height: 200, top: -60, right: -60, opacity: .6 }} />
          <QuantumOrb style={{ width: 150, height: 150, bottom: -40, left: -40, opacity: .4 }} />
          {/* Scan line sutil */}
          <ScanLine />

          {/* ── Corner accents ── */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: 40, height: 40, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 14, left: 14, width: 16, height: 1, background: 'rgba(0,242,254,0.3)' }} />
            <div style={{ position: 'absolute', top: 14, left: 14, width: 1, height: 16, background: 'rgba(0,242,254,0.3)' }} />
          </div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', bottom: 14, right: 14, width: 16, height: 1, background: 'rgba(0,242,254,0.3)' }} />
            <div style={{ position: 'absolute', bottom: 14, right: 14, width: 1, height: 16, background: 'rgba(0,242,254,0.3)' }} />
          </div>

          {/* ── Header ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, position: 'relative' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10,
                background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.14)',
                borderRadius: 999, padding: '3px 10px',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--cy1)', boxShadow: '0 0 6px var(--cy1)' }} />
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--cy1)', letterSpacing: '.18em', textTransform: 'uppercase' }}>
                  {tag}
                </span>
              </div>
              <h2 className="t-display" style={{
                fontFamily: 'var(--f-display)', fontSize: '1.75rem', fontWeight: 400,
                color: 'var(--t0)', lineHeight: 1.2,
                background: phase === PHASE.SENT ? 'var(--g-quantum)' : undefined,
                WebkitBackgroundClip: phase === PHASE.SENT ? 'text' : undefined,
                WebkitTextFillColor: phase === PHASE.SENT ? 'transparent' : undefined,
              }}>
                {h2}
              </h2>
            </div>
            <button onClick={closeModal} aria-label="Fechar" style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 9, color: 'var(--t3)', padding: 7, cursor: 'pointer',
              display: 'flex', transition: 'all .18s', flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,242,254,0.25)'; e.currentTarget.style.color = 'var(--cy1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'var(--t3)'; }}>
              <X size={15} />
            </button>
          </div>

          {/* ── Tabs (só em login/register) ── */}
          {showTabs && (
            <div style={{
              display: 'flex', gap: 4,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 11, padding: 4, marginBottom: 22,
            }}>
              {[
                { key: PHASE.LOGIN,    label: 'Entrar' },
                { key: PHASE.REGISTER, label: 'Criar conta' },
              ].map(({ key, label }) => (
                <button key={key}
                  className={`auth-tab-btn${phase === key ? ' active' : ''}`}
                  onClick={() => goTo(key)}>
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* ── Conteúdo da fase ── */}
          <div className="auth-phase-content" key={phase}>
            {phaseContent[phase]}
          </div>

          {/* ── Rodapé: toggle login/register ── */}
          {showTabs && (
            <p style={{ textAlign: 'center', fontSize: '.78rem', color: 'var(--t4)', marginTop: 22, fontFamily: 'var(--f-sans)' }}>
              {phase === PHASE.LOGIN
                ? <>Não tem conta?{' '}<button onClick={() => goTo(PHASE.REGISTER)}
                    style={{ background: 'none', border: 'none', color: 'var(--cy1)', fontSize: 'inherit', cursor: 'pointer', fontWeight: 600 }}>
                    Cadastrar gratuitamente
                  </button></>
                : <>Já tem conta?{' '}<button onClick={() => goTo(PHASE.LOGIN)}
                    style={{ background: 'none', border: 'none', color: 'var(--cy1)', fontSize: 'inherit', cursor: 'pointer', fontWeight: 600 }}>
                    Fazer login
                  </button></>
              }
            </p>
          )}

          {/* ── Rodapé de segurança ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.04)',
          }}>
            <KeyRound size={10} style={{ color: 'var(--t5)' }} />
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--t5)', letterSpacing: '.08em' }}>
              CONEXÃO SEGURA · CRIPTOGRAFIA END-TO-END
            </span>
            <KeyRound size={10} style={{ color: 'var(--t5)' }} />
          </div>
        </div>
      </div>
    </>
  );
}
