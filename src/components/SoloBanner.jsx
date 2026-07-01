/**
 * SoloBanner — exibido no topo de páginas exclusivas do plano Solo+
 * quando o usuário não tem o plano adequado.
 * Props:
 *   feature: string — nome da feature (ex: "Delta Analysis")
 */
import { Link } from 'react-router-dom';
import { Lock, Zap } from 'lucide-react';

export default function SoloBanner({ feature = 'esta funcionalidade' }) {
  return (
    <div style={{
      maxWidth: 680, margin: '120px auto 0', padding: '0 24px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', gap: 20,
    }}>
      {/* Icon */}
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(220,40,40,.08)',
        border: '1px solid rgba(220,40,40,.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Lock size={26} color="var(--cr4)" />
      </div>

      {/* Title */}
      <h2 className="t-display" style={{ fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 700, margin: 0 }}>
        Plano Solo necessário
      </h2>

      {/* Description */}
      <p style={{ color: 'var(--t3)', fontSize: 'var(--fs-md)', lineHeight: 1.7, margin: 0, maxWidth: 480 }}>
        <strong style={{ color: 'var(--p2)' }}>{feature}</strong> é exclusivo do plano{' '}
        <strong style={{ color: 'var(--cr3)' }}>Solo</strong> ou superior.
        Faça upgrade para desbloquear análises ilimitadas, todos os 16 agentes e acesso completo às ferramentas avançadas.
      </p>

      {/* Features do Solo */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px',
        background: 'var(--bg-glass)', border: '1px solid var(--b-main)',
        borderRadius: 'var(--r-md)', padding: '16px 24px',
        fontSize: 'var(--fs-sm)', color: 'var(--t3)', textAlign: 'left',
      }}>
        {[
          '✅ Análises ilimitadas',
          '✅ 16 agentes em paralelo',
          '✅ Advogado do Diabo + Juiz IA',
          '✅ JURIR Score dimensional',
          '✅ Delta Analysis',
          '✅ Upload de documentos PDF/DOCX',
          '✅ Gerador de Petições',
          '✅ Simulador de Instâncias',
          '✅ Monitoramento Processual',
          '✅ Streaming SSE em tempo real',
        ].map(item => (
          <span key={item}>{item}</span>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/premium" className="btn btn-cobalt" style={{ gap: 8 }}>
          <Zap size={15} /> Ver planos
        </Link>
        <Link to="/" className="btn btn-ghost">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
