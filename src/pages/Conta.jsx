import { useEffect, useState, useRef } from 'react';
import { User, CreditCard, BarChart2, Building2, Zap, Code2, AlertTriangle, RefreshCw, ShieldCheck, Upload, Clock, XCircle, MailWarning, Smartphone, Copy, Check } from 'lucide-react';
import { useStore } from '../store';
import { apiFetch, submitOabVerification, resendVerification, setup2FA, verify2FA, disable2FA } from '../lib/api';

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
      <h1 className="t-display" style={{ fontSize:'clamp(1.75rem,4vw,2.25rem)', fontWeight:700, marginBottom:6 }}>Minha Conta</h1>
      <p style={{ color:'var(--p4)', fontSize: 'var(--fs-sm)', marginBottom:32 }}>{user.email}</p>

      {/* [bloco6-auth] Banner de email não verificado — bloqueia geração de
          peças e monitoramento até confirmar (ver requireEmailVerified no backend). */}
      {!user.email_verified && <EmailVerifyBanner authToken={authToken} addToast={addToast} />}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:24 }}>

        {/* Plano atual */}
        <div style={cardSt}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <div style={{ color:planColor }}>{PLAN_ICON[user.plan] || <User size={18}/>}</div>
            <span style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', fontFamily:'var(--f-mono)', letterSpacing:'.1em' }}>PLANO ATUAL</span>
          </div>
          <div style={{ fontSize: 'var(--fs-2xl)', fontWeight:700, color:planColor, marginBottom:4 }}>{planLabel}</div>
          {user.plan_expires_at && (
            <div style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', marginBottom:4 }}>
              Válido até <strong style={{ color:'var(--p2)' }}>{user.plan_expires_at}</strong>
              {user.days_left != null && (
                <span style={{ color: user.days_left < 5 ? 'var(--cr3)' : 'var(--p5)', marginLeft:6 }}>
                  ({user.days_left}d restantes)
                </span>
              )}
            </div>
          )}
          <div style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', marginBottom:16 }}>
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
            <span style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', fontFamily:'var(--f-mono)', letterSpacing:'.1em' }}>USO & CRÉDITOS</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { label:'Análises totais',   value: usage.total_analyses },
              { label:'Análises premium',  value: usage.premium_analyses },
              { label:'Análises hoje',     value: user.plan === 'free' ? `${usage.today} / ${usage.free_limit}` : usage.today },
              { label:'Créditos livres',   value: user.credits },
              { label:'Créditos premium',  value: user.premium_credits },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize: 'var(--fs-sm)' }}>
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
              <p style={{ fontSize: 'var(--fs-2xs)', color:'var(--p5)', marginTop:4 }}>
                {usage.today >= usage.free_limit
                  ? '⚠ Limite diário atingido — faça upgrade'
                  : `${usage.free_limit - usage.today} análises restantes hoje`}
              </p>
            </div>
          )}

          {/* Barra mensal — Escritório e API */}
          {usage.monthly && usage.monthly.limit && (
            <div style={{ marginTop:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize: 'var(--fs-xs)', color:'var(--p4)', marginBottom:5 }}>
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
              <p style={{ fontSize: 'var(--fs-2xs)', color:'var(--p5)', marginTop:4 }}>
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
              <span style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', fontFamily:'var(--f-mono)', letterSpacing:'.1em' }}>ORGANIZAÇÃO</span>
            </div>
            <div style={{ fontSize: 'var(--fs-md)', fontWeight:700, color:'var(--p1)', marginBottom:4 }}>{org.name}</div>
            <div style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', marginBottom:16 }}>
              Papel: <strong style={{ color:'var(--co7)' }}>{org.role === 'owner' ? 'Proprietário' : org.role === 'admin' ? 'Admin' : 'Membro'}</strong>
              {org.has_logo && <span style={{ marginLeft:8, color:'var(--jade2)' }}>· Logo configurado</span>}
            </div>
            <a href="#/escritorio" className="btn btn-cobalt btn-sm">Acessar Escritório</a>
          </div>
        )}
        {/* [bloco5-oab] Verificação de OAB */}
        <OabCard oab={user.oab} authToken={authToken} addToast={addToast} onUpdated={load} />
        {/* [bloco6-auth] Autenticação em duas etapas */}
        <TwoFactorCard enabled={user.two_factor_enabled} authToken={authToken} addToast={addToast} onUpdated={load} />
      </div>

      {/* Histórico de pagamentos */}
      {payments.length > 0 && (
        <div style={cardSt}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <CreditCard size={18} style={{ color:'var(--au6)' }}/>
            <span style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', fontFamily:'var(--f-mono)', letterSpacing:'.1em' }}>PAGAMENTOS RECENTES</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {payments.map(p => (
              <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                fontSize: 'var(--fs-sm)', padding:'8px 0', borderBottom:'1px solid var(--b-subtle)' }}>
                <div>
                  <span style={{ color:'var(--p2)', fontWeight:500 }}>{PLAN_LABEL[p.plan] || p.plan}</span>
                  <span style={{ color:'var(--p5)', marginLeft:8, fontSize: 'var(--fs-xs)' }}>{p.created_at}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ color:'var(--jade2)', fontFamily:'var(--f-mono)', fontWeight:600 }}>
                    R$ {p.amount_brl.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 'var(--fs-2xs)', padding:'2px 8px', borderRadius:99,
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
            <p style={{ fontSize: 'var(--fs-sm)', fontWeight:600, color:'var(--au5)', marginBottom:4 }}>
              Você está no plano gratuito
            </p>
            <p style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', lineHeight:1.6 }}>
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

// ── [bloco5-oab] Card de verificação de OAB ─────────────────────────────
// Estados: not_submitted (form) / pending (aguardando admin) /
// rejected (motivo + reenviar) / verified (badge).
const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

function OabCard({ oab, authToken, addToast, onUpdated }) {
  const fileRef = useRef(null);
  const [number, setNumber] = useState(oab?.number || '');
  const [uf,     setUf]     = useState(oab?.uf || '');
  const [file,   setFile]   = useState(null);
  const [sending, setSending] = useState(false);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { addToast('Documento deve ter no máximo 5 MB.', 'error'); return; }
    setFile(f);
  };

  const handleSubmit = async () => {
    if (!number.trim() || !uf) { addToast('Preencha número e UF da OAB.', 'error'); return; }
    if (!file) { addToast('Anexe uma foto ou PDF da carteira da OAB.', 'error'); return; }
    setSending(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const [header, b64] = dataUrl.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'application/pdf';
      await submitOabVerification(number.trim(), uf, b64, mime, authToken);
      addToast('OAB enviada para verificação!', 'success');
      setFile(null);
      onUpdated();
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const status = oab?.status || 'not_submitted';

  return (
    <div style={cardSt}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <ShieldCheck size={18} style={{ color: status === 'verified' ? 'var(--jade2)' : 'var(--co7)' }}/>
        <span style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', fontFamily:'var(--f-mono)', letterSpacing:'.1em' }}>VERIFICAÇÃO OAB</span>
      </div>

      {status === 'verified' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ fontSize: 'var(--fs-md)', fontWeight:700, color:'var(--jade2)' }}>Advogado Verificado ✓</span>
          </div>
          <p style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)' }}>
            OAB {oab.number}/{oab.uf} — verificada em {oab.verified_at}.
          </p>
        </div>
      )}

      {status === 'pending' && (
        <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
          <Clock size={16} style={{ color:'var(--au6)', flexShrink:0, marginTop:2 }}/>
          <div>
            <p style={{ fontSize: 'var(--fs-sm)', fontWeight:600, color:'var(--au5)', marginBottom:2 }}>Em análise</p>
            <p style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)' }}>
              OAB {oab.number}/{oab.uf} enviada. Nossa equipe confere manualmente — normalmente em até 2 dias úteis.
            </p>
          </div>
        </div>
      )}

      {(status === 'not_submitted' || status === 'rejected') && (
        <div>
          {status === 'rejected' && (
            <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:14 }}>
              <XCircle size={16} style={{ color:'var(--cr3)', flexShrink:0, marginTop:2 }}/>
              <div>
                <p style={{ fontSize: 'var(--fs-sm)', fontWeight:600, color:'var(--cr3)', marginBottom:2 }}>Não aprovada</p>
                <p style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)' }}>{oab.rejection_reason}</p>
              </div>
            </div>
          )}
          <p style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', marginBottom:12, lineHeight:1.6 }}>
            Envie seu número de inscrição e uma foto/PDF da carteira da OAB pra ganhar o selo de confiança no perfil e nas peças geradas.
          </p>
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <input value={number} onChange={e => setNumber(e.target.value)} placeholder="Nº OAB"
              style={{ flex:1, padding:'8px 10px', borderRadius:'var(--r-sm)', border:'1px solid var(--b-neutral)', background:'var(--surface)', color:'var(--p1)', fontSize:'var(--fs-sm)' }}/>
            <select value={uf} onChange={e => setUf(e.target.value)}
              style={{ width:70, padding:'8px 10px', borderRadius:'var(--r-sm)', border:'1px solid var(--b-neutral)', background:'var(--surface)', color:'var(--p1)', fontSize:'var(--fs-sm)' }}>
              <option value="">UF</option>
              {UFS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp"
            style={{ display:'none' }} onChange={handleFile}/>
          <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}
            style={{ marginBottom:12, display:'inline-flex', alignItems:'center', gap:6 }}>
            <Upload size={14}/> {file ? file.name : 'Anexar carteira OAB'}
          </button>
          <div>
            <button className="btn btn-cobalt btn-sm" onClick={handleSubmit} disabled={sending}>
              {sending ? 'Enviando…' : (status === 'rejected' ? 'Reenviar' : 'Enviar para verificação')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── [bloco6-auth] Banner de email não verificado ────────────────────────
function EmailVerifyBanner({ authToken, addToast }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerification(authToken);
      setSent(true);
      addToast('Email de confirmação reenviado!', 'success');
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ ...cardSt, marginBottom:16, border:'1px solid var(--b-gold)',
      background:'rgba(180,140,60,.05)', display:'flex', gap:12, alignItems:'flex-start' }}>
      <MailWarning size={18} style={{ color:'var(--au6)', flexShrink:0, marginTop:2 }}/>
      <div style={{ flex:1 }}>
        <p style={{ fontSize: 'var(--fs-sm)', fontWeight:600, color:'var(--au5)', marginBottom:4 }}>
          Confirme seu email
        </p>
        <p style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', lineHeight:1.6, marginBottom:10 }}>
          Geração de peças e monitoramento de processos ficam bloqueados até você confirmar seu email.
        </p>
        <button className="btn btn-ghost btn-sm" onClick={handleResend} disabled={sending || sent}>
          {sent ? 'Email reenviado ✓' : sending ? 'Enviando…' : 'Reenviar email de confirmação'}
        </button>
      </div>
    </div>
  );
}

// ── [bloco6-auth] Card de autenticação em duas etapas (TOTP) ────────────
// Estados: off (botão pra ativar) / setup (mostra QR + campo de código) /
// backup (mostra os 8 códigos gerados, uma única vez) / on (badge ativo).
function TwoFactorCard({ enabled, authToken, addToast, onUpdated }) {
  const [step, setStep] = useState(enabled ? 'on' : 'off');
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleStartSetup = async () => {
    setBusy(true);
    try {
      const data = await setup2FA(authToken);
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setStep('setup');
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirm = async () => {
    if (!code.trim()) { addToast('Digite o código do app autenticador.', 'error'); return; }
    setBusy(true);
    try {
      const data = await verify2FA(code.trim(), authToken);
      setBackupCodes(data.backup_codes);
      setStep('backup');
      onUpdated();
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    if (!password) { addToast('Digite sua senha atual pra desativar.', 'error'); return; }
    if (!confirm('Desativar a autenticação em duas etapas?')) return;
    setBusy(true);
    try {
      await disable2FA(password, authToken);
      addToast('2FA desativado.', 'success');
      setStep('off'); setPassword(''); setQrCode(null); setSecret(null); setBackupCodes(null);
      onUpdated();
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard?.writeText(backupCodes.join('\n')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={cardSt}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <Smartphone size={18} style={{ color: step === 'on' ? 'var(--jade2)' : 'var(--co7)' }}/>
        <span style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', fontFamily:'var(--f-mono)', letterSpacing:'.1em' }}>AUTENTICAÇÃO EM 2 ETAPAS</span>
      </div>

      {step === 'off' && (
        <div>
          <p style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', marginBottom:12, lineHeight:1.6 }}>
            Adicione uma camada extra de segurança com um app autenticador (Google Authenticator, Authy, etc).
          </p>
          <button className="btn btn-cobalt btn-sm" onClick={handleStartSetup} disabled={busy}>
            {busy ? 'Gerando…' : 'Ativar 2FA'}
          </button>
        </div>
      )}

      {step === 'setup' && (
        <div>
          <p style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', marginBottom:10, lineHeight:1.6 }}>
            Escaneie o QR code no seu app autenticador e digite o código gerado.
          </p>
          {qrCode && (
            <img src={qrCode} alt="QR code 2FA" style={{ width:160, height:160, borderRadius:8, marginBottom:10, background:'#fff', padding:8 }}/>
          )}
          <p style={{ fontSize: 'var(--fs-2xs)', color:'var(--p5)', fontFamily:'var(--f-mono)', marginBottom:12, wordBreak:'break-all' }}>
            Não consegue escanear? Digite manualmente: <strong style={{ color:'var(--p3)' }}>{secret}</strong>
          </p>
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="Código de 6 dígitos"
              style={{ flex:1, padding:'8px 10px', borderRadius:'var(--r-sm)', border:'1px solid var(--b-neutral)', background:'var(--surface)', color:'var(--p1)', fontSize:'var(--fs-sm)' }}/>
          </div>
          <button className="btn btn-cobalt btn-sm" onClick={handleConfirm} disabled={busy}>
            {busy ? 'Confirmando…' : 'Confirmar e ativar'}
          </button>
        </div>
      )}

      {step === 'backup' && backupCodes && (
        <div>
          <p style={{ fontSize: 'var(--fs-sm)', fontWeight:600, color:'var(--jade2)', marginBottom:6 }}>2FA ativado ✓</p>
          <p style={{ fontSize: 'var(--fs-xs)', color:'var(--p4)', marginBottom:10, lineHeight:1.6 }}>
            Guarde estes 8 códigos de backup em local seguro — cada um funciona uma única vez se você perder o autenticador. Eles não serão mostrados de novo.
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:6, padding:12,
            background:'var(--b-subtle)', borderRadius:'var(--r-sm)', marginBottom:10, fontFamily:'var(--f-mono)', fontSize:'var(--fs-sm)' }}>
            {backupCodes.map(c => <span key={c} style={{ color:'var(--p2)' }}>{c}</span>)}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={copyBackupCodes} style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:10 }}>
            {copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copiado!' : 'Copiar códigos'}
          </button>
          <div>
            <button className="btn btn-cobalt btn-sm" onClick={() => setStep('on')}>Concluir</button>
          </div>
        </div>
      )}

      {step === 'on' && (
        <div>
          <p style={{ fontSize: 'var(--fs-md)', fontWeight:700, color:'var(--jade2)', marginBottom:12 }}>Ativado ✓</p>
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha atual"
              style={{ flex:1, padding:'8px 10px', borderRadius:'var(--r-sm)', border:'1px solid var(--b-neutral)', background:'var(--surface)', color:'var(--p1)', fontSize:'var(--fs-sm)' }}/>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleDisable} disabled={busy} style={{ color:'var(--cr3)' }}>
            {busy ? '…' : 'Desativar 2FA'}
          </button>
        </div>
      )}
    </div>
  );
}

function PageWrap({ children }) {
  return <div style={{ maxWidth:'100%', margin:'0 auto', padding:'100px 24px 60px' }}>{children}</div>;
}
const cardSt = {
  background:'var(--surface)', border:'1px solid var(--b-neutral)',
  borderRadius:'var(--r-lg)', padding:'20px 22px',
};
