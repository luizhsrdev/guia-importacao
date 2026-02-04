'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, Package, Scale, Truck, Shield, Receipt, RefreshCw, Info, AlertTriangle, CheckCircle, ChevronDown, Box } from 'lucide-react';

// Service fee levels
const SERVICE_FEE_LEVELS = [
  { label: 'Sem nível (6%)', value: 0.06 },
  { label: 'Gold (5%)', value: 0.05 },
  { label: 'Platinum (4%)', value: 0.04 },
  { label: 'Diamond (3%)', value: 0.03 },
  { label: 'VIP (2%)', value: 0.02 },
  { label: 'Merchant (1%)', value: 0.01 },
];

// Shipping lines (prepared for future expansion)
const SHIPPING_LINES = [
  { label: 'JD Express (0-3kg) - 12-20 dias', value: 'JD-0-3kg' },
];

interface CalculationResult {
  weight_analysis: {
    real_weight_g: number;
    volumetric_weight_g: number;
    weight_used_g: number;
    was_volumetric: boolean;
  };
  costs_cny: {
    product: number;
    freight: number;
    insurance: number;
    service_fee: number;
    total: number;
  };
  costs_brl: {
    product: number;
    freight: number;
    insurance: number;
    service_fee: number;
    total: number;
  };
  exchange_rates: {
    usd_to_cny: number;
    cny_to_brl: number;
    updated_at: string;
  };
  freight_details: {
    freight_usd: number;
    shipping_line: string;
  };
}

interface FormData {
  productPrice: string;
  weightGrams: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  shippingLine: string;
  serviceFeeRate: number;
  includeInsurance: boolean;
}

export default function CalculatorClient() {
  const [formData, setFormData] = useState<FormData>({
    productPrice: '',
    weightGrams: '',
    lengthCm: '',
    widthCm: '',
    heightCm: '',
    shippingLine: 'JD-0-3kg',
    serviceFeeRate: 0.06,
    includeInsurance: true,
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isShippingExpanded, setIsShippingExpanded] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear previous result when form changes
    setResult(null);
    setError(null);
    setIsShippingExpanded(false);
  };

  const handleNumericInput = (field: keyof FormData, value: string, allowDecimal = true) => {
    // Allow only numbers and optionally one decimal point
    const regex = allowDecimal ? /^[0-9]*\.?[0-9]*$/ : /^[0-9]*$/;
    if (value === '' || regex.test(value)) {
      handleInputChange(field, value);
    }
  };

  const validateForm = (): string | null => {
    if (!formData.productPrice || parseFloat(formData.productPrice) <= 0) {
      return 'Informe o preço do produto';
    }
    if (!formData.weightGrams || parseInt(formData.weightGrams) < 1) {
      return 'Informe o peso do produto';
    }
    if (!formData.lengthCm || parseFloat(formData.lengthCm) <= 0) {
      return 'Informe o comprimento da caixa';
    }
    if (!formData.widthCm || parseFloat(formData.widthCm) <= 0) {
      return 'Informe a largura da caixa';
    }
    if (!formData.heightCm || parseFloat(formData.heightCm) <= 0) {
      return 'Informe a altura da caixa';
    }
    return null;
  };

  const handleCalculate = async () => {
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/calculate-cost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_price_cny: parseFloat(formData.productPrice),
          weight_grams: parseInt(formData.weightGrams),
          length_cm: parseFloat(formData.lengthCm),
          width_cm: parseFloat(formData.widthCm),
          height_cm: parseFloat(formData.heightCm),
          shipping_line: formData.shippingLine,
          service_fee_rate: formData.serviceFeeRate,
          include_insurance: formData.includeInsurance,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || 'Erro ao calcular custo');
        return;
      }

      setResult(data.result);
    } catch (err) {
      console.error('Error calculating cost:', err);
      setError('Erro ao calcular custo. Verifique sua conexão.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setFormData({
      productPrice: '',
      weightGrams: '',
      lengthCm: '',
      widthCm: '',
      heightCm: '',
      shippingLine: 'JD-0-3kg',
      serviceFeeRate: 0.06,
      includeInsurance: true,
    });
    setResult(null);
    setError(null);
    setIsShippingExpanded(false);
  };

  const formatCurrency = (value: number, currency: 'CNY' | 'BRL' | 'USD') => {
    const symbols = { CNY: '¥', BRL: 'R$', USD: '$' };
    return `${symbols[currency]} ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Link>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2 flex items-center justify-center gap-3">
            <Calculator className="w-8 h-8 text-primary" />
            Calculadora de Custo
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">
            Calcule o custo total de importação via CSSBuy com frete JD Express
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-text-primary font-semibold text-lg mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Dados do Produto
          </h2>

          <div className="space-y-6">
            {/* Product Price */}
            <div>
              <label htmlFor="product-price" className="block text-text-secondary text-sm mb-2">
                Preço do Produto
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium">
                  ¥
                </span>
                <input
                  id="product-price"
                  type="text"
                  inputMode="decimal"
                  value={formData.productPrice}
                  onChange={(e) => handleNumericInput('productPrice', e.target.value)}
                  placeholder="Ex: 4570.00"
                  className="w-full pl-10 pr-16 py-3 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">
                  CNY
                </span>
              </div>
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-text-secondary text-sm mb-2 flex items-center gap-2">
                Peso Real do Produto
                <span className="group relative cursor-help">
                  <Info className="w-4 h-4 text-text-tertiary" />
                  <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs text-text-secondary whitespace-nowrap z-10">
                    Peso informado no anúncio do Xianyu
                  </span>
                </span>
              </label>
              <div className="relative">
                <input
                  id="weight"
                  type="text"
                  inputMode="numeric"
                  value={formData.weightGrams}
                  onChange={(e) => handleNumericInput('weightGrams', e.target.value, false)}
                  placeholder="Ex: 206"
                  className="w-full pr-16 py-3 px-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary text-sm">
                  gramas
                </span>
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-text-secondary text-sm mb-2 flex items-center gap-2">
                Dimensões da Caixa
                <span className="group relative cursor-help">
                  <Info className="w-4 h-4 text-text-tertiary" />
                  <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs text-text-secondary whitespace-nowrap z-10">
                    Pergunte ao vendedor se necessário
                  </span>
                </span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.lengthCm}
                    onChange={(e) => handleNumericInput('lengthCm', e.target.value)}
                    placeholder="16.0"
                    className="w-full pr-10 py-3 px-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-center"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xs">
                    cm
                  </span>
                  <span className="block text-text-tertiary text-xs text-center mt-1">Comprimento</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.widthCm}
                    onChange={(e) => handleNumericInput('widthCm', e.target.value)}
                    placeholder="8.0"
                    className="w-full pr-10 py-3 px-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-center"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xs">
                    cm
                  </span>
                  <span className="block text-text-tertiary text-xs text-center mt-1">Largura</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.heightCm}
                    onChange={(e) => handleNumericInput('heightCm', e.target.value)}
                    placeholder="3.0"
                    className="w-full pr-10 py-3 px-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-center"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xs">
                    cm
                  </span>
                  <span className="block text-text-tertiary text-xs text-center mt-1">Altura</span>
                </div>
              </div>
            </div>

            {/* Shipping Line */}
            <div>
              <label htmlFor="shipping-line" className="block text-text-secondary text-sm mb-2 flex items-center gap-2">
                <Truck className="w-4 h-4 text-text-tertiary" />
                Linha de Frete
              </label>
              <select
                id="shipping-line"
                value={formData.shippingLine}
                onChange={(e) => handleInputChange('shippingLine', e.target.value)}
                className="w-full py-3 px-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
              >
                {SHIPPING_LINES.map((line) => (
                  <option key={line.value} value={line.value}>
                    {line.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Fee Level */}
            <div>
              <label htmlFor="service-fee" className="block text-text-secondary text-sm mb-2 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-text-tertiary" />
                Seu Nível no CSSBuy
                <span className="group relative cursor-help">
                  <Info className="w-4 h-4 text-text-tertiary" />
                  <span className="invisible group-hover:visible absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-surface-elevated border border-border rounded-lg text-xs text-text-secondary whitespace-nowrap z-10">
                    Taxa cobrada conforme seu nível de membro
                  </span>
                </span>
              </label>
              <select
                id="service-fee"
                value={formData.serviceFeeRate}
                onChange={(e) => handleInputChange('serviceFeeRate', parseFloat(e.target.value))}
                className="w-full py-3 px-4 bg-surface border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.25rem' }}
              >
                {SERVICE_FEE_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Insurance Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-surface-elevated rounded-xl border border-border">
              <input
                type="checkbox"
                id="insurance"
                checked={formData.includeInsurance}
                onChange={(e) => handleInputChange('includeInsurance', e.target.checked)}
                className="mt-0.5 w-5 h-5 rounded border-border text-primary focus:ring-primary/50 bg-surface cursor-pointer"
              />
              <label htmlFor="insurance" className="flex-1 cursor-pointer">
                <span className="flex items-center gap-2 text-text-primary font-medium">
                  <Shield className="w-4 h-4 text-primary" />
                  Incluir Seguro (3%)
                </span>
                <p className="text-text-tertiary text-xs mt-1">
                  Proteção até ¥3.000 contra perda/dano (máximo ¥90)
                </p>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 px-4 bg-surface hover:bg-surface-elevated border border-border rounded-xl text-text-secondary font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Limpar
              </button>
              <button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="flex-[2] py-3 px-4 bg-primary hover:bg-primary/90 text-black font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Calculando...
                  </>
                ) : (
                  <>
                    <Calculator className="w-5 h-5" />
                    Calcular Custo Total
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Weight Analysis */}
            <div className="card p-6">
              <h3 className="text-text-primary font-semibold mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Análise de Peso
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-surface-elevated rounded-xl border border-border">
                  <p className="text-text-tertiary text-xs mb-1">Peso Real</p>
                  <p className="text-text-primary font-bold text-lg">
                    {result.weight_analysis.real_weight_g.toLocaleString()}g
                  </p>
                </div>
                <div className="p-4 bg-surface-elevated rounded-xl border border-border">
                  <p className="text-text-tertiary text-xs mb-1">Peso Volumétrico</p>
                  <p className="text-text-primary font-bold text-lg flex items-center gap-2">
                    {result.weight_analysis.volumetric_weight_g.toLocaleString()}g
                    {result.weight_analysis.was_volumetric && (
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full">
                        VOLUMÉTRICO
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-surface rounded-xl border border-border flex items-center gap-3">
                <CheckCircle className={`w-5 h-5 flex-shrink-0 ${result.weight_analysis.was_volumetric ? 'text-orange-400' : 'text-primary'}`} />
                <p className="text-text-secondary text-sm">
                  Frete baseado em: <span className="font-semibold text-text-primary">{result.weight_analysis.weight_used_g.toLocaleString()}g</span>
                  {result.weight_analysis.was_volumetric && (
                    <span className="text-orange-400"> (o maior)</span>
                  )}
                </p>
              </div>
              <p className="text-text-tertiary text-xs mt-3">
                Fórmula volumétrico: (C × L × A × 1000) / 8000
              </p>
            </div>

            {/* Cost Breakdown */}
            <div className="card p-6">
              <h3 className="text-text-primary font-semibold mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Detalhamento de Custos
              </h3>
              <div className="space-y-3">
                {/* Product */}
                <div className="flex items-center justify-between py-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-text-tertiary" />
                    <span className="text-text-secondary">Produto</span>
                  </div>
                  <div className="text-right">
                    <p className="text-text-primary font-medium">{formatCurrency(result.costs_cny.product, 'CNY')}</p>
                    <p className="text-text-tertiary text-sm">{formatCurrency(result.costs_brl.product, 'BRL')}</p>
                  </div>
                </div>

                {/* Pacote e Envio - Grouped Section */}
                {(() => {
                  const shippingTotal = result.costs_cny.freight + result.costs_cny.insurance + result.costs_cny.service_fee;
                  const shippingTotalBrl = result.costs_brl.freight + result.costs_brl.insurance + result.costs_brl.service_fee;
                  const insuranceMax = 90;
                  const maxCoverage = 3000; // Insurance covers up to ¥3000
                  const uncoveredAmount = result.costs_cny.product > maxCoverage ? result.costs_cny.product - maxCoverage : 0;
                  const uncoveredAmountBrl = uncoveredAmount * result.exchange_rates.cny_to_brl;

                  return (
                    <div className="border-b border-border">
                      {/* Collapsed Header */}
                      <button
                        onClick={() => setIsShippingExpanded(!isShippingExpanded)}
                        className="flex items-center justify-between py-3 w-full text-left hover:bg-surface-elevated/50 -mx-2 px-2 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Box className="w-4 h-4 text-text-tertiary" />
                          <span className="text-text-secondary">Pacote e Envio</span>
                          <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${isShippingExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="text-right">
                          <p className="text-text-primary font-medium">{formatCurrency(shippingTotal, 'CNY')}</p>
                          <p className="text-text-tertiary text-sm">{formatCurrency(shippingTotalBrl, 'BRL')}</p>
                        </div>
                      </button>

                      {/* Expanded Details */}
                      <div className={`overflow-hidden transition-all duration-200 ${isShippingExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pl-6 pb-3 space-y-3">
                          {/* Freight */}
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-text-tertiary" />
                              <div>
                                <span className="text-text-secondary text-sm">Frete JD ({result.weight_analysis.weight_used_g}g)</span>
                                <p className="text-text-tertiary text-xs">{formatCurrency(result.freight_details.freight_usd, 'USD')} USD</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-text-primary text-sm">{formatCurrency(result.costs_cny.freight, 'CNY')}</p>
                              <p className="text-text-tertiary text-xs">{formatCurrency(result.costs_brl.freight, 'BRL')}</p>
                            </div>
                          </div>

                          {/* Insurance */}
                          {result.costs_cny.insurance > 0 && (
                            <div className="py-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-text-tertiary" />
                                  <span className="text-text-secondary text-sm">Seguro (3%)</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-text-primary text-sm">{formatCurrency(result.costs_cny.insurance, 'CNY')}</p>
                                  <p className="text-text-tertiary text-xs">{formatCurrency(result.costs_brl.insurance, 'BRL')}</p>
                                </div>
                              </div>
                              {/* Warning when insurance doesn't cover full value */}
                              {uncoveredAmount > 0 && (
                                <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-orange-400 text-xs">
                                    Seguro limitado a ¥{maxCoverage.toLocaleString()}. Valor desprotegido: {formatCurrency(uncoveredAmount, 'CNY')} ({formatCurrency(uncoveredAmountBrl, 'BRL')})
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Service Fee */}
                          <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-2">
                              <Receipt className="w-4 h-4 text-text-tertiary" />
                              <span className="text-text-secondary text-sm">Taxa de Serviço ({(formData.serviceFeeRate * 100).toFixed(0)}%)</span>
                            </div>
                            <div className="text-right">
                              <p className="text-text-primary text-sm">{formatCurrency(result.costs_cny.service_fee, 'CNY')}</p>
                              <p className="text-text-tertiary text-xs">{formatCurrency(result.costs_brl.service_fee, 'BRL')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Total */}
                <div className="flex items-center justify-between pt-4">
                  <span className="text-text-primary font-bold text-lg">CUSTO TOTAL</span>
                  <div className="text-right">
                    <p className="text-primary font-bold text-xl">{formatCurrency(result.costs_cny.total, 'CNY')}</p>
                    <p className="text-primary/80 font-semibold">{formatCurrency(result.costs_brl.total, 'BRL')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Exchange Rates Info */}
            <div className="card p-6 bg-surface-elevated">
              <h3 className="text-text-secondary font-medium mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-text-tertiary" />
                Taxas de Câmbio Usadas
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-tertiary">USD → CNY</p>
                  <p className="text-text-primary font-medium">1 USD = ¥ {result.exchange_rates.usd_to_cny.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-text-tertiary">BRL → CNY</p>
                  <p className="text-text-primary font-medium">R$ 1,00 = ¥ {(1 / result.exchange_rates.cny_to_brl).toFixed(2)}</p>
                </div>
              </div>
              <p className="text-text-tertiary text-xs mt-3">
                Atualizado em: {formatDate(result.exchange_rates.updated_at)}
              </p>
            </div>

            {/* New Simulation Button */}
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 bg-surface hover:bg-surface-elevated border border-border rounded-xl text-text-secondary font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Nova Simulação
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
