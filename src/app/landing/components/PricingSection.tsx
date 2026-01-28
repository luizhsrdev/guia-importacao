'use client';

import Link from 'next/link';
import { Check, X, Sparkles, AlertTriangle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-28 bg-background-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            Escolha Seu Plano
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-3xl mx-auto">
            Comece grátis ou desbloqueie acesso completo aos vendedores verificados
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12">
          {/* Free Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="card p-6 sm:p-8 transition-shadow duration-300 hover:shadow-lg"
          >
            <div className="mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                Gratuito
              </h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl sm:text-4xl font-bold text-text-primary">R$ 0</span>
                <span className="text-sm text-text-secondary">/mês</span>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary">
                Ideal para conhecer a plataforma
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary">Lista de produtos curados</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary">Comparação de preços</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary">Grupo Telegram Free</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-text-tertiary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary">Links diretos aos vendedores</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-text-tertiary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary">Lista de vendedores verificados</span>
              </li>
              <li className="flex items-start gap-3">
                <X className="w-5 h-5 text-text-tertiary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-secondary">Lista negra atualizada</span>
              </li>
            </ul>

            <Link
              href="/sign-up"
              className="btn-secondary w-full py-3 text-sm font-semibold inline-flex items-center justify-center"
            >
              Começar Agora
            </Link>
          </motion.div>

          {/* Premium Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="card-glow p-6 sm:p-8 relative border-2 border-primary/50 transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(0,255,157,0.15)]"
          >
            {/* Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold shadow-glow-primary">
                <Sparkles className="w-3.5 h-3.5" />
                Mais Popular
              </div>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
                Premium
              </h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl sm:text-4xl font-bold text-primary">R$ 29,90</span>
                <span className="text-sm text-text-secondary">/mês</span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-lg sm:text-xl font-bold text-text-primary">ou R$ 297</span>
                <span className="text-xs text-text-secondary">vitalício</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent-gold/10 text-accent-gold text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                Economize R$ 61,80/ano com o vitalício
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary font-medium">Tudo do plano Free</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary font-medium">Lista de vendedores verificados</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary font-medium">Lista negra atualizada</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary font-medium">Links diretos sem afiliados</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-text-primary font-medium">Grupo Telegram Premium exclusivo</span>
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/sign-up?plan=monthly"
                className="btn-secondary flex-1 py-3 text-sm font-semibold inline-flex items-center justify-center"
              >
                Mensal
              </Link>
              <Link
                href="/sign-up?plan=lifetime"
                className="btn-primary flex-1 py-3 text-sm font-semibold inline-flex items-center justify-center"
              >
                Vitalício
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Important Notices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-5xl mx-auto space-y-4"
        >
          <div className="card p-4 sm:p-5 border-l-4 border-amber-500 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-text-primary font-medium mb-1">
                  Importante
                </p>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Você compra diretamente do vendedor no Xianyu. Somos apenas uma plataforma de curadoria e não intermediamos pagamentos ou entregas.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-4 sm:p-5 border-l-4 border-primary bg-primary/5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm text-text-primary font-medium mb-1">
                  Garantia de 7 dias
                </p>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Reembolso integral dentro de 7 dias, conforme o Código de Defesa do Consumidor, sem perguntas.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
