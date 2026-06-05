import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { checkHealth } from '../lib/api';

const FERRAMENTAS = [
  { to: '/delta',         label: 'Delta Analysis',          icon: '⚡' },
  { to: '/documentos',    label: 'Upload de Documentos',    icon: '📄' },
  { to: '/peticoes',      label: 'Gerador de Petições',     icon: '📜' },
  { to: '/simulador',     label: 'Simulador de Instâncias', icon: '⚖️' },
  { to: '/monitoramento', label: 'Monitoramento Processual',icon: '🔔' },
  { to: '/verificar',     label: 'Verificar Relatório',     icon: '🛡️' },
];

export default function Navbar() {
  const [scrolled,   setScrolled]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen,  setToolsOpen]  = useState(false);
  // 'checking' | 'online' | 'offline'
  const [engineStatus, setEngineStatus] = useState('checking');
  const toolsRef = useRef(null);
  const { authToken, userData, clearAuth, openModal, addToast } = useStore();

  // ── Health check: verifica ao montar e a cada 3 minutos ──
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
      <Link to="/" className="nav-brand">
        <span className="nav-logo">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <polygon points="17,2 32,28 2,28" stroke="#B91C1C" strokeWidth="1.5" fill="none" opacity=".8"/>
            <polygon points="17,8 27,26 7,26"  stroke="#CA8A04" strokeWidth=".8"  fill="none" opacity=".5"/>
            <circle cx="17" cy="19" r="3" fill="#B91C1C" opacity=".9"/>
            <line x1="17" y1="6" x2="17" y2="16" stroke="#EDE6DA" strokeWidth=".8" opacity=".4"/>
          </svg>
        </span>
        <span className="nav-wordmark t-display">
          JUR<em>IR</em>
          <sub>INTELIGÊNCIA JURÍDICA</sub>
        </span>
      </Link>

      <div className="nav-links desktop-only">
        <NavAnchor href="/#analise">Análise</NavAnchor>
        <NavAnchor href="/#agentes">Agentes</NavAnchor>
        <NavAnchor href="/#precos">Preços</NavAnchor>

        {/* Ferramentas dropdown */}
        <div ref={toolsRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setToolsOpen(v => !v)}
            style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--n0)'}
            onMouseLeave={e => !toolsOpen && (e.currentTarget.style.color = 'var(--n3)')}
          >
            Ferramentas <ChevronDown size={12} style={{ transition: 'transform .2s', transform: toolsOpen ? 'rotate(180deg)' : 'none' }}/>
          </button>
          {toolsOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
              marginTop: 8, background: 'var(--glass2)', border: '1px solid var(--bn)',
              borderRadius: 'var(--r-md)', padding: 6, minWidth: 230,
              backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-deep)', zIndex: 300,
            }}>
              {FERRAMENTAS.map(({ to, label, icon }) => (
                <Link key={to} to={to} onClick={() => setToolsOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    color: 'var(--n3)', fontSize: '.83rem', textDecoration: 'none',
                    borderRadius: 'var(--r-sm)', transition: 'background .15s, color .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--lift)'; e.currentTarget.style.color = 'var(--n0)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--n3)'; }}
                >
                  <span style={{ fontSize: '.9rem' }}>{icon}</span> {label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {authToken && <Link to="/historico" style={linkStyle}>Histórico</Link>}
      </div>

      <div className="nav-actions desktop-only">
        {/* ── Indicador de motor ── */}
        <div
          title={
            engineStatus === 'checking' ? 'Verificando motor…' :
            engineStatus === 'online'   ? 'Motor online' : 'Motor offline — cold start pode levar ~50s'
          }
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: '.72rem', fontFamily: 'var(--f-mono)',
            color: engineStatus === 'online' ? 'var(--g4)' :
                   engineStatus === 'offline' ? '#ef4444' : 'var(--n5)',
            letterSpacing: '.06em', userSelect: 'none',
            cursor: 'default',
          }}
        >
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: engineStatus === 'online'  ? 'var(--g4)' :
                        engineStatus === 'offline' ? '#ef4444' : 'var(--n5)',
            boxShadow: engineStatus === 'online'
              ? '0 0 6px var(--g4)' : engineStatus === 'offline'
              ? '0 0 6px #ef4444' : 'none',
            animation: engineStatus === 'checking' ? 'pulse 1.4s ease-in-out infinite' : 'none',
          }} />
          {engineStatus === 'checking' ? 'MOTOR…' :
           engineStatus === 'online'   ? 'MOTOR OK' : 'MOTOR OFF'}
        </div>
        {authToken ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.8rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)' }}>
              {userData?.email?.split('@')[0]}
            </span>
            <Link to="/premium" className="btn btn-gold btn-sm">⚡ Premium</Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <LogOut size={14}/> Sair
            </button>
          </div>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm"   onClick={() => openModal('login')}>Entrar</button>
            <button className="btn btn-crimson btn-sm" onClick={() => openModal('register')}>Começar Grátis</button>
          </>
        )}
      </div>

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
              <span>{icon}</span> {label}
            </Link>
          ))}
          {authToken && <Link to="/historico" style={linkStyle} onClick={() => setMobileOpen(false)}>Histórico</Link>}
          {authToken && <Link to="/premium" style={{ ...linkStyle, color: 'var(--g4)' }} onClick={() => setMobileOpen(false)}>⚡ Premium</Link>}
          <div style={{ borderTop: '1px solid var(--bn)', paddingTop: 12, marginTop: 8 }}>
            {authToken ? (
              <button className="btn btn-ghost" style={{ width: '100%' }} onClick={handleLogout}>
                <LogOut size={14}/> Sair
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-ghost"   onClick={() => { openModal('login');    setMobileOpen(false); }}>Entrar</button>
                <button className="btn btn-crimson" onClick={() => { openModal('register'); setMobileOpen(false); }}>Começar Grátis</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

const linkStyle = {
  color: 'var(--n3)', fontSize: '.825rem', fontWeight: 500,
  letterSpacing: '.04em', textDecoration: 'none', padding: '6px 12px',
  borderRadius: 'var(--r-sm)',
};

function NavAnchor({ href, children, onClick }) {
  return (
    <a href={href} onClick={onClick} style={linkStyle}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--n0)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--n3)'}>
      {children}
    </a>
  );
}
