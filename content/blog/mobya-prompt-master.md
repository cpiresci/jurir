# MOBYA — Prompt Master de Continuação

## Contexto
Estamos no meio do smoke test do ciclo completo de aluguel e identificamos um gap crítico na UI.
A prioridade da próxima sessão é: **1) corrigir a UI, 2) concluir o smoke test**.

---

## Repos

| | Backend | Frontend |
|---|---|---|
| Pasta | `~/mobya-app` | `~/mobya-master` |
| Branch | `main` | `main` |
| Remote | `cpiresci/mobya-app.git` | `cpiresci/mobya.git` |
| Push | `git push origin main` | `git push origin main` |
| URL | `https://mobya.onrender.com` | `https://cpiresci.github.io/mobya` |

API prefix: `/api/v1/`
Token: campo `data.accessToken` no retorno do login
Patches: escrever em `/storage/emulated/0/Download/p.py` → `cp /storage/emulated/0/Download/p.py $TMPDIR/p.py && python3 $TMPDIR/p.py`

---

## Contas de teste

| Papel | Email | Senha | userId |
|---|---|---|---|
| Host | Prestador@mobya.com.br | Prestador@123! | 91e9a864-83f5-47a0-8e95-96f1ae0afaea |
| Cliente | mobyax@gmail.com | Clei1234 | (buscar no login) |

---

## Dados do teste ativo (NÃO apagar do banco)

| Item | ID |
|---|---|
| Veículo | 1ffc9310-4e8c-466f-899a-b596a9e7164d |
| Listing | f30292a7-7018-4c61-9adf-04ad54ac501b |
| Config aluguel | a8f3dc27-2444-45b7-8198-6ce9b64f88bf |
| **Booking ativo** | **e565035a-e1cb-4663-b4e8-6419d4f039d7** |

Booking status atual: `CONFIRMED` | pagamento: `PENDING` | 2 diárias R$150 = subtotal R$300

---

## PRIORIDADE 1 — Corrigir UI de aluguel em pages.js

**Problema:** A função `renderListing(id)` em `~/mobya-master/js/pages.js` (linha ~412)
não tem seção de aluguel. Listings do tipo `RENT` abrem normalmente mas não mostram
botão de reservar — a sidebar só tem WhatsApp do vendedor.

**O que precisa ser implementado:**

Dentro de `renderListing`, após buscar o listing (`API.listings.get(id)`),
verificar se `listing.type === 'RENT'` e se sim:

1. Buscar rental config: `API.rental.getConfigByListing(listingId)`
2. Se config existir, renderizar card de reserva na sidebar com:
   - Diária: `config.dailyRate` formatada em BRL
   - Disponibilidade: `config.availableFrom` até `config.availableTo`
   - Mínimo/máximo de dias: `config.minDays` / `config.maxDays`
   - Input de data início (`startDate`)
   - Input de data fim (`endDate`)
   - Preview de preço calculado (dias × diária)
   - Botão "🗝️ Reservar" que chama `API.rental.createBooking({configId, startDate, endDate})`
3. Após reserva criada: `App.toast('✅ Reserva enviada! Aguardando confirmação.', 'ok')` + navegar para `minhas-reservas`
4. Se usuário não estiver logado: mostrar `MobyaAuth.showLogin()`

**Método da API já existe:**
```js
// api.js linha 127
getConfigByListing: (listingId) => get(`/rental/configs/listing/${listingId}`),
// api.js linha 133
createBooking: (d) => post('/rental/bookings', d),
```

---

## PRIORIDADE 2 — Concluir smoke test

Após fix da UI, completar as fases restantes.
Booking ativo: `e565035a-e1cb-4663-b4e8-6419d4f039d7`

### Fase 3 — Mock-pay (ALLOW_MOCK_PAY=true já está no Render)
```bash
# Como CLIENTE
POST /api/v1/rental/bookings/e565035a-e1cb-4663-b4e8-6419d4f039d7/mock-pay
```
Esperado: `renterPaymentStatus: COMPLETED`

### Fase 4 — Check-in (duas etapas)
```bash
# Como HOST: registra check-in
PATCH /api/v1/rental/bookings/e565035a.../checkin
body: {} (foto/GPS opcionais)

# Como CLIENTE: confirma retirada
PATCH /api/v1/rental/bookings/e565035a.../checkin/confirm
```
Esperado: status vira `ACTIVE`

### Fase 5 — Checkout (duas etapas)
```bash
# Como CLIENTE: inicia devolução
PATCH /api/v1/rental/bookings/e565035a.../checkout/initiate
body: {"photoUrl":"data:image/png;base64,iVBORw0KGgo="} # foto obrigatória

# Como HOST: confirma e libera payout
PATCH /api/v1/rental/bookings/e565035a.../checkout
```
Esperado: status vira `COMPLETED`, wallet do host recebe crédito PENDING_RENTAL

### Fase 6 — Verificar wallet
```bash
GET /api/v1/wallet/balance (como HOST)
GET /api/v1/wallet/transactions (como HOST)
```
Esperado: transação `PENDING_RENTAL` com `releaseAt` = agora + 3 dias

### Fase 7 — Liberar payout (opcional, requer WALLET_RETENTION_DAYS=0 no Render)
Setar env var temporária → redeploy → refazer checkout → saldo disponível aumenta.

---

## Gaps de UI identificados (backlog pós smoke test)

1. **Botão de reservar no listing** — PRIORIDADE 1 acima
2. **Cadastro de veículo pela UI** — campos `year` e `modelYear` precisam ser enviados juntos, frontend provavelmente só envia um
3. **Cadastro de anúncio pela UI** — toast aparece mas anúncio não é criado (investigar o que o frontend envia vs o que o backend exige: `title`, `description`, `price`, `type`, `city`, `state`)

---

## Arquitetura relevante

```
Backend rental routes:
POST   /rental/bookings              → criar reserva
PATCH  /rental/bookings/:id/confirm  → host confirma
PATCH  /rental/bookings/:id/mock-pay → simular pagamento (ALLOW_MOCK_PAY=true)
PATCH  /rental/bookings/:id/checkin  → host registra entrega (body: {lat,lng,photoUrl})
PATCH  /rental/bookings/:id/checkin/confirm → cliente confirma retirada → status ACTIVE
PATCH  /rental/bookings/:id/checkout/initiate → cliente inicia devolução (photoUrl obrigatória)
PATCH  /rental/bookings/:id/checkout → host confirma → status COMPLETED + wallet crédito

Frontend rental:
~/mobya-master/js/rental-host.js  → painel do host (checkin/checkout OK)
~/mobya-master/js/rental-guest.js → painel do cliente (mock-pay, checkinConfirm, checkoutInitiate OK)
~/mobya-master/js/api.js          → métodos: checkinConfirmBooking, checkoutInitiateBooking, etc
~/mobya-master/js/pages.js        → renderListing() linha 412 — FALTA seção de aluguel
```

---

## Checklist de saúde ao iniciar a sessão

```bash
# 1. Repos limpos e sincronizados
git -C ~/mobya-app fetch origin && git -C ~/mobya-app status
git -C ~/mobya-master fetch origin && git -C ~/mobya-master status

# 2. Backend acordado
curl -s https://mobya.onrender.com/api/v1/rental/bookings/e565035a-e1cb-4663-b4e8-6419d4f039d7 \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | grep status
```
