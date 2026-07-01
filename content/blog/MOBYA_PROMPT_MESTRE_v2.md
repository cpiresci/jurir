# 🏎️ MOBYA — PROMPT MESTRE v2 (25/06/2026)
**Repositórios:** `mobya-master` (frontend) · `mobya-app-main` (backend)

---

## DECISÕES DEFINITIVAS DESTA SESSÃO

| # | Item | Decisão |
|---|------|---------|
| 20 | "Seja um Parceiro" no sidebar | ✅ **MANTER FIXO** no `index.html` — entrada por convite é via fluxo interno, mas o link público permanece |
| DB | Banco de dados | ✅ **MySQL Hostinger via Prisma** — `DATABASE_URL` aponta para Hostinger, `relationMode = "prisma"` já está correto, problema é só a migration pendente no Render |

---

## STATUS DO BANCO DE DADOS (PROBLEMA CRÍTICO)

### Diagnóstico
O backend usa **Prisma + MySQL Hostinger** corretamente:
- `prisma/schema.prisma` → `provider = "mysql"` + `relationMode = "prisma"` ✅
- `src/config/database.js` → já loga `"MySQL Hostinger conectado ✅"` ✅
- `render.yaml` → `buildCommand` já inclui `npx prisma migrate deploy` ✅
- `DATABASE_URL` → configurada manualmente no dashboard Render (`sync: false`) ✅

### Problema Real
A migration mais recente **NÃO foi aplicada** no banco Hostinger de produção:

```
migrations/20260624_rental_checkin_renter_confirmation/migration.sql
```

Essa migration adiciona 5 colunas à tabela `rental_bookings`:
- `checkinInitiatedAt`
- `checkinPhotoUrl`
- `checkinLat` / `checkinLng`
- `renterCheckinConfirmedAt`

Sem ela, **qualquer query no model `RentalBooking` falha** com:
```
PrismaClientKnownRequestError: Unknown column 'renterCheckinConfirmedAt'
```

Isso derruba os itens 13 (Painel Anfitrião) e 14 (Minhas Reservas).

### Solução — Executar no Render Shell
```bash
# Opção 1 — Via Render Shell (recomendado):
npx prisma migrate deploy

# Opção 2 — Via Termux (se tiver .env local com DATABASE_URL da Hostinger):
cd ~/mobya-app
npx prisma migrate deploy

# Verificar se aplicou:
npx prisma migrate status
```

### ⚠️ NÃO É necessário trocar Prisma por outra coisa
O Prisma está correto. O Hostinger MySQL 8.0 é compatível com `relationMode = "prisma"`.
O único passo pendente é rodar `migrate deploy` para sincronizar o schema.

---

## PATCHES FRONTEND — ORDEM DE EXECUÇÃO

Execute em `~/mobya` (frontend):

```
Patch 1 — ultra-gps.js       → Corrige loop de zoom na aba Prestadores (item 16)
Patch 2 — chat.js             → Auto-navega para GPS após dispatch confirmado (item 9a)
Patch 3 — home-chat.js        → Idem para o chat da home (item 9b)
Patch 4 — rental-host.js      → Resiliência: retry button no catch (item 13)
Patch 5 — rental-guest.js     → Resiliência: retry button no catch (item 14)
Patch 6 — monetization.js     → Remove exibição de taxa pública nos cards (item 21)
Patch 7 — app.js              → Adiciona rota 'comprar-carro' → classificados (item 1)
```

**item 20 ("Seja um Parceiro") → CANCELADO. Manter o item no sidebar.**

---

## SCRIPT DE PATCHES PYTHON

Cole e execute no Termux:

```bash
cat > $TMPDIR/p.py << 'PYEOF'
# MOBYA Frontend Patches v2 — 25/06/2026
import re, os, sys

BASE = os.path.expanduser('~/mobya/js')
HTML = os.path.expanduser('~/mobya/index.html')

def patch(label, path, old, new):
    try:
        txt = open(path, encoding='utf-8').read()
        if old not in txt:
            print(f'[SKIP] {label} — string não encontrada')
            return
        if new in txt:
            print(f'[SKIP] {label} — já aplicado')
            return
        open(path,'w',encoding='utf-8').write(txt.replace(old,new,1))
        print(f'[OK]   {label}')
    except Exception as e:
        print(f'[ERRO] {label}: {e}')

# ── PATCH 1a — ultra-gps.js: declarar _suppressMoveRefresh ──────────────────
patch(
    'GPS: declarar _suppressMoveRefresh',
    f'{BASE}/ultra-gps.js',
    'let _pendingPos=null;',
    'let _pendingPos=null;\n  let _suppressMoveRefresh=false;'
)

# ── PATCH 1b — ultra-gps.js: _scheduleNearbyRefresh com debounce 3s + guard ─
patch(
    'GPS: _scheduleNearbyRefresh debounce 3s + suppress flag',
    f'{BASE}/ultra-gps.js',
    'function _scheduleNearbyRefresh(){ if(mode!==\'discover\')return; clearTimeout(_nearbyDebounce); _nearbyDebounce=setTimeout(()=>_loadNearbyReal(50),600); }',
    'function _scheduleNearbyRefresh(){ if(mode!==\'discover\'||_suppressMoveRefresh)return; clearTimeout(_nearbyDebounce); _nearbyDebounce=setTimeout(()=>_loadNearbyReal(50),3000); }'
)

# ── PATCH 1c — ultra-gps.js: watchPosition só faz easeTo em modo tracking ───
patch(
    'GPS: easeTo somente em modo tracking',
    f'{BASE}/ultra-gps.js',
    "if(myRole){ updateMarker(myRole,lat,lng,'Você'); } else { _pendingPos={lat,lng}; map&&map.easeTo({center:[lng,lat],zoom:16,duration:400}); }",
    "if(myRole){ updateMarker(myRole,lat,lng,'Você'); } else { _pendingPos={lat,lng}; if(mode==='tracking') map&&map.easeTo({center:[lng,lat],zoom:16,duration:400}); }"
)

# ── PATCH 2 — chat.js: auto-navegar GPS 1.8s após EMERGENCY_CREATED ─────────
patch(
    'chat.js: auto-navigate GPS após EMERGENCY_CREATED',
    f'{BASE}/chat.js',
    "window.__mobyaPendingEmergencyId = action.emergencyId || null;\n      html = `\n        <div class=\"action-card action-card--ok\">\n          <div class=\"action-card-icon\">✅</div>\n          <div class=\"action-card-body\">\n            <strong>Emergência registrada</strong>\n            <p>Buscando o prestador mais próximo automaticamente...</p>\n          </div>\n          <button class=\"action-card-btn\" onclick=\"App.navigate('ultra-gps')\">Acompanhar</button>\n        </div>`;",
    "window.__mobyaPendingEmergencyId = action.emergencyId || null;\n      setTimeout(() => App.navigate('ultra-gps'), 1800);\n      html = `\n        <div class=\"action-card action-card--ok\">\n          <div class=\"action-card-icon\">✅</div>\n          <div class=\"action-card-body\">\n            <strong>Emergência registrada</strong>\n            <p>Buscando o prestador mais próximo automaticamente...</p>\n          </div>\n          <button class=\"action-card-btn\" onclick=\"App.navigate('ultra-gps')\">Acompanhar</button>\n        </div>`;"
)

# ── PATCH 3 — home-chat.js: auto-navegar GPS + set emergencyId ───────────────
patch(
    'home-chat.js: auto-navigate GPS após EMERGENCY_CREATED',
    f'{BASE}/home-chat.js',
    "if (action.type === 'EMERGENCY_CREATED') {\n      html = `\n        <div class=\"action-card action-card--ok\">\n          <div class=\"action-card-icon\">✅</div>\n          <div class=\"action-card-body\">\n            <strong>Emergencia registrada</strong>\n            <p>Buscando o prestador mais proximo automaticamente...</p>\n          </div>\n          <button class=\"action-card-btn\" onclick=\"App.navigate('ultra-gps')\">Acompanhar</button>\n        </div>`;",
    "if (action.type === 'EMERGENCY_CREATED') {\n      window.__mobyaPendingEmergencyId = action.emergencyId || null;\n      setTimeout(() => App.navigate('ultra-gps'), 1800);\n      html = `\n        <div class=\"action-card action-card--ok\">\n          <div class=\"action-card-icon\">✅</div>\n          <div class=\"action-card-body\">\n            <strong>Emergencia registrada</strong>\n            <p>Buscando o prestador mais proximo automaticamente...</p>\n          </div>\n          <button class=\"action-card-btn\" onclick=\"App.navigate('ultra-gps')\">Acompanhar</button>\n        </div>`;"
)

# ── PATCH 4 — rental-host.js: catch com retry button melhorado ──────────────
# O setError já existe e já tem retry — apenas confirmar que a função é chamada.
# O catch na linha 117 já usa setError('rh-content', ...) — está OK.
print('[SKIP] rental-host.js: catch/retry já implementado via setError()')

# ── PATCH 5 — rental-guest.js: catch com retry melhorado ────────────────────
print('[SKIP] rental-guest.js: catch/retry já implementado com RentalGuest.render()')

# ── PATCH 6 — monetization.js: remover taxa pública dos cards ───────────────
patch(
    'monetization.js: remover "Comissão MOBYA: ${v.rate}" do card público',
    f'{BASE}/monetization.js',
    '''            <div style="display:inline-block;font-family:'JetBrains Mono',monospace;font-size:.65rem;
              padding:3px 10px;border-radius:4px;background:rgba(0,0,0,.3);color:${v.color};border:1px solid ${v.border}">
              Comissão MOBYA: ${v.rate}
            </div>''',
    '''            <div style="display:inline-block;font-family:'Space Grotesk',sans-serif;font-size:.65rem;
              padding:3px 10px;border-radius:4px;background:rgba(0,0,0,.3);color:var(--green);border:1px solid rgba(0,255,136,.25)">
              ✅ Parceiro Verificado · Sem taxa extra
            </div>'''
)

# ── PATCH 7 — app.js: adicionar rota comprar-carro ──────────────────────────
patch(
    'app.js: adicionar rota comprar-carro → classificados',
    f'{BASE}/app.js',
    "  classificados: () => Pages.renderClassificados(),",
    "  classificados: () => Pages.renderClassificados(),\n  'comprar-carro': () => Pages.renderClassificados(),"
)

print('\n✅ Patches concluídos.')
PYEOF
python3 $TMPDIR/p.py
```

---

## CHECKLIST PÓS-PATCH

```
BACKEND (Render / Termux):
□ npx prisma migrate deploy  →  "All migrations have been applied"
□ npx prisma migrate status  →  nenhuma migration pendente

FRONTEND (após git push):
□ GPS aba Prestadores: parou de fazer loop de zoom?
□ Chat/HomeChat: acionar reboque → GPS abre automaticamente após 1.8s?
□ Painel Anfitrião → Reservas: carrega sem erro 500?
□ Minhas Reservas: carrega sem erro 500?
□ Cards de parceiro em /monetizacao: NÃO mostra "Comissão MOBYA: X%"?
□ Sidebar: "Seja um Parceiro" ainda aparece? ✅ (deve aparecer)
□ Rota /comprar-carro: navega para classificados?
```

---

## NOTAS CRÍTICAS

- **NÃO alterar** nenhuma rota de backend de reservas — o código está correto.
- **NÃO remover** taxas do painel financeiro do prestador (`pages-monetize.js`) — é legítimo.
- **NÃO adicionar GPS ao frete** — cotação por formulário é o comportamento correto.
- **`relationMode = "prisma"`** é obrigatório no Hostinger (MySQL sem foreign keys nativas via InnoDB gerenciados pelo Prisma) — não remover.
- A `DATABASE_URL` deve sempre apontar para o Hostinger MySQL, nunca para um banco local ou SQLite.
