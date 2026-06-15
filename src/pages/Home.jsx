import Hero from '../components/Hero';
import AnalysisPanel from '../components/AnalysisPanel';
import AgentsSection from '../components/AgentsSection';
import FeaturesSection from '../components/FeaturesSection';
import ProcessSection from '../components/ProcessSection';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <div id="analise"><AnalysisPanel /></div>
      <FeaturesSection />
      <div id="agentes"><AgentsSection /></div>
      <ProcessSection />
      <Pricing />
      <Footer />
    </>
  );
}
