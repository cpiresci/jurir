# JURIR — Prompt de Configuração: RAG + Acompanhamento de Processos

## CONTEXTO DO PROJETO

Backend Node.js/Express deployado no Render (`jurir-app`).
Frontend React 18 + Vite deployado no GitHub Pages (`jurir`).
DB MySQL no Hostinger. Sem `prisma migrate deploy` — DDL via phpMyAdmin/SQL direto.

---

## TAREFA 1 — ATIVAR O RAG EM PRODUÇÃO (Qdrant + Voyage AI)

### O que já existe no código

- `src/swarm/legislationRagEngine.js` — engine RAG completo com 100+ chunks de legislação real
- `src/swarm/embeddingProvider.js` — provider com prioridade: Voyage AI (`voyage-law-2`, dim=1024) → TF-IDF fallback (dim=128)
- `src/swarm/memoryEngine.js` — também usa Qdrant para memória do usuário
- Kill-switch: `JURIR_RAG_DISABLED=true` desabilita tudo para economizar RAM
- Warm-up: `JURIR_RAG_WARMUP=true` pré-aquece o índice no startup

### O que precisa ser feito

**1. Configurar as variáveis de ambiente no Render**

No dashboard do Render → jurir-app → Environment → Add Environment Variables:

```
QDRANT_URL=https://SEU-CLUSTER.qdrant.io          # URL do cluster Qdrant Cloud
QDRANT_API_KEY=SEU_API_KEY_QDRANT                 # API Key do Qdrant Cloud
VOYAGE_API_KEY=SEU_API_KEY_VOYAGE                 # API Key da Voyage AI
VOYAGE_MODEL=voyage-law-2                          # Modelo de embedding jurídico
JURIR_RAG_DISABLED=false                           # Habilitar RAG
JURIR_RAG_WARMUP=true                              # Pré-aquecer no startup
```

**2. Verificar se o Qdrant Cloud está configurado**

- Acessar https://cloud.qdrant.io
- Criar cluster gratuito se ainda não existir (Free tier: 1GB, suficiente para o corpus)
- Copiar a URL do cluster e o API Key

**3. Verificar se a Voyage AI está configurada**

- Acessar https://dash.voyageai.com
- Copiar o API Key
- O modelo `voyage-law-2` é especializado em texto jurídico — manter esse

**4. Após configurar as env vars no Render**

O Render vai fazer redeploy automático. No startup, o `warmUp()` vai:
- Conectar no Qdrant Cloud
- Criar a collection `jurir_legislation` se não existir (dim=1024 com Voyage)
- Indexar os 100+ chunks do corpus em lotes de 32
- Fazer uma busca de teste para confirmar

**5. Verificar nos logs do Render se aparece:**
```
[legislation_rag] Warm-up concluído: N chunks indexados
[legislation_rag] Collection 'jurir_legislation' criada (dim=1024)
```

**Se aparecer erro de dim mismatch (TF-IDF dim=128 vs Voyage dim=1024):**

Deletar a collection manualmente via Qdrant Dashboard ou:
```js
// Rodar uma vez via endpoint admin ou console
await client.deleteCollection('jurir_legislation');
await client.deleteCollection('jurir_memory');
// Restart do servidor para recriar com dim=1024
```

---

## TAREFA 2 — ACOMPANHAMENTO DE PROCESSOS

### O que já existe no código

- `src/swarm/monitoringService.js` — busca movimentações via DATAJUD/CNJ
- `src/swarm/datajudEngine.js` — integração com a API pública do DATAJUD
- Tabela `process_monitoring` no MySQL (schema já definido no `monitoringService.js`)
- Frontend: página `src/pages/Monitoramento.jsx` já existe

### O que precisa ser implementado

**1. Criar a tabela no Hostinger via phpMyAdmin**

```sql
CREATE TABLE IF NOT EXISTS process_monitoring (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT          NOT NULL,
  workspace_id    INT,
  numero_processo VARCHAR(30)  NOT NULL,
  tribunal        VARCHAR(20)  NOT NULL,
  ultima_mov      TEXT,
  ultima_data     VARCHAR(20),
  score_atual     FLOAT,
  score_anterior  FLOAT,
  active          TINYINT(1)   DEFAULT 1,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pm_active (active),
  INDEX idx_pm_user   (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**2. Criar as rotas de monitoramento no backend**

Arquivo: `src/routes/monitoring.js`

```js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { fetchProcessMovements } from '../swarm/monitoringService.js';
import { requireAuth } from '../core/security.js';

const router = express.Router();
const prisma = new PrismaClient();

// POST /monitoring — adicionar processo para acompanhamento
router.post('/', requireAuth, async (req, res) => {
  const { numero_processo, tribunal } = req.body;
  const user_id = req.user.id;

  if (!numero_processo || !tribunal) {
    return res.status(400).json({ error: 'numero_processo e tribunal são obrigatórios' });
  }

  try {
    // Busca a primeira movimentação já
    const mov = await fetchProcessMovements(numero_processo, tribunal);

    const record = await prisma.$queryRaw`
      INSERT INTO process_monitoring 
        (user_id, numero_processo, tribunal, ultima_mov, ultima_data, active)
      VALUES 
        (${user_id}, ${numero_processo}, ${tribunal}, 
         ${mov?.ultima_mov || null}, ${mov?.ultima_data || null}, 1)
      ON DUPLICATE KEY UPDATE active = 1
    `;

    res.json({ ok: true, mov });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /monitoring — listar processos do usuário
router.get('/', requireAuth, async (req, res) => {
  const user_id = req.user.id;
  try {
    const rows = await prisma.$queryRaw`
      SELECT * FROM process_monitoring 
      WHERE user_id = ${user_id} AND active = 1
      ORDER BY updated_at DESC
    `;
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /monitoring/:id — remover processo
router.delete('/:id', requireAuth, async (req, res) => {
  const user_id = req.user.id;
  try {
    await prisma.$queryRaw`
      UPDATE process_monitoring SET active = 0 
      WHERE id = ${Number(req.params.id)} AND user_id = ${user_id}
    `;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /monitoring/check — checar movimentação manual de um processo
router.post('/check/:id', requireAuth, async (req, res) => {
  const user_id = req.user.id;
  try {
    const [row] = await prisma.$queryRaw`
      SELECT * FROM process_monitoring 
      WHERE id = ${Number(req.params.id)} AND user_id = ${user_id} AND active = 1
    `;
    if (!row) return res.status(404).json({ error: 'Processo não encontrado' });

    const mov = await fetchProcessMovements(row.numero_processo, row.tribunal);
    const nova_mov = mov?.ultima_mov || null;
    const houve_atualizacao = nova_mov && nova_mov !== row.ultima_mov;

    if (houve_atualizacao) {
      await prisma.$queryRaw`
        UPDATE process_monitoring 
        SET ultima_mov = ${nova_mov}, ultima_data = ${mov?.ultima_data || null},
            score_anterior = score_atual, updated_at = NOW()
        WHERE id = ${Number(req.params.id)}
      `;
    }

    res.json({ houve_atualizacao, mov, row });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
```

**3. Registrar a rota no `src/app.js`**

```js
import monitoringRouter from './routes/monitoring.js';
// ...
app.use('/monitoring', monitoringRouter);
```

**4. Adicionar variável de ambiente no Render**

```
DATAJUD_API_KEY=APIKey cDZHYzlZa0JadVREZDJCendFbXNpMDdoR1B1ZWFyVnphelF4djJoSmxWSzgwWW11SVh
```
(A chave pública do DATAJUD já está hardcoded como fallback no código, mas é melhor deixar como env var)

**5. Atualizar `src/pages/Monitoramento.jsx` no frontend**

A página já existe. Conectar aos endpoints:
- `GET /monitoring` → listar processos
- `POST /monitoring` → adicionar { numero_processo, tribunal }
- `DELETE /monitoring/:id` → remover
- `POST /monitoring/check/:id` → checar manualmente

---

## RESUMO DE PRIORIDADES

| # | Ação | Onde | Esforço |
|---|------|------|---------|
| 1 | Adicionar 3 env vars no Render (QDRANT_URL, QDRANT_API_KEY, VOYAGE_API_KEY) | Render Dashboard | 5 min |
| 2 | Criar tabela `process_monitoring` no phpMyAdmin | Hostinger phpMyAdmin | 2 min |
| 3 | Criar `src/routes/monitoring.js` e registrar no app.js | jurir-app | 30 min |
| 4 | Conectar `Monitoramento.jsx` aos endpoints | jurir | 20 min |

O RAG ativa automaticamente após o passo 1 — sem nenhuma mudança de código.
