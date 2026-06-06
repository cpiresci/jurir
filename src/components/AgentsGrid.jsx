import { CheckCircle, Loader2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { AGENT_AREAS } from '../lib/constants';
import { useStore } from '../store';

const STATUS_ICON = {
  idle:    <Clock       size={11} style={{ color: 'var(--n5)' }}/>,
  running: <Loader2     size={11} className="spin" style={{ color: 'var(--flame)' }}/>,
  done:    <CheckCircle size={11} style={{ color: 'var(--emerald2)' }}/>,
  error:   <XCircle     size={11} style={{ color: 'var(--cr5)' }}/>,
};

const RISK_COLOR = {
  BAIXO:   'var(--emerald2)',
  MÉDIO:   'var(--flame)',
  ALTO:    'var(--cr5)',
  CRÍTICO: 'var(--flame)',
};

function ConfBar({ confidence }) {
  const color = confidence >= 70 ? 'var(--emerald2)' : confidence >= 40 ? 'var(--flame)' : 'var(--flame)';
  return (
    <div className="conf-bar">
      <div className="conf-fill" style={{ width: `${confidence}%`, background: color }}/>
    </div>
  );
}

function AgentSkeleton() {
  return (
    <div className="agent-card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div className="skeleton" style={{ width: 20, height: 20, borderRadius: '50%' }}/>
        <div className="skeleton" style={{ flex: 1, height: 10 }}/>
      </div>
      <div className="skeleton" style={{ height: 2, marginBottom: 8 }}/>
      <div className="skeleton" style={{ height: 8, width: '70%' }}/>
    </div>
  );
}

export default function AgentsGrid() {
  const { agentStates, completedAgents, running } = useStore();
  const total = AGENT_AREAS.length;
  const progressPct = (completedAgents / total) * 100;

  return (
    <div>
      {/* Header */}
      <div className="agents-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 className="agents-title">Conselho de Agentes</h3>
          {running && <span className="live-badge">AO VIVO</span>}
        </div>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.72rem', color: 'var(--n4)' }}>
          {completedAgents}/{total}
        </span>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPct}%` }}/>
      </div>

      {/* Grid */}
      <div className="agents-grid">
        {AGENT_AREAS.map(({ id, area, icon }) => {
          const s = agentStates[id];
          const status = s?.status || 'idle';
          const conf = s?.confidence ?? null;
          const risk = s?.riskLevel || null;

          return (
            <div key={id} className={`agent-card ${status}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: conf != null ? 0 : 0 }}>
                <span style={{ fontSize: '.85rem', flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '.74rem', fontWeight: 600,
                    color: status === 'done' ? 'var(--n1)' : 'var(--n4)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {area}
                  </div>
                  {conf != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <span style={{ fontSize: '.62rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)' }}>{conf}%</span>
                      {risk && (
                        <span style={{ fontSize: '.58rem', fontFamily: 'var(--f-mono)', color: RISK_COLOR[risk] || 'var(--n5)', letterSpacing: '.06em' }}>
                          · {risk}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div style={{ flexShrink: 0 }}>{STATUS_ICON[status]}</div>
              </div>

              {conf != null && <ConfBar confidence={conf}/>}

              {s?.analysis && status === 'done' && (
                <p style={{
                  fontSize: '.7rem', color: 'var(--n5)', lineHeight: 1.5, margin: 0,
                  borderTop: '1px solid var(--br-n2)', paddingTop: 8, marginTop: 8,
                }}>
                  {s.analysis.slice(0, 140)}{s.analysis.length > 140 ? '…' : ''}
                </p>
              )}

              {status === 'running' && (
                <div style={{ marginTop: 8 }}>
                  <div className="skeleton" style={{ height: 7, width: '55%', marginBottom: 4 }}/>
                  <div className="skeleton" style={{ height: 7, width: '80%' }}/>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      {completedAgents > 0 && (
        <div style={{ marginTop: 14, display: 'flex', gap: 20, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {(['done', 'error']).map(st => {
            const count = Object.values(agentStates).filter(a => a?.status === st).length;
            if (!count) return null;
            return (
              <div key={st} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.7rem', color: 'var(--n5)' }}>
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
