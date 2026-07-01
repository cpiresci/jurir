# MOBYA — Auditoria Completa dos Repositórios
**Data:** 2026-06-24  
**Repositórios analisados:** `mobya-app-main` (backend) · `mobya-master` (frontend)

---

## 🔴 CRÍTICO — Bugs que quebram funcionalidades ao vivo

### [C1] Frontend — `garagem` e `ultra-gps` sem rota no `app.js`
**Arquivo:** `js/app.js` → `BASE_PAGES`

O sidebar tem dois itens com `data-page="garagem"` e `data-page="ultra-gps"`. Nenhum dos dois está registrado em `BASE_PAGES`. Ao clicar, o código cai no `else` do `renderPage()` e exibe `comingSoon()` — mesmo com `garagem.js` e `ultra-gps.js` carregados e funcionais.

`window.Garagem` e `window.UltraGPS` existem e têm método `render()`. Bastam dois registros:

```js
// adicionar em BASE_PAGES:
garagem:    () => (typeof Garagem   !== 'undefined' ? Garagem.render()   : comingSoon('MINHA GARAGEM','🚗')),
'ultra-gps':() => (typeof UltraGPS !== 'undefined' ? UltraGPS.render()  : comingSoon('ULTRA GPS','🛣️')),
```

---

### [C2] Frontend — `monetizacao` e `painel-receita` sem rota no `app.js`
**Arquivo:** `js/app.js` → `BASE_PAGES`

O sidebar tem:
- `data-page="monetizacao"` → "🤝 Seja um Parceiro"
- `data-page="painel-receita"` → "📊 Painel de Receita" (visível para admin)

Nenhum registrado em `BASE_PAGES`. Cliques resultam em `comingSoon()`.  
`Monetization` (de `monetization.js`) provavelmente tem um método de cadastro de parceiro. Verificar e registrar.

---

### [C3] Frontend — Scripts críticos carregam **depois** do `app.js`
**Arquivo:** `index.html` linhas 188–194

`app.js` é carregado na linha 188. Os scripts abaixo são carregados **após** ele:

```
rental-host.js       → RentalHost
rental-guest.js      → RentalGuest
wallet-page.js       → WalletPage
notifications.js     → (sistema de notificações)
notificacoes-page.js → NotificacoesPage
```

`app.js` referencia `typeof RentalHost`, `typeof RentalGuest`, `typeof WalletPage`, `typeof NotificacoesPage` em `BASE_PAGES`. Na prática o guard `typeof X !== 'undefined'` salva a inicialização, mas **se o usuário navegar para essas páginas via hash na URL diretamente** (ex.: `#minhas-reservas` no carregamento inicial), `App.init()` chama `navigate(initial)` antes dos scripts abaixo do `app.js` serem avaliados — resultando em `comingSoon()`.

**Solução:** mover `app.js` para o final da lista de scripts, após `notificacoes-page.js`.

---

### [C4] Backend — `render.yaml` com variáveis SMTP obsoletas
**Arquivo:** `render.yaml`

`mailer.js` foi migrado de SMTP → Resend HTTP (porta 587 bloqueada no Render free). Porém o `render.yaml` ainda declara:

```yaml
- key: SMTP_HOST
  value: smtp.hostinger.com
- key: SMTP_PORT
  value: "587"
- key: SMTP_SECURE
  value: "false"
- key: SMTP_USER
  sync: false
- key: SMTP_PASS
  sync: false
```

Essas variáveis não são usadas por nenhum arquivo do código atual. A variável **`RESEND_API_KEY`** (obrigatória para envio de email de reset de senha) **não está no `render.yaml`**, só no `.env.example`. Se `RESEND_API_KEY` não for configurada manualmente no dashboard, emails de reset silenciosamente não são enviados.

**Ação:** remover SMTP_* do `render.yaml`, adicionar `RESEND_API_KEY: sync: false`.

---

### [C5] Backend — `MP_WEBHOOK_SECRET` vazio aceita qualquer webhook
**Arquivo:** `src/services/monetization/mp-signature.service.js` linha 35

```js
if (!secret) return true;  // ← bypass de segurança intencional para dev
```

O `.env.example` documenta que isso é obrigatório. O `render.yaml` declara a chave como `sync: false` (exige configuração manual). Se o operador não preencher `MP_WEBHOOK_SECRET` no dashboard do Render, **qualquer chamada HTTP forjada para os endpoints `/mp-webhook` e `/webhook/*` será aceita sem validação**, podendo creditar comissões falsas.

**Ação:** confirmar que `MP_WEBHOOK_SECRET` está preenchido no Render. Considerar falhar com `500` em produção se estiver ausente.

---

## 🟠 ALTO — Problemas de consistência e débito técnico

### [A1] Backend — 9 arquivos `patch_*.py` na raiz do repositório
**Arquivos:** `patch_add_rental_checkin_renter_confirmation.py`, `patch_fix_wallet_race_condition.py`, etc.

Todos os patches já foram aplicados (o código atual reflete as correções). Esses arquivos são artefatos de desenvolvimento que não pertencem ao repositório de produção. Não são executados pelo `buildCommand` nem referenciados por nada.

**Ação:** mover para uma pasta `scripts/patches/` ou deletar com `git rm patch_*.py`.

---

### [A2] Backend — `render.yaml` com `BACKEND_URL` e `APP_URL` duplicados com URLs diferentes

```yaml
- key: BACKEND_URL
  value: https://mobya-app.onrender.com   # ← mobya-app
- key: APP_URL
  value: https://mobya-app.onrender.com   # ← mobya-app (certo)
```

O `.env.example` usa `APP_URL=https://mobya.onrender.com` (sem `-app`). Verificar qual é a URL real do serviço no Render e garantir consistência. `BACKEND_URL` não é referenciado no código — pode ser removido.

---

### [A3] Backend — `wallet.routes.js` mutex não protege múltiplos workers

**Arquivo:** `src/jobs/wallet-release.job.js`

O comentário já documenta: `_jobRunning` é flag em memória, sem proteção entre processos distintos. No Render free-tier há um único worker, então funciona. Mas se o plano for escalado (ou em staging com 2 workers), dois jobs podem rodar simultaneamente causando dupla liberação de saldo.

**Ação futura:** substituir por `Redis SETNX` com TTL ao migrar para plano pago.

---

### [A4] Schema — `MonetizationQuote` sem FK para `User` e `Provider`
**Arquivo:** `prisma/schema.prisma`

```prisma
model MonetizationQuote {
  userId     String   // sem @relation
  providerId String?  // sem @relation
```

`userId` e `providerId` são strings sem relações Prisma declaradas. Queries JOIN não funcionam via Prisma ORM (só via `$queryRaw`). Não há indexes compostos para buscas frequentes como "quotes abertas de um usuário por vertical".

---

### [A5] Schema — `WalletTransaction.type` como `String` sem enum
**Arquivo:** `prisma/schema.prisma`

```prisma
type  String  @db.VarChar(30)  // deveria ser enum
```

Valores como `CREDIT_EMERGENCY`, `DEBIT_WITHDRAWAL`, `CREDIT_RENTAL`, etc. são strings livres. A migração `20260624_fix_wallet_transactions_type_enum` existe, mas o campo no schema continua como `String`. Inconsistência entre migration SQL e schema Prisma.

---

### [A6] Frontend — `ultra-gps.js` usa `window.MOBYA?.API || 'https://mobya.onrender.com'`
**Arquivo:** `js/ultra-gps.js` linha 14

A URL de fallback hardcoded é `mobya.onrender.com` (sem `-app`). A URL real do backend é `mobya-app.onrender.com` (conforme `render.yaml` e `index.html`). Se `window.MOBYA` não estiver inicializado antes do script (pouco provável mas possível), as chamadas de rastreamento falham silenciosamente.

---

## 🟡 MÉDIO — Qualidade e completude

### [M1] Backend — Nenhuma rota de pesquisa de veículos pública
**Arquivo:** `src/routes/vehicle.routes.js`

Todas as rotas requerem `authenticate`. Não há endpoint público `GET /vehicles/search` para listar veículos disponíveis para mecânicos/prestadores verem. O endpoint de listings resolve parcialmente isso mas não é o mesmo recurso.

---

### [M2] Backend — `emergency.routes.js` sem `PATCH /emergency/:id/location`
**Arquivo:** `src/routes/emergency.routes.js`

O `dispatch.service.js` contém toda a lógica de localização do prestador e armazenamento MySQL-first. Porém o endpoint `PATCH /api/v1/emergency/:id/provider-location` (citado nas memórias como fix para prestadores atualizarem lat/lng) não foi encontrado nas rotas de emergência.

Verificar se está em `tracking.routes.js` ou se de fato está faltando.

---

### [M3] Frontend — Inconsistência de versão nos query params dos scripts
**Arquivo:** `index.html`

`ultra-gps.js` usa `?v=1782185647` (timestamp Unix) enquanto todos os outros usam `?v=YYYYMMDD[letra]`. Não causa bug mas indica que a versão foi atualizada de forma diferente.

---

### [M4] Backend — `ANTHROPIC_MODEL` desatualizado no `.env.example`
**Arquivo:** `.env.example`

```
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

O modelo atual é `claude-sonnet-4-6`. O `.env.example` serve de referência para quem configurar um novo ambiente.

---

### [M5] Frontend — `rental-guest.js` e `rental-host.js` sem fallback de API de veículo
Verificar se `RentalGuest.render()` e `RentalHost.render()` lidam corretamente com o caso onde o usuário ainda não tem listings ativos (array vazio vs erro).

---

## 🟢 POSITIVO — O que está bem implementado

| Área | Status |
|---|---|
| Race condition de saque (`$transaction` + `notIn`) | ✅ Corrigido |
| Race condition de checkin de aluguel (duas etapas host+renter) | ✅ Corrigido |
| Mutex do wallet release job (`_jobRunning`) | ✅ Implementado |
| Dispatch state MySQL-first (Redis opcional) | ✅ Implementado |
| Skip de rate limit para webhooks MP | ✅ Implementado |
| NEXUS AI determinístico (`detectIntent` em `chatActions.js`) | ✅ Funcional |
| Schema `Emergency.dispatchState Json?` | ✅ Migrado |
| Check-in em duas etapas (`checkinInitiatedAt` + `renterCheckinConfirmedAt`) | ✅ Migrado |
| `render.yaml` com `healthCheckPath` | ✅ Configurado |
| `WalletTransaction` com snapshot de saldo (`balanceBefore/After`) | ✅ Auditável |
| Frontend sem Mapbox token hardcoded | ✅ MapLibre (zero API key) |
| CORS com lista de origens explícita | ✅ Seguro |
| Helmet com CSP desativado (necessário para SPA) | ✅ OK |
| `trust proxy 1` para Render | ✅ Correto |

---

## 📋 Plano de Ação Priorizado

| # | Prioridade | Ação | Arquivo |
|---|---|---|---|
| 1 | 🔴 Crítico | Adicionar `garagem` e `ultra-gps` em `BASE_PAGES` | `js/app.js` |
| 2 | 🔴 Crítico | Mover `app.js` para depois de todos os outros scripts | `index.html` |
| 3 | 🔴 Crítico | Adicionar `RESEND_API_KEY` no `render.yaml`; remover SMTP_* | `render.yaml` |
| 4 | 🔴 Crítico | Confirmar `MP_WEBHOOK_SECRET` preenchido no dashboard Render | Render dashboard |
| 5 | 🟠 Alto | Adicionar `monetizacao` e `painel-receita` em `BASE_PAGES` | `js/app.js` |
| 6 | 🟠 Alto | Limpar `patch_*.py` da raiz | `mobya-app-main/` |
| 7 | 🟠 Alto | Unificar `APP_URL`/`BACKEND_URL` no `render.yaml` | `render.yaml` |
| 8 | 🟡 Médio | Verificar/criar `PATCH /emergency/:id/provider-location` | `emergency.routes.js` |
| 9 | 🟡 Médio | Declarar FK + @relation em `MonetizationQuote` | `schema.prisma` |
| 10 | 🟡 Médio | Atualizar `ANTHROPIC_MODEL` no `.env.example` | `.env.example` |
