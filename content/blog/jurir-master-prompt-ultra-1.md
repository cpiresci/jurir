# PROMPT MASTER ULTRA — JURIR: Missão "Ferramenta Jurídica Mais Usada do Brasil"

> Cole este prompt inteiro no início de qualquer sessão (Claude Code, chat, nova conversa) trabalhando no Jurir. Ele substitui a versão anterior — incorpora bugs reais já encontrados, protocolo de verificação de conteúdo legal, e pegadinhas do ambiente Termux descobertas na prática. Atualize a SEÇÃO 6 (status) a cada sessão relevante.

---

## 1. IDENTIDADE E CONTEXTO FIXO

Sou Clei (github: cpiresci), dev solo, **100% via Termux no Android, sem desktop**. Fluxo de deploy: editar → `git push` → Render redeploya o backend automaticamente, GitHub Pages republica o frontend.

**Stack Jurir:**
- Backend `jurir-app` (~/jurir-app): Node.js/Express ESM-only, Prisma v5 + MySQL (Hostinger), Render
- Frontend `jurir` (~/jurir): React 18 + Vite, GitHub Pages (jurir.com), Capacitor 6 pro Android
- RAG: Qdrant + `embeddingProvider.js` — cascata **Gemini → Voyage (`voyage-law-2`) → TF-IDF**, degrade permanente por processo (não tenta promover de volta sozinho, só reinicia no boot)
- LLM: cascata SambaNova → Cerebras → Gemini → OpenRouter, circuit breaker por provider
- Swarm: 16 agentes especialistas + Devil's Advocate obrigatório + Juiz IA, veredito via SSE
- MySQL: migrations rodam como scripts Python usando `mariadb` CLI direto (conexão direta do Termux pro Hostinger **funciona** — testado nesta sessão, diferente do bloqueio visto no Mobya) ou, como fallback, colando o `.sql` direto no phpMyAdmin — Prisma engine não roda em ARM/Android de qualquer forma

**Pegadinhas do ambiente que já me custaram tempo — não repetir:**
- `/tmp` no Termux é **fora do sandbox do app, sem permissão de escrita**. Nunca usar `/tmp/...` como diretório de staging. Usar sempre um diretório dentro de `~/` (ex: `~/jf`, `~/jff`) e apagar depois com `rm -rf`.
- Downloads de arquivo pelo app Claude vêm pra `/storage/emulated/0/Download/`. Se eu baixar o mesmo nome de arquivo duas vezes, o Android renomeia o segundo pra `nome-1.js`, terceiro pra `nome-2.js` etc — **checar o nome real antes de `cp`**, já rolou de `analysis.js` virar `analysis-6.js` só porque já existiam 5 arquivos com esse nome na pasta Download de sessões anteriores.
- ESM (`"type": "module"` no package.json) é sempre strict mode: uma variável usada sem `let/const/var` declarada no arquivo não vira global silenciosa, ela quebra com `ReferenceError`. **Isso já mascarou um bug real** (ver Seção 6) — uma função inteira (`_getPipeline` em `memoryEngine.js`) nunca funcionou em produção porque o erro só estourava em runtime, dentro de um try/catch que engolia a falha.
- `node --check` **não funciona em arquivos `.prisma`** — só valida `.js`. Pra conferir se um schema Prisma baixado veio completo/não-truncado, usar `wc -l` + `grep -n "^model "` pra confirmar que todos os models esperados estão lá, ou `tail` pra ver se fecha limpo no `}` final.
- `export DB_PASS=...` com placeholder literal (`sua_senha_hostinger`) em vez do valor real gera erro de auth que *parece* erro de permissão de banco, não erro óbvio de "esqueci de substituir". Sempre copiar a `DATABASE_URL` real do Render (Dashboard → Environment) antes de rodar migration.

---

## 2. A MISSÃO E POR QUE ELA NÃO É "FALTAM FEATURES"

O Jurir já é funcionalmente maduro: swarm de 16 agentes, Devil's Advocate, Juiz IA, RAG, gerador de petições, monitoramento processual, multi-tenant, billing. **Virar a ferramenta jurídica mais usada do Brasil não depende de construir mais coisa — depende de 4 eixos:**

1. **Confiabilidade de output** — o sistema precisa parar de degradar silenciosamente (RAG caindo em TF-IDF, memória vetorial quebrada sem avisar, corpus com citação errada, rate limit que existe no código mas nunca é chamado)
2. **Confiança institucional** — verificação de OAB, selo auditável, compliance visível
3. **Distribuição** — canal de aquisição real no nicho jurídico brasileiro
4. **Fechamento de loop** — da análise até o protocolo real, não só o rascunho

Toda tarefa nova é avaliada contra: **isso me aproxima de um desses 4 eixos, ou é polimento que pode esperar?**

---

## 3. PROTOCOLO DE EXECUÇÃO (não-negociável)

### 3.1 — Antes de qualquer código
1. Ler o(s) arquivo(s) real(is) — nunca assumir estrutura de memória, mesmo que eu já tenha descrito o arquivo antes numa sessão anterior
2. Se a mudança envolve corpus jurídico (RAG), **protocolo de verificação obrigatório** (ver 3.2) — nunca escrever texto de lei de memória
3. Checar se a mudança quebra ESM-only, Prisma v5, ou a cascata de fallback existente (embeddingProvider, llmManager)
4. Se for editar um arquivo grande (>500 linhas), grep primeiro por padrões relacionados (`grep -n "termo" arquivo`) em vez de ler o arquivo inteiro
5. **Se uma função existe mas parece nunca ser chamada** (ex: `checkEscritorioMonthly`, `checkApiKeyHourly` antes desta sessão), `grep -rn "nomeDaFuncao"` em `src/routes/` inteiro antes de assumir que já está protegido — código morto que simula proteção é pior que ausência óbvia de proteção

### 3.2 — Protocolo de verificação de conteúdo legal (RAG corpus)
Nunca adicionar artigo de lei, súmula ou jurisprudência ao corpus a partir de memória treinada. Sempre:
1. Buscar o texto oficial (planalto.gov.br é fonte primária; cruzar com 2+ fontes secundárias — Jusbrasil, sites de doutrina)
2. Comparar se o texto bate literalmente entre as fontes
3. Verificar se `diploma`/`id`/`artigo` no formato do corpus correspondem ao que a busca confirmou (já achei citação errada — texto do Art. 150 da CF/88 rotulado como CTN)
4. Checar duplicidade de `id` antes de inserir — a lógica de dedup do sistema (`seen.has(c.id)`) descarta silenciosamente qualquer segunda entrada com id repetido, mesmo que o conteúdo seja diferente
5. Deixar comentário no código citando a fonte e a data da verificação (ex: `[add-verified-legal-provisions] Verificado contra planalto.gov.br em 2026-07`)

### 3.3 — Padrão de entrega
1. Arquivo **completo**, pronto pra `cp` por cima do existente — nunca "adicione isso aqui" sem contexto
2. Validar sintaxe antes de entregar (`node --check arquivo.js` pra backend — **não funciona em `.prisma`**, usar `wc -l`/`grep`/`tail` nesse caso; conferir balanceamento de JSX manualmente pro frontend, já que não há build tool disponível no sandbox de análise)
3. Se envolver variável de ambiente nova: listar exatamente o que precisa ser configurado no Render
4. Se envolver migration: `.sql` puro + script Python usando `mariadb` CLI como primeira opção (funciona via Termux pro Hostinger, confirmado nesta sessão), com fallback documentado de colar o `.sql` direto no phpMyAdmin — nunca `prisma migrate`
5. **Migration sempre roda e é confirmada ANTES do `git push`** que leva o código que depende dela — se o Render subir o código novo antes da tabela existir, quebra em produção
6. Zero explicação de conceito básico — só o que é específico da decisão tomada
7. Ao empacotar pra deploy: instruções de `unzip`/`cp`/`git` usando diretório dentro de `~/`, nunca `/tmp`

### 3.4 — Quando propor vs. quando fazer
- Bugs de correção mecânica (dedup de ID, referência morta, import quebrado) → corrigir direto, explicar depois
- Mudança de arquitetura ou dado que afeta usuários em produção (schema de banco, contrato de API) → propor e esperar confirmação
- Conteúdo jurídico novo → sempre verificado (3.2) antes de escrever, mas não precisa de aprovação prévia pra cada artigo individual

---

## 4. OS 4 EIXOS — ROADMAP DETALHADO

### EIXO 1 — Confiabilidade de output
- [x] `memoryEngine.js`: bug crítico corrigido — `_embed()` chamava `@xenova/transformers` (pacote nem instalado) via função com variáveis nunca declaradas. Memória vetorial nunca funcionou em produção. Migrado pra `embeddingProvider.js`. **Confirmado em auditoria de código nesta sessão.**
- [x] Corpus RAG: duplicatas de ID corrigidas, corpus expandido continuamente (269 entradas únicas confirmadas em auditoria; +3 chunks CPP/L8213/EC103 e +2 chunks CPC processual commitados nesta sessão via `LegislationRagEngine-6.js`/`-7.js` — **conteúdo desses commits específicos não foi re-auditado por mim, confiar no protocolo 3.2 já seguido**)
- [x] Rota `/api/admin/rag/status` + card no painel Admin mostrando tier de embedding ativo, degradação, corpus stats. **Confirmado em auditoria de código.**
- [x] `pdfService.js`: seção "Fontes Citadas" implementada, lê `fullReport.citations` corretamente. **Confirmado.**
- [x] Agentes fora de escopo: Gate de Relevância implementado (`legalEngine.js` + `legalPrompts.js`) — `outOfScope` marcado, confidence forçada a 0, excluído do cálculo dimensional. Resolve tanto o bug de zeros no score quanto o de refusal string vazando. **Confirmado.**
- [x] **Rate limiting persistido em MySQL** (era o item mais crítico pendente): `rateLimit.js` reescrito de `Map()` em memória pra 2 tabelas (`rate_limit_buckets`, `rate_limit_monthly`) via Prisma. Achado na auditoria: `checkEscritorioMonthly`, `checkApiKeyHourly` e `checkApiPlanMonthly` existiam como funções mas **nunca eram chamadas em lugar nenhum** — plano Escritório (30/mês) e Plano API (5.000/mês, 100/hora por chave) não tinham nenhum limite real aplicado. Wiring adicionado: `checkApiKeyHourly`/`checkApiPlanMonthly` dentro de `getCurrentUser` (security.js, único ponto por onde toda requisição autenticada por API Key passa), `checkEscritorioMonthly` nos dois endpoints de análise premium. Tabelas criadas via phpMyAdmin, código commitado e deployado (`9298d16` no jurir-app).
- [ ] **Confirmar em produção**: bater em `/api/admin/rag/status` pós-deploy pra saber se está em Gemini/Voyage ou caiu em TF-IDF (falta configurar env var no Render?)
- [ ] **Confirmar em produção**: `/health` respondeu OK pós-deploy do rate limiting? `/api/account/me` autenticado lê `getMonthlyUsage` sem erro 500?
- [ ] Expandir corpus em mais áreas de alto volume: cível (posse, contratos), previdenciário (aposentadoria, benefícios), penal (prisão, medidas cautelares) — mesmo protocolo de verificação da 3.2 (trabalho em andamento, ver commits desta sessão)
- [ ] Auditoria de `convergenceEngine.js`, `strategicAgent.js`, `deltaAnalysis.js` pelo padrão de bug do `memoryEngine.js` — **feita nesta sessão via grep de padrões de try/catch, nenhum sinal suspeito encontrado** (todos os catches logam com contexto e têm fallback sensato). Não é auditoria funcional completa, só descarta o padrão específico já visto.
- [ ] Testar a cascata de circuit breaker do LLM sob falha real (todos os 4 providers em cooldown simultâneo) — o código trata esse caso (`swarmEngine.js` linha ~249) mas não sei se foi testado em produção
- [ ] **Investigar, fora do escopo do rate limiting**: planos Escritório/API debitam `premiumCredits` nos endpoints de análise premium mesmo sendo "ilimitados" — não sei se é intencional (créditos recarregados mensalmente por fora) ou é outro furo

### EIXO 2 — Confiança institucional
- [ ] Verificação de OAB no cadastro (Cadastro Nacional de Advogados — checar se existe API pública ou só scraping)
- [ ] Selo de verificação de PDF (`REPORT_SECRET_KEY`) — já existe tecnicamente, falta virar feature de marketing visível na UI
- [ ] Página pública de metodologia/precisão: benchmark de vereditos do Jurir vs. decisões reais publicadas
- [ ] Política de retenção/exclusão de dados (LGPD) visível na UI, não só em texto jurídico de rodapé

### EIXO 3 — Distribuição
- [ ] Conteúdo SEO jurídico: glossário, calculadoras (rescisão CLT, correção monetária, prescrição), páginas indexáveis
- [ ] Material para parceria com núcleos de prática jurídica / OAB seccionais / faculdades
- [ ] Landing pages segmentadas por área (trabalhista, cível, tributário) em vez de home genérica

### EIXO 4 — Fechar o loop
- [ ] `petitionGenerator.js` → formatação compatível com padrões de protocolo PJe
- [ ] Avaliar viabilidade de assinatura digital (ICP-Brasil) ou export assinável
- [ ] Onboarding: primeira análise grátis sem cartão precisa mostrar a profundidade real do swarm (16 agentes + Devil's Advocate) já na primeira experiência

---

## 5. LIÇÕES DE SESSÕES ANTERIORES (não repetir os mesmos erros)

- **"Resolver tudo numa conversa" não é uma meta honesta.** Network do sandbox de análise é limitado (sem acesso a Render/Qdrant de produção), e conteúdo jurídico exige verificação por item, não produção em massa. Preferir progresso real e verificado a promessas de escopo total.
- **Corpus "pareceu pequeno de fora" mas já era curado.** Antes de propor reescrever ou expandir algo em massa, medir o que já existe (`grep -c`, distribuição por área/diploma) — evita tanto subestimar quanto desperdiçar esforço reconstruindo o que já funciona.
- **Bug mascarado por try/catch silencioso é o pior tipo.** `memoryEngine.js` falhava toda vez que tentava salvar/buscar memória, mas o erro nunca aparecia pro usuário nem quebrava a análise principal — só sumia num log. Ao revisar qualquer módulo, vale grep por `try {` seguido de `catch` vazio ou que só faz `logger.warn` sem re-lançar, e conferir se o que está dentro do try realmente funciona.
- **Dedup por ID é uma faca de dois gumes.** Lógica de "não repetir citação" no `legislationRagEngine.js` também mascarava o bug dos IDs duplicados — o sistema parecia funcionar (retornava resultados), só que descartando dados válidos sem avisar.
- **Função exportada e "aparentemente pronta" não é o mesmo que função em uso.** `checkEscritorioMonthly`, `checkApiKeyHourly` e `checkApiPlanMonthly` existiam prontas, com nomes corretos e lógica correta, em `rateLimit.js` há tempo — mas nenhuma delas era chamada em lugar nenhum do código de rotas. Um `grep -rn "checkX" src/routes/` teria achado isso em segundos; a suposição de "a função existe, então deve estar em uso" custou um buraco real de billing/abuso sem enforcement. Ao herdar ou revisar módulo de proteção (rate limit, auth, validação), sempre confirmar os call sites, não só a implementação.
- **Zip de análise pode estar defasado do Termux ao vivo, e vice-versa.** Nesta sessão, dois fluxos de trabalho rodaram em paralelo (expansão de corpus RAG direto no Termux + patch de rate limiting via zip/download) — isso é administrável desde que cada `cp` final confirme o arquivo real com `grep`/`wc -l` antes do commit, não assuma que o que foi auditado no zip é o que está no disco agora.

---

## 6. STATUS ATUAL (atualizar a cada sessão relevante)

*Última atualização: 2026-07-01 — sessão de rate limiting persistido + expansão de corpus RAG*

**Deployado e em produção (jurir-app):**
- `memoryEngine.js` corrigido (commit `3e7fcfa`)
- Corpus RAG corrigido + expandido, `/api/admin/rag/status` no ar (mesmo commit)
- `pdfService.js` com "Fontes Citadas" funcional
- Gate de Relevância / `outOfScope` no cálculo dimensional
- Corpus RAG: +3 chunks (CPP Art. 319, Lei 8.213 Art. 48, EC 103 Art. 19) — commit `bcbeb67`
- Corpus RAG: +2 chunks processual (CPC Art. 219, Art. 1015) + enriquecimento CPC-300 §§1-3 — commit `80dfef3`
- **Rate limiting persistido em MySQL** (`rate_limit_buckets`, `rate_limit_monthly` criadas via phpMyAdmin; `rateLimit.js`, `security.js`, `analysis.js`, `account.js` atualizados; `checkApiKeyHourly`/`checkApiPlanMonthly` agora ativos no caminho de auth por API Key; `checkEscritorioMonthly` ativo nos endpoints de análise premium) — commit `9298d16`

**Deployado e em produção (jurir, frontend):**
- Card de status RAG/embedding no painel Admin (commit `5e001aa`)

**Pendente de verificação:**
- Se Qdrant/Gemini/Voyage estão configurados no Render — checar `/api/admin/rag/status` em produção
- `/health` e `/api/account/me` pós-deploy do rate limiting — confirmar que não quebrou nada (deploy acabou de subir, ainda sem confirmação de teste em produção)

**Não abordado ainda:**
- OAB, selo de marketing, loop petição→assinatura, expansão de corpus em cível/previdenciário/penal (parcialmente iniciado), auditoria funcional (não só por padrão) de `convergenceEngine.js`/`strategicAgent.js`/`deltaAnalysis.js`, investigação do débito de `premiumCredits` em planos "ilimitados"

---

## 7. PERGUNTA DE ABERTURA PARA QUALQUER NOVA SESSÃO

"Com base na Seção 6 acima: [x] o que você quer que eu confirme/continue primeiro, e [y] tem algum log, erro, ou resultado de `/api/admin/rag/status` ou `/api/account/me` que eu deveria ver antes de propor a próxima mudança?"
