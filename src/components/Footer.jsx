import { useState, useEffect, useRef } from 'react';

const NAV_COLS = [
  {
    heading: 'Análise',
    links: [
      { label: 'Motor Jurídico',       href: '/#analise' },
      { label: 'Conselho de Agentes',  href: '/#agentes' },
      { label: 'Delta Analysis',       href: '/delta' },
      { label: 'Upload de Documentos', href: '/documentos' },
    ],
  },
  {
    heading: 'Ferramentas',
    links: [
      { label: 'Gerador de Petições', href: '/peticoes' },
      { label: 'Simulador Judicial',  href: '/simulador' },
      { label: 'Monitoramento',       href: '/monitoramento' },
      { label: 'Verificar Relatório', href: '/verificar' },
    ],
  },
  {
    heading: 'Plataforma',
    links: [
      { label: 'Planos e Preços',         href: '/#precos' },
      { label: 'Política de Privacidade', href: '/privacidade' },
      { label: 'Aviso Legal',             href: '/privacidade' },
    ],
  },
];

const STATS = [
  { value: '16',    unit: 'agentes', label: 'especializados em paralelo' },
  { value: '100%',  unit: 'swarm',   label: 'contraditório garantido' },
  { value: '<3',    unit: 'min',     label: 'tempo médio de análise' },
  { value: 'v11.0', unit: 'motor',   label: 'jurídico quântico' },
];

const PROVIDERS = [
  { name: 'SambaNova', dot: '#00f2fe' },
  { name: 'Cerebras',  dot: '#4facfe' },
  { name: 'Gemini',    dot: '#a78bfa' },
  { name: 'OpenRouter',dot: '#10b981' },
];

/* ── hook de breakpoint ─────────────────────────────────────────────── */
function useIsMobile(bp = 768) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return mobile;
}

/* ── StatCounter com IntersectionObserver ──────────────────────────── */
function StatCounter({ value, unit, label }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--f-display)',
        fontSize: 'clamp(1.6rem, 2.8vw, 2.4rem)',
        fontWeight: 700,
        color: 'var(--co7)',
        lineHeight: 1,
        letterSpacing: '-.03em',
        textShadow: '0 0 40px rgba(0,242,254,0.30)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(14px)',
        transition: 'opacity .7s ease, transform .7s ease',
      }}>
        {value}
        <span style={{ fontSize: '.44em', color: 'var(--co8)', marginLeft: 5 }}>{unit}</span>
      </div>
      <div style={{
        fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
        color: 'var(--t4)', letterSpacing: '.12em',
        marginTop: 8, textTransform: 'uppercase',
        opacity: visible ? 1 : 0,
        transition: 'opacity .7s .12s ease',
      }}>
        {label}
      </div>
    </div>
  );
}

/* ── FooterLink ─────────────────────────────────────────────────────── */
function FooterLink({ href, children }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 'var(--fs-sm)', fontFamily: 'var(--f-sans)',
        color: hov ? 'var(--co7)' : 'var(--t3)',
        textDecoration: 'none',
        transition: 'color .2s',
        padding: '5px 0',
      }}
    >
      <span style={{
        display: 'inline-block',
        width: hov ? 20 : 6, height: 1,
        background: hov
          ? 'linear-gradient(90deg,var(--co7),var(--co8))'
          : 'rgba(0,242,254,0.18)',
        transition: 'width .25s ease',
        flexShrink: 0, borderRadius: 2,
      }}/>
      {children}
    </a>
  );
}

/* ── NavColumn accordion no mobile ─────────────────────────────────── */
function NavColumn({ col, mobile }) {
  const [open, setOpen] = useState(false);
  const isOpen = !mobile || open;

  return (
    <div>
      <button
        onClick={() => mobile && setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', padding: 0, cursor: mobile ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          marginBottom: isOpen ? 16 : 0,
          userSelect: 'none',
        }}
      >
        <span style={{
          display: 'inline-block', width: 14, height: 1,
          background: 'linear-gradient(90deg,var(--co7),transparent)',
          flexShrink: 0,
        }}/>
        <span style={{
          fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
          letterSpacing: '.22em', color: 'var(--co7)',
          textTransform: 'uppercase', flex: 1, textAlign: 'left',
        }}>
          {col.heading}
        </span>
        {mobile && (
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
            color: 'var(--t4)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform .2s',
            display: 'inline-block',
          }}>▾</span>
        )}
      </button>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 0,
        overflow: 'hidden',
        maxHeight: isOpen ? 300 : 0,
        opacity: isOpen ? 1 : 0,
        transition: 'max-height .3s ease, opacity .25s ease',
      }}>
        {col.links.map(l => (
          <FooterLink key={l.label} href={l.href}>{l.label}</FooterLink>
        ))}
      </div>
    </div>
  );
}

/* ── Footer principal ───────────────────────────────────────────────── */
export default function Footer() {
  const year   = new Date().getFullYear();
  const mobile = useIsMobile(768);

  return (
    <footer style={{
      position: 'relative',
      background: 'var(--abyss)',
      borderTop: '1px solid rgba(0,242,254,0.07)',
      overflow: 'hidden',
    }}>

      {/* Linha de topo luminosa */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0,242,254,0.55) 30%, rgba(79,172,254,0.38) 70%, transparent)',
      }}/>

      {/* Glow de fundo */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 900, height: 500,
        background: 'radial-gradient(ellipse at center bottom, rgba(0,242,254,0.04) 0%, transparent 65%)',
        pointerEvents: 'none',
      }}/>

      {/* Grid decorativo */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,242,254,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,242,254,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
        maskImage: 'linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)',
      }}/>

      <div style={{
        maxWidth: 1100, margin: '0 auto',
        padding: mobile ? '0 20px' : '0 40px',
        position: 'relative', zIndex: 1,
      }}>

        {/* ── STATS STRIP ──────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)',
          borderBottom: '1px solid rgba(0,242,254,0.07)',
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding: mobile ? '32px 8px' : '44px 0',
              borderRight: mobile
                ? (i % 2 === 0 ? '1px solid rgba(0,242,254,0.06)' : 'none')
                : (i < 3 ? '1px solid rgba(0,242,254,0.06)' : 'none'),
              borderBottom: mobile && i < 2 ? '1px solid rgba(0,242,254,0.06)' : 'none',
            }}>
              <StatCounter {...s} />
            </div>
          ))}
        </div>

        {/* ── MAIN GRID ────────────────────────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1.6fr 1fr 1fr 1fr',
          gap: mobile ? 0 : 48,
          padding: mobile ? '40px 0 36px' : '60px 0 56px',
          borderBottom: '1px solid rgba(0,242,254,0.06)',
        }}>

          {/* BRAND ─────────────────────────────────────────────────── */}
          <div style={{ marginBottom: mobile ? 36 : 0 }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div style={{
                width: 46, height: 46,
                background: 'rgba(0,242,254,0.04)',
                border: '1px solid rgba(0,242,254,0.20)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 32px rgba(0,242,254,0.08), inset 0 1px 0 rgba(0,242,254,0.06)',
                flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
                  <line x1="7" y1="17" x2="29" y2="17" stroke="#00f2fe" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="18" y1="9" x2="18" y2="27" stroke="#00f2fe" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M7 17 Q9 22 13 22 Q17 22 18 17" stroke="#00f2fe" strokeWidth="1.2" fill="rgba(0,242,254,0.07)" strokeLinecap="round"/>
                  <path d="M18 17 Q19 21 23 21 Q27 21 29 17" stroke="#4facfe" strokeWidth="1.2" fill="rgba(79,172,254,0.05)" strokeLinecap="round"/>
                  <circle cx="18" cy="9" r="2.2" fill="#00f2fe"/>
                </svg>
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--f-display)',
                  fontSize: 'var(--fs-3xl)', fontWeight: 700,
                  color: '#fff', letterSpacing: '-.01em', lineHeight: 1,
                }}>
                  JUR<em style={{ fontStyle: 'italic', color: '#00f2fe' }}>IR</em>
                </div>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
                  letterSpacing: '.28em', color: 'var(--t4)',
                  marginTop: 5, textTransform: 'uppercase',
                }}>
                  INTELIGÊNCIA JURÍDICA QUÂNTICA
                </div>
              </div>
            </div>

            <p style={{
              fontSize: 'var(--fs-sm)', color: 'var(--t3)',
              lineHeight: 1.80, fontFamily: 'var(--f-sans)',
              marginBottom: 20,
              maxWidth: mobile ? '100%' : 320,
            }}>
              Dezesseis especialistas em paralelo. Contraditório garantido.
              Veredicto imparcial entregue em minutos para o mercado jurídico brasileiro.
            </p>

            <blockquote style={{
              fontFamily: 'var(--f-display)', fontStyle: 'italic',
              fontSize: 'var(--fs-base)', color: 'var(--t4)',
              borderLeft: '2px solid rgba(0,242,254,0.28)',
              paddingLeft: 14, lineHeight: 1.55, marginBottom: 22,
            }}>
              "Fiat iustitia, ruat caelum"
            </blockquote>

            {/* Status pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 16px',
              background: 'rgba(0,242,254,0.03)',
              border: '1px solid rgba(0,242,254,0.14)',
              borderRadius: 999,
              boxShadow: '0 0 20px rgba(0,242,254,0.05)',
              marginBottom: 22,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--jade2)',
                boxShadow: '0 0 8px rgba(16,185,129,0.7)',
                animation: 'pulse 2.5s ease-in-out infinite',
              }}/>
              <span style={{
                fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
                letterSpacing: '.16em', color: 'var(--co7)',
                textTransform: 'uppercase',
              }}>
                SISTEMA v11.0 · OPERACIONAL
              </span>
            </div>

            {/* Aviso legal */}
            <div style={{
              padding: '14px 16px',
              background: 'rgba(0,242,254,0.02)',
              border: '1px solid rgba(0,242,254,0.07)',
              borderRadius: 10,
              borderLeft: '2px solid rgba(0,242,254,0.22)',
            }}>
              <div style={{
                fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
                letterSpacing: '.15em', color: 'var(--co7)',
                marginBottom: 7, textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span>⚖</span> Aviso Legal
              </div>
              <p style={{
                fontSize: 'var(--fs-xs)', color: 'var(--t4)',
                lineHeight: 1.68, fontFamily: 'var(--f-sans)', margin: 0,
              }}>
                Ferramenta de análise jurídica assistida por IA. Não substitui
                advogado habilitado pela OAB. Consulte sempre um profissional
                para decisões legais vinculantes.
              </p>
            </div>
          </div>

          {/* NAV COLS ─────────────────────────────────────────────── */}
          {mobile ? (
            /* Mobile: accordion separado por divisor */
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {NAV_COLS.map((col, i) => (
                <div key={col.heading} style={{
                  borderTop: '1px solid rgba(0,242,254,0.06)',
                  padding: '16px 0',
                }}>
                  <NavColumn col={col} mobile={true} />
                </div>
              ))}
            </div>
          ) : (
            /* Desktop: 3 colunas inline */
            NAV_COLS.map(col => (
              <NavColumn key={col.heading} col={col} mobile={false} />
            ))
          )}
        </div>

        {/* ── BOTTOM BAR ───────────────────────────────────────────── */}
        <div style={{
          display: 'flex',
          flexDirection: mobile ? 'column' : 'row',
          alignItems: mobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: mobile ? 14 : 16,
          padding: mobile ? '20px 0 28px' : '22px 0 30px',
        }}>
          <div style={{
            fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
            letterSpacing: '.10em', color: 'var(--t4)',
            lineHeight: 1.6,
          }}>
            © {year} JURIR · INTELIGÊNCIA JURÍDICA QUÂNTICA
            {!mobile && ' · TODOS OS DIREITOS RESERVADOS'}
          </div>

          {/* Providers */}
          <div style={{
            display: 'flex', alignItems: 'center',
            flexWrap: 'wrap', gap: mobile ? 6 : 6,
          }}>
            <span style={{
              fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
              color: 'var(--t3)', letterSpacing: '.10em',
              marginRight: 6, textTransform: 'uppercase',
            }}>
              Powered by
            </span>
            {PROVIDERS.map((p, i) => (
              <div key={p.name} style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 10px',
                background: i === 0 ? 'rgba(0,242,254,0.04)' : 'transparent',
                border: i === 0 ? '1px solid rgba(0,242,254,0.10)' : 'none',
                borderRadius: 999,
              }}>
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: p.dot,
                  boxShadow: `0 0 6px ${p.dot}99`,
                  flexShrink: 0,
                }}/>
                <span style={{
                  fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)',
                  color: 'var(--t4)', letterSpacing: '.06em',
                }}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Linha de fundo */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0,242,254,0.14), transparent)',
      }}/>
    </footer>
  );
}
