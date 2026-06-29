import { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, Zap, Building2, Code2, CreditCard } from 'lucide-react';
import { useStore } from '../store';
import { getMe } from '../lib/api';

const PLAN_INFO = {
  credito:    { icon: <CreditCard size={32}/>, color: 'var(--au6)',  label: 'Crédito Avulso',  msg: 'Seu crédito foi adicionado. Clique abaixo para continuar com a análise dos 16 agentes.' },
  solo:       { icon: <Zap size={32}/>,        color: 'var(--cr3)',  label: 'Plano Solo',       msg: 'Assinatura ativa! Análises ilimitadas liberadas.' },
  escritorio: { icon: <Building2 size={32}/>,  color: 'var(--co7)', label: 'Plano Escritório', msg: 'Seu espaço de equipe está pronto. Configure sua organização agora.' },
  api:        { icon: <Code2 size={32}/>,      color: 'var(--jade2)', label: 'Plano API',      msg: 'API ativa! Crie sua primeira API Key no Painel API.' },
};

export default function CheckoutSuccessPage() {
  const { authToken, refreshUser, addToast } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');

  const [status,   setStatus]   = useState('loading'); // loading | ok | error
  const [planKey,  setPlanKey]  = useState(null);

  const [hasPending, setHasPending] = useState(false);

  useEffect(() => {
    // Verifica análise pendente antes de qualquer coisa
    const pending = sessionStorage.getItem('jurir_pending_analysis');
    if (pending) setHasPending(true);

    if (!authToken) { setStatus('ok'); return; }
    // Refaz o /me para pegar o plano atualizado no store
    getMe(authToken)
      .then(user => {
        refreshUser(user);
        // Detecta plano pelo user atualizado
        const p = user.plan;
        setPlanKey(p === 'api' ? 'api' : p === 'escritorio' ? 'escritorio' : p === 'mensal' ? 'solo' : user.premium_credits > 0 ? 'credito' : null);
        setStatus('ok');
      })
      .catch(() => setStatus('ok'));
  }, [authToken]);

  const handleContinueAnalysis = () => {
    // Não apaga sessionStorage aqui — AnalysisPanel vai limpar e disparar
    navigate('/#analise');
    // Força scroll para a seção após navegação
    setTimeout(() => {
      const el = document.getElementById('analise');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  };

  const info = PLAN_INFO[planKey] || PLAN_INFO.credito;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        {status === 'loading' ? (
          <>
            <Loader2 size={40} style={{ color: 'var(--co7)', marginBottom: 16, animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--p4)' }}>Confirmando pagamento…</p>
          </>
        ) : (
          <>
            {/* Ícone animado */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: `radial-gradient(circle, ${info.color}22, transparent)`,
              border: `2px solid ${info.color}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', color: info.color,
            }}>
              <CheckCircle size={40} style={{ color: info.color }} />
            </div>

            <h1 className="t-display" style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>
              Pagamento confirmado!
            </h1>
            <p style={{ color: info.color, fontWeight: 600, marginBottom: 8 }}>{info.label}</p>
            <p style={{ color: 'var(--p4)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 32 }}>
              {info.msg}
            </p>

            {/* CTAs por plano */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {planKey === 'escritorio' && (
                <Link to="/escritorio" className="btn btn-cobalt">Ir para o Escritório</Link>
              )}
              {planKey === 'api' && (
                <Link to="/api-panel" className="btn btn-cobalt">Abrir Painel API</Link>
              )}
              {(planKey === 'solo' || planKey === 'credito' || !planKey) && (
                hasPending ? (
                  <button className="btn btn-cobalt-ultra" onClick={handleContinueAnalysis}
                    style={{ justifyContent: 'center' }}>
                    ⚡ Continuar Análise Premium
                  </button>
                ) : (
                  <Link to="/#analise" className="btn btn-cobalt">Fazer uma análise</Link>
                )
              )}
              <Link to="/" className="btn btn-ghost">Voltar ao início</Link>
            </div>

            {sessionId && (
              <p style={{ fontSize: '.7rem', color: 'var(--p5)', marginTop: 24, fontFamily: 'var(--f-mono)' }}>
                ID da sessão: {sessionId.slice(0, 24)}…
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
