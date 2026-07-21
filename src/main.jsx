import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// [seo-blog-index-fix] dist/blog/index.html (gerado por
// prerender-blog-og.js) inclui um bloco estático com <a href> reais pros
// posts, fora de #root, pra crawlers que não executam JS ainda conseguirem
// achar e seguir os links. Assim que a SPA monta de verdade, esse bloco vira
// conteúdo duplicado na tela — remove aqui, antes do primeiro render.
document.getElementById('prerendered-blog-list')?.remove();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
