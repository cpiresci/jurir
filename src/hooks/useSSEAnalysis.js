import { useCallback, useRef } from 'react';
import { API_BASE } from '../lib/constants';
import { useStore } from '../store';
import { getMe } from '../lib/api';

export function useSSEAnalysis() {
  const abortRef = useRef(null);

  const run = useCallback(async (prompt, language = 'pt') => {
    const {
      authToken, resetAnalysis, setRunning, setAgentState,
      incrementCompleted, setVerdict, setDevil, setScore,
      setVeto, setAnalysisId, addToast,
    } = useStore.getState();

    resetAnalysis();
    setRunning(true);

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // [FIX] Timeout de 10 min — 16 agentes + Diabo + Juiz levam 3-4 min no Render free.
    // clearTimeout movido para o finally; não aborta antes do stream terminar.
    const timeout = setTimeout(() => ctrl.abort(), 600_000);

    try {
      const r = await fetch(`${API_BASE}/api/analyze/premium/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ prompt, language }),
        signal: ctrl.signal,
      });

      if (!r.ok) {
        // [FIX] Tratar erros HTTP com mensagens claras em vez de "HTTP 402" genérico
        if (r.status === 402) {
          useStore.getState().addToast('Sem créditos premium. Faça upgrade para continuar.', 'error');
          useStore.getState().openModal('login');
          return;
        }
        if (r.status === 401) {
          useStore.getState().addToast('Sessão expirada. Faça login novamente.', 'error');
          useStore.getState().clearAuth();
          useStore.getState().openModal('login');
          return;
        }
        const body = await r.json().catch(() => ({}));
        throw new Error(body.detail || `HTTP ${r.status}`);
      }

      const reader = r.body.getReader();
      const dec    = new TextDecoder();
      let   buf    = '';

      while (true) {
        if (ctrl.signal.aborted) break;
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });

        const lines = buf.split('\n');
        buf = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === '[DONE]') continue;

          let ev;
          try { ev = JSON.parse(raw); } catch { continue; }

          const t = ev.type;

          if (t === 'agent_start') {
            setAgentState(ev.agent_id, { status: 'running', area: ev.area });
          } else if (t === 'agent_done') {
            setAgentState(ev.agent_id, {
              status: 'done',
              area: ev.area,
              confidence: ev.confidence,
              analysis: ev.analysis,
              topRisk: ev.top_risk,
            });
            incrementCompleted();
          } else if (t === 'agent_error' || t === 'agent_skip') {
            setAgentState(ev.agent_id, { status: 'error', area: ev.area });
          } else if (t === 'devil_start') {
            setDevil('⚔️ Advogado do Diabo analisando…');
          } else if (t === 'devil_done') {
            setDevil(ev.analysis || '');
          } else if (t === 'veto') {
            setVeto(true);
          } else if (t === 'judge_done') {
            setVerdict(ev.verdict || ev.text || '');
            if (ev.analysis_id) setAnalysisId(ev.analysis_id);
          } else if (t === 'score') {
            setScore(ev.score, ev.dimensions);
          } else if (t === 'error') {
            addToast(ev.message || 'Erro no streaming', 'error');
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        useStore.getState().addToast(`Erro: ${e.message}`, 'error');
      }
    } finally {
      // [FIX] clearTimeout sempre no finally — garante limpeza em qualquer caminho
      clearTimeout(timeout);
      useStore.getState().setRunning(false);
      // [FIX] Refresca créditos do usuário após análise — evita que o store mostre
      // valor desatualizado e o usuário tente rodar novamente sem saldo
      const { authToken: tok, setAuth } = useStore.getState();
      if (tok) {
        getMe(tok).then(user => setAuth(tok, user)).catch(() => {});
      }
    }
  }, []);

  const abort = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { run, abort };
}
