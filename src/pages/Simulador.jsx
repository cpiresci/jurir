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

// ── Gráfico de tendência entre instâncias ──────────────────────────────
// [wire-simulator-chart] Antes os números só apareciam em cards isolados
// — não havia nada que mostrasse visualmente a TRAJETÓRIA da probabilidade
// (e do tempo) conforme o caso sobe de instância. Um SVG simples, sem
// dependência nova, resolve isso: linha de tendência + banda de intervalo
// de confiança + eixo de tempo estimado acumulado.
function InstanceTrendChart({ instancias }) {
  if (!instancias?.length) return null;

  const W = 640, H = 220, PAD_L = 36, PAD_R = 16, PAD_T = 16, PAD_B = 34;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const n = instancias.length;

  const xAt = (i) => PAD_L + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1));
  const yAt = (pct) => PAD_T + innerH - (Math.max(0, Math.min(100, pct)) / 100) * innerH;

  const linePts = instancias.map((it, i) => `${xAt(i)},${yAt(it.probabilidade_exito)}`).join(' ');

  const bandTop = instancias.map((it, i) => `${xAt(i)},${yAt(it.intervalo_max)}`).join(' ');
  const bandBottomRev = [...instancias].reverse().map((it, i) => {
    const idx = n - 1 - i;
    return `${xAt(idx)},${yAt(it.intervalo_min)}`;
  }).join(' ');
  const bandPath = `${bandTop} ${bandBottomRev}`;

  // Tempo acumulado (dias) até cada instância — dá noção de "quanto tempo custa" subir de nível.
  let acc = 0;
  const cumDias = instancias.map(it => { acc += it.tempo_estimado_dias || 0; return acc; });

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-md)', padding: '20px 20px 12px' }}>
      <div style={{ fontSize: '.75rem', color: 'var(--p4)', fontFamily: 'var(--f-mono)', letterSpacing: '.08em', marginBottom: 10 }}>
        TRAJETÓRIA DA PROBABILIDADE ENTRE INSTÂNCIAS
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {/* grid horizontal */}
        {gridLines.map(g => (
          <g key={g}>
            <line x1={PAD_L} x2={W - PAD_R} y1={yAt(g)} y2={yAt(g)} stroke="var(--b-subtle)" strokeWidth="1" />
            <text x={PAD_L - 8} y={yAt(g) + 3} textAnchor="end" fontSize="9" fill="var(--p5)" fontFamily="var(--f-mono)">{g}%</text>
          </g>
        ))}

        {/* banda de intervalo de confiança */}
        <polygon points={bandPath} fill="var(--co7)" opacity="0.08" />

        {/* linha de tendência */}
        <polyline points={linePts} fill="none" stroke="var(--co7)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

        {/* pontos + labels */}
        {instancias.map((it, i) => {
          const x = xAt(i), y = yAt(it.probabilidade_exito);
          const color = it.probabilidade_exito >= 65 ? 'var(--jade2)' : it.probabilidade_exito >= 40 ? 'var(--au6)' : 'var(--cr4)';
          return (
            <g key={it.instancia}>
              <circle cx={x} cy={y} r="4.5" fill={color} stroke="var(--abyss, #050507)" strokeWidth="1.5" />
              <text x={x} y={y - 12} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={color} fontFamily="var(--f-mono)">
                {it.probabilidade_exito.toFixed(0)}%
              </text>
              <text x={x} y={H - PAD_B + 16} textAnchor="middle" fontSize="9.5" fill="var(--p4)" fontFamily="var(--f-mono)">
                {(it.label || '').split(' ').slice(0, 2).join(' ')}
              </text>
              <text x={x} y={H - PAD_B + 27} textAnchor="middle" fontSize="8.5" fill="var(--p5)" fontFamily="var(--f-mono)">
                ~{cumDias[i]}d acum.
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

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

          {result.instancias?.length > 0 && <InstanceTrendChart instancias={result.instancias} />}

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
