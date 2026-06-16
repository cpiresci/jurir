import { API_BASE } from './constants';

export async function apiFetch(path, opts = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: r.statusText }));
    throw new Error(err.detail || err.message || `HTTP ${r.status}`);
  }
  return r.json();
}

export async function checkHealth() {
  try {
    const r = await fetch(`${API_BASE}/wake`, { cache: 'no-store', mode: 'no-cors' });
    return { status: 'ok' };
  } catch { return {}; }
}

/**
 * [v10.2] Wake-up com no-cors para evitar CORS preflight bloqueado durante cold start.
 * Estratégia: envia pings no-cors (acorda o servidor sem precisar de resposta legível)
 * e em paralelo tenta pings normais com CORS para confirmar que o servidor acordou.
 */
export async function wakeUp(signal) {
  // [FIX v10.3] No Capacitor Android o ping CORS de confirmação falha antes do
  // androidScheme estar resolvido — wakeUp retornava false bloqueando o login.
  // Estratégia: tenta ping normal primeiro; se falhar 2x seguidas, assume acordado
  // após no-cors e deixa o login tentar (o backend já está de pé).
  const MAX_TRIES = 12;
  const INTERVAL  = 5000;
  let corsFails = 0;
  const url = `${API_BASE}/wake`;

  for (let i = 0; i < MAX_TRIES; i++) {
    if (signal?.aborted) return false;

    // Ping no-cors — acorda o servidor sem precisar de resposta legível
    // (nunca falha por CORS, mesmo durante cold start)
    fetch(url, { cache: 'no-store', mode: 'no-cors' }).catch(() => {});

    // Pequena espera para dar tempo ao servidor de processar o ping acima
    await new Promise(res => setTimeout(res, 800));
    if (signal?.aborted) return false;

    // Tenta ping normal para confirmar que acordou (com CORS)
    try {
      const r = await fetch(url, { cache: 'no-store', signal });
      if (r.ok) return true;
    } catch {
      corsFails++;
      // [FIX v10.3] Após 2 falhas CORS (típico no Capacitor Android),
      // assume servidor acordado — o no-cors já o acordou.
      if (corsFails >= 2) return true;
    }

    // Aguarda o restante do intervalo antes da próxima tentativa
    if (i < MAX_TRIES - 1) {
      const remaining = INTERVAL - 800;
      await new Promise(res => {
        let elapsed = 0;
        const tick = setInterval(() => {
          elapsed += 500;
          if (signal?.aborted || elapsed >= remaining) { clearInterval(tick); res(elapsed); }
        }, 500);
      });
      if (signal?.aborted) return false;
    }
  }
  return false;
}

// ── Auth ──────────────────────────────────────────────────────────────
export async function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}
export async function register(email, password) {
  return apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
}
export async function getMe(token) {
  return apiFetch('/api/auth/me', {}, token);
}

// ── Análise ───────────────────────────────────────────────────────────
export async function analyzeFree(prompt, language = 'pt', signal) {
  const r = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, language }),
    signal,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
export async function analyzePremiumPoll(prompt, token) {
  return apiFetch('/api/analyze/premium', { method: 'POST', body: JSON.stringify({ prompt }) }, token);
}
export async function pollJob(jobId, token) {
  return apiFetch(`/api/job/${jobId}`, {}, token);
}
export async function getAnalysis(id, token) {
  return apiFetch(`/api/analysis/${id}`, {}, token);
}
export async function getAnalyses(token) {
  return apiFetch('/api/analyses', {}, token);
}

// ── PDF ───────────────────────────────────────────────────────────────
export async function downloadPdf(analysisId, token) {
  const r = await fetch(`${API_BASE}/api/report/pdf/${analysisId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`PDF ${r.status}`);
  const blob = await r.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `jurir-analise-${analysisId}.pdf`; a.click();
  URL.revokeObjectURL(url);
}

// ── Delta Analysis ────────────────────────────────────────────────────
export async function analyzeDelta(body, token) {
  return apiFetch('/api/delta/analyze', { method: 'POST', body: JSON.stringify(body) }, token);
}
export async function deltaSummary(body, token) {
  return apiFetch('/api/delta/summary', { method: 'POST', body: JSON.stringify(body) }, token);
}

// ── Upload de Documento ───────────────────────────────────────────────
export async function analyzeDocument(formData, token) {
  const r = await fetch(`${API_BASE}/api/document/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// ── Gerador de Petições ───────────────────────────────────────────────
export async function generatePetition(body, token) {
  const r = await fetch(`${API_BASE}/api/petition/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: r.statusText }));
    throw new Error(err.detail || `HTTP ${r.status}`);
  }
  const blob = await r.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `jurir_peticao_${body.analysis_id}.docx`; a.click();
  URL.revokeObjectURL(url);
}

// ── Simulador de Instâncias ───────────────────────────────────────────
export async function simulateInstances(body, token) {
  return apiFetch('/api/analyze/simulate-instances', { method: 'POST', body: JSON.stringify(body) }, token);
}

// ── Monitoramento de Processos ────────────────────────────────────────
export async function addMonitoring(body, token) {
  return apiFetch('/api/monitoring/add', { method: 'POST', body: JSON.stringify(body) }, token);
}
export async function listMonitoring(token) {
  return apiFetch('/api/monitoring/list', {}, token);
}
export async function removeMonitoring(numero_processo, token) {
  return apiFetch(`/api/monitoring/${encodeURIComponent(numero_processo)}`, { method: 'DELETE' }, token);
}

// ── Stripe ────────────────────────────────────────────────────────────
export async function createCheckoutSession(token, plan = 'credito') {
  return apiFetch('/api/create-checkout-session', { method: 'POST', body: JSON.stringify({ plan }) }, token);
}

// ── Verificação de Serial ─────────────────────────────────────────────
export async function verifySerial(serial) {
  const r = await fetch(`${API_BASE}/verify/${encodeURIComponent(serial)}`);
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: r.statusText }));
    throw new Error(err.detail || `HTTP ${r.status}`);
  }
  return r.json();
}

// ── Org (Plano Escritório) ─────────────────────────────────────────────
export async function createOrg(name, token) {
  return apiFetch('/api/org', { method: 'POST', body: JSON.stringify({ name }) }, token);
}
export async function getMyOrg(token) {
  return apiFetch('/api/org/me', {}, token);
}
export async function uploadOrgLogo(logo_base64, logo_mime, token) {
  return apiFetch('/api/org/logo', { method: 'POST', body: JSON.stringify({ logo_base64, logo_mime }) }, token);
}
export async function removeOrgLogo(token) {
  return apiFetch('/api/org/logo', { method: 'DELETE' }, token);
}
export async function getOrgMembers(token) {
  return apiFetch('/api/org/members', {}, token);
}
export async function getOrgDashboard(token) {
  return apiFetch('/api/org/dashboard', {}, token);
}
export async function inviteMember(email, role, token) {
  return apiFetch('/api/org/invite', { method: 'POST', body: JSON.stringify({ email, role }) }, token);
}
export async function removeMember(user_id, token) {
  return apiFetch(`/api/org/members/${user_id}`, { method: 'DELETE' }, token);
}
export async function acceptInvite(inviteToken, token) {
  return apiFetch(`/api/org/accept-invite?token=${inviteToken}`, {}, token);
}

// ── Exportação ZIP (Plano Escritório) ──────────────────────────────────
export async function downloadZip(analysis_ids, token) {
  const r = await fetch(`${API_BASE}/api/report/zip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ analysis_ids }),
  });
  if (!r.ok) throw new Error(`ZIP ${r.status}`);
  const blob = await r.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'jurir_lote.zip'; a.click();
  URL.revokeObjectURL(url);
}

// ── API Keys (Plano API) ───────────────────────────────────────────────
export async function listApiKeys(token) {
  return apiFetch('/api/keys', {}, token);
}
export async function createApiKey(label, token) {
  return apiFetch('/api/keys', { method: 'POST', body: JSON.stringify({ label }) }, token);
}
export async function revokeApiKey(id, token) {
  return apiFetch(`/api/keys/${id}`, { method: 'DELETE' }, token);
}

// ── Webhooks (Plano API) ───────────────────────────────────────────────
export async function listWebhooks(token) {
  return apiFetch('/api/webhooks', {}, token);
}
export async function createWebhook(url, secret, events, token) {
  return apiFetch('/api/webhooks', { method: 'POST', body: JSON.stringify({ url, secret, events }) }, token);
}
export async function deleteWebhook(id, token) {
  return apiFetch(`/api/webhooks/${id}`, { method: 'DELETE' }, token);
}
export async function testWebhook(id, token) {
  return apiFetch(`/api/webhooks/${id}/test`, { method: 'POST' }, token);
}
