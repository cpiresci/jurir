import re

path = 'src/components/Hero.jsx'
hero = open(path, encoding='utf-8').read()

# 1. align-items: flex-start → center
hero = hero.replace(
    "align-items: flex-start;",
    "align-items: center;"
)

# 2. padding top exagerado → equilibrado
hero = hero.replace(
    "padding: clamp(100px, 13vh, 130px) 48px 80px;",
    "padding: clamp(80px, 10vh, 100px) 48px clamp(40px, 6vh, 60px);"
)

# 3. Score ring: bottom% → top:50% com translateY
hero = hero.replace(
    "position:'absolute', top:'clamp(260px, 34vh, 370px)', left:'4%',",
    "position:'absolute', top:'50%', left:'4%', transform:'translateY(-10%)',"
)

# 4. Live feed: bottom% → top:50% com translateY
hero = hero.replace(
    "position:'absolute', top:'clamp(300px, 40vh, 430px)', right:'4%',",
    "position:'absolute', top:'50%', right:'4%', transform:'translateY(20%)',"
)

open(path, 'w', encoding='utf-8').write(hero)

# Confirmar
print("align-items center:", "align-items: center;" in hero)
print("padding ok:", "clamp(80px, 10vh, 100px)" in hero)
print("score ring top:50%:", "top:'50%', left:'4%'" in hero)
print("live feed top:50%:", "top:'50%', right:'4%'" in hero)
