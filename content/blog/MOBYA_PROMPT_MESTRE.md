# 🏎️ MOBYA — PROMPT MESTRE DE AUDITORIA & CORREÇÃO
**Data:** 25/06/2026 | **Repositórios:** `mobya-master` (frontend) · `mobya-app-main` (backend)

---

## CONTEXTO GERAL

Você é um engenheiro sênior full-stack trabalhando no Mobya, marketplace automotivo brasileiro (SPA vanilla JS + Node/Express/Prisma/MySQL). Seu objetivo é resolver TODOS os itens abaixo em um único ciclo de patches. Use Python patch scripts com saída `[OK]/[SKIP]/[ERRO]` e substituições idempotentes `old_str / new_str`.

---

## MAPA COMPLETO DE PROBLEMAS E SOLUÇÕES

---

### 1. 🚗 COMPRAR CARRO — Retro interno

**Status atual:** O card "Comprar Carro" em `home-premium.js` (linha 241) navega para `classificados`, que chama `Pages.renderClassificados()`. O problema é interno — o título da seção usa texto "retro" sem contexto moderno.

**Arquivo:** `mobya-master/js/pages.js`

**Ação:** Audite `renderClassificados()` — verifique se o `pageHeader` usa terminologia adequada e se os filtros de `type` incluem todos os valores do backend (`VEHICLE`, `PART`, `SERVICE`, `INSURANCE`, `FINANCING`). Se algum `API.listings.search()` ou `API.listings.getAll()` estiver retornando 500, adicione tratamento de erro com mensagem amigável e fallback de estado vazio.

**Correção mínima se o erro for de rota:**
```javascript
// app.js — garantir que 'comprar-carro' redirecione para classificados
'comprar-carro': () => Pages.renderClassificados(),
```

---

### 2. 🔧 MECÂNICO — Calcular antes de acionar o GPS ✅ (já implementado)

**Status atual:** `PagesExtra._solicitarServico()` já captura GPS, calcula taxa base + deslocamento e exibe cotação no modal ANTES de acionar a emergência. Fluxo correto.

**Ação:** ✅ Nenhuma alteração necessária. Apenas confirmar que `renderMecanico()` em `pages-extra.js` (linha 315) chama `_solicitarServico` com os parâmetros corretos (`taxaBase`, `taxaKm`, `comissao`, `emergencyType: 'MECHANIC'`).

---

### 3. 🚛 REBOQUE — Calcular antes de acionar o GPS ✅ (já implementado)

**Status atual:** `renderReboque()` (linha 14) usa o mesmo `_solicitarServico` — cotação + GPS já funcionam.

**Ação:** ✅ Confirmar fluxo. Nenhuma alteração necessária.

---

### 4. 🔑 CHAVEIRO — Calcular antes de acionar o GPS ✅ (já implementado)

**Status atual:** `renderChaveiro()` (linha 112) usa o mesmo padrão. Correto.

**Ação:** ✅ Confirmar fluxo. Nenhuma alteração necessária.

---

### 5. 📦 FRETE — Solicitar cotação ✅ ou Calcular + GPS?

**Status atual:** `renderFrete()` em `pages-extra.js` exibe formulário (origem, destino, tipo, peso) com botão "SOLICITAR COTAÇÃO" que chama `PagesExtra.cotarFrete()`. É uma cotação por formulário, sem GPS em tempo real — adequado para frete porque não é emergência localizada.

**Ação:** Manter como cotação por formulário. Garantir que `cotarFrete()` envie para o endpoint `/monetization/quotes` com `type: 'FREIGHT'` e exiba resultado. Se o botão não fechar/navegar após envio, adicionar:
```javascript
// Após sucesso da cotação de frete:
App.toast('📦 Cotação enviada! Transportadora entrará em contato.', 'ok');
```
**Não** adicionar GPS ao frete — logística de carga é agendada, não emergência.

---

### 6. 🛡️ SEGURO — ✅ OK

**Ação:** Nenhuma alteração.

---

### 7. 💰 FINANCIAMENTO — ✅ OK

**Ação:** Nenhuma alteração.

---

### 8. 🤝 CONSÓRCIO — ✅ OK

**Ação:** Nenhuma alteração.

---

### 9. 💬 CHAT DE IA — Confirmar dispatch ao prestador correto + cotação + GPS Uber-style

**Status atual:** `chat.js` e `home-chat.js` já detectam intenção via `chatActions.js` no backend (`ai.routes.js`). Quando `r.data.action === 'DISPATCH_EMERGENCY'`, o chat já: (a) exibe o provider no `#chatProvider`, (b) renderiza card com botão `App.navigate('ultra-gps')`. 

**Problema real:** O chat NÃO abre o GPS automaticamente — apenas mostra botão. Para fluxo Uber real, o GPS deve abrir automaticamente após dispatch confirmado.

**Arquivo:** `mobya-master/js/chat.js` e `mobya-master/js/home-chat.js`

**Correção:** Após detectar `action === 'DISPATCH_EMERGENCY'` com `sessionId` confirmado, navegar automaticamente:

```javascript
// Em chat.js — dentro do bloco que trata DISPATCH_EMERGENCY
// Após renderizar o card de acompanhamento:
if (r.data.action === 'DISPATCH_EMERGENCY' && r.data.sessionId) {
  window.__mobyaPendingEmergencyId = r.data.sessionId;
  setTimeout(() => App.navigate('ultra-gps'), 1800); // 1.8s para o usuário ler o card
}
```

Aplicar o mesmo em `home-chat.js` no bloco equivalente.

**Verificar em `chatActions.js`** (backend `src/services/chatActions.js`): confirmar que as ações `REBOQUE`, `MECANICO`, `CHAVEIRO` retornam `{ action: 'DISPATCH_EMERGENCY', sessionId, provider }` para o frontend usar.

---

### 10. 📊 DASHBOARD — ✅ OK

**Ação:** Nenhuma alteração.

---

### 11. 🚙 MINHA GARAGEM — ✅ OK

**Ação:** Nenhuma alteração.

---

### 12. 💳 CARTEIRA — ✅ OK

**Ação:** Nenhuma alteração.

---

### 13. 🏠 PAINEL ANFITRIÃO — Aba "Reservas" com ERRO INTERNO

**Root cause identificado:** A rota `GET /rental/bookings/host` faz `include: { config: { include: { listing: ... } } }` mas a migration `20260624_rental_checkin_renter_confirmation` pode ainda não ter sido aplicada no banco de produção (Render). Se `renterCheckinConfirmedAt` não existe na tabela, qualquer query no model `RentalBooking` falha com erro de coluna desconhecida do Prisma.

**Diagnóstico:** Checar logs do Render. O erro provável é:
```
PrismaClientKnownRequestError: Unknown column 'renterCheckinConfirmedAt'
```

**Correção backend — passo obrigatório:**
```bash
# No Render Shell ou via CI:
npx prisma migrate deploy
```

**Correção de resiliência no frontend** `mobya-master/js/rental-host.js`:

```javascript
// Substituir o catch atual (linha ~117):
// OLD:
}catch(e){setError('rh-content',e?.message||'Erro ao carregar reservas');}

// NEW — mensagem mais informativa + botão de retry:
} catch(e) {
  const el = document.getElementById('rh-content');
  if (el) el.innerHTML = `
    <div style="text-align:center;padding:48px;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:12px">⚠️</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:.78rem;margin-bottom:16px;color:#ef4444">
        ${e?.message || 'Erro ao carregar reservas'}
      </div>
      <button onclick="RentalHost._loadTab()" style="background:linear-gradient(135deg,var(--neon),var(--q3));color:#000;border:none;border-radius:8px;padding:10px 22px;font-weight:700;font-size:.82rem;cursor:pointer">
        🔄 Tentar novamente
      </button>
    </div>`;
}
```

---

### 14. 📋 MINHAS RESERVAS (Locatário) — ERRO INTERNO

**Root cause:** Idêntico ao item 13. A rota `GET /rental/bookings/mine` falha pela mesma migration não aplicada.

**Correção:** Mesmo `npx prisma migrate deploy` resolve.

**Correção de resiliência no frontend** `mobya-master/js/rental-guest.js`:

```javascript
// No catch do _loadBookings / render (linha ~56+):
// Substituir o catch genérico por:
} catch(e) {
  const el = document.getElementById('rg-content') || document.getElementById('main');
  if (el) el.innerHTML = `
    <div style="text-align:center;padding:48px;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:12px">⚠️</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:.78rem;margin-bottom:16px;color:#ef4444">
        ${e?.message || 'Erro ao carregar suas reservas'}
      </div>
      <button onclick="RentalGuest.render()" style="background:linear-gradient(135deg,var(--neon),var(--q3));color:#000;border:none;border-radius:8px;padding:10px 22px;font-weight:700;font-size:.82rem;cursor:pointer">
        🔄 Tentar novamente
      </button>
    </div>`;
}
```

---

### 15. 🔔 NOTIFICAÇÕES — ✅ OK

**Ação:** Nenhuma alteração.

---

### 16. 🗺️ GPS — Aba "Prestadores" com zoom infinito / localizando sem parar

**Root cause:** Em `ultra-gps.js`, quando o usuário está na aba "Prestadores" (modo `discover`) e **não tem sessão ativa**, o `watchPosition` (linha 256) ainda está rodando. Toda vez que o GPS emite uma posição nova e `myRole` é `null` (sem sessão), executa:
```javascript
map.easeTo({center:[lng,lat],zoom:16,duration:400});
```
Este `easeTo` dispara o evento `moveend` do mapa que pode re-triggerar o `_scheduleNearbyRefresh` (linha 116), causando o loop visual de zoom + relocalizando prestadores.

**Arquivo:** `mobya-master/js/ultra-gps.js`

**Correção 1 — Parar o easeTo quando em modo discover (sem sessão):**

```javascript
// Linha ~260 — substituir o bloco dentro de watchPosition:
// OLD:
if(myRole){ updateMarker(myRole,lat,lng,'Você'); } else { _pendingPos={lat,lng}; map&&map.easeTo({center:[lng,lat],zoom:16,duration:400}); }

// NEW:
if(myRole){
  updateMarker(myRole,lat,lng,'Você');
} else {
  _pendingPos={lat,lng};
  // Só recentra no modo tracking — no discover o usuário controla o mapa
  if(mode==='tracking') map&&map.easeTo({center:[lng,lat],zoom:16,duration:400});
}
```

**Correção 2 — Evitar re-trigger do nearby no moveend:**

```javascript
// Linha ~116 — adicionar debounce de modo:
// OLD:
function _scheduleNearbyRefresh(){ if(mode!=='discover')return; clearTimeout(_nearbyDebounce); _nearbyDebounce=setTimeout(()=>_loadNearbyReal(50),600); }

// NEW:
function _scheduleNearbyRefresh(){
  if(mode!=='discover')return;
  clearTimeout(_nearbyDebounce);
  // 3 segundos de debounce para evitar loop quando o usuário/GPS reposiciona o mapa
  _nearbyDebounce=setTimeout(()=>_loadNearbyReal(50),3000);
}
```

**Correção 3 — Não disparar `_scheduleNearbyRefresh` de easeTo programático:**
Adicionar flag `_suppressMoveRefresh` ao redor dos `easeTo` automáticos:

```javascript
// Toda vez que o código fizer easeTo interno (não pelo usuário), fazer:
_suppressMoveRefresh = true;
map.easeTo({center:[pos.lng,pos.lat],zoom:13,duration:800});
setTimeout(()=>{ _suppressMoveRefresh=false; }, 1000);

// E no _scheduleNearbyRefresh:
function _scheduleNearbyRefresh(){
  if(mode!=='discover' || _suppressMoveRefresh)return;
  clearTimeout(_nearbyDebounce);
  _nearbyDebounce=setTimeout(()=>_loadNearbyReal(50),3000);
}
```

Declarar `let _suppressMoveRefresh=false;` junto com as outras variáveis de estado no topo do módulo (linha ~20).

---

### 17. 🧮 CALCULADORA — ✅ OK

**Ação:** Nenhuma alteração.

---

### 18. 📋 VISTORIA E LAUDO — ✅ OK

**Ação:** Nenhuma alteração.

---

### 19. 📄 DOCUMENTAÇÃO — ✅ OK

**Ação:** Nenhuma alteração.

---

### 20. ❌ REMOVER "Seja um Parceiro" do menu lateral

**Local:** `mobya-master/index.html` linha 106

```html
<!-- REMOVER esta linha: -->
<div class="sb-item" data-page="monetizacao">🤝 Seja um Parceiro</div>
```

**Ação:** Deletar essa linha do sidebar. A entrada de parceiros deve ser feita por convite/onboarding interno, não por opção pública no menu.

---

### 21. ❌ REMOVER "Comissão MOBYA: 10%–22%" dos cards + Criar gatilhos mentais

#### 21a. Remover percentuais expostos dos cards de parceiros

**Arquivo:** `mobya-master/js/monetization.js`

**Localizar e remover/substituir todas as ocorrências de exibição pública de taxas:**

```javascript
// OLD (linha ~167):
Comissão MOBYA: ${v.rate}

// NEW — não exibir taxa no card público:
// (remover essa linha do template do card)
```

```javascript
// OLD (linha ~64):
rate: '10%–22%',

// Manter no objeto de dados interno, mas NÃO renderizar no card do cliente
```

#### 21b. Substituir por gatilhos mentais de conversão

Nos cards de serviço onde aparecia a taxa, substituir por um dos seguintes gatilhos (escolha conforme contexto):

| Contexto | Gatilho Mental |
|---|---|
| Cards de seguro | `🏆 Cotação em segundos · Sem burocracia` |
| Cards de financiamento | `⚡ Aprovação rápida · Melhores taxas do mercado` |
| Cards de mecânico/reboque | `🛡️ Prestadores verificados · Garantia de serviço` |
| Cards gerais de parceiro | `✅ Parceiro certificado MOBYA · Atendimento premium` |

**Template sugerido para substituição nos cards:**

```javascript
// No lugar de "Comissão MOBYA: ${v.rate}" usar:
`<div style="font-size:.72rem;color:var(--green);margin-top:4px">
  ✅ Parceiro Verificado · Sem taxa extra para você
</div>`
```

#### 21c. Manter taxas apenas no Dashboard Admin/Provider (não no card público)

A linha em `pages-monetize.js` (linha ~538) que exibe `Comissão MOBYA` dentro do painel financeiro do próprio prestador pode ser **mantida** — é informação legítima para o parceiro. Remover somente das visualizações de cliente/card público.

---

## ORDEM DE EXECUÇÃO

```
1. Backend (Render):
   npx prisma migrate deploy
   → resolve itens 13 e 14 (Reservas Host + Locatário)

2. Frontend mobya-master:
   Patch 1: ultra-gps.js — correção zoom loop (item 16)
   Patch 2: chat.js + home-chat.js — auto-navigate GPS após dispatch (item 9)
   Patch 3: rental-host.js — catch com retry button (item 13 resiliência)
   Patch 4: rental-guest.js — catch com retry button (item 14 resiliência)
   Patch 5: index.html — remover "Seja um Parceiro" do sidebar (item 20)
   Patch 6: monetization.js — remover taxas dos cards públicos (item 21)
   Patch 7: app.js — adicionar rota 'comprar-carro' → classificados (item 1)

3. Testes manuais:
   □ GPS aba Prestadores: zoom para de fazer loop?
   □ Painel Anfitrião: aba Reservas carrega sem erro?
   □ Minhas Reservas: carrega sem erro?
   □ Chat: acionar reboque abre GPS automaticamente?
   □ Sidebar: "Seja um Parceiro" sumiu?
   □ Cards de serviço: taxas Mobya não aparecem mais para o cliente?
```

---

## NOTAS CRÍTICAS

- **NÃO altere** as rotas de backend de Reservas (`/rental/bookings/mine` e `/bookings/host`) — o código está correto, o problema é só a migration pendente.
- **NÃO remova** a comissão dos relatórios internos do prestador — apenas dos cards voltados ao cliente.
- O frete deve continuar como cotação por formulário — NÃO adicionar GPS em tempo real.
- O patch do GPS (item 16) é o mais delicado — teste em device real com GPS ativo após aplicar.
