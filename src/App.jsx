import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Background from './components/Background';
import AuthModal from './components/AuthModal';
import Toast from './components/Toast';
import StatusBar from './components/StatusBar';
import HomePage from './pages/Home';
import HistoricoPage from './pages/Historico';
import { useStore } from './store';

export default function App() {
  const { modalOpen } = useStore();

  return (
    <BrowserRouter>
      <Background />
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />
        <StatusBar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/historico" element={<HistoricoPage />} />
          </Routes>
        </main>
      </div>
      {modalOpen && <AuthModal />}
      <Toast />
    </BrowserRouter>
  );
}
