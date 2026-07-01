# PROMPT MASTER — Jurir: Cobertura, Confiança e Growth

**Contexto para quem for executar (Claude Code / sessão de terminal):**
Você está trabalhando em dois repos do Clei (solo dev, Termux/Android, sem desktop):
- Backend: `jurir-app` (Node.js/Express ESM, Prisma v5 + MySQL/Hostinger, deploy Render via push no GitHub)
- Frontend: `jurir` (React 18 + Vite, deploy GitHub Pages em jurir.com)

Entregue **arquivos completos e prontos pra deploy**, não patches parciais. Sem enrolação, sem explicação longa — código funcionando. Confirme sempre com `grep`/`view` o estado real do arquivo antes de editar (não assuma a partir de memória de conversas antigas).

Migrations MySQL/Hostinger rodam via **script Python usando CLI `mariadb` diretamente** (o binário Prisma engine não roda em Android/ARM) — não usar `prisma migrate` em produção, gerar o SQL manualmente e aplicar via script como já é o padrão do projeto.

Execute os 6 blocos abaixo **nessa ordem** (impacto/esforço). Cada bloco é independente e deployável isoladamente — faça commit e push por bloco, não acumule tudo num PR gigante.

---

## BLOCO 1 — Cobertura Nacional de Tribunais (menor esforço, maior impacto)

**Estado real confirmado:**
- `src/swarm/monitoringService.js` → `TRIBUNAL_INDEX` tem só **7 tribunais**: TJSP, TJRJ, TJMG, TJRS, STJ, STF, TST.
- `src/swarm/datajudEngine.js` → já mapeia **24**: TJSP, TJRJ, TJMG, TJRS, TJPR, TJSC, TJBA, TJGO, TJPE, TJCE, TJPA, TJAM, STJ, STF, TST, TSE, TRT1-4, TRF1-4.
- São dois `TRIBUNAL_INDEX` **duplicados e divergentes** — não é limitação técnica, é dívida técnica.

**Tarefas:**
1. Em `datajudEngine.js`, exportar `TRIBUNAL_INDEX` e **expandir para cobertura nacional completa**: todos os 27 TJs (faltam TJDFT, TJES, TJAL, TJAP, TJAC, TJMA, TJMS, TJMT, TJPB, TJPI, TJRN, TJRO, TJRR, TJSE, TJTO), todos os 24 TRTs, os 6 TRFs (TRF1-6, já existe reforma que criou TRF6), STJ, STF, TST, TSE. Usar o padrão de slug do DataJud (`api_publica_<slug>`) — confirmar cada slug contra a doc pública do DataJud/CNJ antes de commitar (não inventar slug).
2. Em `monitoringService.js`, **remover** o `TRIBUNAL_INDEX` local duplicado e importar de `datajudEngine.js` (fonte única da verdade).
3. Atualizar qualquer `<select>` de tribunal no frontend (`jurir/src`) que hoje só liste os 7 — buscar por `TJSP|TJRJ|tribunal.*select|TRIBUNAIS` em `src/pages` e `src/components` e expandir a lista, agrupando por região (Sul/Sudeste/Nordeste/Norte/Centro-Oeste + Federais/Superiores) para não virar um dropdown de 60 itens ilegível.
4. Testar `checkAndUpdateProcesses` com pelo menos 2 tribunais novos (ex. TJDFT, TRF6) antes do deploy.

---

## BLOCO 2 — Tipos de Peça Processual

**Estado real confirmado:** `src/swarm/petitionGenerator.js` já gera 3 tipos: `generatePeticaoInicial`, `generateRecursoApelacao`, `generateContestacao`. Wireado em `src/routes/analysis.js` (rota `POST /api/petition/generate`, switch por `tipo`) e no frontend `src/pages/Peticoes.jsx` (`const TIPOS = ['Petição Inicial', 'Recurso de Apelação', 'Contestação']`).

**Faltam 6 tipos.** Adicionar nessa ordem de uso real em escritório:
1. `generateReplica` (réplica à contestação)
2. `generateEmbargosDeclaracao` (embargos de declaração — cabe em qualquer instância)
3. `generateAgravoInstrumento`
4. `generateMandadoSeguranca`
5. `generateHabeasCorpus`
6. `generateRecursoEspecialExtraordinario` (REsp/RE — pode ser uma função com parâmetro `instancia: 'STJ'|'STF'`)

**Tarefas por peça:**
- Seguir exatamente o padrão estrutural das 3 existentes em `petitionGenerator.js` (mesma função `newPetitionData`, mesmo builder de `.docx` via `docx` lib, mesmo `_heading`/estilo ABNT já usado nas outras).
- Cada peça tem estrutura processual própria — não copiar a estrutura da Petição Inicial genericamente:
  - Réplica: precisa dos dados da Contestação original (reaproveitar overrides já existentes: `reuNome`, `reuQualif`).
  - Embargos de Declaração: precisa de campo `omissao_contradicao_obscuridade` (qual vício está sendo apontado) — adicionar input novo no form.
  - Mandado de Segurança / Habeas Corpus: têm autoridade coatora como parte, não "réu" — não force o campo `reuNome` pra isso, criar `autoridadeCoatora`.
- Em `analysis.js`, trocar o switch `if/else` binário atual por um **dispatch map** (`{ 'Petição Inicial': generatePeticaoInicial, 'Recurso de Apelação': generateRecursoApelacao, ... }`) — mais fácil de estender no futuro sem repetir o bug que já existiu com a Contestação.
- Atualizar `TIPOS` em `Peticoes.jsx` e o form dinâmico: cada peça nova pode precisar de campos extras — renderizar campos condicionalmente por tipo (já existe precedente com os overrides atuais).

---

## BLOCO 3 — Base RAG de Legislação (maior esforço, mais estrutural)

**Estado real confirmado:**
- `src/swarm/legislationRagEngine.js`: array `CORPUS` hardcoded, **277 chunks** (linha 122 a 1086).
- `src/swarm/embeddingProvider.js`: cascata Gemini → Voyage (`voyage-law-2`, dim 1024) → TF-IDF puro (dim 128), degrade permanente por processo.
- Já existe `DIPLOMA_URL_MAP` com URLs oficiais do planalto.gov.br pros principais diplomas (CC, CP, CLT, CPC, CPP, CTN, CDC, CF/88, LGPD + leis esparsas).
- Collection Qdrant `jurir_legislation` já é usada, mas a fonte de verdade ainda é o array estático — não há reindexação incremental real.

**Tarefas:**
1. Criar `scripts/ingest-legislation.js` (Node ESM, roda via `node scripts/ingest-legislation.js` — no Termux ou como job manual no Render Shell):
   - Para cada URL em `DIPLOMA_URL_MAP`, fazer fetch do HTML do planalto.gov.br, parsear artigo por artigo (regex por `Art\. \d+`), gerar chunks no mesmo formato de `LegisChunk` já usado no `CORPUS`.
   - Chunking por artigo (não por tamanho fixo de token) — mantém granularidade jurídica correta, que é o que já funciona nos 277 chunks manuais.
   - Usar `embed()` de `embeddingProvider.js` (não reimplementar embedding) em lotes (respeitar rate limit da Voyage: 3 RPM/10K TPM sem cartão cadastrado — ver comentário já existente no arquivo).
   - Upsert no Qdrant em batches de ~50, com retry exponencial.
2. Cobrir os diplomas que faltam por completo: confirmar contra o `CORPUS` atual quais diplomas já estão parcialmente cobertos e expandir CF/88, CC, CPC, CLT, CDC, CTN pra cobertura de artigo completo (não só os mais citados).
3. Adicionar jurisprudência vinculante: súmulas vinculantes do STF (lista pública, ~60 itens) e súmulas do STJ/TST mais citadas — mesmo pipeline de chunking, fonte é HTML público (URLs já mapeadas em `DIPLOMA_URL_MAP` pra STF/STJ/TST súmula).
4. Manter `CORPUS` hardcoded como **seed/fallback** (não remover) para o caso de Qdrant estar fora do ar — mas o `retrieveLegislation()` deve preferir Qdrant quando disponível e só cair pro array estático se a query ao Qdrant falhar.
5. Endpoint admin `POST /api/admin/rag/reindex` (protegido, só admin) que dispara o script de ingestão em background e loga progresso — evita depender de acesso SSH ao Render pra reindexar no futuro.
6. Job periódico (reaproveitar o cron do `jurisfeedEngine.js`, que já roda a cada 6h) para checar se há novas súmulas vinculantes publicadas e adicionar incrementalmente.

---

## BLOCO 5 — Verificação de OAB

**Estado real confirmado:** o schema `User` em `prisma/schema.prisma` **não tem nenhum campo de OAB**. O único lugar onde OAB aparece hoje é como texto livre (`advogado_oab`) no formulário de geração de peça (`Peticoes.jsx` → `overrides.advogadoOab`), sem qualquer validação — é só impresso na peça gerada.

**Limitação real a considerar:** não existe API pública gratuita e oficial da OAB pra validar número de inscrição em tempo real (o CNA — Cadastro Nacional dos Advogados — não expõe endpoint público estável). Não prometer "validação automática" — a solução realista é **verificação manual assistida**.

**Tarefas:**
1. Migration MySQL (script Python + `mariadb` CLI, padrão do projeto):
   ```sql
   ALTER TABLE users
     ADD COLUMN oab_number VARCHAR(20) NULL,
     ADD COLUMN oab_uf VARCHAR(2) NULL,
     ADD COLUMN oab_verified TINYINT(1) NOT NULL DEFAULT 0,
     ADD COLUMN oab_verified_at DATETIME NULL,
     ADD COLUMN oab_doc_url VARCHAR(500) NULL;
   ```
   Refletir os mesmos campos em `schema.prisma` (`oabNumber`, `oabUf`, `oabVerified`, `oabVerifiedAt`, `oabDocUrl`) pra manter Prisma Client sincronizado com o banco real.
2. Fluxo de solicitação: rota `POST /api/account/oab-verify` — usuário informa número + UF e faz upload de foto/PDF da carteira OAB (reaproveitar qualquer storage já usado no projeto pra upload — checar se já existe integração de upload de arquivo, ex. em `docprocessorEngine.js`, antes de criar uma nova).
3. Painel admin (`src/routes/admin.js` já tem painel financeiro/LLM — adicionar aba "Verificações OAB pendentes") pra aprovar/rejeitar manualmente. Ao aprovar: `oab_verified = 1`, `oab_verified_at = NOW()`, dispara email de confirmação (reaproveitar `core/email.js`).
4. Frontend: badge "Advogado Verificado ✓" no perfil e em relatórios/peças geradas por usuários verificados — reforça o selo de confiança já existente (`Verificar.jsx`) e cria diferencial visível pra quem paga.
5. Gate opcional: reservar algum recurso (ex. peças mais sensíveis como Habeas Corpus/Mandado de Segurança do Bloco 2) só pra usuários OAB-verificados — decisão de produto, mas tecnicamente simples de condicionar no middleware de rota.

---

## BLOCO 6 — Autenticação (verificação de email, login Google, 2FA)

**Estado real confirmado:** `src/routes/auth.js` hoje só tem `register`/`login`/`me`/`forgot-password`/`reset-password` — cadastro é email+senha sem confirmação, sem OAuth, sem 2FA. Único token existente é o `reset_token` (usado via raw SQL, não está no `schema.prisma` — checar se há migration manual equivalente antes de reusar o padrão).

**Tarefas:**

**6.1 Verificação de email**
1. Migration: `ADD COLUMN email_verified TINYINT(1) DEFAULT 0, ADD COLUMN verify_token VARCHAR(64) NULL, ADD COLUMN verify_token_expires DATETIME NULL` + refletir em `schema.prisma`.
2. No `register`, gerar token (mesmo padrão de `crypto.randomBytes(32).toString('hex')` já usado no `forgot-password`), enviar email via `core/email.js` (criar `sendVerificationEmail` seguindo o padrão de `sendWelcome`/`sendPasswordReset`).
3. Rota `GET /api/auth/verify-email?token=...` que seta `email_verified=1`.
4. Não bloquear login de quem não verificou (fricção desnecessária pra um produto que já cobra) — mas mostrar banner no frontend e **bloquear ações sensíveis** (gerar peça, monitorar processo) até verificar. Ajustar middleware de rota de acordo.

**6.2 Login Google**
1. Migration: `ADD COLUMN google_id VARCHAR(100) NULL UNIQUE`.
2. Implementar OAuth2 do Google **sem** framework pesado tipo Passport (projeto já é minimalista) — usar `googleapis` ou fluxo manual com `google-auth-library` (verificar ID token direto), rota `POST /api/auth/google` recebendo o `credential` (JWT) do Google Identity Services no frontend.
3. Se `google_id` já existe → login. Se `email` já existe sem `google_id` → linkar conta. Se não existe → criar usuário com `email_verified=1` automaticamente (Google já validou o email).
4. Frontend: botão "Continuar com Google" na tela de login/registro usando Google Identity Services (`<script src="https://accounts.google.com/gsi/client">`), sem lib React pesada.

**6.3 2FA (TOTP)**
1. Migration: `ADD COLUMN two_factor_secret VARCHAR(64) NULL, ADD COLUMN two_factor_enabled TINYINT(1) DEFAULT 0`.
2. Usar `otplib` (puro JS, sem deps nativas — compatível com o ambiente Render free tier já sensível a RAM).
3. Rotas: `POST /api/account/2fa/setup` (gera secret + QR code via `otplib` + lib de QR já usada no projeto — `pdfService.js`/`reportProduct.js` já geram QR pro selo, reaproveitar a mesma dependência), `POST /api/account/2fa/verify` (confirma código e ativa), `POST /api/auth/login` passa a exigir segundo fator se `two_factor_enabled=1`.
4. Gerar 8 códigos de backup (hash salvo no banco) pro caso do usuário perder o autenticador.

---

## BLOCO 10 — Growth Loop

**Estado real confirmado:** o selo de verificação pública já existe e funciona (`src/swarm/reportProduct.js` gera serial+hash HMAC, `Verificar.jsx` no frontend é a página pública de conferência) — **é a peça que falta pra virar canal de aquisição**, mas hoje é só um selo de autenticidade, não tem nada de compartilhamento/viral embutido. Não existe programa de indicação nem blog.

**Tarefas:**

**10.1 Programa de indicação**
1. Migration: `ADD COLUMN referral_code VARCHAR(12) UNIQUE NULL, ADD COLUMN referred_by INT NULL` (FK pra `users.id`).
2. Gerar `referral_code` único no `register` (ex. slug curto tipo `nanoid(8)`).
3. Cadastro aceita `?ref=CODIGO` na URL → grava `referred_by`. Ao indicado completar a primeira ação paga (ou análise, decisão de produto), creditar `premiumCredits` pros dois lados (indicador + indicado) — reaproveitar o campo `premiumCredits` que já existe no schema.
4. Página "Indique e ganhe" no frontend + link com código pronto pra copiar/compartilhar.

**10.2 Selo público como canal de aquisição**
1. Em `Verificar.jsx`, adicionar: botões de compartilhamento (WhatsApp/LinkedIn — canais reais de advogado brasileiro), e um rodapé fixo "Gerado com Jurir — analise seu caso em jurir.com" visível em toda página de verificação pública (ela já é indexável/compartilhável, só falta a chamada pra ação).
2. No PDF gerado (`pdfService.js` já tem `buildFinalPage` com serial/hash/QR) — garantir que o QR aponta pra essa página com CTA, não só pra validação seca.

**10.3 Blog/SEO jurídico**
1. Dado o setup (GitHub Pages + Vite), caminho de menor esforço: pasta `content/blog/*.md` no repo frontend + rota `/blog` que renderiza markdown estático (lib leve tipo `react-markdown`, já compatível com Vite) — sem CMS externo, sem backend novo.
2. Conteúdo semente: 5-10 posts sobre dúvidas jurídicas comuns (mesmos temas dos 16 agentes especialistas: trabalhista, consumidor, tributário) — otimizados pra long-tail SEO ("quanto tempo demora processo trabalhista", etc.), cada post terminando com CTA pra "analise seu caso grátis".

---

## Ordem de execução recomendada
`Bloco 1 → Bloco 2 → Bloco 5 → Bloco 6 → Bloco 10 → Bloco 3`

(Bloco 3 por último porque é o de maior esforço/menor urgência imediata — os outros 5 dão ganho de cobertura, confiança e distribuição mais rápido enquanto a base RAG evolui em paralelo.)
