# PROMPT DE CONTINUAÇÃO — JURIR (estado: 28/06/2026)

## Status geral

Migração backend Python/FastAPI → Node.js/Express **completa e em produção**.
Frontend React apontando para o novo backend. Sistema operacional.

---

## Repositórios e URLs

| Item | Valor |
|---|---|
| Backend repo | https://github.com/cpiresci/jurir-app (privado) |
| Backend URL (Render) | https://jurir-app-y4gz.onrender.com |
| Frontend repo | https://github.com/cpiresci/jurir (privado) — clone local: `~/jurir` |
| Frontend URL | https://jurir.com (GitHub Pages) |
| Clone backend local | `~/jurir-app` |
| Banco de dados | MySQL — Hostinger, banco `u141559654_jusaii` |

---

## Stack backend (jurir-app)

- **Runtime:** Node.js v24 (`"type": "module"` — ESM puro)
- **Framework:** Express
- **ORM:** Prisma v5 (`relationMode = "prisma"`, sem `migrate deploy`)
- **Deploy:** Render free tier (spin-down em inatividade)
- **Email:** Resend
- **Pagamentos:** Stripe
- **PDF/Docs:** pdf-lib, pdf-parse, mammoth, docx
- **LLM cascade:** SambaNova → Cerebras → Gemini → OpenRouter (`src/core/llmManager.js`)
- **RAG:** Qdrant Cloud — `embeddingProvider.js` usa Voyage AI (`voyage-law-2`) com fallback TF-IDF

### Dependências npm (package.json)
```
@prisma/client, bcryptjs, cors, docx, dotenv, express,
fast-xml-parser, jsonwebtoken, mammoth, pdf-lib, pdf-parse,
resend, stripe, uuid
```

### Convenções obrigatórias
- `node --check` antes de todo commit
- Tabelas novas via SQL direto no phpMyAdmin (nunca `prisma migrate deploy`)
- Patches via `cp /storage/emulated/0/Download/<arquivo> ~/jurir-app/src/...`
- Desenvolvimento via Termux no Android

---

## Estrutura completa src/

```
src/
├── server.js                    ← entry point: node src/server.js
├── app.js                       ← Express + todos os routers registrados
├── core/
│   ├── config.js                ← variáveis de ambiente + export logger
│   ├── database.js              ← Prisma client, userToDict, isEscritorio, isUnlimited...
│   ├── security.js              ← JWT, getCurrentUser, requireAdmin, checkRateLimit
│   ├── email.js                 ← Resend (sendWelcome, sendReset...)
│   ├── llmManager.js            ← cascade SambaNova→Cerebras→Gemini→OpenRouter
│   ├── legalEngine.js           ← chamadas LLM básicas
│   ├── legalPrompts.js          ← templates de prompts jurídicos
│   ├── jobs.js                  ← fila in-memory de jobs (jobGet, jobSet...)
│   ├── rateLimit.js             ← rate limiting por IP/user
│   ├── migratePlans.js          ← migração idempotente de planos no startup
│   └── webhooks.js              ← handlers Stripe webhook
├── routes/
│   ├── auth.js                  ← /api/auth/* (register, login, forgot, reset)
│   ├── account.js               ← /api/account/*
│   ├── analyses.js              ← /api/analyses, /api/analysis/:id, /api/report/*
│   ├── analysis.js              ← /api/analyze, /api/job/* (SSE streaming premium)
│   ├── apikeys.js               ← /api/keys/*
│   ├── billing.js               ← /api/billing/*
│   ├── org.js                   ← /api/org/*
│   ├── webhooks.js              ← /api/webhooks/* (Stripe)
│   ├── admin.js                 ← /api/admin/* (stats, users, planos, créditos, ban, financeiro, logs)
│   ├── delta.js                 ← /api/analyze/delta/* (requer plano Solo+/isUnlimited)
│   └── misc.js                  ← /ping, /wake, /health, /api/health, /, /verify/:serial
└── swarm/
    ├── swarmEngine.js           ← orquestrador principal (createAnalysisJob, runPremiumJobStream, getJobResult)
    ├── legalEngine.js           ← agente LLM jurídico genérico
    ├── strategicAgent.js        ← agente estratégico
    ├── convergenceEngine.js     ← motor de convergência de agentes
    ├── deltaAnalysis.js         ← diff semântico de documentos (ESM export)
    ├── embeddingProvider.js     ← Voyage AI voyage-law-2 ou TF-IDF fallback
    ├── legislationRagEngine.js  ← RAG de legislação via Qdrant Cloud
    ├── memoryEngine.js          ← memória por usuário via Qdrant Cloud
    ├── geoEngine.js             ← detecção de tribunal por IP/geo
    ├── datajudEngine.js         ← consulta DataJud (CNJ)
    ├── jurisfeedEngine.js       ← RSS STF/STJ/TST/CNJ/Jusbrasil
    ├── legalDataEngine.js       ← dados jurídicos estruturados
    ├── jurirScoreDimensional.js ← score dimensional de análise
    ├── instanceSimulator.js     ← simulação de instâncias processuais
    ├── monitoringService.js     ← monitoramento de processos
    ├── jurirObservability.js    ← observabilidade do sistema
    ├── docprocessorEngine.js    ← extração PDF (pdf-parse) + DOCX (mammoth)
    ├── pdfService.js            ← geração PDF (pdf-lib)
    ├── petitionGenerator.js     ← geração de petições (docx)
    └── reportProduct.js         ← relatórios premium
```

---

## Prisma schema — modelos

```
User, Analysis, Payment, Organization, OrgMember,
InviteToken, ApiKey, Webhook, AnalysisJob, AgentCheckpoint
```

---

## Histórico de commits da migração (sessão 28/06)

```
430d583  [jurir frontend] fix: API_BASE → jurir-app-y4gz.onrender.com
7ee2213  fix: deltaAnalysis.js module.exports → ESM export
44a49a0  fix: remove import duplicado getUserTribunal em analysis.js
06f74a1  fix: imports + use() admin/delta/misc em app.js
ea2bea9  fix: export logger em config.js
0dc7762  feat: routes admin.js + delta.js + misc.js — migração completa de routers
8ee1db1  fix: bloco 12 — embeddingProvider (Voyage AI + TF-IDF fallback)
5f39de0  feat: bloco 11 — reportProduct.js + pdfService.js (pdf-lib)
902dd71  feat: bloco 16d — legalDataEngine.js
(+ blocos 1–16b/c anteriores: auth, billing, swarm completo, geo, análises, etc.)
```

---

## Frontend (jurir — React/Vite)

- **Clone local:** `~/jurir`
- **Stack:** React 18 + Vite + Tailwind + Capacitor 6 (Android)
- **Deploy:** GitHub Pages via GitHub Actions
- **API base:** `https://jurir-app-y4gz.onrender.com` ✅ (atualizado)
- **Arquivo:** `src/lib/constants.js`

### Páginas
Home, Conta, Admin, ApiPanel, Checkout, CheckoutSuccess, CheckoutCancel,
Delta, Documentos, Escritorio, Historico, Monitoramento, Peticoes,
Simulador, Verificar, AceitarConvite, PrivacidadePage

---

## Variáveis de ambiente no Render

### Já configuradas (LLM cascade funcional)
`SAMBANOVA_API_KEY`, `CEREBRAS_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`,
`DATABASE_URL`, `SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`RESEND_API_KEY`, `FRONTEND_URL`, `ADMIN_EMAIL`

### Pendentes (RAG semântico)
| Variável | Descrição |
|---|---|
| `VOYAGE_API_KEY` | voyageai.com — free tier 200M tokens/mês |
| `VOYAGE_MODEL` | `voyage-law-2` (já é o default no código) |
| `QDRANT_URL` | URL do cluster Qdrant Cloud |
| `QDRANT_API_KEY` | chave Qdrant Cloud |
| `JURIR_RAG_DISABLED` | `false` |
| `JURIR_RAG_WARMUP` | `true` |

Sem essas vars o sistema funciona normalmente com fallback TF-IDF nos embeddings.

---

## Pendências conhecidas

1. **Configurar Qdrant + Voyage no Render** — para ativar RAG semântico real
2. **Testar fluxo completo** — login → análise premium SSE → relatório PDF
3. **Android APK** — rebuild via GitHub Actions se necessário após mudança de API_BASE
4. **Monitorar primeiro restart do Render** — free tier faz spin-down; primeiro wake demora ~50s
