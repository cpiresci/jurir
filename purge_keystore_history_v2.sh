#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "== instalando git-filter-repo =="
pip install --break-system-packages git-filter-repo

echo "== removendo TODOS os arquivos de keystore/base64 de TODO o historico =="
git filter-repo \
  --path jurir-release.keystore \
  --path jurir-release.keystore.b64 \
  --path keystore_novo.b64 \
  --invert-paths --force

echo "== restaurando o remote (git-filter-repo remove por seguranca) =="
git remote add origin https://github.com/cpiresci/jurir.git 2>/dev/null || git remote set-url origin https://github.com/cpiresci/jurir.git

echo "== enviando historico reescrito =="
git push origin main --force

echo "✅ historico purgado e enviado. Nenhuma keystore aparece mais em nenhum commit."
