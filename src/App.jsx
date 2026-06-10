import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Background from './components/Background';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import HomePage from './pages/Home';
import HistoricoPage from './pages/Historico';
import DeltaPage from './pages/Delta';
import DocumentosPage from './pages/Documentos';
import PeticoesPage from './pages/Peticoes';
import SimuladorPage from './pages/Simulador';
import MonitoramentoPage from './pages/Monitoramento';
import VerificarPage from './pages/Verificar';
import CheckoutPage from './pages/Checkout';
import PrivacidadePage from './pages/Privacidade';
import AdminPage from './pages/Admin';
import { useStore } from './store';

export default function App() {
  const { modalOpen } = useStore();

  return (
    <BrowserRouter>
      <Background />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />
        <main>
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
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
      {modalOpen && <AuthModal />}
      <Toast />
    </BrowserRouter>
  );
}
