import { Scale } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="lex-footer">
      <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{
          fontFamily: 'var(--f-display)',
          fontSize: '1.6rem', fontWeight: 700,
          letterSpacing: '.06em', marginBottom: 6,
          color: 'var(--p0)',
        }}>
          JUR<span style={{
            color: 'var(--au6)',
            textShadow: '0 0 24px rgba(228,168,36,0.40)',
            fontStyle: 'italic',
          }}>IR</span>
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: 'var(--f-display)', fontStyle: 'italic',
          fontSize: '.88rem', color: 'var(--p5)',
          letterSpacing: '.04em', marginBottom: 28,
        }}>
          "Fiat iustitia ruat caelum"
        </p>

        {/* Divider */}
        <div style={{
          height: 1, maxWidth: 320, margin: '0 auto 28px',
          background: 'linear-gradient(90deg, transparent, var(--b-gold), transparent)',
        }}/>

        {/* Description */}
        <p style={{
          fontSize: '.8rem', color: 'var(--p5)',
          maxWidth: 500, margin: '0 auto 24px',
          lineHeight: 1.7,
        }}>
          Inteligência Jurídica Quântica — análise multidisciplinar por IA.
          Não substitui aconselhamento jurídico profissional.
        </p>

        {/* Links */}
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {['Termos de Uso', 'Privacidade', 'Contato'].map(l => (
            <a
              key={l} href="#"
              style={{
                fontSize: '.78rem', color: 'var(--p5)',
                textDecoration: 'none', letterSpacing: '.04em',
                transition: 'color .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--au6)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--p5)'}
            >
              {l}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p style={{
          fontSize: '.68rem', color: 'var(--p6)',
          fontFamily: 'var(--f-mono)', letterSpacing: '.1em',
        }}>
          © {year} JURIR · Todos os direitos reservados · v10.0
        </p>
      </div>
    </footer>
  );
}
