import { AGENT_AREAS } from '../lib/constants';
import { ArrowRight, Cpu, Scale, Sword } from 'lucide-react';

const WORKFLOW = [
  { icon: <Cpu size={16}/>,   label: '16 Agentes',         sub: 'análise em paralelo',   color: 'var(--r3)' },
  { icon: <Sword size={16}/>, label: 'Advogado do Diabo',  sub: 'contraditório',          color: 'var(--r2)' },
  { icon: <Scale size={16}/>, label: 'Juiz IA Quantum',    sub: 'veredicto + score',      color: 'var(--g4)' },
];

export default function AgentsSection() {
  return (
    <section id="agentes" style={{ padding: '80px 24px' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--lift)', border: '1px solid var(--bn)',
            borderRadius: 'var(--r-pill)', padding: '5px 14px',
            fontSize: '.7rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)',
            letterSpacing: '.1em', marginBottom: 20, textTransform: 'uppercase',
          }}>
            Arquitetura Multi-Agente
          </div>
          <h2 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, marginBottom: 12 }}>
            O Conselho de 16 Agentes
          </h2>
          <p style={{ color: 'var(--n4)', fontSize: '.9rem', maxWidth: 520, margin: '0 auto' }}>
            Cada agente é um especialista dedicado em sua área do Direito brasileiro.
            Após o contraditório, o Juiz IA prolata o veredicto definitivo.
          </p>
        </div>

        {/* Workflow */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, marginBottom: 48, flexWrap: 'wrap',
        }}>
          {WORKFLOW.map((w, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                background: 'var(--surface)', border: `1px solid ${w.color}30`,
                borderRadius: 'var(--r-md)', padding: '12px 20px',
                display: 'flex', alignItems: 'center', gap: 10,
                boxShadow: `0 0 20px ${w.color}10`,
              }}>
                <span style={{ color: w.color }}>{w.icon}</span>
                <div>
                  <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--n1)' }}>{w.label}</div>
                  <div style={{ fontSize: '.66rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)' }}>{w.sub}</div>
                </div>
              </div>
              {i < WORKFLOW.length - 1 && (
                <ArrowRight size={14} style={{ color: 'var(--n5)', flexShrink: 0 }}/>
              )}
            </div>
          ))}
        </div>

        {/* Agents grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 10, marginBottom: 36,
        }}>
          {AGENT_AREAS.map(({ id, area, icon }) => (
            <div
              key={id}
              style={{
                background: 'var(--surface)', border: '1px solid var(--bn)',
                borderRadius: 'var(--r-md)', padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'border-color .25s, transform .2s, box-shadow .25s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(185,28,28,.25)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(185,28,28,.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--bn)';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--n1)', lineHeight: 1.3 }}>{area}</div>
                <div style={{ fontSize: '.64rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', marginTop: 2, letterSpacing: '.04em' }}>{id}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Special agents */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 16 }}>
          <SpecialAgent
            icon="⚔️"
            title="Advogado do Diabo"
            sub="Contraditório Obrigatório"
            desc="Apresenta todos os argumentos contrários ao caso. Nenhuma decisão sem o contraditório completo — até 2 tentativas com cooldown automático."
            color="var(--r3)"
            details={['Retry automático (2×)', 'Síntese de emergência local', 'devil_is_real™ validação']}
          />
          <SpecialAgent
            icon="⚖️"
            title="Juiz IA Quantum"
            sub="Veredicto Final + JURIR Score"
            desc="Pondera todos os 16 pareceres + contraditório e prolata o veredicto jurídico definitivo com JURIR Score dimensional 0–100."
            color="var(--g4)"
            details={['JURIR Score 0–100', '4 dimensões avaliadas', 'Fallback automático < 30s']}
          />
        </div>
      </div>
    </section>
  );
}

function SpecialAgent({ icon, title, sub, desc, color, details }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, var(--surface), var(--lift))',
      border: `1px solid ${color}30`,
      borderRadius: 'var(--r-lg)', padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 120, height: 120, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>
      <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--f-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: '.7rem', color, fontFamily: 'var(--f-mono)', letterSpacing: '.1em', marginBottom: 10, textTransform: 'uppercase' }}>{sub}</div>
      <p style={{ fontSize: '.84rem', color: 'var(--n4)', lineHeight: 1.65, margin: 0, marginBottom: 14 }}>{desc}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {details.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.75rem', color: 'var(--n5)' }}>
            <span style={{ color, fontSize: '.6rem' }}>◆</span> {d}
          </div>
        ))}
      </div>
    </div>
  );
}
