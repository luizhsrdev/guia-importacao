'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Shield, Receipt, RefreshCw, Info, AlertTriangle, CheckCircle, ChevronDown, Check, ImageIcon, X } from 'lucide-react';

// Service fee levels
const SERVICE_FEE_LEVELS = [
  { label: 'Sem nível (6%)', value: 0.06 },
  { label: 'Gold (5%)', value: 0.05 },
  { label: 'Platinum (4%)', value: 0.04 },
  { label: 'Diamond (3%)', value: 0.03 },
  { label: 'VIP (2%)', value: 0.02 },
  { label: 'Merchant (1%)', value: 0.01 },
];

// Product attributes that can affect shipping eligibility
const PRODUCT_ATTRIBUTES = [
  { id: 'electric', label: 'Elétrico' },
  { id: 'liquid', label: 'Líquido' },
  { id: 'knives', label: 'Objetos Pontiagudos' },
  { id: 'powder', label: 'Pólvora' },
  { id: 'shoes', label: 'Calçados' },
  { id: 'bags', label: 'Bolsas' },
  { id: 'food', label: 'Alimentos' },
  { id: 'battery', label: 'Bateria' },
  { id: 'cosmetics', label: 'Cosméticos' },
  { id: 'magnetic', label: 'Magnético' },
  { id: 'watch', label: 'Relógio' },
  { id: 'perfume', label: 'Perfume' },
  { id: 'sea_freight', label: 'Frete Marítimo' },
  { id: 'electronic', label: 'Eletrônicos' },
];

// Shipping lines configuration with attribute-based restrictions
const SHIPPING_LINES = [
  {
    label: 'JD-EXP-EF (0-3kg)',
    value: 'JD-0-3kg',
    deliveryDays: '10-15 dias',
    restrictedAttributes: ['powder', 'sea_freight'], // IDs dos atributos restritos
  },
  {
    label: 'JD-EXP-EF Battery (0-12kg)',
    value: 'JD-EXP-EF-Battery-0-12kg',
    deliveryDays: '12-20 dias',
    restrictedAttributes: ['powder', 'sea_freight'],
  },
];

// URL da imagem de referência para identificar o nível no CSSBuy
const CSSBUY_LEVEL_REFERENCE_IMAGE = 'https://res.cloudinary.com/importacao/image/upload/v1770257427/WhatsApp_Image_2026-02-04_at_23.09.29_ixvcgo.jpg';

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
    delivery_days: string;
    max_insured_value_cny: number;
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
  productAttributes: string[];
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
    productAttributes: [],
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isShippingExpanded, setIsShippingExpanded] = useState(false);

  // Dropdown states
  const [isFreightDropdownOpen, setIsFreightDropdownOpen] = useState(false);
  const [isServiceFeeDropdownOpen, setIsServiceFeeDropdownOpen] = useState(false);
  const [isAttributesPopupOpen, setIsAttributesPopupOpen] = useState(false);
  const [showLevelImage, setShowLevelImage] = useState(false);
  const [attributesConfirmed, setAttributesConfirmed] = useState(false);
  const [highlightAttributes, setHighlightAttributes] = useState(false);

  const freightDropdownRef = useRef<HTMLDivElement>(null);
  const serviceFeeDropdownRef = useRef<HTMLDivElement>(null);
  const attributesPopupRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (freightDropdownRef.current && !freightDropdownRef.current.contains(event.target as Node)) {
        setIsFreightDropdownOpen(false);
      }
      if (serviceFeeDropdownRef.current && !serviceFeeDropdownRef.current.contains(event.target as Node)) {
        setIsServiceFeeDropdownOpen(false);
      }
      if (attributesPopupRef.current && !attributesPopupRef.current.contains(event.target as Node)) {
        setIsAttributesPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to check if a shipping line has restricted attributes selected
  const getShippingRestrictions = (shippingLine: typeof SHIPPING_LINES[0]) => {
    const conflicts = shippingLine.restrictedAttributes.filter(attr =>
      formData.productAttributes.includes(attr)
    );
    return conflicts.map(attrId =>
      PRODUCT_ATTRIBUTES.find(a => a.id === attrId)?.label || attrId
    );
  };

  // Format restrictions list with proper Portuguese grammar (commas and "e")
  const formatRestrictionsList = (restrictions: string[]) => {
    if (restrictions.length === 0) return '';
    if (restrictions.length === 1) return restrictions[0];
    if (restrictions.length === 2) return `${restrictions[0]} e ${restrictions[1]}`;
    const lastItem = restrictions[restrictions.length - 1];
    const otherItems = restrictions.slice(0, -1);
    return `${otherItems.join(', ')} e ${lastItem}`;
  };

  // Toggle attribute selection
  const handleAttributeToggle = (attributeId: string) => {
    setFormData(prev => ({
      ...prev,
      productAttributes: prev.productAttributes.includes(attributeId)
        ? prev.productAttributes.filter(id => id !== attributeId)
        : [...prev.productAttributes, attributeId]
    }));
    setResult(null);
    setError(null);
  };

  // Handle freight dropdown click - highlight attributes if not confirmed
  const handleFreightClick = () => {
    if (!attributesConfirmed) {
      setHighlightAttributes(true);
      setTimeout(() => setHighlightAttributes(false), 2000);
      return;
    }
    setIsFreightDropdownOpen(!isFreightDropdownOpen);
    setIsServiceFeeDropdownOpen(false);
    setIsAttributesPopupOpen(false);
  };

  // Confirm attributes selection
  const handleConfirmAttributes = () => {
    setAttributesConfirmed(true);
    setIsAttributesPopupOpen(false);
  };

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
      productAttributes: [],
    });
    setResult(null);
    setError(null);
    setIsShippingExpanded(false);
    setAttributesConfirmed(false);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
            Calculadora de Custo
          </h1>
          <p className="text-text-secondary text-sm sm:text-base">
            Calcule o custo total de importação via CSSBuy com diferentes fretes
          </p>
        </div>

        {/* Form Card */}
        <div className="card p-6 sm:p-8">
          <h2 className="text-text-primary font-semibold text-lg mb-6">
            Dados do Produto
          </h2>

          <div className="space-y-6">
            {/* Product Price */}
            <div>
              <label htmlFor="product-price" className="block text-text-secondary text-sm mb-2">
                Preço do Produto <span className="text-text-tertiary">(¥)</span>
              </label>
              <input
                id="product-price"
                type="text"
                inputMode="decimal"
                value={formData.productPrice}
                onChange={(e) => handleNumericInput('productPrice', e.target.value)}
                placeholder=""
                className="w-full py-3 px-4 bg-surface border border-border-emphasis rounded-xl text-text-primary outline-none outline-0 focus:outline-none focus:outline-0 ring-0 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                style={{ outline: 'none' }}
              />
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-text-secondary text-sm mb-2">
                Peso do Produto <span className="text-text-tertiary">(g)</span>
              </label>
              <input
                id="weight"
                type="text"
                inputMode="numeric"
                value={formData.weightGrams}
                onChange={(e) => handleNumericInput('weightGrams', e.target.value, false)}
                placeholder=""
                className="w-full py-3 px-4 bg-surface border border-border-emphasis rounded-xl text-text-primary outline-none outline-0 focus:outline-none focus:outline-0 ring-0 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                style={{ outline: 'none' }}
              />
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-text-secondary text-sm mb-2">
                Dimensões do Produto <span className="text-text-tertiary">(cm)</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.lengthCm}
                    onChange={(e) => handleNumericInput('lengthCm', e.target.value)}
                    placeholder=""
                    className="w-full py-3 px-4 bg-surface border border-border-emphasis rounded-xl text-text-primary outline-none outline-0 focus:outline-none focus:outline-0 ring-0 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-center"
                    style={{ outline: 'none' }}
                  />
                  <span className="block text-text-tertiary text-xs text-center mt-1">Comprimento</span>
                </div>
                <div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.widthCm}
                    onChange={(e) => handleNumericInput('widthCm', e.target.value)}
                    placeholder=""
                    className="w-full py-3 px-4 bg-surface border border-border-emphasis rounded-xl text-text-primary outline-none outline-0 focus:outline-none focus:outline-0 ring-0 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-center"
                    style={{ outline: 'none' }}
                  />
                  <span className="block text-text-tertiary text-xs text-center mt-1">Largura</span>
                </div>
                <div>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formData.heightCm}
                    onChange={(e) => handleNumericInput('heightCm', e.target.value)}
                    placeholder=""
                    className="w-full py-3 px-4 bg-surface border border-border-emphasis rounded-xl text-text-primary outline-none outline-0 focus:outline-none focus:outline-0 ring-0 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors text-center"
                    style={{ outline: 'none' }}
                  />
                  <span className="block text-text-tertiary text-xs text-center mt-1">Altura</span>
                </div>
              </div>
            </div>

            {/* Product Attributes */}
            <div ref={attributesPopupRef} className="relative">
              <label className={`block text-sm mb-2 transition-colors duration-500 ${highlightAttributes ? 'text-primary font-medium' : 'text-text-secondary'}`}>
                Atributos do Produto {!attributesConfirmed && <span className="text-primary">*</span>}
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsAttributesPopupOpen(!isAttributesPopupOpen);
                  setIsFreightDropdownOpen(false);
                  setIsServiceFeeDropdownOpen(false);
                }}
                className={`w-full py-3 px-4 bg-surface border rounded-xl text-left outline-none transition-all duration-500 ease-out ${
                  highlightAttributes
                    ? 'border-primary ring-2 ring-primary/30'
                    : isAttributesPopupOpen
                    ? 'border-primary ring-2 ring-primary/50'
                    : attributesConfirmed
                    ? 'border-border-emphasis'
                    : 'border-border-emphasis'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!attributesConfirmed ? (
                      <span className={`transition-colors duration-300 ${highlightAttributes ? 'text-primary' : 'text-text-tertiary'}`}>
                        Clique para selecionar os atributos
                      </span>
                    ) : formData.productAttributes.length === 0 ? (
                      <span className="text-text-secondary">Nenhum atributo especial</span>
                    ) : (
                      <span className="text-text-primary">
                        {formatRestrictionsList(
                          formData.productAttributes.map(attrId =>
                            PRODUCT_ATTRIBUTES.find(a => a.id === attrId)?.label || attrId
                          )
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {attributesConfirmed && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                    <ChevronDown className={`w-5 h-5 text-text-tertiary transition-transform duration-300 ${isAttributesPopupOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {/* Attributes Popup */}
              <div
                className={`absolute z-50 w-full mt-2 bg-surface border border-border rounded-2xl shadow-lg transition-all duration-300 ease-out origin-top overflow-hidden ${
                  isAttributesPopupOpen
                    ? 'opacity-100 max-h-[400px] translate-y-0'
                    : 'opacity-0 max-h-0 -translate-y-1 pointer-events-none'
                }`}
              >
                <div className="px-4 py-3 border-b border-border bg-surface-elevated">
                  <p className="text-text-primary font-medium text-sm">Selecione os atributos do produto</p>
                  <p className="text-text-tertiary text-xs mt-1">Isso ajuda a identificar fretes compatíveis</p>
                </div>
                <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
                  {/* None option */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, productAttributes: [] }));
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      formData.productAttributes.length === 0
                        ? 'bg-primary/15 text-primary border border-primary/50'
                        : 'bg-surface-elevated text-text-secondary border border-border hover:border-border-emphasis'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                        formData.productAttributes.length === 0
                          ? 'bg-primary border-2 border-primary shadow-[0_0_0_2px_rgba(0,255,157,0.3)]'
                          : 'bg-transparent border-2 border-text-tertiary'
                      }`}
                    >
                      {formData.productAttributes.length === 0 && (
                        <div className="w-2 h-2 rounded-full bg-black" />
                      )}
                    </div>
                    <span>Nenhum atributo especial</span>
                  </button>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Attributes grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRODUCT_ATTRIBUTES.map((attr) => {
                      const isSelected = formData.productAttributes.includes(attr.id);
                      return (
                        <button
                          key={attr.id}
                          type="button"
                          onClick={() => handleAttributeToggle(attr.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            isSelected
                              ? 'bg-primary/15 text-primary border border-primary/50'
                              : 'bg-surface-elevated text-text-secondary border border-border hover:border-border-emphasis'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? 'bg-primary border-2 border-primary shadow-[0_0_0_2px_rgba(0,255,157,0.3)]'
                                : 'bg-transparent border-2 border-text-tertiary'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-black" />
                            )}
                          </div>
                          <span>{attr.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-border bg-surface-elevated flex justify-end">
                  <button
                    type="button"
                    onClick={handleConfirmAttributes}
                    className="px-4 py-2 bg-primary text-black font-medium text-sm rounded-lg hover:bg-primary/90 transition-all duration-200 active:scale-95"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>

            {/* Shipping Line - Custom Dropdown */}
            <div ref={freightDropdownRef} className="relative">
              <label className="block text-text-secondary text-sm mb-2">
                Frete
              </label>
              <button
                type="button"
                onClick={handleFreightClick}
                className={`w-full py-3 px-4 bg-surface border rounded-xl outline-none transition-all duration-200 flex items-center justify-between ${
                  isFreightDropdownOpen
                    ? 'border-primary ring-2 ring-primary/50'
                    : 'border-border-emphasis'
                }`}
              >
                <span className={!attributesConfirmed ? 'text-text-tertiary' : 'text-text-primary'}>
                  {!attributesConfirmed ? 'Selecione os atributos primeiro' : SHIPPING_LINES.find(l => l.value === formData.shippingLine)?.label}
                </span>
                <ChevronDown className={`w-5 h-5 text-text-tertiary transition-transform duration-300 ${isFreightDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute z-50 w-full mt-2 bg-surface border border-border rounded-2xl shadow-lg transition-all duration-300 ease-out origin-top overflow-hidden ${
                  isFreightDropdownOpen
                    ? 'opacity-100 max-h-[300px] translate-y-0'
                    : 'opacity-0 max-h-0 -translate-y-1 pointer-events-none'
                }`}
              >
                {SHIPPING_LINES.map((line) => {
                  const restrictions = getShippingRestrictions(line);
                  const isRestricted = restrictions.length > 0;
                  const isSelected = formData.shippingLine === line.value;

                  return (
                    <button
                      key={line.value}
                      type="button"
                      onClick={() => {
                        if (!isRestricted) {
                          handleInputChange('shippingLine', line.value);
                          setIsFreightDropdownOpen(false);
                        }
                      }}
                      disabled={isRestricted}
                      className={`w-full py-3 px-4 text-left transition-all duration-200 ${
                        isRestricted
                          ? 'bg-red-500/5 cursor-not-allowed'
                          : isSelected
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : 'hover:bg-surface-elevated'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className={
                            isRestricted
                              ? 'text-red-400 font-medium'
                              : isSelected
                              ? 'text-primary font-medium'
                              : 'text-text-primary'
                          }>
                            {line.label}
                          </span>
                          <p className={`text-xs mt-1 ${isRestricted ? 'text-red-400/70' : 'text-text-tertiary'}`}>
                            {line.deliveryDays}
                          </p>
                          {isRestricted && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-red-400 text-xs">
                                Incompatível: {formatRestrictionsList(restrictions)}
                              </span>
                            </div>
                          )}
                        </div>
                        {isSelected && !isRestricted && (
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                        {isRestricted && (
                          <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Service Fee Level - Custom Dropdown */}
            <div ref={serviceFeeDropdownRef} className="relative">
              <label className="text-text-secondary text-sm mb-2 flex items-center gap-2">
                Nível e Taxa de Serviço
                {/* Image Reference Button with Hover Preview */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowLevelImage(true)}
                  onMouseLeave={() => setShowLevelImage(false)}
                >
                  <button
                    type="button"
                    onClick={() => setShowLevelImage(true)}
                    className="w-6 h-6 rounded-md bg-surface hover:bg-surface-elevated border border-border hover:border-border-emphasis flex items-center justify-center transition-all cursor-pointer active:scale-95"
                    aria-label="Ver onde encontrar seu nível no CSSBuy"
                  >
                    <ImageIcon className="w-3 h-3 text-text-tertiary" />
                  </button>

                  {/* Preview popup - desktop only (hover) */}
                  <div
                    className={`hidden sm:block absolute left-0 bottom-full mb-2 z-50 transition-all duration-200 ease-out ${
                      showLevelImage
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-2 pointer-events-none'
                    }`}
                  >
                    <div className="bg-surface border border-border rounded-xl shadow-2xl overflow-hidden" style={{ minWidth: '320px' }}>
                      {CSSBUY_LEVEL_REFERENCE_IMAGE ? (
                        <img
                          src={CSSBUY_LEVEL_REFERENCE_IMAGE}
                          alt="Onde encontrar seu nível no CSSBuy"
                          style={{ width: '320px', height: 'auto', maxHeight: '240px' }}
                          className="object-contain bg-background"
                        />
                      ) : (
                        <div style={{ width: '320px', height: '160px' }} className="bg-surface-elevated flex flex-col items-center justify-center gap-2">
                          <ImageIcon className="w-8 h-8 text-text-tertiary" />
                          <span className="text-text-tertiary text-xs">Imagem de referência</span>
                        </div>
                      )}
                      <div className="px-3 py-2 bg-surface-elevated border-t border-border">
                        <p className="text-xs text-text-secondary">Onde encontrar seu nível no CSSBuy</p>
                      </div>
                    </div>
                    {/* Tooltip arrow */}
                    <div className="absolute left-2 -bottom-1.5 w-3 h-3 bg-surface-elevated border-r border-b border-border transform rotate-45" />
                  </div>
                </div>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsServiceFeeDropdownOpen(!isServiceFeeDropdownOpen);
                  setIsFreightDropdownOpen(false);
                  setIsAttributesPopupOpen(false);
                }}
                className={`w-full py-3 px-4 bg-surface border rounded-xl text-text-primary outline-none transition-all duration-200 flex items-center justify-between ${
                  isServiceFeeDropdownOpen ? 'border-primary ring-2 ring-primary/50' : 'border-border-emphasis'
                }`}
              >
                <span>{SERVICE_FEE_LEVELS.find(l => l.value === formData.serviceFeeRate)?.label}</span>
                <ChevronDown className={`w-5 h-5 text-text-tertiary transition-transform duration-300 ${isServiceFeeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <div
                className={`absolute z-50 w-full mt-2 bg-surface border border-border rounded-2xl shadow-lg transition-all duration-300 ease-out origin-top overflow-hidden ${
                  isServiceFeeDropdownOpen
                    ? 'opacity-100 max-h-[350px] translate-y-0'
                    : 'opacity-0 max-h-0 -translate-y-1 pointer-events-none'
                }`}
              >
                {SERVICE_FEE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => {
                      handleInputChange('serviceFeeRate', level.value);
                      setIsServiceFeeDropdownOpen(false);
                    }}
                    className={`w-full py-3 px-4 text-left flex items-center justify-between hover:bg-surface-elevated transition-all duration-200 ${
                      formData.serviceFeeRate === level.value ? 'bg-primary/10 text-primary' : 'text-text-primary'
                    }`}
                  >
                    <span>{level.label}</span>
                    {formData.serviceFeeRate === level.value && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>

            </div>

            {/* Level Reference Image Modal - Mobile only (click) */}
            {showLevelImage && (
              <div
                className="sm:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowLevelImage(false)}
              >
                <div
                  className="relative w-full max-w-lg bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-surface-elevated border-b border-border">
                    <p className="text-sm font-medium text-text-primary">Onde encontrar seu nível</p>
                    <button
                      onClick={() => setShowLevelImage(false)}
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
                    {CSSBUY_LEVEL_REFERENCE_IMAGE ? (
                      <img
                        src={CSSBUY_LEVEL_REFERENCE_IMAGE}
                        alt="Onde encontrar seu nível no CSSBuy"
                        className="w-full h-auto max-h-[50vh] object-contain"
                      />
                    ) : (
                      <div className="w-full h-40 flex flex-col items-center justify-center gap-2 bg-surface-elevated">
                        <ImageIcon className="w-10 h-10 text-text-tertiary" />
                        <p className="text-text-tertiary text-sm text-center px-4">
                          Imagem de referência
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 bg-surface-elevated border-t border-border">
                    <p className="text-xs text-text-secondary">
                      Acesse seu perfil no CSSBuy para verificar seu nível de membro.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance Checkbox - Custom */}
            <button
              type="button"
              onClick={() => handleInputChange('includeInsurance', !formData.includeInsurance)}
              className="flex items-start gap-3 p-4 bg-surface-elevated rounded-xl border border-border hover:border-border-emphasis transition-colors w-full text-left"
            >
              {/* Custom Checkbox */}
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  formData.includeInsurance
                    ? 'bg-primary border-primary'
                    : 'bg-surface border-2 border-border-emphasis'
                }`}
              >
                {formData.includeInsurance && (
                  <Check className="w-3.5 h-3.5 text-black" />
                )}
              </div>
              <div className="flex-1">
                <span className="text-text-primary font-medium">
                  Incluir Seguro (3%)
                </span>
                <p className="text-text-tertiary text-xs mt-1">
                  Proteção até ¥3.000 do valor total (produto + frete), máximo ¥90
                </p>
              </div>
            </button>

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
                className="flex-1 py-3 px-4 bg-surface hover:bg-surface-elevated border border-border-emphasis rounded-xl text-text-secondary font-medium transition-colors flex items-center justify-center gap-2"
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
                  'Calcular Custo Total'
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
              <h3 className="text-text-primary font-semibold mb-4">
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
              <h3 className="text-text-primary font-semibold mb-4">
                Detalhamento de Custos
              </h3>
              <div className="space-y-3">
                {/* Product */}
                <div className="flex items-center justify-between py-3 border-b border-border-emphasis">
                  <span className="text-text-secondary">Produto</span>
                  <div className="text-right min-w-[120px]">
                    <p className="text-text-primary font-medium">{formatCurrency(result.costs_cny.product, 'CNY')}</p>
                    <p className="text-text-tertiary text-sm">{formatCurrency(result.costs_brl.product, 'BRL')}</p>
                  </div>
                </div>

                {/* Pacote e Envio - Grouped Section */}
                {(() => {
                  const shippingTotal = result.costs_cny.freight + result.costs_cny.insurance + result.costs_cny.service_fee;
                  const shippingTotalBrl = result.costs_brl.freight + result.costs_brl.insurance + result.costs_brl.service_fee;
                  const maxCoverage = result.freight_details.max_insured_value_cny;
                  const totalCoverable = result.costs_cny.product + result.costs_cny.freight;
                  const uncoveredAmount = totalCoverable > maxCoverage ? totalCoverable - maxCoverage : 0;
                  const uncoveredAmountBrl = uncoveredAmount * result.exchange_rates.cny_to_brl;

                  return (
                    <div className="border-b border-border-emphasis">
                      {/* Collapsed Header */}
                      <button
                        onClick={() => setIsShippingExpanded(!isShippingExpanded)}
                        className="flex items-center justify-between py-3 w-full text-left hover:bg-surface-elevated/50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-text-secondary">Pacote e Envio</span>
                          <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform duration-200 ${isShippingExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="text-right min-w-[120px]">
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
                              <span className="text-text-secondary text-sm">Frete ({result.weight_analysis.weight_used_g}g)</span>
                            </div>
                            <div className="text-right min-w-[100px]">
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
                                <div className="text-right min-w-[100px]">
                                  <p className="text-text-primary text-sm">{formatCurrency(result.costs_cny.insurance, 'CNY')}</p>
                                  <p className="text-text-tertiary text-xs">{formatCurrency(result.costs_brl.insurance, 'BRL')}</p>
                                </div>
                              </div>
                              {/* Warning when insurance doesn't cover full value */}
                              {uncoveredAmount > 0 && (
                                <div className="mt-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg flex items-start gap-2">
                                  <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                                  <p className="text-orange-400 text-xs">
                                    Seguro cobre até ¥{maxCoverage.toLocaleString()} do total (produto + frete). Valor desprotegido: {formatCurrency(uncoveredAmount, 'CNY')} ({formatCurrency(uncoveredAmountBrl, 'BRL')})
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
                            <div className="text-right min-w-[100px]">
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
                  <div className="text-right min-w-[120px]">
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
                Taxa de Câmbio Usada
              </h3>
              <div className="text-sm">
                <p className="text-text-tertiary">BRL → CNY</p>
                <p className="text-text-primary font-medium">R$ 1,00 = ¥ {(1 / result.exchange_rates.cny_to_brl).toFixed(2)}</p>
              </div>
              <p className="text-text-tertiary text-xs mt-3">
                Atualizado em: {formatDate(result.exchange_rates.updated_at)}
              </p>
            </div>

            {/* New Simulation Button */}
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 bg-surface hover:bg-surface-elevated border border-border-emphasis rounded-xl text-text-secondary font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Nova Simulação
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-surface-elevated rounded-xl border border-border">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-text-tertiary flex-shrink-0 mt-0.5" />
            <p className="text-text-tertiary text-xs leading-relaxed">
              Os valores calculados nesta página são aproximados e utilizam as fórmulas disponibilizadas pela CSSBuy.
              Os resultados podem apresentar pequenas variações em relação aos valores finais cobrados pela plataforma.
              Não nos responsabilizamos por diferenças nos valores.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
