# AUDITORIA MOBYA — 24/06/2026

## 🔴 CRÍTICOS (corrigir agora)

### 1. Leaflet carregado sem uso
`index.html` carrega Leaflet CSS + JS (linhas 15 e 180) mas nenhum arquivo JS
usa `L.` ou `leaflet`. O `ultra-gps.js` migrou para MapLibre. São 2 requests
desnecessários (~150 KB) em cada carregamento.
**Fix:** remover as 2 linhas do `index.html`.

### 2. SOS duplicado: `ultra-gps.js` + `sos-alarm.js`
`ultra-gps.js` tem sua própria implementação inline de alarme SOS
(`_startSosAlarm`, `#ultraSosOverlay`, `z-index:9999`). O `sos-alarm.js`
é o módulo oficial (sirene real, wake lock, vibração contínua, countdown,
`z-index:99999`). Os dois podem disparar simultaneamente.
**Fix:** `doSOS()` no `ultra-gps.js` deve chamar `window.SOSAlarm.show()`
ao invés de ter sua própria implementação.

### 3. `OFFER_TIMEOUT_MS` no Render ainda pode estar em 120000
A memória do projeto indica que o Render ainda tem `OFFER_TIMEOUT_MS=120000`
(2 minutos — valor de teste). Produção deve ser `15000`.
**Fix:** Render Dashboard → Environment → `OFFER_TIMEOUT_MS=15000` → Redeploy.

### 4. 22 páginas da sidebar sem handler no `BASE_PAGES`
O roteador `app.js` só tem `home`, `classificados`, `agentes`, `emergencia`,
`calculadoras`, `vistoria`, `documentacao`, `dashboard`, `chat`, `listing`,
`pecas`, `aluguel`, `reboque`, `chaveiro`, `seguros`, `financiamento` etc.
— mas o grep de `BASE_PAGES` mostra que vários desses (`aluguel`, `carteira`,
`garagem`, `monetizacao`, `painel-receita`, etc.) **não aparecem no objeto**,
apesar de estarem na sidebar. O roteador cai no `else` silencioso.
**Fix:** mapear todas as páginas para seus handlers (`Pages.*`, `PagesExtra.*`, etc).

---

## 🟡 IMPORTANTES

### 5. `API.rental` não existe no `api.js`
`rental-guest.js` e `rental-host.js` chamam `API.rental.myBookings()`,
`API.rental.confirmBooking()`, etc. O `api.js` não tem namespace `rental`.
As chamadas caem em `undefined is not a function` silenciosamente.
**Fix:** adicionar namespace `rental` no `api.js` com todos os endpoints.

### 6. `meus-anuncios` no `BASE_PAGES` mas não na sidebar
Rota órfã — nunca é navegada pelo usuário mas ocupa espaço no handler.
Não é crítico mas é ruído.

### 7. `notificacoes-page.js` e `notifications.js` sobrepostos
`notifications.js` → `window.Notif` (polling de notificações, drawer)
`notificacoes-page.js` → `window.NotificacoesPage` (página de listagem)
São dois módulos distintos e corretos. Sem conflito real — mas a página
`notificacoes` precisa aparecer no `BASE_PAGES` para ser navegável.

### 8. `sos-alarm.js` duplica lógica de audio do `ultra-gps.js`
Ver item 2. O `sos-alarm.js` é mais completo (wake lock, dois tons, vibração
contínua). O inline do `ultra-gps.js` é mais simples e conflita.

### 9. `consorcio`, `fretes`, `mecanico`, `painel-anfitriao`, `painel-prestador`
na sidebar mas sem handler — provavelmente `comingSoon()` ou redirecionam
para outra página. Precisa verificar se o roteador trata corretamente.

---

## 🟢 OK / BOM

- **Auth**: JWT + blacklist Redis + refresh token + rate limiter ✅
- **Dispatch**: cascata com fallback MySQL, lazy expiry, ranking por score ✅
- **Wallet**: transações atômicas com `$transaction`, clamp defensivo, ledger imutável ✅
- **Rental**: 14 endpoints completos (configs + bookings + webhooks MP + mock-pay) ✅
- **GPS**: MapLibre + OpenFreeMap, zero API key, turn-by-turn OSRM + Nominatim ✅
- **CORS**: lista de origens explícita, credenciais corretas ✅
- **Rate limiting**: global + authRateLimiter + aiRateLimiter, webhooks MP excluídos ✅
- **Password reset**: SHA-256 + nodemailer + expiração ✅
- **Wallet retention job**: `startWalletReleaseJob` chamado no boot ✅
- **MP webhook signature**: `verifyMpWebhookSignature` em todos os webhooks ✅
- **SOS Alarm**: `sos-alarm.js` completo com wake lock + sirene + vibração ✅
- **`OFFER_TIMEOUT_MS`**: fallback correto para `15000` no código ✅ (verificar Render)

---

## 📋 PLANO DE AÇÃO (prioridade)

| # | Item | Arquivo | Complexidade |
|---|------|---------|-------------|
| 1 | Remover Leaflet do index.html | index.html | Trivial |
| 2 | `doSOS()` usar `SOSAlarm.show()` | ultra-gps.js | Pequeno |
| 3 | `OFFER_TIMEOUT_MS=15000` no Render | Dashboard | Trivial |
| 4 | Adicionar `API.rental` namespace | api.js | Médio |
| 5 | Mapear todas as páginas no BASE_PAGES | app.js | Médio |
| 6 | Adicionar `notificacoes` ao BASE_PAGES | app.js | Trivial |
