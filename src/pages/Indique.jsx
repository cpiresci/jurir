import { useState, useEffect } from 'react';
import { Gift, Copy, Check, MessageCircle, Linkedin, Loader2, Users } from 'lucide-react';
import { useStore } from '../store';
import { getReferralInfo } from '../lib/api';

// [bloco10-referral] "Indique e ganhe" — cada usuário tem um referral_code
// próprio (gerado no cadastro). Quem indica e quem é indicado ganham 1
// crédito premium quando o indicado faz a primeira compra (ver billing.js).
export default function IndiquePage() {
  const { authToken, openModal } = useStore();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authToken) { setLoading(false); return; }
    getReferralInfo(authToken).then(setInfo).catch(() => {}).finally(() => setLoading(false));
  }, [authToken]);

  if (!authToken) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '100px 24px 60px', textAlign: 'center' }}>
        <Gift size={40} style={{ color: 'var(--cy1)', marginBottom: 16 }} />
        <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, marginBottom: 12 }}>
          Indique e ganhe
        </h1>
        <p style={{ color: 'var(--p4)', marginBottom: 24 }}>
          Crie uma conta pra pegar seu link de indicação e começar a ganhar créditos.
        </p>
        <button className="btn btn-cobalt" onClick={() => openModal('register')}>Criar conta grátis</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '160px 24px' }}>
        <Loader2 size={28} className="spin" style={{ color: 'var(--cy1)' }} />
      </div>
    );
  }

  const link = info?.referral_link || '';
  const waText = encodeURIComponent(`Tô usando a Jurir pra analisar processos e petições com IA — se cadastra pelo meu link que a gente ganha crédito: ${link}`);

  const copyLink = () => {
    navigator.clipboard?.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ridge)', border: '1px solid var(--b-cobalt)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: 'var(--fs-xs)', color: 'var(--cy1)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <Gift size={11} /> INDIQUE E GANHE
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, marginBottom: 8 }}>
          Cada indicação vale 1 crédito
        </h1>
        <p style={{ color: 'var(--p4)', fontSize: 'var(--fs-base)' }}>
          Compartilhe seu link. Quando quem se cadastrar fizer a primeira compra, você e ela ganham 1 crédito premium cada.
        </p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 28, marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 10 }}>SEU LINK DE INDICAÇÃO</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input className="fg-input" value={link} readOnly
            style={{ fontFamily: 'var(--f-mono)', fontSize: 'var(--fs-sm)' }} />
          <button className="btn btn-cobalt" onClick={copyLink} style={{ flexShrink: 0 }}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <MessageCircle size={14} /> WhatsApp
          </a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Linkedin size={14} /> LinkedIn
          </a>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--fs-3xl)', fontWeight: 700, color: 'var(--jade2)', marginBottom: 4 }}>{info?.convertidos ?? 0}</div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)' }}>CONVERTIDAS</div>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 'var(--fs-3xl)', fontWeight: 700, color: 'var(--au6)', marginBottom: 4 }}>
            <Users size={22} /> {info?.pendentes ?? 0}
          </div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)' }}>AGUARDANDO 1ª COMPRA</div>
        </div>
      </div>
    </div>
  );
}
