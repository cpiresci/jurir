import { useState, useRef, useEffect } from 'react';
import { Loader2, Zap, Send } from 'lucide-react';
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
    statusMessage,
  } = useStore();

  const { run: runSSE } = useSSEAnalysis();
  const pollRef = useRef(null);

  const hasPremiumResult = Object.keys(agentStates).length > 0;

  const runFree = async () => {
    setRunning(true);
    resetAnalysis();
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 600_000);
    try {
      addToast('⚡ Acordando servidor…', 'info');
      const awake = await wakeUp(ctrl.signal);
      if (!awake) { addToast('Servidor indisponível. Tente novamente em instantes.', 'error'); return; }
      const data = await analyzeFree(prompt, lang, ctrl.signal);
      setFreeResult(data);
    } catch (e) {
      if (e.name === 'AbortError') {
        addToast('Análise expirou. Tente novamente.', 'error');
      } else if (e.message.includes('504') || e.message.includes('503')) {
        addToast('Servidor a iniciar. Aguarde 30s e tente novamente.', 'error');
      } else {
        addToast(`Erro: ${e.message}`, 'error');
      }
    } finally {
      clearTimeout(t);
      setRunning(false);
    }
  };

  const runPolling = async () => {
    if (!authToken) { openModal('login'); return; }
    setRunning(true);
    resetAnalysis();
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
        } else if (job.status === 'error') {
          addToast('Erro na análise polling.', 'error');
          done = true;
        }
      }
    } catch (e) {
      addToast(`Erro polling: ${e.message}`, 'error');
    } finally {
      setRunning(false);
    }
  };

  const handleRun = async () => {
    if (!prompt.trim()) { addToast('Descreva o caso jurídico.', 'info'); return; }
    if ((mode === 'premium' || mode === 'polling') && !authToken) {
      addToast('Faça login para usar análise premium.', 'info');
      openModal('login');
      return;
    }
    if (mode === 'premium' || mode === 'polling') {
      const ud = useStore.getState().userData;
      if (ud !== null && ud !== undefined && (ud.premium_credits ?? 1) <= 0) {
        addToast('Sem créditos premium. Faça upgrade para continuar.', 'error');
        openModal('login');
        return;
      }
    }
    if (mode === 'premium' || mode === 'polling') {
      setRunning(true);
      addToast('⚡ Acordando servidor…', 'info');
      const awake = await wakeUp();
      if (!awake) {
        addToast('Servidor indisponível. Tente novamente em instantes.', 'error');
        setRunning(false);
        return;
      }
      setRunning(false);
    }
    if (mode === 'free')         await runFree();
    else if (mode === 'premium') await runSSE(prompt, lang);
    else                         await runPolling();
  };

  return (
    <section id="analise" style={{ paddingTop: 80 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '60px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--lift)', border: '1px solid var(--br)',
            borderRadius: 'var(--r-pill)', padding: '5px 14px',
            fontSize: '.72rem', color: 'var(--r3)', fontFamily: 'var(--f-mono)',
            letterSpacing: '.1em', marginBottom: 20,
          }}>
            <Zap size={11}/> ANÁLISE JURÍDICA MULTI-AGENTE
          </div>
          <h2 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 700, marginBottom: 12 }}>
            Descreva o caso
          </h2>
          <p style={{ color: 'var(--n4)', fontSize: '.9rem', maxWidth: 560, margin: '0 auto' }}>
            16 agentes especializados analisarão em paralelo. Advogado do Diabo + Juiz IA garantem o contraditório.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--lift)', borderRadius: 'var(--r-sm)', padding: 4, marginBottom: 20 }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              flex: 1, padding: '8px 12px', border: 'none', cursor: 'pointer',
              borderRadius: 'calc(var(--r-sm) - 2px)',
              background: mode === m.id ? 'var(--surface)' : 'transparent',
              color: mode === m.id ? 'var(--n0)' : 'var(--n4)',
              fontFamily: 'var(--f-sans)', fontSize: '.82rem', fontWeight: 600,
              transition: 'all .2s',
            }}>
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ex: Fui demitido sem justa causa após 3 anos de empresa. Tenho direito a aviso prévio, FGTS e multa de 40%?"
            maxLength={4000}
            style={{
              width: '100%', minHeight: 160, resize: 'vertical',
              background: 'rgba(12,12,30,0.7)',
              border: '1px solid var(--bn)', borderRadius: 'var(--r-md)',
              color: 'var(--n1)', fontFamily: 'var(--f-sans)', fontSize: '.9rem',
              lineHeight: 1.6, padding: '16px 20px',
              outline: 'none', transition: 'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--r2)'}
            onBlur={e  => e.target.style.borderColor = 'var(--bn)'}
          />
          <span style={{
            position: 'absolute', bottom: 10, right: 14,
            fontSize: '.72rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)',
          }}>
            {prompt.length}/4000
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <select value={lang} onChange={e => setLang(e.target.value)} style={{
            background: 'var(--lift)', color: 'var(--n2)',
            border: '1px solid var(--bn)', borderRadius: 'var(--r-sm)',
            padding: '9px 12px', fontFamily: 'var(--f-sans)', fontSize: '.82rem',
            outline: 'none', cursor: 'pointer',
          }}>
            <option value="pt">🇧🇷 Português</option>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
          </select>
          <button className="btn btn-crimson btn-lg" style={{ flex: 1, justifyContent: 'center' }}
            disabled={running} onClick={handleRun}>
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

        {running && statusMessage && (
          <div style={{
            marginTop: 20,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--lift)', border: '1px solid var(--bn)',
            borderRadius: 'var(--r-md)', padding: '12px 16px',
          }}>
            <Loader2 size={14} className="spin" style={{ color: 'var(--r3)', flexShrink: 0 }}/>
            <span style={{ fontSize: '.84rem', color: 'var(--n3)', fontFamily: 'var(--f-sans)' }}>
              {statusMessage}
            </span>
          </div>
        )}

        {freeResult && (
          <div style={{
            marginTop: 28, background: 'var(--surface)',
            border: '1px solid var(--bn)', borderRadius: 'var(--r-md)', padding: 24,
          }}>
            <div style={{ fontSize: '.78rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginBottom: 12 }}>
              ANÁLISE GRATUITA — {freeResult.agent_area || 'Agente selecionado automaticamente'}
            </div>
            <p style={{ color: 'var(--n1)', lineHeight: 1.75, fontSize: '.9rem', whiteSpace: 'pre-wrap' }}>
              {freeResult.analysis || JSON.stringify(freeResult)}
            </p>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--bn2)' }}>
              <p style={{ fontSize: '.8rem', color: 'var(--n4)', marginBottom: 10 }}>
                Desbloqueie todos os 16 agentes + Advogado do Diabo + PDF:
              </p>
              <button className="btn btn-gold btn-sm" onClick={() => useStore.getState().openModal('register')}>
                🔓 Ativar Premium
              </button>
            </div>
          </div>
        )}

        {(hasPremiumResult || running) && mode !== 'free' && (
          <div style={{ marginTop: 32 }}>
            <AgentsGrid/>
            <VerdictSection/>
          </div>
        )}
      </div>
    </section>
  );
}
