import { useStore } from '../store';

const PLANS = [
  {
    id: 'free', name: 'Free', price: 'R$ 0', period: '', icon: '⚡',
    desc: 'Para conhecer o Jurir', highlight: false,
    features: [
      '1 agente especialista por análise',
      'Análise da área mais relevante',
      'Resultado em até 3 minutos',
      '5 análises gratuitas ao cadastrar',
      'Acesso via web e app Android',
    ],
    cta: 'Começar grátis',
  },
  {
    id: 'solo', name: 'Solo', price: 'R$ 49', period: '/mês', icon: '⚖️',
    desc: 'Para advogados autônomos', highlight: true, badge: 'Mais popular',
    features: [
      '16 agentes especializados em paralelo',
      'Advogado do Diabo + Juiz IA Quantum',
      'JURIR Score dimensional',
      'Streaming SSE em tempo real',
      'Delta Analysis — comparativo de casos',
      'Análise de documentos PDF/Word',
      'Gerador de Petições (.docx)',
      'Simulador de Instâncias judiciais',
      'Monitoramento Processual (DATAJUD)',
      'Exportação em PDF profissional',
      'Histórico completo de análises',
      'Verificação de autenticidade (serial)',
    ],
    cta: 'Assinar Solo',
  },
  {
    id: 'escritorio', name: 'Escritório', price: 'R$ 299', period: '/mês', icon: '🏢',
    desc: 'Para escritórios e equipes', highlight: false,
    features: [
      'Tudo do plano Solo',
      'Até 10 usuários simultâneos',
      'Painel administrativo da equipe',
      'Relatórios consolidados por período',
      'Integração com sistemas jurídicos',
      'Suporte prioritário via WhatsApp',
      'Onboarding personalizado',
      'SLA garantido de 99,9%',
    ],
    cta: 'Falar com equipe',
    href: 'https://wa.me/5511999999999',
  },
  {
    id: 'api', name: 'API', price: 'R$ 999', period: '/mês', icon: '🔌',
    desc: 'Para plataformas e integrações', highlight: false,
    features: [
      'Tudo do plano Escritório',
      'Acesso à API REST completa',
      'Webhooks e eventos em tempo real',
      'Usuários ilimitados',
      'Rate limit personalizado',
      'Documentação técnica dedicada',
      'Suporte com SLA de 4h',
      'White-label disponível',
    ],
    cta: 'Contato comercial',
    href: 'mailto:comercial@jurir.com',
  },
];

export default function Pricing() {
  const { openModal, authToken } = useStore();

  function handleCTA(plan) {
    if (plan.href) { window.open(plan.href, '_blank'); return; }
    if (!authToken) { openModal(plan.id === 'free' ? 'register' : 'login'); return; }
    if (plan.id === 'solo') window.location.href = '/checkout';
  }

  return (
    <section id="precos" style={{ padding: '80px 24px', background: 'var(--shell)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: 'var(--co7)', textTransform: 'uppercase' }}>
            PLANOS
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, margin: '16px 0 16px', color: 'var(--abyss)' }}>
            Escolha seu plano
          </h2>
          <p style={{ fontSize: 16, color: 'var(--iron)', maxWidth: 460, margin: '0 auto' }}>
            Do advogado autônomo ao grande escritório.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.highlight ? 'var(--abyss)' : '#fff',
              border: `1.5px solid ${plan.highlight ? 'var(--night)' : 'var(--pale)'}`,
              borderRadius: 20, padding: '32px 24px',
              display: 'flex', flexDirection: 'column',
              position: 'relative',
              boxShadow: plan.highlight ? '0 16px 48px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.05)',
            }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(90deg,#D4A800,#f97316)',
                  color: '#000', fontSize: 11, fontWeight: 800,
                  padding: '4px 16px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: 1,
                }}>{plan.badge}</div>
              )}

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{plan.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 19, color: plan.highlight ? '#fff' : 'var(--abyss)', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.55)' : 'var(--slate)', marginBottom: 16 }}>{plan.desc}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 34, fontWeight: 900, color: plan.highlight ? '#D4A800' : 'var(--abyss)' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.45)' : 'var(--slate)' }}>{plan.period}</span>}
                </div>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: plan.highlight ? 'rgba(255,255,255,0.75)' : 'var(--iron)', lineHeight: 1.5 }}>
                    <span style={{ color: plan.highlight ? '#D4A800' : '#16a34a', flexShrink: 0, marginTop: 1 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCTA(plan)}
                style={{
                  marginTop: 'auto', width: '100%', padding: '13px 0',
                  borderRadius: 12, border: plan.highlight ? 'none' : '1.5px solid var(--mist)',
                  cursor: 'pointer', fontWeight: 700, fontSize: 14,
                  background: plan.highlight ? 'linear-gradient(90deg,#D4A800,#f97316)' : 'transparent',
                  color: plan.highlight ? '#000' : 'var(--abyss)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >{plan.cta}</button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 36, fontSize: 13, color: 'var(--slate)' }}>
          Todos os planos incluem acesso ao app Android. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
}
