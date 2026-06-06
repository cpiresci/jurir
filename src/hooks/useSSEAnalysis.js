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
      setVeto, setAnalysisId, addToast, setStatusMessage, setTribunal,
    } = useStore.getState();

    resetAnalysis();
    setRunning(true);

    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

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
        if (r.status === 503) {
          useStore.getState().addToast('Servidor ocupado. Tente novamente em instantes.', 'error');
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

          if (t === 'start') {
            // Primeiro evento — stream conectado, agentes prestes a iniciar
            setStatusMessage(ev.message || '⚖ Conectado. Iniciando agentes…');
            if (ev.tribunal) setTribunal(ev.tribunal);

          } else if (t === 'cooldown') {
            // Cooldown de rate-limit entre análises — pode durar até 60s
            setStatusMessage(ev.message || `⏳ Aguardando ${ev.seconds}s para garantir qualidade dos providers…`);

          } else if (t === 'recovery') {
            // Recovery wait pós-agentes — providers se recuperam antes do Diabo/Juiz
            setStatusMessage(ev.message || `⏳ Consolidando análises… aguarde ${ev.seconds}s para síntese final.`);

          } else if (t === 'keepalive') {
            // Heartbeat — não faz nada visualmente, só mantém conexão viva

          } else if (t === 'agent_start' || t === 'agent_thinking') {
            // Primeiro agente chegou — limpa mensagem de status, grid toma conta
            setStatusMessage(null);
            setAgentState(ev.agent_id, { status: 'running', area: ev.area });

          } else if (t === 'agent_done') {
            setAgentState(ev.agent_id, {
              status: 'done',
              area: ev.area,
              confidence: ev.confidence,
              confidenceEstimated: ev.confidence_estimated || false,  // [FIX v7.0]
              analysis: ev.analysis,
              topRisk: ev.top_risk,
              riskLevel: ev.risk_level || null,
              durationMs: ev.duration_ms || null,
            });
            incrementCompleted();

          } else if (t === 'agent_error' || t === 'agent_skip') {
            setAgentState(ev.agent_id, { status: 'error', area: ev.area });

          } else if (t === 'devil_thinking' || t === 'devil_start') {
            setStatusMessage('⚔️ Advogado do Diabo analisando contraditório…');
            setDevil('⚔️ Advogado do Diabo analisando…');

          } else if (t === 'devil_done') {
            setStatusMessage(null);
            setDevil(ev.analysis || ev.text || ev.result || '');

          } else if (t === 'veto') {
            setVeto(true);

          } else if (t === 'judge_thinking') {
            setStatusMessage(ev.message || '⚖️ Juiz IA deliberando…');

          } else if (t === 'verdict') {
            setStatusMessage(null);
            setVerdict(ev.verdict || ev.text || ev.result || ev.analysis || '');

          } else if (t === 'saved') {
            if (ev.analysis_id) setAnalysisId(ev.analysis_id);
            if (ev.tribunal) setTribunal(ev.tribunal);

          } else if (t === 'score') {
            setScore(ev.jurir_score ?? ev.score ?? null, ev.dimensions ?? null);

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
      clearTimeout(timeout);
      useStore.getState().setRunning(false);
      useStore.getState().setStatusMessage(null);
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
