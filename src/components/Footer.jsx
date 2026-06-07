import { Link } from 'react-router-dom';

const LINKS = [
  { label: 'Análise',      href: '/#analise' },
  { label: 'Agentes',      href: '/#agentes' },
  { label: 'Preços',       href: '/#precos' },
  { label: 'Delta',        href: '/delta' },
  { label: 'Documentos',   href: '/documentos' },
  { label: 'Petições',     href: '/peticoes' },
  { label: 'Simulador',    href: '/simulador' },
  { label: 'Monitoramento',href: '/monitoramento' },
  { label: 'Verificar',    href: '/verificar' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Top */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', marginBottom: 48 }}>
          {/* Brand */}
          <div style={{ maxWidth: 340 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="8" fill="rgba(20,114,217,0.06)" stroke="rgba(20,114,217,0.15)" strokeWidth="1"/>
                <line x1="7" y1="17" x2="29" y2="17" stroke="var(--co7)" strokeWidth="1.3" strokeLinecap="round"/>
                <line x1="18" y1="9" x2="18" y2="27" stroke="var(--co7)" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M7 17 Q9 22 13 22 Q17 22 18 17" stroke="var(--co7)" strokeWidth="1" fill="rgba(20,114,217,0.06)" strokeLinecap="round"/>
                <path d="M18 17 Q19 21 23 21 Q27 21 29 17" stroke="var(--co6)" strokeWidth="1" fill="rgba(20,114,217,0.04)" strokeLinecap="round"/>
                <circle cx="18" cy="9" r="2" fill="var(--co7)"/>
              </svg>
              <span className="t-display" style={{ fontSize: '1.3rem', fontWeight: 600, color: 'var(--t0)' }}>
                JUR<em style={{ fontStyle: 'italic', color: 'var(--co7)' }}>IR</em>
              </span>
            </div>
            <p style={{ fontSize: '.82rem', color: 'var(--t4)', lineHeight: 1.7 }}>
              A plataforma de inteligência jurídica de nova geração. 16 agentes especializados, análise em minutos, veredicto preciso.
            </p>
            <p style={{ fontFamily: 'var(--f-display)', fontStyle: 'italic', fontSize: '.8rem', color: 'var(--t5)', marginTop: 12 }}>
              "Fiat iustitia, ruat caelum"
            </p>
          </div>

          {/* Links */}
          <div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t5)', letterSpacing: '.18em', marginBottom: 14 }}>
              PLATAFORMA
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {LINKS.map(l => (
                <a key={l.label} href={l.href} style={{
                  fontSize: '.82rem', color: 'var(--t3)',
                  textDecoration: 'none', transition: 'color .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--co7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid var(--b-subtle)', paddingTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t5)', letterSpacing: '.08em' }}>
            © {new Date().getFullYear()} JURIR · INTELIGÊNCIA JURÍDICA · TODOS OS DIREITOS RESERVADOS
          </span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t5)', letterSpacing: '.08em' }}>
            NÃO SUBSTITUI ACONSELHAMENTO JURÍDICO PROFISSIONAL
          </span>
        </div>
      </div>
    </footer>
  );
}
