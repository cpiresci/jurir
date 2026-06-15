#!/bin/bash
set -e
cd ~/jurir
echo "🚀 Upgrade v2 — FeaturesSection (8 cards) + ProcessSection + AgentsSection refinada..."

# ══════════════════════════════════════════════
# 1. FeaturesSection.jsx — 8 cards, hover lift,
#    gradient ::before, tags GRATUITO/PREMIUM
# ══════════════════════════════════════════════
mkdir -p src/components
cat > src/components/FeaturesSection.jsx << 'FEOF'
import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';

const FEATURES = [
  {
    id: 'analise',
    emoji: '⚛️',
    label: 'Core',
    title: 'Análise Jurídica Quântica',
    desc: '16 agentes IA em paralelo analisam seu caso simultaneamente, com contraditório real via Advogado do Diabo e veredicto do Juiz IA Quantum.',
    tag: 'GRATUITO · PREMIUM',
    tagJade: false,
    route: null,
    cta: 'Analisar caso',
    scrollTo: 'analise',
  },
  {
    id: 'score',
    emoji: '📊',
    label: 'Score',
    title: 'JURIR Score Dimensional',
    desc: 'Pontuação multidimensional do seu caso: mérito jurídico, risco processual, probabilidade de êxito e solidez dos argumentos.',
    tag: 'PREMIUM',
    tagJade: false,
    route: null,
    cta: 'Ver score',
    scrollTo: 'analise',
  },
  {
    id: 'delta',
    emoji: '🔀',
    label: 'Delta Analysis',
    title: 'Delta Analysis',
    desc: 'Compare dois casos jurídicos. A IA mapeia divergências, precedentes conflitantes e variações de risco entre cenários distintos.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/delta',
    cta: 'Comparar casos',
  },
  {
    id: 'documentos',
    emoji: '📄',
    label: 'Documentos',
    title: 'Análise de Documentos',
    desc: 'Upload de contratos, petições ou decisões em PDF ou Word. Os 16 agentes extraem cláusulas, identificam riscos e geram análise completa.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/documentos',
    cta: 'Analisar documento',
  },
  {
    id: 'peticoes',
    emoji: '📝',
    label: 'Petições',
    title: 'Gerador de Petições',
    desc: 'Gere petições iniciais, recursos e contestações profissionais em .docx com fundamentação automática, citação de jurisprudência e formatação ABNT.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/peticoes',
    cta: 'Gerar petição',
  },
  {
    id: 'simulador',
    emoji: '🏛️',
    label: 'Simulador',
    title: 'Simulador de Instâncias',
    desc: 'Simule o percurso processual em 1ª instância, TJ, STJ e STF. Projete probabilidades de êxito, prazos e custos em cada grau de jurisdição.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/simulador',
    cta: 'Simular instâncias',
  },
  {
    id: 'monitoramento',
    emoji: '🔍',
    label: 'Monitoramento',
    title: 'Monitoramento Processual',
    desc: 'Acompanhe processos em tempo real via DATAJUD. Receba alertas automáticos sobre movimentações, publicações e prazos críticos.',
    tag: 'PREMIUM',
    tagJade: false,
    route: '/monitoramento',
    cta: 'Monitorar processo',
  },
  {
    id: 'historico',
    emoji: '📋',
    label: 'Histórico',
    title: 'Histórico de Análises',
    desc: 'Todas as suas análises salvas e organizadas. Revisite, compare e exporte relatórios completos em PDF com serial de autenticidade verificável.',
    tag: 'INCLUSO NO PREMIUM',
    tagJade: true,
    route: '/historico',
    cta: 'Ver histórico',
  },
];

function FeatureCard({ f, onCta }) {
  const cardRef = useRef(null);

  const handleEnter = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.background = 'var(--card-hover)';
    el.style.borderColor = 'rgba(0,242,254,0.20)';
    el.style.transform = 'translateY(-4px)';
    el.style.boxShadow = '0 0 0 1px rgba(0,242,254,0.2), 0 8px 48px rgba(0,0,0,0.7), 0 0 60px rgba(0,242,254,0.10)';
    el.querySelector('.fc-topbar').style.opacity = '1';
  };
  const handleLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.background = 'var(--card)';
    el.style.borderColor = 'rgba(0,242,254,0.10)';
    el.style.transform = 'translateY(0)';
    el.style.boxShadow = 'none';
    el.querySelector('.fc-topbar').style.opacity = '0';
  };

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        position: 'relative',
        background: 'var(--card)',
        border: '1px solid rgba(0,242,254,0.10)',
        borderRadius: 'var(--r-lg)',
        padding: '28px 26px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all .3s cubic-bezier(0.19,1,0.22,1)',
        overflow: 'hidden',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Gradient top bar (hover reveal) */}
      <div className="fc-topbar" style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)',
        opacity: 0,
        transition: 'opacity .3s',
      }} />

      {/* Label mono */}
      <div style={{
        fontFamily: 'var(--f-mono)', fontSize: '.58rem', color: 'var(--t4)',
        letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 16,
      }}>
        {f.label}
      </div>

      {/* Icon */}
      <div style={{
        fontSize: '1.5rem', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 48, height: 48, borderRadius: 'var(--r-md)',
        background: 'rgba(0,242,254,0.06)',
        border: '1px solid rgba(0,242,254,0.10)',
      }}>
        {f.emoji}
      </div>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--f-sans)', fontSize: '.88rem', fontWeight: 600,
        color: 'var(--t0)', marginBottom: 8, letterSpacing: '.01em',
      }}>
        {f.title}
      </h3>

      {/* Desc */}
      <p style={{
        fontFamily: 'var(--f-display)', fontSize: '.8rem', color: 'var(--t3)',
        lineHeight: 1.65, fontWeight: 400, flex: 1,
      }}>
        {f.desc}
      </p>

      {/* Tag */}
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        marginTop: 14, padding: '3px 9px',
        background: f.tagJade ? 'rgba(16,185,129,0.06)' : 'rgba(0,242,254,0.05)',
        border: f.tagJade
          ? '1px solid rgba(16,185,129,0.15)'
          : '1px solid rgba(0,242,254,0.10)',
        borderRadius: 999,
        fontFamily: 'var(--f-mono)', fontSize: '.52rem',
        color: f.tagJade ? 'var(--jade2)' : 'var(--co7)',
        letterSpacing: '.10em',
        alignSelf: 'flex-start',
      }}>
        {f.tag}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const navigate = useNavigate();
  const { authToken, openModal } = useStore();

  const handleCta = (f) => {
    if (f.scrollTo) {
      document.getElementById(f.scrollTo)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (authToken) navigate(f.route);
    else openModal('register');
  };

  return (
    <section
      id="funcionalidades"
      style={{
        padding: 'clamp(60px,8vw,120px) 28px',
        background: 'var(--abyss)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}
    >
      {/* Top center light line */}
      <div style={{
        position: 'absolute', top: 0, left: '50%',
        transform: 'translateX(-50%)',
        width: 800, height: 1,
        background: 'linear-gradient(90deg,transparent,rgba(0,242,254,0.20),transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>

        {/* Header */}
        <div className="section-label" style={{ marginBottom: 18 }}>Plataforma Completa</div>
        <h2 className="t-display" style={{
          fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300,
          color: 'var(--t0)', marginBottom: 14,
          letterSpacing: '-.025em', lineHeight: 1.1,
        }}>
          Todas as ferramentas que{' '}
          <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>seu caso precisa</span>
        </h2>
        <p style={{
          fontFamily: 'var(--f-display)', fontSize: '.9rem', color: 'var(--t3)',
          lineHeight: 1.75, maxWidth: 540, margin: '0 auto 56px',
        }}>
          O JURIR não é apenas uma análise. É um ecossistema jurídico completo,
          do diagnóstico inicial até a petição pronta para protocolo.
        </p>

        {/* Grid 8 cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {FEATURES.map(f => (
            <FeatureCard key={f.id} f={f} onCta={handleCta} />
          ))}
        </div>
      </div>
    </section>
  );
}
FEOF

# ══════════════════════════════════════════════
# 2. ProcessSection.jsx — 4 etapas com conector
#    (seção nova, não existia no React)
# ══════════════════════════════════════════════
cat > src/components/ProcessSection.jsx << 'FEOF'
const STEPS = [
  {
    num: '01',
    emoji: '📋',
    title: 'Caso Submetido',
    desc: 'Seu caso é processado, classificado por área e distribuído simultaneamente aos 16 agentes do Conselho.',
  },
  {
    num: '02',
    emoji: '⚡',
    title: '16 Análises em Paralelo',
    desc: 'Cada especialista analisa de forma independente: jurisprudência, legislação vigente e probabilidade de êxito.',
  },
  {
    num: '03',
    emoji: '⚔️',
    title: 'Advogado do Diabo',
    desc: 'O contraditório é apresentado com máxima rigorosidade — fraquezas, riscos e argumentos adversos à sua tese.',
  },
  {
    num: '04',
    emoji: '🏛️',
    title: 'Juiz IA Quantum + Score',
    desc: 'Deliberação final com todo o material. Prolata o veredicto e determina o JURIR Score dimensional do seu caso.',
  },
];

function ProcessCard({ step }) {
  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid rgba(0,242,254,0.10)',
        borderRadius: 'var(--r-lg)',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        height: '100%',
        transition: 'all .3s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--card-hover)';
        e.currentTarget.style.borderColor = 'rgba(0,242,254,0.20)';
        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,242,254,0.2), 0 8px 48px rgba(0,0,0,0.7), 0 0 60px rgba(0,242,254,0.10)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--card)';
        e.currentTarget.style.borderColor = 'rgba(0,242,254,0.10)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Circle com número */}
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: 'rgba(0,242,254,0.06)',
        border: '1px solid rgba(0,242,254,0.10)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.2rem', marginBottom: 16,
        position: 'relative',
        boxShadow: '0 0 0 6px rgba(0,242,254,0.03)',
        flexShrink: 0,
      }}>
        {step.emoji}
        {/* Badge número */}
        <div style={{
          position: 'absolute', top: -5, right: -5,
          width: 19, height: 19, borderRadius: '50%',
          background: 'linear-gradient(135deg,#00f2fe,#4facfe)',
          fontFamily: 'var(--f-mono)', fontSize: '.48rem', fontWeight: 700,
          color: '#050507',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {step.num}
        </div>
      </div>

      <h3 style={{
        fontFamily: 'var(--f-sans)', fontSize: '.84rem', fontWeight: 700,
        color: 'var(--t0)', marginBottom: 9, letterSpacing: '.01em',
      }}>
        {step.title}
      </h3>
      <p style={{
        fontFamily: 'var(--f-display)', fontSize: '.78rem', color: 'var(--t3)',
        lineHeight: 1.65, fontWeight: 400,
      }}>
        {step.desc}
      </p>
    </div>
  );
}

function Connector() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', paddingTop: 40, flexShrink: 0,
    }}>
      <div style={{ width: 24, height: 1, background: 'rgba(0,242,254,0.20)' }} />
      <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(0,242,254,0.40)', flexShrink: 0 }} />
      <div style={{ width: 24, height: 1, background: 'rgba(0,242,254,0.20)' }} />
    </div>
  );
}

export default function ProcessSection() {
  return (
    <section style={{
      padding: 'clamp(60px,8vw,100px) 28px',
      background: 'var(--abyss)',
      borderTop: '1px solid rgba(255,255,255,0.05)',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>

        <div className="section-label" style={{ marginBottom: 18 }}>Processo de Análise Quântica</div>
        <h2 className="t-display" style={{
          fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300,
          color: 'var(--t0)', marginBottom: 14,
          letterSpacing: '-.025em', lineHeight: 1.1,
        }}>
          Como o tribunal{' '}
          <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>funciona</span>
        </h2>
        <p style={{
          fontFamily: 'var(--f-display)', fontSize: '.9rem', color: 'var(--t3)',
          lineHeight: 1.75, maxWidth: 540, margin: '0 auto 56px',
        }}>
          Quatro etapas que transformam a descrição do seu caso em um veredicto
          técnico preciso, com contraditório real e score dimensional.
        </p>

        {/* Desktop: flex com conectores */}
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 0,
        }}
          className="process-grid-responsive"
        >
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'stretch', flex: 1, minWidth: 0 }}>
              <div style={{ flex: 1 }}>
                <ProcessCard step={step} />
              </div>
              {i < STEPS.length - 1 && <Connector />}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .process-grid-responsive {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .process-grid-responsive > div {
            flex: none !important;
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
}
FEOF

# ══════════════════════════════════════════════
# 3. AgentsSection.jsx — grid denso minmax(190px)
#    com barra lateral cyan, agent-id mono
# ══════════════════════════════════════════════
cat > src/components/AgentsSection.jsx << 'FEOF'
const AGENTS = [
  { id:'#01', emoji:'⚖️',  name:'Direito Civil' },
  { id:'#02', emoji:'🔒', name:'Direito Penal' },
  { id:'#03', emoji:'👷', name:'Direito Trabalhista' },
  { id:'#04', emoji:'👨‍👩‍👧', name:'Direito de Família' },
  { id:'#05', emoji:'🛒', name:'Direito do Consumidor' },
  { id:'#06', emoji:'💰', name:'Direito Tributário' },
  { id:'#07', emoji:'🏢', name:'Direito Empresarial' },
  { id:'#08', emoji:'🏠', name:'Direito Imobiliário' },
  { id:'#09', emoji:'💻', name:'Direito Digital' },
  { id:'#10', emoji:'🏥', name:'Direito Previdenciário' },
  { id:'#11', emoji:'🌿', name:'Direito Ambiental' },
  { id:'#12', emoji:'📜', name:'Direito Constitucional' },
  { id:'#13', emoji:'❤️',  name:'Direito à Saúde' },
  { id:'#14', emoji:'🌐', name:'Direito Internacional' },
  { id:'#15', emoji:'🗳️', name:'Direito Eleitoral' },
  { id:'#16', emoji:'🌾', name:'Direito Agrário' },
];

export default function AgentsSection() {
  return (
    <section id="agentes" style={{
      padding: 'clamp(60px,8vw,120px) 28px',
      position: 'relative', zIndex: 1,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>

        <div className="section-label" style={{ marginBottom: 18 }}>O Conselho Jurídico Quântico</div>
        <h2 className="t-display" style={{
          fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 300,
          color: 'var(--t0)', marginBottom: 14,
          letterSpacing: '-.025em', lineHeight: 1.1,
        }}>
          Dezesseis especialistas.{' '}
          <br />
          <span className="accent-cobalt" style={{ fontStyle: 'italic' }}>Um único veredicto.</span>
        </h2>
        <p style={{
          fontFamily: 'var(--f-display)', fontSize: '.9rem', color: 'var(--t3)',
          lineHeight: 1.75, maxWidth: 540, margin: '0 auto 48px',
        }}>
          Cada agente é treinado exclusivamente na sua área do direito brasileiro.
          Em paralelo, simultâneos — cada um analisa do ângulo que domina.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 10,
        }}>
          {AGENTS.map(a => (
            <div
              key={a.id}
              style={{
                background: 'var(--card)',
                border: '1px solid rgba(0,242,254,0.10)',
                borderRadius: 'var(--r-md)',
                padding: '16px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                transition: 'all .3s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--card-hover)';
                e.currentTarget.style.borderColor = 'rgba(0,242,254,0.20)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0,242,254,0.06)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--card)';
                e.currentTarget.style.borderColor = 'rgba(0,242,254,0.10)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Barra lateral cyan */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                background: 'linear-gradient(180deg,#00f2fe,#4facfe)',
                opacity: .4,
              }} />

              <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{a.emoji}</span>
              <div>
                <div style={{
                  fontFamily: 'var(--f-sans)', fontSize: '.77rem', fontWeight: 600,
                  color: 'var(--t1)', lineHeight: 1.3,
                }}>
                  {a.name}
                </div>
                <div style={{
                  fontFamily: 'var(--f-mono)', fontSize: '.55rem', color: 'var(--t4)',
                  letterSpacing: '.09em', marginTop: 3,
                }}>
                  ESPECIALISTA {a.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
FEOF

# ══════════════════════════════════════════════
# 4. Home.jsx — adicionar ProcessSection entre
#    AgentsSection e Pricing
# ══════════════════════════════════════════════
cat > src/pages/Home.jsx << 'FEOF'
import Hero from '../components/Hero';
import AnalysisPanel from '../components/AnalysisPanel';
import AgentsSection from '../components/AgentsSection';
import FeaturesSection from '../components/FeaturesSection';
import ProcessSection from '../components/ProcessSection';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <div id="analise"><AnalysisPanel /></div>
      <FeaturesSection />
      <div id="agentes"><AgentsSection /></div>
      <ProcessSection />
      <Pricing />
      <Footer />
    </>
  );
}
FEOF

echo "✅ 4 arquivos atualizados"
npm run build && git add -A && git commit -m "feat: 8-card FeaturesSection + ProcessSection (4 etapas) + AgentsSection densa" && git push
echo "🎉 Deploy v2 concluído!"
