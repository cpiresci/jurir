import { memo } from 'react';
import { Scale, Shield, Download, AlertTriangle, CheckCircle2, Loader2, Brain, Zap } from 'lucide-react';
import { useStore } from '../store';
import { downloadPdf } from '../lib/api';

const useDevilState = () => useStore(s => ({
  devilText:    s.devilText,
  devilDone:    s.devilDone,
  devilRunning: s.devilRunning,
}));

const useJudgeState = () => useStore(s => ({
  verdictText: s.verdictText,
  judgeDone:   s.judgeDone,
  jurirScore:  s.jurirScore,
  scoreDims:   s.scoreDims,
  vetoActive:  s.vetoActive,
  analysisId:  s.analysisId,
  authToken:   s.authToken,
  running:     s.running,
}));

const SCORE_LABEL = (s) =>
  s >= 80 ? 'Fortemente Favorável' :
  s >= 65 ? 'Favorável' :
  s >= 50 ? 'Parcialmente Favorável' :
  s >= 35 ? 'Risco Moderado' :
  'Alto Risco';

const ScoreGauge = memo(function ScoreGauge({ score }) {
  const angle = (score / 100) * 360;
  const color = score >= 70 ? 'var(--emerald2)' : score >= 40 ? 'var(--g4)' : 'var(--r3)';
  const ringClass = score >= 70 ? 'score-ring-high' : score >= 40 ? 'score-ring-mid' : 'score-ring-low';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div className={ringClass} style={{
        width: 96, height: 96, borderRadius: '50%',
        background: `conic-gradient(${color} ${angle}deg, var(--bn2) 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%', background: 'var(--surface)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--n0)', lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '.52rem', color: 'var(--n5)', fontFamily: 'var(--f-mono)', letterSpacing: '.04em' }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: '.62rem', color: 'var(--n4)', fontFamily: 'var(--f-mono)', letterSpacing: '.1em', textAlign: 'center' }}>JURIR SCORE</span>
      <span style={{ fontSize: '.7rem', color, fontWeight: 600, textAlign: 'center' }}>{SCORE_LABEL(score)}</span>
    </div>
  );
});

const DimBar = memo(function DimBar({ label, value }) {
  const color = value >= 70 ? 'var(--emerald2)' : value >= 40 ? 'var(--g4)' : 'var(--r3)';
  return (
    <div style={{ background: 'var(--lift)', borderRadius: 'var(--r-sm)', padding: '10px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: '.68rem', color: 'var(--n4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</span>
        <span style={{ fontSize: '.7rem', color, fontFamily: 'var(--f-mono)', fontWeight: 600 }}>{value}</span>
      </div>
      <div className="conf-bar">
        <div className="conf-fill" style={{ width: `${value}%`, background: color }}/>
      </div>
    </div>
  );
});

const DevilCard = memo(function DevilCard() {
  const { devilText, devilDone, devilRunning } = useDevilState();
  if (!devilRunning && !devilDone) return null;
  return (
    <div className="devil-card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Shield size={14} style={{ color: 'var(--r3)' }}/>
        <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--r3)', letterSpacing: '.1em', fontFamily: 'var(--f-mono)' }}>
          ADVOGADO DO DIABO · CONTRADITÓRIO
        </span>
        {devilRunning && <Loader2 size={13} className="spin" style={{ color: 'var(--r3)', marginLeft: 'auto' }}/>}
        {devilDone && <CheckCircle2 size={12} style={{ color: 'var(--r3)', marginLeft: 'auto', opacity: 0.7 }}/>}
      </div>
      {devilRunning && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="skeleton" style={{ height: 10, width: '90%' }}/>
          <div className="skeleton" style={{ height: 10, width: '75%' }}/>
          <div className="skeleton" style={{ height: 10, width: '82%' }}/>
          <div className="skeleton" style={{ height: 10, width: '60%' }}/>
        </div>
      )}
      {devilDone && devilText && (
        <p style={{ fontSize: '.85rem', color: 'var(--n3)', lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
          {devilText}
        </p>
      )}
    </div>
  );
});
