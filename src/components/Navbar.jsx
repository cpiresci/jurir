import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown, Gavel } from 'lucide-react';
import { useStore } from '../store';
import { checkHealth } from '../lib/api';

const FERRAMENTAS = [
  { to: '/delta',         label: 'Delta Analysis',           icon: '⚡' },
  { to: '/documentos',    label: 'Upload de Documentos',     icon: '📄' },
  { to: '/peticoes',      label: 'Gerador de Petições',      icon: '📜' },
  { to: '/simulador',     label: 'Simulador de Instâncias',  icon: '⚖️' },
  { to: '/monitoramento', label: 'Monitoramento Processual', icon: '🔔' },
  { to: '/verificar',     label: 'Verificar Relatório',      icon: '🛡️' },
];

export default function Navbar() {
  const [scrolled,    setScrolled]   = useState(false);
  const [mobileOpen,  setMobileOpen] = useState(false);
  const [toolsOpen,   setToolsOpen]  = useState(false);
  const [engineStatus, setEngineStatus] = useState('checking');
  const toolsRef = useRef(null);
  const { authToken, userData, clearAuth, openModal, addToast } = useStore();

  // Health check
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const data = await checkHealth();
        if (!cancelled) setEngineStatus(data?.status === 'ok' ? 'online' : 'offline');
      } catch {
        if (!cancelled) setEngineStatus('offline');
      }
    };
    check();
    const interval = setInterval(check, 3 * 60 * 1000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 55);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    clearAuth();
    addToast('Sessão encerrada.', 'info');
    setMobileOpen(false);
  };

  return (
    <nav className={`jnav${scrolled ? ' scrolled' : ''}`}>
      {/* Brand */}
      <Link to="/" className="nav-brand">
        {/* SVG Logo — scales of justice */}
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
          {/* Outer ring */}
          <circle cx="19" cy="19" r="17.5" stroke="rgba(228,168,36,0.20)" strokeWidth="1"/>
          {/* Balance beam */}
          <line x1="8" y1="18" x2="30" y2="18" stroke="#E8A824" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Pillar */}
          <line x1="19" y1="10" x2="19" y2="28" stroke="#E8A824" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Left pan */}
          <path d="M8 18 Q10 23 14 23 Q18 23 20 18" stroke="#E8A824" strokeWidth="1" fill="rgba(228,168,36,0.06)" strokeLinecap="round"/>
          {/* Right pan */}
          <path d="M18 18 Q20 22 24 22 Q28 22 30 18" stroke="#C4890A" strokeWidth="1" fill="rgba(196,137,10,0.06)" strokeLinecap="round"/>
          {/* Crown jewel */}
          <circle cx="19" cy="10" r="2.5" fill="#E8A824" opacity=".9"/>
          <circle cx="19" cy="10" r="4" stroke="rgba(228,168,36,0.3)" strokeWidth="1" fill="none"/>
          {/* Crimson accent dots */}
          <circle cx="11" cy="23.5" r="1.5" fill="#C01E1E" opacity=".7"/>
          <circle cx="27" cy="22.5" r="1.5" fill="#C01E1E" opacity=".7"/>
        </svg>

        <span className="nav-wordmark t-display">
          JUR<em>IR</em>
          <sub>INTELIGÊNCIA JURÍDICA</sub>
        </span>
      </Link>

      {/* Center nav links */}
      <div className="nav-links desktop-only">
        <NavLink href="/#analise">Análise</NavLink>
        <NavLink href="/#agentes">Agentes</NavLink>
        <NavLink href="/#precos">Preços</NavLink>

        {/* Ferramentas dropdown */}
        <div ref={toolsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setToolsOpen(v => !v)}
            style={navLinkStyle(toolsOpen)}
          >
            Ferramentas
            <ChevronDown size={11} style={{
              transition: 'transform .2s',
              transform: toolsOpen ? 'rotate(180deg)' : 'none',
              color: toolsOpen ? 'var(--au6)' : 'inherit',
            }}/>
          </button>

          {toolsOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 12px)',
              left: '50%', transform: 'translateX(-50%)',
              background: 'var(--glass2)',
              border: '1px solid var(--b-gold)',
              borderRadius: 'var(--r-md)',
              padding: 8, minWidth: 250,
              backdropFilter: 'blur(24px)',
              boxShadow: 'var(--shadow-deep), var(--shadow-glow-au)',
              zIndex: 300,
              animation: 'scaleUp .2s var(--ease-spring)',
            }}>
              {/* Top shimmer */}
              <div style={{
                height: 1, margin: '0 8px 8px',
                background: 'linear-gradient(90deg, transparent, var(--au5), transparent)',
              }}/>
              {FERRAMENTAS.map(({ to, label, icon }) => (
                <Link key={to} to={to} onClick={() => setToolsOpen(false)}
                  style={dropItemStyle}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(228,168,36,0.07)';
                    e.currentTarget.style.color = 'var(--au6)';
                    e.currentTarget.style.borderColor = 'var(--b-gold)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--p3)';
                    e.currentTarget.style.borderColor = 'transparent';
                  }}
                >
                  <span style={{ fontSize: '1rem', lineHeight: 1 }}>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {authToken && (
          <NavLink href="/historico" isRouter>Histórico</NavLink>
        )}
      </div>

      {/* Right actions */}
      <div className="nav-actions desktop-only">
        {/* Engine status */}
        <div
          title={
            engineStatus === 'checking' ? 'Verificando motor…' :
            engineStatus === 'online'   ? 'Motor online' :
            'Motor offline — cold start pode levar ~50s'
          }
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '.7rem', fontFamily: 'var(--f-mono)',
            color: engineStatus === 'online'  ? 'var(--jade2)' :
                   engineStatus === 'offline' ? '#EF4444' : 'var(--p5)',
            letterSpacing: '.06em', userSelect: 'none',
          }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: engineStatus === 'online'  ? 'var(--jade2)' :
                        engineStatus === 'offline' ? '#EF4444' : 'var(--p5)',
            boxShadow: engineStatus === 'online'
              ? '0 0 8px var(--jade2)'
              : engineStatus === 'offline' ? '0 0 8px #EF4444' : 'none',
            animation: engineStatus === 'checking' ? 'pulse 1.4s ease-in-out infinite' : 'none',
            flexShrink: 0,
          }}/>
          {engineStatus === 'checking' ? 'MOTOR…' :
           engineStatus === 'online'   ? 'MOTOR OK' : 'OFFLINE'}
        </div>

        {/* Auth section */}
        {authToken ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: '.78rem', color: 'var(--p4)',
              fontFamily: 'var(--f-mono)',
            }}>
              {userData?.email?.split('@')[0]}
            </span>
            <Link to="/premium" className="btn btn-gold btn-sm">
              ⚡ Premium
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <LogOut size={13}/> Sair
            </button>
          </div>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => openModal('login')}>
              Entrar
            </button>
            <button className="btn btn-crimson btn-sm" onClick={() => openModal('register')}>
              Começar Grátis
            </button>
          </>
        )}
      </div>

      {/* Mobile toggle */}
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)}>
        {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          <a href="/#analise" style={mobileLink} onClick={() => setMobileOpen(false)}>Análise</a>
          <a href="/#agentes" style={mobileLink} onClick={() => setMobileOpen(false)}>Agentes</a>
          <a href="/#precos"  style={mobileLink} onClick={() => setMobileOpen(false)}>Preços</a>
          {FERRAMENTAS.map(({ to, label, icon }) => (
            <Link key={to} to={to} style={{ ...mobileLink, display: 'flex', gap: 8, alignItems: 'center' }}
              onClick={() => setMobileOpen(false)}>
              <span>{icon}</span>{label}
            </Link>
          ))}
          {authToken && (
            <Link to="/historico" style={mobileLink} onClick={() => setMobileOpen(false)}>
              Histórico
            </Link>
          )}
          {authToken && (
            <Link to="/premium" style={{ ...mobileLink, color: 'var(--au6)' }}
              onClick={() => setMobileOpen(false)}>⚡ Premium</Link>
          )}
          <div style={{ borderTop: '1px solid var(--b-neutral)', paddingTop: 14, marginTop: 8 }}>
            {authToken ? (
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleLogout}>
                <LogOut size={14}/> Sair
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => { openModal('login'); setMobileOpen(false); }}>
                  Entrar
                </button>
                <button className="btn btn-crimson" onClick={() => { openModal('register'); setMobileOpen(false); }}>
                  Começar Grátis
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

/* ── Style helpers ── */
const navLinkStyle = (active = false) => ({
  fontFamily: 'var(--f-sans)',
  color: active ? 'var(--au6)' : 'var(--p3)',
  fontSize: '.82rem', fontWeight: 500,
  letterSpacing: '.04em', textDecoration: 'none',
  padding: '7px 14px',
  borderRadius: 'var(--r-sm)',
  background: 'none', border: 'none',
  display: 'flex', alignItems: 'center', gap: 4,
  transition: 'color .2s',
});

const dropItemStyle = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '9px 12px',
  color: 'var(--p3)', fontSize: '.82rem',
  textDecoration: 'none',
  borderRadius: 'var(--r-sm)',
  border: '1px solid transparent',
  transition: 'all .15s',
  fontFamily: 'var(--f-sans)',
  letterSpacing: '.02em',
};

const mobileLink = {
  color: 'var(--p3)', fontSize: '.875rem',
  fontWeight: 500, letterSpacing: '.03em',
  textDecoration: 'none', padding: '10px 4px',
  borderBottom: '1px solid var(--b-subtle)',
  display: 'block',
};

function NavLink({ href, children, isRouter }) {
  const style = navLinkStyle();
  if (isRouter) {
    return (
      <Link to={href} style={style}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--au6)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--p3)'}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} style={style}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--au6)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--p3)'}>
      {children}
    </a>
  );
}
