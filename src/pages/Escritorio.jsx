/**
 * Escritorio.jsx — Dashboard multi-usuário + gestão de org (Plano Escritório)
 * Tabs: Dashboard | Membros | Logo PDF
 */
import { useEffect, useState, useRef } from 'react';
import { Users, LayoutDashboard, Image, Download, Trash2, UserPlus, Building2 } from 'lucide-react';
import { useStore } from '../store';
import {
  getMyOrg, createOrg, getOrgDashboard, getOrgMembers,
  inviteMember, removeMember, uploadOrgLogo, removeOrgLogo,
  downloadPdf, downloadZip,
} from '../lib/api';

const TAB = { DASH: 'dashboard', MEMBERS: 'members', LOGO: 'logo' };

export default function EscritorioPage() {
  const { authToken, userData, addToast } = useStore();
  const [tab,     setTab]     = useState(TAB.DASH);
  const [org,     setOrg]     = useState(null);
  const [role,    setRole]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [orgName,  setOrgName]  = useState('');

  const isEscritorio = userData?.is_escritorio;

  useEffect(() => {
    if (!authToken || !isEscritorio) { setLoading(false); return; }
    getMyOrg(authToken)
      .then(d => { setOrg(d.org); setRole(d.role); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authToken, isEscritorio]);

  if (!authToken) return <Unauthenticated />;
  if (!isEscritorio) return <NeedPlan />;
  if (loading) return <Loading />;

  if (!org) {
    return (
      <PageWrap>
        <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <Building2 size={48} style={{ color: 'var(--co7)', marginBottom: 16 }} />
          <h2 className="t-display" style={{ fontSize: '1.5rem', marginBottom: 8 }}>Crie sua Organização</h2>
          <p style={{ color: 'var(--p4)', marginBottom: 24 }}>
            Configure o espaço da sua equipe no Jurir Escritório.
          </p>
          <input
            value={orgName}
            onChange={e => setOrgName(e.target.value)}
            placeholder="Nome do escritório / empresa"
            style={inputSt}
          />
          <button
            className="btn btn-cobalt"
            style={{ marginTop: 12, width: '100%' }}
            disabled={creating || !orgName.trim()}
            onClick={async () => {
              setCreating(true);
              try {
                const d = await createOrg(orgName.trim(), authToken);
                // [fix-org-logo] Antes ignorava has_logo retornado pelo servidor, sempre setava false.
                // Agora usa o valor real — evita flash de "sem logo" quando logo já existe.
                setOrg({ id: d.id, name: d.name, plan: d.plan, has_logo: d.org?.has_logo ?? false });
                setRole('owner');
                addToast('Organização criada!', 'success');
              } catch (e) {
                addToast(e.message, 'error');
              } finally {
                setCreating(false);
              }
            }}
          >
            {creating ? 'Criando…' : 'Criar Organização'}
          </button>
        </div>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <Building2 size={28} style={{ color: 'var(--co7)' }} />
        <div>
          <h1 className="t-display" style={{ fontSize: '1.6rem', fontWeight: 700 }}>{org.name}</h1>
          <p style={{ color: 'var(--p4)', fontSize: '.8rem' }}>Plano Escritório · {role === 'owner' ? 'Proprietário' : role === 'admin' ? 'Admin' : 'Membro'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--b-neutral)', paddingBottom: 4 }}>
        {[
          { key: TAB.DASH,    icon: <LayoutDashboard size={14}/>, label: 'Dashboard' },
          { key: TAB.MEMBERS, icon: <Users size={14}/>,           label: 'Membros'   },
          { key: TAB.LOGO,    icon: <Image size={14}/>,           label: 'Logo PDF'  },
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', border: 'none', borderRadius: 'var(--r-sm)',
            background: tab === key ? 'rgba(0,242,254,0.08)' : 'transparent',
            color: tab === key ? 'var(--co7)' : 'var(--p4)',
            fontWeight: tab === key ? 600 : 400, fontSize: '.82rem',
            cursor: 'pointer', transition: 'all .15s',
          }}>{icon}{label}</button>
        ))}
      </div>

      {tab === TAB.DASH    && <DashboardTab token={authToken} />}
      {tab === TAB.MEMBERS && <MembersTab   token={authToken} org={org} role={role} addToast={addToast} />}
      {tab === TAB.LOGO    && <LogoTab      token={authToken} org={org} setOrg={setOrg} addToast={addToast} role={role} />}
    </PageWrap>
  );
}

// ── Tab: Dashboard ────────────────────────────────────────────────────
function DashboardTab({ token }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    getOrgDashboard(token).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  const toggleSelect = (id) => setSelected(s => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  if (loading) return <Loading />;
  if (!data)   return <Empty text="Erro ao carregar dashboard." />;

  const { analyses, summary } = data;

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total de análises', value: summary.total },
          { label: 'Score médio',       value: summary.avg_score ? `${summary.avg_score}/100` : '—' },
          { label: 'Neste mês',         value: summary.this_month },
          { label: 'Membros',           value: summary.members_count },
        ].map(({ label, value }) => (
          <div key={label} style={cardSt}>
            <div style={{ fontSize: '.72rem', color: 'var(--p4)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--co7)' }}>{value ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* ZIP export toolbar */}
      {selected.size >= 2 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
          background: 'rgba(0,242,254,0.07)', border: '1px solid var(--b-main)',
          borderRadius: 'var(--r-md)', padding: '10px 16px' }}>
          <span style={{ fontSize: '.82rem', color: 'var(--co7)' }}>{selected.size} selecionadas</span>
          <button className="btn btn-cobalt btn-sm" onClick={async () => {
            try { await downloadZip([...selected], token); }
            catch (e) { alert(e.message); }
          }}>
            <Download size={13}/> Exportar ZIP
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>Limpar</button>
        </div>
      )}

      {/* Table */}
      {analyses.length === 0 ? <Empty text="Nenhuma análise encontrada." /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--b-neutral)', color: 'var(--p4)' }}>
                <th style={thSt}></th>
                <th style={thSt}>Membro</th>
                <th style={thSt}>Caso</th>
                <th style={thSt}>Score</th>
                <th style={thSt}>Tribunal</th>
                <th style={thSt}>Data</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--b-subtle)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={tdSt}>
                    <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggleSelect(a.id)} />
                  </td>
                  <td style={{ ...tdSt, color: 'var(--co7)', fontFamily: 'var(--f-mono)', fontSize: '.75rem' }}>
                    {a.user_email.split('@')[0]}
                  </td>
                  <td style={{ ...tdSt, maxWidth: 260 }}>
                    <span title={a.prompt_preview}>{a.prompt_preview.slice(0, 80)}{a.prompt_preview.length > 80 ? '…' : ''}</span>
                  </td>
                  <td style={tdSt}><ScoreBadge score={a.jurir_score} /></td>
                  <td style={{ ...tdSt, fontFamily: 'var(--f-mono)', fontSize: '.75rem' }}>{a.tribunal || '—'}</td>
                  <td style={{ ...tdSt, color: 'var(--p4)', fontSize: '.75rem', whiteSpace: 'nowrap' }}>{a.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Tab: Membros ──────────────────────────────────────────────────────
function MembersTab({ token, org, role, addToast }) {
  const [members, setMembers] = useState([]);
  const [max,     setMax]     = useState(5);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting,    setInviting]    = useState(false);
  const [inviteLink,  setInviteLink]  = useState('');

  const reload = () => {
    setLoading(true);
    getOrgMembers(token)
      .then(d => { setMembers(d.members); setMax(d.max); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(reload, [token]);

  const canManage = role === 'owner' || role === 'admin';

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const d = await inviteMember(inviteEmail.trim(), 'member', token);
      setInviteLink(d.invite_url);
      setInviteEmail('');
      addToast('Convite gerado!', 'success');
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (uid) => {
    if (!confirm('Remover este membro?')) return;
    try {
      await removeMember(uid, token);
      addToast('Membro removido.', 'success');
      reload();
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontSize: '.82rem', color: 'var(--p4)' }}>
          {members.length}/{max} vagas utilizadas
        </p>
        <div style={{ height: 6, flex: 1, maxWidth: 160, background: 'var(--b-neutral)', borderRadius: 4, margin: '0 12px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(members.length / max) * 100}%`, background: 'var(--co7)', borderRadius: 4 }} />
        </div>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {members.map(m => (
          <div key={m.user_id} style={{ ...cardSt, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: '.82rem', color: 'var(--p1)' }}>{m.email}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--p4)', marginTop: 2 }}>
                {m.role === 'owner' ? '👑 Proprietário' : m.role === 'admin' ? '⚡ Admin' : '👤 Membro'} · {m.analyses} análises · desde {m.joined_at}
              </div>
            </div>
            {canManage && m.role !== 'owner' && (
              <button className="btn btn-ghost btn-sm" onClick={() => handleRemove(m.user_id)}
                style={{ color: 'var(--cr3)' }}>
                <Trash2 size={13}/>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Convidar */}
      {canManage && members.length < max && (
        <div style={{ ...cardSt }}>
          <p style={{ fontSize: '.82rem', fontWeight: 600, marginBottom: 10, color: 'var(--p2)' }}>
            <UserPlus size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
            Convidar novo membro
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
              placeholder="email@dominio.com.br" style={{ ...inputSt, flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && handleInvite()} />
            <button className="btn btn-cobalt btn-sm" disabled={inviting || !inviteEmail.trim()} onClick={handleInvite}>
              {inviting ? '…' : 'Convidar'}
            </button>
          </div>
          {inviteLink && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(0,242,254,0.06)',
              borderRadius: 'var(--r-sm)', border: '1px solid var(--b-main)' }}>
              <p style={{ fontSize: '.72rem', color: 'var(--p4)', marginBottom: 4 }}>Link de convite (válido 72h):</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <code style={{ fontSize: '.7rem', color: 'var(--co7)', flex: 1, wordBreak: 'break-all' }}>{inviteLink}</code>
                <button className="btn btn-ghost btn-sm" onClick={() => { navigator.clipboard.writeText(inviteLink); }}>Copiar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab: Logo PDF ─────────────────────────────────────────────────────
function LogoTab({ token, org, setOrg, addToast, role }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [removing,  setRemoving]  = useState(false);
  const [preview,   setPreview]   = useState(null);

  const canManage = role === 'owner' || role === 'admin';

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { addToast('Logo deve ter no máximo 2 MB.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const [header, b64] = dataUrl.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
      setPreview({ dataUrl, b64, mime });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;
    setUploading(true);
    try {
      await uploadOrgLogo(preview.b64, preview.mime, token);
      setOrg(o => ({ ...o, has_logo: true }));
      addToast('Logo atualizado com sucesso!', 'success');
      setPreview(null);
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remover o logo?')) return;
    setRemoving(true);
    try {
      await removeOrgLogo(token);
      setOrg(o => ({ ...o, has_logo: false }));
      addToast('Logo removido.', 'success');
      setPreview(null);
    } catch (e) {
      addToast(e.message, 'error');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <p style={{ color: 'var(--p4)', fontSize: '.84rem', marginBottom: 20 }}>
        O logo aparece no cabeçalho dos PDFs gerados pela sua organização, substituindo a marca padrão JURIR.
        Formatos aceitos: PNG, JPG, WebP · Tamanho máximo: 2 MB.
      </p>

      {org.has_logo && !preview && (
        <div style={{ ...cardSt, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--jade2)' }} />
          <span style={{ fontSize: '.84rem', color: 'var(--p2)' }}>Logo atual configurado</span>
          {canManage && (
            <button className="btn btn-ghost btn-sm" onClick={handleRemove} disabled={removing}
              style={{ marginLeft: 'auto', color: 'var(--cr3)' }}>
              {removing ? '…' : <><Trash2 size={13}/> Remover</>}
            </button>
          )}
        </div>
      )}

      {canManage && (
        <>
          <div
            style={{ border: '2px dashed var(--b-main)', borderRadius: 'var(--r-lg)', padding: 32,
              textAlign: 'center', cursor: 'pointer', transition: 'all .2s',
              background: preview ? 'rgba(0,242,254,0.04)' : 'transparent' }}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) { const dt = new DataTransfer(); dt.items.add(f); fileRef.current.files = dt.files; handleFile({ target: { files: [f] } }); } }}>
            {preview
              ? <img src={preview.dataUrl} alt="preview" style={{ maxHeight: 80, maxWidth: '100%', borderRadius: 6 }} />
              : <>
                  <Image size={28} style={{ color: 'var(--p5)', marginBottom: 8 }} />
                  <p style={{ fontSize: '.82rem', color: 'var(--p4)' }}>Clique ou arraste o logo aqui</p>
                </>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleFile} />

          {preview && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-cobalt" style={{ flex: 1 }} onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Enviando…' : 'Salvar Logo'}
              </button>
              <button className="btn btn-ghost" onClick={() => { setPreview(null); fileRef.current.value = ''; }}>
                Cancelar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  if (!score) return <span style={{ color: 'var(--p5)' }}>—</span>;
  const color = score >= 70 ? 'var(--jade2)' : score >= 45 ? 'var(--co6)' : 'var(--cr3)';
  return <span style={{ color, fontWeight: 600, fontFamily: 'var(--f-mono)', fontSize: '.8rem' }}>{score}</span>;
}
function PageWrap({ children }) {
  return <div style={{ maxWidth: 960, margin: '0 auto', padding: '100px 24px 60px' }}>{children}</div>;
}
function Loading() { return <div style={{ color: 'var(--p4)', padding: 40, textAlign: 'center' }}>Carregando…</div>; }
function Empty({ text }) { return <div style={{ color: 'var(--p4)', padding: 40, textAlign: 'center' }}>{text}</div>; }
function Unauthenticated() {
  const { openModal } = useStore();
  return <PageWrap><div style={{ textAlign: 'center', paddingTop: 40 }}><p style={{ color: 'var(--p4)', marginBottom: 16 }}>Faça login para acessar o Escritório.</p><button className="btn btn-cobalt" onClick={() => openModal('login')}>Entrar</button></div></PageWrap>;
}
function NeedPlan() {
  return <PageWrap><div style={{ textAlign: 'center', paddingTop: 40 }}><Building2 size={40} style={{ color: 'var(--p5)', marginBottom: 12 }} /><p style={{ color: 'var(--p4)', marginBottom: 16 }}>Esta área requer o <strong>Plano Escritório</strong>.</p><a href="/#precos" className="btn btn-cobalt">Ver Planos</a></div></PageWrap>;
}

const cardSt = {
  background: 'var(--surface)', border: '1px solid var(--b-neutral)',
  borderRadius: 'var(--r-md)', padding: '14px 16px',
};
const inputSt = {
  width: '100%', padding: '10px 14px', boxSizing: 'border-box',
  background: 'var(--surface)', border: '1px solid var(--b-neutral)',
  borderRadius: 'var(--r-md)', color: 'var(--p1)', fontSize: '.84rem',
  outline: 'none',
};
const thSt = { padding: '8px 12px', textAlign: 'left', fontWeight: 500, fontSize: '.75rem' };
const tdSt = { padding: '10px 12px', color: 'var(--p2)' };
