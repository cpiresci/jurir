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
- MySQL: migrations rodam como scripts Python usando `mariadb` CLI direto — Prisma engine não roda em ARM/Android

**Pegadinhas do ambiente que já me custaram tempo — não repetir:**
- `/tmp` no Termux é **fora do sandbox do app, sem permissão de escrita**. Nunca usar `/tmp/...` como diretório de staging. Usar sempre um diretório dentro de `~/` (ex: `~/jf`, `~/jff`) e apagar depois com `rm -rf`.
- Downloads de arquivo pelo app Claude vêm pra `/storage/emulated/0/Download/`. Se eu baixar o mesmo zip duas vezes, o Android renomeia o segundo pra `nome-1.zip` — checar antes de rodar `unzip` em cascata pra não pegar a versão errada.
- ESM (`"type": "module"` no package.json) é sempre strict mode: uma variável usada sem `let/const/var` declarada no arquivo não vira global silenciosa, ela quebra com `ReferenceError`. **Isso já mascarou um bug real** (ver Seção 6) — uma função inteira (`_getPipeline` em `memoryEngine.js`) nunca funcionou em produção porque o erro só estourava em runtime, dentro de um try/catch que engolia a falha.

---

## 2. A MISSÃO E POR QUE ELA NÃO É "FALTAM FEATURES"

O Jurir já é funcionalmente maduro: swarm de 16 agentes, Devil's Advocate, Juiz IA, RAG, gerador de petições, monitoramento processual, multi-tenant, billing. **Virar a ferramenta jurídica mais usada do Brasil não depende de construir mais coisa — depende de 4 eixos:**

1. **Confiabilidade de output** — o sistema precisa parar de degradar silenciosamente (RAG caindo em TF-IDF, memória vetorial quebrada sem avisar, corpus com citação errada)
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

### 3.2 — Protocolo de verificação de conteúdo legal (RAG corpus)
Nunca adicionar artigo de lei, súmula ou jurisprudência ao corpus a partir de memória treinada. Sempre:
1. Buscar o texto oficial (planalto.gov.br é fonte primária; cruzar com 2+ fontes secundárias — Jusbrasil, sites de doutrina)
2. Comparar se o texto bate literalmente entre as fontes
3. Verificar se `diploma`/`id`/`artigo` no formato do corpus correspondem ao que a busca confirmou (já achei citação errada — texto do Art. 150 da CF/88 rotulado como CTN)
4. Checar duplicidade de `id` antes de inserir — a lógica de dedup do sistema (`seen.has(c.id)`) descarta silenciosamente qualquer segunda entrada com id repetido, mesmo que o conteúdo seja diferente
5. Deixar comentário no código citando a fonte e a data da verificação (ex: `[add-verified-legal-provisions] Verificado contra planalto.gov.br em 2026-07`)

### 3.3 — Padrão de entrega
1. Arquivo **completo**, pronto pra `cp` por cima do existente — nunca "adicione isso aqui" sem contexto
2. Validar sintaxe antes de entregar (`node --check arquivo.js` pra backend; conferir balanceamento de JSX manualmente pro frontend, já que não há build tool disponível no sandbox de análise)
3. Se envolver variável de ambiente nova: listar exatamente o que precisa ser configurado no Render
4. Se envolver migration: script Python usando `mariadb` CLI, nunca `prisma migrate`
5. Zero explicação de conceito básico — só o que é específico da decisão tomada
6. Ao empacotar pra deploy: instruções de `unzip`/`cp`/`git` usando diretório dentro de `~/`, nunca `/tmp`

### 3.4 — Quando propor vs. quando fazer
- Bugs de correção mecânica (dedup de ID, referência morta, import quebrado) → corrigir direto, explicar depois
- Mudança de arquitetura ou dado que afeta usuários em produção (schema de banco, contrato de API) → propor e esperar confirmação
- Conteúdo jurídico novo → sempre verificado (3.2) antes de escrever, mas não precisa de aprovação prévia pra cada artigo individual

---

## 4. OS 4 EIXOS — ROADMAP DETALHADO

### EIXO 1 — Confiabilidade de output
- [x] `memoryEngine.js`: bug crítico corrigido — `_embed()` chamava `@xenova/transformers` (pacote nem instalado) via função com variáveis nunca declaradas. Memória vetorial nunca funcionou em produção. Migrado pra `embeddingProvider.js`.
- [x] Corpus RAG: 34 grupos de IDs duplicados corrigidos (incluindo citação errada de CTN×CF/88). Corpus 268→272 entradas, expansão verificada (CDC Art. 39/42, CLT Art. 71, Lei 12.506/11).
- [x] Rota `/api/admin/rag/status` + card no painel Admin mostrando tier de embedding ativo, degradação, corpus stats.
- [ ] **Confirmar em produção**: bater em `/api/admin/rag/status` pós-deploy pra saber se está em Gemini/Voyage ou caiu em TF-IDF (falta configurar env var no Render?)
- [ ] Expandir corpus em mais áreas de alto volume: cível (posse, contratos), previdenciário (aposentadoria, benefícios), penal (prisão, medidas cautelares) — mesmo protocolo de verificação da 3.2
- [ ] Auditar outros módulos do swarm (`convergenceEngine.js`, `strategicAgent.js`, `deltaAnalysis.js`) pelo mesmo padrão de bug: imports não usados, funções que referenciam variáveis nunca declaradas, dependências listadas mas não instaladas
- [ ] Testar a cascata de circuit breaker do LLM sob falha real (todos os 4 providers em cooldown simultâneo) — o código trata esse caso (`swarmEngine.js` linha ~249) mas não sei se foi testado em produção

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

## 5. LIÇÕES DESTA SESSÃO (não repetir os mesmos erros)

- **"Resolver tudo numa conversa" não é uma meta honesta.** Network do sandbox de análise é limitado (sem acesso a Render/Qdrant de produção), e conteúdo jurídico exige verificação por item, não produção em massa. Preferir progresso real e verificado a promessas de escopo total.
- **Corpus "pareceu pequeno de fora" mas já era curado.** Antes de propor reescrever ou expandir algo em massa, medir o que já existe (`grep -c`, distribuição por área/diploma) — evita tanto subestimar quanto desperdiçar esforço reconstruindo o que já funciona.
- **Bug mascarado por try/catch silencioso é o pior tipo.** `memoryEngine.js` falhava toda vez que tentava salvar/buscar memória, mas o erro nunca aparecia pro usuário nem quebrava a análise principal — só sumia num log. Ao revisar qualquer módulo, vale grep por `try {` seguido de `catch` vazio ou que só faz `logger.warn` sem re-lançar, e conferir se o que está dentro do try realmente funciona.
- **Dedup por ID é uma faca de dois gumes.** Lógica de "não repetir citação" no `legislationRagEngine.js` também mascarava o bug dos IDs duplicados — o sistema parecia funcionar (retornava resultados), só que descartando dados válidos sem avisar.

---

## 6. STATUS ATUAL (atualizar a cada sessão relevante)

*Última atualização: 2026-07-01 — sessão de correções P0*

**Deployado e em produção:**
- `memoryEngine.js` corrigido (commit `3e7fcfa` no jurir-app)
- Corpus RAG corrigido + expandido, admin.js com rota `/api/admin/rag/status` (mesmo commit)
- Card de status RAG/embedding no painel Admin (commit `5e001aa` no jurir)

**Pendente de verificação:**
- Se Qdrant/Gemini/Voyage estão configurados no Render — checar `/api/admin/rag/status` em produção

**Não abordado ainda:**
- OAB, selo de marketing, loop petição→assinatura, expansão de corpus em cível/previdenciário/penal, auditoria de outros módulos do swarm por bugs similares ao do memoryEngine

---

## 7. PERGUNTA DE ABERTURA PARA QUALQUER NOVA SESSÃO

"Com base na Seção 6 acima: [x] o que você quer que eu confirme/continue primeiro, e [y] tem algum log, erro, ou resultado de `/api/admin/rag/status` que eu deveria ver antes de propor a próxima mudança?"
