path = 'src/components/Hero.jsx'
hero = open(path, encoding='utf-8').read()

before = len(hero)

# Remove o bloco do Score ring absoluto + Live feed absoluto
# Busca pela abertura do Score ring float e remove até o Live feed fechar

import re

# Remove score ring absoluto
hero = re.sub(
    r"\s*\{/\* Score ring — desktop \*/\}.*?\{/\* Live feed — desktop \*/\}.*?</div>\n",
    "\n",
    hero,
    flags=re.DOTALL
)

after = len(hero)

open(path, 'w', encoding='utf-8').write(hero)

print("Removido:", before - after, "chars")
print("Floats absolutos restantes:", hero.count("top:'50%'"))
print("hero-desktop-cards ok:", "hero-desktop-cards" in hero)
print("hero-mobile-card ok:", "hero-mobile-card" in hero)
