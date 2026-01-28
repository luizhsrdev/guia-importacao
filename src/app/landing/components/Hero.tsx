'use client';

import Link from 'next/link';
import { Clock, Shield, TrendingDown } from 'lucide-react';
import { motion, type Easing } from 'framer-motion';

const ease: Easing = [0.25, 0.1, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease },
  }),
};

const benefits = [
  { icon: Clock, title: 'Economia de Tempo', desc: '15-20h/produto' },
  { icon: Shield, title: 'Vendedores Verificados', desc: 'Histórico comprovado' },
  { icon: TrendingDown, title: 'Links Diretos', desc: 'Sem intermediários' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-background-secondary py-16 sm:py-20 lg:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4 sm:mb-6 leading-tight"
            >
              Encontre os Melhores Vendedores do Xianyu em{' '}
              <span className="text-primary">Segundos</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.2}
              className="text-base sm:text-lg text-text-secondary mb-8 sm:mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0"
            >
              Curadoria de vendedores verificados, comparação de preços e links diretos sem intermediários
            </motion.p>

            {/* Key Benefits */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8 sm:mb-10">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={0.3 + i * 0.1}
                  className="flex flex-col items-center lg:items-start gap-2 p-4 bg-surface rounded-xl border border-border"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <b.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-center lg:text-left">
                    <p className="text-xs sm:text-sm font-semibold text-text-primary">{b.title}</p>
                    <p className="text-xs text-text-secondary">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0.6}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/sign-up"
                  className="btn-primary px-8 py-4 text-base font-semibold inline-flex items-center justify-center"
                >
                  Começar Grátis Agora
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="#pricing"
                  className="btn-secondary px-8 py-4 text-base font-semibold inline-flex items-center justify-center"
                >
                  Ver Planos
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Image/Visual Placeholder */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-lg bg-surface">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent-blue/10">
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-sm text-text-secondary font-medium">
                    Imagem da plataforma aqui
                  </p>
                  <p className="text-xs text-text-tertiary mt-2">
                    Screenshot do catálogo ou dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8, ease: 'easeOut' }}
              className="absolute -bottom-6 -left-6 bg-surface border-2 border-primary rounded-2xl p-4 shadow-glow-primary hidden lg:block"
            >
              <p className="text-sm font-semibold text-text-primary mb-1">1.200+ Membros</p>
              <p className="text-xs text-text-secondary">Comunidade ativa</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-96 h-96 bg-accent-blue/5 rounded-full blur-3xl"></div>
    </section>
  );
}
