import { useState } from 'react';
import { ShieldCheck, Loader2, CheckCircle, XCircle, Search } from 'lucide-react';
import { verifySerial } from '../lib/api';

export default function VerificarPage() {
  const [serial,  setSerial]  = useState('');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');

  const run = async () => {
    if (!serial.trim()) { setError('Insira o serial do relatório.'); return; }
    setLoading(true); setResult(null); setError('');
    try {
      const data = await verifySerial(serial.trim());
      setResult(data);
    } catch (e) {
      setError(e.message || 'Relatório não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--lift)', border: '1px solid var(--br)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: '.72rem', color: 'var(--r3)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <ShieldCheck size={11}/> VERIFICAÇÃO DE AUTENTICIDADE
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 700, marginBottom: 8 }}>Verificar Relatório</h1>
        <p style={{ color: 'var(--n4)', fontSize: '.9rem' }}>Confirme a autenticidade de um relatório JURIR pelo serial no rodapé do PDF.</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--bn)', borderRadius: 'var(--r-xl)', padding: 28, marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: '.74rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginBottom: 10 }}>SERIAL DO RELATÓRIO</label>
        <input className="fg-input" value={serial} onChange={e => setSerial(e.target.value)}
          placeholder="JURIR-000042-A1B2C3D4"
          onKeyDown={e => e.key === 'Enter' && run()}
          style={{ marginBottom: 14, fontFamily: 'var(--f-mono)', letterSpacing: '.06em' }} />
        {error && <p style={{ color: 'var(--r4)', fontSize: '.82rem', marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-flame btn-lg" onClick={run} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? <><Loader2 size={15} className="spin"/> Verificando…</> : <><Search size={14}/> Verificar Autenticidade</>}
        </button>
      </div>

      {result && (
        <div style={{ background: 'var(--surface)', border: `1px solid ${result.valid ? 'rgba(16,185,129,0.3)' : 'rgba(185,28,28,0.3)'}`,
          borderRadius: 'var(--r-xl)', padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            {result.valid
              ? <CheckCircle size={36} style={{ color: 'var(--emerald2)' }}/>
              : <XCircle    size={36} style={{ color: 'var(--r3)' }}/>
            }
            <div>
              <div className="t-display" style={{ fontSize: '1.3rem', fontWeight: 700, color: result.valid ? 'var(--emerald2)' : 'var(--r3)' }}>
                {result.valid ? 'Relatório Autêntico' : 'Relatório Inválido'}
              </div>
              <div style={{ fontSize: '.8rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>{result.serial}</div>
            </div>
          </div>
          {result.valid && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'ID da Análise', val: result.analysis_id },
                { label: 'JURIR Score',   val: result.jurir_score != null ? `${result.jurir_score}/100` : '—' },
                { label: 'Tribunal',      val: result.tribunal || '—' },
                { label: 'Gerado em',     val: result.generated_at ? new Date(result.generated_at).toLocaleString('pt-BR') : '—' },
              ].map(({ label, val }) => (
                <div key={label} style={{ background: 'var(--lift)', borderRadius: 'var(--r-sm)', padding: '12px 14px' }}>
                  <div style={{ fontSize: '.68rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: '.88rem', color: 'var(--n1)', fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {result.aviso && <p style={{ fontSize: '.78rem', color: 'var(--n5)', marginTop: 16, fontStyle: 'italic', lineHeight: 1.6 }}>⚠ {result.aviso}</p>}
        </div>
      )}
    </div>
  );
}
