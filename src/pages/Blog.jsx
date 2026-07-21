import { useEffect } from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { POSTS } from '../lib/blogPosts';

// [bloco10-blog] Índice estático — sem CMS, sem backend novo. Os posts
// vivem em content/blog/*.md e o manifesto (título/resumo/data) em
// src/lib/blogPosts.js, pra listar sem precisar buscar todo markdown.
//
// [seo-real-links-fix] Antes usava <Link to="/blog/slug"> do react-router,
// que sob HashRouter renderiza href="#/blog/slug" — um fragmento da MESMA
// página pro Googlebot, não uma página nova. Como scripts/prerender-blog-og.js
// já gera um HTML real em dist/blog/<slug>/index.html pra cada post, agora
// linkamos direto pra esse caminho real com <a href> puro. O clique ainda
// funciona perfeitamente para o usuário (navegação de página completa pro
// HTML pré-renderizado, que já nasce na hash certa — ver comentário em
// prerender-blog-og.js) — só troca uma transição de SPA por uma navegação
// de página, o que é a única forma de o Google seguir o link e repassar
// relevância pra URL estática real.
export default function BlogPage() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Blog Jurídico · JURIR';
    return () => { document.title = prevTitle; };
  }, []);

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '100px 24px 60px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ridge)', border: '1px solid var(--b-cobalt)', borderRadius: 'var(--r-pill)',
          padding: '5px 14px', fontSize: 'var(--fs-xs)', color: 'var(--cy1)', fontFamily: 'var(--f-mono)',
          letterSpacing: '.1em', marginBottom: 16 }}>
          <BookOpen size={11} /> BLOG JURÍDICO
        </div>
        <h1 className="t-display" style={{ fontSize: 'clamp(1.75rem,4vw,2.25rem)', fontWeight: 700, marginBottom: 8 }}>
          Dúvidas jurídicas comuns, explicadas
        </h1>
        <p style={{ color: 'var(--p4)', fontSize: 'var(--fs-base)' }}>
          Conteúdo escrito pelos mesmos especialistas que analisam seu caso na Jurir.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {POSTS.map(post => (
          <a key={post.slug} href={`/blog/${post.slug}/`} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--b-neutral)', borderRadius: 'var(--r-xl)',
              padding: 24, transition: 'border-color .15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--b-cobalt)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--b-neutral)'}>
              <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--p5)', fontFamily: 'var(--f-mono)', marginBottom: 8 }}>
                {post.area} · {post.date}
              </div>
              <h2 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: 'var(--p1)', marginBottom: 8 }}>{post.title}</h2>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--p4)', lineHeight: 1.6, marginBottom: 12 }}>{post.excerpt}</p>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 'var(--fs-sm)', color: 'var(--cy1)' }}>
                Ler mais <ArrowRight size={13} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
