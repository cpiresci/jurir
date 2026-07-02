import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { POSTS } from '../lib/blogPosts';

// [bloco10-blog] Índice estático — sem CMS, sem backend novo. Os posts
// vivem em content/blog/*.md e o manifesto (título/resumo/data) em
// src/lib/blogPosts.js, pra listar sem precisar buscar todo markdown.
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
          <Link key={post.slug} to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
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
          </Link>
        ))}
      </div>
    </div>
  );
}
