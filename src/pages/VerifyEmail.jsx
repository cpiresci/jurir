import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MailCheck, XCircle } from 'lucide-react';
import { verifyEmail, getMe } from '../lib/api';
import { useStore } from '../store';

// [bloco6-auth] Página pública de confirmação de email — chega aqui pelo
// link enviado no cadastro ou reenviado em Minha Conta. Segue o mesmo
// layout de ResetPassword.jsx.
export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { refreshUser, authToken } = useStore();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [err, setErr] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const hash = window.location.hash || '';
    const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setErr('Link inválido ou expirado.');
      return;
    }

    verifyEmail(token)
      .then(async () => {
        setStatus('success');
        if (authToken) {
          try { const user = await getMe(authToken); refreshUser(user); } catch { /* ignora */ }
        }
        setTimeout(() => navigate('/conta'), 3000);
      })
      .catch((e) => {
        setStatus('error');
        setErr(e.message || 'Link inválido ou expirado.');
      });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--surface)', border: '1px solid var(--b-neutral)',
        borderRadius: 'var(--r-xl)', padding: 32, textAlign: 'center' }}>

        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-xs)', color: 'var(--t3)',
          letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 8 }}>
          JURIR · ACESSO
        </div>
        <h2 className="t-display" style={{ fontSize: 'var(--fs-3xl)', fontWeight: 400, color: 'var(--t0)', marginBottom: 24 }}>
          Verificação de email
        </h2>

        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '24px 0' }}>
            <Loader2 size={32} className="spin" style={{ color: 'var(--cy1)' }} />
            <p style={{ color: 'var(--t2)' }}>Confirmando seu email…</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
            <MailCheck size={40} style={{ color: 'var(--jade2)' }} />
            <p style={{ color: 'var(--t2)', textAlign: 'center' }}>Email confirmado com sucesso!</p>
            <p style={{ color: 'var(--t4)', fontSize: 'var(--fs-sm)' }}>Redirecionando…</p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
            <XCircle size={40} style={{ color: 'var(--cr3)' }} />
            <p style={{ color: 'var(--t2)', textAlign: 'center' }}>{err}</p>
            <button className="btn btn-cobalt" onClick={() => navigate('/conta')}>
              Ir para Minha Conta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
