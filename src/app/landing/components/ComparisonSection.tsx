'use client';

import { X, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const comparisons = [
  {
    label: 'Tempo de pesquisa',
    without: '15-20 horas por produto',
    with: '5 minutos por produto'
  },
  {
    label: 'Confiança nos vendedores',
    without: 'Não sabe em quem confiar',
    with: 'Lista curada de confiáveis'
  },
  {
    label: 'Preço final',
    without: 'Paga mais (links afiliados)',
    with: 'Melhor preço (links diretos)'
  },
  {
    label: 'Proteção contra golpes',
    without: 'Pode cair em golpes',
    with: 'Lista negra atualizada'
  },
  {
    label: 'Suporte e comunidade',
    without: 'Pesquisa sozinho',
    with: 'Comunidade com 1.200+ membros'
  }
];

export default function ComparisonSection() {
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
            Pesquisar Sozinho vs Usar Nossa Curadoria
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-3xl mx-auto">
            Veja a diferença entre fazer tudo manualmente ou contar com nossa plataforma
          </p>
        </motion.div>

        {/* Desktop Table View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="hidden md:block max-w-5xl mx-auto"
        >
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-elevated">
                  <th className="text-left p-6 text-sm font-semibold text-text-primary w-1/3">
                    Aspecto
                  </th>
                  <th className="text-center p-6 text-sm font-semibold text-red-500 border-l border-border w-1/3">
                    <div className="flex items-center justify-center gap-2">
                      <X className="w-5 h-5" />
                      <span>Pesquisando Sozinho</span>
                    </div>
                  </th>
                  <th className="text-center p-6 text-sm font-semibold text-primary border-l border-border w-1/3">
                    <div className="flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      <span>Com a Plataforma</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((comparison, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.08, ease: 'easeOut' }}
                    className="border-t border-border hover:bg-surface-elevated/50 transition-colors"
                  >
                    <td className="p-6 text-sm font-medium text-text-primary">
                      {comparison.label}
                    </td>
                    <td className="p-6 text-sm text-text-secondary text-center border-l border-border bg-red-500/5">
                      {comparison.without}
                    </td>
                    <td className="p-6 text-sm text-text-primary text-center font-medium border-l border-border bg-primary/5">
                      {comparison.with}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {comparisons.map((comparison, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
              className="card p-4"
            >
              <h3 className="text-sm font-semibold text-text-primary mb-4">
                {comparison.label}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-red-500 mb-1">Sozinho</p>
                    <p className="text-xs text-text-secondary">{comparison.without}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-primary mb-1">Com a plataforma</p>
                    <p className="text-xs text-text-primary font-medium">{comparison.with}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Result Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mt-12 sm:mt-16 max-w-3xl mx-auto"
        >
          <div className="card-elevated p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 text-center">
            <p className="text-lg sm:text-xl font-bold text-text-primary mb-2">
              Economize <span className="text-primary">90% do tempo</span> de pesquisa
            </p>
            <p className="text-sm sm:text-base text-text-secondary">
              E ainda tenha acesso aos melhores vendedores e preços do mercado
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
