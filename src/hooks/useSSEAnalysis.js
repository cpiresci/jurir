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

    // Timeout de 10 min — 16 agentes + Diabo + Juiz levam 3-4 min no Render free.
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
        const errData = await r.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${r.status}`);
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
            // análise iniciada — nada a fazer na UI além do estado running
          } else if (t === 'agent_thinking') {
            setAgentState(ev.agent_id, { status: 'running', area: ev.area });
          } else if (t === 'agent_done') {
            setAgentState(ev.agent_id, {
              status: 'done',
              area: ev.area,
              specialty: ev.specialty,
              confidence: ev.confidence,
              analysis: ev.analysis,
              topRisk: ev.top_risk,
              topReversal: ev.top_reversal,
              riskLevel: ev.risk_level,
              durationMs: ev.duration_ms,
            });
            incrementCompleted();
          } else if (t === 'agent_skip' || t === 'agent_error') {
            setAgentState(ev.agent_id, { status: 'error', area: ev.area });
          } else if (t === 'veto') {
            setVeto(true);
            setAgentState(ev.agent_id, { status: 'veto', area: ev.area });
          } else if (t === 'devil_thinking') {
            setDevil('⚔️ Advogado do Diabo analisando…');
          } else if (t === 'devil_done') {
            setDevil(ev.analysis || '');
          } else if (t === 'score') {
            // [FIX] backend envia jurir_score, não score
            setScore(ev.jurir_score ?? ev.score ?? 0, ev.dimensions ?? null);
          } else if (t === 'judge_thinking') {
            // opcional: pode mostrar spinner do juiz
          } else if (t === 'verdict') {
            // [FIX] backend emite 'verdict', não 'judge_done'
            setVerdict(ev.verdict || '');
            if (ev.veto_triggered) setVeto(true);
          } else if (t === 'saved') {
            // [FIX] analysis_id vem aqui, não no judge_done
            if (ev.analysis_id) setAnalysisId(ev.analysis_id);
          } else if (t === 'cooldown' || t === 'recovery' || t === 'keepalive') {
            // eventos de manutenção — ignora silenciosamente
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
    }
  }, []);

  const abort = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { run, abort };
}
