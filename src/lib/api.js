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
  const r = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
  return r.json().catch(() => ({}));
}

export async function login(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email, password) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token) {
  return apiFetch('/api/auth/me', {}, token);
}

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
  return apiFetch('/api/analyze/premium', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  }, token);
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

export async function downloadPdf(analysisId, token) {
  const r = await fetch(`${API_BASE}/api/report/pdf/${analysisId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`PDF ${r.status}`);
  const blob = await r.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `jurir-analise-${analysisId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function analyzeDelta(body, token) {
  return apiFetch('/api/delta/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
  }, token);
}

export async function analyzeDocument(formData, token) {
  const r = await fetch(`${API_BASE}/api/document/analyze`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
