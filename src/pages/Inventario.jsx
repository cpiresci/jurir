import { useState } from 'react';
import SoloBanner from '../components/SoloBanner';
import { FileSearch, Loader2, Scale, Calculator, ClipboardCheck, FileText, Plus, X } from 'lucide-react';
import { useStore } from '../store';
import { calcularITCMD, triagemInventario, gerarPeticaoInventario } from '../lib/api';

const ESTADOS = [
  'SP','RJ','MG','RS','SC','PR','BA','GO','DF','ES','PE','CE','PA',
  'AM','MT','MS','SE','TO','PB','RN','AL','MA','PI','RR','AP',
];

export default function InventarioPage() {
  const { authToken, userData, openModal, addToast } = useStore();
  // Guard: exige plano Solo+
  if (authToken && userData && !userData.is_unlimited) {
    return <SoloBanner feature="Triagem Inteligente de Inventário" />;
  }

  // ── ITCMD ──────────────────────────────────────────────────────────
  const [estado, setEstado] = useState('SP');
  const [valorBens, setValorBens] = useState('');
  const [loadingItcmd, setLoadingItcmd] = useState(false);
  const [resultItcmd, setResultItcmd] = useState(null);

  const calcular = async () => {
    if (!authToken) { openModal('login'); return; }
    const valor = Number(valorBens);
    if (!valor || valor <= 0) { addToast('Informe o valor total dos bens.', 'info'); return; }
    setLoadingItcmd(true); setResultItcmd(null);
    try {
      const data = await calcularITCMD({ estado, valor_total_bens: valor }, authToken);
      setResultItcmd(data);
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoadingItcmd(false);
    }
  };

  // ── Triagem ────────────────────────────────────────────────────────
  const [temTestamento, setTemTestamento] = useState(false);
  const [testamentoOk, setTestamentoOk] = useState(false);
  const [temIncapaz, setTemIncapaz] = useState(false);
  const [todosConcordam, setTodosConcordam] = useState(true);
  const [todosAdvogado, setTodosAdvogado] = useState(true);
  const [loadingTriagem, setLoadingTriagem] = useState(false);
  const [resultTriagem, setResultTriagem] = useState(null);

  const [falecidoNome, setFalecidoNome] = useState('');
  const [dataObito, setDataObito] = useState('');
  const [herdeiros, setHerdeiros] = useState(['']);
  const [bens, setBens] = useState(['']);
  const [cidadePeticao, setCidadePeticao] = useState('');
  const [advogadoNome, setAdvogadoNome] = useState('');
  const [advogadoOab, setAdvogadoOab] = useState('');
  const [loadingPeticao, setLoadingPeticao] = useState(false);

  const triar = async () => {
    if (!authToken) { openModal('login'); return; }
    setLoadingTriagem(true); setResultTriagem(null);
    try {
      const data = await triagemInventario({
        tem_testamento: temTestamento,
        testamento_registrado_e_nao_revogado: temTestamento ? testamentoOk : undefined,
        tem_herdeiro_incapaz: temIncapaz,
        todos_concordam: todosConcordam,
        todos_representados_por_advogado: todosAdvogado,
      }, authToken);
      setResultTriagem(data);
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoadingTriagem(false);
    }
  };

  const addHerdeiro = () => setHerdeiros([...herdeiros, '']);
  const removeHerdeiro = (i) => setHerdeiros(herdeiros.filter((_, idx) => idx !== i));
  const addBem = () => setBens([...bens, '']);
  const removeBem = (i) => setBens(bens.filter((_, idx) => idx !== i));

  const gerarPeticao = async () => {
    if (!authToken) { openModal('login'); return; }
    if (!resultTriagem) { addToast('Faca a triagem no bloco acima primeiro.', 'info'); return; }
    const herdeirosValidos = herdeiros.filter(h => h.trim());
    const bensValidos = bens.filter(b => b.trim());
    if (!herdeirosValidos.length) { addToast('Informe ao menos um herdeiro.', 'info'); return; }
    if (!bensValidos.length) { addToast('Informe ao menos um bem do espolio.', 'info'); return; }
    setLoadingPeticao(true);
    try {
      await gerarPeticaoInventario({
        falecido_nome: falecidoNome,
        data_obito: dataObito,
        herdeiros: herdeirosValidos,
        bens: bensValidos,
        valor_total_bens: resultItcmd?.valor_total_bens || null,
        itcmd_estimado: resultItcmd?.itcmd_estimado || null,
        estado_itcmd: resultItcmd?.estado || null,
        via_recomendada: resultTriagem.via_recomendada,
        cidade: cidadePeticao || 'Sao Paulo',
        advogado_nome: advogadoNome,
        advogado_oab: advogadoOab,
      }, authToken);
      addToast('Peca gerada com sucesso.', 'success');
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoadingPeticao(false);
    }
  };

  const fmtBRL = (v) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (!authToken) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <Scale size={32} style={{ color: 'var(--p5)' }}/>
      <p style={{ color: 'var(--p4)' }}>Faça login para usar a triagem de inventário.</p>
      <button className="btn btn-crimson" onClick={() => openModal('login')}>Entrar</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ridge)', border: '1px solid var(--b-crimson)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: 'var(--fs-xs)', color: 'var(--cr4)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <FileSearch size={11}/> TRIAGEM INTELIGENTE DE INVENTÁRIO
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, marginBottom: 8 }}>Inventário</h1>
        <p style={{ color: 'var(--p4)', fontSize: 'var(--fs-base)' }}>Calcula ITCMD estimado e indica se cabe via extrajudicial (cartório) ou exige via judicial.</p>
      </div>

      {/* ── Bloco 1: Calculadora de ITCMD ────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Calculator size={16} style={{ color: 'var(--au6)' }} />
          <span style={{ fontSize: 'var(--fs-sm)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', color: 'var(--p3)' }}>CALCULADORA DE ITCMD</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>ESTADO</label>
            <select className="fg-input" value={estado} onChange={e => setEstado(e.target.value)}>
              {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>VALOR TOTAL DOS BENS (R$)</label>
            <input
              className="fg-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ex: 850000"
              value={valorBens}
              onChange={e => setValorBens(e.target.value)}
            />
          </div>
        </div>

        <button className="btn btn-crimson btn-lg" onClick={calcular} disabled={loadingItcmd} style={{ width: '100%', justifyContent: 'center' }}>
          {loadingItcmd ? <><Loader2 size={15} className="spin"/> Calculando…</> : <><Calculator size={14}/> Calcular ITCMD</>}
        </button>

        {resultItcmd && (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--b-crimson)', borderRadius: 'var(--r-md)', padding: '18px 16px' }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>ITCMD ESTIMADO</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 'var(--fs-3xl)', fontWeight: 700, color: 'var(--cr4)' }}>{fmtBRL(resultItcmd.itcmd_estimado)}</div>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: '18px 16px' }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>ALÍQUOTA EFETIVA</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 'var(--fs-3xl)', fontWeight: 700, color: 'var(--p2)' }}>{(resultItcmd.aliquota_efetiva * 100).toFixed(2)}%</div>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: '18px 16px' }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>TIPO DE ALÍQUOTA</div>
                <div style={{ fontFamily: 'var(--f-display)', fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--p2)', textTransform: 'capitalize' }}>{resultItcmd.tipo_aliquota}</div>
              </div>
            </div>

            {resultItcmd.detalhamento?.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: 18 }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', marginBottom: 12 }}>DETALHAMENTO POR FAIXA</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {resultItcmd.detalhamento.map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)', color: 'var(--p3)' }}>
                      <span>{d.faixa} <span style={{ color: 'var(--p5)' }}>({(d.aliquota * 100).toFixed(1)}%)</span></span>
                      <span style={{ fontFamily: 'var(--f-mono)' }}>{fmtBRL(d.valor)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resultItcmd.observacao_legal && (
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--au6)', lineHeight: 1.6 }}>⚠ {resultItcmd.observacao_legal}</div>
            )}
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', lineHeight: 1.6 }}>{resultItcmd.aviso}</div>
          </div>
        )}
      </div>

      {/* ── Bloco 2: Triagem judicial vs. extrajudicial ──────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <ClipboardCheck size={16} style={{ color: 'var(--au6)' }} />
          <span style={{ fontSize: 'var(--fs-sm)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', color: 'var(--p3)' }}>TRIAGEM: JUDICIAL OU EXTRAJUDICIAL?</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-base)', color: 'var(--p2)' }}>
            <input type="checkbox" checked={temTestamento} onChange={e => setTemTestamento(e.target.checked)} />
            Há testamento
          </label>
          {temTestamento && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-sm)', color: 'var(--p3)', marginLeft: 24 }}>
              <input type="checkbox" checked={testamentoOk} onChange={e => setTestamentoOk(e.target.checked)} />
              Testamento já registrado/confirmado judicialmente, sem controvérsia
            </label>
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-base)', color: 'var(--p2)' }}>
            <input type="checkbox" checked={temIncapaz} onChange={e => setTemIncapaz(e.target.checked)} />
            Há herdeiro incapaz (menor ou interditado)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-base)', color: 'var(--p2)' }}>
            <input type="checkbox" checked={todosConcordam} onChange={e => setTodosConcordam(e.target.checked)} />
            Todos os herdeiros concordam com a partilha
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-base)', color: 'var(--p2)' }}>
            <input type="checkbox" checked={todosAdvogado} onChange={e => setTodosAdvogado(e.target.checked)} />
            Todos estão representados por advogado
          </label>
        </div>

        <button className="btn btn-crimson btn-lg" onClick={triar} disabled={loadingTriagem} style={{ width: '100%', justifyContent: 'center' }}>
          {loadingTriagem ? <><Loader2 size={15} className="spin"/> Analisando…</> : <><ClipboardCheck size={14}/> Fazer Triagem</>}
        </button>

        {resultTriagem && (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              background: resultTriagem.via_recomendada === 'extrajudicial' ? 'rgba(60,180,100,.08)' : 'rgba(220,40,40,.08)',
              border: `1px solid ${resultTriagem.via_recomendada === 'extrajudicial' ? 'var(--jade2)' : 'var(--cr4)'}`,
              borderRadius: 'var(--r-md)', padding: 20,
            }}>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 8 }}>VIA RECOMENDADA</div>
              <div style={{
                fontFamily: 'var(--f-display)', fontSize: 'var(--fs-2xl)', fontWeight: 700, textTransform: 'capitalize',
                color: resultTriagem.via_recomendada === 'extrajudicial' ? 'var(--jade2)' : 'var(--cr4)',
              }}>
                {resultTriagem.via_recomendada}
              </div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: 18 }}>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', marginBottom: 12 }}>MOTIVOS</div>
              <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resultTriagem.motivos?.map((m, i) => (
                  <li key={i} style={{ fontSize: 'var(--fs-sm)', color: 'var(--p3)', lineHeight: 1.6 }}>{m}</li>
                ))}
              </ul>
            </div>

            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', lineHeight: 1.6 }}>{resultTriagem.aviso}</div>
          </div>
        )}
      </div>

      {/* Bloco 3: Gerar peca */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 28, marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <FileText size={16} style={{ color: 'var(--au6)' }} />
          <span style={{ fontSize: 'var(--fs-sm)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', color: 'var(--p3)' }}>GERAR PETICAO / ESCRITURA</span>
        </div>

        {!resultTriagem ? (
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--p4)' }}>Faca a triagem no bloco acima primeiro.</p>
        ) : (
          <>
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 20, fontSize: 'var(--fs-sm)', color: 'var(--p3)' }}>
              Via: <strong style={{ color: 'var(--p2)', textTransform: 'capitalize' }}>{resultTriagem.via_recomendada}</strong>
              {resultItcmd && <> - ITCMD estimado: <strong style={{ color: 'var(--p2)' }}>{fmtBRL(resultItcmd.itcmd_estimado)}</strong></>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>NOME DO FALECIDO</label>
                <input className="fg-input" value={falecidoNome} onChange={e => setFalecidoNome(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>DATA DO OBITO</label>
                <input className="fg-input" placeholder="Ex: 10 de janeiro de 2026" value={dataObito} onChange={e => setDataObito(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>HERDEIROS</label>
              {herdeiros.map((h, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="fg-input" placeholder="Nome, nacionalidade, estado civil, CPF" value={h} onChange={e => { const arr = [...herdeiros]; arr[i] = e.target.value; setHerdeiros(arr); }} style={{ flex: 1 }} />
                  {herdeiros.length > 1 && <button type="button" onClick={() => removeHerdeiro(i)} className="btn btn-ghost" style={{ padding: '8px 10px' }}><X size={14}/></button>}
                </div>
              ))}
              <button type="button" onClick={addHerdeiro} className="btn btn-ghost" style={{ fontSize: 'var(--fs-xs)' }}><Plus size={12}/> Adicionar herdeiro</button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>BENS DO ESPOLIO</label>
              {bens.map((b, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="fg-input" placeholder="Descricao e valor do bem" value={b} onChange={e => { const arr = [...bens]; arr[i] = e.target.value; setBens(arr); }} style={{ flex: 1 }} />
                  {bens.length > 1 && <button type="button" onClick={() => removeBem(i)} className="btn btn-ghost" style={{ padding: '8px 10px' }}><X size={14}/></button>}
                </div>
              ))}
              <button type="button" onClick={addBem} className="btn btn-ghost" style={{ fontSize: 'var(--fs-xs)' }}><Plus size={12}/> Adicionar bem</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>CIDADE</label>
                <input className="fg-input" value={cidadePeticao} onChange={e => setCidadePeticao(e.target.value)} placeholder="Sao Paulo" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>ADVOGADO</label>
                <input className="fg-input" value={advogadoNome} onChange={e => setAdvogadoNome(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>OAB</label>
                <input className="fg-input" value={advogadoOab} onChange={e => setAdvogadoOab(e.target.value)} />
              </div>
            </div>

            <button className="btn btn-crimson btn-lg" onClick={gerarPeticao} disabled={loadingPeticao} style={{ width: '100%', justifyContent: 'center' }}>
              {loadingPeticao ? <><Loader2 size={15} className="spin"/> Gerando...</> : <><FileText size={14}/> Baixar Peca (.docx)</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
