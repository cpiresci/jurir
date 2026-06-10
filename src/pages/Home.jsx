import Hero from '../components/Hero';
import AnalysisPanel from '../components/AnalysisPanel';
import AgentsSection from '../components/AgentsSection';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Hero />
      <div id="analise"><AnalysisPanel /></div>
      <div id="agentes"><AgentsSection /></div>
      <div id="precos"><Pricing /></div>
      <Footer />
    </>
  );
}
