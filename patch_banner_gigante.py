import re

# ══════════════════════════════════════════════
# 1. index.css — hero-title MEGA
# ══════════════════════════════════════════════
css = open('src/index.css', encoding='utf-8').read()

# Substituir o bloco .hero-title inteiro
css = re.sub(
    r'\.hero-title \{.*?\}',
    '''.hero-title {
  font-family: var(--f-display);
  font-size: clamp(3.6rem, 10vw, 9rem);
  font-weight: 300;
  line-height: 1.0;
  color: var(--t0);
  letter-spacing: -.04em;
}''',
    css,
    flags=re.DOTALL
)

# Garantir hero mobile no final (remove duplicatas primeiro)
css = re.sub(r'/\* ══ HERO (MOBILE|DESKTOP)[^*]*\*\/[\s\S]*?(?=\n\/\*|\Z)', '', css)
css = css.rstrip() + '''

/* ══ HERO MOBILE ══ */
@media (max-width: 900px) {
  .hero-title { font-size: clamp(2.8rem, 9vw, 5rem) !important; letter-spacing: -.02em; }
}
@media (max-width: 480px) {
  .hero-title { font-size: clamp(2.2rem, 8vw, 3.4rem) !important; }
}
'''

open('src/index.css', 'w', encoding='utf-8').write(css)

# Verificar
m = re.search(r'\.hero-title \{.*?\}', css, re.DOTALL)
print(f"✅ hero-title: {m.group()[:80].strip()}...")

# ══════════════════════════════════════════════
# 2. Hero.jsx — section altura + padding + inner
# ══════════════════════════════════════════════
hero = open('src/components/Hero.jsx', encoding='utf-8').read()

# minHeight — qualquer valor -> 100dvh
hero = re.sub(r"minHeight:\s*'100v[wh]'", "minHeight: '100dvh'", hero)

# padding da section — forçar valor largo no desktop
hero = re.sub(
    r"padding:\s*'[^']*',\s*paddingTop:\s*\d+,",
    "padding: '0 clamp(28px, 8vw, 120px)', paddingTop: 80,",
    hero
)

# maxWidth do inner content — forçar 1100
hero = re.sub(r"maxWidth:\s*\d+,\s*textAlign:\s*'center'", "maxWidth: 1100, textAlign: 'center'", hero)

# subline fontSize
hero = re.sub(
    r"fontSize:\s*'1\.08rem',\s*color:\s*'var\(--t2\)'",
    "fontSize: 'clamp(1.05rem, 1.9vw, 1.28rem)', color: 'var(--t2)'",
    hero
)

# stats maxWidth
hero = re.sub(r"maxWidth:\s*7[0-9]{2},\s*margin:\s*'0 auto'", "maxWidth: 860, margin: '0 auto'", hero)

open('src/components/Hero.jsx', 'w', encoding='utf-8').write(hero)

checks = [
    ("100dvh", "100dvh"),
    ("maxWidth: 1100", "1100"),
    ("1.28rem", "1.28rem"),
    ("maxWidth: 860", "860"),
]
for label, token in checks:
    found = token in hero
    print(f"{'✅' if found else '❌'} {label}")

print("\nTUDO OK")
