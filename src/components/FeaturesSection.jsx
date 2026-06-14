import { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    id: 'delta',
    icon: '⚡',
    title: 'Delta Analysis',
    subtitle: 'Comparativo inteligente de casos',
    desc: 'Compare dois cenários jurídicos lado a lado com análise dimensional de divergências, convergências e probabilidades de êxito por instância.',
    tags: ['Comparativo', 'Instâncias', 'Probabilidade'],
    color: 'from-blue-500 to-cyan-500',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    route: '/delta',
  },
  {
    id: 'documentos',
    icon: '📄',
    title: 'Análise de Documentos',
    subtitle: 'PDF e Word com IA jurídica',
    desc: 'Faça upload de contratos, petições, laudos e documentos jurídicos. A IA extrai cláusulas críticas, riscos e recomendações automáticas.',
    tags: ['PDF', 'Word', 'Contratos'],
    color: 'from-violet-500 to-purple-500',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/5',
    route: '/documentos',
  },
  {
    id: 'peticoes',
    icon: '✍️',
    title: 'Gerador de Petições',
    subtitle: 'Documentos profissionais em .docx',
    desc: 'Gere petições iniciais, recursos, contestações e memoriais com linguagem jurídica precisa, formatados para protocolo imediato.',
    tags: ['Petição Inicial', 'Recursos', 'Contestação'],
    color: 'from-amber-500 to-orange-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    route: '/peticoes',
  },
  {
    id: 'simulador',
    icon: '⚖️',
    title: 'Simulador de Instâncias',
    subtitle: 'Projete o futuro do seu processo',
    desc: 'Simule o percurso processual em 1ª instância, TJ, STJ e STF. Receba probabilidades de êxito, tempo estimado e estratégias por tribunal.',
    tags: ['1ª Instância', 'TJ', 'STJ', 'STF'],
    color: 'from-green-500 to-emerald-500',
    border: 'border-green-500/30',
    bg: 'bg-green-500/5',
    route: '/simulador',
  },
  {
    id: 'monitoramento',
    icon: '🔔',
    title: 'Monitoramento Processual',
    subtitle: 'Acompanhamento via DATAJUD',
    desc: 'Monitore processos em tempo real via DATAJUD. Receba alertas automáticos sobre movimentações, prazos e decisões relevantes.',
    tags: ['DATAJUD', 'Alertas', 'Prazos'],
    color: 'from-red-500 to-rose-500',
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    route: '/monitoramento',
  },
  {
    id: 'verificar',
    icon: '🔏',
    title: 'Verificar Relatório',
    subtitle: 'Autenticidade garantida por serial',
    desc: 'Valide a autenticidade de qualquer relatório Jurir pelo número serial. Sistema à prova de fraudes com registro imutável.',
    tags: ['Serial', 'Autenticidade', 'Validação'],
    color: 'from-slate-400 to-gray-400',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/5',
    route: '/verificar',
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
    <section id="funcionalidades" style={{ padding: '80px 24px', background: 'linear-gradient(180deg, #030712 0%, #0a0f1e 100%)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 4, color: 'var(--am4)', textTransform: 'uppercase' }}>
            FUNCIONALIDADES
          </span>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, margin: '16px 0 20px', color: '#fff', lineHeight: 1.2 }}>
            Tudo que seu escritório precisa
          </h2>
          <p style={{ fontSize: 17, color: 'var(--muted)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Ferramentas jurídicas com IA de ponta, integradas em uma única plataforma.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {FEATURES.map(f => (
            <div
              key={f.id}
              onMouseEnter={() => setHovered(f.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleCTA(f.route)}
              style={{
                background: hovered === f.id ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hovered === f.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 16,
                padding: '28px 28px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                transform: hovered === f.id ? 'translateY(-4px)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {/* Icon + Title */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24,
                }}>
                  {f.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: '#fff', marginBottom: 4 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{f.subtitle}</div>
                </div>
              </div>

              {/* Desc */}
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0 }}>
                {f.desc}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {f.tags.map(t => (
                  <span key={t} style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px',
                    borderRadius: 20, background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5,
                  }}>{t}</span>
                ))}
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--am4)' }}>
                  {authToken ? 'Acessar' : 'Entrar para usar'}
                </span>
                <span style={{ color: 'var(--am4)', fontSize: 16 }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
