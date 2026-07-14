import { useState } from 'react';
import { Share2, Loader2 } from 'lucide-react';
import { generateShareCardBlob, extractHeadline } from '../lib/shareCard';

// [share-card] Botão que gera o card compartilhável (formato story 9:16) e
// dispara o compartilhamento nativo (Web Share API, disponível também dentro
// do WebView do app via Capacitor) ou, sem suporte, baixa a imagem direto.
export default function ShareCardButton({ score, scoreLabel, verdictText, citations }) {
  const [busy, setBusy] = useState(false);

  if (score == null) return null;

  const handleShare = async () => {
    setBusy(true);
    try {
      const blob = await generateShareCardBlob({
        score,
        scoreLabel,
        verdictLine: extractHeadline(verdictText),
        citations: (citations || []).map(c => `${c.diploma || ''} ${c.artigo || ''}`.trim()).filter(Boolean),
      });
      const file = new File([blob], 'jurir-resultado.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Meu resultado no Jurir',
          text: 'Descobri meu JURIR Score — confira o seu de graça:',
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'jurir-resultado.png';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      // Cancelado pelo usuário ou sem suporte no navegador — não é erro real
      console.warn('[share-card]', e?.message || e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button className="btn btn-ghost-sm" onClick={handleShare} disabled={busy}>
      {busy ? <Loader2 size={12} className="spin" /> : <Share2 size={12} />}
      {busy ? 'Gerando imagem…' : 'Compartilhar resultado'}
    </button>
  );
}
