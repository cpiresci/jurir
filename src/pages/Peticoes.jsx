import { useState, useEffect } from 'react';
import SoloBanner from '../components/SoloBanner';
import { FileDown, Loader2, Scroll, Eye, ArrowLeft, User, Gavel } from 'lucide-react';
import { useStore } from '../store';
import { getAnalyses, generatePetition, previewPetition } from '../lib/api';

const TIPOS = [
  'Petição Inicial', 'Recurso de Apelação', 'Contestação',
  'Agravo de Instrumento', 'Embargos de Declaração',
  'Mandado de Segurança', 'Habeas Corpus',
];

export default function PeticoesPage() {
  const { authToken, userData, openModal, addToast } = useStore();
  // Guard: exige plano Solo+
  if (authToken && userData && !userData.is_unlimited) {
    return <SoloBanner feature="Gerador de Petições" />;
  }

  const [analyses, setAnalyses] = useState([]);
  const [loadingA, setLoadingA] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [preview,  setPreview]  = useState(null); // null = form; objeto = pré-visualização carregada
  const [form, setForm] = useState({
    analysis_id: '', tipo: 'Petição Inicial',
    autor_nome: '', autor_qualif: '', reu_nome: '', reu_qualif: '',
    vara: '', numero_processo: '', advogado_nome: '', advogado_oab: '', cidade: 'São Paulo',
  });

  useEffect(() => {
    if (!authToken) return;
    setLoadingA(true);
    getAnalyses(authToken)
      .then(d => setAnalyses(Array.isArray(d) ? d : d.analyses || []))
      .catch(() => {})
      .finally(() => setLoadingA(false));
  }, [authToken]);

  const F = (key, label, placeholder = '') => (
    <div>
      <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 6, letterSpacing: '.06em' }}>{label}</label>
      <input className="fg-input" value={form[key]} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

  const handlePreview = async () => {
    if (!authToken) { openModal('login'); return; }
    if (!form.analysis_id) { addToast('Selecione uma análise.', 'info'); return; }
    setPreviewing(true);
    try {
      const data = await previewPetition({ ...form, analysis_id: Number(form.analysis_id) }, authToken);
      setPreview(data);
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setPreviewing(false);
    }
  };

  const run = async () => {
    if (!authToken) { openModal('login'); return; }
    if (!form.analysis_id) { addToast('Selecione uma análise.', 'info'); return; }
    setLoading(true);
    try {
      await generatePetition({ ...form, analysis_id: Number(form.analysis_id) }, authToken);
      addToast('Petição gerada com sucesso!', 'success');
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!authToken) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <Scroll size={32} style={{ color: 'var(--p5)' }}/>
      <p style={{ color: 'var(--p4)' }}>Faça login para gerar petições.</p>
      <button className="btn btn-crimson" onClick={() => openModal('login')}>Entrar</button>
    </div>
  );

  // ── Painel de pré-visualização ──────────────────────────────────────
  if (preview) {
    return (
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 24px 60px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setPreview(null)} style={{ marginBottom: 20 }}>
          <ArrowLeft size={13}/> Voltar e editar
        </button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--ridge)', border: '1px solid var(--b-crimson)', borderRadius: 'var(--r-pill)',
            padding: '5px 14px', fontSize: 'var(--fs-xs)', color: 'var(--cr4)', fontFamily: 'var(--f-mono)',
            letterSpacing: '.1em', marginBottom: 16 }}>
            <Eye size={11}/> PRÉ-VISUALIZAÇÃO
          </div>
          <h1 className="t-display" style={{ fontSize: 'clamp(1.5rem,3.5vw,2rem)', fontWeight: 700, marginBottom: 6 }}>{preview.tipo}</h1>
          <p style={{ color: 'var(--p4)', fontSize: 'var(--fs-base)' }}>Confira o conteúdo antes de baixar o .docx.</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 26, display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Cabeçalho / partes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', marginBottom: 6 }}>
                <User size={11}/> AUTOR
              </div>
              <p style={{ fontSize: 'var(--fs-base)', color: 'var(--p2)' }}>{preview.autorNome || <em style={{ color: 'var(--p5)' }}>não informado</em>}</p>
              {preview.autorQualif && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', marginTop: 2 }}>{preview.autorQualif}</p>}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', marginBottom: 6 }}>
                <User size={11}/> RÉU
              </div>
              <p style={{ fontSize: 'var(--fs-base)', color: 'var(--p2)' }}>{preview.reuNome || <em style={{ color: 'var(--p5)' }}>não informado</em>}</p>
              {preview.reuQualif && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', marginTop: 2 }}>{preview.reuQualif}</p>}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              ['Tribunal', preview.tribunal], ['Vara', preview.vara], ['Processo', preview.numeroProcesso],
              ['Cidade', preview.cidade], ['Valor da causa', preview.valorCausa],
            ].filter(([, v]) => v).map(([label, v]) => (
              <span key={label} style={{
                fontSize: 'var(--fs-xs)', fontFamily: 'var(--f-mono)', color: 'var(--p3)',
                background: 'var(--bg-card, rgba(255,255,255,0.03))', border: '1px solid var(--b-neutral)',
                borderRadius: 999, padding: '4px 10px',
              }}>{label}: {v}</span>
            ))}
          </div>

          <div style={{ height: 1, background: 'var(--b-neutral)' }} />

          {/* Fatos */}
          <div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--au6)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 8 }}>DOS FATOS</div>
            <p style={{ fontSize: 'var(--fs-base)', color: 'var(--p3)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{preview.fatos}</p>
          </div>

          {/* Fundamentos */}
          {preview.fundamentos?.length > 0 && (
            <div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--au6)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 8 }}>FUNDAMENTOS JURÍDICOS</div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {preview.fundamentos.map((f, i) => (
                  <li key={i} style={{ fontSize: 'var(--fs-sm)', color: 'var(--p3)', lineHeight: 1.6 }}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Pedidos */}
          {preview.pedidos?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-xs)', color: 'var(--au6)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 8 }}>
                <Gavel size={11}/> DO PEDIDO
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {preview.pedidos.map((p, i) => (
                  <p key={i} style={{ fontSize: 'var(--fs-sm)', color: 'var(--p3)', lineHeight: 1.6, margin: 0 }}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {/* Teses dos especialistas */}
          {preview.agentTeses?.length > 0 && (
            <div>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 8 }}>
                TESES DOS ESPECIALISTAS USADAS (Score {Math.round(preview.jurirScore)}/100)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {preview.agentTeses.map((t, i) => (
                  <div key={i} style={{ fontSize: 'var(--fs-sm)', color: 'var(--p4)' }}>
                    <strong style={{ color: 'var(--p2)' }}>{t.area}</strong> ({t.conf}%) — {t.tese?.slice(0, 140)}{t.tese?.length > 140 ? '…' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--b-neutral)' }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', fontFamily: 'var(--f-mono)', marginRight: 'auto', alignSelf: 'center' }}>
              {preview.advogadoNome} · {preview.advogadoOab}
            </span>
            <button className="btn btn-crimson" onClick={run} disabled={loading}>
              {loading ? <><Loader2 size={15} className="spin"/> Gerando…</> : <><FileDown size={14}/> Confirmar e baixar .docx</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ridge)', border: '1px solid var(--b-crimson)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: 'var(--fs-xs)', color: 'var(--cr4)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <Scroll size={11}/> GERADOR DE PETIÇÕES
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, marginBottom: 8 }}>Gerar Petição</h1>
        <p style={{ color: 'var(--p4)', fontSize: 'var(--fs-base)' }}>Gera petição .docx a partir de uma análise existente.</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>ANÁLISE BASE</label>
          {loadingA ? <div style={{ color: 'var(--p5)', fontSize: 'var(--fs-base)' }}>Carregando…</div> : (
            <select className="fg-input" value={form.analysis_id} onChange={e => setForm(f => ({ ...f, analysis_id: e.target.value }))}>
              <option value="">Selecione uma análise…</option>
              {analyses.map(a => <option key={a.id} value={a.id}>#{a.id} — {a.prompt?.slice(0, 80) || 'Análise'}</option>)}
            </select>
          )}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>TIPO DE PETIÇÃO</label>
          <select className="fg-input" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ height: 1, background: 'var(--b-neutral)', marginBottom: 24 }}/>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {F('autor_nome',    'NOME DO AUTOR',       'Ex: João da Silva')}
          {F('autor_qualif',  'QUALIFICAÇÃO DO AUTOR','brasileiro, casado, CPF…')}
          {F('reu_nome',      'NOME DO RÉU',          'Ex: Empresa XYZ Ltda')}
          {F('reu_qualif',    'QUALIFICAÇÃO DO RÉU',  'pessoa jurídica, CNPJ…')}
          {F('advogado_nome', 'NOME DO ADVOGADO',     'Dr. Maria Souza')}
          {F('advogado_oab',  'OAB',                  'OAB/SP 123456')}
          {F('vara',          'VARA / JUÍZO',         '5ª Vara Cível de São Paulo')}
          {F('numero_processo','Nº DO PROCESSO',      '1234567-89.2024.8.26.0100')}
          {F('cidade',        'CIDADE',               'São Paulo')}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-lg" onClick={handlePreview} disabled={previewing} style={{ flex: 1, justifyContent: 'center' }}>
            {previewing ? <><Loader2 size={15} className="spin"/> Carregando…</> : <><Eye size={14}/> Pré-visualizar</>}
          </button>
          <button className="btn btn-crimson btn-lg" onClick={run} disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
            {loading ? <><Loader2 size={15} className="spin"/> Gerando…</> : <><FileDown size={14}/> Gerar e Baixar .docx</>}
          </button>
        </div>
      </div>
    </div>
  );
}
