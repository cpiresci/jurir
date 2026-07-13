// shareCard.js — Gera um card compartilhável (formato story 9:16, 1080x1920)
// com o JURIR Score e um resumo do veredicto, pensado pra print/compartilhamento
// social (Instagram Stories, WhatsApp Status). Desenho puro em <canvas>,
// sem dependência externa nova — mantém o bundle leve.

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function generateShareCardBlob({ score, scoreLabel, verdictLine }) {
  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Fundo — gradiente escuro consistente com a identidade visual do Jurir
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#050507');
  bg.addColorStop(1, '#0a0e1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Glow central
  const glow = ctx.createRadialGradient(W / 2, H * 0.42, 40, W / 2, H * 0.42, 520);
  glow.addColorStop(0, 'rgba(0,242,254,0.16)');
  glow.addColorStop(1, 'rgba(0,242,254,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.textAlign = 'center';

  // Wordmark JURIR
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 64px sans-serif';
  ctx.fillText('JUR', W / 2 - 60, 200);
  ctx.fillStyle = '#00f2fe';
  ctx.font = 'italic 700 64px sans-serif';
  ctx.fillText('IR', W / 2 + 70, 200);

  ctx.font = '400 26px monospace';
  ctx.fillStyle = 'rgba(226,232,240,0.6)';
  ctx.fillText('I N T E L I G Ê N C I A   J U R Í D I C A   P O R   I A', W / 2, 250);

  // Score
  if (score != null) {
    ctx.font = '700 340px sans-serif';
    ctx.fillStyle = '#00f2fe';
    ctx.shadowColor = 'rgba(0,242,254,0.5)';
    ctx.shadowBlur = 60;
    ctx.fillText(String(score), W / 2, H * 0.52);
    ctx.shadowBlur = 0;

    ctx.font = '700 42px monospace';
    ctx.fillStyle = 'rgba(226,232,240,0.85)';
    ctx.fillText((scoreLabel || '').toUpperCase(), W / 2, H * 0.52 + 70);
  }

  // Frase-resumo do veredito
  if (verdictLine) {
    ctx.font = '400 40px serif';
    ctx.fillStyle = '#e2e8f0';
    const lines = wrapText(ctx, verdictLine, W - 160);
    let y = H * 0.68;
    for (const line of lines.slice(0, 4)) {
      ctx.fillText(line, W / 2, y);
      y += 56;
    }
  }

  // CTA rodapé
  ctx.font = '700 34px monospace';
  ctx.fillStyle = '#00f2fe';
  ctx.fillText('Descubra seu caso grátis → jurir.com', W / 2, H - 100);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
}

// Extrai a primeira frase "forte" do veredito (markdown limpo) pra caber no card.
export function extractHeadline(text) {
  if (!text) return '';
  const clean = text.replace(/[#*`_>-]/g, '').trim();
  const firstSentence = clean.split(/(?<=[.!?])\s/)[0] || clean;
  return firstSentence.length > 140 ? firstSentence.slice(0, 140) + '…' : firstSentence;
}
