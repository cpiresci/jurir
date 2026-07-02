import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "../lib/constants";

const API = API_BASE;

const T = {
  bg: "#F8F7F4", surface: "#FFFFFF", surfaceAlt: "#F2F0EB",
  border: "#E2DDD6", cobalt: "#0047AB", cobaltLight: "#E8EEFA",
  cobaltDim: "#3369C4", gold: "#C9A84C", text: "#1A1814",
  textMuted: "#6B6560", danger: "#C0392B", dangerLight: "#FDECEA",
  success: "#1A7A4A", successLight: "#E8F5EE", warning: "#C47A00",
  warningLight: "#FEF6E4",
};

function useApi(token) {
  return useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API}${path}`, {
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...opts,
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
  }, [token]);
}

function Badge({ color = T.cobalt, bg = T.cobaltLight, children }) {
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color, background: bg, fontFamily: "monospace" }}>{children}</span>;
}

function Stat({ label, value, accent = T.cobalt }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "20px 24px", borderTop: `3px solid ${accent}` }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "monospace", color: T.text }}>{value ?? "—"}</div>
    </div>
  );
}

function Btn({ onClick, children, variant = "primary", small, disabled }) {
  const s = { primary: { background: T.cobalt, color: "#fff", border: `1px solid ${T.cobalt}` }, secondary: { background: T.surface, color: T.cobalt, border: `1px solid ${T.cobalt}` }, danger: { background: T.danger, color: "#fff", border: `1px solid ${T.danger}` }, ghost: { background: "transparent", color: T.textMuted, border: `1px solid ${T.border}` } };
  return <button onClick={onClick} disabled={disabled} style={{ ...s[variant], padding: small ? "4px 12px" : "8px 18px", borderRadius: 6, fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}>{children}</button>;
}

function Table({ columns, data, loading, empty = "Nenhum resultado." }) {
  return (
    <div style={{ overflowX: "auto", border: `1px solid ${T.border}`, borderRadius: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ background: T.surfaceAlt }}>{columns.map(c => <th key={c.key} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted, borderBottom: `1px solid ${T.border}`, whiteSpace: "nowrap" }}>{c.label}</th>)}</tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: "center", color: T.textMuted }}>Carregando…</td></tr>
          : data.length === 0 ? <tr><td colSpan={columns.length} style={{ padding: 32, textAlign: "center", color: T.textMuted }}>{empty}</td></tr>
          : data.map((row, i) => <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, background: i % 2 === 0 ? T.surface : T.bg }}>{columns.map(c => <td key={c.key} style={{ padding: "10px 16px", fontSize: 13 }}>{c.render ? c.render(row[c.key], row) : row[c.key] ?? "—"}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "users", label: "Usuários" },
  { id: "analyses", label: "Análises" },
  { id: "financial", label: "Financeiro" },
  { id: "oab", label: "Verificações OAB" },
  { id: "system", label: "Sistema" },
];

function Login({ onLogin }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit() {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || "Falha");
      const token = data.token || data.access_token;
      const userData = data.user || data;
      if (!userData.is_admin) throw new Error("Acesso restrito a administradores");
      onLogin(token, userData);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: 380, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: 40, borderTop: `4px solid ${T.cobalt}` }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 32, fontWeight: 300, letterSpacing: "0.15em", color: T.cobalt }}>JURIR</div>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.textMuted, marginTop: 4 }}>Painel Administrativo</div>
        </div>
        {error && <div style={{ background: T.dangerLight, border: `1px solid ${T.danger}`, borderRadius: 6, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: T.danger }}>{error}</div>}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>E-mail</label>
          <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 14, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted, marginBottom: 6 }}>Senha</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 14, background: T.bg, color: T.text, outline: "none", boxSizing: "border-box" }} />
        </div>
        <Btn onClick={submit} disabled={loading}>{loading ? "Entrando…" : "Entrar"}</Btn>
      </div>
    </div>
  );
}

function DashboardTab({ api }) {
  const [stats, setStats] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api("/api/admin/stats").then(setStats).catch(() => {}).finally(() => setLoading(false)); }, [api]);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Stat label="Usuários" value={stats?.total_users} accent={T.cobalt} />
        <Stat label="Análises Total" value={stats?.total_analyses} accent={T.cobaltDim} />
        <Stat label="Análises Hoje" value={stats?.analyses_today} accent={T.gold} />
        <Stat label="SSE Ativos" value={stats?.sse_active} accent={T.gold} />
        <Stat label="Jobs Ativos" value={stats?.active_jobs} accent={T.success} />
        <Stat label="Max Jobs" value={stats?.max_concurrent_jobs} accent={T.textMuted} />
      </div>
      {loading && <div style={{ color: T.textMuted }}>Carregando…</div>}
    </div>
  );
}

function UsersTab({ api }) {
  const [users, setUsers] = useState([]); const [loading, setLoading] = useState(true); const [search, setSearch] = useState("");
  const load = useCallback(() => { setLoading(true); api("/api/admin/users").then(d => setUsers(d.users || d)).catch(() => setUsers([])).finally(() => setLoading(false)); }, [api]);
  useEffect(() => { load(); }, [load]);
  const filtered = users.filter(u => !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.name?.toLowerCase().includes(search.toLowerCase()));
  async function toggleBan(u) { try { await api(`/api/admin/users/${u.id}/ban`, { method: "POST", body: JSON.stringify({ banned: !u.is_banned }) }); load(); } catch(e) { alert(e.message); } }
  async function adjustCredits(u) { const v = prompt(`Créditos atuais: ${u.credits}\nNovo valor:`); if (!v) return; try { await api(`/api/admin/users/${u.id}/credits`, { method: "POST", body: JSON.stringify({ delta: parseInt(v), credit_type: "free" }) }); load(); } catch(e) { alert(e.message); } }
  async function setPlan(u) {
    const plan = prompt(`Plano atual: ${u.plan || 'free'}\n\nNovo plano:\nfree | credito | mensal | escritorio | api`);
    if (!plan) return;
    const days = plan === 'free' || plan === 'credito' ? 30 : parseInt(prompt('Dias de validade:', '30') || '30');
    try { await api(`/api/admin/users/${u.id}/plan`, { method: "POST", body: JSON.stringify({ plan, days }) }); load(); alert(`Plano '${plan}' setado!`); } catch(e) { alert(e.message); }
  }
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por e-mail ou nome…" style={{ padding: "7px 12px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, background: T.bg, color: T.text, width: 280 }} />
      </div>
      <Table loading={loading} data={filtered} empty="Nenhum usuário."
        columns={[
          { key: "id", label: "ID", render: v => <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textMuted }}>#{v}</span> },
          { key: "name", label: "Nome" },
          { key: "email", label: "E-mail" },
          { key: "plan", label: "Plano", render: (v, row) => {
              const colors = { escritorio: [T.cobalt, T.cobaltLight], api: [T.success, T.successLight], mensal: [T.gold, T.warningLight], free: [T.textMuted, T.surfaceAlt] };
              const [c, bg] = colors[v] || colors.free;
              return <span style={{ display:"flex", gap:4, alignItems:"center" }}>
                <Badge color={c} bg={bg}>{v || "free"}</Badge>
                {row.plan_expires_at && <span style={{fontSize:10,color:T.textMuted}}>até {row.plan_expires_at}</span>}
              </span>;
            } },
          { key: "credits", label: "Créditos", render: v => <span style={{ fontFamily: "monospace" }}>{v ?? 0}</span> },
          { key: "is_banned", label: "Status", render: v => v ? <Badge color={T.danger} bg={T.dangerLight}>Banido</Badge> : <Badge color={T.success} bg={T.successLight}>Ativo</Badge> },
          { key: "created_at", label: "Cadastro", render: v => v ? new Date(v).toLocaleDateString("pt-BR") : "—" },
          { key: "_a", label: "Ações", render: (_, row) => <div style={{ display: "flex", gap: 6 }}><Btn small variant={row.is_banned ? "secondary" : "danger"} onClick={() => toggleBan(row)}>{row.is_banned ? "Desbanir" : "Banir"}</Btn><Btn small variant="ghost" onClick={() => adjustCredits(row)}>Créditos</Btn><Btn small variant="secondary" onClick={() => setPlan(row)}>Plano</Btn></div> },
        ]}
      />
    </div>
  );
}

function AnalysesTab({ api }) {
  const [analyses, setAnalyses] = useState([]); const [loading, setLoading] = useState(true); const [filter, setFilter] = useState("all");
  useEffect(() => { setLoading(true); api(`/api/admin/analyses?status=${filter}`).then(d => setAnalyses(d.analyses || d)).catch(() => setAnalyses([])).finally(() => setLoading(false)); }, [api, filter]);
  async function del(id) { if (!confirm("Deletar?")) return; try { await api(`/api/admin/analyses/${id}`, { method: "DELETE" }); setAnalyses(p => p.filter(a => a.id !== id)); } catch(e) { alert(e.message); } }
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all","completed","failed","processing"].map(f => <Btn key={f} small variant={filter===f?"primary":"ghost"} onClick={() => setFilter(f)}>{f==="all"?"Todas":f==="completed"?"Concluídas":f==="failed"?"Falhas":"Em andamento"}</Btn>)}
      </div>
      <Table loading={loading} data={analyses} empty="Nenhuma análise."
        columns={[
          { key: "id", label: "ID", render: v => <span style={{ fontFamily: "monospace", fontSize: 11 }}>#{v}</span> },
          { key: "user_email", label: "Usuário" },
          { key: "caso_nome", label: "Caso" },
          { key: "status", label: "Status", render: v => { const m={completed:[T.success,T.successLight],failed:[T.danger,T.dangerLight],processing:[T.warning,T.warningLight]}; const [c,bg]=m[v]||[T.textMuted,T.surfaceAlt]; return <Badge color={c} bg={bg}>{v||"—"}</Badge>; } },
          { key: "jurir_score", label: "Score", render: v => v ? <span style={{ fontFamily: "monospace", color: T.cobalt }}>{v}</span> : "—" },
          { key: "created_at", label: "Data", render: v => v ? new Date(v).toLocaleDateString("pt-BR") : "—" },
          { key: "_d", label: "", render: (_, row) => <Btn small variant="danger" onClick={() => del(row.id)}>Deletar</Btn> },
        ]}
      />
    </div>
  );
}

function FinancialTab({ api }) {
  const [data, setData] = useState(null); const [payments, setPayments] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.all([api("/api/admin/financial/summary").catch(()=>null), api("/api/admin/financial/payments").catch(()=>[])])
      .then(([s,p]) => { setData(s); setPayments(p.payments||p||[]); }).finally(() => setLoading(false));
  }, [api]);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Stat label="Receita Hoje" value={data?.revenue_today ? `R$${data.revenue_today}` : null} accent={T.success} />
        <Stat label="Receita Mês" value={data?.revenue_month ? `R$${data.revenue_month}` : null} accent={T.success} />
        <Stat label="Receita Total" value={data?.revenue_total ? `R$${data.revenue_total}` : null} accent={T.gold} />
        <Stat label="Assinantes Pro" value={data?.pro_count} accent={T.cobalt} />
        <Stat label="MRR" value={data?.mrr ? `R$${data.mrr}` : null} accent={T.cobalt} />
        <Stat label="Churn 30d" value={data?.churn_rate ? `${data.churn_rate}%` : null} accent={T.danger} />
      </div>
      {loading && <div style={{ color: T.textMuted }}>Carregando…</div>}
      <Table loading={loading} data={payments} empty="Nenhum pagamento."
        columns={[
          { key: "stripe_payment_id", label: "ID Stripe", render: v => <span style={{ fontFamily: "monospace", fontSize: 11 }}>{v||"—"}</span> },
          { key: "user_email", label: "Usuário" },
          { key: "amount", label: "Valor", render: v => v ? <span style={{ fontFamily: "monospace" }}>R${(v/100).toFixed(2)}</span> : "—" },
          { key: "plan", label: "Plano", render: v => <Badge>{v||"—"}</Badge> },
          { key: "status", label: "Status", render: v => { const m={succeeded:[T.success,T.successLight],failed:[T.danger,T.dangerLight],pending:[T.warning,T.warningLight]}; const [c,bg]=m[v]||[T.textMuted,T.surfaceAlt]; return <Badge color={c} bg={bg}>{v||"—"}</Badge>; } },
          { key: "created_at", label: "Data", render: v => v ? new Date(v).toLocaleString("pt-BR") : "—" },
        ]}
      />
    </div>
  );
}

// [bloco5-oab] Aba "Verificações OAB pendentes" — aprovar/rejeitar manual.
function OabTab({ api }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    api("/api/admin/oab/pending").then(setPending).catch(() => setPending([])).finally(() => setLoading(false));
  }, [api]);
  useEffect(() => { load(); }, [load]);

  async function viewDoc(id) {
    try {
      const { doc_base64, doc_mime } = await api(`/api/admin/oab/${id}/doc`);
      const win = window.open();
      if (win) win.document.write(`<iframe src="data:${doc_mime};base64,${doc_base64}" style="width:100%;height:100vh;border:none"></iframe>`);
    } catch (e) { alert(e.message); }
  }

  async function approve(id) {
    setBusyId(id);
    try { await api(`/api/admin/oab/${id}/approve`, { method: "POST" }); load(); }
    catch (e) { alert(e.message); }
    finally { setBusyId(null); }
  }

  async function reject(id) {
    const reason = prompt("Motivo da rejeição (enviado por email ao usuário):");
    if (reason === null) return;
    setBusyId(id);
    try { await api(`/api/admin/oab/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }); load(); }
    catch (e) { alert(e.message); }
    finally { setBusyId(null); }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}><Btn small variant="secondary" onClick={load}>↺ Atualizar</Btn></div>
      <Table
        loading={loading}
        empty="Nenhuma verificação pendente."
        columns={[
          { key: "email", label: "Usuário" },
          { key: "oab_number", label: "OAB", render: (v, row) => `${v}/${row.oab_uf}` },
          { key: "submitted_at", label: "Enviado em", render: v => v ? new Date(v).toLocaleString("pt-BR") : "—" },
          { key: "has_doc", label: "Doc", render: (v, row) => v ? <Btn small variant="ghost" onClick={() => viewDoc(row.id)}>Ver documento</Btn> : "—" },
          { key: "id", label: "Ações", render: (id) => (
            <div style={{ display: "flex", gap: 6 }}>
              <Btn small variant="primary" disabled={busyId === id} onClick={() => approve(id)}>Aprovar</Btn>
              <Btn small variant="danger" disabled={busyId === id} onClick={() => reject(id)}>Rejeitar</Btn>
            </div>
          ) },
        ]}
        data={pending}
      />
    </div>
  );
}

function SystemTab({ api }) {
  const [health, setHealth] = useState(null); const [llm, setLlm] = useState(null); const [rag, setRag] = useState(null); const [logs, setLogs] = useState([]); const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false); const [reindexMsg, setReindexMsg] = useState(null);
  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api("/api/health").catch(()=>null), api("/api/admin/llm/status").catch(()=>null), api("/api/admin/rag/status").catch(()=>null), api("/api/admin/logs?limit=50").catch(()=>[])])
      .then(([h,l,r,lg]) => { setHealth(h); setLlm(l); setRag(r); setLogs(lg.logs||lg||[]); }).finally(() => setLoading(false));
  }, [api]);
  useEffect(() => { load(); }, [load]);
  async function resetCB(name) { try { await api(`/api/admin/llm/${name}/reset`, { method: "POST" }); load(); } catch(e) { alert(e.message); } }
  // [rag-reindex-button] Antes só dava pra reindexar via curl manual com
  // token — agora tem botão direto no painel, sem precisar sair do navegador.
  // [fix-reindex-async] A rota agora responde na hora (202) e roda em
  // background — pode levar mais de 1h se o provider ativo for Voyage sem
  // cartão (pacing de 3 RPM). Por isso faz polling do status a cada 15s
  // enquanto rag.reindexing estiver true, em vez de esperar uma resposta
  // final na mesma requisição.
  async function runReindex() {
    setReindexing(true); setReindexMsg(null);
    try {
      const r = await api("/api/admin/rag/reindex", { method: "POST" });
      setReindexMsg(r.started ? `⏳ ${r.message}` : (r.error ? `✗ Falhou: ${r.error}` : "⏳ Reindex iniciado."));
      load();
    } catch (e) {
      setReindexMsg(`✗ Falhou: ${e.message}`);
      setReindexing(false);
    }
  }
  // Enquanto o backend reportar reindexing:true no rag_corpus, continua
  // atualizando sozinho a cada 15s pra refletir progresso/conclusão sem
  // precisar de clique manual em "Atualizar".
  useEffect(() => {
    if (!rag?.rag_corpus?.reindexing) { if (reindexing && rag) setReindexing(false); return; }
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [rag?.rag_corpus?.reindexing, load]);
  const providers = llm ? Object.entries(llm) : [];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
        <Btn small variant="secondary" onClick={runReindex} disabled={reindexing || rag?.rag_corpus?.reindexing}>{(reindexing || rag?.rag_corpus?.reindexing) ? "Reindexando…" : "⟲ Reindexar RAG"}</Btn>
        <Btn small variant="secondary" onClick={load}>↺ Atualizar</Btn>
      </div>
      {reindexMsg && (
        <div style={{ background: reindexMsg.startsWith("✓") ? T.successLight : T.dangerLight, border: `1px solid ${reindexMsg.startsWith("✓") ? T.success : T.danger}`, borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: reindexMsg.startsWith("✓") ? T.success : T.danger }}>
          {reindexMsg}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 20px", borderLeft: `4px solid ${health?.status==="ok"?T.success:T.danger}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted }}>Backend</div>
          <div style={{ marginTop: 8 }}><Badge color={health?.status==="ok"?T.success:T.danger} bg={health?.status==="ok"?T.successLight:T.dangerLight}>{health?.status||(loading?"…":"offline")}</Badge></div>
          {health?.uptime && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8 }}>Uptime: {health.uptime}</div>}
        </div>
        {rag?.embedding && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 20px", borderLeft: `4px solid ${rag.embedding.degraded ? T.danger : (rag.embedding.provider === "voyage" ? T.warning : T.success)}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted }}>Embedding RAG</div>
            <div style={{ marginTop: 8 }}>
              <Badge color={rag.embedding.degraded ? T.danger : (rag.embedding.provider === "voyage" ? T.warning : T.success)} bg={rag.embedding.degraded ? T.dangerLight : (rag.embedding.provider === "voyage" ? T.warningLight : T.successLight)}>
                {rag.embedding.provider} · dim {rag.embedding.dim}
              </Badge>
            </div>
            {rag.rag_corpus && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8 }}>Corpus: {rag.rag_corpus.total_chunks} trechos · índice {rag.rag_corpus.reindexing ? "reindexando…" : (rag.rag_corpus.index_built ? "construído" : "não construído")} ({rag.rag_corpus.engine || "in-memory"})</div>}
          </div>
        )}
      </div>
      {rag?.embedding?.warning && (
        <div style={{ background: T.dangerLight, border: `1px solid ${T.danger}`, borderRadius: 8, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: T.danger }}>
          ⚠ {rag.embedding.warning}
        </div>
      )}
      {providers.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 12 }}>Circuit Breakers LLM</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            {providers.map(([name, info]) => (
              <div key={name} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{name}</span>
                  <Badge color={info.state==="closed"?T.success:info.state==="open"?T.danger:T.warning} bg={info.state==="closed"?T.successLight:info.state==="open"?T.dangerLight:T.warningLight}>{info.state||"—"}</Badge>
                </div>
                <div style={{ fontSize: 12, color: T.textMuted }}>Falhas: {info.failures??0}</div>
                {info.state!=="closed" && <div style={{ marginTop: 10 }}><Btn small variant="secondary" onClick={() => resetCB(name)}>Resetar</Btn></div>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ background: "#0F0F0F", borderRadius: 8, padding: 16, maxHeight: 300, overflowY: "auto", fontFamily: "monospace", fontSize: 12, lineHeight: 1.6 }}>
        {logs.length===0 ? <span style={{ color: "#666" }}>Sem logs.</span> : logs.map((log,i) => (
          <div key={i} style={{ color: log.level==="error"?"#FF6B6B":log.level==="warn"?"#FFD93D":"#8BE078", marginBottom: 2 }}>
            <span style={{ color: "#666" }}>{log.timestamp ? new Date(log.timestamp).toLocaleTimeString("pt-BR") : ""} </span>
            <span>[{(log.level||"info").toUpperCase()}] </span>
            {log.message||JSON.stringify(log)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem("jurir_admin_token") || "");
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const api = useApi(token);

  function handleLogin(t, u) { setToken(t); setUser(u); localStorage.setItem("jurir_admin_token", t); }
  function handleLogout() { setToken(""); setUser(null); localStorage.removeItem("jurir_admin_token"); }

  useEffect(() => { if (token && !user) { api("/api/auth/me").then(setUser).catch(() => {}); } }, [token]);

  if (!token) return <Login onLogin={handleLogin} />;

  const CONTENT = { dashboard: <DashboardTab api={api} />, users: <UsersTab api={api} />, analyses: <AnalysesTab api={api} />, financial: <FinancialTab api={api} />, oab: <OabTab api={api} />, system: <SystemTab api={api} /> };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui, sans-serif", background: T.bg }}>
      <aside style={{ width: 200, background: T.surface, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0 }}>
        <div style={{ padding: "24px 20px 16px", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 24, fontWeight: 300, letterSpacing: "0.15em", color: T.cobalt }}>JURIR</div>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: T.textMuted, marginTop: 2 }}>Admin</div>
        </div>
        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "block", width: "100%", padding: "9px 10px", borderRadius: 6, border: "none", cursor: "pointer", background: tab===t.id ? T.cobaltLight : "transparent", color: tab===t.id ? T.cobalt : T.textMuted, fontSize: 13, fontWeight: tab===t.id ? 600 : 400, textAlign: "left", marginBottom: 2 }}>{t.label}</button>
          ))}
        </nav>
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${T.border}` }}>
          {user && <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, padding: "0 2px", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>}
          <Btn variant="ghost" small onClick={handleLogout}>Sair</Btn>
        </div>
      </aside>
      <main style={{ marginLeft: 200, flex: 1, padding: "28px 32px", minWidth: 0 }}>
        <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, color: T.text, marginBottom: 24 }}>{TABS.find(t => t.id===tab)?.label}</h1>
        {CONTENT[tab]}
      </main>
    </div>
  );
}
