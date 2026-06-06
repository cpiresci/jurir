import { useState, useEffect } from 'react';
import { FileDown, Loader2, Scroll } from 'lucide-react';
import { useStore } from '../store';
import { getAnalyses, generatePetition } from '../lib/api';

const TIPOS = [
  'Petição Inicial', 'Recurso de Apelação', 'Contestação',
  'Agravo de Instrumento', 'Embargos de Declaração',
  'Mandado de Segurança', 'Habeas Corpus',
];

export default function PeticoesPage() {
  const { authToken, openModal, addToast } = useStore();
  const [analyses, setAnalyses] = useState([]);
  const [loadingA, setLoadingA] = useState(false);
  const [loading,  setLoading]  = useState(false);
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
      <label style={{ display: 'block', fontSize: '.74rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginBottom: 6, letterSpacing: '.06em' }}>{label}</label>
      <input className="fg-input" value={form[key]} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

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
      <Scroll size={32} style={{ color: 'var(--n5)' }}/>
      <p style={{ color: 'var(--n4)' }}>Faça login para gerar petições.</p>
      <button className="btn btn-flame" onClick={() => openModal('login')}>Entrar</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--lift)', border: '1px solid var(--br)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: '.72rem', color: 'var(--r3)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <Scroll size={11}/> GERADOR DE PETIÇÕES
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, marginBottom: 8 }}>Gerar Petição</h1>
        <p style={{ color: 'var(--n4)', fontSize: '.9rem' }}>Gera petição .docx a partir de uma análise existente.</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-xl)', padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '.74rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>ANÁLISE BASE</label>
          {loadingA ? <div style={{ color: 'var(--n5)', fontSize: '.85rem' }}>Carregando…</div> : (
            <select className="fg-input" value={form.analysis_id} onChange={e => setForm(f => ({ ...f, analysis_id: e.target.value }))}>
              <option value="">Selecione uma análise…</option>
              {analyses.map(a => <option key={a.id} value={a.id}>#{a.id} — {a.prompt?.slice(0, 80) || 'Análise'}</option>)}
            </select>
          )}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: '.74rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>TIPO DE PETIÇÃO</label>
          <select className="fg-input" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div style={{ height: 1, background: 'var(--bn)', marginBottom: 24 }}/>
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
        <button className="btn btn-flame btn-lg" onClick={run} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? <><Loader2 size={15} className="spin"/> Gerando…</> : <><FileDown size={14}/> Gerar e Baixar .docx</>}
        </button>
      </div>
    </div>
  );
}
