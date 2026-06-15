import Hero from '../components/Hero';
import PainSection from '../components/PainSection';
import AnalysisPanel from '../components/AnalysisPanel';
import SolutionTerminal from '../components/SolutionTerminal';
import AgentsSection from '../components/AgentsSection';
import FeaturesSection from '../components/FeaturesSection';
import ProcessSection from '../components/ProcessSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FaqSection from '../components/FaqSection';
import Pricing from '../components/Pricing';
import CtaFinal from '../components/CtaFinal';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PainSection />
      <div id="analise">
        <AnalysisPanel />
        <div style={{ padding: '0 24px 80px' }}>
          <SolutionTerminal />
        </div>
      </div>
      <div id="agentes"><AgentsSection /></div>
      <ProcessSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FaqSection />
      <Pricing />
      <CtaFinal />
      <Footer />
    </>
  );
}
