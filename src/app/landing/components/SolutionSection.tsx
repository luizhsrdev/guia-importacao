'use client';

import { Package, ShieldCheck, Ban, Link as LinkIcon, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const solutions = [
  {
    number: '01',
    icon: Package,
    title: 'Catálogo Curado',
    description: 'Produtos selecionados manualmente com informações completas e comparação de preços entre vendedores'
  },
  {
    number: '02',
    icon: ShieldCheck,
    title: 'Vendedores Verificados',
    description: 'Lista exclusiva de vendedores com histórico comprovado e avaliações reais da comunidade'
  },
  {
    number: '03',
    icon: Ban,
    title: 'Lista Negra Atualizada',
    description: 'Base de dados constantemente atualizada com vendedores problemáticos e comprovantes de golpes'
  },
  {
    number: '04',
    icon: LinkIcon,
    title: 'Links Diretos Sem Afiliados',
    description: 'Acesse diretamente os vendedores sem intermediários, pagando o menor preço possível'
  },
  {
    number: '05',
    icon: Users,
    title: 'Comunidade Exclusiva',
    description: 'Grupo Telegram Premium com mais de 1.200 importadores compartilhando experiências e dicas'
  }
];

export default function SolutionSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-background-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            Economize Tempo com Curadoria Profissional
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-3xl mx-auto">
            Tudo que você precisa para importar com segurança e economizar tempo
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
              className={`card p-6 sm:p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${
                index === 2 ? 'sm:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <solution.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary/20">
                  {solution.number}
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3">
                {solution.title}
              </h3>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {solution.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Visual Emphasis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mt-12 sm:mt-16 max-w-4xl mx-auto"
        >
          <div className="card-glow p-8 sm:p-10 text-center bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mb-6">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">
              Curadoria Feita por Importadores Experientes
            </h3>
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
              Nossa equipe testa e valida cada vendedor antes de adicionar à plataforma,
              garantindo que você tenha acesso apenas aos melhores do mercado
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
