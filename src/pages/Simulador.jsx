import { useState, useEffect } from 'react';
import SoloBanner from '../components/SoloBanner';
import { TrendingUp, Loader2, Scale } from 'lucide-react';
import { useStore } from '../store';
import { getAnalyses, simulateInstances } from '../lib/api';

const INSTANCES = [
  { key: '1a_instancia', label: '1ª Instância' },
  { key: 'tj',           label: 'Tribunal de Justiça' },
  { key: 'stj',          label: 'STJ' },
  { key: 'stf',          label: 'STF' },
];

const AREAS = ['civil','penal','trabalhista','consumidor','tributario','familia','empresarial','imobiliario','constitucional','previdenciario'];

export default function SimuladorPage() {
  const { authToken, userData, openModal, addToast } = useStore();
  // Guard: exige plano Solo+
  if (authToken && userData && !userData.is_unlimited) {
    return <SoloBanner feature="Simulador de Instâncias" />;
  }

  const [analyses,   setAnalyses]   = useState([]);
  const [loadingA,   setLoadingA]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [analysisId, setAnalysisId] = useState('');
  const [area,       setArea]       = useState('civil');
  const [result,     setResult]     = useState(null);

  useEffect(() => {
    if (!authToken) return;
    setLoadingA(true);
    getAnalyses(authToken)
      .then(d => setAnalyses(Array.isArray(d) ? d : d.analyses || []))
      .catch(() => {})
      .finally(() => setLoadingA(false));
  }, [authToken]);

  const run = async () => {
    if (!authToken) { openModal('login'); return; }
    if (!analysisId) { addToast('Selecione uma análise.', 'info'); return; }
    setLoading(true); setResult(null);
    try {
      const data = await simulateInstances({ analysis_id: Number(analysisId), area }, authToken);
      // [fix-sim-shape] simulationToDict retorna instancias[] — indexar por chave para o JSX
      const instMap = Object.fromEntries((data.instancias || []).map(i => [i.instancia, i]));
      setResult({ ...data, ...instMap });
    } catch (e) {
      addToast(`Erro: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const pctColor = (p) => p >= 65 ? 'var(--jade2)' : p >= 40 ? 'var(--au6)' : 'var(--cr4)';

  if (!authToken) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <Scale size={32} style={{ color: 'var(--p5)' }}/>
      <p style={{ color: 'var(--p4)' }}>Faça login para usar o simulador.</p>
      <button className="btn btn-crimson" onClick={() => openModal('login')}>Entrar</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ridge)', border: '1px solid var(--b-crimson)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: '.75rem', color: 'var(--cr4)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <TrendingUp size={11}/> SIMULADOR DE INSTÂNCIAS
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, marginBottom: 8 }}>Simular Instâncias</h1>
        <p style={{ color: 'var(--p4)', fontSize: '.9rem' }}>Estima probabilidades de êxito em cada instância judiciária.</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>ANÁLISE BASE</label>
            {loadingA ? <div style={{ color: 'var(--p5)', fontSize: '.85rem' }}>Carregando…</div> : (
              <select className="fg-input" value={analysisId} onChange={e => setAnalysisId(e.target.value)}>
                <option value="">Selecione…</option>
                {analyses.map(a => <option key={a.id} value={a.id}>#{a.id} · Score {a.jurir_score ?? '?'} · {a.prompt?.slice(0, 50) || 'Análise'}</option>)}
              </select>
            )}
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>ÁREA DO DIREITO</label>
            <select className="fg-input" value={area} onChange={e => setArea(e.target.value)}>
              {AREAS.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <button className="btn btn-crimson btn-lg" onClick={run} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? <><Loader2 size={15} className="spin"/> Simulando…</> : <><TrendingUp size={14}/> Simular Probabilidades</>}
        </button>
      </div>

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
            {INSTANCES.map(({ key, label }) => {
              const raw = result[key];
              // [fix-sim-card] campo correto é probabilidade_exito (snake_case do simulationToDict)
              const pct = typeof raw === 'object'
                ? (raw?.probabilidade_exito ?? raw?.prob ?? raw?.probability ?? raw?.pct ?? 0)
                : (Number(raw) || 0);
              const color = pctColor(pct);
              const dias  = raw?.tempo_estimado_dias;
              const adm   = raw?.admissibilidade;
              return (
                <div key={key} style={{ background: 'var(--surface)', border: `1px solid ${color}30`, borderRadius: 'var(--r-md)', padding: '18px 16px' }}>
                  <div style={{ fontSize: '.75rem', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.06em', marginBottom: 8 }}>{label}</div>
                  <div style={{ fontFamily: 'var(--f-display)', fontSize: '2rem', fontWeight: 700, color, marginBottom: 10 }}>{pct.toFixed(0)}%</div>
                  <div style={{ height: 6, background: 'var(--b-subtle)', borderRadius: 'var(--r-pill)', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ height: '100%', width: `${Math.min(pct,100)}%`, background: color, borderRadius: 'var(--r-pill)', transition: 'width .8s ease' }}/>
                  </div>
                  {dias && <div style={{ fontSize: '.75rem', color: 'var(--p5)', fontFamily: 'var(--f-mono)' }}>~{dias}d{adm != null ? ` · adm ${adm.toFixed(0)}%` : ''}</div>}
                </div>
              );
            })}
          </div>

          {(result.recomendacao || result.estrategia_recomendada) && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                <div style={{ fontSize: '.75rem', color: 'var(--au6)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em' }}>ESTRATÉGIA RECOMENDADA</div>
                {result.melhor_instancia && <div style={{ fontSize: '.75rem', color: 'var(--jade2)', fontFamily: 'var(--f-mono)' }}>✓ MELHOR: {result.melhor_instancia}</div>}
              </div>
              <p style={{ fontSize: '.88rem', color: 'var(--p2)', lineHeight: 1.7 }}>{result.recomendacao || result.estrategia_recomendada}</p>
            </div>
          )}

          {/* [fix-sim-obs] Backend não tem fatores_positivos/negativos/observacoes —
               exibe detalhes das instâncias (obs + requisitos) quando disponíveis */}
          {result.instancias?.some(i => i.requisitos) && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: 18 }}>
              <div style={{ fontSize: '.75rem', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 12 }}>REQUISITOS DE ADMISSIBILIDADE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.instancias.filter(i => i.requisitos).map((i, idx) => (
                  <div key={idx} style={{ fontSize: '.83rem', color: 'var(--p3)', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--au6)', fontFamily: 'var(--f-mono)', flexShrink: 0 }}>{i.label.split(' ')[0]}</span>
                    <span>{i.requisitos}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
