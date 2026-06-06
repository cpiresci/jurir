import { useState } from 'react';
import { CheckCircle, Loader2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { AGENT_AREAS } from '../lib/constants';
import { useStore } from '../store';

const STATUS_ICON = {
  idle:    <Clock       size={13} style={{ color: 'var(--p5)' }}/>,
  running: <Loader2    size={13} className="spin" style={{ color: 'var(--cr4)' }}/>,
  done:    <CheckCircle size={13} style={{ color: 'var(--jade2)' }}/>,
  error:   <XCircle    size={13} style={{ color: 'var(--cr5)' }}/>,
};

// ── Semáforo de risco ─────────────────────────────────────────────────
const RISK_DOT = {
  BAIXO:   { color: '#10b981', label: 'BAIXO'   },
  MÉDIO:   { color: '#f59e0b', label: 'MÉDIO'   },
  ALTO:    { color: '#ef4444', label: 'ALTO'    },
  CRÍTICO: { color: '#dc2626', label: 'CRÍTICO' },
  medium:  { color: '#f59e0b', label: 'MÉDIO'   },
  low:     { color: '#10b981', label: 'BAIXO'   },
  high:    { color: '#ef4444', label: 'ALTO'    },
};

function RiskSemaphore({ level }) {
  if (!level) return null;
  const cfg = RISK_DOT[level] || RISK_DOT['MÉDIO'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: cfg.color,
        boxShadow: `0 0 5px ${cfg.color}88`,
        flexShrink: 0,
      }}/>
      <span style={{
        fontSize: '.62rem', color: cfg.color,
        fontFamily: 'var(--f-mono)', letterSpacing: '.06em',
      }}>
        {cfg.label}
      </span>
    </div>
  );
}

// ── Card de agente especialista ───────────────────────────────────────
function AgentCard({ id, area, icon }) {
  const [expanded, setExpanded] = useState(false);
  const agentStates = useStore(s => s.agentStates);
  const s      = agentStates[id];
  const status = s?.status || 'idle';

  const showConf = status === 'done' && s?.confidence != null && s.confidence > 0;
  const showDone = status === 'done' && (!s?.confidence || s.confidence === 0);
  const analysis = s?.analysis || '';
  const PREVIEW  = 240;
  const needsExpand = analysis.length > PREVIEW;
  const displayText = expanded ? analysis : analysis.slice(0, PREVIEW);

  return (
    <div className={`agent-card ${status}`}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: (analysis || s?.riskLevel) ? 10 : 0 }}>
        <span style={{ fontSize: '.95rem' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.78rem', fontWeight: 600, color: status === 'done' ? 'var(--p1)' : 'var(--p3)' }}>
            {area}
          </div>
          {showConf && (
            <div style={{ fontSize: '.7rem', color: 'var(--p4)', fontFamily: 'var(--f-mono)' }}>
              conf: {s.confidence}%
            </div>
          )}
          {showDone && (
            <div style={{ fontSize: '.7rem', color: 'var(--jade2)', fontFamily: 'var(--f-mono)' }}>
              ✓ analisado
            </div>
          )}
          {status === 'done' && s?.riskLevel && (
            <RiskSemaphore level={s.riskLevel}/>
          )}
        </div>
        {STATUS_ICON[status]}
      </div>

      {analysis && (
        <div style={{ borderTop: '1px solid var(--b-subtle)', paddingTop: 8, marginTop: 6 }}>
          <p style={{
            fontSize: '.74rem', color: 'var(--p4)', lineHeight: 1.55, margin: 0,
            whiteSpace: 'pre-wrap',
          }}>
            {displayText}{!expanded && needsExpand ? '…' : ''}
          </p>
          {needsExpand && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3,
                marginTop: 6, padding: 0,
                fontSize: '.68rem', color: 'var(--cr4)',
                fontFamily: 'var(--f-mono)', letterSpacing: '.04em',
              }}
            >
              {expanded
                ? <><ChevronUp size={10}/> menos</>
                : <><ChevronDown size={10}/> ver análise completa ({analysis.length} chars)</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Card do Advogado do Diabo ─────────────────────────────────────────
// Ícone ⚔️ em emoji — consistente com os 16 agentes especialistas
function DevilCard() {
  const [expanded, setExpanded] = useState(false);
  const devilState = useStore(s => s.devilState);
  const { status, analysis, confidence } = devilState;

  const PREVIEW     = 280;
  const needsExpand = analysis.length > PREVIEW;
  const displayText = expanded ? analysis : analysis.slice(0, PREVIEW);

  const borderColor = status === 'running' ? 'rgba(185,28,28,0.5)'
                    : status === 'done'    ? 'rgba(185,28,28,0.3)'
                    : 'var(--b-neutral)';
  const bgColor     = status === 'done'    ? 'rgba(120,15,15,0.08)'
                    : status === 'running' ? 'rgba(120,15,15,0.05)'
                    : 'var(--surface)';

  const labelColor  = (status === 'running' || status === 'done') ? 'var(--cr4)' : 'var(--p4)';

  return (
    <div
      className={`agent-card ${status}`}
      style={{
        gridColumn: 'span 2',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--r-md)',
        transition: 'border-color .3s, background .3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: analysis ? 10 : 0 }}>
        {/* [FIX] Emoji ⚔️ igual ao padrão dos 16 agentes */}
        <span style={{ fontSize: '.95rem' }}>⚔️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: labelColor, fontFamily: 'var(--f-mono)', letterSpacing: '.06em', transition: 'color .3s' }}>
            ADVOGADO DO DIABO
          </div>
          {status === 'idle' && (
            <div style={{ fontSize: '.68rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)' }}>
              contraditório obrigatório
            </div>
          )}
          {status === 'running' && (
            <div style={{ fontSize: '.68rem', color: 'var(--cr4)', fontFamily: 'var(--f-mono)' }}>
              processando contraditório…
            </div>
          )}
          {status === 'done' && confidence > 0 && (
            <div style={{ fontSize: '.68rem', color: 'var(--p4)', fontFamily: 'var(--f-mono)' }}>
              conf: {confidence}%
            </div>
          )}
          {status === 'done' && confidence === 0 && (
            <div style={{ fontSize: '.68rem', color: 'var(--cr4)', fontFamily: 'var(--f-mono)' }}>
              ✓ contraditório concluído
            </div>
          )}
        </div>
        {status === 'idle'    && <Clock        size={13} style={{ color: 'var(--p5)' }}/>}
        {status === 'running' && <Loader2      size={13} className="spin" style={{ color: 'var(--cr4)' }}/>}
        {status === 'done'    && <CheckCircle  size={13} style={{ color: 'var(--cr4)' }}/>}
        {status === 'error'   && <XCircle      size={13} style={{ color: 'var(--cr5)' }}/>}
      </div>

      {analysis && (
        <div style={{ borderTop: '1px solid rgba(185,28,28,0.15)', paddingTop: 8, marginTop: 6 }}>
          <p style={{ fontSize: '.74rem', color: 'var(--p4)', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>
            {displayText}{!expanded && needsExpand ? '…' : ''}
          </p>
          {needsExpand && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3,
                marginTop: 6, padding: 0,
                fontSize: '.68rem', color: 'var(--cr4)',
                fontFamily: 'var(--f-mono)', letterSpacing: '.04em',
              }}
            >
              {expanded ? <><ChevronUp size={10}/> menos</> : <><ChevronDown size={10}/> ver análise completa ({analysis.length} chars)</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Card do Juiz IA ───────────────────────────────────────────────────
// Ícone ⚖️ em emoji — consistente com os 16 agentes especialistas
function JudgeCard() {
  const [expanded, setExpanded] = useState(false);
  const judgeState = useStore(s => s.judgeState);
  const { status, verdict } = judgeState;

  const PREVIEW     = 280;
  const needsExpand = verdict.length > PREVIEW;
  const displayText = expanded ? verdict : verdict.slice(0, PREVIEW);

  const borderColor = status === 'running' ? 'rgba(16,185,129,0.5)'
                    : status === 'done'    ? 'rgba(16,185,129,0.3)'
                    : 'var(--b-neutral)';
  const bgColor     = status === 'done'    ? 'rgba(16,185,129,0.06)'
                    : status === 'running' ? 'rgba(16,185,129,0.04)'
                    : 'var(--surface)';

  const labelColor  = (status === 'running' || status === 'done') ? 'var(--au6)' : 'var(--p4)';

  return (
    <div
      className={`agent-card ${status}`}
      style={{
        gridColumn: 'span 2',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: 'var(--r-md)',
        transition: 'border-color .3s, background .3s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: verdict ? 10 : 0 }}>
        {/* [FIX] Emoji ⚖️ igual ao padrão dos 16 agentes */}
        <span style={{ fontSize: '.95rem' }}>⚖️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: labelColor, fontFamily: 'var(--f-mono)', letterSpacing: '.06em', transition: 'color .3s' }}>
            JUIZ IA QUANTUM
          </div>
          {status === 'idle' && (
            <div style={{ fontSize: '.68rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)' }}>
              aguardando agentes + contraditório
            </div>
          )}
          {status === 'running' && (
            <div style={{ fontSize: '.68rem', color: 'var(--au6)', fontFamily: 'var(--f-mono)' }}>
              deliberando veredito…
            </div>
          )}
          {status === 'done' && (
            <div style={{ fontSize: '.68rem', color: 'var(--au6)', fontFamily: 'var(--f-mono)' }}>
              ✓ veredito prolatado
            </div>
          )}
        </div>
        {status === 'idle'    && <Clock        size={13} style={{ color: 'var(--p5)' }}/>}
        {status === 'running' && <Loader2      size={13} className="spin" style={{ color: 'var(--au6)' }}/>}
        {status === 'done'    && <CheckCircle  size={13} style={{ color: 'var(--au6)' }}/>}
        {status === 'error'   && <XCircle      size={13} style={{ color: 'var(--cr5)' }}/>}
      </div>

      {verdict && (
        <div style={{ borderTop: '1px solid rgba(16,185,129,0.15)', paddingTop: 8, marginTop: 6 }}>
          <p style={{ fontSize: '.74rem', color: 'var(--p3)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
            {displayText}{!expanded && needsExpand ? '…' : ''}
          </p>
          {needsExpand && (
            <button
              onClick={() => setExpanded(e => !e)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 3,
                marginTop: 6, padding: 0,
                fontSize: '.68rem', color: 'var(--au6)',
                fontFamily: 'var(--f-mono)', letterSpacing: '.04em',
              }}
            >
              {expanded ? <><ChevronUp size={10}/> menos</> : <><ChevronDown size={10}/> ver veredito completo ({verdict.length} chars)</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Grid principal ────────────────────────────────────────────────────
export default function AgentsGrid() {
  const { completedAgents, running } = useStore();
  const total = AGENT_AREAS.length; // 16

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.2rem', fontWeight: 600 }}>
          Conselho de Agentes
        </h3>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.78rem', color: 'var(--p4)' }}>
          {completedAgents}/{total}
        </span>
      </div>

      <div className="progress-bar" style={{ marginBottom: 20 }}>
        <div className="progress-fill" style={{ width: `${(completedAgents / total) * 100}%` }}/>
      </div>

      <div className="agents-grid">
        {AGENT_AREAS.map(({ id, area, icon }) => (
          <AgentCard key={id} id={id} area={area} icon={icon}/>
        ))}
        <DevilCard/>
        <JudgeCard/>
      </div>
    </div>
  );
}
