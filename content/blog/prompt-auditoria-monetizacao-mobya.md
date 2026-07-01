# Prompt — Auditoria Completa do Sistema de Monetização MOBYA

## Contexto para o agente auditor

Você vai auditar o sistema de monetização da MOBYA (marketplace automotivo com agentes de IA), composto por:

- **Backend** (`mobya-app-main`): Node.js/Express, Prisma/MySQL (Hostinger), deploy no Render.
  - `src/routes/monetization/*` (admin, commissions, dashboard, providers, quotes, simulators)
  - `src/services/monetization/*` (commission.service.js, mp-signature.service.js, provider.service.js)
  - `src/services/wallet.service.js`, `src/routes/wallet.routes.js`, `src/jobs/wallet-release.job.js`
  - `src/routes/emergency.routes.js`, `src/routes/emergency-payment.routes.js`
  - `prisma/schema.prisma`
- **Frontend** (`mobya-master`): consumindo as rotas acima via fetch/axios.

Já existe uma **rodada anterior de auditoria** com 10 achados, dos quais **5 patches já foram aplicados e mergeados**:

| # | Achado | Commit |
|---|--------|--------|
| 1+2+6 | Wallet rental + segurança de webhook (assinatura MP) + guard de cancelamento | `dc65686` |
| 3+4 | Idempotência do fluxo de emergência + dashboard consolidado | `bb5e5dd` |
| 5 | Correção dos testes de commission.service | (atual, sem commit dedicado) |

Os achados **7, 8, 9 e 10** ficaram catalogados como melhorias **não-críticas** para sprint futura:

- **#7** — artefato morto (código/rota não referenciado em uso real)
- **#8** — possibilidade de saque (`WithdrawalRequest`) ser marcado `PAID` em duplicidade
- **#9** — campos financeiros usando `Float` no Prisma schema em vez de `Decimal` (risco de erro de arredondamento em dinheiro)
- **#10** — referências/lógica de `LEAD_FEE` deixadas como backlog

## Objetivo desta auditoria

Faça uma **auditoria completa, de ponta a ponta**, do sistema de monetização da MOBYA, cobrindo:

### 1. Validação dos patches já aplicados
- Confirme que os fixes dos achados 1, 2, 3, 4, 5 e 6 estão de fato corretos no código atual (não apenas que existem, mas que cobrem o cenário de borda original).
- Para o guard de cancelamento e a segurança de webhook MP (`mp-signature.service.js`), valide explicitamente: rejeição de assinatura inválida/ausente, proteção contra replay, e tratamento de erro sem expor detalhes sensíveis.
- Para a idempotência do fluxo de emergência (`emergency-payment.routes.js`, `emergency.routes.js`), valide o ciclo completo: criação → PIX gerado → webhook de confirmação → reembolso, garantindo que retries não duplicam cobrança nem dupliquem crédito de carteira.

### 2. Fluxo de dinheiro ponta a ponta
Trace o dinheiro desde a origem até o destino final em cada um dos fluxos de monetização:
- Comissões de provider (`commission.service.js`, `commissions.routes.js`)
- Carteira dupla: `UserWalletTransaction` (pessoal) vs `MonetizationProvider` wallet (provider) — confirme que não há vazamento cruzado entre os dois.
- `wallet-release.job.js` — condições de liberação, race conditions entre job e requisições concorrentes de saque.
- Ciclo de saque (`withdraw` → `APPROVED`/`PAID`/`REJECTED`) — aprofunde o achado #8: existe alguma janela (admin duplo clique, retry de rede, falta de lock transacional) em que dois `PATCH /wallet/withdrawals/:id` concorrentes possam ambos resultar em `PAID` e duplo débito/reembolso?
- Dashboard consolidado (`dashboard.routes.js`) — os números exibidos batem com a soma real das transações no banco (sem contagem dupla, sem omissão de status)?

### 3. Integridade financeira de dados
- Reavalie o achado #9 (`Float` em campos monetários no `schema.prisma`: `price`, `walletBalance`, `walletPending`, `commissionAmount`, `estimatedAmount`, `estimatedCommission`, `value`, `cost`, `finalCost`, etc.) com exemplos concretos de cenários onde isso já causou (ou pode causar) discrepância de centavos, e proponha o plano de migração para `Decimal` com avaliação de impacto/risco em produção (Hostinger MySQL + Prisma no Termux).
- Verifique se há `parseFloat`/aritmética de ponto flutuante direta em JS no caminho de cálculo de comissão, saque ou troco — isso agrava o problema do schema.

### 4. Segurança e idempotência geral
- Audite **todas** as rotas de escrita financeira (`POST`/`PATCH`/`PUT` em `monetization/*`, `wallet.routes.js`, `emergency*.routes.js`) quanto a:
  - Autenticação e autorização corretas por papel (provider, admin, super_admin)
  - Idempotência (chave de idempotência ou constraint única) em toda operação que move saldo
  - Validação de input (valores negativos, amount=0, overflow, provider/wallet inexistente)
  - Transações Prisma atômicas (uso de `$transaction`) em qualquer operação multi-tabela de saldo

### 5. Achados pendentes (#7 e #10)
- **#7 (artefato morto)**: localize precisamente o código/rota/arquivo morto, confirme que não está referenciado em nenhum lugar do frontend (`mobya-master`) nem em integrações externas, e avalie se é seguro remover ou se deve ficar marcado como deprecated.
- **#10 (LEAD_FEE)**: confirme se ainda há vestígios de `LEAD_FEE` no schema, settings ou variáveis de ambiente do Render que ficaram órfãos, e se algum fluxo de monetização ainda espera essa lógica implicitamente.

### 6. Testes
- Avalie a suíte de testes de `commission.service.test.js` e `mp-signature.service.test.js`: cobertura real de casos de borda (valores fracionários, comissão zero, taxas múltiplas, assinatura malformada) — não apenas "passa".
- Aponte lacunas de teste para os fluxos de wallet, withdrawal e emergency payment, que hoje parecem não ter teste automatizado dedicado.

## Formato esperado da resposta

1. Tabela de achados novos (severidade: crítico/alto/médio/baixo, arquivo:linha, descrição, exploração/cenário de erro).
2. Para cada achado crítico/alto: patch script Python no padrão `str_replace` com guard "abort if not found", pronto para rodar no Termux.
3. Para achados médios/baixos: registrar como backlog, sem gerar patch ainda.
4. Resumo final em formato de tabela igual ao já usado nas rodadas anteriores (achado | commit/status).

## Observação de estilo
- Responda em português.
- Entregue arquivos completos prontos para copiar ou patch scripts — nunca diffs parciais.
- Assuma ambiente Termux (Android), sem acesso a terminal Linux completo, deploy no Render, banco MySQL no Hostinger.
