import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Loader2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { AGENT_AREAS } from '../lib/constants';
import { useStore } from '../store';

const STATUS_ICON = {
  idle:    <Clock       size={12} style={{ color: 'var(--t5)' }}/>,
  running: <Loader2    size={12} className="spin" style={{ color: 'var(--co7)' }}/>,
  done:    <CheckCircle size={12} style={{ color: 'var(--jade2)' }}/>,
  error:   <XCircle    size={12} style={{ color: 'var(--cr3)' }}/>,
};

const RISK_CFG = {
  BAIXO:   { color: '#10b981' }, MÉDIO:   { color: '#f59e0b' },
  ALTO:    { color: '#ef4444' }, CRÍTICO: { color: '#dc2626' },
  medium:  { color: '#f59e0b' }, low:     { color: '#10b981' }, high: { color: '#ef4444' },
};

/* ─── AgentCard ─────────────────────────────────────────────── */
function AgentCard({ id, area, icon, index, wasEverRunning }) {
  const [expanded, setExpanded] = useState(false);
  const [popped,   setPopped]   = useState(false);
  const prevStatus = useRef('idle');

  const agentStates = useStore(s => s.agentStates);
  const s      = agentStates[id];
  const status = s?.status || 'idle';
  const analysis  = s?.analysis || '';
  const PREVIEW   = 500;
  const needsExpand = analysis.length > PREVIEW;
  const displayText = expanded ? analysis : analysis.slice(0, PREVIEW);
  const riskCfg = s?.riskLevel ? RISK_CFG[s.riskLevel] : null;

  /* pop animation when transitioning to done */
  useEffect(() => {
    if (prevStatus.current !== 'done' && status === 'done') {
      setPopped(true);
      const t = setTimeout(() => setPopped(false), 420);
      return () => clearTimeout(t);
    }
    prevStatus.current = status;
  }, [status]);

  /* Staggered entrance: cards fade-in one by one when grid appears */
  const entranceDelay = `${index * 38}ms`;

  const glowStyle = status === 'running'
    ? { boxShadow: '0 0 0 1px rgba(20,114,217,0.35), 0 0 18px rgba(20,114,217,0.12)', borderColor: 'rgba(20,114,217,0.4)' }
    : status === 'done'
      ? { boxShadow: '0 0 0 1px rgba(16,185,129,0.25), 0 0 12px rgba(16,185,129,0.07)', borderColor: 'rgba(16,185,129,0.28)' }
      : {};

  return (
    <div
      className={`agent-card ${status}${popped ? ' agent-pop' : ''}`}
      style={{
        minHeight: 70,
        animationDelay: entranceDelay,
        ...glowStyle,
        transition: 'border-color .35s ease, box-shadow .35s ease, background .35s ease, transform .18s ease',
      }}
    >
      {/* Running shimmer overlay */}
      {status === 'running' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(20,114,217,0.06) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'agent-shimmer 1.6s ease-in-out infinite',
          borderRadius: 'inherit', pointerEvents: 'none',
        }}/>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: analysis ? 10 : 0, position: 'relative' }}>
        <span style={{ fontSize: '.85rem', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '.75rem', fontWeight: 600,
            color: status === 'done' ? 'var(--t0)' : 'var(--t3)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            transition: 'color .3s',
          }}>
            {area}
          </div>
          {s?.confidence > 0 && (
            <div style={{ fontSize: '.62rem', color: 'var(--t4)', fontFamily: 'var(--f-mono)' }}>
              conf: {s.confidence}%
            </div>
          )}
          {status === 'done' && !s?.confidence && (
            <div style={{ fontSize: '.62rem', color: 'var(--jade2)', fontFamily: 'var(--f-mono)' }}>
              ✓ analisado
            </div>
          )}
          {status === 'running' && (
            <div style={{ fontSize: '.62rem', color: 'var(--co7)', fontFamily: 'var(--f-mono)', opacity: 0.8 }}>
              ● analisando…
            </div>
          )}
          {riskCfg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: riskCfg.color, display: 'inline-block', boxShadow: `0 0 4px ${riskCfg.color}88` }}/>
              <span style={{ fontSize: '.58rem', color: riskCfg.color, fontFamily: 'var(--f-mono)', letterSpacing: '.06em' }}>
                {s.riskLevel}
              </span>
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0 }}>{STATUS_ICON[status]}</div>
      </div>

      {/* Analysis text */}
      {analysis && (
        <div>
          <div style={{
            fontSize: '.73rem', color: 'var(--t2)', lineHeight: 1.6,
            fontFamily: 'var(--f-display)', fontWeight: 300,
          }}>
            {displayText}
            {!expanded && needsExpand && <span style={{ color: 'var(--t5)' }}>…</span>}
          </div>
          {needsExpand && (
            <button onClick={() => setExpanded(v => !v)} style={{
              marginTop: 6, background: 'none', border: 'none',
              color: 'var(--co7)', fontSize: '.65rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 3,
              fontFamily: 'var(--f-mono)', padding: 0,
            }}>
              {expanded ? <><ChevronUp size={11}/> Menos</> : <><ChevronDown size={11}/> Ver mais</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── AgentsGrid ─────────────────────────────────────────────── */
export default function AgentsGrid() {
  const { agentStates, completedAgents, devilState, judgeState, running } = useStore();
  const total = AGENT_AREAS.length;
  const progress = (completedAgents / total) * 100;

  /* track if any agent has ever been non-idle (grid was "activated") */
  const anyActive = Object.keys(agentStates).length > 0 || running;

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>Conselho de Especialistas</div>
          <h3 className="t-display" style={{ fontSize: '1.3rem', fontWeight: 400, color: 'var(--t0)' }}>
            {completedAgents}/{total} agentes concluídos
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.65rem', color: 'var(--t4)', letterSpacing: '.1em', marginBottom: 6 }}>
            PROGRESSO
          </div>
          {/* Progress bar */}
          <div style={{
            width: 120, height: 3,
            background: 'var(--shell)', borderRadius: 9,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--co6), var(--co8))',
              borderRadius: 9, transition: 'width .5s cubic-bezier(0.22, 1, 0.36, 1)',
              boxShadow: progress > 0 ? '0 0 10px rgba(43,138,245,0.5)' : 'none',
            }}/>
          </div>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--t5)', marginTop: 4 }}>
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* 16 Agent Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 10,
        marginBottom: 16,
      }}>
        {AGENT_AREAS.map((a, i) => (
          <AgentCard
            key={a.id}
            id={a.id}
            area={a.area}
            icon={a.icon}
            index={i}
            wasEverRunning={anyActive}
          />
        ))}
      </div>

      {/* Devil & Judge — rendered INSIDE the same grid area, no duplication */}
      {(devilState.status !== 'idle' || judgeState.status !== 'idle') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 8 }}>
          <SpecialCard
            title="Advogado do Diabo"
            icon="⚔️"
            status={devilState.status}
            preview={devilState.analysis || ''}
            accentColor="var(--cr3)"
          />
          <SpecialCard
            title="Juiz IA Quantum"
            icon="🏛️"
            status={judgeState.status}
            preview={judgeState.verdict || ''}
            accentColor="var(--co7)"
          />
        </div>
      )}
    </div>
  );
}

function SpecialCard({ title, icon, status, preview, accentColor }) {
  const [expanded, setExpanded] = useState(false);
  const PREVIEW = 300;
  const needsExpand = (preview || '').length > PREVIEW;
  const displayText = expanded ? preview : (preview || '').slice(0, PREVIEW);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${accentColor}22`,
      borderRadius: 'var(--r-md)', padding: '14px 16px',
      position: 'relative', overflow: 'hidden',
      boxShadow: status === 'running' ? `0 0 18px ${accentColor}18` : undefined,
      transition: 'box-shadow .35s ease',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: accentColor }}/>

      {/* Running shimmer */}
      {status === 'running' && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(90deg, transparent 0%, ${accentColor}09 50%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: 'agent-shimmer 1.6s ease-in-out infinite',
          borderRadius: 'inherit', pointerEvents: 'none',
        }}/>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: preview ? 8 : 0, position: 'relative' }}>
        <span style={{ fontSize: '.9rem' }}>{icon}</span>
        <span style={{ fontSize: '.76rem', fontWeight: 600, color: 'var(--t1)' }}>{title}</span>
        <div style={{ marginLeft: 'auto' }}>
          {status === 'running' && <Loader2 size={12} className="spin" style={{ color: accentColor }}/>}
          {status === 'done'    && <CheckCircle size={12} style={{ color: 'var(--jade2)' }}/>}
        </div>
      </div>
      {displayText && (
        <div>
          <div style={{ fontSize: '.72rem', color: 'var(--t3)', lineHeight: 1.6, fontFamily: 'var(--f-display)', fontWeight: 300, position: 'relative' }}>
            {displayText}{!expanded && needsExpand && <span style={{ color: 'var(--t5)' }}>…</span>}
          </div>
          {needsExpand && (
            <button onClick={() => setExpanded(v => !v)} style={{
              marginTop: 6, background: 'none', border: 'none',
              color: accentColor, fontSize: '.65rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 3,
              fontFamily: 'var(--f-mono)', padding: 0,
            }}>
              {expanded ? <><ChevronUp size={11}/> Menos</> : <><ChevronDown size={11}/> Ver análise completa</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
