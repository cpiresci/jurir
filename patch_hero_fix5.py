path = 'src/components/Hero.jsx'
hero = open(path, encoding='utf-8').read()

# 1. Remover min-height 100dvh que cria área vazia
hero = hero.replace(
    "          min-height: 100dvh;\n          display: flex;\n          align-items: center;\n          justify-content: center;\n          padding: clamp(80px, 10vh, 100px) 48px 60px;",
    "          display: flex;\n          align-items: center;\n          justify-content: center;\n          padding: clamp(88px, 11vh, 110px) 48px 48px;"
)

# 2. Score e LiveFeed lado a lado com tamanho menor e compacto
hero = hero.replace(
    "              <ScoreRing size={90} score={87} visible={visible}/>",
    "              <ScoreRing size={76} score={87} visible={visible}/>"
)

open(path, 'w', encoding='utf-8').write(hero)

print("min-height removido:", "min-height: 100dvh" not in hero)
print("padding ok:", "clamp(88px, 11vh, 110px)" in hero)
print("score size 76:", "size={76}" in hero)
