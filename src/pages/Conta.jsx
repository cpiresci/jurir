import { useEffect, useState } from 'react';
import { User, CreditCard, BarChart2, Building2, Zap, Code2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { apiFetch } from '../lib/api';

const PLAN_LABEL = { free:'Gratuito', credito:'Crédito Avulso', mensal:'Solo', escritorio:'Escritório', api:'API' };
const PLAN_COLOR = { free:'var(--p5)', credito:'var(--au6)', mensal:'var(--cr3)', escritorio:'var(--co7)', api:'var(--jade2)' };
const PLAN_ICON  = { free:<User size={18}/>, credito:<CreditCard size={18}/>, mensal:<Zap size={18}/>, escritorio:<Building2 size={18}/>, api:<Code2 size={18}/> };

export default function ContaPage() {
  const { authToken, openModal, addToast, refreshUser } = useStore();
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [canceling, setCanceling] = useState(false);

  const load = () => {
    if (!authToken) { setLoading(false); return; }
    setLoading(true);
    apiFetch('/api/account/me', {}, authToken)
      .then(setData)
      .catch(e => addToast(e.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [authToken]);

  const handleCancel = async () => {
    if (!confirm('Cancelar assinatura? O acesso se mantém até o fim do período pago.')) return;
    setCanceling(true);
    try {
      await apiFetch('/api/account/cancel-subscription', { method: 'POST' }, authToken);
      addToast('Assinatura cancelada.', 'success');
      load();
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setCanceling(false);
    }
  };

  if (!authToken) return (
    <PageWrap>
      <div style={{ textAlign:'center', paddingTop:40 }}>
        <p style={{ color:'var(--p4)', marginBottom:16 }}>Faça login para ver sua conta.</p>
        <button className="btn btn-cobalt" onClick={() => openModal('login')}>Entrar</button>
      </div>
    </PageWrap>
  );

  if (loading) return <PageWrap><p style={{ color:'var(--p4)', padding:40, textAlign:'center' }}>Carregando…</p></PageWrap>;
  if (!data)   return <PageWrap><p style={{ color:'var(--cr3)', padding:40, textAlign:'center' }}>Erro ao carregar conta.</p></PageWrap>;

  const { user, usage, org, payments } = data;
  const planColor = PLAN_COLOR[user.plan] || 'var(--p4)';
  const planLabel = PLAN_LABEL[user.plan] || user.plan;
  const isPaid    = user.plan !== 'free';

  return (
    <PageWrap>
      <h1 className="t-display" style={{ fontSize:'1.8rem', fontWeight:700, marginBottom:6 }}>Minha Conta</h1>
      <p style={{ color:'var(--p4)', fontSize:'.84rem', marginBottom:32 }}>{user.email}</p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:24 }}>

        {/* Plano atual */}
        <div style={cardSt}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ color:planColor }}>{PLAN_ICON[user.plan] || <User size={18}/>}</div>
            <span style={{ fontSize:'.72rem', color:'var(--p4)', fontFamily:'var(--f-mono)', letterSpacing:'.1em' }}>PLANO ATUAL</span>
          </div>
          <div style={{ fontSize:'1.5rem', fontWeight:700, color:planColor, marginBottom:4 }}>{planLabel}</div>
          {user.plan_expires_at && (
            <div style={{ fontSize:'.78rem', color:'var(--p4)', marginBottom:4 }}>
              Válido até <strong style={{ color:'var(--p2)' }}>{user.plan_expires_at}</strong>
              {user.days_left != null && (
                <span style={{ color: user.days_left < 5 ? 'var(--cr3)' : 'var(--p5)', marginLeft:6 }}>
                  ({user.days_left}d restantes)
                </span>
              )}
            </div>
          )}
          <div style={{ fontSize:'.78rem', color:'var(--p4)', marginBottom:16 }}>
            Membro desde {user.member_since}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <a href="#/premium" className="btn btn-cobalt btn-sm">
              {isPaid ? 'Mudar plano' : 'Fazer upgrade'}
            </a>
            {isPaid && user.plan !== 'credito' && (
              <button className="btn btn-ghost btn-sm" onClick={handleCancel} disabled={canceling}
                style={{ color:'var(--cr3)' }}>
                {canceling ? '…' : 'Cancelar assinatura'}
              </button>
            )}
          </div>
        </div>

        {/* Créditos */}
        <div style={cardSt}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <BarChart2 size={18} style={{ color:'var(--co7)' }}/>
            <span style={{ fontSize:'.72rem', color:'var(--p4)', fontFamily:'var(--f-mono)', letterSpacing:'.1em' }}>USO & CRÉDITOS</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { label:'Análises totais',   value: usage.total_analyses },
              { label:'Análises premium',  value: usage.premium_analyses },
              { label:'Análises hoje',     value: user.plan === 'free' ? `${usage.today} / ${usage.free_limit}` : usage.today },
              { label:'Créditos livres',   value: user.credits },
              { label:'Créditos premium',  value: user.premium_credits },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:'.82rem' }}>
                <span style={{ color:'var(--p4)' }}>{label}</span>
                <span style={{ color:'var(--p2)', fontWeight:600, fontFamily:'var(--f-mono)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Barra free */}
          {user.plan === 'free' && (
            <div style={{ marginTop:14 }}>
              <div style={{ height:6, background:'var(--b-neutral)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:4, background:'var(--co7)',
                  width:`${Math.min((usage.today / usage.free_limit) * 100, 100)}%`,
                  transition:'width .3s' }}/>
              </div>
              <p style={{ fontSize:'.7rem', color:'var(--p5)', marginTop:4 }}>
                {usage.today >= usage.free_limit
                  ? '⚠ Limite diário atingido — faça upgrade'
                  : `${usage.free_limit - usage.today} análises restantes hoje`}
              </p>
            </div>
          )}

          {/* Barra mensal — Escritório e API */}
          {usage.monthly && usage.monthly.limit && (
            <div style={{ marginTop:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', color:'var(--p4)', marginBottom:5 }}>
                <span style={{ fontFamily:'var(--f-mono)', letterSpacing:'.06em' }}>
                  {usage.monthly.plan === 'escritorio' ? 'ANÁLISES / MÊS' : 'REQUISIÇÕES / MÊS'}
                </span>
                <span style={{ color:'var(--p2)', fontWeight:600 }}>
                  {usage.monthly.count} / {usage.monthly.limit}
                </span>
              </div>
              <div style={{ height:6, background:'var(--b-neutral)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', borderRadius:4,
                  background: usage.monthly.count / usage.monthly.limit > 0.85 ? 'var(--cr3)' : 'var(--co7)',
                  width:`${Math.min((usage.monthly.count / usage.monthly.limit) * 100, 100)}%`,
                  transition:'width .3s' }}/>
              </div>
              <p style={{ fontSize:'.7rem', color:'var(--p5)', marginTop:4 }}>
                {usage.monthly.count >= usage.monthly.limit
                  ? '⚠ Limite mensal atingido — renova em ' + usage.monthly.month
                  : `${usage.monthly.limit - usage.monthly.count} restantes em ${usage.monthly.month}`}
              </p>
            </div>
          )}
        </div>

        {/* Org */}
        {org && (
          <div style={cardSt}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <Building2 size={18} style={{ color:'var(--co7)' }}/>
              <span style={{ fontSize:'.72rem', color:'var(--p4)', fontFamily:'var(--f-mono)', letterSpacing:'.1em' }}>ORGANIZAÇÃO</span>
            </div>
            <div style={{ fontSize:'1rem', fontWeight:700, color:'var(--p1)', marginBottom:4 }}>{org.name}</div>
            <div style={{ fontSize:'.78rem', color:'var(--p4)', marginBottom:16 }}>
              Papel: <strong style={{ color:'var(--co7)' }}>{org.role === 'owner' ? 'Proprietário' : org.role === 'admin' ? 'Admin' : 'Membro'}</strong>
              {org.has_logo && <span style={{ marginLeft:8, color:'var(--jade2)' }}>· Logo configurado</span>}
            </div>
            <a href="#/escritorio" className="btn btn-cobalt btn-sm">Acessar Escritório</a>
          </div>
        )}
      </div>

      {/* Histórico de pagamentos */}
      {payments.length > 0 && (
        <div style={cardSt}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <CreditCard size={18} style={{ color:'var(--au6)' }}/>
            <span style={{ fontSize:'.72rem', color:'var(--p4)', fontFamily:'var(--f-mono)', letterSpacing:'.1em' }}>PAGAMENTOS RECENTES</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {payments.map(p => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                fontSize:'.82rem', padding:'8px 0', borderBottom:'1px solid var(--b-subtle)' }}>
                <div>
                  <span style={{ color:'var(--p2)', fontWeight:500 }}>{PLAN_LABEL[p.plan] || p.plan}</span>
                  <span style={{ color:'var(--p5)', marginLeft:8, fontSize:'.72rem' }}>{p.created_at}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ color:'var(--jade2)', fontFamily:'var(--f-mono)', fontWeight:600 }}>
                    R$ {p.amount_brl.toFixed(2)}
                  </span>
                  <span style={{ fontSize:'.7rem', padding:'2px 8px', borderRadius:99,
                    background: p.status === 'succeeded' ? 'rgba(0,200,130,.1)' : 'rgba(200,0,0,.1)',
                    color: p.status === 'succeeded' ? 'var(--jade2)' : 'var(--cr3)' }}>
                    {p.status === 'succeeded' ? 'pago' : p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aviso plano gratuito */}
      {user.plan === 'free' && (
        <div style={{ ...cardSt, marginTop:16, border:'1px solid var(--b-gold)',
          background:'rgba(180,140,60,.05)', display:'flex', gap:12, alignItems:'flex-start' }}>
          <AlertTriangle size={18} style={{ color:'var(--au6)', flexShrink:0, marginTop:2 }}/>
          <div>
            <p style={{ fontSize:'.84rem', fontWeight:600, color:'var(--au5)', marginBottom:4 }}>
              Você está no plano gratuito
            </p>
            <p style={{ fontSize:'.78rem', color:'var(--p4)', lineHeight:1.6 }}>
              Limite de {usage.free_limit} análises premium por dia. Faça upgrade para análises ilimitadas e acesso a todas as ferramentas.
            </p>
            <a href="#/premium" className="btn btn-cobalt btn-sm" style={{ marginTop:10, display:'inline-flex' }}>
              Ver planos →
            </a>
          </div>
        </div>
      )}
    </PageWrap>
  );
}

function PageWrap({ children }) {
  return <div style={{ maxWidth:860, margin:'0 auto', padding:'100px 24px 60px' }}>{children}</div>;
}
const cardSt = {
  background:'var(--surface)', border:'1px solid var(--b-neutral)',
  borderRadius:'var(--r-lg)', padding:'20px 22px',
};
