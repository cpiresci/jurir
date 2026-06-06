import { Link } from 'react-router-dom';

const LINKS = {
  'Produto': [
    { label: 'Análise Jurídica',  to: '/#analise' },
    { label: 'Os 16 Agentes',    to: '/#agentes' },
    { label: 'Planos',           to: '/#precos'  },
  ],
  'Ferramentas': [
    { label: 'Delta Analysis',       to: '/delta' },
    { label: 'Upload Documentos',    to: '/documentos' },
    { label: 'Gerador Petições',     to: '/peticoes' },
    { label: 'Simulador Instâncias', to: '/simulador' },
    { label: 'Monitoramento',        to: '/monitoramento' },
  ],
  'Conta': [
    { label: 'Histórico',        to: '/historico' },
    { label: 'Premium',          to: '/premium' },
    { label: 'Verificar Serial', to: '/verificar' },
  ],
};

// Scales logo for footer
function FooterLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 34 34" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 10 }}>
      <line x1="17" y1="3" x2="17" y2="29" stroke="rgba(255,0,77,0.5)" strokeWidth="1.2"/>
      <line x1="5" y1="10" x2="29" y2="10" stroke="rgba(255,0,77,0.6)" strokeWidth="1.3"/>
      <path d="M5 10 L9 18 L1 18 Z" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth=".9"/>
      <path d="M29 10 L33 18 L25 18 Z" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth=".9"/>
      <line x1="13" y1="29" x2="21" y2="29" stroke="rgba(255,0,77,0.4)" strokeWidth="1.2"/>
      <rect x="15.2" y="8.2" width="3.6" height="3.6" rx="0.4" fill="var(--flame)" transform="rotate(45 17 10)"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.7rem', fontWeight: 900, marginBottom: 12, color: 'var(--n0)', textTransform: 'uppercase', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
              <FooterLogo />
              JUR<span style={{ color: 'var(--flame)' }}>IR</span>
            </div>
            <p style={{ fontSize: '.78rem', color: 'var(--n5)', maxWidth: 220, lineHeight: 1.75 }}>
              Inteligência Jurídica Quântica — análise multidisciplinar por 16 agentes de IA especializados.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--n8)', border: '1px solid var(--br-n)', borderRadius: 'var(--r-pill)', padding: '3px 10px', fontSize: '.6rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', letterSpacing: '.12em' }}>
                v12.0
              </span>
              <span style={{ background: 'rgba(0,208,132,0.07)', border: '1px solid rgba(0,208,132,0.18)', borderRadius: 'var(--r-pill)', padding: '3px 10px', fontSize: '.6rem', color: 'var(--emerald)', fontFamily: 'var(--f-mono)', letterSpacing: '.12em' }}>
                ONLINE
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([cat, links]) => (
            <div key={cat}>
              <div className="footer-cat">{cat}</div>
              {links.map(({ label, to }) => (
                <Link key={to} to={to} className="footer-link">{label}</Link>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© 2025 JURIR — Todos os direitos reservados</div>
          <div className="footer-disclaimer">
            O JURIR fornece análise jurídica por IA como ferramenta de suporte.
            Não substitui consultoria jurídica profissional. Consulte um advogado habilitado.
          </div>
        </div>
      </div>
    </footer>
  );
}
