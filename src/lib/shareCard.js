// shareCard.js — Gera um card compartilhável (formato story 9:16, 1080x1920)
// com o JURIR Score e um resumo do veredicto, pensado pra print/compartilhamento
// social (Instagram Stories, WhatsApp Status). Desenho puro em <canvas>,
// sem dependência externa nova — mantém o bundle leve.

const CY = '#00f2fe';   // ciano principal (identidade Jurir)
const CY2 = '#4facfe';  // ciano secundário
const INK = '#e2e8f0';  // texto claro
const DIM = 'rgba(226,232,240,0.55)'; // texto secundário

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

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

// Moldura de cantos estilo "scan" — reforça a sensação de análise por IA.
function drawCornerFrame(ctx, W, H, m) {
  const len = 46, r = 18;
  ctx.strokeStyle = 'rgba(0,242,254,0.55)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const corners = [
    [m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x + dx * len, y);
    ctx.arcTo(x, y, x, y + dy * r, r);
    ctx.lineTo(x, y + dy * len);
    ctx.stroke();
  }
}

// Anel de progresso do score (0-100), com número grande no centro.
function drawScoreRing(ctx, cx, cy, radius, score, scoreLabel) {
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const start = -Math.PI / 2;
  const end = start + pct * Math.PI * 2;

  ctx.lineWidth = 22;
  ctx.lineCap = 'round';

  ctx.strokeStyle = 'rgba(0,242,254,0.12)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  const grad = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
  grad.addColorStop(0, CY);
  grad.addColorStop(1, CY2);
  ctx.strokeStyle = grad;
  ctx.shadowColor = 'rgba(0,242,254,0.55)';
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 128px sans-serif';
  ctx.fillText(String(score), cx, cy + 42);

  ctx.font = '700 26px monospace';
  ctx.fillStyle = DIM;
  ctx.fillText('/ 100', cx, cy + 82);

  if (scoreLabel) {
    ctx.font = '700 30px monospace';
    ctx.fillStyle = CY;
    ctx.fillText(scoreLabel.toUpperCase(), cx, cy + radius + 56);
  }
}

// Grafo estilizado representando o "conselho de agentes" do swarm.
function drawAgentNetwork(ctx, cx, cy, w) {
  const nodes = [];
  const cols = 5, rows = 3;
  for (let i = 0; i < 13; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = cx - w / 2 + col * (w / (cols - 1)) + (row % 2 === 0 ? 0 : w / (cols - 1) / 2.4);
    const y = cy - 60 + row * 60 + (Math.sin(i * 1.7) * 10);
    nodes.push([x, y]);
  }

  ctx.strokeStyle = 'rgba(0,242,254,0.28)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      if (Math.random() > 0.72) {
        ctx.beginPath();
        ctx.moveTo(nodes[i][0], nodes[i][1]);
        ctx.lineTo(nodes[j][0], nodes[j][1]);
        ctx.stroke();
      }
    }
  }

  for (const [x, y] of nodes) {
    ctx.beginPath();
    ctx.fillStyle = CY;
    ctx.shadowColor = 'rgba(0,242,254,0.7)';
    ctx.shadowBlur = 10;
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// Caixa numerada de "diagnóstico" — mesmo padrão visual de relatórios
// executivos, reaproveitado pro resumo do veredito.
function drawDiagnosticBox(ctx, x, y, w, num, label, lines, accent = CY) {
  const lineH = 40;
  const h = 74 + lines.length * lineH;

  ctx.strokeStyle = 'rgba(0,242,254,0.18)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, w, h, 16);
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 14);
  ctx.lineTo(x + 14, y + h - 14);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = '700 24px monospace';
  ctx.fillStyle = 'rgba(0,242,254,0.55)';
  ctx.fillText(num, x + 34, y + 40);

  ctx.font = 'italic 400 22px serif';
  ctx.fillStyle = DIM;
  ctx.fillText(label, x + 90, y + 40);

  ctx.font = '400 30px sans-serif';
  ctx.fillStyle = INK;
  let ly = y + 78;
  for (const line of lines) {
    ctx.fillText(line, x + 34, ly);
    ly += lineH;
  }

  return h;
}

export async function generateShareCardBlob({ score, scoreLabel, verdictLine, agentCount = 16, citations = [] }) {
  const W = 1080, H = 1920;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Fundo
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#050507');
  bg.addColorStop(1, '#0a0e1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, H * 0.34, 40, W / 2, H * 0.34, 620);
  glow.addColorStop(0, 'rgba(0,242,254,0.14)');
  glow.addColorStop(1, 'rgba(0,242,254,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  drawCornerFrame(ctx, W, H, 46);

  // ── Header ────────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.font = '400 22px monospace';
  ctx.fillStyle = 'rgba(0,242,254,0.65)';
  ctx.fillText('A N Á L I S E   J U R Í D I C A   P O R   I A', W / 2, 150);

  ctx.font = '700 96px sans-serif';
  const jurWidth = ctx.measureText('JUR').width;
  ctx.font = 'italic 700 96px sans-serif';
  const irWidth = ctx.measureText('IR').width;
  const wordmarkGap = 6;
  const wordmarkStart = W / 2 - (jurWidth + wordmarkGap + irWidth) / 2;

  ctx.textAlign = 'left';
  ctx.font = '700 96px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('JUR', wordmarkStart, 250);
  ctx.fillStyle = CY;
  ctx.font = 'italic 700 96px sans-serif';
  ctx.fillText('IR', wordmarkStart + jurWidth + wordmarkGap, 250);
  ctx.textAlign = 'center';

  ctx.font = '400 24px monospace';
  ctx.fillStyle = DIM;
  ctx.fillText('I N T E L I G Ê N C I A   J U R Í D I C A   P O R   I A', W / 2, 300);

  // ── Anel de score + rede de agentes ──────────────────────────────
  const midY = 560;
  if (score != null) {
    drawScoreRing(ctx, W / 2 - 210, midY, 155, Math.round(score), scoreLabel);
  }
  ctx.textAlign = 'center';
  ctx.font = '700 22px monospace';
  ctx.fillStyle = CY;
  ctx.fillText('CONSELHO DE AGENTES', W / 2 + 220, midY - 165);
  drawAgentNetwork(ctx, W / 2 + 220, midY - 40, 260);
  ctx.font = '700 60px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(String(agentCount), W / 2 + 220, midY + 130);
  ctx.font = '700 20px monospace';
  ctx.fillStyle = DIM;
  ctx.fillText('AGENTES ESPECIALISTAS', W / 2 + 220, midY + 162);

  // ── Diagnóstico executivo ────────────────────────────────────────
  let y = midY + 260;
  ctx.textAlign = 'left';
  ctx.font = '700 26px monospace';
  ctx.fillStyle = CY;
  ctx.fillText('DIAGNÓSTICO EXECUTIVO', 90, y);
  ctx.strokeStyle = 'rgba(0,242,254,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(90, y + 18);
  ctx.lineTo(W - 90, y + 18);
  ctx.stroke();
  y += 60;

  const boxW = W - 180;

  ctx.font = '400 30px sans-serif';
  const verdictLines = verdictLine
    ? wrapText(ctx, verdictLine, boxW - 130).slice(0, 4)
    : ['Análise concluída pelo conselho de agentes.'];
  const h1 = drawDiagnosticBox(ctx, 90, y, boxW, '01', 'MÓDULO "VEREDITO"', verdictLines);
  y += h1 + 24;

  const h2 = drawDiagnosticBox(
    ctx, 90, y, boxW, '02', 'MÓDULO "CONTRADITÓRIO"',
    [`${agentCount} especialistas + Advogado do Diabo + Juiz IA`, 'garantindo análise imparcial e fundamentada.'],
    CY2
  );
  y += h2 + 24;

  if (citations && citations.length) {
    const maxShown = 6;
    const shown = citations.slice(0, maxShown);
    const extra = citations.length - shown.length;
    const citationsText = shown.join('   ·   ') + (extra > 0 ? `   +${extra}` : '');
    ctx.font = '400 30px sans-serif';
    const citationLines = wrapText(ctx, citationsText, boxW - 130).slice(0, 3);
    const h3 = drawDiagnosticBox(ctx, 90, y, boxW, '03', 'MÓDULO "FONTES CITADAS"', citationLines, '#fbbf24');
    y += h3 + 40;
  } else {
    y += 16;
  }

  // ── CTA final ─────────────────────────────────────────────────────
  const ctaH = 220;
  ctx.strokeStyle = 'rgba(0,242,254,0.3)';
  ctx.lineWidth = 2;
  roundRect(ctx, 90, y, boxW, ctaH, 18);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = '400 26px sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText('Descubra o SEU JURIR Score', W / 2, y + 60);
  ctx.font = '700 26px sans-serif';
  ctx.fillStyle = CY;
  ctx.fillText('gratuitamente agora mesmo:', W / 2, y + 100);

  ctx.font = '700 56px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('JURIR.COM', W / 2, y + 170);

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));
}

// Detecta linhas de metadado estruturado (ex: "PROBABILIDADE DE ÊXITO: 80%",
// "NÍVEL DE URGÊNCIA: Alta") — quase todo em maiúsculas, típico de cabeçalho
// técnico do veredito, não de prosa real. Frase em português corrido tem
// proporção baixa de letras maiúsculas.
function isProseLine(str) {
  const letters = str.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letters.length < 15) return false;
  const upper = (str.match(/[A-ZÀ-Ú]/g) || []).length;
  return upper / letters.length < 0.5;
}

// Detecta se a frase começa no meio de um item de lista numerada
// (ex: "3º) e da dispensa...", "2) além disso...", "II - também...") —
// sinal de que o corte de sentença caiu dentro de uma enumeração, não
// no início de uma frase de verdade.
function looksLikeListItem(str) {
  return /^\s*(\d+|[IVXLCDM]+)\s*[ºª]?\s*[).:-]/i.test(str);
}

// Extrai a primeira frase "forte" e em prosa real do veredito (markdown
// limpo) pra caber no card — pulando linhas de metadado estruturado
// (probabilidade, urgência, etc.) até achar uma frase de verdade.
// Detecta linha inteira que é cabeçalho de seção, régua markdown (---, ___,
// ***) ou metadado estruturado do veredito — mesmo quando o cabeçalho está
// em Title Case (ex: "Veredito Final — Formato Obrigatório:") e passaria
// despercebido pela checagem de maiúsculas sozinha.
function isHeadingOrMetaLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (/^[-_*=]{3,}$/.test(trimmed)) return true;               // régua markdown isolada
  if (/^-{3,}/.test(trimmed) || /-{3,}$/.test(trimmed)) return true; // régua colada ao início/fim da linha
  if (/:\s*$/.test(trimmed) && trimmed.length < 90) return true; // linha curta terminando em ":" = cabeçalho de seção
  if (/PROBABILIDADE DE ÊXITO|NÍVEL DE URGÊNCIA|VEREDITO FINAL/i.test(trimmed)) return true;
  return false;
}

export function extractHeadline(text) {
  if (!text) return '';
  const clean = text
    .replace(/^[ \t]*[-*]\s+/gm, '') // remove marcadores de lista markdown ("- " ou "* " no início da linha)
    .replace(/[#*`_>]/g, '')          // remove símbolos de markdown restantes, preservando hífens internos (ex: "recomenda-se")
    .trim();

  // Filtra linha a linha ANTES de juntar em frases — cabeçalhos e réguas
  // markdown sem ponto final grudariam no próximo trecho de prosa real.
  const lines = clean.split(/\n+/).map(l => l.trim()).filter(l => l && !isHeadingOrMetaLine(l));
  const joined = lines.length ? lines.join(' ') : clean;

  const sentences = joined.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);

  const candidate = sentences.find(s => isProseLine(s) && !looksLikeListItem(s) && !/-{3,}/.test(s) && s.length > 25)
    || sentences[0] || clean;
  return candidate.length > 140 ? candidate.slice(0, 140) + '…' : candidate;
}
