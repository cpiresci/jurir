import re

CSS_PATH = 'src/index.css'
css = open(CSS_PATH, encoding='utf-8').read()

# Reverter t4 e t5 para os valores originais
css = css.replace("--t4: #5C6272;", "--t4: #7E839A;")
css = css.replace("--t5: #7A7F96;", "--t5: #ACAFC2;")

open(CSS_PATH, 'w', encoding='utf-8').write(css)
print(f"✅ {CSS_PATH} — t4 e t5 revertidos")

# Reverter Footer
footer = open('src/components/Footer.jsx', encoding='utf-8').read()

footer = footer.replace(
    "fontSize:'.75rem', color:'var(--t2)', lineHeight:1.7",
    "fontSize:'.75rem', color:'var(--t5)', lineHeight:1.7"
)
footer = footer.replace(
    "marginTop:14, fontFamily:'var(--f-mono)', fontSize:'.58rem', color:'var(--t3)'",
    "marginTop:14, fontFamily:'var(--f-mono)', fontSize:'.58rem', color:'var(--t5)'"
)
footer = footer.replace(
    "fontFamily:'var(--f-display)', fontStyle:'italic',\n            fontSize:'.85rem', color:'var(--t3)'",
    "fontFamily:'var(--f-display)', fontStyle:'italic',\n            fontSize:'.85rem', color:'var(--t5)'"
)
footer = footer.replace(
    "fontSize:'.6rem', color:'var(--t3)', letterSpacing:'.06em', lineHeight:1.5",
    "fontSize:'.6rem', color:'var(--t5)', letterSpacing:'.06em', lineHeight:1.5"
)
footer = footer.replace(
    "fontSize:'.55rem', color:'var(--t3)', letterSpacing:'.08em', opacity:0.9",
    "fontSize:'.55rem', color:'var(--t5)', letterSpacing:'.08em', opacity:0.7"
)

open('src/components/Footer.jsx', 'w', encoding='utf-8').write(footer)
print(f"✅ src/components/Footer.jsx — revertido")
print("TUDO OK")
