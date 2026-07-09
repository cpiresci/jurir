#!/usr/bin/env python3
"""
[fix-aab-commitado] Repo jurir (frontend): remove do tracking do git o(s)
artefato(s) de build Android (.aab/.apk) que entraram sem querer no commit
43ec82e via `git add -A`, e blinda o .gitignore pra não repetir.

Não reescreve histórico (o .aab já commitado continua no histórico antigo —
custo aceitável de ~2MB; reescrever historico é mais arriscado que vale a
pena aqui). Só corrige daqui pra frente: tira do tracking (git rm --cached,
o arquivo continua no disco) e garante *.aab/*.apk no .gitignore.

Idempotente: roda de novo sem problema se já tiver sido aplicado.

Uso (Termux):
  cd ~/jurir
  python3 cleanup_jurir_frontend_aab.py
  git add -A
  git commit -m "chore: remove artefato de build (.aab) do tracking, blinda gitignore"
  git push origin main
"""
import subprocess
import sys

def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True)

# 1) Blinda o .gitignore
GITIGNORE = ".gitignore"
needed = ["*.aab", "*.apk"]
with open(GITIGNORE, "r", encoding="utf-8") as f:
    content = f.read()

missing = [p for p in needed if p not in content.splitlines()]
if missing:
    with open(GITIGNORE, "a", encoding="utf-8") as f:
        f.write("\n# Artefatos de build Android (nunca versionar)\n")
        for p in missing:
            f.write(p + "\n")
    print(f"[OK] .gitignore atualizado com: {', '.join(missing)}")
else:
    print("[SKIP] .gitignore já cobre *.aab e *.apk.")

# 2) Tira do tracking qualquer .aab/.apk atualmente rastreado
tracked = sh("git ls-files").stdout.splitlines()
targets = [f for f in tracked if f.endswith(".aab") or f.endswith(".apk")]

if not targets:
    print("[SKIP] Nenhum .aab/.apk rastreado no momento — nada a remover do git.")
    sys.exit(0)

for f in targets:
    r = sh(f"git rm --cached -q '{f}'")
    if r.returncode == 0:
        print(f"[OK] Removido do tracking (mantido em disco): {f}")
    else:
        print(f"[ERRO] Falha ao remover {f} do tracking: {r.stderr.strip()}")

print("\nPronto. Revise com 'git status' e depois: git add -A && git commit && git push origin main")
