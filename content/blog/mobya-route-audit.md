# MOBYA — Auditoria de Rotas: Backend × Frontend
**Data:** 24/06/2026  
**Backend:** `mobya-app-main` (Node.js/Express/Prisma) · montado em `/api/v1`  
**Frontend:** `mobya-master` (Vanilla JS SPA) · cliente centralizado em `api.js`

---

## 1. MAPA COMPLETO DE ROTAS BACKEND

### `/api/v1/auth` — `auth.routes.js`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| POST | `/register` | ❌ (rate limit) | ✅ `API.auth.register()` |
| POST | `/login` | ❌ (rate limit) | ✅ `API.auth.login()` |
| POST | `/refresh` | ❌ | ✅ `auth.js` (direto via fetch) |
| POST | `/logout` | ✅ | ✅ `API.auth.logout()` |
| GET | `/me` | ✅ | ✅ `API.auth.me()` |
| PATCH | `/me` | ✅ | ✅ `API.auth.updateMe()` |
| PATCH | `/password` | ✅ | ✅ `API.auth.updatePassword()` |
| POST | `/forgot-password` | ❌ (rate limit) | ✅ `API.auth.forgotPassword()` |
| POST | `/reset-password` | ❌ (rate limit) | ✅ `API.auth.resetPassword()` |

**Status:** ✅ 100% coberto

---

### `/api/v1/ai` — `ai.routes.js`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| GET | `/agents` | ❌ | ✅ `API.ai.agents()` |
| GET | `/providers` | ❌ | ✅ `API.ai.providers()` |
| POST | `/chat` | ✅ (rate limit) | ✅ `API.ai.chat()` — `chat.js`, `home-chat.js` |
| POST | `/diagnose` | ✅ (rate limit) | ✅ `API.ai.diagnose()` |
| POST | `/fraud-analysis` | ✅ (rate limit) | ✅ `API.ai.fraud()` — `pages.js` |
| POST | `/insurance-score` | ✅ (rate limit) | ✅ `API.ai.insurance()` |
| POST | `/financing-simulation` | ✅ | ✅ `API.ai.financing()` — `pages-monetize.js` |
| GET | `/conversations` | ✅ | ✅ `API.ai.conversations()` (definido, não chamado via UI diretamente) |
| GET | `/conversations/:id` | ✅ | ✅ `API.ai.conversation(id)` |
| DELETE | `/conversations/:id` | ✅ | ✅ `API.ai.deleteConversation(id)` |

**Status:** ✅ 100% coberto · ⚠️ `GET /conversations` e `DELETE` existem na api.js mas sem botão de UI para listagem de histórico

---

### `/api/v1/listings` — `listing.routes.js`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| GET | `/` | opcional | ✅ `API.listings.search()` — `pages.js` |
| POST | `/` | ✅ | ✅ `API.listings.create()` — `pages.js` |
| GET | `/mine` | ✅ | ✅ `API.listings.mine()` — `pages.js` (dashboard) |
| GET | `/favorites` | ✅ | ✅ `API.listings.favorites()` |
| GET | `/:slugOrId` | opcional | ✅ `API.listings.get(id)` — `pages.js` |
| PUT | `/:id` | ✅ | ✅ `API.listings.update()` |
| DELETE | `/:id` | ✅ | ✅ `API.listings.remove()` |
| POST | `/:id/favorite` | ✅ | ✅ `API.listings.favorite()` — `home-premium.js` |

**Status:** ✅ 100% coberto

---

### `/api/v1/emergency` — `emergency.routes.js` + `emergency-payment.routes.js`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| POST | `/` | ✅ | ✅ `API.emergency.create()` — `pages.js`, `pages-extra.js` |
| POST | `/:id/accept-offer` | ✅ MECHANIC/SELLER | ✅ `API.req('POST',…)` — `dispatch-ui.js` |
| POST | `/:id/reject-offer` | ✅ MECHANIC/SELLER | ✅ `API.req('POST',…)` — `dispatch-ui.js` |
| GET | `/:id/dispatch-status` | ✅ | ✅ `API.emergency.dispatchStatus()` — `dispatch-ui.js` |
| GET | `/:id/tracking-session` | ✅ | ✅ `API.req('GET',…)` — `ultra-gps.js` |
| GET | `/mine` | ✅ | ✅ `API.emergency.mine()` — `pages.js` |
| PATCH | `/:id/status` | ✅ | ✅ `API.emergency.update()` |
| GET | `/active` | ✅ ADMIN | ⚠️ **SEM CHAMADA FRONTEND** — não há UI de admin que use esta rota |
| GET | `/my-offers` | ✅ MECHANIC/SELLER | ✅ `API.req('GET',…)` — `dispatch-ui.js` |
| GET | `/nearby` | ✅ | ✅ `API.emergency.nearby()` — `ultra-gps.js` |
| POST | `/:id/initiate-payment` | ✅ | ✅ `API.emergency.initiatePayment()` — `emergency-payment.js` |
| GET | `/:id/payment-status` | ✅ | ✅ `API.emergency.paymentStatus()` — `emergency-payment.js` |
| POST | `/:id/refund` | ✅ | ✅ `API.emergency.refund()` (definido em api.js, sem chamada de UI visível) |
| POST | `/:id/mock-pay` | ✅ | ✅ `API.emergency.mockPay()` (definido, sem botão de UI — apenas dev) |

**Status:** ⚠️ 2 gaps:
- `GET /emergency/active` — rota admin sem página de admin correspondente
- `POST /:id/refund` — definido em api.js mas sem botão de UI ativo

---

### `/api/v1/monetization` — `monetization/`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| GET | `/rates` | ❌ | ✅ `API.monetization.rates()` |
| GET | `/categories` | ❌ | ✅ `API.monetization.categories()` |
| GET | `/providers` | opcional | ✅ `API.monetization.providers()` |
| GET | `/providers/nearby` | ❌ | ⚠️ **SEM CHAMADA FRONTEND** |
| GET | `/providers/mine` | ✅ | ✅ `API.monetization.providersMine()` — `monetization.js` |
| POST | `/providers` | ✅ | ✅ `API.monetization.createProvider()` |
| PATCH | `/providers/:id/location` | ✅ | ✅ `API.monetization.updateLocation()` |
| POST | `/providers/:id/rating` | ✅ | ✅ `API.rateProvider()` — `rating-modal.js` |
| POST | `/quotes` | ✅ | ✅ `API.monetization.createQuote()` — `pages-monetize.js` |
| GET | `/quotes/mine` | ✅ | ✅ `API.monetization.quotes()` — `pages.js` |
| GET | `/quotes/provider` | ✅ | ✅ `API.monetization.quotesProvider()` — `monetization.js` |
| PATCH | `/quotes/:id/accept` | ✅ | ✅ `API.monetization.acceptQuote()` — `monetization.js` |
| PATCH | `/quotes/:id/complete` | ✅ | ✅ `API.monetization.completeQuote()` — `monetization.js` |
| PATCH | `/quotes/:id/cancel` | ✅ | ✅ `API.monetization.cancelQuote()` — `monetization.js` |
| GET | `/commissions/summary` | ✅ ADMIN | ✅ `monetization.js` (`commSummary()`) |
| GET | `/commissions/pending-payment` | ✅ | ✅ `API.monetization.pendingPayments()` |
| GET | `/commissions/mine` | ✅ | ✅ `API.monetization.commissionsMine()` — `monetization.js` |
| POST | `/commissions/:id/pay` | ✅ ADMIN | ✅ `API.monetization.chargeCommission()` — `monetization.js` |
| GET | `/dashboard` | ✅ ADMIN | ✅ `api.monetization.dashboard()` — `monetization.js` |
| POST | `/insurance/simulate` | ✅ | ✅ `API.monetization.simulateInsurance()` — `pages-monetize.js` |
| POST | `/logistics/quote` | ✅ | ✅ `API.monetization.quoteLogistics()` |
| POST | `/parts/quote` | ✅ | ✅ `API.monetization.quoteParts()` — `pages.js` |
| GET | `/admin/providers/pending` | ✅ ADMIN | ✅ `API.req('GET',…)` — `admin-approval.js` |
| PATCH | `/providers/:id/approve` | ✅ ADMIN | ✅ `API.req('PATCH',…)` — `admin-approval.js` |
| PATCH | `/providers/:id/reject` | ✅ ADMIN | ✅ `API.req('PATCH',…)` — `admin-approval.js` |
| GET | `/admin/providers/pending/count` | ✅ ADMIN | ✅ `API.req('GET',…)` — `admin-approval.js` |
| POST | `/commissions/:id/charge` | ✅ | ✅ (via `mp.routes.js`) — `monetization.js` |
| GET | `/commissions/:id/payment` | ✅ | ✅ `API.monetization.getPayment()` — `monetization.js` |
| POST | `/webhook/mp` | ❌ (Mercado Pago) | N/A — webhook externo |
| POST | `/webhook/mp-emergency` | ❌ (Mercado Pago) | N/A — webhook externo |

**Status:** ⚠️ 1 gap:
- `GET /providers/nearby` — backend implementado, sem chamada frontend

---

### `/api/v1/tracking` — `tracking.routes.js`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| POST | `/sessions` | ✅ | ✅ `createSession()` — `ultra-gps.js` |
| GET | `/sessions/:id` | ✅ | ✅ `API.req('GET',…)` — `ultra-gps.js` (polling) |
| GET | `/sessions/:id/history` | ✅ | ✅ `API.tracking.sessionHistory()` (definido, sem chamada de UI visível) |
| POST | `/sessions/:id/checkin` | ✅ | ✅ `API.req('POST',…)` — `ultra-gps.js` |

**Status:** ⚠️ `GET /sessions/:id/history` definido em api.js mas sem UI que exiba o histórico

---

### `/api/v1/vehicles` — `vehicle.routes.js`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| GET | `/` | ✅ | ✅ `API.vehicle.list()` — `garagem.js` |
| POST | `/` | ✅ | ✅ `API.vehicle.create()` — `garagem.js` |
| GET | `/:id` | ✅ | ✅ `API.vehicle.get()` — `garagem.js` |
| PATCH | `/:id` | ✅ | ✅ `API.vehicle.update()` — `garagem.js` |
| DELETE | `/:id` | ✅ | ✅ `API.vehicle.remove()` — `garagem.js` |
| POST | `/:id/maintenances` | ✅ | ✅ `API.vehicle.addMaintenance()` — `garagem.js` |

**Status:** ✅ 100% coberto

---

### `/api/v1/notifications` — `notification.routes.js`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| GET | `/` | ✅ | ✅ `API.notifications.list()` — `notifications.js`, `notificacoes-page.js` |
| PATCH | `/:id/read` | ✅ | ✅ `API.notifications.markRead()` |
| PATCH | `/read-all` | ✅ | ✅ `API.notifications.markAll()` |
| GET | `/unread-count` | ✅ | ✅ `API.notifications.unread()` |

**Status:** ✅ 100% coberto

---

### `/api/v1/wallet` — `wallet.routes.js`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| GET | `/balance` | ✅ | ✅ `API.wallet.balance()` — `wallet-page.js` |
| GET | `/transactions` | ✅ | ✅ `API.wallet.transactions()` — `wallet-page.js` |
| POST | `/withdraw` | ✅ | ✅ `API.wallet.withdraw()` — `wallet-page.js` |
| GET | `/withdrawals` | ✅ | ✅ `API.wallet.withdrawals()` — `wallet-page.js` |
| PATCH | `/withdrawals/:id` | ✅ ADMIN | ⚠️ `API.wallet.approveSaque()` **definido em api.js mas sem chamada de UI** |
| POST | `/release-pending` | ✅ ADMIN | ✅ `API.wallet.releasePending()` — `admin-approval.js` |

**Status:** ⚠️ 1 gap:
- `PATCH /withdrawals/:id` (aprovar/rejeitar saque) — sem botão de UI no admin

---

### `/api/v1/rental` — `rental.routes.js`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| POST | `/configs` | ✅ | ✅ `API.rental.createConfig()` (definido) |
| GET | `/configs` | ❌ | ⚠️ **SEM CHAMADA FRONTEND** |
| GET | `/configs/mine` | ✅ | ✅ `API.rental.myConfigs()` — `rental-host.js` |
| GET | `/configs/listing/:listingId` | ❌ | ✅ `API.rental.getConfigByListing()` (definido, sem UI visível) |
| GET | `/configs/available` | ❌ | ⚠️ **SEM CHAMADA FRONTEND** |
| GET | `/configs/:id` | ❌ | ✅ `API.rental.getConfig()` (definido) |
| PATCH | `/configs/:id` | ✅ | ✅ `API.rental.updateConfig()` — `rental-host.js` (toggle active) |
| DELETE | `/configs/:id` | ✅ | ✅ `API.rental.deleteConfig()` (definido) |
| GET | `/preview-price` | ❌ | ✅ `API.rental.previewPrice()` (definido, sem UI visível) |
| POST | `/bookings` | ✅ | ✅ `API.rental.createBooking()` (definido) |
| GET | `/bookings/mine` | ✅ | ✅ `API.rental.myBookings()` — `rental-guest.js` |
| GET | `/bookings/host` | ✅ | ✅ `API.rental.hostBookings()` — `rental-host.js` |
| GET | `/bookings/:id` | ✅ | ✅ `API.rental.getBooking()` (definido) |
| PATCH | `/bookings/:id/confirm` | ✅ | ✅ `API.rental.confirmBooking()` — `rental-host.js` |
| PATCH | `/bookings/:id/decline` | ✅ | ✅ `API.rental.declineBooking()` — `rental-host.js` |
| PATCH | `/bookings/:id/checkin` | ✅ | ✅ `API.rental.checkinBooking()` — `rental-host.js` |
| PATCH | `/bookings/:id/checkout` | ✅ | ✅ `API.rental.checkoutBooking()` — `rental-host.js` |
| PATCH | `/bookings/:id/cancel` | ✅ | ✅ `API.rental.cancelBooking()` — `rental-guest.js` |
| PATCH | `/bookings/:id/cancel-paid` | ✅ | ✅ `API.rental.cancelPaidBooking()` — `rental-guest.js` |
| POST | `/bookings/mp-webhook` | ❌ (MP) | N/A — webhook externo |
| POST | `/bookings/:id/pay` | ✅ | ✅ `API.req('POST',…)` — `rental-guest.js` (redirect MP) |
| POST | `/bookings/:id/mock-pay` | ✅ | ✅ `API.rental.mockPayBooking()` (dev only, sem botão UI) |

**Status:** ⚠️ 2 rotas sem chamada frontend:
- `GET /configs` (listagem pública de configs)
- `GET /configs/available` (configs disponíveis para aluguel — **crítico para o guest flow**)

---

### Rotas avulsas no `app.js`
| Método | Rota | Auth | Frontend |
|--------|------|------|----------|
| GET | `/api/v1/health` | ❌ | ✅ `API.ping()` — `app.js` |
| GET | `/api/v1/ping` | ❌ | (não chamado diretamente, keep-alive) |
| GET | `/api/v1` | ❌ | (não chamado) |

---

## 2. GAPS CRÍTICOS — AÇÃO NECESSÁRIA

### 🔴 Gap 1 — `GET /rental/configs/available` sem UI
**Impacto:** Um locatário (guest) nunca consegue ver veículos disponíveis para alugar. A tela `aluguel` de `pages-extra.js` existe como página, mas não carrega a listagem de configs disponíveis.  
**Correção:** `pages-extra.js` → `renderAluguel()` deve chamar `API.rental.myConfigs()` ou criar `API.rental.availableConfigs()` → `GET /rental/configs/available`.

### 🔴 Gap 2 — `PATCH /wallet/withdrawals/:id` sem UI admin
**Impacto:** Admin não consegue aprovar/rejeitar saques da carteira de prestadores pela interface. A função `API.wallet.approveSaque()` está definida mas nunca é chamada.  
**Correção:** Adicionar seção em `admin-approval.js` ou nova página `carteira-admin` com listagem de saques pendentes e botões de aprovar/rejeitar.

### 🟡 Gap 3 — `GET /emergency/active` sem UI admin
**Impacto:** Admins não têm painel de emergências ativas em tempo real.  
**Correção:** Adicionar tab na página `admin-aprovacao` ou nova página `admin-emergencias`.

### 🟡 Gap 4 — `GET /monetization/providers/nearby` sem frontend
**Impacto:** Funcionalidade de descoberta de prestadores próximos existe no backend mas não é usada. O `ultra-gps.js` usa `/emergency/nearby` em vez disso.  
**Correção:** Avaliar se deve ser exposta como feature no mapa ou se pode ser depreciada.

### 🟡 Gap 5 — `GET /tracking/sessions/:id/history` sem UI
**Impacto:** Histórico de GPS de uma sessão está disponível mas não é exibido em lugar algum.  
**Correção:** Mostrar replay de rota no `ultra-gps.js` após check-out.

---

## 3. GAPS MENORES — FUNÇÕES DEFINIDAS SEM UI

| Função em `api.js` | Rota Backend | Situação |
|---------------------|-------------|----------|
| `API.emergency.refund()` | `POST /:id/refund` | Definido, sem botão de UI |
| `API.emergency.mockPay()` | `POST /:id/mock-pay` | Dev only, sem botão (correto) |
| `API.ai.conversations()` | `GET /ai/conversations` | Definido, sem tela de histórico |
| `API.ai.deleteConversation()` | `DELETE /ai/conversations/:id` | Definido, sem botão |
| `API.rental.previewPrice()` | `GET /rental/preview-price` | Definido, sem modal de cotação |
| `API.rental.getConfigByListing()` | `GET /configs/listing/:listingId` | Definido, sem uso visível |
| `API.rental.mockPayBooking()` | `POST /bookings/:id/mock-pay` | Dev only (correto) |

---

## 4. MAPA DE PÁGINAS × MÓDULOS

| Página (`BASE_PAGES`) | Módulo JS | Status |
|-----------------------|-----------|--------|
| `home` | `pages.js → renderHome()` | ✅ Funcional |
| `classificados` | `pages.js → renderClassificados()` | ✅ Funcional |
| `agentes` | `pages.js → renderAgentes()` | ✅ Funcional |
| `emergencia` | `pages.js → renderEmergencia()` | ✅ Funcional |
| `calculadoras` | `pages.js → renderCalculadoras()` | ✅ Funcional |
| `vistoria` | `pages.js → renderVistoria()` | ✅ Funcional |
| `documentacao` | `pages.js → renderDocumentacao()` | ✅ Funcional |
| `dashboard` | `pages.js → renderDashboard()` | ✅ Funcional |
| `chat` | `chat.js → renderChatPage()` | ✅ Funcional |
| `listing` | `pages.js → renderListing()` | ✅ Funcional |
| `pecas` | `pages.js → renderPecas()` | ✅ Funcional |
| `aluguel` | `pages-extra.js → renderAluguel()` | ⚠️ **Sem listagem de configs disponíveis** |
| `servicos` | `pages.js → renderServicos()` | ✅ Funcional |
| `reboque` | `pages-extra.js → renderReboque()` | ✅ Funcional |
| `chaveiro` | `pages-extra.js → renderChaveiro()` | ✅ Funcional |
| `seguros` | `pages-monetize.js → renderSeguros()` | ✅ Funcional |
| `gps-tracking` | alias → `ultra-gps` | ✅ Funcional |
| `ultra-gps` | `ultra-gps.js → UltraGPS.render()` | ✅ Funcional |
| `financiamento` | `pages-monetize.js → renderFinanciamento()` | ✅ Funcional |
| `consorcio` | `pages-monetize.js → renderConsorcio()` | ✅ Funcional |
| `mecanico` | `pages-extra.js → renderMecanico()` | ✅ Funcional |
| `fretes` | `pages-extra.js → renderFrete()` | ✅ Funcional |
| `painel-anfitriao` | `rental-host.js → RentalHost.render()` | ✅ Funcional |
| `minhas-reservas` | `rental-guest.js → RentalGuest.render()` | ✅ Funcional |
| `painel-prestador` | `monetization.js → renderProviderDashboard()` | ✅ Funcional |
| `admin-aprovacao` | `admin-approval.js → AdminApproval.render()` | ⚠️ **Falta gestão de saques** |
| `notificacoes` | `notificacoes-page.js → NotificacoesPage.render()` | ✅ Funcional |
| `carteira` | `wallet-page.js → WalletPage.render()` | ✅ Funcional (prestador) |

---

## 5. RESUMO EXECUTIVO

| Categoria | Total | ✅ OK | ⚠️ Parcial | 🔴 Crítico |
|-----------|-------|-------|-----------|-----------|
| Rotas Auth | 9 | 9 | 0 | 0 |
| Rotas AI | 10 | 10 | 0 | 0 |
| Rotas Listings | 8 | 8 | 0 | 0 |
| Rotas Emergency | 14 | 12 | 2 | 0 |
| Rotas Monetization | 24 | 23 | 1 | 0 |
| Rotas Tracking | 4 | 3 | 1 | 0 |
| Rotas Vehicles | 6 | 6 | 0 | 0 |
| Rotas Notifications | 4 | 4 | 0 | 0 |
| Rotas Wallet | 6 | 5 | 0 | 1 |
| Rotas Rental | 22 | 18 | 2 | 2 |
| **TOTAL** | **107** | **98** | **6** | **3** |

**92% das rotas têm cobertura completa de frontend.**  
**Prioridade de correção:** Rental configs/available → wallet saque admin → emergência ativa admin.
