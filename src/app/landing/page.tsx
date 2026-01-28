import type { Metadata } from 'next';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import SolutionSection from './components/SolutionSection';
import ComparisonSection from './components/ComparisonSection';
import PricingSection from './components/PricingSection';
import FAQSection from './components/FAQSection';
import ScrollToTop from './components/ScrollToTop';
import LandingRedirect from './components/LandingRedirect';

export const metadata: Metadata = {
  title: 'Guia Importação Xianyu - Encontre os Melhores Produtos e Vendedores',
  description:
    'Curadoria de vendedores verificados do Xianyu. Economize 5-10h por produto com nossa lista de vendedores confiáveis, lista negra atualizada e links diretos.',
  keywords:
    'xianyu, importação china, vendedores verificados, importar da china, produtos chineses, lista negra xianyu, curadoria xianyu',
  openGraph: {
    title: 'Guia Importação Xianyu - Encontre os Melhores Produtos e Vendedores',
    description:
      'Curadoria de vendedores verificados do Xianyu. Economize 5-10h por produto com vendedores confiáveis e links diretos.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Guia Importação Xianyu',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guia Importação Xianyu - Melhores Produtos e Vendedores',
    description:
      'Curadoria de vendedores verificados do Xianyu. Economize 5-10h por produto.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Guia Importação Xianyu',
  description:
    'Plataforma de curadoria de vendedores verificados do Xianyu para importadores brasileiros.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: [
    {
      '@type': 'Offer',
      name: 'Plano Gratuito',
      price: '0',
      priceCurrency: 'BRL',
    },
    {
      '@type': 'Offer',
      name: 'Plano Premium Mensal',
      price: '29.90',
      priceCurrency: 'BRL',
    },
    {
      '@type': 'Offer',
      name: 'Plano Premium Vitalício',
      price: '297',
      priceCurrency: 'BRL',
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen scroll-smooth">
        <LandingRedirect />
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <ComparisonSection />
        <PricingSection />
        <FAQSection />
        <ScrollToTop />
      </main>
    </>
  );
}
