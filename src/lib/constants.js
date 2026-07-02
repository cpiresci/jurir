export const JURIR_VERSION = 'v10.1-modular';
export const API_BASE = 'https://jurir-app-y4gz.onrender.com';

// [bloco6-auth] Client ID do Google Identity Services (Google Cloud
// Console → Credentials → OAuth Client ID → "Web application"). Mesmo
// valor configurado no backend (GOOGLE_CLIENT_ID no Render). Preencher
// antes de deploy — com vazio o botão de login Google fica escondido.
export const GOOGLE_CLIENT_ID = '756753365440-9hbqhbr2cgdjjqdelib7etca5eajkt32.apps.googleusercontent.com';

export const AGENT_AREAS = [
  { id: 'civil',          area: 'Direito Civil',            icon: '⚖️' },
  { id: 'penal',          area: 'Direito Penal',            icon: '🔒' },
  { id: 'trabalhista',    area: 'Direito Trabalhista',       icon: '👷' },
  { id: 'familia',        area: 'Direito de Família',        icon: '👨‍👩‍👧' },
  { id: 'consumidor',     area: 'Direito do Consumidor',     icon: '🛒' },
  { id: 'tributario',     area: 'Direito Tributário',        icon: '💰' },
  { id: 'empresarial',    area: 'Direito Empresarial',       icon: '🏢' },
  { id: 'imobiliario',    area: 'Direito Imobiliário',       icon: '🏠' },
  { id: 'digital',        area: 'Direito Digital',           icon: '💻' },
  { id: 'previdenciario', area: 'Direito Previdenciário',    icon: '🏥' },
  { id: 'ambiental',      area: 'Direito Ambiental',         icon: '🌿' },
  { id: 'constitucional', area: 'Direito Constitucional',    icon: '📜' },
  { id: 'saude',          area: 'Direito à Saúde',           icon: '❤️' },
  { id: 'internacional',  area: 'Direito Internacional',     icon: '🌐' },
  { id: 'eleitoral',      area: 'Direito Eleitoral',         icon: '🗳️' },
  { id: 'agrario',        area: 'Direito Agrário',           icon: '🌾' },
];
