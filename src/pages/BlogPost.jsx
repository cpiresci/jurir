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
        <Link to="/blog" className="btn btn-ghost" style={{ marginTop: 16, display: 'inline-flex' }}>Voltar pro blog</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '100px 24px 60px' }}>
      <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--p4)',
        fontSize: 'var(--fs-sm)', textDecoration: 'none', marginBottom: 24 }}>
        <ArrowLeft size={14} /> Voltar pro blog
      </Link>

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
        <Link to="/" className="btn btn-cobalt">Analisar meu caso grátis</Link>
      </div>
    </div>
  );
}
