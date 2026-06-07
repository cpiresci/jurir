path = 'src/components/Hero.jsx'
hero = open(path, encoding='utf-8').read()

# ── 1. CSS: hero-section volta a center, padding equilibrado ──────────────────
hero = hero.replace(
    "align-items: flex-start;",
    "align-items: center;"
)
hero = hero.replace(
    "padding: clamp(80px, 10vh, 100px) 48px clamp(40px, 6vh, 60px);",
    "padding: clamp(80px, 10vh, 100px) 48px 60px;"
)

# Adicionar classe hero-desktop-cards no CSS (entre hero-stats-grid e @media)
hero = hero.replace(
    "        .hero-stats-grid {\n          display: grid;\n          grid-template-columns: repeat(4, 1fr);\n        }",
    "        .hero-stats-grid {\n          display: grid;\n          grid-template-columns: repeat(4, 1fr);\n        }\n        .hero-desktop-cards {\n          display: flex;\n          justify-content: center;\n          gap: 16px;\n          margin-bottom: clamp(20px, 3vw, 32px);\n        }"
)

# No mobile ocultar hero-desktop-cards e mostrar hero-mobile-card
hero = hero.replace(
    "          .hero-stats-grid { grid-template-columns: repeat(2, 1fr); }",
    "          .hero-stats-grid { grid-template-columns: repeat(2, 1fr); }\n          .hero-desktop-cards { display: none !important; }"
)

# ── 2. Remover os floats absolutos de Score e LiveFeed ───────────────────────
# Score ring absoluto
old_score_float = """        {/* Score ring — desktop */}
        <div className="hero-float" style={{
          position:'absolute', top:'50%', left:'4%',
          transform:'translateY(-10%)',
          background:'var(--bg-card)', border:'1px solid var(--b-main)',
          borderRadius:'var(--r-lg)', padding:'22px 24px',
          boxShadow:'var(--shadow-float)',
          opacity:visible?1:0, transition:'opacity .7s .8s',
          pointerEvents:'none', flexDirection:'column', alignItems:'center', gap:10,
        }}>
          <ScoreRing size={110} score={87} visible={visible}/>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:2 }}>
            <span style={{ fontFamily:'var(--f-mono)',fontSize:'.54rem',color:'var(--t3)',letterSpacing:'.16em',textTransform:'uppercase' }}>JURIR SCORE</span>
            <span style={{ fontFamily:'var(--f-mono)',fontSize:'.5rem',color:'var(--jade2)',letterSpacing:'.1em' }}>FORTEMENTE FAVORÁVEL</span>
          </div>
        </div>

        {/* Live feed — desktop */}
        <div className="hero-float" style={{
          position:'absolute', top:'50%', right:'4%',
          transform:'translateY(20%)',
          background:'var(--bg-card)', border:'1px solid var(--b-main)',
          borderRadius:'var(--r-md)', padding:'16px 20px',
          boxShadow:'var(--shadow-float)',
          opacity:visible?1:0, transition:'opacity .7s 1.0s',
          pointerEvents:'none', minWidth:220,
          flexDirection:'column', gap:10,
        }}>
          <div style={{ fontFamily:'var(--f-mono)',fontSize:'.58rem',color:'var(--t3)',letterSpacing:'.18em',marginBottom:2 }}>TRIBUNAL AO VIVO</div>
          <LiveFeed visible={visible}/>
        </div>"""

hero = hero.replace(old_score_float, "")

# ── 3. Inserir hero-desktop-cards entre CTAs e mobile-card ───────────────────
old_mobile = """          {/* Mobile score + live card */}"""
new_desktop_cards = """          {/* Desktop: Score + LiveFeed em linha, abaixo dos CTAs */}
          <div className="hero-desktop-cards fade-up fade-up-3" style={{ opacity:visible?1:0 }}>
            <div style={{
              background:'var(--bg-card)', border:'1px solid var(--b-main)',
              borderRadius:'var(--r-lg)', padding:'18px 22px',
              boxShadow:'var(--shadow-float)',
              display:'flex', flexDirection:'column', alignItems:'center', gap:8,
            }}>
              <ScoreRing size={90} score={87} visible={visible}/>
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:2 }}>
                <span style={{ fontFamily:'var(--f-mono)',fontSize:'.52rem',color:'var(--t3)',letterSpacing:'.16em',textTransform:'uppercase' }}>JURIR SCORE</span>
                <span style={{ fontFamily:'var(--f-mono)',fontSize:'.48rem',color:'var(--jade2)',letterSpacing:'.1em' }}>FORTEMENTE FAVORÁVEL</span>
              </div>
            </div>
            <div style={{
              background:'var(--bg-card)', border:'1px solid var(--b-main)',
              borderRadius:'var(--r-md)', padding:'16px 20px',
              boxShadow:'var(--shadow-float)', minWidth:200,
              display:'flex', flexDirection:'column', gap:10, justifyContent:'center',
            }}>
              <div style={{ fontFamily:'var(--f-mono)',fontSize:'.56rem',color:'var(--t3)',letterSpacing:'.18em' }}>TRIBUNAL AO VIVO</div>
              <LiveFeed visible={visible}/>
            </div>
          </div>

          {/* Mobile score + live card */}"""

hero = hero.replace(old_mobile, new_desktop_cards)

open(path, 'w', encoding='utf-8').write(hero)

print("align-items center:", "align-items: center;" in hero)
print("hero-desktop-cards css:", "hero-desktop-cards" in hero)
print("floats absolutos removidos:", "top:'50%', left:'4%'" not in hero)
print("desktop cards inseridos:", "Desktop: Score + LiveFeed" in hero)
