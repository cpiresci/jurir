import { Check, Zap, ArrowRight, Building2, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'R$ 0',
    period: '',
    desc: 'Para conhecer o Jurir',
    icon: '⚡',
    color: '#6b7280',
    highlight: false,
    features: [
      '1 agente especialista por análise',
      'Análise jurídica da área mais relevante',
      'Resultado em até 3 minutos',
      '5 análises gratuitas ao cadastrar',
      'Acesso via web e app Android',
    ],
    cta: 'Começar grátis',
    ctaRoute: null,
  },
  {
    id: 'solo',
    name: 'Solo',
    price: 'R$ 49',
    period: '/mês',
    desc: 'Para advogados autônomos',
    icon: '⚖️',
    color: 'var(--am4)',
    highlight: true,
    badge: 'Mais popular',
    features: [
      '16 agentes especializados em paralelo',
      'Advogado do Diabo + Juiz IA Quantum',
      'JURIR Score dimensional',
      'Streaming SSE em tempo real',
      'Delta Analysis (comparativo de casos)',
      'Análise de documentos PDF/Word',
      'Gerador de Petições (.docx)',
      'Simulador de Instâncias judiciais',
      'Monitoramento Processual (DATAJUD)',
      'Exportação em PDF profissional',
      'Histórico completo de análises',
      'Verificação de autenticidade (serial)',
    ],
    cta: 'Assinar Solo',
    ctaRoute: '/checkout',
  },
  {
    id: 'escritorio',
    name: 'Escritório',
    price: 'R$ 299',
    period: '/mês',
    desc: 'Para escritórios e equipes',
    icon: '🏢',
    color: '#8b5cf6',
    highlight: false,
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
    ctaRoute: null,
    ctaHref: 'https://wa.me/5511999999999',
  },
  {
    id: 'api',
    name: 'API',
    price: 'R$ 999',
    period: '/mês',
    desc: 'Para plataformas e integrações',
    icon: '🔌',
    color: '#06b6d4',
    highlight: false,
    features: [
      'Tudo do plano Escritório',
      'Acesso à API REST completa',
      'Webhooks e eventos em tempo real',
      'Usuários ilimitados',
      'Rate limit personalizado',
      'Documentação técnica dedicada',
      'Suporte técnico com SLA 4h',
      'White-label disponível',
    ],
    cta: 'Contato comercial',
    ctaRoute: null,
    ctaHref: 'mailto:comercial@jurir.com',
  },
];

export default function Pricing() {
  const { openModal, authToken } = useStore();

  function handleCTA(plan) {
    if (plan.ctaHref) { window.open(plan.ctaHref, '_blank'); return; }
    if (plan.id === 'free') { if (!authToken) openModal('register'); return; }
    if (!authToken) { openModal('login'); return; }
    if (plan.ctaRoute) window.location.href = plan.ctaRoute;
  }

  return (
    <section id="precos" style={{ padding: '80px 24px', background: '#030712' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: 'var(--am4)', textTransform: 'uppercase' }}>
            PLANOS
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, margin: '16px 0 20px', color: '#fff' }}>
            Escolha seu plano
          </h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 480, margin: '0 auto' }}>
            Do advogado autônomo ao grande escritório — temos o plano certo para você.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {PLANS.map(plan => (
            <div key={plan.id} style={{
              background: plan.highlight ? 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(234,88,12,0.06))' : 'rgba(255,255,255,0.02)',
              border: `1.5px solid ${plan.highlight ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 20,
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              position: 'relative',
            }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(90deg, var(--am4), #f97316)',
                  color: '#000', fontSize: 11, fontWeight: 800, padding: '4px 16px',
                  borderRadius: 20, letterSpacing: 1, whiteSpace: 'nowrap',
                }}>
                  {plan.badge}
                </div>
              )}

              {/* Plan header */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{plan.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>{plan.desc}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: plan.highlight ? 'var(--am4)' : '#fff' }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 14, color: 'var(--muted)' }}>{plan.period}</span>}
                </div>
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                    <span style={{ color: plan.highlight ? 'var(--am4)' : '#4ade80', marginTop: 2, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleCTA(plan)}
                style={{
                  marginTop: 'auto',
                  width: '100%', padding: '14px 0',
                  borderRadius: 12, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 15,
                  background: plan.highlight
                    ? 'linear-gradient(90deg, var(--am4), #f97316)'
                    : 'rgba(255,255,255,0.07)',
                  color: plan.highlight ? '#000' : '#fff',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', marginTop: 40, fontSize: 13, color: 'var(--muted)' }}>
          Todos os planos incluem acesso ao app Android. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
}
