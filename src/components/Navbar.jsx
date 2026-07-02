import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { checkHealth } from '../lib/api';

const FERRAMENTAS_FREE = [
  { to: '/verificar', label: 'Verificar Relatório', icon: '🛡️' },
];

const FERRAMENTAS_SOLO = [
  { to: '/delta',         label: 'Delta Analysis',           icon: '⚡',  badge: 'Solo' },
  { to: '/documentos',    label: 'Upload de Documentos',     icon: '📄',  badge: 'Solo' },
  { to: '/peticoes',      label: 'Gerador de Petições',      icon: '📜',  badge: 'Solo' },
  { to: '/simulador',     label: 'Simulador de Instâncias',  icon: '⚖️', badge: 'Solo' },
  { to: '/monitoramento', label: 'Monitoramento Processual', icon: '🔔',  badge: 'Solo' },
];

export default function Navbar() {
  const [scrolled,     setScrolled]    = useState(false);
  const [mobileOpen,   setMobileOpen]  = useState(false);
  const [toolsOpen,    setToolsOpen]   = useState(false);
  const [engineStatus, setEngineStatus]= useState('checking');
  const toolsRef = useRef(null);
  const { authToken, userData, clearAuth, openModal, addToast } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Navega para a Home (se necessário) e faz scroll suave até a seção com o id informado.
  // Corrige o bug de "/#analise" colidir com o HashRouter (o "#" já pertence ao roteador).
  const goToSection = (id) => {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 250);
    }
  };

  const isSolo = !!(authToken && userData?.is_unlimited);
  const ferramentas = isSolo
    ? [...FERRAMENTAS_SOLO, ...FERRAMENTAS_FREE]
    : FERRAMENTAS_FREE;

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const data = await checkHealth();
        if (!cancelled) setEngineStatus(data?.status === 'ok' ? 'online' : 'offline');
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
    const handler = e => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) setToolsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { clearAuth(); addToast('Sessão encerrada.', 'info'); setMobileOpen(false); };

  const statusColor = engineStatus === 'online' ? 'var(--jade2)' : engineStatus === 'offline' ? 'var(--cr3)' : 'var(--t4)';

  return (
    <nav className={`jnav${scrolled ? ' scrolled' : ''}`}>
      {/* Brand */}
      <Link to="/" className="nav-brand">
        {/* SVG — Scales of Justice, clean line version */}
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <rect width="36" height="36" rx="8" fill="rgba(0,242,254,0.06)" stroke="rgba(0,242,254,0.15)" strokeWidth="1"/>
          <line x1="7" y1="17" x2="29" y2="17" stroke="var(--co7)" strokeWidth="1.3" strokeLinecap="round"/>
          <line x1="18" y1="9" x2="18" y2="27" stroke="var(--co7)" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M7 17 Q9 22 13 22 Q17 22 18 17" stroke="var(--co7)" strokeWidth="1" fill="rgba(0,242,254,0.06)" strokeLinecap="round"/>
          <path d="M18 17 Q19 21 23 21 Q27 21 29 17" stroke="var(--co6)" strokeWidth="1" fill="rgba(0,242,254,0.04)" strokeLinecap="round"/>
          <circle cx="18" cy="9" r="2" fill="var(--co7)"/>
        </svg>
        <span className="nav-wordmark t-display">
          JUR<em>IR</em>
          <sub>ANÁLISE JURÍDICA POR IA</sub>
        </span>
      </Link>

      {/* Center links */}
      <div className="nav-links desktop-only">
        <NLink onClick={() => goToSection('analise')}>Análise</NLink>
        <NLink onClick={() => goToSection('agentes')}>Agentes</NLink>
        <NLink onClick={() => goToSection('precos')}>Preços</NLink>
        <NLink href="/blog" isRouter>Blog</NLink>

        {/* Tools dropdown */}
        <div ref={toolsRef} style={{ position: 'relative' }}>
          <button onClick={() => setToolsOpen(v => !v)} style={navLinkSt(toolsOpen)}>
            Ferramentas
            <ChevronDown size={11} style={{ transition: 'transform .2s', transform: toolsOpen ? 'rotate(180deg)' : 'none' }}/>
          </button>
          {toolsOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)',
              left: '50%', transform: 'translateX(-50%)',
              background: 'var(--bg-glass2)', backdropFilter: 'blur(20px)',
              border: '1px solid var(--b-main)', borderRadius: 'var(--r-md)',
              padding: 6, minWidth: 240,
              boxShadow: 'var(--shadow-deep)',
              zIndex: 300, animation: 'scaleUp .18s var(--ease-spring)',
            }}>
              {ferramentas.map(({ to, label, icon, badge }) => (
                <Link key={to} to={to} onClick={() => setToolsOpen(false)}
                  style={dropItemSt}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,242,254,0.05)'; e.currentTarget.style.color = 'var(--co7)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t2)'; }}
                >
                  <span style={{ fontSize: 'var(--fs-base)' }}>{icon}</span>
                  <span style={{ flex: 1 }}>{label}</span>
                  {badge && !isSolo && (
                    <span style={{
                      fontSize: 'var(--fs-xs)', fontFamily: 'var(--f-mono)', fontWeight: 700,
                      color: 'var(--cr3)', background: 'rgba(220,40,40,.1)',
                      border: '1px solid rgba(220,40,40,.2)', borderRadius: 4,
                      padding: '1px 5px', letterSpacing: '.06em',
                    }}>SOLO</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {authToken && <NLink href="/historico" isRouter>Histórico</NLink>}
          {authToken && <NLink href="/conta" isRouter>Conta</NLink>}
          {authToken && <NLink href="/indique" isRouter>Indique</NLink>}
          {authToken && userData?.is_escritorio && <NLink href="/escritorio" isRouter>Escritório</NLink>}
          {authToken && userData?.is_api_plan   && <NLink href="/api-panel"  isRouter>API</NLink>}
          {authToken && userData?.is_admin && <NLink href="/admin" isRouter style={{ color: 'var(--cr3)' }}>Admin</NLink>}
      </div>

      {/* Right */}
      <div className="nav-actions desktop-only">
        {/* Engine status */}
        <div title={engineStatus === 'online' ? 'Motor online' : 'Motor offline — cold start ~50s'}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: statusColor, letterSpacing: '.08em' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, boxShadow: engineStatus === 'online' ? `0 0 7px ${statusColor}` : 'none', animation: engineStatus === 'checking' ? 'pulse 1.4s ease-in-out infinite' : 'none', flexShrink: 0 }}/>
          {engineStatus === 'checking' ? 'MOTOR…' : engineStatus === 'online' ? 'ONLINE' : 'OFFLINE'}
        </div>

        {authToken ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--t3)', fontFamily: 'var(--f-mono)' }}>
              {userData?.email?.split('@')[0]}
            </span>
            <Link to="/premium" className="btn btn-cobalt btn-sm">⚡ Premium</Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}><LogOut size={13}/> Sair</button>
          </div>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => openModal('login')}>Entrar</button>
            <button className="btn btn-cobalt btn-sm" onClick={() => openModal('register')}>Começar Grátis</button>
          </>
        )}
      </div>

      {/* Mobile */}
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(v => !v)} aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileOpen}>
        {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
      </button>

      {mobileOpen && (
        <div className="mobile-menu">
          <a style={mobileLink} onClick={() => { setMobileOpen(false); goToSection('analise'); }}>Análise</a>
          <a style={mobileLink} onClick={() => { setMobileOpen(false); goToSection('agentes'); }}>Agentes</a>
          <a style={mobileLink} onClick={() => { setMobileOpen(false); goToSection('precos'); }}>Preços</a>
          <Link to="/blog" style={mobileLink} onClick={() => setMobileOpen(false)}>Blog</Link>
          {ferramentas.map(({ to, label, icon }) => (
            <Link key={to} to={to} style={{ ...mobileLink, display: 'flex', gap: 8, alignItems: 'center' }} onClick={() => setMobileOpen(false)}>
              <span>{icon}</span>{label}
            </Link>
          ))}
          {authToken && <Link to="/historico" style={mobileLink} onClick={() => setMobileOpen(false)}>Histórico</Link>}
          {authToken && <Link to="/conta" style={mobileLink} onClick={() => setMobileOpen(false)}>Conta</Link>}
          {authToken && <Link to="/indique" style={mobileLink} onClick={() => setMobileOpen(false)}>🎁 Indique e Ganhe</Link>}
          {authToken && userData?.is_escritorio && <Link to="/escritorio" style={mobileLink} onClick={() => setMobileOpen(false)}>🏛 Escritório</Link>}
          {authToken && userData?.is_api_plan   && <Link to="/api-panel"  style={mobileLink} onClick={() => setMobileOpen(false)}>⚡ API</Link>}
          {authToken && <Link to="/premium" style={{ ...mobileLink, color: 'var(--co7)' }} onClick={() => setMobileOpen(false)}>⚡ Premium</Link>}
          <div style={{ borderTop: '1px solid var(--b-subtle)', paddingTop: 14, marginTop: 8 }}>
            {authToken ? (
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={handleLogout}><LogOut size={14}/> Sair</button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => { openModal('login'); setMobileOpen(false); }}>Entrar</button>
                <button className="btn btn-cobalt" onClick={() => { openModal('register'); setMobileOpen(false); }}>Começar Grátis</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

const navLinkSt = (active = false) => ({
  fontFamily: 'var(--f-sans)', color: active ? 'var(--co7)' : 'var(--t2)',
  fontSize: 'var(--fs-sm)', fontWeight: 500, letterSpacing: '.03em',
  textDecoration: 'none', padding: '7px 13px',
  borderRadius: 'var(--r-sm)', background: 'none', border: 'none',
  display: 'flex', alignItems: 'center', gap: 4,
  cursor: 'pointer', transition: 'color .15s',
});
const dropItemSt = {
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '9px 12px', color: 'var(--t2)', fontSize: 'var(--fs-sm)',
  textDecoration: 'none', borderRadius: 'var(--r-sm)',
  transition: 'all .15s', fontFamily: 'var(--f-sans)',
  letterSpacing: '.02em',
};
const mobileLink = {
  color: 'var(--t2)', fontSize: 'var(--fs-base)', fontWeight: 500,
  letterSpacing: '.02em', textDecoration: 'none', padding: '10px 4px',
  borderBottom: '1px solid var(--b-subtle)', display: 'block',
};
function NLink({ href, children, isRouter, onClick }) {
  const st = navLinkSt();
  const hoverProps = {
    onMouseEnter: e => e.currentTarget.style.color = 'var(--co7)',
    onMouseLeave: e => e.currentTarget.style.color = 'var(--t2)',
  };
  if (isRouter) return <Link to={href} style={st} {...hoverProps}>{children}</Link>;
  // Anchors puramente comportamentais (scroll para seção da Home): sem href,
  // para não colidir com o HashRouter. onClick agora é de fato usado.
  return <a style={{ ...st, cursor: 'pointer' }} onClick={onClick} {...hoverProps}>{children}</a>;
}
