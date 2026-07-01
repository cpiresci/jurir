# MOBYA — Lógica Master de Monetização

> Documento de referência único. Sempre que mexer em comissão, wallet ou
> cobrança, confira aqui primeiro — a nomenclatura tem pegadinhas históricas.

---

## Visão geral: 4 motores, 2 mecânicas de dinheiro diferentes

| # | Motor | Modelo do "negócio" | Dinheiro passa pela MOBYA? | Status |
|---|-------|---------------------|---------------------------|--------|
| 1 | **Emergência** (Uber-style) | `Emergency` + `TrackingSession` | ✅ Sim — cliente paga MOBYA, MOBYA repassa prestador | ✅ Testado e2e |
| 2 | **Aluguel P2P** (Turo-style) | `RentalBooking` + `RentalVehicleConfig` | ✅ Sim — locatário paga MOBYA, MOBYA repassa anfitrião | ✅ Testado e2e |
| 3 | **Cotações/Parceiros** (seguro, financiamento, consórcio, logística, peças, locadora-empresa) | `MonetizationQuote` → `MonetizationCommission` | ⚠️ Depende — hoje só rastreia comissão devida, não cobra automaticamente do parceiro | 🟡 Construído, não testado em produção |
| 4 | **Classificados** (anúncio de venda de veículo) | `Listing` | ❌ Não — sem comissão, sem wallet | ✅ Grátis por decisão de produto (sem código de cobrança, de propósito) |

Os motores 1 e 2 são **transacionais**: a MOBYA intermedia o pagamento do
cliente final e credita o prestador/anfitrião na wallet interna (retenção
de alguns dias → liberação → saque PIX). É o dinheiro que efetivamente
passa pela conta MercadoPago da MOBYA.

O motor 3 é **referencial**: a MOBYA conecta cliente↔parceiro (corretora de
seguro, banco, locadora de frota, transportadora, fornecedor de peças) mas
**o pagamento do serviço em si acontece fora da MOBYA** (o cliente paga a
seguradora/banco/locadora diretamente). O que a MOBYA cobra é só a
**comissão de intermediação**, do parceiro — não do cliente final.

O motor 4 não tem mecânica de dinheiro nenhuma hoje.

---

## Motor 1 — Emergência (Uber-style) ✅ testado

```
Cliente abre Emergency → estimatedPrice calculado → pagamento PIX
(customerMpPaymentId / customerPaymentStatus) → dispatch cascata até
prestador aceitar → TrackingSession → check-in geofenced → status
A_CAMINHO→CHEGOU→EM_SERVICO→CONCLUIDO → crédito automático em
WalletTransaction (walletPending do MonetizationProvider, vertical
SERVICE, comissão 18%) → retenção 3 dias → walletBalance → saque PIX.
```
Dinheiro: **cliente → MOBYA (PIX) → prestador (wallet, líquido de 18%)**.

---

## Motor 2 — Aluguel P2P (Turo-style) ✅ testado

```
Anfitrião cria RentalVehicleConfig (plano de proteção, hostFeeRate
snapshot) → renter reserva → checkout PIX (mpPreferenceId/mpPaymentId)
→ ACTIVE → check-out → creditPendingRental() credita walletPending do
MonetizationProvider do anfitrião (auto-provisionado se ele nunca se
cadastrou como prestador de serviço — fix de hoje) → retenção → saque.
```
Dinheiro: **locatário → MOBYA (PIX) → anfitrião (wallet, líquido da taxa
de duas pontas)**.

⚠️ **Detalhe de nomenclatura**: o `MonetizationProvider` auto-provisionado
pra carteira do anfitrião usa `vertical: 'RENTAL'` como **marcador
literal exato** (não passa por `canonicalVertical`). Isso é proposital —
serve só pra liberar `/wallet/balance` e `/wallet/withdraw` sem exigir
`status: 'ACTIVE'` (aprovação de prestador de serviço, que não faz
sentido pra esse caso). **Nunca aparece em `GET /providers`** porque essa
rota filtra por `status: 'ACTIVE'`, e o auto-provisionado nasce
`PENDING`. Não confundir com o vertical canônico `FLEET_RENTAL`
(locadora-empresa, motor totalmente diferente, ver abaixo).

---

## Motor 3 — Cotações/Parceiros (seguro, financiamento, consórcio,
## logística, peças, locadora-empresa) 🟡 construído, não testado

Este é o motor "confuso" — porque mistura 6 verticais de negócio
diferentes numa única mecânica genérica de **cotação → comissão**,
**sem** mover o pagamento do serviço em si pela MOBYA.

```
1. Provider se cadastra (POST /providers) com uma vertical:
   FLEET_RENTAL, LOGISTICS, INSURANCE, FINANCING, CONSORTIUM, PARTS
   → status PENDING → admin aprova (PATCH /providers/:id/approve) → ACTIVE

2. Cliente simula (opcional, não gera cobrança):
   POST /insurance/simulate | /logistics/quote | /parts/quote
   → só calculadora, mostra estimativa de comissão

3. Cliente ou provider gera cotação real:
   POST /quotes { providerId, vertical, estimatedAmount }
   → MonetizationQuote status OPEN

4. Provider aceita: PATCH /quotes/:id/accept → status ACCEPTED

5. Serviço é prestado FORA da MOBYA (cliente fecha contrato de seguro,
   financiamento, etc. direto com o parceiro) — a MOBYA não participa
   desse pagamento.

6. Provider ou cliente marca como concluído:
   PATCH /quotes/:id/complete { finalAmount }
   → calcula commissionAmount = finalAmount × taxa do vertical
   → cria MonetizationCommission status CHARGEABLE

7. Cobrança da comissão (do PARCEIRO, não do cliente final) — duas vias:
   a) POST /commissions/:id/charge (mp.routes.js) — cobrança real via
      MercadoPago, BLOQUEADA junto com o resto do MP real.
   b) POST /commissions/:id/pay (admin only) — marca PAID manualmente,
      pra fechamento manual/fora de banda enquanto MP não libera.
```

**Taxas atuais** (`commission.service.js`):

| Vertical canônico | Taxa | O que é |
|---|---|---|
| `FLEET_RENTAL` | 5% | Locadora-EMPRESA (Localiza/Unidas/Movida) — **não é** o aluguel P2P do Motor 2 |
| `LOGISTICS` | 15% | Frete/reboque fora de emergência |
| `INSURANCE` | 12% | Seguro auto — % do prêmio |
| `FINANCING` | 4% | Financiamento — % do valor financiado |
| `CONSORTIUM` | 5% | Consórcio — % da carta de crédito |
| `PARTS` | 8% | Peças OEM/OES |

Apelidos em português (`SEGUROS`, `FINANCIAMENTO`, `CONSORCIO`, `ALUGUEL`,
`REBOQUE`, `GUINCHO`, `CHAVEIRO`, `PECAS`, `SERVICOS`) são resolvidos por
`canonicalVertical()` antes de qualquer lookup — o frontend
(`monetization.js`) já manda nesse formato.

**Por que "não passa dinheiro na nossa conta"**: o cliente final paga o
parceiro direto (prêmio do seguro, parcela do financiamento, carta do
consórcio, frete). A MOBYA só fica numa ponta separada cobrando a
comissão do parceiro — e essa cobrança em si depende do MP real (passo
7a) ou de acerto manual (7b) até lá. **Esse motor inteiro está construído
mas nunca foi exercitado em produção** — vale um teste e2e com `pay`
manual antes do MP liberar, pra não descobrir bug só quando o dinheiro
real já estiver em jogo.

---

## Motor 4 — Classificados ✅ grátis, sem mecânica de dinheiro

`Listing` é CRUD puro (`listing.routes.js`): criar, editar, listar,
favoritar, deletar anúncio de veículo. **Nenhum hook de pagamento,
nenhuma comissão, nenhuma wallet.** Confirmado no código — não é uma
feature pela metade, é exatamente "grátis por enquanto" como decisão de
produto. Não precisa de nenhum ajuste até vocês decidirem monetizar.

---

## Resumo rápido pra não confundir de novo

- **"RENTAL" sozinho** → sempre resolve pra `FLEET_RENTAL` (locadora-
  empresa) via `canonicalVertical`, **exceto** o marcador literal que eu
  uso na wallet auto-provisionada do Motor 2 (esse é interno, nunca passa
  por `canonicalVertical`, não conflita).
- **Aluguel P2P cliente-x-cliente** (Turo) = `RentalBooking`, Motor 2,
  **não tem vertical de comissão genérica** — usa fee model próprio em
  `rental-pricing.service.js`.
- **Motor 1 e 2** = dinheiro real entra e sai da conta MP da MOBYA.
- **Motor 3** = só a comissão (não o serviço) é cobrada do parceiro, e
  essa cobrança em si está pendente de MP real ou acerto manual.
- **Motor 4** = sem dinheiro, ponto final.
