import { AGENT_AREAS } from '../lib/constants';
import { ArrowRight, Cpu, Scale, Sword } from 'lucide-react';

const WORKFLOW = [
  {
    icon: <Cpu size={18}/>,
    label: '16 Agentes',
    sub: 'análise em paralelo',
    color: 'var(--flame)',
    bg: 'rgba(255,0,77,0.10)',
  },
  {
    icon: <Sword size={18}/>,
    label: 'Advogado do Diabo',
    sub: 'contraditório',
    color: 'var(--flame-lt)',
    bg: 'rgba(255,51,112,0.08)',
  },
  {
    icon: <Scale size={18}/>,
    label: 'Juiz IA Quantum',
    sub: 'veredicto + score',
    color: 'var(--n1)',
    bg: 'rgba(248,248,255,0.07)',
  },
];

export default function AgentsSection() {
  return (
    <section id="agentes" className="agents-section">
      <div className="page-wrap">

        <div className="section-header">
          <div className="section-eyebrow">Arquitetura Multi-Agente</div>
          <h2 className="section-title">
            O Conselho de{' '}
            <span className="outline">16</span>{' '}
            <em>Agentes</em>
          </h2>
          <p className="section-desc">
            Cada agente é um especialista dedicado em sua área do Direito brasileiro.
            Após o contraditório rigoroso, o Juiz IA prolata o veredicto definitivo.
          </p>
        </div>

        {/* Workflow strip */}
        <div className="workflow-strip">
          {WORKFLOW.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="workflow-step">
                <div className="workflow-step-icon" style={{ background: w.bg }}>
                  <span style={{ color: w.color }}>{w.icon}</span>
                </div>
                <div className="workflow-step-text">
                  <div className="name">{w.label}</div>
                  <div className="sub">{w.sub}</div>
                </div>
              </div>
              {i < WORKFLOW.length - 1 && (
                <ArrowRight size={13} style={{ color: 'var(--n5)', flexShrink: 0 }}/>
              )}
            </div>
          ))}
        </div>

        <div className="flame-rule" style={{ marginBottom: 40 }}/>

        {/* Agent catalog */}
        <div className="agent-catalog">
          {AGENT_AREAS.map(({ id, area, icon }) => (
            <div key={id} className="catalog-card">
              <span className="catalog-icon">{icon}</span>
              <div>
                <div className="catalog-name">{area}</div>
                <div className="catalog-id">{id}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Special agents */}
        <div className="special-agents-grid">
          <div className="special-agent-card" style={{ border: '1px solid rgba(255,0,77,0.22)' }}>
            <div className="special-agent-glow" style={{ background: 'radial-gradient(circle, rgba(255,0,77,0.14) 0%, transparent 70%)' }}/>
            <div style={{ fontSize: '1.5rem', marginBottom: 14 }}>⚔️</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--n0)', textTransform: 'uppercase', letterSpacing: '.02em', marginBottom: 8 }}>
              Advogado do Diabo
            </div>
            <p style={{ fontSize: '.82rem', color: 'var(--n4)', lineHeight: 1.7 }}>
              Apresenta o contraditório completo — identifica todas as fraquezas da tese, riscos processuais e argumentos contrários com rigor absoluto.
            </p>
          </div>
          <div className="special-agent-card" style={{ border: '1px solid rgba(248,248,255,0.10)' }}>
            <div className="special-agent-glow" style={{ background: 'radial-gradient(circle, rgba(248,248,255,0.05) 0%, transparent 70%)' }}/>
            <div style={{ fontSize: '1.5rem', marginBottom: 14 }}>⚖️</div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.25rem', fontWeight: 800, color: 'var(--n0)', textTransform: 'uppercase', letterSpacing: '.02em', marginBottom: 8 }}>
              Juiz IA Quantum
            </div>
            <p style={{ fontSize: '.82rem', color: 'var(--n4)', lineHeight: 1.7 }}>
              Pondera os 16 pareceres e o contraditório, prola o veredicto definitivo e calcula o JURIR Score em 4 dimensões: mérito, risco, estratégia e precedentes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
