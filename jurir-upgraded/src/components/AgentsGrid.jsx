import { CheckCircle, Loader2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { AGENT_AREAS } from '../lib/constants';
import { useStore } from '../store';

const STATUS_ICON = {
  idle:    <Clock       size={12} style={{ color: 'var(--n5)' }}/>,
  running: <Loader2     size={12} className="spin" style={{ color: 'var(--r3)' }}/>,
  done:    <CheckCircle size={12} style={{ color: 'var(--emerald2)' }}/>,
  error:   <XCircle     size={12} style={{ color: 'var(--r4)' }}/>,
};

const RISK_COLOR = {
  BAIXO:   'var(--emerald2)',
  MÉDIO:   'var(--g4)',
  ALTO:    'var(--r4)',
  CRÍTICO: 'var(--r3)',
};

function ConfBar({ confidence }) {
  const color = confidence >= 70 ? 'var(--emerald2)' : confidence >= 40 ? 'var(--g4)' : 'var(--r3)';
  return (
    <div className="conf-bar">
      <div
        className="conf-fill"
        style={{ width: `${confidence}%`, background: color }}
      />
    </div>
  );
}

function AgentSkeleton() {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--bn)',
      borderRadius: 'var(--r-md)', padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div className="skeleton" style={{ width: 22, height: 22, borderRadius: '50%' }}/>
        <div className="skeleton" style={{ flex: 1, height: 12 }}/>
      </div>
      <div className="skeleton" style={{ height: 3, marginBottom: 8 }}/>
      <div className="skeleton" style={{ height: 10, width: '80%' }}/>
    </div>
  );
}

export default function AgentsGrid() {
  const { agentStates, completedAgents, running } = useStore();
  const total = AGENT_AREAS.length;
  const progressPct = (completedAgents / total) * 100;

  return (
    <div>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.2rem', fontWeight: 600 }}>
            Conselho de Agentes
          </h3>
          {running && (
            <span style={{
              background: 'rgba(185,28,28,.12)', border: '1px solid rgba(185,28,28,.2)',
              borderRadius: 'var(--r-pill)', padding: '2px 10px',
              fontSize: '.68rem', color: 'var(--r4)', fontFamily: 'var(--f-mono)',
              letterSpacing: '.08em',
            }}>
              AO VIVO
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--n4)' }}>
            {completedAgents}/{total} concluídos
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ marginBottom: 18 }}>
        <div
          className="progress-fill"
          style={{ width: `${progressPct}%`, transition: 'width .5s cubic-bezier(.4,0,.2,1)' }}
        />
      </div>

      {/* Agents grid */}
      <div className="agents-grid">
        {AGENT_AREAS.map(({ id, area, icon }) => {
          const s = agentStates[id];
          const status = s?.status || 'idle';
          const conf = s?.confidence ?? null;
          const risk = s?.riskLevel || null;

          return (
            <div key={id} className={`agent-card ${status}`} style={{ cursor: 'default' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: conf != null ? 8 : 0 }}>
                <span style={{ fontSize: '.9rem', flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '.76rem', fontWeight: 600,
                    color: status === 'done' ? 'var(--n1)' : 'var(--n3)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {area}
                  </div>
                  {conf != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <span style={{ fontSize: '.65rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)' }}>
                        {conf}%
                      </span>
                      {risk && (
                        <span style={{
                          fontSize: '.6rem', fontFamily: 'var(--f-mono)',
                          color: RISK_COLOR[risk] || 'var(--n5)',
                          letterSpacing: '.06em',
                        }}>
                          · {risk}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ flexShrink: 0 }}>{STATUS_ICON[status]}</div>
              </div>

              {/* Confidence bar */}
              {conf != null && <ConfBar confidence={conf}/>}

              {/* Analysis excerpt */}
              {s?.analysis && status === 'done' && (
                <p style={{
                  fontSize: '.72rem', color: 'var(--n4)', lineHeight: 1.5, margin: 0,
                  borderTop: '1px solid var(--bn2)', paddingTop: 8, marginTop: 8,
                }}>
                  {s.analysis.slice(0, 160)}{s.analysis.length > 160 ? '…' : ''}
                </p>
              )}

              {/* Running shimmer */}
              {status === 'running' && (
                <div style={{ marginTop: 8 }}>
                  <div className="skeleton" style={{ height: 8, width: '60%', marginBottom: 4 }}/>
                  <div className="skeleton" style={{ height: 8, width: '85%' }}/>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      {completedAgents > 0 && (
        <div style={{
          marginTop: 16, display: 'flex', gap: 20, justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}>
          {(['done', 'error']).map(st => {
            const count = Object.values(agentStates).filter(a => a?.status === st).length;
            if (!count) return null;
            return (
              <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.72rem', color: 'var(--n5)' }}>
                {STATUS_ICON[st]}
                <span>{count} {st === 'done' ? 'concluídos' : 'com erro'}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
