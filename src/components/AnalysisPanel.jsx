import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { useSSEAnalysis } from '../hooks/useSSEAnalysis';
import { analyzeFree, analyzePremiumPoll, pollJob, getAnalysis, wakeUp } from '../lib/api';
import AgentsGrid from './AgentsGrid';
import VerdictSection from './VerdictSection';

const LANGS = [
  { id: 'pt', label: 'PT' },
  { id: 'en', label: 'EN' },
  { id: 'es', label: 'ES' },
];

const EXAMPLES = [
  { label: 'Trabalhista', text: 'Fui demitido sem justa causa após 3 anos. A empresa se recusa a pagar as verbas rescisórias. Tenho direito a seguro-desemprego?' },
  { label: 'Consumidor',  text: 'Uma empresa cobrou valor indevido no meu cartão e nega o estorno. O produto veio com defeito. Quais são meus direitos?' },
  { label: 'Locação',     text: 'Meu locatário tem 4 meses de aluguel em atraso e se recusa a sair. Como proceder para uma ação de despejo?' },
  { label: 'Família',     text: 'Quero a guarda compartilhada dos meus filhos após separação. O outro cônjuge não concorda. Como a Justiça decide isso?' },
  { label: 'Trânsito',    text: 'Sofri um acidente de carro, a outra parte tem seguro mas a seguradora está negando o pagamento. O que posso fazer?' },
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

    // Retomar análise premium pendente (usuário voltou após checkout)
    const pendingAnalysis = sessionStorage.getItem('jurir_pending_analysis');
    const pendingPrompt   = sessionStorage.getItem('jurir_pending_prompt');
    if (pendingAnalysis && pendingPrompt) {
      sessionStorage.removeItem('jurir_pending_analysis');
      sessionStorage.removeItem('jurir_pending_prompt');
      const ud = useStore.getState().userData;
      const tok = useStore.getState().authToken;
      const hasCredits = tok && ud && (ud.premium_credits ?? 0) > 0;
      if (hasCredits) {
        setPrompt(pendingPrompt);
        setCharCount(pendingPrompt.length);
        // Pequeno delay para o store estabilizar antes de disparar
        setTimeout(() => {
          useStore.getState().addToast('✅ Crédito disponível — iniciando análise completa…', 'success');
          runSSE(pendingPrompt, 'pt');
        }, 800);
      } else if (tok) {
        // Logado mas sem crédito ainda (pode ser delay do webhook) — restaura prompt apenas
        setPrompt(pendingPrompt);
        setCharCount(pendingPrompt.length);
        useStore.getState().addToast('Crédito sendo processado. Clique em "Analisar — 16 Agentes" quando estiver pronto.', 'info');
      }
    }
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
      setFreeResult({ ...data, _prompt: prompt });
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
    // Modo transparente: premium SSE se logado com crédito, free caso contrário
    const ud = useStore.getState().userData;
    const hasCredits = authToken && ud !== null && ud !== undefined && (ud.premium_credits ?? 0) > 0;
    if (!hasCredits) { await runFree(); return; }
    setRunning(true); setWakeStatus('waking'); addToast('⚡ Acordando servidor…', 'info');
    let awake = false;
    try { awake = await Promise.race([wakeUp(), new Promise(res => setTimeout(() => res(false), 28_000))]); }
    catch { awake = false; }
    setWakeStatus(null);
    if (!awake) addToast('ℹ️ Servidor iniciando…', 'info');
    setRunning(false);
    await runSSE(prompt, lang);
  };

  const isPremiumMode = (() => {
    const ud = useStore.getState().userData;
    return authToken && ud !== null && ud !== undefined && (ud.premium_credits ?? 0) > 0;
  })();

  const getButtonLabel = () => {
    if (!running) return <><Send size={14}/> {isPremiumMode ? 'Analisar — 16 Agentes' : 'Analisar Gratuitamente'}</>;
    if (wakeStatus === 'waking') return <><Loader2 size={15} className="spin"/> Conectando…</>;
    return <><Loader2 size={15} className="spin"/> Analisando…</>;
  };

  return (
    <section id="analise" style={{ padding: '100px 24px 80px' }}>
      <div style={{ maxWidth: '100%' }}>

        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Motor de Análise Jurídica</div>
          <h2 className="t-display" style={{
            fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
            fontWeight: 400, color: 'var(--t0)', marginBottom: 14,
            letterSpacing: '-.02em',
          }}>
            Descreva seu caso e{' '}
            <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>descubra suas chances</span>
          </h2>
          <p style={{ color: 'var(--t3)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontSize: '.92rem' }}>
            Seja específico: partes envolvidas, fatos, datas, documentos e o que você precisa saber.
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
          {/* Top bar — idioma + contador, sem tabs de modo */}
          <div style={{
            borderBottom: '1px solid var(--b-subtle)',
            padding: '12px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 10,
            background: 'var(--bg-card2)',
          }}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--t4)', letterSpacing: '.12em' }}>
              CASO JURÍDICO
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.63rem', color: 'var(--t5)' }}>
                {charCount}/4000
              </span>
              <div className="mode-pill">
                {LANGS.map(l => (
                  <button key={l.id} className={`mode-pill-btn${lang === l.id ? ' active' : ''}`}
                    onClick={() => setLang(l.id)} style={{ padding: '5px 11px', fontSize: '.68rem' }}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Textarea */}
          <div style={{ padding: '22px 22px 0' }}>
            <textarea
              className="analysis-textarea"
              placeholder="Ex: Fui demitido sem justa causa após 3 anos de empresa. A empresa se recusa a pagar as verbas rescisórias. Tenho direito a seguro-desemprego e FGTS?"
              value={prompt}
              onChange={e => { setPrompt(e.target.value); setCharCount(e.target.value.length); }}
              maxLength={4000}
              style={{ minHeight: 148 }}
            />

            {/* Chips de exemplo */}
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10, marginBottom: 18 }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.58rem', color: 'var(--t5)', letterSpacing: '.1em', alignSelf: 'center', flexShrink: 0 }}>
                EXEMPLOS
              </span>
              {EXAMPLES.map((ex, i) => (
                <button key={i}
                  onClick={() => { setPrompt(ex.text); setCharCount(ex.text.length); }}
                  style={{
                    background: 'rgba(20,114,217,0.05)',
                    border: '1px solid rgba(0,242,254,0.18)',
                    borderRadius: 'var(--r-sm)',
                    padding: '4px 10px',
                    fontFamily: 'var(--f-mono)', fontSize: '.6rem',
                    color: 'var(--co7)', cursor: 'pointer',
                    letterSpacing: '.04em',
                    transition: 'all .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,242,254,0.10)'; e.currentTarget.style.borderColor = 'rgba(0,242,254,0.28)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(20,114,217,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,242,254,0.18)'; }}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom action bar */}
          <div style={{
            borderTop: '1px solid var(--b-subtle)',
            padding: '14px 22px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, flexWrap: 'wrap',
            background: 'var(--bg-card2)',
          }}>
            {/* Status indicator transparente */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {isPremiumMode ? (
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.66rem', color: 'var(--co7)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--co7)', boxShadow: '0 0 6px rgba(20,114,217,0.6)', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }}/>
                  16 agentes · Juiz IA · JURIR Score
                </span>
              ) : (
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.66rem', color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--jade2)', display: 'inline-block' }}/>
                  Gratuito · sem cadastro
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              className={`btn ${isPremiumMode ? 'btn-cobalt-ultra' : 'btn-cobalt'}`}
              onClick={handleRun}
              disabled={running}
              style={{ opacity: running ? 0.75 : 1, minWidth: 180, justifyContent: 'center' }}
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

/* ─── Markdown renderer minimalista para veredicto grátis ─── */
function MarkdownVerdict({ text }) {
  if (!text) return null;

  // Remove bloco ⟦JURIR:...⟧ do final (metadado interno do backend)
  const cleaned = text.replace(/⟦JURIR:[^⟧]*⟧/g, '').trim();

  const lines = cleaned.split('\n');
  const elements = [];
  let i = 0;

  const parseInline = (str) => {
    // **negrito**, *itálico*, `código`
    const parts = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
    return parts.map((p, idx) => {
      if (p.startsWith('**') && p.endsWith('**'))
        return <strong key={idx} style={{ color: 'var(--t0)', fontWeight: 600 }}>{p.slice(2,-2)}</strong>;
      if (p.startsWith('*') && p.endsWith('*'))
        return <em key={idx}>{p.slice(1,-1)}</em>;
      if (p.startsWith('`') && p.endsWith('`'))
        return <code key={idx} style={{ fontFamily: 'var(--f-mono)', fontSize: '.85em', color: 'var(--co7)', background: 'rgba(0,242,254,0.06)', borderRadius: 3, padding: '1px 5px' }}>{p.slice(1,-1)}</code>;
      return p;
    });
  };

  while (i < lines.length) {
    const line = lines[i];

    // Linha vazia
    if (!line.trim()) { elements.push(<div key={i} style={{ height: 10 }} />); i++; continue; }

    // Títulos ## / ###
    if (line.startsWith('### ')) {
      elements.push(
        <div key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: '.78rem', fontWeight: 600, color: 'var(--co7)', letterSpacing: '.10em', textTransform: 'uppercase', marginTop: 20, marginBottom: 6 }}>
          {line.slice(4)}
        </div>
      );
      i++; continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <div key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: '.85rem', fontWeight: 700, color: 'var(--t0)', marginTop: 22, marginBottom: 8, letterSpacing: '-.01em' }}>
          {line.slice(3)}
        </div>
      );
      i++; continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <div key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--t0)', marginTop: 22, marginBottom: 8, letterSpacing: '-.01em' }}>
          {line.slice(2)}
        </div>
      );
      i++; continue;
    }

    // Separador --- → só espaço, sem linha visual (evita linhas indesejadas no resultado grátis)
    if (/^[-_─━═]{3,}$/.test(line.trim())) {
      elements.push(<div key={i} style={{ height: 14 }} />);
      i++; continue;
    }

    // Lista — bullet •, -, *
    if (/^[•\-\*]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[•\-\*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^[•\-\*]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '8px 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--f-sans)', fontSize: '1rem', color: 'var(--t1)', lineHeight: 1.7, letterSpacing: '.01em' }}>
              <span style={{ color: 'var(--co7)', flexShrink: 0, marginTop: 2, fontSize: '.65rem' }}>◆</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Lista numerada
    if (/^\d+[.)\s]/.test(line)) {
      const items = [];
      let num = 1;
      while (i < lines.length && /^\d+[.)\s]/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+[.)\s]+/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: '8px 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontFamily: 'var(--f-sans)', fontSize: '1rem', color: 'var(--t1)', lineHeight: 1.7, letterSpacing: '.01em' }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.62rem', color: 'var(--co7)', flexShrink: 0, marginTop: 4, minWidth: 18 }}>{j+1}.</span>
              <span>{parseInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Parágrafo normal
    elements.push(
      <p key={i} style={{ fontFamily: 'var(--f-sans)', fontSize: '1rem', fontWeight: 400, color: 'var(--t1)', lineHeight: 1.75, margin: '0 0 4px', letterSpacing: '.01em' }}>
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>{elements}</div>;
}

/* ─── Free Result Card ─── */
function FreeResult({ result }) {
  const agentArea  = result.agent_area   || result.area_especialista || 'Especialista Jurídico';
  const verdict    = result.veredito     || result.verdict           || result.free_analysis || '';
  const riskLevel  = result.risk_level   || result.nivel_risco       || '';
  const confidence = result.confidence   || result.confianca         || null;
  const score      = result.jurir_score  || result.score             || null;

  const riskColor = { BAIXO: 'var(--jade2)', MÉDIO: '#F59E0B', ALTO: 'var(--cr3)', CRÍTICO: 'var(--cr3)' };
  const rC = riskColor[riskLevel] || 'var(--t4)';

  const scoreColor = !score ? 'var(--t4)' : score >= 65 ? 'var(--jade2)' : score >= 40 ? '#F59E0B' : 'var(--cr3)';
  const scoreLabel = !score ? null : score >= 80 ? 'Fortemente Favorável' : score >= 65 ? 'Favorável' : score >= 50 ? 'Parcialmente Favorável' : score >= 35 ? 'Risco Moderado' : 'Alto Risco';
  const lockCriticos = !score ? 3 : score < 40 ? 5 : score < 65 ? 3 : 2;

  const { openModal, authToken } = useStore();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Diagnóstico inicial */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--b-main)',
        borderRadius: 'var(--r-xl)', padding: 28,
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Header com área e risco */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(0,242,254,0.06)', border: '1px solid var(--b-cobalt)',
            borderRadius: 'var(--r-md)', padding: '8px 14px',
            fontFamily: 'var(--f-mono)', fontSize: '.68rem',
            color: 'var(--co7)', letterSpacing: '.08em', flexShrink: 0,
          }}>
            ⚖️ {agentArea}
          </div>
          {riskLevel && (
            <div style={{
              background: `${rC}11`, border: `1px solid ${rC}33`,
              borderRadius: 'var(--r-md)', padding: '8px 14px',
              fontFamily: 'var(--f-mono)', fontSize: '.68rem',
              color: rC, letterSpacing: '.08em', flexShrink: 0,
            }}>
              RISCO {riskLevel}
            </div>
          )}
          {confidence && (
            <div style={{
              fontFamily: 'var(--f-mono)', fontSize: '.68rem',
              color: 'var(--t4)', letterSpacing: '.06em',
              padding: '8px 0', flexShrink: 0,
            }}>
              CONFIANÇA {confidence}%
            </div>
          )}
        </div>

        <div style={{ height: 1, background: 'var(--b-subtle)', marginBottom: 20 }}/>

        <MarkdownVerdict text={verdict} />
      </div>

      {/* JURIR Score reveal */}
      {score && (
        <div style={{
          background: 'var(--bg-card)', border: `1px solid ${scoreColor}33`,
          borderRadius: 'var(--r-xl)', padding: '22px 24px',
          boxShadow: 'var(--shadow-card)',
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          {/* Número grande */}
          <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 72 }}>
            <div style={{
              fontFamily: 'var(--f-sans)', fontSize: '3.2rem', fontWeight: 700,
              color: scoreColor, lineHeight: 1, letterSpacing: '-.04em',
            }}>
              {score}
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.48rem', color: 'var(--t4)', letterSpacing: '.18em', marginTop: 3 }}>
              / 100
            </div>
          </div>

          {/* Barra + label */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--f-sans)', fontSize: '.8rem', color: scoreColor, fontWeight: 600, marginBottom: 10, letterSpacing: '.01em' }}>
              {scoreLabel}
            </div>
            <div style={{ background: 'var(--bg-card2)', borderRadius: 4, height: 5, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                height: '100%', borderRadius: 4,
                background: `linear-gradient(90deg, var(--cr3), #F59E0B, var(--jade2))`,
                width: '100%',
                clipPath: `inset(0 ${100 - score}% 0 0)`,
                transition: 'clip-path 1.2s cubic-bezier(.22,1,.36,1)',
              }}/>
            </div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.57rem', color: 'var(--t5)', letterSpacing: '.07em', lineHeight: 1.5 }}>
              Baseado na análise inicial · Score completo disponível no relatório premium
            </div>
          </div>
        </div>
      )}

      {/* Lock card — copy dinâmico */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20,114,217,0.04), rgba(139,92,246,0.03))',
        border: '1px solid var(--b-cobalt)',
        borderRadius: 'var(--r-xl)', padding: '28px 28px',
        boxShadow: 'var(--shadow-cobalt)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '1.4rem', marginBottom: 10 }}>🔍</div>
        <div style={{
          fontFamily: 'var(--f-display)', fontSize: '1.3rem', fontWeight: 600,
          color: 'var(--t0)', marginBottom: 10, letterSpacing: '-.01em',
        }}>
          Encontramos {lockCriticos} pontos críticos no seu caso
        </div>
        <p style={{ color: 'var(--t3)', fontSize: '.88rem', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 22px' }}>
          {score
            ? <>Seu JURIR Score é <strong style={{ color: scoreColor }}>{score}/100</strong>. Os 15 especialistas restantes — incluindo o <em>Advogado do Diabo</em> e o <em>Juiz IA</em> — identificaram onde seu caso pode ser fortalecido ou onde há riscos que você ainda não viu.</>
            : <>Os 15 especialistas restantes identificaram pontos críticos e oportunidades específicas no seu caso que ainda estão bloqueados — incluindo o contraditório completo e o veredicto do Juiz IA.</>
          }
        </p>
        <button
          className="btn btn-cobalt-ultra btn-lg"
          style={{ justifyContent: 'center' }}
          onClick={() => {
            if (!authToken) { openModal('login'); return; }
            // Salva prompt para retomar análise após checkout
            const currentPrompt = result._prompt || '';
            if (currentPrompt) {
              sessionStorage.setItem('jurir_pending_prompt', currentPrompt);
              sessionStorage.setItem('jurir_pending_analysis', '1');
            }
            navigate('/premium');
          }}
        >
          🔓 Ver Relatório Completo — R$ 19,90
        </button>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--t5)', letterSpacing: '.08em', marginTop: 10 }}>
          16 agentes · JURIR Score dimensional · PDF profissional · acesso imediato
        </div>
      </div>

    </div>
  );
}
