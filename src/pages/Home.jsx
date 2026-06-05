import Hero from '../components/Hero';
import AnalysisPanel from '../components/AnalysisPanel';
import AgentsSection from '../components/AgentsSection';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div style={{ color: 'red', fontSize: 40, padding: 100 }}>
      TESTE
      <Hero />
      <AnalysisPanel />
      <AgentsSection />
      <Pricing />
      <Footer />
    </div>
  );
}
