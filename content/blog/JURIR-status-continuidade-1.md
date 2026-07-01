# JURIR — Status e continuidade (30/06/2026, sessão 2)

Estou desenvolvendo o JURIR (plataforma de análise jurídica por IA) 100% via Termux
no Android, sem desktop. Dois repos: `~/jurir-app` (backend Node/Express/Prisma,
deploy no Render) e `~/jurir` ou `~/jurir-main` (frontend, GitHub Pages + APK via
GitHub Actions). Workflow: scripts de patch em Python com `assert src.count(old)==1`,
colados via heredoc ou baixados pro Termux em `/storage/emulated/0/Download/`,
validados com `node --check`, commitados e pushados com `git push origin main main:master`.

## Recém-concluído (sessão anterior, 30/06 manhã/tarde)

1. RAG de legislação com citações verificáveis (Qdrant Cloud + Voyage AI, fallback
   TF-IDF) — deployado.
2. Auto-heal de mismatch de dimensão Voyage(1024)/TF-IDF(128) em
   `legislationRagEngine.js`. Commit `6a09035`.
3. Score dimensional ligado de verdade no fluxo Premium (`swarmEngine.js` →
   `calculateDimensionalScore()`, chave `scoreDimensional` → `dimensions`).
   Commit `d4bda19`.

## Recém-concluído (esta sessão, 30/06 noite) — os 3 bugs catalogados do relatório #238

Todos commitados e pushados (`main` + `master` no GitHub, deploy automático no Render).

1. **Bug #1 — Citações ausentes no PDF.** `pdfService.js` nunca tinha referência a
   `citations`; a seção "Fontes Citadas" só existia em `VerdictSection.jsx` (web).
   Adicionada `buildCitations()`, chamada logo após `buildVerdict()`, espelhando o
   `CitationChips` do frontend (diploma + artigo como título, texto como corpo, url
   como link). Commit `6249515`.

2. **Bug #4 — Encoding quebrado no PDF (cosmético).** `sanitizeForPdf()` convertia
   qualquer caractere fora de WinAnsi pra `?`, incluindo os separadores `━━━`/`────`
   usados nos prompts e ecoados pelo LLM no veredito (viravam `?????`). Corrigido:
   toda a faixa Unicode de box-drawing (U+2500–U+257F) agora vira `-` antes do
   catch-all. Commit `6249515` (mesmo commit do bug #1).

3. **Bug #3 — Agentes fora de escopo alucinando.** Causa raiz identificada: agentes
   não-críticos não tinham NENHUMA instrução de escopo, e os 5 críticos
   (`penal`, `tributario`, `empresarial`, `imobiliario`, `ambiental`) eram
   explicitamente instruídos pela `VETO_INSTRUCTION` a "analisar impactos indiretos
   e concluir normalmente" mesmo fora da área — o prompt PROIBIA a recusa. Além
   disso, a confiança fabricada (85-92%) de agentes irrelevantes entrava direto no
   peso do JURIR Score e das dimensões, sem nenhum filtro. Corrigido em 4 arquivos:
   - `legalPrompts.js`: novo **Gate de Relevância** (PT/EN/ES) injetado em TODOS os
     16 agentes via `buildPt/buildEn/buildEs`. Se o caso não tem relação real com a
     área, o agente responde só `FORA-DE-ESCOPO::motivo` e para. Frase contraditória
     da VETO_INSTRUCTION removida.
   - `legalEngine.js`: `extractOutOfScope()` (espelha `extractVeto()`), `isValid()`
     trata a recusa curta como válida (não entra em loop de retry no guardião),
     `makeAgentResult()` ganhou campos `outOfScope`/`outOfScopeReason`,
     `calculateJurirScore()` pula esses agentes no peso (confidence forçada a 0).
   - `jurirScoreDimensional.js`: `isValidResult()` exclui agentes `outOfScope` de
     TODAS as dimensões (viabilidade, risco, complexidade, urgência).
   - `pdfService.js`: agente `outOfScope` vira linha compacta cinza "FORA DE
     ESCOPO" no PDF em vez do card completo com confiança.
   Commit `a9d080d` (4 files changed, 120 insertions, 11 deletions).

   ⚠️ Não consegui rodar um teste funcional de verdade nesta sessão (sandbox sem
   acesso de rede pra instalar `pdf-lib`/rodar Prisma) — validei só por `node --check`
   + revisão manual linha a linha + teste isolado do `legalPrompts.js` (sem deps de
   DB, confirma que os 16 agentes têm o gate e a frase contraditória sumiu).

## Pendente — teste end-to-end de TUDO isso junto

Preciso rodar uma análise premium **nova** (não reaproveitar a #238) e conferir:
- [ ] Score dimensional aparece preenchido no card do app **e** no PDF baixado.
- [ ] Chips de citação aparecem na tela do veredito **e** agora também no PDF
      baixado (seção "FONTES CITADAS — LEGISLAÇÃO APLICÁVEL").
- [ ] Separadores no veredito do PDF aparecem como `-------` em vez de `?????`.
- [ ] Num caso de área restrita (ex: guarda de filhos), agentes irrelevantes
      (Eleitoral, Agrário, Internacional, Tributário, Imobiliário, Consumidor,
      Saúde) aparecem como linha compacta "FORA DE ESCOPO" — não mais pareceres
      extensos com 85-92% de confiança e jurisprudência fabricada.
- [ ] O JURIR Score não cai/infla artificialmente por causa desses agentes.
- [ ] Conferir se o agente Trabalhista ainda devolve recusa crua da IA
      (`"I'm sorry, but I can't help with that."`) — existe um guardião
      (`guardianEnsureCompleteness` + `FAIL_PREFIXES` + retry) que parece cobrir
      esse caso, mas não foi confirmado com um teste real desde que isso foi
      catalogado.

## Bugs catalogados, ainda NÃO corrigidos

(Nenhum dos 4 bugs originais do relatório #238 ficou pendente — os 3 reais foram
corrigidos nesta sessão. O "bug #2", recusa crua do Trabalhista, pode já estar
coberto pelo guardião existente; só falta confirmar com teste real, ver item acima.)

## Arquivos-chave

- Backend: `~/jurir-app/src/swarm/swarmEngine.js` (orquestração premium),
  `legislationRagEngine.js` (RAG), `jurirScoreDimensional.js` (score 4D, agora com
  exclusão de agentes outOfScope), `pdfService.js` (gerador de PDF, agora com
  `buildCitations()` e renderização especial pra outOfScope), `legalEngine.js`
  (runAgent/runJudge/runDevilAdvocate, AGENT_CONFIGS, extractVeto/extractOutOfScope),
  `legalPrompts.js` (prompts + Gate de Relevância + ids dos 16 agentes: civil,
  penal, trabalhista, familia, consumidor, tributario, empresarial, imobiliario,
  digital, previdenciario, ambiental, constitucional, saude, internacional,
  eleitoral, agrario).
- Frontend: `~/jurir-main/src/components/VerdictSection.jsx` (`CitationChips`),
  `src/components/AnalysisPanel.jsx`, `src/hooks/useSSEAnalysis.js`, `src/store/index.js`.
  ⚠️ O frontend NÃO foi tocado nesta sessão — `agent.outOfScope`/`outOfScopeReason`
  chegam no payload mas o `AnalysisPanel.jsx` ainda renderiza esses agentes como
  parecer normal (não tem a renderização compacta que o PDF ganhou). Pode valer a
  pena espelhar lá também depois de confirmar que o backend está funcionando.

## Próximos passos sugeridos (em ordem)

1. Teste end-to-end completo (lista de checkboxes acima) com uma análise premium nova.
2. Se tudo confirmado, considerar espelhar a renderização "FORA DE ESCOPO" no
   frontend (`AnalysisPanel.jsx`/`VerdictSection.jsx`), hoje só existe no PDF.
3. Se o Trabalhista ainda devolver recusa crua, investigar por que o guardião não
   pegou (timing, threshold de minLen, ou algo específico desse provider/agente).
