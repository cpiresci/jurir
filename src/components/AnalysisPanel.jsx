import { useState, useRef, useEffect } from 'react';
import { Loader2, Zap, Send, MapPin } from 'lucide-react';
import { useStore } from '../store';
import { useSSEAnalysis } from '../hooks/useSSEAnalysis';
import { analyzeFree, analyzePremiumPoll, pollJob, getAnalysis } from '../lib/api';
import AgentsGrid from './AgentsGrid';
import VerdictSection from './VerdictSection';

const MODES = [
  { id: 'free',    label: 'Gratuito',         cls: '' },
  { id: 'premium', label: 'Premium SSE',       cls: 'flame' },
  { id: 'polling', label: 'Premium Polling',   cls: 'flame' },
];

export default function AnalysisPanel() {
  const [prompt, setPrompt] = useState(() => {
    const stored = sessionStorage.getItem('jurir_doc_prompt');
    if (stored) { sessionStorage.removeItem('jurir_doc_prompt'); return stored; }
    return '';
  });
  const [lang, setLang] = useState('pt');

  useEffect(() => {
    const stored = sessionStorage.getItem('jurir_doc_prompt');
    if (stored) { sessionStorage.removeItem('jurir_doc_prompt'); setPrompt(stored); }
  }, []);

  const {
    mode, setMode, running, setRunning, resetAnalysis, authToken,
    openModal, addToast, setFreeResult, freeResult,
    setVerdict, setDevil, setScore, agentStates, setAnalysisId,
    statusMessage, tribunal, completedAgents,
  } = useStore();

  const { run: runSSE } = useSSEAnalysis();
  const pollRef = useRef(null);
  const hasPremiumResult = Object.keys(agentStates).length > 0;

  const runFree = async () => {
    setRunning(true); resetAnalysis();
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 600_000);
    try {
      const data = await analyzeFree(prompt, lang, ctrl.signal);
      setFreeResult(data);
    } catch (e) {
      if (e.name === 'AbortError') addToast('Análise expirou. Tente novamente.', 'error');
      else if (e.message.includes('504') || e.message.includes('503')) addToast('Servidor a iniciar. Aguarde 30s e tente novamente.', 'error');
      else addToast(`Erro: ${e.message}`, 'error');
    } finally { clearTimeout(t); setRunning(false); }
  };

  const runPolling = async () => {
    if (!authToken) { openModal('login'); return; }
    setRunning(true); resetAnalysis();
    try {
      const { job_id } = await analyzePremiumPoll(prompt, authToken);
      let done = false;
      while (!done) {
        await new Promise(r => { pollRef.current = setTimeout(r, 3500); });
        const job = await pollJob(job_id, authToken);
        if (job.status === 'done' || job.status === 'completed') {
          const data = await getAnalysis(job.analysis_id || job_id, authToken);
          setVerdict(data.verdict || '');
          setDevil(data.devil_analysis || '');
          setScore(data.jurir_score, data.score_dimensions);
          setAnalysisId(data.id);
          done = true;
        } else if (job.status === 'error') { addToast('Erro na análise polling.', 'error'); done = true; }
      }
    } catch (e) { addToast(`Erro polling: ${e.message}`, 'error'); }
    finally { setRunning(false); }
  };

  const handleRun = async () => {
    if (!prompt.trim()) { addToast('Descreva o caso jurídico.', 'info'); return; }
    if ((mode === 'premium' || mode === 'polling') && !authToken) {
      addToast('Faça login para usar análise premium.', 'info');
      openModal('login'); return;
    }
    if (mode === 'premium' || mode === 'polling') {
      const ud = useStore.getState().userData;
      if (ud !== null && ud !== undefined && (ud.premium_credits ?? 1) <= 0) {
        addToast('Sem créditos premium. Faça upgrade para continuar.', 'error');
        openModal('login'); return;
      }
    }
    if (mode === 'free')         await runFree();
    else if (mode === 'premium') await runSSE(prompt, lang);
    else                         await runPolling();
  };

  return (
    <section id="analise" className="analysis-section">
      <div className="analysis-outer">

        {/* Section header */}
        <div className="section-header" style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <span className="pill pill-flame"><Zap size={10}/> Análise Jurídica Multi-Agente</span>
          </div>
          <h2 className="section-title">Descreva o caso</h2>
          <p className="section-desc">
            16 agentes especializados analisarão em paralelo. Advogado do Diabo + Juiz IA garantem o contraditório rigoroso.
          </p>
        </div>

        {/* Mode tabs */}
        <div className="mode-tabs">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`mode-tab${mode === m.id ? ` active ${m.cls}` : ''}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Textarea card */}
        <div className="textarea-card">
          <textarea
            className="main-textarea"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ex: Fui demitido sem justa causa após 3 anos de empresa. Tenho direito a aviso prévio, FGTS e multa de 40%?"
            maxLength={4000}
          />
          <div className="textarea-footer">
            <span style={{ fontSize: '.78rem', color: 'var(--n5)', fontFamily: 'var(--f-sans)' }}>
              {mode === 'free' ? 'Análise por 1 agente especialista' : '16 agentes em paralelo + contraditório + veredicto'}
            </span>
            <span className="char-count">{prompt.length}/4000</span>
          </div>
        </div>

        {/* Submit row */}
        <div className="submit-row">
          <select value={lang} onChange={e => setLang(e.target.value)} className="lang-select">
            <option value="pt">🇧🇷 Português</option>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
          </select>

          <button
            className={`btn ${mode === 'free' ? 'btn-flame' : 'btn-flame'} btn-lg`}
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={running}
            onClick={handleRun}
          >
            {running
              ? <><Loader2 size={15} className="spin"/> Analisando…</>
              : <><Send size={14}/> Analisar Caso</>
            }
          </button>

          {running && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setRunning(false); clearTimeout(pollRef.current); }}>
              Cancelar
            </button>
          )}
        </div>

        {/* Status bar */}
        {running && (statusMessage || tribunal) && (
          <div className="status-bar">
            {statusMessage && (
              <>
                <Loader2 size={14} className="spin" style={{ color: 'var(--flame)', flexShrink: 0 }}/>
                <span className="status-text">{statusMessage}</span>
              </>
            )}
            {tribunal && (
              <div className="tribunal-chip">
                <MapPin size={11}/>
                {tribunal}
              </div>
            )}
          </div>
        )}

        {/* Free result */}
        {freeResult && (
          <div className="free-result-card">
            <div className="free-result-agent-label">
              Análise Gratuita — {freeResult.agent_area || 'Agente selecionado automaticamente'}
            </div>
            <p className="free-result-text">
              {freeResult.analysis || JSON.stringify(freeResult)}
            </p>
            <div className="upgrade-footer">
              <p style={{ fontSize: '.82rem', color: 'var(--n4)', marginBottom: 12 }}>
                Desbloqueie todos os 16 agentes + Advogado do Diabo + PDF completo:
              </p>
              <button className="btn btn-flame btn-sm" onClick={() => useStore.getState().openModal('register')}>
                🔓 Ativar Premium
              </button>
            </div>
          </div>
        )}

        {/* Premium result grid */}
        {(hasPremiumResult || running) && mode !== 'free' && (
          <div style={{ marginTop: 36 }}>
            <AgentsGrid/>
            <VerdictSection/>
          </div>
        )}

      </div>
    </section>
  );
}
