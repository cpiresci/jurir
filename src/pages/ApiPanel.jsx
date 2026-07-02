/**
 * ApiPanel.jsx — Gerenciamento de API Keys e Webhooks (Plano API)
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, Webhook, Plus, Trash2, Copy, CheckCircle, Zap } from 'lucide-react';
import { useStore } from '../store';
import { listApiKeys, createApiKey, revokeApiKey, listWebhooks, createWebhook, deleteWebhook, testWebhook } from '../lib/api';

const TAB = { KEYS: 'keys', WEBHOOKS: 'webhooks' };

export default function ApiPanelPage() {
  const { authToken, userData, addToast } = useStore();
  const [tab, setTab] = useState(TAB.KEYS);

  const isApiPlan = userData?.is_api_plan;

  if (!authToken) return <PageWrap><Unauth /></PageWrap>;
  if (!isApiPlan) return <PageWrap><NeedPlan /></PageWrap>;

  return (
    <PageWrap>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Zap size={28} style={{ color: 'var(--co7)' }} />
        <div>
          <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700 }}>Painel API</h1>
          <p style={{ color: 'var(--p4)', fontSize: 'var(--fs-sm)' }}>Plano API · Integração via chaves e webhooks</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--b-neutral)', paddingBottom: 4 }}>
        {[
          { key: TAB.KEYS,     icon: <Key size={14}/>,     label: 'API Keys' },
          { key: TAB.WEBHOOKS, icon: <Webhook size={14}/>, label: 'Webhooks' },
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', border: 'none', borderRadius: 'var(--r-sm)',
            background: tab === key ? 'rgba(0,242,254,0.08)' : 'transparent',
            color: tab === key ? 'var(--co7)' : 'var(--p4)',
            fontWeight: tab === key ? 600 : 400, fontSize: 'var(--fs-sm)',
            cursor: 'pointer', transition: 'all .15s',
          }}>{icon}{label}</button>
        ))}
      </div>

      {tab === TAB.KEYS     && <ApiKeysTab    token={authToken} addToast={addToast} />}
      {tab === TAB.WEBHOOKS && <WebhooksTab   token={authToken} addToast={addToast} />}
    </PageWrap>
  );
}

// ── Tab: API Keys ─────────────────────────────────────────────────────
function ApiKeysTab({ token, addToast }) {
  const [keys,    setKeys]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [label,   setLabel]   = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey,   setNewKey]   = useState(null);   // raw key exibida UMA VEZ
  const [copied,   setCopied]   = useState(false);

  const reload = () => {
    setLoading(true);
    listApiKeys(token).then(setKeys).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(reload, [token]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const d = await createApiKey(label, token);
      setNewKey(d.raw_key);
      setLabel('');
      reload();
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id) => {
    if (!confirm('Revogar esta chave? Esta ação não pode ser desfeita.')) return;
    try {
      await revokeApiKey(id, token);
      addToast('Chave revogada.', 'success');
      reload();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const copyKey = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--p4)', marginBottom: 20 }}>
        Use o header <code style={codeSt}>X-Api-Key: &lt;sua-chave&gt;</code> para autenticar requisições à API Jurir sem precisar de JWT.
      </p>

      {/* Nova key exibida uma vez */}
      {newKey && (
        <div style={{ ...cardSt, marginBottom: 20, border: '1px solid var(--jade2)', background: 'rgba(0,200,130,0.05)' }}>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--jade2)', fontWeight: 600, marginBottom: 8 }}>
            ⚠ Chave criada. Copie agora — ela não será exibida novamente.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <code style={{ ...codeSt, flex: 1, wordBreak: 'break-all', fontSize: 'var(--fs-xs)' }}>{newKey}</code>
            <button className="btn btn-cobalt btn-sm" onClick={copyKey}>
              {copied ? <CheckCircle size={13}/> : <Copy size={13}/>}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => setNewKey(null)}>
            Entendi, fechar
          </button>
        </div>
      )}

      {/* Criar nova */}
      <div style={{ ...cardSt, marginBottom: 20 }}>
        <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: 10, color: 'var(--p2)' }}>
          <Plus size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Nova API Key
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Rótulo (ex: Produção, Testes)" style={{ ...inputSt, flex: 1 }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          <button className="btn btn-cobalt btn-sm" onClick={handleCreate} disabled={creating}>
            {creating ? '…' : 'Criar'}
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? <Loading /> : keys.length === 0 ? <Empty text="Nenhuma API Key criada." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {keys.map(k => (
            <div key={k.id} style={{ ...cardSt, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Key size={16} style={{ color: k.is_active ? 'var(--co7)' : 'var(--p5)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-sm)', color: 'var(--p1)' }}>
                  {k.key_prefix}…
                  {k.label && <span style={{ color: 'var(--p4)', marginLeft: 8 }}>{k.label}</span>}
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', marginTop: 2 }}>
                  {k.is_active ? '✓ Ativa' : '✗ Revogada'} · {k.requests_count} req ·
                  Último uso: {k.last_used_at || 'nunca'} · Criada: {k.created_at}
                </div>
              </div>
              {k.is_active && (
                <button className="btn btn-ghost btn-sm" onClick={() => handleRevoke(k.id)}
                  style={{ color: 'var(--cr3)', flexShrink: 0 }}>
                  <Trash2 size={13}/>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab: Webhooks ─────────────────────────────────────────────────────
function WebhooksTab({ token, addToast }) {
  const [hooks,   setHooks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [url,     setUrl]     = useState('');
  const [secret,  setSecret]  = useState('');
  const [creating, setCreating] = useState(false);

  const reload = () => {
    setLoading(true);
    listWebhooks(token).then(setHooks).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(reload, [token]);

  const handleCreate = async () => {
    if (!url.trim()) return;
    setCreating(true);
    try {
      await createWebhook(url.trim(), secret.trim(), 'analysis.completed', token);
      setUrl(''); setSecret('');
      addToast('Webhook criado!', 'success');
      reload();
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remover este webhook?')) return;
    try {
      await deleteWebhook(id, token);
      addToast('Webhook removido.', 'success');
      reload();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const handleTest = async (id) => {
    try {
      await testWebhook(id, token);
      addToast('Payload de teste enviado!', 'success');
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  return (
    <div>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--p4)', marginBottom: 20 }}>
        O Jurir enviará um POST para a URL cadastrada quando uma análise for concluída.
        A assinatura HMAC-SHA256 é enviada no header <code style={codeSt}>X-Jurir-Signature</code>.
      </p>

      {/* Criar */}
      <div style={{ ...cardSt, marginBottom: 20 }}>
        <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: 10, color: 'var(--p2)' }}>
          <Plus size={13} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Novo Webhook
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://seu-servidor.com/jurir-webhook" style={inputSt} />
          <input value={secret} onChange={e => setSecret(e.target.value)}
            placeholder="Segredo para assinatura HMAC (opcional)" style={inputSt} />
          <button className="btn btn-cobalt btn-sm" style={{ alignSelf: 'flex-start' }}
            onClick={handleCreate} disabled={creating || !url.trim()}>
            {creating ? '…' : 'Criar Webhook'}
          </button>
        </div>
      </div>

      {/* Lista */}
      {loading ? <Loading /> : hooks.length === 0 ? <Empty text="Nenhum webhook cadastrado." /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {hooks.map(h => (
            <div key={h.id} style={{ ...cardSt, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-sm)', color: 'var(--co7)', wordBreak: 'break-all' }}>{h.url}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', marginTop: 4 }}>
                  Eventos: <span style={{ color: 'var(--p2)' }}>{h.events}</span> · {h.is_active ? '✓ Ativo' : '✗ Inativo'} · desde {h.created_at}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleTest(h.id)}>Testar</button>
                <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(h.id)} style={{ color: 'var(--cr3)' }}>
                  <Trash2 size={13}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payload de exemplo */}
      <div style={{ ...cardSt, marginTop: 24 }}>
        <p style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--p4)', marginBottom: 8 }}>Payload de exemplo (analysis.completed):</p>
        <pre style={{ fontSize: 'var(--fs-xs)', color: 'var(--co6)', margin: 0, overflowX: 'auto' }}>{JSON.stringify({
          event: "analysis.completed",
          data: {
            analysis_id: 142,
            jurir_score: 78,
            tribunal: "TJSP",
            verdict_summary: "O caso apresenta viabilidade jurídica moderada…"
          }
        }, null, 2)}</pre>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────
function PageWrap({ children }) { return <div style={{ maxWidth: '100%', margin: '0 auto', padding: '100px 24px 60px' }}>{children}</div>; }
function Loading() { return <div style={{ color: 'var(--p4)', padding: 40, textAlign: 'center' }}>Carregando…</div>; }
function Empty({ text }) { return <div style={{ color: 'var(--p4)', padding: 40, textAlign: 'center' }}>{text}</div>; }
function Unauth() { const { openModal } = useStore(); return <div style={{ textAlign: 'center', paddingTop: 40 }}><p style={{ color: 'var(--p4)', marginBottom: 16 }}>Faça login para acessar o Painel API.</p><button className="btn btn-cobalt" onClick={() => openModal('login')}>Entrar</button></div>; }
function NeedPlan() {
  const navigate = useNavigate();
  const goToPrecos = () => {
    navigate('/');
    setTimeout(() => document.getElementById('precos')?.scrollIntoView({ behavior: 'smooth' }), 250);
  };
  return <div style={{ textAlign: 'center', paddingTop: 40 }}><Zap size={40} style={{ color: 'var(--p5)', marginBottom: 12 }} /><p style={{ color: 'var(--p4)', marginBottom: 16 }}>Esta área requer o <strong>Plano API</strong>.</p><button onClick={goToPrecos} className="btn btn-cobalt">Ver Planos</button></div>;
}

const cardSt  = { background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: '14px 16px' };
const inputSt = { width: '100%', padding: '10px 14px', boxSizing: 'border-box', background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', color: 'var(--p1)', fontSize: 'var(--fs-sm)', outline: 'none' };
const codeSt  = { fontFamily: 'var(--f-mono)', background: 'rgba(0,242,254,0.08)', padding: '2px 6px', borderRadius: 4, fontSize: 'var(--fs-xs)', color: 'var(--co6)' };
