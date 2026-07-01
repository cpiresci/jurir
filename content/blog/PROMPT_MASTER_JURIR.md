# PROMPT MASTER — Jurir (jurir-app + jurir-main)
## Contexto para nova conversa

Sou desenvolvedor solo brasileiro, trabalho via Termux no Android.
Todos os patches são aplicados como `python3 $TMPDIR/p.py` ou `python3 /storage/emulated/0/Download/patch.py`.

---

## Stack

**Backend:** `~/jurir-app` — Node.js/Express/Prisma 5/MySQL, ESM (`"type":"module"`), deploy no Render (free tier, `jurir-app-y4gz.onrender.com`), branch `main`.

**Frontend:** `~/jurir` — React 18 + Vite + Zustand + HashRouter, deploy GitHub Pages em `jurir.com`, branch `main`.

**Banco:** MySQL no Hostinger (`srv1183.hstgr.io`, db: `u141559654_jusaii`). Migrations via `runMigrations(prisma)` chamado no startup do `server.js`.

**Providers LLM (ordem de fallback):** SambaNova → Cerebras → Gemini → OpenRouter. Todas as keys estão no Render Environment.

---

## O que foi feito nesta sessão (28/06/2026)

### Backend (jurir-app)

**Commits pushados:**
- `d58a64b` — integração completa dos blocos 10/12/14/15 no `legalEngine.js` + `server.js` com bootstrap async (migrations + observability no startup)
- `b02e7f9` — `plan_expires_at` adicionado ao `userToDict`, `/verify/:serial` implementado em `misc.js`
- `907e37b` — timeout RAG 5s por agente, RetryBudget 80/120s, reset de circuitos entre lotes, fallback provider order `['sambanova','cerebras','gemini','openrouter']`
- **PENDING (não pushado ainda):** `fix(swarm): vazio nao abre circuit, MAX_EMPTY=1, sleep extra lote parcial` — patch aplicado localmente em `llmManager.js` e `swarmEngine.js`, aguardando commit/push

### Frontend (jurir)
- `9308549` — URL checkout corrigida: `/api/create-checkout-session` → `/api/billing/create-checkout-session`

### Migrations criadas e rodando em produção (16/16 ✓)
Tabelas criadas automaticamente no startup:
- `analysis_jobs`, `agent_checkpoints`, `process_monitoring`, `jurir_metrics_log`
- `jurir_memory_entries`, `jurir_user_preferences`

---

## Estado atual dos blocos de migração (Python → Node.js)

Todos os 16 blocos portados e integrados. Módulos ativos:
- `geoEngine.js` — detecção TJ por estado/texto
- `legalDataEngine.js` — RSS STJ/STF
- `datajudEngine.js` — estatísticas de tribunal
- `legislationRagEngine.js` — RAG Qdrant (JURIR_RAG_DISABLED=true no Render, sem Qdrant configurado)
- `memoryEngine.js` — memória jurídica por usuário
- `strategicAgent.js` — 16º agente estrategista
- `convergenceEngine.js` — detecção de conflitos entre agentes
- `jurirScoreDimensional.js` — score dimensional v1.0
- `jurirObservability.js` — flush a cada 300s para MySQL

---

## Problema pendente (CRÍTICO)

**Análises SSE premium travando.** O swarm dos 16 agentes inicia normalmente mas trava antes de completar.

**Diagnóstico confirmado nos logs do Render:**
- SambaNova dá 429 constante → circuit OPEN → fallback para Cerebras
- Cerebras retorna `HTTP 200 conteúdo vazio` × 2 → `recordFailure()` → circuit OPEN
- Gemini e OpenRouter ficam sem RetryBudget → trava
- Teste via curl mostrou agentes passando (civil, penal, trabalhista, família, consumidor, tributário, empresarial, imobiliário, digital, previdenciário, ambiental, constitucional) mas **frontend SSE pode estar travado separadamente**

**Patches aplicados mas não confirmados em produção:**
1. Conteúdo vazio NÃO abre circuit breaker (só penaliza health score)
2. `MAX_EMPTY_RETRIES=1` (desiste rápido do vazio → fallback imediato)
3. `EXTRA_SLEEP` dobrado entre lotes: `{0:2000, 2:3000, 4:4000, 6:4000}` ms
4. Sleep extra 5s quando lote parcialmente vazio

**Env vars configuradas no Render para tuning:**
```
JURIR_RAG_DISABLED=true
CIRCUIT_COOLDOWN_SEC=30
MAX_429_RETRIES=2
RPM_SAMBANOVA=10
RPM_CEREBRAS=15
LLM_CONCURRENCY=1
```

**Próximo passo imediato:** fazer commit/push do patch pendente e testar análise completa via frontend (`jurir.com`) para confirmar se o SSE chega até `saved` ou trava antes do veredito.

---

## Credenciais de teste

- Usuário: `pirescl002@gmail.com` / `Clei1234` (conta admin, revogar após testes)
- Backend health: `https://jurir-app-y4gz.onrender.com/health`
- Frontend: `https://jurir.com`

---

## Arquitetura do SSE (useSSEAnalysis.js)

Eventos esperados em ordem:
`start` → `agent_start` (×16) → `agent_done` (×16) → `devil_start` → `devil_done` → `judge_thinking` → `verdict` → `score` → `saved`

Se o frontend travar, verificar:
1. Se o evento `saved` chega (swarmEngine.js linha ~295: `yield { type: 'saved', analysis_id: record.id }`)
2. Se `setRunning(false)` é chamado (só dispara no `saved` ou no `finally`)
3. Se o `analysis_id` chega no frontend para habilitar o botão de PDF

---

## Estrutura de arquivos críticos

```
jurir-app/src/
  server.js          — bootstrap async (migrations + observability)
  app.js             — Express + rotas montadas
  core/
    legalEngine.js   — motor v3.0 (976 linhas)
    llmManager.js    — providers + circuit breaker (660 linhas)
    migratePlans.js  — 16 migrations (297 linhas)
    database.js      — Prisma client + userToDict
    config.js        — env vars
    security.js      — JWT + getCurrentUser
  swarm/
    swarmEngine.js   — SSE generator + checkpoints (367 linhas)
    geoEngine.js, legalDataEngine.js, datajudEngine.js
    legislationRagEngine.js, memoryEngine.js
    strategicAgent.js, convergenceEngine.js
    jurirScoreDimensional.js, jurirObservability.js
    pdfService.js, petitionGenerator.js, monitoringService.js
    instanceSimulator.js, deltaAnalysis.js, docprocessorEngine.js
  routes/
    analysis.js, analyses.js, auth.js, billing.js
    account.js, org.js, apikeys.js, webhooks.js
    delta.js, admin.js, misc.js

jurir/src/
  hooks/useSSEAnalysis.js  — consumidor SSE
  lib/api.js               — cliente HTTP
  lib/constants.js         — API_BASE
  store.js                 — Zustand store
```
