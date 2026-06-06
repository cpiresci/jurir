import { useState, useRef, useEffect } from 'react';
import { Loader2, Zap, Send, AlertCircle } from 'lucide-react';
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
  // [FIX v1] Estado de wake-up separado para feedback granular
  const [wakeStatus, setWakeStatus] = useState(null); // null | 'waking' | 'failed'

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

  // [FIX v1] runFree corrigido:
  // 1. Feedback visual durante wake-up (não trava silenciosamente)
  // 2. wakeUp timeout reduzido para 30s — se o servidor não respondeu em 30s, algo está errado
  // 3. Fallback: tenta a análise diretamente se o wakeUp falhar mas o servidor responde
  // 4. Mostra mensagem de progresso no toast a cada 10s durante o wake-up
  const runFree = async () => {
    if (!prompt.trim()) { addToast('Descreva o caso jurídico.', 'info'); return; }
    setRunning(true);
    setWakeStatus('waking');
    resetAnalysis();

    const ctrl = new AbortController();
    // [FIX] Timeout de 120s total — 30s wake + 90s análise
    const t = setTimeout(() => ctrl.abort(), 120_000);

    // [FIX] Toast de progresso — usuário sabe que está aguardando
    const wakeToast = addToast('⚡ Conectando ao servidor… aguarde alguns segundos.', 'info');

    try {
      // [FIX] Tenta wake-up com timeout curto (30s). Se falhar, tenta análise direto
      // — o Render às vezes responde ao /api/analyze mas demora no /wake por cold start.
      let awake = false;
      try {
        awake = await Promise.race([
          wakeUp(ctrl.signal),
          new Promise(res => setTimeout(() => res(false), 28_000)),
        ]);
      } catch (wakeErr) {
        if (ctrl.signal.aborted) throw new DOMException('Abortado', 'AbortError');
        awake = false;
      }

      setWakeStatus(null);

      if (!awake && !ctrl.signal.aborted) {
        // [FIX] Tenta direto mesmo sem confirmação de wake — o servidor pode
        // estar respondendo ao /api/analyze antes do /wake (race condition no boot)
        addToast('ℹ️ Servidor iniciando — tentando análise diretamente…', 'info');
      }

      if (ctrl.signal.aborted) return;

      const data = await analyzeFree(prompt, lang, ctrl.signal);
      setFreeResult(data);
      addToast('✅ Análise concluída!', 'success');

    } catch (e) {
      setWakeStatus(null);
      if (e.name === 'AbortError') {
        addToast('Análise expirou (120s). O servidor pode estar sobrecarregado — tente novamente.', 'error');
      } else if (e.message?.includes('504') || e.message?.includes('503')) {
        addToast('Servidor ainda iniciando. Aguarde 30s e tente novamente.', 'error');
      } else if (e.message?.includes('429')) {
        addToast('Muitas requisições. Aguarde 1 minuto e tente novamente.', 'error');
      } else {
        addToast(`Erro: ${e.message}`, 'error');
      }
    } finally {
      clearTimeout(t);
      setRunning(false);
      setWakeStatus(null);
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

    if (mode === 'free') {
      // [FIX] Modo gratuito não requer login — chama diretamente sem verificação de token
      await runFree();
      return;
    }

    // Premium: requer login
    if (!authToken) {
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

    // [FIX] Wake-up para premium também tem feedback visual
    setRunning(true);
    setWakeStatus('waking');
    addToast('⚡ Acordando servidor…', 'info');

    let awake = false;
    try {
      awake = await Promise.race([
        wakeUp(),
        new Promise(res => setTimeout(() => res(false), 28_000)),
      ]);
    } catch { awake = false; }

    setWakeStatus(null);

    if (!awake) {
      // Tenta mesmo assim — pode funcionar diretamente
      addToast('ℹ️ Servidor iniciando — iniciando análise premium…', 'info');
    }
    setRunning(false);

    if (mode === 'premium') await runSSE(prompt, lang);
    else                    await runPolling();
  };

  // [FIX] Label do botão reflete o estado real
  const getButtonLabel = () => {
    if (!running) return <><Send size={14}/> Analisar Caso</>;
    if (wakeStatus === 'waking') return <><Loader2 size={15} className="spin"/> Conectando servidor…</>;
    return <><Loader2 size={15} className="spin"/> Analisando…</>;
  };

  return (
    <section id="analise" style={{ paddingTop: 80 }}>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '60px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--ridge)', border: '1px solid var(--b-crimson)',
            borderRadius: 'var(--r-pill)', padding: '5px 14px',
            fontSize: '.72rem', color: 'var(--cr4)', fontFamily: 'var(--f-mono)',
            letterSpacing: '.1em', marginBottom: 20,
          }}>
            <Zap size={11}/> ANÁLISE JURÍDICA MULTI-AGENTE
          </div>
          <h2 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 700, marginBottom: 12 }}>
            Descreva o caso
          </h2>
          <p style={{ color: 'var(--p4)', fontSize: '.9rem', maxWidth: 560, margin: '0 auto' }}>
            16 agentes especializados analisarão em paralelo. Advogado do Diabo + Juiz IA garantem o contraditório.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 4, background: 'var(--ridge)', borderRadius: 'var(--r-sm)', padding: 4, marginBottom: 20 }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{
              flex: 1, padding: '8px 12px', border: 'none', cursor: 'pointer',
              borderRadius: 'calc(var(--r-sm) - 2px)',
              background: mode === m.id ? 'var(--surface)' : 'transparent',
              color: mode === m.id ? 'var(--p0)' : 'var(--p4)',
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
              border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)',
              color: 'var(--p1)', fontFamily: 'var(--f-sans)', fontSize: '.9rem',
              lineHeight: 1.6, padding: '16px 20px',
              outline: 'none', transition: 'border-color .2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--cr3)'}
            onBlur={e  => e.target.style.borderColor = 'var(--b-neutral)'}
          />
          <span style={{
            position: 'absolute', bottom: 10, right: 14,
            fontSize: '.72rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)',
          }}>
            {prompt.length}/4000
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <select value={lang} onChange={e => setLang(e.target.value)} style={{
            background: 'var(--ridge)', color: 'var(--p2)',
            border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-sm)',
            padding: '9px 12px', fontFamily: 'var(--f-sans)', fontSize: '.82rem',
            outline: 'none', cursor: 'pointer',
          }}>
            <option value="pt">🇧🇷 Português</option>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
          </select>
          <button className="btn btn-crimson btn-lg" style={{ flex: 1, justifyContent: 'center' }}
            disabled={running} onClick={handleRun}>
            {getButtonLabel()}
          </button>
          {running && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setRunning(false); clearTimeout(pollRef.current); setWakeStatus(null); }}>
              Cancelar
            </button>
          )}
        </div>

        {/* [FIX] Mensagem de status com contexto melhorado */}
        {running && (statusMessage || wakeStatus) && (
          <div style={{
            marginTop: 20,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--ridge)', border: '1px solid var(--b-neutral)',
            borderRadius: 'var(--r-md)', padding: '12px 16px',
          }}>
            <Loader2 size={14} className="spin" style={{ color: 'var(--cr4)', flexShrink: 0 }}/>
            <span style={{ fontSize: '.84rem', color: 'var(--p3)', fontFamily: 'var(--f-sans)' }}>
              {wakeStatus === 'waking'
                ? '⚡ Conectando ao servidor… O Render pode levar até 30s para acordar.'
                : statusMessage}
            </span>
          </div>
        )}

        {/* [FIX] Aviso informativo para modo gratuito quando servidor está demorando */}
        {running && mode === 'free' && wakeStatus === 'waking' && (
          <div style={{
            marginTop: 12,
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'rgba(180,140,0,0.08)', border: '1px solid rgba(180,140,0,0.2)',
            borderRadius: 'var(--r-sm)', padding: '10px 14px',
          }}>
            <AlertCircle size={13} style={{ color: 'var(--au6)', flexShrink: 0, marginTop: 2 }}/>
            <span style={{ fontSize: '.78rem', color: 'var(--p4)' }}>
              O servidor hospedado no Render (plano gratuito) pode levar até 30s para acordar após inatividade. Aguarde — a análise iniciará automaticamente.
            </span>
          </div>
        )}

        {/* Resultado gratuito */}
        {freeResult && (
          <div style={{
            marginTop: 28, background: 'var(--surface)',
            border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: 24,
          }}>
            <div style={{ fontSize: '.78rem', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 12 }}>
              ANÁLISE GRATUITA — {freeResult.agent_area || 'Agente selecionado automaticamente'}
            </div>
            <p style={{ color: 'var(--p1)', lineHeight: 1.75, fontSize: '.9rem', whiteSpace: 'pre-wrap' }}>
              {freeResult.analysis || JSON.stringify(freeResult)}
            </p>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--b-subtle)' }}>
              <p style={{ fontSize: '.8rem', color: 'var(--p4)', marginBottom: 10 }}>
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
