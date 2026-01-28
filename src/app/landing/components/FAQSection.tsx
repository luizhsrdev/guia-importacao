'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Vocês vendem produtos?',
    answer: 'Não, nós não vendemos produtos. Somos uma plataforma de curadoria que conecta você diretamente aos melhores vendedores do Xianyu. Você compra diretamente do vendedor através dos links que fornecemos.'
  },
  {
    question: 'Vocês garantem a entrega dos produtos?',
    answer: 'Não garantimos a entrega, pois não intermediamos as transações. Nossa responsabilidade é fornecer uma lista curada de vendedores confiáveis com histórico comprovado. A compra e entrega são de responsabilidade do vendedor no Xianyu.'
  },
  {
    question: 'O que é um "vendedor verificado"?',
    answer: 'Vendedores verificados são perfis que nossa equipe analisa e valida com base em: histórico de vendas, avaliações de compradores, tempo de atividade na plataforma e feedback da nossa comunidade. Mantemos apenas vendedores com reputação comprovada.'
  },
  {
    question: 'O que é a "lista negra"?',
    answer: 'A lista negra é uma base de dados atualizada constantemente com vendedores que tiveram problemas reportados pela comunidade, como: não envio de produtos, itens diferentes do anunciado, golpes ou má conduta. Incluímos comprovantes e evidências de cada caso.'
  },
  {
    question: 'Qual a diferença entre o plano mensal e vitalício?',
    answer: 'O plano mensal custa R$ 29,90/mês e pode ser cancelado a qualquer momento. O plano vitalício é um pagamento único de R$ 297 com acesso para sempre, sem mensalidades. Com o vitalício, você economiza R$ 61,80 por ano em comparação ao mensal.'
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer: 'Sim! O plano mensal pode ser cancelado a qualquer momento, sem multas ou taxas. Você terá acesso até o fim do período já pago. O plano vitalício é um pagamento único e não possui cancelamento, mas oferece garantia de 7 dias para reembolso.'
  },
  {
    question: 'Vocês devolvem o dinheiro se eu não gostar?',
    answer: 'Sim. Oferecemos garantia de 7 dias conforme o Código de Defesa do Consumidor (CDC). Se você não estiver satisfeito dentro deste prazo, devolvemos 100% do valor pago, sem perguntas ou burocracias.'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
            Perguntas Frequentes
          </h2>
          <p className="text-base sm:text-lg text-text-secondary max-w-3xl mx-auto">
            Tire suas dúvidas sobre como funciona a plataforma
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
              className="card overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-surface-elevated transition-colors"
              >
                <span className="text-sm sm:text-base font-semibold text-text-primary flex-1">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <ChevronDown className="w-5 h-5 text-text-secondary flex-shrink-0" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mt-12 sm:mt-16 text-center"
        >
          <div className="card-elevated p-6 sm:p-8 max-w-2xl mx-auto bg-gradient-to-br from-primary/5 to-primary/10">
            <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">
              Ainda tem dúvidas?
            </h3>
            <p className="text-sm sm:text-base text-text-secondary mb-6">
              Entre em contato conosco no Telegram ou por email
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://t.me/guiaimportacao"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-3 text-sm font-semibold inline-flex items-center justify-center"
              >
                Falar no Telegram
              </a>
              <a
                href="mailto:contato@guiaimportacao.com"
                className="btn-secondary px-6 py-3 text-sm font-semibold inline-flex items-center justify-center"
              >
                Enviar Email
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
