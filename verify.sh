#!/data/data/com.termux/files/usr/bin/bash
set -e
cd ~/jurir

# Copia o arquivo baixado do Google para a pasta public/
cp /storage/emulated/0/Download/google43c98312da322a63\ \(1\).html public/google43c98312da322a63.html

git add public/google43c98312da322a63.html
git commit -m "chore: add Google Search Console verification file"
git push origin main

echo "OK: sera servido em https://jurir.com/google43c98312da322a63.html"
