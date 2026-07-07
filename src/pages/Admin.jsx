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
    if (!res.ok) {
      // [fix-api-error-detail] Antes só propagava o status HTTP (ex: "409"),
      // escondendo a mensagem real do backend (ex: "Reindex já em andamento").
      // Tenta ler o corpo JSON de erro (detail/error) antes de desistir.
      let msg = `${res.status}`;
      try { const errBody = await res.json(); msg = errBody.detail || errBody.error || msg; } catch (_) {}
      throw new Error(msg);
    }
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
  { id: "grant", label: "Conceder" },
  { id: "orgs", label: "Organizações" },
  { id: "referrals", label: "Indicações" },
  { id: "oab", label: "Verificações OAB" },
  { id: "audit", label: "Auditoria" },
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
  const [total, setTotal] = useState(0);
  // [fix-admin-users-list] Backend agora devolve { total, page, limit, users }
  // (antes um array puro) pra suportar busca/paginação server-side — sem
  // isso a base cresce e o `take: 200` client-side começava a esconder
  // usuários recentes ou antigos dependendo do filtro.
  const load = useCallback(() => {
    setLoading(true);
    const qs = search.trim() ? `?q=${encodeURIComponent(search.trim())}` : "";
    api(`/api/admin/users${qs}`).then(d => { setUsers(d.users || d || []); setTotal(d.total ?? (d.users || d || []).length); }).catch(() => setUsers([])).finally(() => setLoading(false));
  }, [api, search]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);
  async function toggleBan(u) { try { await api(`/api/admin/users/${u.id}/ban`, { method: "POST", body: JSON.stringify({ banned: !u.is_banned }) }); load(); } catch(e) { alert(e.message); } }
  async function editName(u) { const v = prompt(`Nome atual: ${u.name || '(sem nome)'}\nNovo nome:`, u.name || ""); if (v === null) return; try { await api(`/api/admin/users/${u.id}/name`, { method: "POST", body: JSON.stringify({ name: v }) }); load(); } catch(e) { alert(e.message); } }
  // [wire-grant-tab] Conceder plano/créditos saiu daqui (prompt() + caixa
  // "por ID" sem confirmação visual de e-mail) e virou a aba "Conceder"
  // dedicada, com busca por e-mail e confirmação do usuário antes de aplicar.
  async function viewReferrals(u) {
    try {
      const refs = await api(`/api/admin/users/${u.id}/referrals`);
      if (!refs.length) { alert(`${u.email} ainda não indicou ninguém.`); return; }
      alert(`Indicados por ${u.email} (${refs.length}):\n` + refs.map(r => `#${r.id} ${r.name || r.email} — ${r.plan}${r.credited ? " ✓ creditado" : ""}`).join("\n"));
    } catch(e) { alert(e.message); }
  }
  return (
    <div>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por e-mail, nome ou ID…" style={{ padding: "7px 12px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, background: T.bg, color: T.text, width: 280 }} />
        <span style={{ fontSize: 12, color: T.textMuted }}>{total} usuário(s)</span>
        <span style={{ fontSize: 12, color: T.textMuted }}>Pra conceder plano ou créditos, use a aba <b>Conceder</b>.</span>
      </div>
      <Table loading={loading} data={users} empty="Nenhum usuário."
        columns={[
          { key: "id", label: "ID", render: v => <span style={{ fontFamily: "monospace", fontSize: 11, color: T.textMuted }}>#{v}</span> },
          { key: "name", label: "Nome", render: (v, row) => <span onClick={() => editName(row)} style={{ cursor: "pointer", textDecoration: v ? "none" : "underline dotted", color: v ? T.text : T.textMuted }} title="Clique para editar">{v || "definir nome"}</span> },
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
          { key: "referrals_count", label: "Indicações", render: (v, row) => v > 0 ? <Btn small variant="ghost" onClick={() => viewReferrals(row)}>{v} indicado(s)</Btn> : <span style={{ color: T.textMuted }}>0</span> },
          { key: "is_banned", label: "Status", render: v => v ? <Badge color={T.danger} bg={T.dangerLight}>Banido</Badge> : <Badge color={T.success} bg={T.successLight}>Ativo</Badge> },
          { key: "created_at", label: "Cadastro", render: v => v ? new Date(v).toLocaleDateString("pt-BR") : "—" },
          { key: "_a", label: "Ações", render: (_, row) => <div style={{ display: "flex", gap: 6 }}><Btn small variant={row.is_banned ? "secondary" : "danger"} onClick={() => toggleBan(row)}>{row.is_banned ? "Desbanir" : "Banir"}</Btn></div> },
        ]}
      />
    </div>
  );
}

function AnalysesTab({ api }) {
  const [analyses, setAnalyses] = useState([]); const [loading, setLoading] = useState(true); const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState(""); const [total, setTotal] = useState(0);
  // [fix-admin-analyses-user-missing] Backend agora inclui user_email/user_name
  // de verdade (antes só devolvia user_id, coluna "Usuário" ficava vazia).
  useEffect(() => {
    setLoading(true);
    const qs = search.trim() ? `&q=${encodeURIComponent(search.trim())}` : "";
    const t = setTimeout(() => {
      api(`/api/admin/analyses?status=${filter}${qs}`).then(d => { setAnalyses(d.analyses || d || []); setTotal(d.total ?? (d.analyses||d||[]).length); }).catch(() => setAnalyses([])).finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [api, filter, search]);
  async function del(id) { if (!confirm("Deletar?")) return; try { await api(`/api/admin/analyses/${id}`, { method: "DELETE" }); setAnalyses(p => p.filter(a => a.id !== id)); } catch(e) { alert(e.message); } }
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        {["all","completed","failed","processing"].map(f => <Btn key={f} small variant={filter===f?"primary":"ghost"} onClick={() => setFilter(f)}>{f==="all"?"Todas":f==="completed"?"Concluídas":f==="failed"?"Falhas":"Em andamento"}</Btn>)}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por e-mail ou texto do caso…" style={{ padding: "6px 12px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, background: T.bg, color: T.text, width: 260 }} />
        <span style={{ fontSize: 12, color: T.textMuted }}>{total} análise(s)</span>
      </div>
      <Table loading={loading} data={analyses} empty="Nenhuma análise."
        columns={[
          { key: "id", label: "ID", render: v => <span style={{ fontFamily: "monospace", fontSize: 11 }}>#{v}</span> },
          { key: "user_email", label: "Usuário", render: (v, row) => <span>#{row.user_id} {row.user_name ? `— ${row.user_name}` : ""}<br/><span style={{fontSize:11,color:T.textMuted}}>{v}</span></span> },
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

// [wire-grant-tab] Aba "Conceder" — busca o usuário por e-mail (ou nome/ID),
// mostra nome/e-mail/plano/créditos ATUAIS antes de qualquer ação (resolve o
// "e-mail não aparece" — antes a ferramenta de créditos só pedia um ID, sem
// nenhuma confirmação de a quem aquele ID pertencia) e concede plano ou
// ajusta créditos via formulário — nunca via prompt() do navegador.
// Não cria/edita catálogo (isso era as antigas abas Planos/Créditos Avulso,
// que geravam PricingPlan/CreditPackage — desconectadas do checkout real e
// removidas). Aqui só chama as rotas que já existiam pra afetar 1 usuário:
// POST /api/admin/users/:id/plan e POST /api/admin/users/:id/credits.
const VALID_PLANS_UI = ["free", "credito", "mensal", "escritorio", "api"];

function GrantTab({ api }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null); // usuário escolhido
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null); // { ok, text }

  const [planChoice, setPlanChoice] = useState("mensal");
  const [planDays, setPlanDays] = useState(30);
  const [creditType, setCreditType] = useState("free");
  const [creditAmount, setCreditAmount] = useState(1);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 3) { setResults([]); return; }
    setSearching(true);
    const t = setTimeout(() => {
      api(`/api/admin/users?q=${encodeURIComponent(term)}&limit=8`)
        .then(d => setResults(d.users || d || []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query, api]);

  function selectUser(u) {
    setSelected(u); setResults([]); setQuery(""); setFeedback(null);
  }

  async function refreshSelected() {
    if (!selected) return;
    try {
      const d = await api(`/api/admin/users?q=${encodeURIComponent(selected.email)}&limit=1`);
      const fresh = (d.users || d || [])[0];
      if (fresh) setSelected(fresh);
    } catch (_) {}
  }

  async function applyPlan() {
    if (!selected) return;
    setBusy(true); setFeedback(null);
    try {
      const r = await api(`/api/admin/users/${selected.id}/plan`, { method: "POST", body: JSON.stringify({ plan: planChoice, days: planDays }) });
      setFeedback({ ok: true, text: `Plano '${r.plan}' concedido a ${selected.email}${r.plan_expires_at ? ` (válido até ${r.plan_expires_at})` : ""}.` });
      refreshSelected();
    } catch (e) { setFeedback({ ok: false, text: e.message }); } finally { setBusy(false); }
  }

  async function applyCredits(op) {
    if (!selected) return;
    const amount = parseInt(creditAmount);
    if (!Number.isFinite(amount)) { setFeedback({ ok: false, text: "Quantidade inválida." }); return; }
    setBusy(true); setFeedback(null);
    try {
      const delta = op === "remove" ? -Math.abs(amount) : amount;
      const r = await api(`/api/admin/users/${selected.id}/credits`, { method: "POST", body: JSON.stringify({ delta, credit_type: creditType }) });
      const novo = creditType === "premium" ? r.premium_credits : r.credits;
      setFeedback({ ok: true, text: `Créditos ${creditType === "premium" ? "premium" : "free"} de ${selected.email} agora: ${novo}.` });
      refreshSelected();
    } catch (e) { setFeedback({ ok: false, text: e.message }); } finally { setBusy(false); }
  }

  const inputStyle = { padding: "7px 10px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: 13 };

  return (
    <div>
      <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>1. Buscar usuário</div>
        <input
          style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }}
          placeholder="Digite o e-mail (ou nome / ID) do usuário…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {searching && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8 }}>Buscando…</div>}
        {!searching && results.length > 0 && (
          <div style={{ marginTop: 10, border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden" }}>
            {results.map(u => (
              <div key={u.id} onClick={() => selectUser(u)}
                style={{ padding: "10px 12px", cursor: "pointer", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.surface }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name || "(sem nome)"} <span style={{ color: T.textMuted, fontWeight: 400 }}>— {u.email}</span></div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>#{u.id} · plano {u.plan || "free"} · {u.credits ?? 0} créditos</div>
                </div>
                <Btn small variant="secondary" onClick={() => selectUser(u)}>Selecionar</Btn>
              </div>
            ))}
          </div>
        )}
        {!searching && query.trim().length >= 3 && results.length === 0 && (
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 8 }}>Nenhum usuário encontrado para "{query}".</div>
        )}
      </div>

      {selected && (
        <div style={{ background: T.surface, border: `1px solid ${T.cobalt}`, borderRadius: 8, padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{selected.name || "(sem nome)"}</div>
              <div style={{ fontSize: 13, color: T.textMuted, fontFamily: "monospace" }}>{selected.email}</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
                #{selected.id} · plano atual <Badge>{selected.plan || "free"}</Badge>{selected.plan_expires_at ? ` (até ${selected.plan_expires_at})` : ""}
                {" · "}{selected.credits ?? 0} créditos free · {selected.premium_credits ?? 0} créditos premium
              </div>
            </div>
            <Btn small variant="ghost" onClick={() => { setSelected(null); setFeedback(null); }}>Trocar usuário</Btn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Conceder plano</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <select style={inputStyle} value={planChoice} onChange={e => setPlanChoice(e.target.value)}>
                  {VALID_PLANS_UI.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {planChoice !== "free" && planChoice !== "credito" && (
                  <input style={{ ...inputStyle, width: 90 }} type="number" value={planDays} onChange={e => setPlanDays(parseInt(e.target.value) || 30)} placeholder="dias" />
                )}
              </div>
              <Btn onClick={applyPlan} disabled={busy}>Aplicar plano</Btn>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Conceder créditos</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <select style={inputStyle} value={creditType} onChange={e => setCreditType(e.target.value)}>
                  <option value="free">free</option>
                  <option value="premium">premium</option>
                </select>
                <input style={{ ...inputStyle, width: 90 }} type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} placeholder="quantidade" />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn small variant="secondary" disabled={busy} onClick={() => applyCredits("add")}>+ Adicionar</Btn>
                <Btn small variant="danger" disabled={busy} onClick={() => applyCredits("remove")}>− Remover</Btn>
              </div>
            </div>
          </div>

          {feedback && (
            <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 6, fontSize: 13, background: feedback.ok ? T.successLight : T.dangerLight, color: feedback.ok ? T.success : T.danger }}>
              {feedback.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// [admin-advanced] Aba "Organizações" — assentos (seats) do plano Escritório.
function OrgsTab({ api }) {
  const [orgs, setOrgs] = useState([]); const [loading, setLoading] = useState(true);
  const load = useCallback(() => { setLoading(true); api("/api/admin/organizations").then(setOrgs).catch(() => setOrgs([])).finally(() => setLoading(false)); }, [api]);
  useEffect(() => { load(); }, [load]);
  async function editSeats(o) {
    const v = prompt(`"${o.name}" — assentos inclusos hoje: ${o.included_seats} (${o.members_count} membro(s) atualmente, ${o.extra_seats} extra(s) cobrado(s))\n\nNovo total de assentos inclusos:`, o.included_seats);
    if (v === null) return;
    try { const r = await api(`/api/admin/organizations/${o.id}/seats`, { method: "POST", body: JSON.stringify({ included_seats: parseInt(v) }) }); load(); alert(`Assentos atualizados. Extra cobrado no Stripe: ${r.extra_seats}.`); }
    catch (e) { alert(e.message); }
  }
  return (
    <div>
      <Table loading={loading} data={orgs} empty="Nenhuma organização cadastrada."
        columns={[
          { key: "name", label: "Organização" },
          { key: "owner_email", label: "Dono", render: (v, row) => <span>{row.owner_name ? `${row.owner_name} — ` : ""}{v}</span> },
          { key: "plan", label: "Plano", render: v => <Badge>{v}</Badge> },
          { key: "members_count", label: "Membros" },
          { key: "included_seats", label: "Assentos inclusos" },
          { key: "extra_seats", label: "Extra cobrado", render: (v, row) => row.seat_billing_configured ? v : <span style={{color:T.textMuted}} title="STRIPE_PRICE_ID_SEAT não configurado">— (não configurado)</span> },
          { key: "created_at", label: "Criada em", render: v => v ? new Date(v).toLocaleDateString("pt-BR") : "—" },
          { key: "_a", label: "Ações", render: (_, row) => <Btn small variant="secondary" onClick={() => editSeats(row)}>Ajustar assentos</Btn> },
        ]}
      />
    </div>
  );
}

// [admin-advanced] Aba "Indicações" — programa de referral (bloco10).
function ReferralsTab({ api }) {
  const [stats, setStats] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api("/api/admin/referrals/stats").then(setStats).catch(() => null).finally(() => setLoading(false)); }, [api]);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <Stat label="Usuários indicados" value={stats?.total_referred_users} accent={T.cobalt} />
        <Stat label="Indicações creditadas" value={stats?.total_credited} accent={T.success} />
      </div>
      {loading && <div style={{ color: T.textMuted }}>Carregando…</div>}
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 12 }}>Top indicadores</div>
      <Table loading={loading} data={stats?.top_referrers || []} empty="Ainda sem indicações registradas."
        columns={[
          { key: "user_id", label: "ID", render: v => <span style={{ fontFamily: "monospace", fontSize: 11 }}>#{v}</span> },
          { key: "name", label: "Nome", render: v => v || "—" },
          { key: "email", label: "E-mail" },
          { key: "referrals_count", label: "Indicações", render: v => <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{v}</span> },
        ]}
      />
    </div>
  );
}

// [admin-advanced] Aba "Auditoria" — trilha de ações administrativas
// (admin_audit_log), pra rastrear quem fez o quê e quando.
function AuditTab({ api }) {
  const [logs, setLogs] = useState([]); const [loading, setLoading] = useState(true);
  const load = useCallback(() => { setLoading(true); api("/api/admin/audit-log?limit=200").then(setLogs).catch(() => setLogs([])).finally(() => setLoading(false)); }, [api]);
  useEffect(() => { load(); }, [load]);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}><Btn small variant="secondary" onClick={load}>↺ Atualizar</Btn></div>
      <Table loading={loading} data={logs} empty="Nenhuma ação registrada ainda."
        columns={[
          { key: "created_at", label: "Quando", render: v => v ? new Date(v).toLocaleString("pt-BR") : "—" },
          { key: "admin_email", label: "Admin" },
          { key: "action", label: "Ação", render: v => <Badge>{v}</Badge> },
          { key: "target_type", label: "Alvo", render: (v, row) => v ? `${v} #${row.target_id}` : "—" },
          { key: "details", label: "Detalhes", render: v => v ? <span style={{ fontFamily: "monospace", fontSize: 11 }}>{JSON.stringify(v)}</span> : "—" },
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
  // [wire-oab-rejected] GET /api/admin/oab/rejected existia sem UI (Achado #5
  // da auditoria 2026-07-06) — histórico de rejeições, útil pra auditar se
  // alguém reenviou e o motivo antigo ainda não foi limpo.
  const [rejected, setRejected] = useState([]);
  const [rejLoading, setRejLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api("/api/admin/oab/pending").then(setPending).catch(() => setPending([])).finally(() => setLoading(false));
  }, [api]);
  useEffect(() => { load(); }, [load]);

  const loadRejected = useCallback(() => {
    setRejLoading(true);
    api("/api/admin/oab/rejected").then(setRejected).catch(() => setRejected([])).finally(() => setRejLoading(false));
  }, [api]);
  useEffect(() => { loadRejected(); }, [loadRejected]);

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
    try { await api(`/api/admin/oab/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }); load(); loadRejected(); }
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
      <div style={{ marginTop: 32 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted }}>Rejeições (histórico)</span>
          <Btn small variant="secondary" onClick={loadRejected}>↺ Atualizar</Btn>
        </div>
        <Table
          loading={rejLoading}
          empty="Nenhuma rejeição registrada."
          columns={[
            { key: "email", label: "Usuário" },
            { key: "oab_number", label: "OAB", render: (v, row) => `${v}/${row.oab_uf}` },
            { key: "rejection_reason", label: "Motivo" },
          ]}
          data={rejected}
        />
      </div>
    </div>
  );
}

function SystemTab({ api, token }) {
  const [health, setHealth] = useState(null); const [llm, setLlm] = useState(null); const [rag, setRag] = useState(null); const [logs, setLogs] = useState([]); const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false); const [reindexMsg, setReindexMsg] = useState(null);
  const [testQuery, setTestQuery] = useState(""); const [testArea, setTestArea] = useState(""); const [testResult, setTestResult] = useState(null); const [testLoading, setTestLoading] = useState(false);
  // [wire-rag-stats] [wire-db-tables] rag/stats e db/tables existiam sem UI
  // (Achado #5 da auditoria 2026-07-06).
  const [ragStats, setRagStats] = useState(null);
  const [dbTables, setDbTables] = useState(null);
  const [exportBusy, setExportBusy] = useState(false);
  const [migrateBusy, setMigrateBusy] = useState(false); const [migrateMsg, setMigrateMsg] = useState(null);
  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      api("/api/health").catch(()=>null),
      api("/api/admin/llm/status").catch(()=>null),
      api("/api/admin/rag/status").catch(()=>null),
      api("/api/admin/logs?limit=50").catch(()=>[]),
      api("/api/admin/rag/stats").catch(()=>null),
      api("/api/admin/db/tables").catch(()=>null),
    ])
      .then(([h,l,r,lg,rs,db]) => { setHealth(h); setLlm(l); setRag(r); setLogs(lg.logs||lg||[]); setRagStats(rs); setDbTables(db); }).finally(() => setLoading(false));
  }, [api]);
  useEffect(() => { load(); }, [load]);
  async function resetCB(name) { try { await api(`/api/admin/llm/${name}/reset`, { method: "POST" }); load(); } catch(e) { alert(e.message); } }
  // [wire-rag-export] GET /api/admin/rag/export só aceita Authorization via
  // header (ao contrário de vectors-cache-download, que aceita ?token= pra
  // navegação direta) — por isso baixa como blob via fetch em vez de
  // window.location.href.
  async function runExport() {
    setExportBusy(true);
    try {
      const r = await fetch(`${API}/api/admin/rag/export`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) { const b = await r.json().catch(()=>({})); throw new Error(b.detail || `HTTP ${r.status}`); }
      const blob = await r.blob();
      const filename = r.headers.get("content-disposition")?.match(/filename="(.+)"/)?.[1] || "legislation-vectors-cache";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert(e.message); } finally { setExportBusy(false); }
  }
  async function runMigrateCacheToBinary() {
    setMigrateBusy(true); setMigrateMsg(null);
    try {
      const r = await api("/api/admin/rag/migrate-cache-to-binary", { method: "POST" });
      setMigrateMsg(r.skipped ? "Já estava no formato binário — nada a fazer." : `✓ ${r.migrated} vetores reempacotados.`);
      load();
    } catch (e) { setMigrateMsg(`✗ Falhou: ${e.message}`); } finally { setMigrateBusy(false); }
  }
  // [rag-test-search] Testa a busca de verdade contra o índice em memória —
  // "terminou de indexar" não é o mesmo que "indexou certo". Pergunta uma
  // coisa da área X, os artigos retornados batem com o esperado?
  async function runTestSearch() {
    if (!testQuery.trim()) return;
    setTestLoading(true); setTestResult(null);
    try {
      const qs = new URLSearchParams({ q: testQuery, ...(testArea.trim() ? { area: testArea.trim() } : {}) });
      const r = await api(`/api/admin/rag/test-search?${qs.toString()}`);
      setTestResult(r);
    } catch (e) {
      setTestResult({ error: e.message });
    } finally {
      setTestLoading(false);
    }
  }
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
  // [fix-rag-badge-real-tier] rag.embedding.provider vem da cascata GLOBAL
  // (embeddingProvider.js, compartilhada com memoryEngine.js) — não reflete
  // o pin específico do RAG (RAG_EMBEDDING_PROVIDER, default voyage). O
  // provider/dim reais do RAG ficam em rag.rag_corpus.embedding_tier/_dim.
  // Fallback pro campo antigo mantém compatibilidade com backend não atualizado.
  const ragTier = rag?.rag_corpus?.embedding_tier || rag?.embedding?.provider;
  const ragDim = rag?.rag_corpus?.embedding_dim ?? rag?.embedding?.dim;
  const ragDegraded = ragTier === "tfidf";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
        <Btn small variant="secondary" onClick={runReindex} disabled={reindexing || rag?.rag_corpus?.reindexing}>{(reindexing || rag?.rag_corpus?.reindexing) ? "Reindexando…" : "⟲ Reindexar RAG"}</Btn>
        <Btn small variant="secondary" onClick={load}>↺ Atualizar</Btn>
        {/* [admin-bin-download-button] Sem DevTools no celular pra pegar o
            token manualmente — o token já está em memória aqui (state
            `token`, o JWT normal de login admin), então o botão só monta
            a URL da rota que aceita ?token=... e deixa o navegador baixar. */}
        <Btn small variant="secondary" onClick={() => { window.location.href = `${API}/api/admin/rag/vectors-cache-download?token=${encodeURIComponent(token)}`; }}>⬇ Baixar cache .bin</Btn>
        <Btn small variant="ghost" disabled={exportBusy} onClick={runExport}>{exportBusy ? "Exportando…" : "⬇ Exportar cache (rota oficial)"}</Btn>
        <Btn small variant="ghost" disabled={migrateBusy} onClick={runMigrateCacheToBinary}>{migrateBusy ? "Migrando…" : "⇄ Migrar cache p/ binário"}</Btn>
      </div>
      {migrateMsg && (
        <div style={{ background: migrateMsg.startsWith("✓") ? T.successLight : T.dangerLight, border: `1px solid ${migrateMsg.startsWith("✓") ? T.success : T.danger}`, borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: migrateMsg.startsWith("✓") ? T.success : T.danger }}>
          {migrateMsg}
        </div>
      )}
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
        {ragTier && (
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 20px", borderLeft: `4px solid ${ragDegraded ? T.danger : (ragTier === "voyage" ? T.warning : T.success)}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.textMuted }}>Embedding RAG</div>
            <div style={{ marginTop: 8 }}>
              <Badge color={ragDegraded ? T.danger : (ragTier === "voyage" ? T.warning : T.success)} bg={ragDegraded ? T.dangerLight : (ragTier === "voyage" ? T.warningLight : T.successLight)}>
                {ragTier} · dim {ragDim}
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
      {ragStats && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 12 }}>Corpus RAG por área</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
            {Object.entries(ragStats.areas || {}).sort((a,b) => b[1]-a[1]).map(([area, count]) => (
              <div key={area} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px 16px" }}>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 4 }}>{area}</div>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: "monospace" }}>{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {dbTables && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 12 }}>Tabelas do banco</div>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 20px", borderLeft: `4px solid ${dbTables.all_ok ? T.success : T.danger}` }}>
            <div style={{ marginBottom: 8 }}>
              <Badge color={dbTables.all_ok ? T.success : T.danger} bg={dbTables.all_ok ? T.successLight : T.dangerLight}>{dbTables.all_ok ? "Todas as tabelas esperadas existem" : "Faltando tabela(s)"}</Badge>
            </div>
            {dbTables.missing?.length > 0 && <div style={{ fontSize: 13, color: T.danger, marginBottom: 8 }}>Faltando: {dbTables.missing.join(", ")}</div>}
            <div style={{ fontSize: 12, color: T.textMuted }}>Encontradas ({dbTables.tables_found?.length ?? 0}): {dbTables.tables_found?.join(", ")}</div>
          </div>
        </div>
      )}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.textMuted, marginBottom: 12 }}>Testar busca RAG</div>
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, padding: "16px 20px" }}>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>
            Confirma se o índice está retornando resultados corretos (não só se terminou de construir). Ex: busca "prazo prescricional trabalhista" — o topo deve trazer CLT, não Código Civil.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <input value={testQuery} onChange={e => setTestQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && runTestSearch()} placeholder="ex: prazo prescricional trabalhista" style={{ flex: "1 1 240px", padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: 13 }} />
            <input value={testArea} onChange={e => setTestArea(e.target.value)} placeholder="área (opcional)" style={{ width: 160, padding: "8px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.bg, color: T.text, fontSize: 13 }} />
            <Btn small variant="secondary" onClick={runTestSearch} disabled={testLoading || !testQuery.trim()}>{testLoading ? "Buscando…" : "Buscar"}</Btn>
          </div>
          {testResult?.error && <div style={{ color: T.danger, fontSize: 13 }}>✗ {testResult.error}</div>}
          {testResult && !testResult.error && (
            <div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>
                {testResult.count} resultado(s) em {testResult.took_ms}ms · tier {testResult.embedding_tier || "—"}
                {testResult.aviso && <span style={{ color: T.warning }}> · ⚠ {testResult.aviso}</span>}
              </div>
              {testResult.results?.map(r => (
                <div key={r.rank} style={{ borderTop: `1px solid ${T.border}`, padding: "8px 0", fontSize: 13 }}>
                  <div style={{ fontWeight: 700 }}>#{r.rank} — {r.diploma}{r.artigo ? `, ${r.artigo}` : ""} <span style={{ fontWeight: 400, color: T.textMuted }}>({r.area})</span></div>
                  <div style={{ color: T.textMuted, marginTop: 2 }}>{r.preview}…</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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

  const CONTENT = { dashboard: <DashboardTab api={api} />, users: <UsersTab api={api} />, analyses: <AnalysesTab api={api} />, financial: <FinancialTab api={api} />, grant: <GrantTab api={api} />, orgs: <OrgsTab api={api} />, referrals: <ReferralsTab api={api} />, oab: <OabTab api={api} />, audit: <AuditTab api={api} />, system: <SystemTab api={api} token={token} /> };

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
