import { useState } from 'react';
import { Check, Zap, Building2, Code2, CreditCard, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { API_BASE } from '../lib/constants';

const PLANS = [
  {
    id: 'credito', name: 'Crédito Avulso', price: 'R$ 19', period: 'por análise',
    icon: <CreditCard size={22}/>, color: 'var(--au6)', border: 'var(--b-gold)',
    shadow: '0 0 30px rgba(180,140,60,0.12)', desc: 'Ideal para uso ocasional.',
    features: ['1 análise premium completa','16 agentes especializados','Advogado do Diabo','Juiz IA + JURIR Score','PDF profissional'],
  },
  {
    id: 'solo', name: 'Solo', price: 'R$ 49', period: '/mês',
    icon: <Zap size={22}/>, color: 'var(--cr3)', border: 'var(--b-crimson)',
    shadow: '0 0 30px rgba(180,40,40,0.12)', badge: 'MAIS POPULAR', desc: 'Para advogados autônomos.',
    features: ['Análises ilimitadas','16 agentes especializados','Advogado do Diabo','Juiz IA + JURIR Score','PDF profissional','Delta Analysis','Upload de documentos','Gerador de Petições','Simulador de Instâncias','Monitoramento Processual','Histórico completo'],
  },
  {
    id: 'escritorio', name: 'Escritório', price: 'R$ 299', period: '/mês',
    icon: <Building2 size={22}/>, color: 'var(--co7)', border: 'var(--b-main)',
    shadow: '0 0 30px rgba(0,180,220,0.12)', desc: 'Para escritórios e equipes.',
    features: ['Tudo do plano Solo','Até 5 usuários','Dashboard multi-usuário','Logo próprio no PDF','Exportação em lote ZIP','Gestão de membros','Convite por email'],
  },
  {
    id: 'api', name: 'API', price: 'R$ 999', period: '/mês',
    icon: <Code2 size={22}/>, color: 'var(--jade2)', border: '1px solid var(--jade2)',
    shadow: '0 0 30px rgba(0,200,130,0.12)', desc: 'Para integração e automação.',
    features: ['Tudo do plano Escritório','API Key própria (X-Api-Key)','Webhook outbound','Sandbox de testes','Usuários ilimitados','Suporte prioritário','SLA garantido'],
  },
];

export default function CheckoutPage() {
  const { authToken, openModal, addToast } = useStore();
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleCheckout = async (planId) => {
    if (!authToken) { openModal('login'); return; }
    setLoadingPlan(planId);
    try {
      const r = await fetch(`${API_BASE}/api/billing/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || `Erro ${r.status}`);
      if (data.url) window.location.href = data.url;
      else throw new Error('URL de checkout não recebida.');
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div style={{ maxWidth: 1060, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{ fontSize: '.75rem', color: 'var(--co7)', fontFamily: 'var(--f-mono)', letterSpacing: '.15em', marginBottom: 10 }}>PLANOS & PREÇOS</div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 700, marginBottom: 14 }}>Escolha seu plano</h1>
        <p style={{ color: 'var(--p4)', fontSize: '.95rem', maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
          De análises avulsas a integrações via API — o Jurir tem o plano certo para o seu caso.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        {PLANS.map(plan => {
          const isLoading = loadingPlan === plan.id;
          return (
            <div key={plan.id} style={{
              background: 'var(--surface)', border: `1px solid ${plan.border}`,
              borderRadius: 'var(--r-xl)', padding: 28, boxShadow: plan.shadow,
              display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                  background: plan.color, color: '#fff', fontSize: '.75rem', fontWeight: 700,
                  letterSpacing: '.12em', padding: '3px 10px', borderRadius: 20,
                  whiteSpace: 'nowrap', fontFamily: 'var(--f-mono)',
                }}>{plan.badge}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ color: plan.color }}>{plan.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--p1)' }}>{plan.name}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--p5)' }}>{plan.desc}</div>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <span className="t-display" style={{ fontSize: '1.9rem', fontWeight: 700, color: plan.color }}>{plan.price}</span>
                <span style={{ fontSize: '.78rem', color: 'var(--p4)', marginLeft: 4 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', flex: 1, display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 24 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: '.8rem', color: 'var(--p2)', alignItems: 'flex-start' }}>
                    <Check size={12} style={{ color: plan.color, flexShrink: 0, marginTop: 3 }}/> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCheckout(plan.id)}
                disabled={!!loadingPlan}
                style={{
                  width: '100%', padding: '11px', borderRadius: 'var(--r-md)',
                  border: `1px solid ${plan.border}`, background: 'transparent',
                  color: plan.color, fontWeight: 700, fontSize: '.84rem',
                  cursor: loadingPlan ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  transition: 'all .18s', opacity: loadingPlan && !isLoading ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!loadingPlan) { e.currentTarget.style.background = plan.color; e.currentTarget.style.color = '#fff'; }}}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = plan.color; }}
              >
                {isLoading
                  ? <><Loader2 size={14} className="spin"/> Redirecionando…</>
                  : <><CreditCard size={14}/> {plan.id === 'credito' ? 'Comprar crédito' : 'Assinar'}</>
                }
              </button>
            </div>
          );
        })}
      </div>
      <p style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--p5)', marginTop: 28, lineHeight: 1.6 }}>
        Pagamento seguro via Stripe · Cancele a qualquer momento · Sem taxas ocultas
      </p>
    </div>
  );
}
