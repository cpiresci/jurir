import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import PAGE_TITLES from './lib/pageTitles';
import Navbar from './components/Navbar';
import Background from './components/Background';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import HomePage from './pages/Home';
import { useStore } from './store';

// [code-splitting]
const HistoricoPage = lazy(() => import('./pages/Historico'));
const DeltaPage = lazy(() => import('./pages/Delta'));
const DocumentosPage = lazy(() => import('./pages/Documentos'));
const PeticoesPage = lazy(() => import('./pages/Peticoes'));
const SimuladorPage = lazy(() => import('./pages/Simulador'));
const MonitoramentoPage = lazy(() => import('./pages/Monitoramento'));
const VerificarPage = lazy(() => import('./pages/Verificar'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));
const PrivacidadePage = lazy(() => import('./pages/PrivacidadePage'));
const TermosPage = lazy(() => import('./pages/TermosPage'));
const AdminPage = lazy(() => import('./pages/Admin'));
const EscritorioPage = lazy(() => import('./pages/Escritorio'));
const ApiPanelPage = lazy(() => import('./pages/ApiPanel'));
const AceitarConvitePage = lazy(() => import('./pages/AceitarConvite'));
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccess'));
const CheckoutCancelPage = lazy(() => import('./pages/CheckoutCancel'));
const ContaPage = lazy(() => import('./pages/Conta'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPassword'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmail'));
const IndiquePage = lazy(() => import('./pages/Indique'));
const BlogPage = lazy(() => import('./pages/Blog'));
const BlogPostPage = lazy(() => import('./pages/BlogPost'));

function PageTitleSync() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname.startsWith('/blog')) return; // Blog/BlogPost controlam o próprio título
    document.title = PAGE_TITLES[location.pathname] || PAGE_TITLES['/'];
  }, [location.pathname]);
  return null;
}

function PageFallback() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
      Carregando…
    </div>
  );
}

export default function App() {
  const { modalOpen } = useStore();
  return (
    <HashRouter>
      <Background />
      <PageTitleSync />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />
        <main>
          <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/"              element={<HomePage />} />
            <Route path="/historico"     element={<HistoricoPage />} />
            <Route path="/delta"         element={<DeltaPage />} />
            <Route path="/documentos"    element={<DocumentosPage />} />
            <Route path="/peticoes"      element={<PeticoesPage />} />
            <Route path="/simulador"     element={<SimuladorPage />} />
            <Route path="/monitoramento" element={<MonitoramentoPage />} />
            <Route path="/verificar"     element={<VerificarPage />} />
            <Route path="/premium"       element={<CheckoutPage />} />
            <Route path="/privacidade"   element={<PrivacidadePage />} />
            <Route path="/termos"        element={<TermosPage />} />
            <Route path="/admin"         element={<AdminPage />} />
            <Route path="/escritorio"    element={<EscritorioPage />} />
            <Route path="/api-panel"     element={<ApiPanelPage />} />
            <Route path="/aceitar-convite" element={<AceitarConvitePage />} />
            <Route path="/success"         element={<CheckoutSuccessPage />} />
            <Route path="/cancel"          element={<CheckoutCancelPage />} />
            <Route path="/conta"           element={<ContaPage />} />
            <Route path="/reset-password"   element={<ResetPasswordPage />} />
            <Route path="/verify-email"     element={<VerifyEmailPage />} />
            <Route path="/indique"          element={<IndiquePage />} />
            <Route path="/blog"             element={<BlogPage />} />
            <Route path="/blog/:slug"       element={<BlogPostPage />} />
          </Routes>
          </Suspense>
        </main>
      </div>
      {modalOpen && <AuthModal />}
      <Toast />
    </HashRouter>
  );
}
