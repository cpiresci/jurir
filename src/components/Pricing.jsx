import { Check, Zap, ArrowRight, Code2, CreditCard } from 'lucide-react';
import { useStore } from '../store';
import { API_BASE } from '../lib/constants';

const PLANS_TOP = [
  {
    id: 'free',
    label: 'GRATUITO',
    price: 'R$ 0',
    sub: 'para sempre · sem cartão',
    badge: null,
    color: 'free',
    features: [
      '1 agente especialista por análise',
      'Análise jurídica básica da área relevante',
      'Resultado em até 3 minutos',
      'Sem necessidade de cadastro',
    ],
    cta: 'Usar Grátis Agora',
    action: 'scroll',
  },
  {
    id: 'credito',
    label: 'POR ANÁLISE',
    price: 'R$ 4',
    priceDecimal: ',90',
    sub: 'por análise · pague só quando usar',
    badge: 'SEM ASSINATURA',
    note: '💡 Ideal para casos únicos. Sem recorrência.',
    color: 'jade',
    features: [
      'Todos os 16 agentes em paralelo',
      'Advogado do Diabo — contraditório completo',
      'Juiz IA Quantum + veredicto final',
      'JURIR Score dimensional',
      'Relatório PDF disponível por 30 dias',
      'Serial de autenticidade verificável',
    ],
    cta: 'Comprar Análise — R$4,90',
    action: 'checkout_credito',
  },
  {
    id: 'solo',
    label: 'SOLO',
    price: 'R$ 19',
    priceDecimal: ',90',
    sub: 'por mês · cancele quando quiser',
    badge: '✦ MAIS POPULAR',
    color: 'cyan',
    features: [
      'Análises ilimitadas',
      'Todos os 16 agentes em paralelo',
      'Advogado do Diabo + Juiz IA Quantum',
      'JURIR Score dimensional completo',
      'Streaming SSE em tempo real',
      'Delta Analysis — comparativo de casos',
      'Análise de documentos PDF/Word',
      'Simulador de Instâncias (1ª, TJ, STJ, STF)',
      'Gerador de Petições (.docx)',
      'Monitoramento Processual via DATAJUD',
      'Histórico completo + exportação PDF',
    ],
    cta: 'Começar Solo — R$19,90/mês',
    action: 'checkout_solo',
  },
];

const PLANS_BOT = [
  {
    id: 'escritorio',
    label: 'ESCRITÓRIO',
    price: 'R$ 79',
    priceDecimal: ',90',
    sub: 'por mês · cancele quando quiser',
    badge: 'ATÉ 5 USUÁRIOS',
    color: 'violet',
    features: [
      '30 análises completas/mês',
      'Até 5 usuários com acessos individuais',
      'Tudo do plano Solo para cada usuário',
      'White-label no relatório PDF (logo do escritório)',
      'API com 500 requisições/mês',
      'Dashboard centralizado de casos',
      'Exportação em lote (ZIP)',
      'Suporte prioritário via chat',
      'Treinamento inicial incluído (1h)',
    ],
    cta: 'Contratar Escritório — R$79,90/mês',
    action: 'checkout_escritorio',
  },
  {
    id: 'api',
    label: 'API & PLATAFORMA',
    price: 'R$ 149',
    priceDecimal: ',90',
    sub: 'por mês · cancele quando quiser',
    badge: 'ENTERPRISE',
    color: 'gold',
    features: [
      'API REST com 5.000 requisições/mês',
      'Usuários ilimitados na organização',
      'Análises ilimitadas incluídas',
      'White-label total — remova referências ao JURIR',
      'Webhook para integração de sistemas',
      'SSE streaming via API',
      'SLA 99,5% de uptime contratual',
      'Suporte dedicado com gerente de conta',
      'Sandbox para testes e homologação',
      'NF/CNPJ · contrato PJ disponível',
    ],
    cta: 'Assinar API — R$149,90/mês',
    action: 'checkout_api',
  },
];

const PALETTE = {
  free:    { border: 'rgba(255,255,255,.08)',  glow: 'transparent',         badgeBg: 'rgba(255,255,255,.06)', badgeColor: 'rgba(255,255,255,.4)',  checkColor: '#10b981', ctaBg: 'transparent',        ctaColor: 'rgba(255,255,255,.55)', ctaBorder: 'rgba(255,255,255,.14)' },
  jade:    { border: 'rgba(16,185,129,.22)',   glow: 'rgba(16,185,129,.08)', badgeBg: 'rgba(16,185,129,.1)',  badgeColor: '#34d399',               checkColor: '#10b981', ctaBg: 'linear-gradient(135deg,#10b981,#34d399)', ctaColor: '#050507', ctaBorder: 'none' },
  cyan:    { border: 'rgba(0,242,254,.28)',    glow: 'rgba(0,242,254,.10)',  badgeBg: 'rgba(0,242,254,.1)',   badgeColor: '#00f2fe',               checkColor: '#00f2fe', ctaBg: 'linear-gradient(135deg,#00f2fe,#4facfe)', ctaColor: '#050507', ctaBorder: 'none' },
  violet:  { border: 'rgba(124,58,237,.28)',   glow: 'rgba(124,58,237,.10)', badgeBg: 'rgba(124,58,237,.12)', badgeColor: '#a78bfa',              checkColor: '#a78bfa', ctaBg: 'linear-gradient(135deg,#7c3aed,#a78bfa)', ctaColor: '#fff',   ctaBorder: 'none' },
  gold:    { border: 'rgba(229,176,75,.32)',   glow: 'rgba(229,176,75,.12)', badgeBg: 'rgba(229,176,75,.12)', badgeColor: '#f0c96a',              checkColor: '#e5b04b', ctaBg: 'linear-gradient(135deg,#e5b04b,#f0c96a)', ctaColor: '#050507', ctaBorder: 'none' },
};

function PlanCard({ plan, wide = false }) {
  const { openModal, authToken } = useStore();
  const p = PALETTE[plan.color];
  const isPopular = plan.badge === '✦ MAIS POPULAR';

  const handleCta = () => {
    if (plan.action === 'scroll') {
      document.getElementById('analise')?.scrollIntoView({ behavior: 'smooth' });
    } else if (plan.action === 'contact') {
      window.open('mailto:contato@jurir.app', '_blank');
    } else {
      if (!authToken) { openModal('register'); return; }
      const planName = plan.action.replace('checkout_', '');
      fetch(`${API_BASE}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ plan: planName }),
      })
        .then(r => r.json())
        .then(d => { if (d.url) window.location.href = d.url; })
        .catch(() => alert('Erro ao iniciar pagamento. Tente novamente.'));
    }
  };

  return (
    <div style={{
      borderRadius: 24,
      padding: wide ? '32px 28px' : '32px 28px',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${p.border}`,
      background: plan.color === 'free'
        ? 'rgba(255,255,255,.028)'
        : `linear-gradient(145deg, ${p.glow} 0%, rgba(0,0,0,.18) 100%)`,
      boxShadow: plan.color !== 'free' ? `0 0 0 1px ${p.border}, 0 8px 40px rgba(0,0,0,.5), 0 0 60px ${p.glow}` : 'none',
      transition: 'transform .25s, box-shadow .25s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {plan.color !== 'free' && (
        <div style={{
          position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
          background: `linear-gradient(90deg, transparent, ${p.badgeColor}, transparent)`,
        }}/>
      )}
      {plan.color !== 'free' && (
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 280, height: 150, borderRadius: '50%',
          background: `radial-gradient(ellipse at 50% 0%, ${p.glow} 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}/>
      )}
      {isPopular && (
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg,#00f2fe,#4facfe)',
          borderRadius: '0 0 10px 10px', padding: '4px 16px',
          fontFamily: 'var(--f-mono)', fontSize: '.52rem',
          fontWeight: 700, color: '#050507', letterSpacing: '.1em', whiteSpace: 'nowrap',
          zIndex: 2,
        }}>
          {plan.badge}
        </div>
      )}
      <div style={{ position: 'relative', zIndex: 1, marginTop: isPopular ? 18 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{
            fontFamily: 'var(--f-mono)', fontSize: '.58rem',
            color: 'rgba(255,255,255,.35)', letterSpacing: '.2em', textTransform: 'uppercase',
          }}>{plan.label}</span>
          {plan.badge && !isPopular && (
            <span style={{
              background: p.badgeBg, border: `1px solid ${p.border}`,
              borderRadius: 999, padding: '3px 10px',
              fontFamily: 'var(--f-mono)', fontSize: '.54rem',
              color: p.badgeColor, letterSpacing: '.1em',
            }}>{plan.badge}</span>
          )}
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontFamily: 'var(--f-display)', fontSize: '3rem', fontWeight: 600, lineHeight: 1,
            background: plan.color === 'free' ? 'none' : `linear-gradient(135deg, ${p.badgeColor}, ${p.checkColor})`,
            WebkitBackgroundClip: plan.color === 'free' ? 'unset' : 'text',
            WebkitTextFillColor: plan.color === 'free' ? 'var(--t0)' : 'transparent',
            backgroundClip: plan.color === 'free' ? 'unset' : 'text',
          }}>
            {plan.price}
          </span>
          {plan.priceDecimal && (
            <span style={{
              fontFamily: 'var(--f-display)', fontSize: '1.8rem', fontWeight: 600,
              background: `linear-gradient(135deg, ${p.badgeColor}, ${p.checkColor})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{plan.priceDecimal}</span>
          )}
        </div>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.7rem', color: 'rgba(255,255,255,.3)', marginBottom: plan.note ? 10 : 20, letterSpacing: '.06em' }}>
          {plan.sub}
        </div>
        {plan.note && (
          <div style={{
            fontFamily: 'var(--f-mono)', fontSize: '.6rem', color: p.badgeColor,
            background: p.badgeBg, border: `1px solid ${p.border}`,
            borderRadius: 8, padding: '8px 12px', marginBottom: 16, lineHeight: 1.5,
          }}>{plan.note}</div>
        )}
        <div style={{ height: 1, background: `${p.border}`, marginBottom: 18 }}/>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
          {plan.features.map((f, i) => (
            <li key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <Check size={12} style={{ color: p.checkColor, flexShrink: 0, marginTop: 3 }}/>
              <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.7)', lineHeight: 1.45 }}>{f}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={handleCta}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 999,
            fontFamily: 'var(--f-mono)', fontSize: '.78rem', fontWeight: 700,
            letterSpacing: '.08em', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: p.ctaBg,
            color: p.ctaColor,
            border: p.ctaBorder !== 'none' ? `1px solid ${p.ctaBorder}` : 'none',
            boxShadow: plan.color !== 'free' ? `0 0 36px ${p.glow}` : 'none',
            transition: 'all .25s',
          }}
          onMouseEnter={e => { if (plan.color !== 'free') e.currentTarget.style.filter = 'brightness(1.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.filter = ''; }}
        >
          {plan.id === 'solo' && <Zap size={13}/>}
          {plan.id === 'credito' && <CreditCard size={13}/>}
          {plan.id === 'api' && <Code2 size={13}/>}
          {plan.cta}
          {(plan.id === 'solo' || plan.id === 'escritorio') && <ArrowRight size={13}/>}
        </button>
      </div>
    </div>
  );
}

export default function Pricing() {
  return (
    <section id="precos" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1060, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Planos & Acesso</div>
          <h2 className="t-display" style={{
            fontSize: 'clamp(1.9rem,4vw,2.8rem)', fontWeight: 400,
            color: 'var(--t0)', marginBottom: 14, letterSpacing: '-.02em',
          }}>
            Escolha seu nível de{' '}
            <em style={{ fontStyle: 'italic', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              poder jurídico
            </em>
          </h2>
          <p style={{ color: 'var(--t3)', fontSize: '.9rem', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Do diagnóstico gratuito à infraestrutura completa para escritórios e plataformas.
          </p>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16,
          marginBottom: 16,
        }}>
          {PLANS_TOP.map(plan => <PlanCard key={plan.id} plan={plan}/>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '8px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(124,58,237,.2),rgba(229,176,75,.15),transparent)' }}/>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '.56rem', color: 'rgba(255,255,255,.25)', letterSpacing: '.22em', whiteSpace: 'nowrap' }}>
            PLANOS PARA ESCRITÓRIOS & PLATAFORMAS
          </span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(229,176,75,.15),rgba(124,58,237,.2),transparent)' }}/>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}>
          {PLANS_BOT.map(plan => <PlanCard key={plan.id} plan={plan} wide/>)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          {['🔒 Pagamento 100% seguro','✅ 30 dias de garantia','⚡ Acesso imediato','🚫 Cancele quando quiser','📄 NF disponível'].map((item, i) => (
            <span key={i} style={{
              fontFamily: 'var(--f-mono)', fontSize: '.62rem',
              color: 'rgba(255,255,255,.25)', letterSpacing: '.08em',
            }}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
