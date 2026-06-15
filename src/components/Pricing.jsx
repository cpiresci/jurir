import { Check, Zap, ArrowRight, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

const PLANS = [
  {
    id: 'free',
    label: 'GRATUITO',
    price: 'R$ 0',
    sub: 'para sempre, sem cartão',
    badge: null,
    premium: false,
    features: [
      '1 agente especialista (selecionado por IA)',
      'Análise jurídica por área mais relevante',
      'Resultado em até 3 minutos',
      'Acesso ao painel básico',
    ],
    cta: 'Usar Grátis',
    ctaStyle: 'ghost',
    action: 'scroll',
  },
  {
    id: 'solo',
    label: 'SOLO',
    price: 'R$ 49',
    sub: 'por mês, cancele quando quiser',
    badge: 'MAIS POPULAR',
    premium: true,
    features: [
      '16 agentes especializados em paralelo',
      'Advogado do Diabo com contraditório',
      'Juiz IA Quantum + JURIR Score',
      'Streaming SSE em tempo real',
      'Histórico completo de análises',
      'Delta Analysis (comparativo)',
      'Upload de documentos PDF/Word',
      'Simulador de Instâncias judiciais',
      'Gerador de Petições (.docx)',
      'Monitoramento via DATAJUD',
      'Exportação em PDF profissional',
      'Verificação de autenticidade',
    ],
    cta: 'Começar Solo',
    ctaStyle: 'primary',
    action: 'register',
  },
  {
    id: 'escritorio',
    label: 'ESCRITÓRIO',
    price: 'R$ 299',
    sub: 'por mês · até 10 usuários',
    badge: null,
    premium: false,
    features: [
      'Tudo do plano Solo',
      'Até 10 usuários simultâneos',
      'Painel administrativo centralizado',
      'Relatórios por usuário e período',
      'Suporte prioritário via WhatsApp',
      'Onboarding dedicado',
      'SLA de 99,5% de disponibilidade',
    ],
    cta: 'Falar com equipe',
    ctaStyle: 'ghost',
    action: 'contact',
  },
  {
    id: 'api',
    label: 'API',
    price: 'R$ 999',
    sub: 'por mês · acesso programático',
    badge: 'ENTERPRISE',
    premium: false,
    features: [
      'Tudo do plano Escritório',
      'Acesso completo à API REST',
      'Webhooks para integrações',
      'Rate limit elevado (10k req/mês)',
      'Chaves de API múltiplas',
      'Documentação e sandbox',
      'Gerente de conta dedicado',
      'Contrato e NDA disponíveis',
    ],
    cta: 'Contatar vendas',
    ctaStyle: 'ghost',
    action: 'contact',
  },
];

export default function Pricing() {
  const { openModal, authToken } = useStore();

  const handleCta = (plan) => {
    if (plan.action === 'scroll') {
      document.getElementById('analise')?.scrollIntoView({ behavior: 'smooth' });
    } else if (plan.action === 'register') {
      if (authToken) window.location.href = '/premium';
      else openModal('register');
    } else if (plan.action === 'contact') {
      window.open('mailto:contato@jurir.app', '_blank');
    }
  };

  return (
    <section id="precos" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Planos & Acesso</div>
          <h2 className="t-display" style={{
            fontSize: 'clamp(1.9rem,4vw,2.8rem)', fontWeight: 400,
            color: 'var(--t0)', marginBottom: 14, letterSpacing: '-.02em',
          }}>
            Escolha seu nível de{' '}
            <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>acesso</span>
          </h2>
          <p style={{ color: 'var(--t3)', fontSize: '.9rem', lineHeight: 1.7 }}>
            Comece gratuitamente. Eleve para poder total quando precisar de profundidade máxima.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          alignItems: 'start',
        }}>
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={plan.premium ? 'pricing-card pricing-card-premium' : 'pricing-card pricing-card-free'}
              style={plan.premium ? {} : { position: 'relative' }}
            >
              {plan.premium && (
                <div style={{
                  position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                  width: '60%', height: 1,
                  background: 'linear-gradient(90deg, transparent, var(--co8), transparent)',
                  zIndex: 1,
                }}/>
              )}

              <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, minHeight: 24 }}>
                  <span style={{
                    fontFamily: 'var(--f-mono)', fontSize: '.62rem',
                    color: plan.premium ? 'rgba(255,255,255,0.45)' : 'var(--t4)',
                    letterSpacing: '.18em', textTransform: 'uppercase',
                  }}>
                    {plan.label}
                  </span>
                  {plan.badge && (
                    <span style={{
                      background: plan.id === 'api' ? 'rgba(139,92,246,0.2)' : 'rgba(43,138,245,0.2)',
                      border: `1px solid ${plan.id === 'api' ? 'rgba(139,92,246,0.35)' : 'rgba(43,138,245,0.35)'}`,
                      borderRadius: 'var(--r-pill)', padding: '3px 10px',
                      fontFamily: 'var(--f-mono)', fontSize: '.58rem',
                      color: plan.id === 'api' ? '#c4b5fd' : 'var(--co9)',
                      letterSpacing: '.1em',
                    }}>
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div style={{
                  fontFamily: 'var(--f-display)', fontSize: '2.8rem',
                  letterSpacing: '.02em',
                  color: plan.premium ? '#fff' : 'var(--t0)',
                  lineHeight: 1, marginBottom: 4,
                }}>
                  {plan.price}
                </div>
                <div style={{
                  fontSize: '.8rem',
                  color: plan.premium ? 'rgba(255,255,255,0.45)' : 'var(--t4)',
                  marginBottom: 28,
                }}>
                  {plan.sub}
                </div>

                <div style={{
                  height: 1,
                  background: plan.premium ? 'rgba(255,255,255,0.08)' : 'var(--b-main)',
                  marginBottom: 22,
                }}/>

                {/* Features */}
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <Check size={12} style={{
                        color: plan.premium ? 'var(--co9)' : 'var(--jade2)',
                        flexShrink: 0, marginTop: 3,
                      }}/>
                      <span style={{
                        fontSize: '.83rem',
                        color: plan.premium ? 'rgba(255,255,255,0.80)' : 'var(--t2)',
                        lineHeight: 1.5,
                      }}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`btn${plan.ctaStyle === 'ghost' ? ' btn-ghost' : ''}`}
                  style={{
                    width: '100%', justifyContent: 'center',
                    ...(plan.ctaStyle === 'primary' ? { background: '#fff', color: 'var(--co6)', fontWeight: 700 } : {}),
                  }}
                  onClick={() => handleCta(plan)}
                >
                  {plan.id === 'solo' && <Zap size={13}/>}
                  {plan.id === 'api' && <Code2 size={13}/>}
                  {plan.cta}
                  {plan.id === 'solo' && <ArrowRight size={13}/>}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust row */}
        <div style={{
          marginTop: 48, display: 'flex', justifyContent: 'center',
          gap: 28, flexWrap: 'wrap',
        }}>
          {['🔒 Pagamento seguro', '✅ Cancele a qualquer hora', '⚡ Acesso imediato', '🛡️ Dados protegidos'].map((item, i) => (
            <span key={i} style={{
              fontFamily: 'var(--f-mono)', fontSize: '.68rem',
              color: 'var(--t4)', letterSpacing: '.08em',
            }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
