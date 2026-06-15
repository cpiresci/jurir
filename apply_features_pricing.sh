#!/bin/bash
set -e
cd ~/jurir
echo "🚀 Aplicando Features + Pricing..."

# ── src/components/FeaturesSection.jsx
mkdir -p $(dirname 'src/components/FeaturesSection.jsx')
cat > 'src/components/FeaturesSection.jsx' << 'FEOF'
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

const FEATURES = [
  {
    id: 'delta',
    label: 'Delta Analysis',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <polygon points="14,4 26,24 2,24" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.06)" strokeLinejoin="round"/>
        <line x1="14" y1="10" x2="14" y2="18" stroke="var(--co8)" strokeWidth="1.2"/>
        <circle cx="14" cy="20" r="1.2" fill="var(--co7)"/>
      </svg>
    ),
    title: 'Delta Analysis',
    desc: 'Compare dois casos jurídicos em paralelo. A IA mapeia divergências, precedentes conflitantes e variações de risco entre cenários distintos.',
    route: '/delta',
    cta: 'Comparar casos',
  },
  {
    id: 'documentos',
    label: 'Documentos',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="5" y="3" width="14" height="18" rx="2" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.06)"/>
        <rect x="9" y="3" width="10" height="6" rx="1" stroke="var(--co8)" strokeWidth="1.2" fill="rgba(79,172,254,0.08)"/>
        <line x1="8" y1="14" x2="16" y2="14" stroke="var(--co9)" strokeWidth="1"/>
        <line x1="8" y1="17" x2="14" y2="17" stroke="var(--co9)" strokeWidth="1" opacity=".6"/>
        <path d="M17 17 L23 23" stroke="var(--co7)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="4" stroke="var(--co8)" strokeWidth="1.2" fill="rgba(0,242,254,0.06)"/>
      </svg>
    ),
    title: 'Upload de Documentos',
    desc: 'Envie contratos, petições ou decisões em PDF ou Word. Os 16 agentes extraem cláusulas, identificam riscos e geram análise completa.',
    route: '/documentos',
    cta: 'Analisar documento',
  },
  {
    id: 'peticoes',
    label: 'Petições',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="3" width="16" height="20" rx="2" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.06)"/>
        <line x1="8" y1="9" x2="16" y2="9" stroke="var(--co8)" strokeWidth="1.2"/>
        <line x1="8" y1="13" x2="16" y2="13" stroke="var(--co9)" strokeWidth="1" opacity=".7"/>
        <line x1="8" y1="17" x2="13" y2="17" stroke="var(--co9)" strokeWidth="1" opacity=".5"/>
        <path d="M19 18 L24 13 L22 11 L17 16 L17 19 Z" stroke="var(--co7)" strokeWidth="1.2" fill="rgba(0,242,254,0.08)" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Gerador de Petições',
    desc: 'Gere petições iniciais, recursos e contestações profissionais em .docx com fundamentação automática, citação de jurisprudência e formatação ABNT.',
    route: '/peticoes',
    cta: 'Gerar petição',
  },
  {
    id: 'simulador',
    label: 'Simulador',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="6" width="22" height="16" rx="2" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.06)"/>
        <path d="M3 10 H25" stroke="var(--co8)" strokeWidth="1" opacity=".5"/>
        <circle cx="7" cy="8" r="1" fill="var(--co9)" opacity=".7"/>
        <circle cx="10" cy="8" r="1" fill="var(--co9)" opacity=".5"/>
        <path d="M8 15 L12 13 L16 16 L20 12" stroke="var(--co7)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="20" cy="12" r="1.5" fill="var(--co8)"/>
      </svg>
    ),
    title: 'Simulador de Instâncias',
    desc: 'Simule o percurso processual em 1ª instância, TJ, STJ e STF. Projete probabilidades de êxito, prazos e custos em cada grau de jurisdição.',
    route: '/simulador',
    cta: 'Simular instâncias',
  },
  {
    id: 'monitoramento',
    label: 'Monitoramento',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.04)"/>
        <path d="M14 8 L14 14 L18 17" stroke="var(--co8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="14" r="1.5" fill="var(--co7)"/>
        <path d="M4 14 Q9 8 14 14 Q19 20 24 14" stroke="var(--co9)" strokeWidth="1" opacity=".4" fill="none"/>
      </svg>
    ),
    title: 'Monitoramento Processual',
    desc: 'Acompanhe processos em tempo real via DATAJUD. Receba alertas automáticos sobre movimentações, publicações e prazos críticos.',
    route: '/monitoramento',
    cta: 'Monitorar processo',
  },
  {
    id: 'verificar',
    label: 'Verificar',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <shield-like>
          <path d="M14 3 L23 7 L23 15 C23 20 14 25 14 25 C14 25 5 20 5 15 L5 7 Z" stroke="var(--co7)" strokeWidth="1.5" fill="rgba(0,242,254,0.06)" strokeLinejoin="round"/>
          <path d="M10 14 L13 17 L18 11" stroke="var(--co8)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </shield-like>
      </svg>
    ),
    title: 'Verificar Relatório',
    desc: 'Autentique qualquer relatório JURIR pelo código serial único. Confirme integridade, data de emissão e identidade do subscritor.',
    route: '/verificar',
    cta: 'Verificar autenticidade',
  },
];

export default function FeaturesSection() {
  const navigate = useNavigate();
  const { authToken, openModal } = useStore();

  const handleCta = (route) => {
    if (authToken) navigate(route);
    else openModal('register');
  };

  return (
    <section id="funcionalidades" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Funcionalidades</div>
          <h2 className="t-display" style={{
            fontSize: 'clamp(1.9rem,4vw,2.8rem)', fontWeight: 400,
            color: 'var(--t0)', marginBottom: 14, letterSpacing: '-.02em',
          }}>
            Inteligência jurídica em{' '}
            <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>cada módulo</span>
          </h2>
          <p style={{ color: 'var(--t3)', fontSize: '.9rem', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Seis ferramentas especializadas, construídas para advogados que não aceitam metade do caminho.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: 20,
        }}>
          {FEATURES.map((f) => (
            <div
              key={f.id}
              style={{
                position: 'relative',
                background: 'rgba(0,242,254,0.03)',
                border: '1px solid rgba(0,242,254,0.10)',
                borderRadius: 'var(--r-card)',
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                transition: 'border-color .2s, box-shadow .2s, background .2s',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(0,242,254,0.25)';
                e.currentTarget.style.boxShadow = '0 0 32px rgba(0,242,254,0.07)';
                e.currentTarget.style.background = 'rgba(0,242,254,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(0,242,254,0.10)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(0,242,254,0.03)';
              }}
            >
              {/* Top accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 24, right: 24, height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(0,242,254,0.18), transparent)',
              }}/>

              {/* Label mono */}
              <div style={{
                fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: 'var(--t4)',
                letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 20,
              }}>
                {f.label}
              </div>

              {/* Icon */}
              <div style={{ marginBottom: 20 }}>{f.icon}</div>

              {/* Title */}
              <h3 style={{
                fontFamily: 'var(--f-display)', fontSize: '1.35rem', fontWeight: 400,
                color: 'var(--t0)', marginBottom: 12, letterSpacing: '-.01em',
              }}>
                {f.title}
              </h3>

              {/* Description */}
              <p style={{
                fontSize: '.855rem', color: 'var(--t3)', lineHeight: 1.65,
                marginBottom: 28, flexGrow: 1,
              }}>
                {f.desc}
              </p>

              {/* CTA */}
              <button
                className="btn btn-ghost btn-sm"
                style={{ alignSelf: 'flex-start' }}
                onClick={() => handleCta(f.route)}
              >
                {f.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
FEOF

# ── src/components/Pricing.jsx
mkdir -p $(dirname 'src/components/Pricing.jsx')
cat > 'src/components/Pricing.jsx' << 'FEOF'
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
FEOF

# ── src/pages/Home.jsx
mkdir -p $(dirname 'src/pages/Home.jsx')
cat > 'src/pages/Home.jsx' << 'FEOF'
import Hero from '../components/Hero';
import AnalysisPanel from '../components/AnalysisPanel';
import AgentsSection from '../components/AgentsSection';
import FeaturesSection from '../components/FeaturesSection';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <div id="analise"><AnalysisPanel /></div>
      <div id="agentes"><AgentsSection /></div>
      <FeaturesSection />
      <Pricing />
      <Footer />
    </>
  );
}
FEOF

echo "✅ 3 arquivos atualizados"
npm run build && git add -A && git commit -m "feat: FeaturesSection + Pricing 4 planos (0/49/299/999)" && git push
echo "🎉 Deploy concluído!"