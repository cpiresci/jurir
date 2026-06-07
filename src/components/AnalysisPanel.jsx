import { useState, useRef, useEffect } from 'react';
import { Loader2, Send, AlertCircle, ChevronDown } from 'lucide-react';
import { useStore } from '../store';
import { useSSEAnalysis } from '../hooks/useSSEAnalysis';
import { analyzeFree, analyzePremiumPoll, pollJob, getAnalysis, wakeUp } from '../lib/api';
import AgentsGrid from './AgentsGrid';
import VerdictSection from './VerdictSection';

const MODES = [
  { id: 'free',    label: 'Gratuito' },
  { id: 'premium', label: 'Premium SSE' },
  { id: 'polling', label: 'Premium Polling' },
];

const LANGS = [
  { id: 'pt', label: 'PT' },
  { id: 'en', label: 'EN' },
  { id: 'es', label: 'ES' },
];

const EXAMPLES = [
  'Fui demitido sem justa causa após 3 anos de empresa. A empresa se recusa a pagar as verbas rescisórias corretas. O que tenho direito?',
  'Meu locatário está com 4 meses de aluguel em atraso e se recusa a sair do imóvel. Como proceder juridicamente?',
  'Uma empresa debitou valores indevidos no meu cartão de crédito e não quer estornar. Quais são meus direitos como consumidor?',
];

export default function AnalysisPanel() {
  const [prompt, setPrompt] = useState(() => {
    const stored = sessionStorage.getItem('jurir_doc_prompt');
    if (stored) { sessionStorage.removeItem('jurir_doc_prompt'); return stored; }
    return '';
  });
  const [lang, setLang] = useState('pt');
  const [wakeStatus, setWakeStatus] = useState(null);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const stored = sessionStorage.getItem('jurir_doc_prompt');
    if (stored) { sessionStorage.removeItem('jurir_doc_prompt'); setPrompt(stored); }
  }, []);

  const {
    mode, setMode, running, setRunning, resetAnalysis, authToken,
    openModal, addToast, setFreeResult, freeResult,
    setVerdict, setDevil, setScore, agentStates, setAnalysisId,
    statusMessage,
  } = useStore();

  const { run: runSSE } = useSSEAnalysis();
  const pollRef = useRef(null);

  const hasPremiumResult = Object.keys(agentStates).length > 0;

  const runFree = async () => {
    if (!prompt.trim()) { addToast('Descreva o caso jurídico.', 'info'); return; }
    setRunning(true); setWakeStatus('waking'); resetAnalysis();
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 120_000);
    addToast('⚡ Conectando ao servidor…', 'info');
    try {
      let awake = false;
      try { awake = await Promise.race([wakeUp(ctrl.signal), new Promise(res => setTimeout(() => res(false), 28_000))]); }
      catch (wakeErr) { if (ctrl.signal.aborted) throw new DOMException('Abortado', 'AbortError'); awake = false; }
      setWakeStatus(null);
      if (!awake && !ctrl.signal.aborted) addToast('ℹ️ Servidor iniciando — tentando análise…', 'info');
      if (ctrl.signal.aborted) return;
      const data = await analyzeFree(prompt, lang, ctrl.signal);
      setFreeResult(data);
      addToast('✅ Análise concluída!', 'success');
    } catch (e) {
      setWakeStatus(null);
      if (e.name === 'AbortError') addToast('Análise expirou (120s). Tente novamente.', 'error');
      else if (e.message?.includes('504') || e.message?.includes('503')) addToast('Servidor iniciando. Aguarde 30s.', 'error');
      else if (e.message?.includes('429')) addToast('Muitas requisições. Aguarde 1 minuto.', 'error');
      else addToast(`Erro: ${e.message}`, 'error');
    } finally { clearTimeout(t); setRunning(false); setWakeStatus(null); }
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
          setVerdict(data.verdict || ''); setDevil(data.devil_analysis || '');
          setScore(data.jurir_score, data.score_dimensions); setAnalysisId(data.id);
          done = true;
        } else if (job.status === 'error') { addToast('Erro na análise.', 'error'); done = true; }
      }
    } catch (e) { addToast(`Erro polling: ${e.message}`, 'error'); }
    finally { setRunning(false); }
  };

  const handleRun = async () => {
    if (!prompt.trim()) { addToast('Descreva o caso jurídico.', 'info'); return; }
    if (mode === 'free') { await runFree(); return; }
    if (!authToken) { addToast('Faça login para análise premium.', 'info'); openModal('login'); return; }
    const ud = useStore.getState().userData;
    if (ud !== null && ud !== undefined && (ud.premium_credits ?? 1) <= 0) { addToast('Sem créditos premium.', 'error'); openModal('login'); return; }
    setRunning(true); setWakeStatus('waking'); addToast('⚡ Acordando servidor…', 'info');
    let awake = false;
    try { awake = await Promise.race([wakeUp(), new Promise(res => setTimeout(() => res(false), 28_000))]); }
    catch { awake = false; }
    setWakeStatus(null);
    if (!awake) addToast('ℹ️ Servidor iniciando…', 'info');
    setRunning(false);
    if (mode === 'premium') await runSSE(prompt, lang);
    else await runPolling();
  };

  const getButtonLabel = () => {
    if (!running) return <><Send size={14}/> Analisar Caso</>;
    if (wakeStatus === 'waking') return <><Loader2 size={15} className="spin"/> Conectando…</>;
    return <><Loader2 size={15} className="spin"/> Analisando…</>;
  };

  return (
    <section id="analise" style={{ padding: '100px 24px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Motor de Análise Jurídica</div>
          <h2 className="t-display" style={{
            fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
            fontWeight: 400, color: 'var(--t0)', marginBottom: 14,
            letterSpacing: '-.02em',
          }}>
            Descreva seu caso e{' '}
            <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>a IA faz o resto</span>
          </h2>
          <p style={{ color: 'var(--t3)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontSize: '.92rem' }}>
            Seja específico: partes envolvidas, fatos relevantes, o que você quer saber.
          </p>
        </div>

        {/* Main panel */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--b-main)',
          borderRadius: 'var(--r-xl)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
        }}>
          {/* Top bar */}
          <div style={{
            borderBottom: '1px solid var(--b-subtle)',
            padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
            background: 'var(--bg-card2)',
          }}>
            {/* Mode toggle */}
            <div className="mode-pill">
              {MODES.map(m => (
                <button key={m.id} className={`mode-pill-btn${mode === m.id ? ' active' : ''}`}
                  onClick={() => setMode(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Lang + char count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t5)' }}>
                {charCount}/4000
              </span>
              <div className="mode-pill">
                {LANGS.map(l => (
                  <button key={l.id} className={`mode-pill-btn${lang === l.id ? ' active' : ''}`}
                    onClick={() => setLang(l.id)} style={{ padding: '6px 12px' }}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Textarea area */}
          <div style={{ padding: '24px 24px 0' }}>
            <textarea
              className="analysis-textarea"
              placeholder="Descreva seu caso jurídico com detalhes: partes envolvidas, fatos, datas, documentos, e o que você precisa saber…"
              value={prompt}
              onChange={e => { setPrompt(e.target.value); setCharCount(e.target.value.length); }}
              maxLength={4000}
              style={{ minHeight: 160 }}
            />

            {/* Examples */}
            <div style={{ marginTop: 10, marginBottom: 20 }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.63rem', color: 'var(--t5)', letterSpacing: '.08em' }}>EXEMPLOS: </span>
              {EXAMPLES.map((ex, i) => (
                <button key={i}
                  onClick={() => { setPrompt(ex); setCharCount(ex.length); }}
                  style={{
                    background: 'none', border: 'none', padding: '2px 6px',
                    fontFamily: 'var(--f-mono)', fontSize: '.63rem',
                    color: 'var(--co7)', cursor: 'pointer', letterSpacing: '.03em',
                    textDecoration: 'underline', textDecorationColor: 'rgba(20,114,217,0.3)',
                    transition: 'color .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--co8)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--co7)'}
                >
                  Exemplo {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom action bar */}
          <div style={{
            borderTop: '1px solid var(--b-subtle)',
            padding: '16px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, flexWrap: 'wrap',
            background: 'var(--bg-card2)',
          }}>
            {/* Mode info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {mode === 'free' ? (
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.68rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--jade2)', display: 'inline-block' }}/>
                  Gratuito · 1 agente especialista
                </span>
              ) : (
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.68rem', color: 'var(--co7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--co7)', boxShadow: '0 0 6px rgba(20,114,217,0.6)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }}/>
                  Premium · 16 agentes + Juiz IA
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              className="btn btn-cobalt"
              onClick={handleRun}
              disabled={running}
              style={{ opacity: running ? 0.75 : 1, minWidth: 160, justifyContent: 'center' }}
            >
              {getButtonLabel()}
            </button>
          </div>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div style={{
            marginTop: 16, padding: '12px 20px',
            background: 'rgba(20,114,217,0.05)', border: '1px solid var(--b-cobalt)',
            borderRadius: 'var(--r-md)',
            fontFamily: 'var(--f-mono)', fontSize: '.75rem',
            color: 'var(--co7)', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Loader2 size={13} className="spin"/> {statusMessage}
          </div>
        )}

        {/* Results */}
        {freeResult && (
          <div style={{ marginTop: 40 }}>
            <FreeResult result={freeResult} />
          </div>
        )}

        {hasPremiumResult && (
          <div style={{ marginTop: 40 }}>
            <AgentsGrid />
            <VerdictSection />
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Free Result Card ─── */
function FreeResult({ result }) {
  const agentArea   = result.agent_area   || result.area_especialista || 'Especialista Jurídico';
  const verdict     = result.veredito     || result.verdict           || result.free_analysis || '';
  const riskLevel   = result.risk_level   || result.nivel_risco       || '';
  const confidence  = result.confidence   || result.confianca         || null;

  const riskColor = { BAIXO: 'var(--jade2)', MÉDIO: '#F59E0B', ALTO: 'var(--cr3)', CRÍTICO: 'var(--cr3)' };
  const rC = riskColor[riskLevel] || 'var(--t4)';

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--b-main)',
      borderRadius: 'var(--r-xl)', padding: 32,
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          background: 'rgba(20,114,217,0.06)', border: '1px solid var(--b-cobalt)',
          borderRadius: 'var(--r-md)', padding: '10px 16px',
          fontFamily: 'var(--f-mono)', fontSize: '.7rem',
          color: 'var(--co7)', letterSpacing: '.08em',
          flexShrink: 0,
        }}>
          ⚖️ {agentArea}
        </div>
        {riskLevel && (
          <div style={{
            background: `${rC}11`, border: `1px solid ${rC}33`,
            borderRadius: 'var(--r-md)', padding: '10px 16px',
            fontFamily: 'var(--f-mono)', fontSize: '.7rem',
            color: rC, letterSpacing: '.08em', flexShrink: 0,
          }}>
            RISCO {riskLevel}
          </div>
        )}
        {confidence && (
          <div style={{
            fontFamily: 'var(--f-mono)', fontSize: '.7rem',
            color: 'var(--t4)', letterSpacing: '.06em',
            padding: '10px 0', flexShrink: 0,
          }}>
            CONFIANÇA {confidence}%
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--b-subtle)', marginBottom: 24 }}/>

      {/* Verdict text */}
      <div style={{
        fontFamily: 'var(--f-display)', fontSize: '1.05rem', fontWeight: 400,
        color: 'var(--t1)', lineHeight: 1.75,
        whiteSpace: 'pre-wrap',
      }}>
        {verdict}
      </div>

      {/* Footer note */}
      <div style={{
        marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--b-subtle)',
        fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t5)',
        letterSpacing: '.08em',
      }}>
        ANÁLISE GRATUITA · 1 AGENTE · PARA ANÁLISE COMPLETA COM 16 AGENTES FAÇA UPGRADE
      </div>
    </div>
  );
}
