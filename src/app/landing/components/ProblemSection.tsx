'use client';

import { Clock, DollarSign, AlertTriangle, Languages, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const problems = [
  {
    icon: Clock,
    title: 'Tempo Perdido',
    description: 'Passou horas pesquisando vendedores sem saber em quem confiar'
  },
  {
    icon: DollarSign,
    title: 'Preços Altos',
    description: 'Deixou de economizar porque comprou de vendedores que cobram caro'
  },
  {
    icon: AlertTriangle,
    title: 'Perfis Falsos',
    description: 'Caiu em perfis de vendedores duplicados que ocultam problemas e falsificam avaliações'
  },
  {
    icon: Languages,
    title: 'Comunicação',
    description: 'Não consegue entrar em contato com vendedores para garantir preço e qualidade?'
  },
  {
    icon: AlertCircle,
    title: 'Insegurança',
    description: 'Não sabe quais vendedores evitar e quais confiar'
  }
];

export default function ProblemSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            Cansado de Perder Tempo e Dinheiro?
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-3xl mx-auto">
            Importadores gastam em média 5-10 horas pesquisando cada produto
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
              className="card p-6 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                  <problem.icon className="w-6 h-6 text-red-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-text-primary mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Statistic Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mt-12 sm:mt-16 max-w-3xl mx-auto"
        >
          <div className="card-elevated p-8 bg-gradient-to-br from-red-500/5 to-red-500/10 border-red-500/20">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20">
                <Clock className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-2xl sm:text-3xl font-bold text-text-primary">5-10 horas</p>
                <p className="text-sm sm:text-base text-text-secondary">
                  gastas pesquisando <span className="font-semibold">cada produto</span>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
