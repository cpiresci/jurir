import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { POSTS } from '../lib/blogPosts';

// [bloco10-blog] Renderiza o markdown estático de content/blog/{slug}.md.
// Vite importa via ?raw (string crua, sem bundler de markdown) — leve,
// sem CMS, compatível com GitHub Pages (build 100% estático).
const mdModules = import.meta.glob('../../content/blog/*.md', { query: '?raw', import: 'default', eager: true });

function loadMarkdown(slug) {
  const entry = Object.entries(mdModules).find(([path]) => path.endsWith(`/${slug}.md`));
  return entry ? entry[1] : null;
}

// [bloco10-blog] title/meta description por post — sem lib nova (react-helmet
// etc). Cada post troca o <title> e a meta description ao montar, e devolve
// pro padrão do site ao desmontar. Importa pra SEO (Google indexando cada
// post com seu próprio título) e pra preview ao compartilhar (WhatsApp etc).
const DEFAULT_TITLE = 'JURIR — Inteligência Jurídica por IA';
const DEFAULT_DESCRIPTION = 'JURIR — Inteligência Jurídica por IA. 16 agentes de IA especializados analisam seu caso em paralelo.';

function useDocumentMeta(meta) {
  useEffect(() => {
    if (!meta) return;
    const prevTitle = document.title;
    let metaTag = document.querySelector('meta[name="description"]');
    const prevDescription = metaTag ? metaTag.getAttribute('content') : null;
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'description');
      document.head.appendChild(metaTag);
    }
    document.title = `${meta.title} · JURIR Blog`;
    metaTag.setAttribute('content', meta.excerpt);
    return () => {
      document.title = prevTitle || DEFAULT_TITLE;
      metaTag.setAttribute('content', prevDescription || DEFAULT_DESCRIPTION);
    };
  }, [meta]);
}

// [seo-related-posts] Até 3 posts relacionados (mesma área primeiro, resto
// completa) linkados com <a href> real pro caminho estático /blog/<slug>/ —
// mesma razão do fix em Blog.jsx: sob HashRouter, <Link to> vira um
// fragmento "#/..." que o Googlebot não segue como página nova. Isso também
// resolve o problema de cada post só ter UM link de saída ("voltar pro
// blog") — um grafo de links interno raso é um dos motivos mais comuns de
// "rastreada, mas não indexada" em sites novos.
function getRelatedPosts(current, count = 3) {
  const sameArea = POSTS.filter(p => p.slug !== current.slug && p.area === current.area);
  const rest = POSTS.filter(p => p.slug !== current.slug && p.area !== current.area);
  return [...sameArea, ...rest].slice(0, count);
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [content, setContent] = useState(null);
  const meta = POSTS.find(p => p.slug === slug);
  useDocumentMeta(meta);

  useEffect(() => {
    setContent(loadMarkdown(slug));
    window.scrollTo(0, 0);
  }, [slug]);

  if (!meta) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '140px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--p4)' }}>Post não encontrado.</p>
        <a href="/blog/" className="btn btn-ghost" style={{ marginTop: 16, display: 'inline-flex' }}>Voltar pro blog</a>
      </div>
    );
  }

  const related = getRelatedPosts(meta);

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '100px 24px 60px' }}>
      <a href="/blog/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--p4)',
        fontSize: 'var(--fs-sm)', textDecoration: 'none', marginBottom: 24 }}>
        <ArrowLeft size={14} /> Voltar pro blog
      </a>

      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>
        {meta.area} · {meta.date}
      </div>
      <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700, marginBottom: 24, lineHeight: 1.2 }}>
        {meta.title}
      </h1>

      <div className="blog-content" style={{ color: 'var(--p2)', fontSize: 'var(--fs-base)', lineHeight: 1.75 }}>
        {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p style={{ color: 'var(--p5)' }}>Carregando…</p>}
      </div>

      <div style={{ marginTop: 48, padding: 28, background: 'var(--surface)', border: '1px solid var(--b-cobalt)',
        borderRadius: 'var(--r-xl)', textAlign: 'center' }}>
        <Sparkles size={22} style={{ color: 'var(--cy1)', marginBottom: 10 }} />
        <p style={{ fontSize: 'var(--fs-base)', color: 'var(--p1)', fontWeight: 600, marginBottom: 6 }}>
          Tem uma dúvida parecida no seu caso?
        </p>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--p4)', marginBottom: 16 }}>
          Analise seu processo ou situação gratuitamente com os agentes especialistas da Jurir.
        </p>
        {/* [blog-cta-per-tool] CTA aponta pra ferramenta grátis específica do
            tema quando o post define ctaTo/ctaLabel (ex.: posts trabalhistas
            → calculadora em /trabalhista), em vez de mandar todo mundo pra
            análise completa (alta fricção). Sem ctaTo definido, cai no
            comportamento antigo (link pra "/"). Fica como <Link> (rota só de
            app, sem gêmea estática) — não precisa de <a> real. */}
        <Link to={meta.ctaTo || '/'} className="btn btn-cobalt">
          {meta.ctaLabel || 'Analisar meu caso grátis'}
        </Link>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontSize: 'var(--fs-base)', fontWeight: 700, color: 'var(--p1)', marginBottom: 16 }}>
            Leia também
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {related.map(post => (
              <a key={post.slug} href={`/blog/${post.slug}/`} style={{ textDecoration: 'none', color: 'var(--cy1)',
                fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                {post.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
