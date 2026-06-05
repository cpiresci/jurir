import { CheckCircle, Loader2, XCircle, Clock } from 'lucide-react';
import { AGENT_AREAS } from '../lib/constants';
import { useStore } from '../store';

const STATUS_ICON = {
  idle:    <Clock    size={13} style={{ color: 'var(--n5)' }}/>,
  running: <Loader2  size={13} className="spin" style={{ color: 'var(--r3)' }}/>,
  done:    <CheckCircle size={13} style={{ color: 'var(--emerald2)' }}/>,
  error:   <XCircle  size={13} style={{ color: 'var(--r4)' }}/>,
};

export default function AgentsGrid() {
  const { agentStates, completedAgents, running } = useStore();
  const total = AGENT_AREAS.length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.2rem', fontWeight: 600 }}>
          Conselho de Agentes
        </h3>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.78rem', color: 'var(--n4)' }}>
          {completedAgents}/{total}
        </span>
      </div>

      <div className="progress-bar" style={{ marginBottom: 20 }}>
        <div className="progress-fill" style={{ width: `${(completedAgents / total) * 100}%` }}/>
      </div>

      <div className="agents-grid">
        {AGENT_AREAS.map(({ id, area, icon }) => {
          const s = agentStates[id];
          const status = s?.status || 'idle';
          return (
            <div key={id} className={`agent-card ${status}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: s?.analysis ? 10 : 0 }}>
                <span style={{ fontSize: '.95rem' }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: status === 'done' ? 'var(--n1)' : 'var(--n3)' }}>
                    {area}
                  </div>
                  {s?.confidence != null && (
                    <div style={{ fontSize: '.7rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)' }}>
                      conf: {s.confidence}%
                    </div>
                  )}
                </div>
                {STATUS_ICON[status]}
              </div>
              {s?.analysis && (
                <p style={{
                  fontSize: '.74rem', color: 'var(--n4)', lineHeight: 1.5, margin: 0,
                  borderTop: '1px solid var(--bn2)', paddingTop: 8, marginTop: 6,
                }}>
                  {s.analysis.slice(0, 200)}{s.analysis.length > 200 ? '…' : ''}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
