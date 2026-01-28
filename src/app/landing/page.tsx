import type { Metadata } from 'next';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import ComparisonSection from './components/ComparisonSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';

export const metadata: Metadata = {
  title: 'Guia Importação Xianyu - Encontre os Melhores Vendedores',
  description: 'Curadoria de vendedores verificados do Xianyu. Economize 15-20h por produto com nossa lista de vendedores confiáveis e acesse links diretos sem intermediários.',
  keywords: 'xianyu, importação china, vendedores verificados, importar da china, produtos chineses',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <ComparisonSection />
      <PricingSection />
      <FAQSection />
    </main>
  );
}
