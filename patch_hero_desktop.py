import re

CSS_PATH = 'src/index.css'
css = open(CSS_PATH, encoding='utf-8').read()

# ── 1. hero-title: máximo 7.5rem no desktop (era 4.8rem) ──────────────────
css = re.sub(
    r'(\.hero-title \{[^}]*font-size:\s*)clamp\([^)]+\)',
    r'\1clamp(2.8rem, 8vw, 7.5rem)',
    css
)

# ── 2. Adicionar/atualizar media queries hero no final ─────────────────────
# Remove patches mobile antigos para não duplicar
css = re.sub(r'/\* ══ HERO MOBILE ══ \*/[\s\S]*?(?=\n\n|\Z)', '', css)

css = css.rstrip() + '''

/* ══ HERO DESKTOP ULTRA ══ */
.hero-section {
  min-height: 100dvh !important;
}

/* ══ HERO MOBILE ══ */
@media (max-width: 768px) {
  .hero-title { font-size: clamp(2.6rem, 10vw, 4rem) !important; }
  .hero-badge { font-size: .62rem !important; padding: 6px 14px !important; flex-wrap: wrap; justify-content: center; }
}
@media (max-width: 420px) {
  .hero-title { font-size: clamp(2.1rem, 9vw, 3rem) !important; }
}
'''

open(CSS_PATH, 'w', encoding='utf-8').write(css)
print(f"✅ {CSS_PATH} — hero-title desktop: até 7.5rem")

# ── 3. Hero.jsx: section minHeight + inner maxWidth maior ─────────────────
hero = open('src/components/Hero.jsx', encoding='utf-8').read()

# minHeight 100vh -> 100dvh
hero = hero.replace("minHeight: '100vh',", "minHeight: '100dvh',")

# padding da section: mais generoso no desktop
hero = hero.replace(
    "padding: '0 28px', paddingTop: 72,",
    "padding: '0 clamp(28px, 6vw, 80px)', paddingTop: 80,"
)

# maxWidth do inner: 920 -> 1080
hero = hero.replace("maxWidth:920,", "maxWidth:1080,")
hero = hero.replace("maxWidth: 920,", "maxWidth: 1080,")

# subline maior no desktop
hero = hero.replace(
    "fontSize:'1.08rem', color:'var(--t2)',",
    "fontSize:'clamp(1rem, 1.8vw, 1.22rem)', color:'var(--t2)',"
)

# Stats maxWidth maior
hero = hero.replace("maxWidth:740, margin:'0 auto',", "maxWidth:820, margin:'0 auto',")
hero = hero.replace("maxWidth: 740, margin:'0 auto',", "maxWidth: 820, margin:'0 auto',")

open('src/components/Hero.jsx', 'w', encoding='utf-8').write(hero)
print(f"✅ src/components/Hero.jsx — section 100dvh, maxWidth 1080, subline maior")

print("TUDO OK")
