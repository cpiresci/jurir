path = 'src/components/Hero.jsx'
hero = open(path, encoding='utf-8').read()

# 1. flex-start para o texto subir ao topo, padding top respira da navbar
hero = hero.replace(
    "align-items: center;",
    "align-items: flex-start;"
)
hero = hero.replace(
    "padding: clamp(80px, 10vh, 100px) 48px clamp(40px, 6vh, 60px);",
    "padding: clamp(88px, 11vh, 110px) 48px 60px;"
)

# 2. Score ring — canto inferior esquerdo, alinhado com stats
hero = hero.replace(
    "position:'absolute', top:'50%', left:'4%', transform:'translateY(-10%)',",
    "position:'absolute', bottom:'clamp(120px, 14vh, 160px)', left:'2%',"
)

# 3. Live feed — canto inferior direito, alinhado com stats
hero = hero.replace(
    "position:'absolute', top:'50%', right:'4%', transform:'translateY(20%)',",
    "position:'absolute', bottom:'clamp(160px, 18vh, 210px)', right:'2%',"
)

open(path, 'w', encoding='utf-8').write(hero)

print("flex-start:", "align-items: flex-start;" in hero)
print("padding ok:", "clamp(88px, 11vh, 110px)" in hero)
print("score bottom:", "bottom:'clamp(120px, 14vh, 160px)', left:'2%'" in hero)
print("feed bottom:", "bottom:'clamp(160px, 18vh, 210px)', right:'2%'" in hero)
