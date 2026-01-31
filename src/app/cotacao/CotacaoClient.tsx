'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, RefreshCw, Info, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface ExchangeRateData {
  officialRate: number;
  manualAdjustment: number;
  effectiveRate: number;
  updatedAt: string;
  notes?: string;
}

export default function CotacaoClient() {
  const [rateData, setRateData] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputCNY, setInputCNY] = useState('');
  const [resultBRL, setResultBRL] = useState<number | null>(null);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/80 to-emerald-900 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
            Calculadora de Cotação
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-2xl mx-auto">
            Converta valores de Yuan (CNY) para Real (BRL) com a cotação real de importação
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 pb-16 space-y-6">
        {/* Rate Card */}
        <div className="bg-gradient-to-br from-primary/90 to-emerald-950 rounded-2xl p-6 sm:p-8 shadow-xl border border-primary/30">
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold text-lg">Cotação Atual</h2>
                <button
                  onClick={fetchRate}
                  className="text-white/70 hover:text-white transition-colors p-2"
                  aria-label="Atualizar cotação"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center">
                <div>
                  <p className="text-white/70 text-xs sm:text-sm mb-1">Oficial</p>
                  <p className="text-white font-bold text-lg sm:text-2xl">
                    ¥ {rateData.officialRate.toFixed(3)}
                  </p>
                  <p className="text-white/50 text-[10px] sm:text-xs">por R$ 1</p>
                </div>
                <div>
                  <p className="text-white/70 text-xs sm:text-sm mb-1">Ajuste</p>
                  <p className="text-white font-bold text-lg sm:text-2xl">
                    {(rateData.manualAdjustment * 100).toFixed(0)}%
                  </p>
                  <p className="text-white/50 text-[10px] sm:text-xs">taxa real</p>
                </div>
                <div>
                  <p className="text-yellow-300 text-xs sm:text-sm mb-1 font-medium">Real</p>
                  <p className="text-yellow-300 font-bold text-lg sm:text-2xl">
                    ¥ {rateData.effectiveRate.toFixed(3)}
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
            Calculadora
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:flex-1">
              <label htmlFor="cny-input" className="block text-text-secondary text-sm mb-2">
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
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-text-tertiary hidden sm:block flex-shrink-0" />

            <div className="w-full sm:flex-1">
              <label className="block text-text-secondary text-sm mb-2">
                Valor em Real (BRL)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-medium">
                  R$
                </span>
                <div className="w-full pl-12 pr-4 py-3 bg-primary/10 border border-primary/30 rounded-xl text-primary text-lg font-semibold">
                  {resultBRL !== null ? resultBRL.toFixed(2) : '0.00'}
                </div>
              </div>
            </div>
          </div>

          {rateData && (
            <p className="text-text-tertiary text-xs mt-4 text-center">
              Usando cotação efetiva de ¥ {rateData.effectiveRate.toFixed(3)} por R$ 1
            </p>
          )}
        </div>

        {/* How to Get This Rate */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-text-primary font-semibold text-lg mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Como Conseguir Essa Cotação?
          </h2>

          <div className="bg-surface-elevated rounded-xl p-4 sm:p-6 border border-border">
            <p className="text-text-secondary text-sm leading-relaxed mb-4">
              A cotação efetiva considera a conversão via Binance (USDT) + CSSBuy, que oferece
              taxas melhores que a conversão direta de bancos brasileiros.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  1
                </span>
                <p className="text-text-secondary">
                  Compre USDT na Binance com PIX (cotação próxima do dólar comercial)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  2
                </span>
                <p className="text-text-secondary">
                  Envie os USDT para sua conta na CSSBuy
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                  3
                </span>
                <p className="text-text-secondary">
                  CSSBuy converte automaticamente para CNY na cotação favorável
                </p>
              </div>
            </div>

            <p className="text-text-tertiary text-xs mt-4">
              * Passo a passo detalhado em breve. Enquanto isso, consulte nosso grupo no Telegram.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            ← Voltar para os produtos
          </Link>
        </div>
      </div>
    </div>
  );
}
