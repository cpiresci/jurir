#!/bin/bash
# ============================================================
# JURIR — Aplica o patch de consolidação
# Rodar na RAIZ do repositório: bash apply.sh
# ============================================================
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(pwd)"

echo "📦 Aplicando patch Jurir..."
echo "   Fonte: $SCRIPT_DIR"
echo "   Destino: $REPO_DIR"
echo ""

# 1. Remover pasta legada
rm -rf "$REPO_DIR/jurir-upgraded"
rm -rf "$REPO_DIR/dist"
rm -f  "$REPO_DIR/src/pages/PrivacidadePage.jsx"
rm -f  "$REPO_DIR/src/pages/Privacidade.jsx"
echo "✅ Arquivos legados removidos"

# 2. Copiar src/
cp -r "$SCRIPT_DIR/src/"* "$REPO_DIR/src/"
echo "✅ src/ atualizado"

# 3. Copiar configs
cp "$SCRIPT_DIR/vite.config.js" "$REPO_DIR/vite.config.js"
cp "$SCRIPT_DIR/.github/workflows/deploy.yml" "$REPO_DIR/.github/workflows/deploy.yml"
echo "✅ vite.config.js e deploy.yml atualizados"

# 4. Atualizar .gitignore
cp "$SCRIPT_DIR/.gitignore" "$REPO_DIR/.gitignore"
echo "✅ .gitignore atualizado (dist/ ignorado)"

echo ""
echo "🎉 Patch aplicado! Agora:"
echo "   git add -A"
echo "   git commit -m 'fix: consolidar src/ canônico, corrigir deploy GH Pages, remover jurir-upgraded'"
echo "   git push"
