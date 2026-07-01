# MOBYA — Auditoria Completa dos Repositórios
**Data:** 26/06/2026  
**Repos auditados:** `mobya-main` (frontend SPA) · `mobya-app-main` (backend Node.js/Express/Prisma)

---

## RESUMO EXECUTIVO

| Severidade | Qtd |
|---|---|
| 🔴 CRÍTICO | 3 |
| 🟠 ALTO | 5 |
| 🟡 MÉDIO | 6 |
| 🟢 BAIXO / MELHORIA | 7 |

---

## 🔴 CRÍTICOS

### C1 — XSS em `_carCardReal()` (pages-extra.js)
**Arquivo:** `js/pages-extra.js` — função `_carCardReal()`

`nomeVeiculo`, `pickup` e `cidade` são interpolados direto no template string sem escape e inseridos via `innerHTML`. Se um anúncio tiver `title`, `city`, `state` ou `pickupAddress` com payload JS (`"><img src=x onerror=alert(1)>`), executa script no contexto do usuário.

```js
// Linha ~304 — sem escape
<div class="px-car-name">${nomeVeiculo}</div>
<div class="px-car-meta">📍 ${pickup}</div>
```

**Fix:** criar helper `esc(t) = String(t||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')` e aplicar em `nomeVeiculo`, `pickup`, `cidade`, `badge` e `thumb` (src/alt).

---

### C2 — `cotarFrete()` é um stub completamente fake (pages-extra.js)
**Arquivo:** `js/pages-extra.js` — `cotarFrete()`

O botão "Solicitar Cotação" na tela de Fretes **nunca chama a API real**. Exibe um `Toast.show('✅ 8 transportadoras encontradas!', 'ok')` hardcoded após 1.4s. O backend tem `POST /monetization/logistics/quote` funcional e retorna providers, custo e tempo estimado — mas o frontend nunca conecta.

```js
// Atual — completamente fake
cotarFrete() {
  // ...
  setTimeout(() => { Toast.show('✅ 8 transportadoras encontradas!', 'ok'); }, 1400);
},
```

**Fix:** substituir por `await API.monetization.quoteLogistics({ type: t, originCity: o, destinationCity: d })` e renderizar o resultado real.

---

### C3 — `app.js` é carregado DEPOIS dos módulos que dependem dele (index.html)
**Arquivo:** `index.html` — ordem dos `<script>`

`app.js` (que define `window.App`, `window.Toast`, `window.renderPage`) está na linha 197, **depois** de `rental-host.js` (193), `rental-guest.js` (194), `wallet-page.js` (192), etc. Esses módulos usam `App.toast()`, `App.navigate()` e `Toast.show()` internamente. Em builds lentos ou cache parcial qualquer ordem de execução alternativa pode gerar `TypeError: App is not defined` em runtime.

**Fix:** mover `app.js` para ser o **primeiro** script carregado (antes de todos os módulos), ou converter para ES modules com `import`.

---

## 🟠 ALTOS

### A1 — Chat.js não exibe histórico de conversas persistido
**Arquivo:** `js/chat.js`

O backend tem `GET /ai/conversations` e `GET /ai/conversations/:id` (paginados, com prévia da última mensagem). O frontend **ignora completamente** esses endpoints. O `conversationId` é mantido só em memória — ao trocar de agente ou recarregar a página, `conversationId = null` e o histórico é perdido da UI (apesar de estar salvo no MySQL). Não há botão de "histórico de conversas" em nenhum lugar do SPA.

**Fix:** adicionar aba/botão "Histórico" no `chat.js` que chama `API.ai` com os endpoints de conversas faltantes (precisam ser adicionados em `api.js` primeiro):
```js
// api.js — adicionar em const ai = { ... }
conversations: (p={}) => get(`/ai/conversations?${new URLSearchParams(p)}`),
getConversation: (id) => get(`/ai/conversations/${id}`),
deleteConversation: (id) => del(`/ai/conversations/${id}`),
```

---

### A2 — Garagem não tem atalho para cadastrar veículo como aluguel
**Arquivo:** `js/garagem.js` / `js/pages-garagem.js`

O fluxo esperado é: usuário vai em Garagem → clica em um veículo → configura como disponível para aluguel via `POST /rental/configs`. Nenhum dos dois arquivos de garagem tem botão, link ou chamada para o fluxo de rental config. O host precisa saber de alguma forma que deve ir em "Painel Anfitrião" para ativar o aluguel, o que não está indicado em nenhum lugar.

**Fix:** no card de veículo da garagem, adicionar botão "🗝️ Disponibilizar para Aluguel" que navega para `painel-anfitriao` ou abre modal de `POST /rental/configs`.

---

### A3 — `_loadBookings()` no `rental-host.js` acessa `r?.data?.bookings || r?.data`
**Arquivo:** `js/rental-host.js` — linha `_loadBookings`

O backend retorna `R.paginated(res, bookings, ...)` que produz `{ success: true, data: [...], pagination: {...} }`. O código tenta `r?.data?.bookings` primeiro — que é `undefined` porque `data` é o array direto, não um objeto com chave `bookings`. O fallback `r?.data` funciona, mas se a paginação mudar de estrutura vai quebrar silenciosamente. O `rental-guest.js` tem o mesmo padrão inconsistente.

**Fix:** padronizar para `r?.data || []` diretamente, removendo a tentativa de `r?.data?.bookings`.

---

### A4 — `pay()` no `rental-guest.js` usa `API.req('POST', ...)` em vez de `API.rental.payBooking()`
**Arquivo:** `js/rental-guest.js` — função `pay(bookingId)`

```js
// Atual — contorna o wrapper tipado
const r = await API.req('POST', `/rental/bookings/${bookingId}/pay`);
```

Deveria usar `API.rental.payBooking(id)` que já está definido em `api.js`. O wrapper direto não tem handling de 401 padronizado do `API.req` refatorado (o compat layer trata, mas é frágil).

**Fix:** substituir por `const r = await API.rental.payBooking(bookingId)`.

---

### A5 — `updateSidebarRoles` está em `admin-approval.js` — race condition se não carregar
**Arquivo:** `js/admin-approval.js` linha 1 / `js/auth.js` linha 57

`MobyaAuth.updateUI()` chama `updateSidebarRoles(u)` com guard `typeof === 'function'`. Se `admin-approval.js` não carregar (erro de rede, 404), a sidebar nunca mostra os itens de role (Painel Prestador, Carteira, Aprovar, Receita) para nenhum usuário. Isso é um ponto único de falha para toda a navegação role-based.

**Fix:** mover `updateSidebarRoles` para `pages.js` ou `app.js`, que são carregados antes de admin-approval.js e são fundamentais para o SPA funcionar.

---

## 🟡 MÉDIOS

### M1 — Drivers de reboque/mecânico na UI são hardcoded (fake)
**Arquivo:** `js/pages-extra.js` — `_driverCards()`, seção mecânico

Cards de "João Silva 1,2km · 8min" e similares são strings literais hardcoded. O backend tem `GET /emergency/nearby` e `GET /monetization/providers/nearby` que retornam prestadores reais. A UI deveria chamar esses endpoints para mostrar disponibilidade real.

---

### M2 — `sbCarteira` não existe no HTML mas `updateSidebarRoles` tenta controlá-lo
**Arquivo:** `js/admin-approval.js` linha ~9 / `index.html`

```js
const sbC = document.getElementById('sbCarteira');
if (sbC) sbC.style.display = isMechanic ? '' : 'none';
```

`id="sbCarteira"` não existe no `index.html` (auditado). O item "Carteira" na sidebar não é controlado por role — está sempre visível ou nunca visível dependendo do HTML atual.

**Fix:** adicionar `id="sbCarteira"` ao item de sidebar correspondente, ou remover o código morto se a carteira for visível para todos os usuários logados.

---

### M3 — Avaliações nas páginas Reboque/Chaveiro/Mecânico são fake
**Arquivo:** `js/pages-extra.js` — funções `_review()`

Reviews "Carlos M. ⭐⭐⭐⭐⭐ — Atendimento rápido! 2h atrás" são strings hardcoded. O backend tem sistema de rating em `POST /monetization/providers/:id/rating`. Não há endpoint de listagem de reviews, mas os campos `ratingAvg` e `ratingCount` dos providers retornados por `/nearby` poderiam ser exibidos.

---

### M4 — `CANCELLED` e `DISPUTED` ausentes do `SM` no `rental-guest.js`
**Arquivo:** `js/rental-guest.js`

O mapa de status `SM` não inclui `DISPUTED`. Se uma reserva for para `DISPUTED` (cancelamento tardio do locatário), o badge será undefined e o card renderiza sem estilo.

```js
// Fix: adicionar ao SM
DISPUTED: { label:'Disputa', color:'#f97316', bg:'rgba(249,115,22,.10)', border:'rgba(249,115,22,.3)', icon:'⚠️' }
```

---

### M5 — `release-pending` é `POST` no backend mas a rota original era `GET`
**Arquivo:** `js/admin-approval.js` / `js/wallet-page.js`

`AdminApproval.releasePending()` chama `API.wallet.releasePending()` que está definido em `api.js` como `post('/wallet/release-pending', {})`. O backend define esse endpoint como `router.post('/release-pending', ...)` — correto. Mas o comentário no `wallet.routes.js` diz "GET /wallet/release-pending" na documentação inline. Sem impacto funcional, mas confunde futura manutenção.

---

### M6 — Foto de check-in/checkout salva como base64 LONGTEXT no MySQL
**Arquivo:** `js/rental-host.js`, `js/rental-guest.js` — `_capturePhoto()`

As fotos são comprimidas para JPEG 0.7 em canvas (máx 900px) e enviadas como `data URL` no body JSON. Sem S3/CDN configurado, ficam em colunas `TEXT/LONGTEXT` do MySQL. Uma foto comprimida ainda pode ter 150-400KB. Em reservas com check-in + checkout de ambos os lados = 4 fotos por reserva. Com volume, isso degrada o Hostinger MySQL e aumenta o tamanho dos selects de booking.

**Recomendação a médio prazo:** configurar Cloudinary free tier ou R2 (Cloudflare) e salvar apenas a URL.

---

## 🟢 BAIXOS / MELHORIAS

### B1 — `keep-alive.js` carregado antes de `app.js` na ordem original
`keep-alive.js` está na linha 198 (última), mas `App.init()` chama `KeepAlive.init()` internamente — dependência implícita. Funciona porque `app.js` usa `typeof KeepAlive !== 'undefined'` como guard, mas é frágil.

### B2 — `import crypto` dentro de função no `rental.routes.js`
```js
const import_crypto = (await import('crypto')).default;
```
`crypto` é módulo nativo do Node — pode ser importado no topo do arquivo. O `import_crypto` é declarado mas nem usado no escopo correto.

### B3 — Rate limit do webhook não cobre `/api/v1/emergency/*/mock-pay`
O skip do rate limiter cobre `*webhook*` e `*mp-webhook*`, mas os endpoints `/mock-pay` que simulam webhook não estão explicitamente excluídos. Sem impacto em produção (guardados por `ALLOW_MOCK_PAY`), mas em dev com rate limit baixo pode travar testes.

### B4 — `optionalAuth` usa `{ id, role }` do payload JWT sem verificar no banco
```js
req.user = { id: payload.sub, role: payload.role };
```
Em rotas públicas como `GET /listings`, o user vem do token sem validar se a conta existe ou está ativa. Usuários banidos/suspensos podem ainda "ver" listings como autenticados. Baixo risco mas inconsistente com o `authenticate` full.

### B5 — `prisma.$queryRaw` SELECT FOR UPDATE requer InnoDB — não documentado
`rental.routes.js` usa `SELECT id FROM rental_vehicle_configs WHERE id = ${configId} FOR UPDATE` dentro de `$transaction`. Depende de InnoDB (Hostinger MySQL ≥ 5.7). Sem verificação de engine no `check-mysql.js`. Adicionar validação ao script de bootstrap.

### B6 — `Chat.js` não tem botão de limpar conversa
`conversationId` fica em memória mas não há botão "Nova conversa" exposto na UI. O usuário não tem como iniciar um novo contexto sem recarregar a página ou trocar de agente.

### B7 — Missing `sbMinhasReservas` show/hide para usuários não logados
`updateSidebarRoles` mostra `sbMinhasReservas` para qualquer usuário logado (`isLoggedIn`). Se o usuário fizer logout, o item some. Mas o item está com `style="display:none"` no HTML e só aparece após login — comportamento correto. Porém, `sbPainelAnfitriao` tem o mesmo tratamento e também está OK. Registrado como confirmado, sem ação necessária.

---

## INVENTÁRIO DE ENDPOINTS — GAPS FRONTEND ↔ BACKEND

| Endpoint Backend | Chamado no Frontend | Observação |
|---|---|---|
| `GET /ai/conversations` | ❌ Não | Histórico de conversas existe mas UI ignora |
| `GET /ai/conversations/:id` | ❌ Não | Idem |
| `DELETE /ai/conversations/:id` | ❌ Não | Idem |
| `POST /monetization/logistics/quote` | ❌ Não | `cotarFrete()` é stub fake |
| `POST /monetization/parts/quote` | ✅ Parcial | Chamado de `pages-monetize.js` |
| `GET /emergency/nearby` | ✅ Sim | Usado em `monetization.js` |
| `GET /monetization/providers/nearby` | ✅ Sim | Usado em `monetization.js` |
| `POST /rental/bookings/:id/mock-pay` | ✅ Sim | Em `api.js` → `mockPayBooking` |
| `PATCH /emergency/:id/status` | ✅ Sim | Via `API.emergency.update` |
| `GET /tracking/sessions/:id/history` | ❌ Não | GPS replay não implementado no frontend |
| `POST /tracking/sessions/:id/checkin` | ❌ Não | GPS check-in geofenced não exposto na UI |

---

## ARQUITETURA — OBSERVAÇÕES GERAIS

**Pontos fortes:**
- Transações atômicas com `SELECT ... FOR UPDATE` no booking para evitar TOCTOU (C2 do sprint anterior resolvido)
- Webhook de rental com validação HMAC + idempotência (`renterPaymentStatus === 'COMPLETED'`)
- Wallet com lógica condicional atômica no `updateMany` (count === 0 → saldo insuficiente)
- Check-in de duas etapas host+guest bem implementado no backend
- Fallback de polling para dispatch quando Socket.io falha
- Auto-provisionamento de carteira para hosts P2P sem perfil de prestador

**Dívidas técnicas notáveis:**
- Fotos de check-in como base64 no MySQL (M6)
- Falta de histórico de chat acessível na UI (A1)
- `updateSidebarRoles` como ponto único de falha em arquivo secundário (A5)
- Garagem sem atalho para fluxo de rental (A2)

---

## PRIORIZAÇÃO SUGERIDA

| # | Achado | Esforço | Impacto |
|---|---|---|---|
| 1 | C1 — XSS em `_carCardReal` | Baixo | Crítico (segurança) |
| 2 | C2 — `cotarFrete` stub fake | Médio | Alto (funcionalidade morta) |
| 3 | A1 — Histórico de chat não acessível | Médio | Alto (UX) |
| 4 | A5 — `updateSidebarRoles` em arquivo frágil | Baixo | Alto (risco de falha) |
| 5 | C3 — Ordem de carregamento `app.js` | Baixo | Médio (race condition) |
| 6 | A2 — Garagem sem atalho rental | Baixo | Médio (UX) |
| 7 | M4 — `DISPUTED` ausente no `SM` | Baixo | Baixo (edge case) |
| 8 — | M6 — Fotos base64 no MySQL | Alto | Médio (performance futura) |
