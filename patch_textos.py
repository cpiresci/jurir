import re

FILES = [
    'src/components/Footer.jsx',
    'src/components/AgentsSection.jsx',
    'src/components/Pricing.jsx',
    'src/pages/Home.jsx',
]

# Também atualizar as variáveis CSS root para deixar t4 e t5 mais escuros
CSS_PATH = 'src/index.css'

# ── 1. CSS: escurecer --t4 e --t5 ──────────────────────────────────────────
css = open(CSS_PATH, encoding='utf-8').read()

# t4 era #7E839A -> vai para #5C6272 (mais escuro)
css = css.replace("--t4: #7E839A;", "--t4: #5C6272;")
# t5 era #ACAFC2 -> vai para #7A7F96 (bem mais escuro)
css = css.replace("--t5: #ACAFC2;", "--t5: #7A7F96;")

open(CSS_PATH, 'w', encoding='utf-8').write(css)
print(f"✅ {CSS_PATH} — t4 e t5 escurecidos")

# ── 2. Footer: trocar t5 por t3 nos textos de conteúdo (não labels) ─────────
footer = open('src/components/Footer.jsx', encoding='utf-8').read()

# Textos de conteúdo que estavam em t5
footer = footer.replace(
    "fontSize:'.75rem', color:'var(--t5)', lineHeight:1.7",
    "fontSize:'.75rem', color:'var(--t2)', lineHeight:1.7"
)
footer = footer.replace(
    "marginTop:14, fontFamily:'var(--f-mono)', fontSize:'.58rem', color:'var(--t5)'",
    "marginTop:14, fontFamily:'var(--f-mono)', fontSize:'.58rem', color:'var(--t3)'"
)
footer = footer.replace(
    "fontFamily:'var(--f-display)', fontStyle:'italic',\n            fontSize:'.85rem', color:'var(--t5)'",
    "fontFamily:'var(--f-display)', fontStyle:'italic',\n            fontSize:'.85rem', color:'var(--t3)'"
)
# Desc das principles (era t5)
footer = footer.replace(
    "fontSize:'.6rem', color:'var(--t5)', letterSpacing:'.06em', lineHeight:1.5",
    "fontSize:'.6rem', color:'var(--t3)', letterSpacing:'.06em', lineHeight:1.5"
)
# Bottom bar copyright
footer = footer.replace(
    "fontSize:'.6rem', color:'var(--t5)', letterSpacing:'.1em' }}>\n            © {new Date().getFullYear()} JURIR · INTELIGÊNCIA",
    "fontSize:'.6rem', color:'var(--t3)', letterSpacing:'.1em' }}>\n            © {new Date().getFullYear()} JURIR · INTELIGÊNCIA"
)
# Provider logos
footer = footer.replace(
    "fontSize:'.55rem', color:'var(--t5)', letterSpacing:'.08em', opacity:0.7",
    "fontSize:'.55rem', color:'var(--t3)', letterSpacing:'.08em', opacity:0.9"
)

open('src/components/Footer.jsx', 'w', encoding='utf-8').write(footer)
print(f"✅ src/components/Footer.jsx — textos escurecidos")

print("TUDO OK")
