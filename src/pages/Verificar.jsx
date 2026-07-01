import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ShieldCheck, Loader2, CheckCircle, XCircle, Search, MessageCircle, Linkedin } from 'lucide-react';
import { verifySerial } from '../lib/api';

export default function VerificarPage() {
  const [searchParams] = useSearchParams();
  const [serial,  setSerial]  = useState(searchParams.get('serial') || '');
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState('');

  const verify = async (value) => {
    const target = (value ?? serial).trim();
    if (!target) { setError('Insira o serial do relatório.'); return; }
    setLoading(true); setResult(null); setError('');
    try {
      const data = await verifySerial(target);
      setResult(data);
    } catch (e) {
      setError(e.message || 'Relatório não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  const run = () => verify();

  // [fix-verify-link] Quando o link vem do rodapé do PDF / QR code
  // (?serial=JURIR-...), verifica automaticamente ao carregar a página
  // em vez de exigir que o usuário cole o serial manualmente de novo.
  useEffect(() => {
    const fromUrl = searchParams.get('serial');
    if (fromUrl) verify(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ridge)', border: '1px solid var(--b-crimson)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: 'var(--fs-xs)', color: 'var(--cr4)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <ShieldCheck size={11}/> VERIFICAÇÃO DE AUTENTICIDADE
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, marginBottom: 8 }}>Verificar Relatório</h1>
        <p style={{ color: 'var(--p4)', fontSize: 'var(--fs-base)' }}>Confirme a autenticidade de um relatório JURIR pelo serial no rodapé do PDF.</p>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)', padding: 28, marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginBottom: 10 }}>SERIAL DO RELATÓRIO</label>
        <input className="fg-input" value={serial} onChange={e => setSerial(e.target.value)}
          placeholder="JURIR-000042-A1B2C3D4"
          onKeyDown={e => e.key === 'Enter' && run()}
          style={{ marginBottom: 14, fontFamily: 'var(--f-mono)', letterSpacing: '.06em' }} />
        {error && <p style={{ color: 'var(--cr5)', fontSize: 'var(--fs-sm)', marginBottom: 12 }}>{error}</p>}
        <button className="btn btn-crimson btn-lg" onClick={run} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? <><Loader2 size={15} className="spin"/> Verificando…</> : <><Search size={14}/> Verificar Autenticidade</>}
        </button>
      </div>

      {result && (
        <div style={{ background: 'var(--surface)', border: `1px solid ${result.valid ? 'rgba(16,185,129,0.3)' : 'rgba(185,28,28,0.3)'}`,
          borderRadius: 'var(--r-xl)', padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            {result.valid
              ? <CheckCircle size={36} style={{ color: 'var(--jade2)' }}/>
              : <XCircle    size={36} style={{ color: 'var(--cr4)' }}/>
            }
            <div>
              <div className="t-display" style={{ fontSize: 'var(--fs-xl)', fontWeight: 700, color: result.valid ? 'var(--jade2)' : 'var(--cr4)' }}>
                {result.valid ? 'Relatório Autêntico' : 'Relatório Inválido'}
              </div>
              <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--p4)', fontFamily: 'var(--f-mono)', marginTop: 2 }}>{result.serial}</div>
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
                <div key={label} style={{ background: 'var(--ridge)', borderRadius: 'var(--r-sm)', padding: '12px 14px' }}>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', fontFamily: 'var(--f-mono)', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 'var(--fs-base)', color: 'var(--p1)', fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>
          )}
          {result.aviso && <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', marginTop: 16, fontStyle: 'italic', lineHeight: 1.6 }}>⚠ {result.aviso}</p>}

          {/* [bloco10-growth] Compartilhamento — canais reais de advogado
              brasileiro. O selo já é uma prova pública de autenticidade;
              compartilhar é o próprio advogado endossando o produto. */}
          {result.valid && (
            <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--b-neutral)' }}>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Verifiquei a autenticidade deste relatório jurídico gerado com IA na Jurir: ${window.location.href}`)}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Linkedin size={14} /> LinkedIn
              </a>
            </div>
          )}
        </div>
      )}

      {/* [bloco10-growth] Rodapé fixo — essa página é indexável e
          compartilhável (link de todo QR/PDF gerado), então sempre carrega
          uma chamada pra ação, com ou sem resultado de busca. */}
      <div style={{ textAlign: 'center', marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--b-neutral)' }}>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', fontFamily: 'var(--f-mono)', letterSpacing: '.04em' }}>
          Gerado com <Link to="/" style={{ color: 'var(--cy1)', textDecoration: 'none' }}>Jurir</Link> — analise seu caso em{' '}
          <Link to="/" style={{ color: 'var(--cy1)', textDecoration: 'none' }}>jurir.com</Link>
        </p>
      </div>
    </div>
  );
}
