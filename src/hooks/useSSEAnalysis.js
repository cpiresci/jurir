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
      setVeto, setAnalysisId, addToast, setStatusMessage,
      setDevilState, setJudgeState,
    } = useStore.getState();

    // [FIX v2] Verifica token ANTES de iniciar — evita request sem auth que retorna 401 silencioso
    if (!authToken) {
      addToast('Faça login para usar análise premium.', 'error');
      useStore.getState().openModal('login');
      return;
    }

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
            setStatusMessage(ev.message || '⚖ Conectado. Iniciando agentes…');

          } else if (t === 'cooldown') {
            setStatusMessage(ev.message || `⏳ Aguardando ${ev.seconds}s para garantir qualidade dos providers…`);

          } else if (t === 'recovery') {
            setStatusMessage(ev.message || `⏳ Consolidando análises… aguarde ${ev.seconds}s para síntese final.`);

          } else if (t === 'keepalive') {
            // Heartbeat — mantém conexão viva, sem ação visual

          } else if (t === 'agent_start' || t === 'agent_thinking') {
            setStatusMessage(null);
            setAgentState(ev.agent_id, { status: 'running', area: ev.area });

          } else if (t === 'agent_done') {
            // [FIX v2] Garante que confidence seja número válido ≥ 0
            const conf = typeof ev.confidence === 'number' ? ev.confidence : 0;
            setAgentState(ev.agent_id, {
              status:     'done',
              area:       ev.area,
              confidence: conf,
              analysis:   ev.analysis,
              topRisk:    ev.top_risk,
              // [FIX] Salva riskLevel do backend para semáforo visual no card
              riskLevel:  ev.risk_level || null,
            });
            incrementCompleted();

          } else if (t === 'agent_error' || t === 'agent_skip') {
            setAgentState(ev.agent_id, { status: 'error', area: ev.area });

          } else if (t === 'devil_thinking' || t === 'devil_start') {
            // [FIX] Alimenta card do Diabo com estado running
            setStatusMessage(null);
            setDevilState({ status: 'running', analysis: '', confidence: 0 });
            setDevil('⚔️ Advogado do Diabo analisando o contraditório — aguarde…');

          } else if (t === 'devil_done') {
            setStatusMessage(null);
            // [FIX v2] devil_done pode chegar com analysis vazia se backend usou emergência
            const devilText = (ev.analysis || '').trim();
            const devilConf = typeof ev.confidence === 'number' ? ev.confidence : 0;
            // [FIX] Atualiza card do Diabo com resultado final
            setDevilState({
              status:     'done',
              analysis:   devilText || '⚔️ Contraditório processado.',
              confidence: devilConf,
            });
            setDevil(devilText || '⚔️ Contraditório processado.');

          } else if (t === 'judge_thinking') {
            // [FIX] Alimenta card do Juiz com estado running
            setStatusMessage(null);
            setJudgeState({ status: 'running', verdict: '' });

          } else if (t === 'veto') {
            setVeto(true);

          } else if (t === 'verdict') {
            setStatusMessage(null);
            const verdictText = ev.verdict || ev.text || '';
            // [FIX] Atualiza card do Juiz com veredito final
            setJudgeState({ status: 'done', verdict: verdictText });
            setVerdict(verdictText);
            // [FIX] Para o botão imediatamente ao receber o veredito.
        useStore.getState().setRunning(false);

            if (ev.analysis_id) setAnalysisId(ev.analysis_id);

          } else if (t === 'score') {
            setScore(ev.jurir_score ?? ev.score ?? null, ev.dimensions ?? null);

          } else if (t === 'error') {
            // [FIX] Marca diabo/juiz como erro se ainda estavam rodando
            const { devilState, judgeState } = useStore.getState();
            if (devilState.status === 'running') setDevilState({ status: 'error' });
            if (judgeState.status === 'running') setJudgeState({ status: 'error' });
            addToast(ev.message || 'Erro no streaming', 'error');
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        useStore.getState().addToast(`Erro: ${e.message}`, 'error');
      }
      // [FIX] Marca agentes especiais como erro em caso de exceção
      const { devilState, judgeState } = useStore.getState();
      if (devilState.status === 'running') useStore.getState().setDevilState({ status: 'error' });
      if (judgeState.status === 'running') useStore.getState().setJudgeState({ status: 'error' });
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
