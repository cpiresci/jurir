# JURIR — Status e continuidade (30/06/2026)

Estou desenvolvendo o JURIR (plataforma de análise jurídica por IA) 100% via Termux
no Android, sem desktop. Dois repos: `~/jurir-app` (backend Node/Express/Prisma,
deploy no Render) e `~/jurir` ou `~/jurir-main` (frontend, GitHub Pages + APK via
GitHub Actions). Workflow: scripts de patch em Python com `assert src.count(old)==1`,
colados via heredoc no Termux, validados com `node --check`, commitados e pushados.

## Recém-concluído (sessão anterior)

1. **RAG de legislação com citações verificáveis** (Qdrant Cloud + Voyage AI,
   fallback TF-IDF) — deployado, chips de citação no `VerdictSection.jsx`.
2. **Auto-heal de mismatch de dimensão Voyage(1024)/TF-IDF(128)** em
   `legislationRagEngine.js` — se o provider cair em runtime, o índice se
   reconstrói sozinho em vez de ficar quebrado pra sempre. Commit `6a09035`.
3. **Score dimensional ligado de verdade** em `swarmEngine.js` — antes
   `scoreDim` ficava sempre `{}` (nunca havia chamada a
   `calculateDimensionalScore()` no fluxo Premium, só existia no fluxo
   gratuito via `legalEngine.js`). Corrigido também mismatch de chave
   (`scoreDimensional` → `dimensions`, que é o que `pdfService.js` e o
   frontend já esperavam). Commit `d4bda19` (push confirmado:
   `f5e8ea5..d4bda19..14a11a1`).

## Pendente — teste end-to-end do que foi corrigido

Preciso rodar uma análise premium nova (não reaproveitar a #238, que é de
antes do fix) e conferir:
- [ ] Score dimensional aparece preenchido (Viabilidade/Risco/Complexidade/
      Urgência) no card do app **e** no PDF baixado — antes vinha tudo zerado.
- [ ] Chips de citação aparecem na tela do veredito (web/app) — **atenção**:
      mesmo se aparecerem na tela, **não vão aparecer no PDF baixado**,
      porque `pdfService.js` nunca foi atualizado pra incluir essa seção
      (bug catalogado, ainda não corrigido).

## Bugs catalogados, ainda NÃO corrigidos (achados na análise do relatório #238)

1. **Citações ausentes no PDF** — `pdfService.js` não tem nenhuma referência
   a `citations`. A seção "Fontes Citadas" só existe em `VerdictSection.jsx`
   (web). Precisa adicionar ao gerador de PDF.
2. **Agente Trabalhista devolveu recusa crua da IA** como se fosse parecer
   jurídico: `"I'm sorry, but I can't help with that."` (conf 30%) foi salvo
   e exibido no relatório. Falta validação/retry quando a resposta do
   provider não é análise jurídica de verdade.
3. **Agentes fora de escopo alucinam em vez de recusar**: ao contrário de
   `Empresarial`/`Previdenciário` (que recusaram corretamente por estarem
   fora de área), agentes como `Eleitoral`, `Agrário`, `Internacional`,
   `Tributário`, `Imobiliário`, `Consumidor`, `Saúde` geraram pareceres
   extensos e "confiantes" (85-92%) sobre um caso de guarda de filhos —
   `Eleitoral` chegou a falar de cassação de mandato por propaganda eleitoral,
   sem nenhuma relação com o caso. Vários citam jurisprudência no formato
   `Apelação 100XXXX-XX.2022.8.26.0100` (X genéricos repetidos entre agentes
   diferentes) — indício de jurisprudência fabricada/template, não real.
4. **Encoding quebrado no PDF (cosmético)**: linhas divisórias `━━━` do
   veredito viram `?????` no PDF — o sanitizador de acentos não trata esse
   caractere específico.

## Arquivos-chave

- Backend: `~/jurir-app/src/swarm/swarmEngine.js` (orquestração premium),
  `legislationRagEngine.js` (RAG), `jurirScoreDimensional.js` (score 4D),
  `pdfService.js` (gerador de PDF), `legalEngine.js` (runAgent/runJudge/
  runDevilAdvocate, AGENT_CONFIGS), `legalPrompts.js` (prompts + ids dos
  16 agentes: civil, penal, trabalhista, familia, consumidor, tributario,
  empresarial, imobiliario, digital, previdenciario, ambiental,
  constitucional, saude, internacional, eleitoral, agrario).
- Frontend: `~/jurir-main/src/components/VerdictSection.jsx`,
  `src/hooks/useSSEAnalysis.js`, `src/store/index.js`.

## Próximos passos sugeridos (em ordem)

1. Teste end-to-end do score dimensional + citações na tela (não no PDF).
2. Se confirmado, atacar o bug das citações ausentes no PDF.
3. Atacar a alucinação dos agentes fora de escopo (provavelmente precisa de
   um filtro de relevância antes de mandar pro LLM, ou um prompt mais
   estrito tipo "se não for sua área, responda só com a recusa padrão").
4. Investigar o refusal cru do agente Trabalhista (treinar retry/fallback
   quando a resposta não parece análise jurídica).
