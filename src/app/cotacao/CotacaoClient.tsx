'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Info, TrendingDown, Image as ImageIcon } from 'lucide-react';
import { GlobalHeader } from '@/components/GlobalHeader';
import type { UserStatus } from '@/types';

// Dados dos passos com URLs de imagem do Cloudinary
// Para adicionar imagens: faça upload no Cloudinary e substitua as URLs abaixo
const STEPS_DATA = [
  {
    number: 1,
    title: 'Acesse Trade → Spot na Binance',
    description: 'No app ou site da Binance',
    image: 'https://res.cloudinary.com/importacao/image/upload/v1770078468/step-1_mdxwmr.png', // URL do Cloudinary: ex: https://res.cloudinary.com/importacao/image/upload/v1234/cotacao/step-1.png
  },
  {
    number: 2,
    title: 'Selecione USDT/BRL e compre USDT',
    description: 'Compre a quantia que desejar via PIX',
    image: 'https://res.cloudinary.com/importacao/image/upload/v1770078468/step-2_fwtirx.png',
  },
  {
    number: 3,
    title: 'Aguarde a compra ser concluída',
    description: 'O valor em USDT aparecerá na aba Ativos',
    image: 'https://res.cloudinary.com/importacao/image/upload/v1770078468/step-3_itqmnu.png',
  },
  {
    number: 4,
    title: 'Acesse a aba de recarga no seu Agente',
    description: 'CSSBuy ou ACBuy → selecione o método CoinPal',
    image: 'https://res.cloudinary.com/importacao/image/upload/v1770078469/step-4_qnbf48.png',
  },
  {
    number: 5,
    title: 'Insira o valor e selecione Binance Pay',
    description: 'Use a rede BSC (BEP20) para taxas menores',
    image: 'https://res.cloudinary.com/importacao/image/upload/v1770078469/step-5_j5iwpr.jpg',
  },
  {
    number: 6,
    title: 'Pronto! Saldo convertido automaticamente',
    description: 'O valor será depositado em CNY na sua conta do agente',
    image: 'https://res.cloudinary.com/importacao/image/upload/v1770078469/step-6_kxsehr.jpg',
  },
];

// Componente de cada passo com preview de imagem
function StepItem({ step, onImageClick }: { step: typeof STEPS_DATA[0]; onImageClick: (step: typeof STEPS_DATA[0]) => void }) {
  const [showPreview, setShowPreview] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasImage = step.image && step.image.length > 0;

  return (
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
        {step.number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-text-primary font-medium text-sm sm:text-base">{step.title}</p>
        <p className="text-text-tertiary text-xs mt-0.5">{step.description}</p>
      </div>
      {/* Ícone de imagem com preview - só mostra se tiver imagem configurada */}
      {hasImage && (
        <div
          className="relative"
          onMouseEnter={() => setShowPreview(true)}
          onMouseLeave={() => setShowPreview(false)}
        >
          <button
            onClick={() => onImageClick(step)}
            className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg bg-surface hover:bg-surface-elevated border border-border hover:border-border-emphasis flex items-center justify-center transition-all flex-shrink-0 cursor-pointer active:scale-95"
            aria-label={`Ver imagem do passo ${step.number}`}
          >
            <ImageIcon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-text-tertiary" />
          </button>

          {/* Preview popup - só no desktop (hidden em mobile) */}
          <div
            className={`hidden sm:block absolute right-0 bottom-full mb-2 z-50 transition-all duration-200 ease-out ${
              showPreview
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
          >
            <div className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden" style={{ minWidth: '600px' }}>
              {!imageError ? (
                <img
                  src={step.image}
                  alt={`Passo ${step.number}: ${step.title}`}
                  style={{ width: '600px', height: 'auto', maxHeight: '450px' }}
                  className="object-contain bg-background"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div style={{ width: '600px', height: '300px' }} className="bg-surface-elevated flex flex-col items-center justify-center gap-2">
                  <ImageIcon className="w-10 h-10 text-text-tertiary" />
                  <span className="text-text-tertiary text-sm">Imagem não disponível</span>
                </div>
              )}
              <div className="px-3 py-2 bg-surface-elevated border-t border-border">
                <p className="text-xs text-text-secondary font-medium">Passo {step.number}</p>
              </div>
            </div>
            {/* Seta do tooltip */}
            <div className="absolute right-3 -bottom-1.5 w-3 h-3 bg-surface-elevated border-r border-b border-border transform rotate-45" />
          </div>
        </div>
      )}
    </div>
  );
}

// Modal de imagem para mobile
function ImageModal({ step, onClose }: { step: typeof STEPS_DATA[0] | null; onClose: () => void }) {
  const [imageError, setImageError] = useState(false);

  if (!step) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-surface-elevated border-b border-border">
          <p className="text-sm font-medium text-text-primary">Passo {step.number}</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface hover:bg-background flex items-center justify-center transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="bg-background">
          {!imageError ? (
            <img
              src={step.image}
              alt={`Passo ${step.number}: ${step.title}`}
              className="w-full h-auto max-h-[60vh] object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-48 flex flex-col items-center justify-center gap-2 bg-surface-elevated">
              <ImageIcon className="w-10 h-10 text-text-tertiary" />
              <span className="text-text-tertiary text-sm">Imagem não disponível</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-surface-elevated border-t border-border">
          <p className="text-sm font-medium text-text-primary">{step.title}</p>
          <p className="text-xs text-text-tertiary mt-0.5">{step.description}</p>
        </div>
      </div>
    </div>
  );
}

interface ExchangeRateData {
  officialRate: number;
  manualAdjustment: number;
  effectiveRate: number;
  updatedAt: string;
  notes?: string;
}

interface CotacaoClientProps {
  userStatus: UserStatus;
}

export default function CotacaoClient({ userStatus }: CotacaoClientProps) {
  const [rateData, setRateData] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputCNY, setInputCNY] = useState('');
  const [resultBRL, setResultBRL] = useState<number | null>(null);
  const [selectedStep, setSelectedStep] = useState<typeof STEPS_DATA[0] | null>(null);

  useEffect(() => {
    fetchRate();
  }, []);

  const fetchRate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/exchange-rate');
      if (res.ok) {
        const data = await res.json();
        setRateData(data);
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = () => {
    if (!rateData || !inputCNY) return;
    const cny = parseFloat(inputCNY);
    if (isNaN(cny)) return;
    setResultBRL(cny / rateData.effectiveRate);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setInputCNY(value);
    if (rateData && value) {
      const cny = parseFloat(value);
      if (!isNaN(cny)) {
        setResultBRL(cny / rateData.effectiveRate);
      }
    } else {
      setResultBRL(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <GlobalHeader userStatus={userStatus} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Cotação
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">
            Converta valores de Yuan (CNY) para Real (BRL) com a cotação real de importação
          </p>
        </div>
        {/* Rate Card */}
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 dark:from-primary/90 dark:to-emerald-950 rounded-2xl p-6 sm:p-8 shadow-xl border border-emerald-600/50 dark:border-primary/30">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/20 rounded w-1/3 mx-auto" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-16 bg-white/20 rounded" />
                <div className="h-16 bg-white/20 rounded" />
                <div className="h-16 bg-white/20 rounded" />
              </div>
            </div>
          ) : rateData ? (
            <>
              <div className="mb-6">
                <h2 className="text-white font-semibold text-lg">Cotação Atual</h2>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                <div>
                  <p className="text-white/70 text-xs sm:text-sm mb-1">Oficial</p>
                  <p className="text-white font-bold text-lg sm:text-2xl">
                    ¥ {rateData.officialRate.toFixed(2)}
                  </p>
                  <p className="text-white/50 text-[10px] sm:text-xs">por R$ 1</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs sm:text-sm mb-1">Taxa</p>
                  <p className="text-white font-bold text-lg sm:text-2xl">
                    {((1 - rateData.manualAdjustment) * 100).toFixed(0)}%
                  </p>
                  <p className="text-white/50 text-[10px] sm:text-xs">taxa aplicada</p>
                </div>
                <div>
                  <p className="text-yellow-300 text-xs sm:text-sm mb-1 font-medium">Real</p>
                  <p className="text-yellow-300 font-bold text-lg sm:text-2xl">
                    ¥ {rateData.effectiveRate.toFixed(2)}
                  </p>
                  <p className="text-yellow-300/70 text-[10px] sm:text-xs">por R$ 1</p>
                </div>
              </div>

              <p className="text-white/50 text-xs text-center mt-6">
                Atualizado em {formatDate(rateData.updatedAt)}
              </p>
            </>
          ) : (
            <p className="text-white text-center">Erro ao carregar cotação</p>
          )}
        </div>

        {/* Calculator */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-text-primary font-semibold text-lg mb-6 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            Conversão
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-0">
            {/* Yuan Input */}
            <div className="flex-1">
              <label htmlFor="cny-input" className="block text-text-secondary text-sm mb-2 text-center">
                Valor em Yuan (CNY)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
                  ¥
                </span>
                <input
                  id="cny-input"
                  type="text"
                  inputMode="decimal"
                  value={inputCNY}
                  onChange={handleInputChange}
                  placeholder=""
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border-emphasis rounded-xl text-text-primary text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-center"
                />
              </div>
            </div>

            {/* Arrow - centered with equal spacing */}
            <div className="hidden sm:flex items-end justify-center w-20 pb-3">
              <ArrowRight className="w-6 h-6 text-text-tertiary" />
            </div>

            {/* Real Output */}
            <div className="flex-1">
              <label className="block text-text-secondary text-sm mb-2 text-center">
                Valor em Real (BRL)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-medium">
                  R$
                </span>
                <div className="w-full pl-12 pr-4 py-3 bg-primary/10 border border-primary/30 rounded-xl text-primary text-lg font-semibold text-center">
                  {resultBRL !== null ? resultBRL.toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {rateData && (
            <p className="text-text-tertiary text-xs mt-4 text-center">
              Usando cotação efetiva de ¥ {rateData.effectiveRate.toFixed(2)} por R$ 1
            </p>
          )}
        </div>

        {/* How to Get This Rate */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-text-primary font-semibold text-lg mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Como Recarregar com Essa Cotação?
          </h2>

          {/* Prerequisites Warning Card */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-sm">
                <p className="font-medium text-yellow-500 mb-1">Pré-requisitos</p>
                <ul className="text-text-secondary space-y-1 text-xs sm:text-sm">
                  <li>• Conta verificada na Binance (maior de idade)</li>
                  <li>• Conta em agente de compras (CSSBuy ou ACBuy)</li>
                  <li>• Mesma titularidade em todas as contas e pagamentos</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Step by Step */}
          <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-border">
            <p className="text-text-secondary text-sm leading-relaxed mb-5">
              A cotação efetiva considera a conversão via Binance (USDT) + CoinPal, que oferece
              taxas melhores que a conversão direta de bancos brasileiros. Por segurança, salve
              todos os comprovantes de transferência entre as plataformas.
            </p>

            <div className="space-y-4 text-sm">
              {STEPS_DATA.map((step) => (
                <StepItem key={step.number} step={step} onImageClick={setSelectedStep} />
              ))}
            </div>

            {/* External Links */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-border">
              <a
                href="https://www.binance.com/pt-BR/trade/USDT_BRL?type=spot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F0B90B]/10 border border-[#F0B90B]/30 rounded-xl text-[#F0B90B] text-sm font-medium hover:bg-[#F0B90B]/20 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L6.5 7.5L8.7 9.7L12 6.4L15.3 9.7L17.5 7.5L12 2ZM2 12L4.2 9.8L6.4 12L4.2 14.2L2 12ZM12 22L6.5 16.5L8.7 14.3L12 17.6L15.3 14.3L17.5 16.5L12 22ZM17.6 12L19.8 9.8L22 12L19.8 14.2L17.6 12ZM12 9.6L9.6 12L12 14.4L14.4 12L12 9.6Z"/>
                </svg>
                Abrir Binance
              </a>
              <a
                href="https://www.cssbuy.com/web/recharge/recharge"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Abrir CSSBuy
              </a>
              <a
                href="https://www.acbuy.com/member/wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Abrir ACBuy
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de imagem para mobile/touch */}
      <ImageModal step={selectedStep} onClose={() => setSelectedStep(null)} />
    </main>
  );
}
