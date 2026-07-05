#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/jurir

if [ ! -f index.html ]; then
  echo "ERRO: index.html não encontrado em $(pwd)"
  exit 1
fi

if grep -q "G-GF9BX76VFW" index.html; then
  echo "A tag do Google já está presente em index.html — nada a fazer."
  exit 0
fi

python3 - << 'PYEOF'
with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

tag = '''  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-GF9BX76VFW"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-GF9BX76VFW');
  </script>
'''

if "<head>" in content:
    content = content.replace("<head>", "<head>\n" + tag, 1)
else:
    raise SystemExit("ERRO: tag <head> não encontrada em index.html")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

print("Tag inserida com sucesso.")
PYEOF

git add index.html
git commit -m "chore: add Google Analytics (gtag.js) tracking tag"
git push origin main

echo "OK: tag do Analytics adicionada e enviada para o repositório."
