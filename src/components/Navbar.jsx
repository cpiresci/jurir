import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
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

const linkStyle = {
  color: 'var(--n4)', fontSize: '.8rem', fontWeight: 600,
  letterSpacing: '.06em', textDecoration: 'none',
  padding: '6px 14px', borderRadius: 'var(--r-pill)',
  transition: 'color .18s, background .18s', textTransform: 'uppercase',
};

function NavAnchor({ href, children, onClick }) {
  return (
    <a href={href} onClick={onClick} style={linkStyle}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--n0)'; e.currentTarget.style.background = 'rgba(255,0,77,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--n4)'; e.currentTarget.style.background = 'transparent'; }}>
      {children}
    </a>
  );
}

// Scales of justice logo — redrawn in crimson/white
function JurirLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      {/* Vertical beam */}
      <line x1="17" y1="3" x2="17" y2="29" stroke="rgba(255,0,77,0.6)" strokeWidth="1.2"/>
      {/* Horizontal beam */}
      <line x1="5" y1="10" x2="29" y2="10" stroke="rgba(255,0,77,0.7)" strokeWidth="1.4"/>
      {/* Left pan */}
      <path d="M5 10 L9 18 L1 18 Z" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth=".9"/>
      {/* Right pan */}
      <path d="M29 10 L33 18 L25 18 Z" fill="none" stroke="rgba(255,255,255,0.65)" strokeWidth=".9"/>
      {/* Base */}
      <line x1="13" y1="29" x2="21" y2="29" stroke="rgba(255,0,77,0.5)" strokeWidth="1.2"/>
      {/* Center gem */}
      <rect x="15.2" y="8.2" width="3.6" height="3.6" rx="0.5" fill="var(--flame)" transform="rotate(45 17 10)"/>
    </svg>
  );
}

export default function Navbar() {
  const [scrolled,     setScrolled]    = useState(false);
  const [mobileOpen,   setMobileOpen]  = useState(false);
  const [toolsOpen,    setToolsOpen]   = useState(false);
  const [engineStatus, setEngineStatus] = useState('checking');
  const toolsRef = useRef(null);
  const { authToken, userData, clearAuth, openModal, addToast } = useStore();

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const data = await checkHealth();
        if (!cancelled) {
          const isOk = data?.status === 'ok' || data?.db_ok === true;
          const degraded = data?.status === 'degraded' || data?.status === 'warning';
          setEngineStatus(isOk ? (degraded ? 'degraded' : 'online') : 'offline');
        }
      } catch { if (!cancelled) setEngineStatus('offline'); }
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

  const handleLogout = () => { clearAuth(); addToast('Sessão encerrada.', 'info'); setMobileOpen(false); };

  const engineColor =
    engineStatus === 'online'   ? 'var(--emerald)' :
    engineStatus === 'degraded' ? 'var(--amber)' :
    engineStatus === 'offline'  ? 'var(--flame)' : 'var(--n5)';

  return (
    <nav className={`jnav${scrolled ? ' scrolled' : ''}`}>
      {/* Brand */}
      <Link to="/" className="nav-brand">
        <JurirLogo />
        <span className="nav-wordmark t-display">
          JUR<em>IR</em>
          <sub>Inteligência Jurídica</sub>
        </span>
      </Link>

      {/* Center links */}
      <div className="nav-links desktop-only">
        <NavAnchor href="/#analise">Análise</NavAnchor>
        <NavAnchor href="/#agentes">Agentes</NavAnchor>
        <NavAnchor href="/#precos">Preços</NavAnchor>

        <div ref={toolsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setToolsOpen(v => !v)}
            style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: 5,
              background: toolsOpen ? 'rgba(255,0,77,0.08)' : 'none',
              border: 'none', cursor: 'pointer',
              color: toolsOpen ? 'var(--n0)' : 'var(--n4)' }}
          >
            Ferramentas
            <ChevronDown size={10} style={{ transition: 'transform .2s', transform: toolsOpen ? 'rotate(180deg)' : 'none' }} />
          </button>
          {toolsOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(14,14,26,0.98)', border: '1px solid var(--br-n)',
              borderRadius: 'var(--r-lg)', padding: 8, minWidth: 240,
              backdropFilter: 'blur(24px)', boxShadow: 'var(--sh-deep)', zIndex: 300,
            }}>
              {FERRAMENTAS.map(({ to, label, icon }) => (
                <Link key={to} to={to} onClick={() => setToolsOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px',
                    color: 'var(--n3)', fontSize: '.8rem', textDecoration: 'none',
                    borderRadius: 'var(--r-sm)', transition: 'background .15s, color .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,0,77,0.08)'; e.currentTarget.style.color = 'var(--n0)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--n3)'; }}
                >
                  <span style={{ fontSize: '.88rem' }}>{icon}</span> {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {authToken && <Link to="/historico" style={linkStyle}
          onMouseEnter={e => { e.currentTarget.style.color='var(--n0)'; e.currentTarget.style.background='rgba(255,0,77,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--n4)'; e.currentTarget.style.background='transparent'; }}>
          Histórico
        </Link>}
      </div>

      {/* Right actions */}
      <div className="nav-actions desktop-only">
        {/* Engine status */}
        <div title={
          engineStatus === 'checking' ? 'Verificando motor…' :
          engineStatus === 'online'   ? 'Motor online' :
          engineStatus === 'degraded' ? 'Motor degradado' : 'Motor offline'
        } style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: '.65rem', fontFamily: 'var(--f-mono)',
          color: engineColor, letterSpacing: '.1em', cursor: 'default', userSelect: 'none',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: engineColor,
            boxShadow: engineStatus !== 'checking' ? `0 0 6px ${engineColor}` : 'none',
            animation: engineStatus === 'checking' ? 'statusPulse 1.4s ease-in-out infinite' : 'none',
          }} />
          {engineStatus === 'checking' ? 'SYS…' :
           engineStatus === 'online'   ? 'ONLINE' :
           engineStatus === 'degraded' ? 'DEGRADED' : 'OFFLINE'}
        </div>

        {authToken ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.76rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)' }}>
              {userData?.email?.split('@')[0]}
            </span>
            <Link to="/premium" className="btn btn-flame btn-sm">⚡ Premium</Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <LogOut size={13}/> Sair
            </button>
          </div>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm"  onClick={() => openModal('login')}>Entrar</button>
            <button className="btn btn-flame btn-sm"  onClick={() => openModal('register')}>Começar Grátis</button>
          </>
        )}
      </div>

      {/* Mobile burger */}
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)}>
        {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
      </button>

      {mobileOpen && (
        <div className="mobile-menu">
          <NavAnchor href="/#analise" onClick={() => setMobileOpen(false)}>Análise</NavAnchor>
          <NavAnchor href="/#agentes" onClick={() => setMobileOpen(false)}>Agentes</NavAnchor>
          <NavAnchor href="/#precos"  onClick={() => setMobileOpen(false)}>Preços</NavAnchor>
          {FERRAMENTAS.map(({ to, label, icon }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
              {icon} {label}
            </Link>
          ))}
          {authToken && <Link to="/historico" style={linkStyle} onClick={() => setMobileOpen(false)}>Histórico</Link>}
          {authToken && <Link to="/premium" style={{ ...linkStyle, color: 'var(--flame)' }} onClick={() => setMobileOpen(false)}>⚡ Premium</Link>}
          <div style={{ borderTop: '1px solid var(--br-n)', paddingTop: 12, marginTop: 8 }}>
            {authToken ? (
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}>
                <LogOut size={14}/> Sair
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-ghost"  onClick={() => { openModal('login');    setMobileOpen(false); }}>Entrar</button>
                <button className="btn btn-flame"  onClick={() => { openModal('register'); setMobileOpen(false); }}>Começar Grátis</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
