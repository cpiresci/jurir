#!/usr/bin/env node
// scripts/prerender-blog-og.js
//
// [prerender-blog-og] Roda DEPOIS do `vite build`. Gera um arquivo estático
// dist/blog/<slug>/index.html por post, com <title>/og:*/twitter:* corretos
// pra cada post — necessário porque BlogPost.jsx só troca esses valores via
// JS (useEffect), e crawlers de preview de link (WhatsApp, Telegram,
// Facebook, LinkedIn) NÃO executam JS, então sempre pegavam o card genérico
// da home ao compartilhar um post específico.
//
// Não migra pra BrowserRouter nem mexe no roteamento real do app (HashRouter
// continua exatamente como está — decisão já tomada de não migrar agora,
// ver comentário em public/sitemap.xml). O usuário real que abrir uma dessas
// URLs estáticas (https://jurir.com/blog/<slug>/) ganha um pequeno script
// síncrono no <head> que seta o hash certo (#/blog/<slug>) ANTES do React
// montar — o HashRouter já nasce na rota certa, sem redirect visível, sem
// flash, sem segunda requisição de rede. O bundle JS é o mesmo de sempre
// (mesmo dist/index.html só com meta tags trocadas), então zero risco de
// quebrar a SPA.
//
// GitHub Pages serve esses arquivos por caminho real automaticamente (não
// precisa de rewrite/servidor) — só precisa existir o arquivo no dist/.
//
// Idempotente: pode rodar quantas vezes quiser, sempre sobrescreve do zero
// a partir do dist/index.html mais recente.
//
// Uso: `node scripts/prerender-blog-og.js` (chamado automaticamente pelo
// `npm run build`, não precisa rodar à mão).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SITE = 'https://jurir.com';

// [seo-jsonld-article] blogPosts.js usa datas tipo "28 jun 2026" (pt-BR,
// mês abreviado) — Article/datePublished do schema.org exige ISO 8601.
const PT_MONTHS = {
  jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
  jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12',
};
function parsePtDateToIso(dateStr) {
  const m = String(dateStr || '').trim().match(/^(\d{1,2})\s+([a-zç]+)\s+(\d{4})$/i);
  if (!m) return null;
  const [, day, monRaw, year] = m;
  const mon = PT_MONTHS[monRaw.toLowerCase()];
  if (!mon) return null;
  return `${year}-${mon}-${day.padStart(2, '0')}`;
}

async function main() {
  const baseHtmlPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(baseHtmlPath)) {
    console.error('FAIL [prerender-blog-og]: dist/index.html não existe — rode "vite build" antes deste script.');
    process.exit(1);
  }

  const { POSTS } = await import(path.join(ROOT, 'src/lib/blogPosts.js'));
  if (!Array.isArray(POSTS) || POSTS.length === 0) {
    console.log('SKIP [prerender-blog-og]: nenhum post encontrado em src/lib/blogPosts.js');
    return;
  }

  const baseHtml = fs.readFileSync(baseHtmlPath, 'utf-8');

  const REQUIRED_TAGS = [
    /<title>.*?<\/title>/,
    /<meta name="description" content=".*?"\s*\/>/,
    /<link rel="canonical" href=".*?"\s*\/>/,
    /<meta property="og:title" content=".*?"\s*\/>/,
    /<meta property="og:description" content=".*?"\s*\/>/,
    /<meta property="og:url" content=".*?"\s*\/>/,
    /<meta name="twitter:title" content=".*?"\s*\/>/,
    /<meta name="twitter:description" content=".*?"\s*\/>/,
  ];
  for (const re of REQUIRED_TAGS) {
    if (!re.test(baseHtml)) {
      console.error(`FAIL [prerender-blog-og]: tag esperada não encontrada em dist/index.html (padrão: ${re}) — index.html pode ter mudado, revisar à mão.`);
      process.exit(1);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildPostHtml(post) {
    const title = escapeHtml(`${post.title} · JURIR Blog`);
    const desc = escapeHtml(post.excerpt);
    const url = `${SITE}/blog/${post.slug}/`;

    let html = baseHtml;
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    html = html.replace(/<meta name="description" content=".*?"\s*\/>/, `<meta name="description" content="${desc}" />`);
    html = html.replace(/<link rel="canonical" href=".*?"\s*\/>/, `<link rel="canonical" href="${url}" />`);
    html = html.replace(/<meta property="og:title" content=".*?"\s*\/>/, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?"\s*\/>/, `<meta property="og:description" content="${desc}" />`);
    html = html.replace(/<meta property="og:url" content=".*?"\s*\/>/, `<meta property="og:url" content="${url}" />`);
    html = html.replace(/<meta name="twitter:title" content=".*?"\s*\/>/, `<meta name="twitter:title" content="${title}" />`);
    html = html.replace(/<meta name="twitter:description" content=".*?"\s*\/>/, `<meta name="twitter:description" content="${desc}" />`);

    // [seo-jsonld-article] Article JSON-LD por post — headline/descrição sem
    // o sufixo "· JURIR Blog" (esse é só pro <title> da aba). datePublished
    // fica de fora do objeto se a data em blogPosts.js não bater no formato
    // esperado, em vez de gerar um ISO inválido.
    const isoDate = parsePtDateToIso(post.date);
    const articleLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt,
      ...(isoDate ? { datePublished: isoDate } : {}),
      author: { '@type': 'Organization', name: 'JURIR' },
      publisher: { '@type': 'Organization', name: 'JURIR', logo: { '@type': 'ImageObject', url: `${SITE}/og-image.png` } },
      mainEntityOfPage: url,
      ...(post.area ? { articleSection: post.area } : {}),
    };
    const articleLdScript = `<script type="application/ld+json">${JSON.stringify(articleLd)}</script>\n`;
    html = html.replace('</head>', `${articleLdScript}  </head>`);

    // [prerender-blog-redirect] Síncrono, no <head>, roda antes do script
    // type="module" (deferred) que monta o React — garante hash certo já
    // na primeira pintura, sem flash de home.
    const hashScript = `<script>if (!location.hash) { location.hash = '#/blog/${post.slug}'; }</script>\n`;
    html = html.replace('</head>', `${hashScript}  </head>`);

    return html;
  }

  let count = 0;
  for (const post of POSTS) {
    if (!post.slug || !post.title || !post.excerpt) {
      console.error(`FAIL [prerender-blog-og]: post sem slug/title/excerpt — ${JSON.stringify(post)}`);
      process.exit(1);
    }
    const outDir = path.join(DIST, 'blog', post.slug);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), buildPostHtml(post), 'utf-8');
    count++;
  }

  console.log(`OK [prerender-blog-og]: ${count} página(s) estática(s) geradas em dist/blog/<slug>/index.html`);
}

main();
