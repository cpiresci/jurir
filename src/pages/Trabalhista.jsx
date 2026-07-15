import { useState } from 'react';
import { Loader2, Briefcase, Calculator, Zap } from 'lucide-react';
import { useStore } from '../store';
import { calcularVerbasRescisorias, calcularAdicionaisTrabalhistas } from '../lib/api';

export default function TrabalhistaPage() {
  const { authToken, openModal, addToast } = useStore();

  // ── Verbas rescisórias ────────────────────────────────────────────────
  const [salario, setSalario] = useState('');
  const [tipoRescisao, setTipoRescisao] = useState('sem_justa_causa');
  const [diasNoMes, setDiasNoMes] = useState('');
  const [mesesNoAno, setMesesNoAno] = useState('');
  const [mesesPeriodo, setMesesPeriodo] = useState('');
  const [anosDeEmpresa, setAnosDeEmpresa] = useState('');
  const [saldoFgts, setSaldoFgts] = useState('');
  const [feriasVencidas, setFeriasVencidas] = useState(false);
  const [loadingVerbas, setLoadingVerbas] = useState(false);
  const [resultVerbas, setResultVerbas] = useState(null);

  const calcularVerbas = async () => {
    if (!authToken) { openModal('login'); return; }
    if (!salario || Number(salario) <= 0) { addToast('Informe o salário.', 'info'); return; }
    setLoadingVerbas(true); setResultVerbas(null);
    try {
      const data = await calcularVerbasRescisorias({
        salario: Number(salario),
        tipo_rescisao: tipoRescisao,
        dias_trabalhados_no_mes: Number(diasNoMes) || 0,
        meses_trabalhados_no_ano: Number(mesesNoAno) || 0,
        meses_periodo_aquisitivo_atual: Number(mesesPeriodo) || 0,
        anos_completos_de_empresa: Number(anosDeEmpresa) || 0,
        saldo_fgts: saldoFgts ? Number(saldoFgts) : null,
        tem_ferias_vencidas: feriasVencidas,
      }, authToken);
      setResultVerbas(data);
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoadingVerbas(false);
    }
  };

  // ── Adicionais ─────────────────────────────────────────────────────────
  const [grauInsalubridade, setGrauInsalubridade] = useState('');
  const [temPericulosidade, setTemPericulosidade] = useState(false);
  const [salarioBase, setSalarioBase] = useState('');
  const [loadingAdic, setLoadingAdic] = useState(false);
  const [resultAdic, setResultAdic] = useState(null);

  const calcularAdicionais = async () => {
    if (!authToken) { openModal('login'); return; }
    if (!grauInsalubridade && !temPericulosidade) { addToast('Selecione insalubridade e/ou periculosidade.', 'info'); return; }
    if (temPericulosidade && (!salarioBase || Number(salarioBase) <= 0)) { addToast('Informe o salário base para calcular periculosidade.', 'info'); return; }
    setLoadingAdic(true); setResultAdic(null);
    try {
      const data = await calcularAdicionaisTrabalhistas({
        salario_base: salarioBase ? Number(salarioBase) : null,
        grau_insalubridade: grauInsalubridade || null,
        tem_periculosidade: temPericulosidade,
      }, authToken);
      setResultAdic(data);
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoadingAdic(false);
    }
  };

  const fmtBRL = (v) => (v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (!authToken) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <Briefcase size={32} style={{ color: 'var(--p5)' }}/>
      <p style={{ color: 'var(--p4)' }}>Faça login para usar a calculadora trabalhista.</p>
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
          <Briefcase size={11}/> CALCULADORA TRABALHISTA
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, marginBottom: 8 }}>Fui demitido. Tenho direito a quê?</h1>
        <p style={{ color: 'var(--p4)', fontSize: 'var(--fs-base)' }}>Calcula verbas rescisórias e adicionais de insalubridade/periculosidade com base na CLT.</p>
      </div>

      {/* ── Bloco 1: Verbas rescisórias ──────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Calculator size={16} style={{ color: 'var(--au6)' }} />
          <span style={{ fontSize: 'var(--fs-sm)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', color: 'var(--p3)' }}>VERBAS RESCISÓRIAS</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>SALÁRIO BRUTO (R$)</label>
            <input className="fg-input" type="number" min="0" step="0.01" placeholder="Ex: 3000" value={salario} onChange={e => setSalario(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>TIPO DE RESCISÃO</label>
            <select className="fg-input" value={tipoRescisao} onChange={e => setTipoRescisao(e.target.value)}>
              <option value="sem_justa_causa">Dispensa sem justa causa</option>
              <option value="pedido_demissao">Pedido de demissão</option>
              <option value="justa_causa">Dispensa por justa causa</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>DIAS TRABALHADOS NO MÊS DA SAÍDA</label>
            <input className="fg-input" type="number" min="0" max="31" placeholder="Ex: 12" value={diasNoMes} onChange={e => setDiasNoMes(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>MESES TRABALHADOS NO ANO</label>
            <input className="fg-input" type="number" min="0" max="12" placeholder="Ex: 7" value={mesesNoAno} onChange={e => setMesesNoAno(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>MESES DO PERÍODO AQUISITIVO ATUAL (FÉRIAS)</label>
            <input className="fg-input" type="number" min="0" max="12" placeholder="Ex: 7" value={mesesPeriodo} onChange={e => setMesesPeriodo(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>ANOS COMPLETOS DE EMPRESA</label>
            <input className="fg-input" type="number" min="0" placeholder="Ex: 2" value={anosDeEmpresa} onChange={e => setAnosDeEmpresa(e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>SALDO DE FGTS (SE SOUBER — opcional)</label>
            <input className="fg-input" type="number" min="0" step="0.01" placeholder="Deixe em branco para estimar" value={saldoFgts} onChange={e => setSaldoFgts(e.target.value)} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-sm)', color: 'var(--p2)', paddingBottom: 10 }}>
            <input type="checkbox" checked={feriasVencidas} onChange={e => setFeriasVencidas(e.target.checked)} />
            Tenho férias vencidas e não gozadas
          </label>
        </div>

        <button className="btn btn-crimson btn-lg" onClick={calcularVerbas} disabled={loadingVerbas} style={{ width: '100%', justifyContent: 'center' }}>
          {loadingVerbas ? <><Loader2 size={15} className="spin"/> Calculando…</> : <><Calculator size={14}/> Calcular Verbas</>}
        </button>

        {resultVerbas && (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--b-crimson)', borderRadius: 'var(--r-md)', padding: '20px 18px' }}>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>TOTAL ESTIMADO</div>
              <div style={{ fontFamily: 'var(--f-display)', fontSize: 'var(--fs-3xl)', fontWeight: 700, color: 'var(--cr4)' }}>{fmtBRL(resultVerbas.total_estimado)}</div>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: 18 }}>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', marginBottom: 12 }}>DETALHAMENTO POR VERBA</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {resultVerbas.verbas?.map((v, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingBottom: 8, borderBottom: i < resultVerbas.verbas.length - 1 ? '1px dashed var(--b-neutral)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)', color: 'var(--p2)' }}>
                      <span>{v.verba}</span>
                      <span style={{ fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{fmtBRL(v.valor)}</span>
                    </div>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)' }}>{v.base_legal}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', lineHeight: 1.6 }}>{resultVerbas.aviso}</div>
          </div>
        )}
      </div>

      {/* ── Bloco 2: Adicionais ──────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Zap size={16} style={{ color: 'var(--au6)' }} />
          <span style={{ fontSize: 'var(--fs-sm)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', color: 'var(--p3)' }}>ADICIONAL DE INSALUBRIDADE / PERICULOSIDADE</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>GRAU DE INSALUBRIDADE</label>
            <select className="fg-input" value={grauInsalubridade} onChange={e => setGrauInsalubridade(e.target.value)}>
              <option value="">Não se aplica</option>
              <option value="minimo">Mínimo (10%)</option>
              <option value="medio">Médio (20%)</option>
              <option value="maximo">Máximo (40%)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 'var(--fs-sm)', color: 'var(--p2)', marginBottom: 8, marginTop: 22 }}>
              <input type="checkbox" checked={temPericulosidade} onChange={e => setTemPericulosidade(e.target.checked)} />
              Tenho direito a periculosidade (30%)
            </label>
            {temPericulosidade && (
              <input className="fg-input" type="number" min="0" step="0.01" placeholder="Salário base (R$)" value={salarioBase} onChange={e => setSalarioBase(e.target.value)} />
            )}
          </div>
        </div>

        <button className="btn btn-crimson btn-lg" onClick={calcularAdicionais} disabled={loadingAdic} style={{ width: '100%', justifyContent: 'center' }}>
          {loadingAdic ? <><Loader2 size={15} className="spin"/> Calculando…</> : <><Zap size={14}/> Calcular Adicional</>}
        </button>

        {resultAdic && (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
              {resultAdic.insalubridade && (
                <div style={{ background: 'var(--bg-glass)', border: '1px solid var(--b-crimson)', borderRadius: 'var(--r-md)', padding: '18px 16px' }}>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>INSALUBRIDADE ({(resultAdic.insalubridade.percentual * 100).toFixed(0)}%)</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--cr4)' }}>{fmtBRL(resultAdic.insalubridade.valor_mensal)}<span style={{ fontSize: 'var(--fs-sm)', color: 'var(--p5)' }}>/mês</span></div>
                </div>
              )}
              {resultAdic.periculosidade && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: '18px 16px' }}>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>PERICULOSIDADE (30%)</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: 'var(--fs-2xl)', fontWeight: 700, color: 'var(--p2)' }}>{fmtBRL(resultAdic.periculosidade.valor_mensal)}<span style={{ fontSize: 'var(--fs-sm)', color: 'var(--p5)' }}>/mês</span></div>
                </div>
              )}
            </div>

            {resultAdic.aviso_acumulo && (
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--au6)', lineHeight: 1.6 }}>⚠ {resultAdic.aviso_acumulo}</div>
            )}
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', lineHeight: 1.6 }}>{resultAdic.aviso}</div>
          </div>
        )}
      </div>
    </div>
  );
}
