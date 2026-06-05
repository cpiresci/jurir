import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useStore } from '../store';

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { authToken, userData, clearAuth, openModal, addToast } = useStore();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 55);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
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
        {authToken && <Link to="/historico" style={linkStyle}>Histórico</Link>}
      </div>

      <div className="nav-actions desktop-only">
        {authToken ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '.8rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)' }}>
              {userData?.email?.split('@')[0]}
            </span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <LogOut size={14} /> Sair
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
          {authToken && (
            <Link to="/historico" style={linkStyle} onClick={() => setMobileOpen(false)}>Histórico</Link>
          )}
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
    <a
      href={href}
      onClick={onClick}
      style={linkStyle}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--n0)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--n3)'}
    >
      {children}
    </a>
  );
}
