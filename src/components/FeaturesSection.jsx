import { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    id: 'delta', icon: '⚡', title: 'Delta Analysis', subtitle: 'Comparativo inteligente de casos',
    desc: 'Compare dois cenários jurídicos lado a lado com análise dimensional de divergências, convergências e probabilidades de êxito por instância.',
    tags: ['Comparativo', 'Instâncias', 'Probabilidade'], route: '/delta',
    accent: '#0D1F3C',
  },
  {
    id: 'documentos', icon: '📄', title: 'Análise de Documentos', subtitle: 'PDF e Word com IA jurídica',
    desc: 'Faça upload de contratos, petições, laudos e documentos jurídicos. A IA extrai cláusulas críticas, riscos e recomendações automáticas.',
    tags: ['PDF', 'Word', 'Contratos'], route: '/documentos',
    accent: '#1a0533',
  },
  {
    id: 'peticoes', icon: '✍️', title: 'Gerador de Petições', subtitle: 'Documentos profissionais em .docx',
    desc: 'Gere petições iniciais, recursos, contestações e memoriais com linguagem jurídica precisa, formatados para protocolo imediato.',
    tags: ['Petição Inicial', 'Recursos', 'Contestação'], route: '/peticoes',
    accent: '#2d1500',
  },
  {
    id: 'simulador', icon: '⚖️', title: 'Simulador de Instâncias', subtitle: 'Projete o futuro do seu processo',
    desc: 'Simule o percurso processual em 1ª instância, TJ, STJ e STF. Receba probabilidades de êxito, tempo estimado e estratégias por tribunal.',
    tags: ['1ª Instância', 'TJ', 'STJ', 'STF'], route: '/simulador',
    accent: '#052010',
  },
  {
    id: 'monitoramento', icon: '🔔', title: 'Monitoramento Processual', subtitle: 'Acompanhamento via DATAJUD',
    desc: 'Monitore processos em tempo real via DATAJUD. Receba alertas automáticos sobre movimentações, prazos e decisões relevantes.',
    tags: ['DATAJUD', 'Alertas', 'Prazos'], route: '/monitoramento',
    accent: '#1f0505',
  },
  {
    id: 'verificar', icon: '🔏', title: 'Verificar Relatório', subtitle: 'Autenticidade garantida por serial',
    desc: 'Valide a autenticidade de qualquer relatório Jurir pelo número serial. Sistema à prova de fraudes com registro imutável.',
    tags: ['Serial', 'Autenticidade', 'Validação'], route: '/verificar',
    accent: '#0f1118',
  },
];

export default function FeaturesSection() {
  const { authToken, openModal } = useStore();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);

  function handleCTA(route) {
    if (!authToken) { openModal('login'); return; }
    navigate(route);
  }

  return (
    <section id="funcionalidades" style={{ padding: '80px 24px', background: 'var(--void)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: 'var(--co7)', textTransform: 'uppercase' }}>
            FUNCIONALIDADES
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, margin: '16px 0 16px', color: 'var(--abyss)', lineHeight: 1.2 }}>
            Tudo que seu escritório precisa
          </h2>
          <p style={{ fontSize: 16, color: 'var(--iron)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Ferramentas jurídicas com IA de ponta, integradas em uma única plataforma.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {FEATURES.map(f => (
            <div
              key={f.id}
              onMouseEnter={() => setHovered(f.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleCTA(f.route)}
              style={{
                background: hovered === f.id ? 'var(--shell)' : '#fff',
                border: `1.5px solid ${hovered === f.id ? 'var(--mist)' : 'var(--pale)'}`,
                borderRadius: 16,
                padding: '28px 24px 24px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                transform: hovered === f.id ? 'translateY(-3px)' : 'none',
                boxShadow: hovered === f.id ? '0 8px 32px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: 'var(--shell)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, border: '1px solid var(--pale)',
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--abyss)', marginBottom: 3 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--slate)' }}>{f.subtitle}</div>
                </div>
              </div>

              <p style={{ fontSize: 13.5, color: 'var(--iron)', lineHeight: 1.65, margin: 0 }}>
                {f.desc}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {f.tags.map(t => (
                  <span key={t} style={{
                    fontSize: 11, fontWeight: 600, padding: '3px 10px',
                    borderRadius: 20, background: 'var(--pale)',
                    color: 'var(--dusk)', letterSpacing: 0.3,
                  }}>{t}</span>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--co7)' }}>
                  {authToken ? 'Acessar' : 'Entrar para usar'}
                </span>
                <span style={{ color: 'var(--co7)', fontSize: 15 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
