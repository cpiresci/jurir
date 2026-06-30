# Jurir — Frontend

Interface web do Jurir, plataforma de análise jurídica por IA (16 agentes especializados + Juiz IA + Advogado do Diabo), construída em React + Vite, com app mobile via Capacitor.

## Stack

- **React** + **Vite** (build e dev server)
- **Capacitor** — empacota o frontend como app Android nativo (pasta `android/`)
- Design system próprio "Obsidian Quantum" (`src/index.css`) — void dark + cyan quantum, tipografia Cormorant Garamond / Syne / DM Mono
- SSE (Server-Sent Events) para streaming da análise em tempo real (`src/hooks/useSSEAnalysis.js`)

## Setup local

```bash
npm install
npm run dev          # servidor de desenvolvimento (Vite)
npm run build         # build de produção em /dist
npm run preview        # serve o build de produção localmente
```

## Deploy

O deploy de produção é feito via GitHub Pages:

```bash
npm run deploy        # build + publica /dist no branch gh-pages
```

## Variáveis de ambiente

O frontend consome a API do backend (`jurir-app`, repo separado) via `src/lib/api.js`. A URL base da API é configurada nesse arquivo — não há `.env` no frontend hoje.

## Estrutura

```
src/
  components/    # componentes reutilizáveis (Hero, Pricing, AuthModal, AnalysisPanel, VerdictSection...)
  pages/         # uma página por rota (Home, Conta, Documentos, Delta, Escritorio, Admin...)
  hooks/         # hooks customizados (useSSEAnalysis)
  lib/           # cliente de API e constantes
  store/         # estado global
  index.css      # design system (cores, tipografia, componentes base)
```

## CI

Todo push/PR para `main` roda `npm run build` automaticamente via GitHub Actions (`.github/workflows/ci.yml`) — qualquer erro de import/sintaxe quebra o build antes de chegar em produção.

## Convenções de tipografia (design system)

- Cores de texto: sempre usar os tokens `var(--t0)` a `var(--t5)` (nunca `rgba(255,255,255,...)` hardcoded) — a escala já está calibrada para WCAG AA (4.5:1+) sobre o fundo `--void`.
- Tamanho mínimo de fonte: `12px` (`.75rem`) em qualquer elemento, sem exceção.
- H1 de página interna (dashboard): `clamp(1.75rem, 4vw, 2.25rem)`, peso 700. Apenas um H1 por página, sem pular nível de heading (H1 → H2 → H3).
