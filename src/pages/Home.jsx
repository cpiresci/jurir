import Hero from '../components/Hero';
import AnalysisPanel from '../components/AnalysisPanel';
import AgentsSection from '../components/AgentsSection';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <AnalysisPanel />
      <AgentsSection />
      <Pricing />
      <Footer />
    </>
  );
}
