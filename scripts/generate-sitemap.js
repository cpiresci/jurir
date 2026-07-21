#!/usr/bin/env node
// scripts/generate-sitemap.js
//
// [seo-sitemap-autogen] public/sitemap.xml era editado à mão a cada post
// novo (ver comentário antigo "Atualizar manualmente ao adicionar posts
// novos") — fonte de erro humano: divergência entre o slug em blogPosts.js
// e o nome do arquivo em content/blog/*.md, URLs de fragmento (#/blog)
// coladas junto com URLs reais, ou entradas esquecidas depois de remover um
// post. Esse script substitui a edição manual: lê blogPosts.js como única
// fonte de verdade, valida cada slug contra o markdown correspondente, e
// escreve dist/sitemap.xml (sobrescrevendo a cópia estática de public/) já
// com <lastmod> real (derivado de post.date) e só URLs reais e rastreáveis
// — nunca fragmentos "#/...".
//
// Roda depois do prerender-blog-og.js (que já gera as páginas em si) —
// ver package.json: "build": "vite build && node scripts/prerender-blog-og.js && node scripts/generate-sitemap.js"

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT_BLOG_DIR = path.join(ROOT, 'content', 'blog');
const SITE = 'https://jurir.com';

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

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
  return `${year}-${mon}-${day.padStart(2, '0')}`; // <lastmod> aceita AAAA-MM-DD puro
}

async function main() {
  const { POSTS } = await import(path.join(ROOT, 'src/lib/blogPosts.js'));
  if (!Array.isArray(POSTS)) {
    console.error('FAIL [generate-sitemap]: POSTS não é um array em src/lib/blogPosts.js');
    process.exit(1);
  }

  // [seo-sitemap-slug-guard] Pega exatamente a classe de erro que motivou
  // esse script: slug em blogPosts.js sem o .md correspondente em
  // content/blog/ (typo de digitação, arquivo renomeado só de um lado etc).
  // Falha o build em vez de publicar um sitemap com URL morta.
  const errors = [];
  for (const post of POSTS) {
    if (!SLUG_RE.test(post.slug || '')) {
      errors.push(`slug inválido "${post.slug}" — use apenas minúsculas, números e hífen`);
      continue;
    }
    const mdPath = path.join(CONTENT_BLOG_DIR, `${post.slug}.md`);
    if (!fs.existsSync(mdPath)) {
      errors.push(`slug "${post.slug}" (em blogPosts.js) não tem arquivo correspondente em content/blog/${post.slug}.md`);
    }
    if (!parsePtDateToIso(post.date)) {
      errors.push(`post "${post.slug}" com data em formato inesperado: "${post.date}" (esperado "DD mmm AAAA", ex. "07 jul 2026")`);
    }
  }
  if (errors.length > 0) {
    console.error('FAIL [generate-sitemap]: divergências encontradas antes de gerar o sitemap:');
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SITE}/`, lastmod: today, changefreq: 'weekly', priority: '1.0' },
    // [seo-fragment-removed] "https://jurir.com/#/blog" saiu daqui —
    // fragmento não é URL rastreável, o Google descarta tudo depois do "#"
    // e tratava essa entrada como duplicata da home ("detectada, mas não
    // indexada" no Search Console). A listagem agora tem gêmeo estático
    // real em /blog/ (gerado por prerender-blog-og.js), é essa URL real
    // que entra no sitemap.
    { loc: `${SITE}/blog/`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
    ...POSTS.map(post => ({
      loc: `${SITE}/blog/${post.slug}/`,
      lastmod: parsePtDateToIso(post.date),
      changefreq: 'monthly',
      priority: '0.7',
    })),
  ];

  const body = urls.map(u => (
    `  <url>\n` +
    `    <loc>${u.loc}</loc>\n` +
    `    <lastmod>${u.lastmod}</lastmod>\n` +
    `    <changefreq>${u.changefreq}</changefreq>\n` +
    `    <priority>${u.priority}</priority>\n` +
    `  </url>`
  )).join('\n');

  const xml =
`<?xml version="1.0" encoding="UTF-8"?>
<!--
  Gerado automaticamente por scripts/generate-sitemap.js a partir de
  src/lib/blogPosts.js — não editar à mão, as mudanças são sobrescritas no
  próximo build. Pra adicionar/remover um post, mexa em blogPosts.js (e no
  .md correspondente em content/blog/) e rode "npm run build".
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), xml, 'utf-8');
  console.log(`OK [generate-sitemap]: dist/sitemap.xml gerado com ${urls.length} URL(s), 0 fragmentos, 0 divergências.`);
}

main();
