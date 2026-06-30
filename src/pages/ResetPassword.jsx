import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, KeyRound, CheckCircle } from 'lucide-react';
import { resetPassword } from '../lib/api';

export default function ResetPasswordPage() {
  const navigate   = useNavigate();
  const [token,    setToken]    = useState('');
  const [pwd,      setPwd]      = useState('');
  const [pwd2,     setPwd2]     = useState('');
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState('');
  const [success,  setSuccess]  = useState(false);

  useEffect(() => {
    const hash = window.location.hash || '';
    const params = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : window.location.search);
    const t = params.get('token');
    if (!t) setErr('Link inválido ou expirado.');
    else setToken(t);
  }, []);

  const handle = async () => {
    if (!pwd || pwd.length < 6) { setErr('Senha mínima de 6 caracteres.'); return; }
    if (pwd !== pwd2) { setErr('As senhas não coincidem.'); return; }
    setLoading(true); setErr('');
    try {
      await resetPassword(token, pwd);
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (e) {
      setErr(e.message || 'Link inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--surface)', border: '1px solid var(--b-neutral)',
        borderRadius: 'var(--r-xl)', padding: 32 }}>

        <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--t5)',
          letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 8 }}>
          JURIR · ACESSO
        </div>
        <h2 className="t-display" style={{ fontSize: '1.7rem', fontWeight: 400, color: 'var(--t0)', marginBottom: 24 }}>
          Nova senha
        </h2>

        {success ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
            <CheckCircle size={40} style={{ color: 'var(--jade2)' }}/>
            <p style={{ color: 'var(--t2)', textAlign: 'center' }}>Senha redefinida com sucesso!</p>
            <p style={{ color: 'var(--t4)', fontSize: '.82rem' }}>Redirecionando…</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--t4)',
                letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 7, display: 'block' }}>
                Nova senha
              </label>
              <input type="password" className="modal-input" placeholder="••••••••"
                value={pwd} onChange={e => setPwd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handle()}/>
            </div>
            <div>
              <label style={{ fontFamily: 'var(--f-mono)', fontSize: '.75rem', color: 'var(--t4)',
                letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 7, display: 'block' }}>
                Confirmar senha
              </label>
              <input type="password" className="modal-input" placeholder="••••••••"
                value={pwd2} onChange={e => setPwd2(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handle()}/>
            </div>

            {err && (
              <p style={{ color: 'var(--cr3)', fontSize: '.8rem', padding: '9px 12px',
                background: 'rgba(192,24,24,0.05)', border: '1px solid rgba(192,24,24,0.2)',
                borderRadius: 'var(--r-sm)' }}>
                {err}
              </p>
            )}

            <button className="btn btn-cobalt" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              disabled={loading || !token} onClick={handle}>
              {loading
                ? <><Loader2 size={15} className="spin"/> Aguarde…</>
                : <><KeyRound size={15}/> Redefinir senha</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
