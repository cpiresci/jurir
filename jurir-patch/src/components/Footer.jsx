import { Link } from 'react-router-dom';

const LINKS = {
  'Produto':     [
    { label: 'Análise Jurídica',  to: '/#analise' },
    { label: 'Os 16 Agentes',    to: '/#agentes' },
    { label: 'Planos',           to: '/#precos' },
  ],
  'Ferramentas': [
    { label: 'Delta Analysis',       to: '/delta' },
    { label: 'Upload Documentos',    to: '/documentos' },
    { label: 'Gerador Petições',     to: '/peticoes' },
    { label: 'Simulador Instâncias', to: '/simulador' },
    { label: 'Monitoramento',        to: '/monitoramento' },
  ],
  'Conta':       [
    { label: 'Histórico',        to: '/historico' },
    { label: 'Premium',          to: '/premium' },
    { label: 'Verificar Serial', to: '/verificar' },
  ],
};

const linkStyle = {
  color: 'var(--n5)', textDecoration: 'none', fontSize: '.78rem',
  transition: 'color .2s', lineHeight: 1.8,
};

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--bn)',
      background: 'rgba(2,2,10,.6)',
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '52px 24px 32px' }}>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(3, 1fr)', gap: 40, marginBottom: 48 }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
              JUR<span style={{ color: 'var(--r3)' }}>IR</span>
            </div>
            <p style={{ fontSize: '.78rem', color: 'var(--n5)', maxWidth: 200, lineHeight: 1.7 }}>
              Inteligência Jurídica Quântica — análise multidisciplinar por 16 agentes de IA.
            </p>
            <div style={{ marginTop: 16, display: 'flex', gap: 6 }}>
              <span style={{
                background: 'var(--lift)', border: '1px solid var(--bn)',
                borderRadius: 'var(--r-pill)', padding: '3px 10px',
                fontSize: '.62rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)',
              }}>v10.0</span>
              <span style={{
                background: 'rgba(5,150,105,.1)', border: '1px solid rgba(5,150,105,.2)',
                borderRadius: 'var(--r-pill)', padding: '3px 10px',
                fontSize: '.62rem', color: 'var(--emerald2)', fontFamily: 'var(--f-mono)',
              }}>Quantum Jurist</span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([cat, items]) => (
            <div key={cat}>
              <div style={{ fontSize: '.68rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 12 }}>
                {cat}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map(({ label, to }) => (
                  to.startsWith('/#') ? (
                    <a key={label} href={to} style={linkStyle}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--n2)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--n5)'}
                    >{label}</a>
                  ) : (
                    <Link key={label} to={to} style={linkStyle}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--n2)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--n5)'}
                    >{label}</Link>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div style={{
          borderTop: '1px solid var(--bn2)', paddingTop: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: '.72rem', color: 'var(--n6)', fontFamily: 'var(--f-mono)' }}>
            © {new Date().getFullYear()} JURIR · Todos os direitos reservados
          </p>
          <p style={{ fontSize: '.72rem', color: 'var(--n6)', maxWidth: 420, textAlign: 'right' }}>
            Não substitui aconselhamento jurídico profissional. Consulte sempre um advogado habilitado pela OAB.
          </p>
        </div>
      </div>
    </footer>
  );
}
