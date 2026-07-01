# JURIR — Status da feature "Citações Verificáveis" + pendências

## ✅ Já feito e no GitHub (confirmado por push real)
- Backend `jurir-app` (https://github.com/cpiresci/jurir-app), commit 7118245:
  - src/swarm/legislationRagEngine.js — reescrito p/ Qdrant Cloud + embeddingProvider.js
  - src/swarm/swarmEngine.js — patch cirúrgico (19 linhas) dentro de runPremiumJobStream:
    importa legislationRagEngine, injeta contexto no prompt dos agentes,
    yield {type:'citations', citations} via SSE, persiste em payload.citations
    e expõe em getJobResult()
  - package.json / package-lock.json — @qdrant/js-client-rest adicionado
- Frontend `jurir` (https://github.com/cpiresci/jurir), commit 55cdd46:
  - src/components/VerdictSection.jsx — componente CitationChips (chips clicáveis
    "Fontes Citadas" no rodapé do veredito)
  - src/store/index.js e src/hooks/useSSEAnalysis.js — já tinham citations/setCitations
    prontos ANTES dessa sessão (não precisaram de patch)

## 🔲 Pendente — verificar antes de considerar a feature "no ar"
1. [ ] Confirmar no painel do Render que o serviço jurir-app tem as env vars
       QDRANT_URL e QDRANT_API_KEY configuradas (cluster já existe segundo o usuário,
       só falta confirmar que chegou no Render)
2. [ ] VOYAGE_API_KEY é OPCIONAL — sem ela, embeddingProvider.js cai automaticamente
       em fallback TF-IDF (já implementado, não precisa de ação)
3. [ ] Confirmar que o deploy do Render terminou sem erro (build do @qdrant/js-client-rest)
4. [ ] Confirmar que o GitHub Pages do repo `jurir` rodou o Actions e publicou o build novo
5. [ ] Teste end-to-end: rodar 1 análise premium real e verificar se aparecem os chips
       "Fontes Citadas" no rodapé do veredito, com links clicáveis pro planalto.gov.br/STF/STJ/TST
6. [ ] Se os chips NÃO aparecerem: checar logs do Render por erros tipo
       "Falha ao criar QdrantClient" ou "QDRANT_URL não configurado" — indica env var faltando
7. [ ] Se aparecerem chips mas sempre apontando pro Google (fallback de buildOfficialUrl):
       não é bug, é esperado pra diplomas fora do DIPLOMA_URL_MAP

## 📌 Fatos da arquitetura real (pra não redescobrir do zero numa sessão futura)
- Repos no GitHub: `cpiresci/jurir-app` (backend) e `cpiresci/jurir` (frontend) —
  ATENÇÃO: o frontend NÃO se chama jurir-main, é só `jurir`. No dispositivo, as pastas
  locais via Termux são ~/jurir-app e ~/jurir (minúsculas, sem -main)
- swarmEngine.js usa arquitetura de FILA COM CHECKPOINT (createAnalysisJob,
  runPremiumJobStream como async generator, saveCheckpoint/loadCheckpoints em
  agent_checkpoints, getJobResult para leitura) — NÃO é um generator-stream simples
- A rota POST /api/analyze/premium/stream (em src/routes/analysis.js) envolve
  runPremiumJobStream e escreve cada yield como linha SSE direto pro response —
  por isso o frontend recebe como streaming mesmo o backend sendo fila por baixo
- embeddingProvider.js já existe em src/swarm/, com Voyage AI (voyage-law-2, dim=1024)
  + fallback TF-IDF puro em JS (dim=128) — não precisa recriar
- Antes de qualquer patch futuro nesses dois repos: SEMPRE pedir pro usuário copiar
  o arquivo real do dispositivo pra Download/ e anexar no chat, em vez de assumir
  que arquivos de sessões anteriores ainda refletem o estado do GitHub
