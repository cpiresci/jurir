/**
 * AceitarConvite.jsx — processa token de convite da URL e associa ao org
 */
import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Building2, CheckCircle, XCircle } from 'lucide-react';
import { useStore } from '../store';
import { acceptInvite } from '../lib/api';

export default function AceitarConvitePage() {
  const { authToken, openModal } = useStore();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');

  const [status,  setStatus]  = useState('idle'); // idle | loading | success | error | need_login
  const [message, setMessage] = useState('');
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Token de convite não encontrado na URL.'); return; }
    if (!authToken) { setStatus('need_login'); return; }
    setStatus('loading');
    acceptInvite(token, authToken)
      .then(d => { setStatus('success'); setOrgName(d.org_name || ''); setMessage(d.message || ''); })
      .catch(e => { setStatus('error'); setMessage(e.message || 'Erro ao aceitar convite.'); });
  }, [token, authToken]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <Building2 size={48} style={{ color: 'var(--co7)', marginBottom: 16 }} />
            <p style={{ color: 'var(--p4)' }}>Processando convite…</p>
          </>
        )}

        {status === 'need_login' && (
          <>
            <Building2 size={48} style={{ color: 'var(--co7)', marginBottom: 16 }} />
            <h1 className="t-display" style={{ fontSize: "1.4rem", marginBottom: 8 }}>Convite recebido</h1>
            <p style={{ color: 'var(--p4)', marginBottom: 24 }}>Faça login ou crie uma conta para aceitar o convite.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn btn-cobalt" onClick={() => openModal('login')}>Entrar</button>
              <button className="btn btn-ghost" onClick={() => openModal('register')}>Criar conta</button>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} style={{ color: 'var(--jade2)', marginBottom: 16 }} />
            <h1 className="t-display" style={{ fontSize: 'var(--fs-2xl)', marginBottom: 8 }}>
              Bem-vindo{orgName ? ` a ${orgName}` : ''}!
            </h1>
            <p style={{ color: 'var(--p4)', marginBottom: 24 }}>{message || 'Você agora faz parte da organização.'}</p>
            <Link to="/escritorio" className="btn btn-cobalt">Ir para o Escritório</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} style={{ color: 'var(--cr3)', marginBottom: 16 }} />
            <h1 className="t-display" style={{ fontSize: "1.4rem", marginBottom: 8 }}>Convite inválido</h1>
            <p style={{ color: 'var(--p4)', marginBottom: 24 }}>{message}</p>
            <Link to="/" className="btn btn-ghost">Voltar ao início</Link>
          </>
        )}
      </div>
    </div>
  );
}
