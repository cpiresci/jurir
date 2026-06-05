export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--bn)',
      padding: '40px 24px',
      textAlign: 'center',
      background: 'rgba(2,2,10,0.5)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{
          fontFamily: 'var(--f-display)',
          fontSize: '1.3rem', fontWeight: 700,
          letterSpacing: '.08em', marginBottom: 8,
        }}>
          JUR<span style={{ color: 'var(--r3)' }}>IR</span>
        </div>
        <p style={{ fontSize: '.78rem', color: 'var(--n5)', maxWidth: 480, margin: '0 auto 16px' }}>
          Inteligência Jurídica Quântica — análise multidisciplinar por IA.
          Não substitui aconselhamento jurídico profissional.
        </p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Termos de Uso', 'Privacidade', 'Contato'].map(l => (
            <a
              key={l} href="#"
              style={{ fontSize: '.78rem', color: 'var(--n5)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--n3)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--n5)'}
            >
              {l}
            </a>
          ))}
        </div>
        <p style={{ fontSize: '.7rem', color: 'var(--n6)', marginTop: 20, fontFamily: 'var(--f-mono)' }}>
          © {new Date().getFullYear()} JURIR · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
