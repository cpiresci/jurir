import { useCallback, useRef } from 'react';
import { API_BASE } from '../lib/constants';
import { useStore } from '../store';

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

    const timeout = setTimeout(() => ctrl.abort(), 120_000);

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
      clearTimeout(timeout);

      if (!r.ok) throw new Error(`HTTP ${r.status}`);

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
      clearTimeout(timeout);
      if (e.name !== 'AbortError') {
        useStore.getState().addToast(`Erro: ${e.message}`, 'error');
      }
    } finally {
      clearTimeout(timeout);
      useStore.getState().setRunning(false);
    }
  }, []);

  const abort = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { run, abort };
}
