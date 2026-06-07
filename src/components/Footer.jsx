import { Link } from 'react-router-dom';

const LINKS = [
  { label: 'Análise Jurídica',     href: '/#analise' },
  { label: 'Conselho de Agentes',  href: '/#agentes' },
  { label: 'Planos e Preços',      href: '/#precos' },
  { label: 'Delta Analysis',       href: '/delta' },
  { label: 'Upload de Documentos', href: '/documentos' },
  { label: 'Gerador de Petições',  href: '/peticoes' },
  { label: 'Simulador Judicial',   href: '/simulador' },
  { label: 'Monitoramento',        href: '/monitoramento' },
  { label: 'Verificar Relatório',  href: '/verificar' },
];

const PRINCIPLES = [
  { icon: '⚖️', label: 'Contraditório Real',     desc: 'Todo caso passa pelo Advogado do Diabo' },
  { icon: '🏛️', label: 'Veredicto Imparcial',   desc: 'Juiz IA Quantum prolata sem viés' },
  { icon: '🔒', label: 'Dados Protegidos',       desc: 'SSL + armazenamento seguro' },
  { icon: '📜', label: 'Legislação Vigente',     desc: 'CC, CLT, CDC, CPC, CF atualizados' },
];

export default function Footer() {
  return (
    <footer className="footer">
      {/* Quantum constellation decoration */}
      <div style={{ position:'absolute', top:20, right:60, opacity:0.25, pointerEvents:'none', display:'flex', gap:6, alignItems:'center' }}>
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{
            width: i===2 ? 5 : 3, height: i===2 ? 5 : 3,
            borderRadius:'50%', background:'var(--co7)',
            boxShadow: i===2 ? '0 0 8px rgba(20,114,217,0.6)' : 'none',
          }}/>
        ))}
      </div>

      <div style={{ maxWidth:960, margin:'0 auto' }}>

        {/* ── PRINCIPLES ROW ── */}
        <div style={{
          display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px, 1fr))',
          gap:1, background:'var(--b-subtle)',
          borderRadius:'var(--r-lg)', overflow:'hidden',
          marginBottom:56,
          border:'1px solid var(--b-main)',
        }}>
          {PRINCIPLES.map((p, i) => (
            <div key={i} style={{
              background:'var(--bg-deep)', padding:'20px 20px',
              display:'flex', flexDirection:'column', gap:6,
            }}>
              <div style={{ fontSize:'1.1rem', marginBottom:2 }}>{p.icon}</div>
              <div style={{ fontFamily:'var(--f-sans)', fontSize:'.78rem', fontWeight:600, color:'var(--t1)', letterSpacing:'.02em' }}>
                {p.label}
              </div>
              <div style={{ fontFamily:'var(--f-mono)', fontSize:'.6rem', color:'var(--t3)', letterSpacing:'.06em', lineHeight:1.5 }}>
                {p.desc}
              </div>
            </div>
          ))}
        </div>

        {/* ── TOP ROW ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:48, flexWrap:'wrap', marginBottom:52 }}>

          {/* Brand block */}
          <div style={{ maxWidth:360 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
              <svg width="32" height="32" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="8" fill="rgba(20,114,217,0.07)" stroke="rgba(20,114,217,0.18)" strokeWidth="1"/>
                <line x1="7" y1="17" x2="29" y2="17" stroke="var(--co7)" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="18" y1="9" x2="18" y2="27" stroke="var(--co7)" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M7 17 Q9 22 13 22 Q17 22 18 17" stroke="var(--co7)" strokeWidth="1.1" fill="rgba(20,114,217,0.07)" strokeLinecap="round"/>
                <path d="M18 17 Q19 21 23 21 Q27 21 29 17" stroke="var(--co6)" strokeWidth="1.1" fill="rgba(20,114,217,0.05)" strokeLinecap="round"/>
                <circle cx="18" cy="9" r="2.2" fill="var(--co7)"/>
              </svg>
              <div>
                <div className="t-display" style={{ fontSize:'1.4rem', fontWeight:600, color:'var(--t0)', letterSpacing:'-.01em' }}>
                  JUR<em style={{ fontStyle:'italic', color:'var(--co7)' }}>IR</em>
                </div>
                <div style={{ fontFamily:'var(--f-mono)', fontSize:'.38rem', color:'var(--t5)', letterSpacing:'.28em' }}>
                  INTELIGÊNCIA JURÍDICA QUÂNTICA
                </div>
              </div>
            </div>

            <p style={{ fontSize:'.84rem', color:'var(--t3)', lineHeight:1.75, marginBottom:16 }}>
              A plataforma de inteligência jurídica de nova geração para o mercado brasileiro.
              Dezesseis agentes especializados, análise em minutos, veredicto preciso e imparcial.
            </p>

            <p style={{
              fontFamily:'var(--f-display)', fontStyle:'italic',
              fontSize:'.85rem', color:'var(--t5)',
              borderLeft:'2px solid var(--b-cobalt)', paddingLeft:12,
              lineHeight:1.5,
            }}>
              "Fiat iustitia, ruat caelum"
            </p>

            {/* Version tag */}
            <div style={{
              display:'inline-flex', alignItems:'center', gap:6,
              marginTop:20, padding:'4px 12px',
              background:'rgba(20,114,217,0.05)', border:'1px solid var(--b-cobalt)',
              borderRadius:'var(--r-pill)',
            }}>
              <span style={{ width:4, height:4, borderRadius:'50%', background:'var(--jade2)', boxShadow:'0 0 5px rgba(16,185,129,0.5)' }}/>
              <span style={{ fontFamily:'var(--f-mono)', fontSize:'.55rem', color:'var(--co7)', letterSpacing:'.14em' }}>
                SISTEMA v10.0 · OPERACIONAL
              </span>
            </div>
          </div>

          {/* Links col */}
          <div>
            <div style={{ fontFamily:'var(--f-mono)', fontSize:'.6rem', color:'var(--t5)', letterSpacing:'.22em', marginBottom:16, textTransform:'uppercase' }}>
              Plataforma
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {LINKS.map(l => (
                <a key={l.label} href={l.href} style={{
                  fontSize:'.83rem', color:'var(--t3)',
                  textDecoration:'none', transition:'color .15s',
                  display:'flex', alignItems:'center', gap:6,
                  fontFamily:'var(--f-sans)',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--co7)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--t3)'}
                >
                  <span style={{ width:3, height:3, borderRadius:'50%', background:'var(--b-cobalt)', flexShrink:0 }}/>
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Legal disclaimer */}
          <div style={{ maxWidth:220 }}>
            <div style={{ fontFamily:'var(--f-mono)', fontSize:'.6rem', color:'var(--t5)', letterSpacing:'.22em', marginBottom:16, textTransform:'uppercase' }}>
              Aviso Legal
            </div>
            <p style={{ fontSize:'.75rem', color:'var(--t2)', lineHeight:1.7, fontFamily:'var(--f-sans)' }}>
              O JURIR é uma ferramenta de análise jurídica assistida por inteligência artificial.
              Não substitui o aconselhamento de um advogado habilitado na OAB.
              Consulte sempre um profissional para decisões legais vinculantes.
            </p>
            <div style={{ marginTop:14, fontFamily:'var(--f-mono)', fontSize:'.58rem', color:'var(--t3)', letterSpacing:'.1em' }}>
              © {new Date().getFullYear()} JURIR
            </div>
          </div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div style={{
          borderTop:'1px solid var(--b-subtle)', paddingTop:24,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          flexWrap:'wrap', gap:12,
        }}>
          <span style={{ fontFamily:'var(--f-mono)', fontSize:'.6rem', color:'var(--t3)', letterSpacing:'.1em' }}>
            © {new Date().getFullYear()} JURIR · INTELIGÊNCIA JURÍDICA QUÂNTICA · TODOS OS DIREITOS RESERVADOS
          </span>
          <div style={{ display:'flex', gap:20 }}>
            {['SambaNova AI', 'Cerebras', 'Google Gemini', 'OpenRouter'].map(p => (
              <span key={p} style={{ fontFamily:'var(--f-mono)', fontSize:'.55rem', color:'var(--t3)', letterSpacing:'.08em', opacity:0.9 }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
