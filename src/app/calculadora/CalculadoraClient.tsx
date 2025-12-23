'use client';

import { useState, useMemo } from 'react';
import { calculateImportCost, formatBrl } from '@/lib/import-calculator';
import {
  calculateFreight,
  SHIPPING_ROUTES,
  formatCny,
  formatBrl as formatBrlFreight,
  formatKg,
} from '@/lib/freight-calculator';
import type { ImportCalculationResult, FreightCalculationResult, VIPLevel } from '@/types';

const DEFAULT_CNY_TO_BRL = 0.80;
const DEFAULT_USD_TO_CNY = 6.5;

interface AgentOption {
  label: string;
  value: number;
}

const AGENT_OPTIONS: AgentOption[] = [
  { label: 'CSSBuy (5%)', value: 5 },
  { label: 'Sugargoo (6%)', value: 6 },
  { label: 'Pandabuy (5%)', value: 5 },
  { label: 'Wegobuy (6%)', value: 6 },
  { label: 'Basetao (5%)', value: 5 },
];

interface FormState {
  productPriceCny: string;
  shippingCny: string;
  serviceFeePercent: string;
  productValueUsd: string;
  exchangeRate: string;
  isRemessaConforme: boolean;
  selectedAgent: string;
}

interface FreightFormState {
  productPriceCny: string;
  weight: string;
  length: string;
  width: string;
  height: string;
  routeId: string;
  vipLevel: string;
  usdToCny: string;
  cnyToBrl: string;
}

const INITIAL_FORM: FormState = {
  productPriceCny: '',
  shippingCny: '',
  serviceFeePercent: '5',
  productValueUsd: '',
  exchangeRate: DEFAULT_CNY_TO_BRL.toString(),
  isRemessaConforme: true,
  selectedAgent: 'CSSBuy (5%)',
};

const INITIAL_FREIGHT_FORM: FreightFormState = {
  productPriceCny: '',
  weight: '',
  length: '',
  width: '',
  height: '',
  routeId: 'china-post-air',
  vipLevel: '0',
  usdToCny: DEFAULT_USD_TO_CNY.toString(),
  cnyToBrl: DEFAULT_CNY_TO_BRL.toString(),
};

export function CalculadoraClient() {
  const [activeCalculator, setActiveCalculator] = useState<'import' | 'freight'>('freight');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [freightForm, setFreightForm] = useState<FreightFormState>(INITIAL_FREIGHT_FORM);

  const result: ImportCalculationResult | null = useMemo(() => {
    const productCny = parseFloat(form.productPriceCny) || 0;
    const shippingCny = parseFloat(form.shippingCny) || 0;
    const serviceFee = parseFloat(form.serviceFeePercent) || 0;
    const productUsd = parseFloat(form.productValueUsd) || 0;
    const exchangeRate = parseFloat(form.exchangeRate) || DEFAULT_CNY_TO_BRL;

    if (productCny === 0) {
      return null;
    }

    return calculateImportCost({
      productPriceCny: productCny,
      shippingCny,
      exchangeRateCnyToBrl: exchangeRate,
      serviceFeePercent: serviceFee,
      productValueUsd: productUsd,
      isRemessaConforme: form.isRemessaConforme,
    });
  }, [form]);

  const freightResult: FreightCalculationResult | null = useMemo(() => {
    const productCny = parseFloat(freightForm.productPriceCny) || 0;
    const weight = parseFloat(freightForm.weight) || 0;
    const length = parseFloat(freightForm.length) || 0;
    const width = parseFloat(freightForm.width) || 0;
    const height = parseFloat(freightForm.height) || 0;
    const vipLevel = parseInt(freightForm.vipLevel) as VIPLevel;
    const usdToCny = parseFloat(freightForm.usdToCny) || DEFAULT_USD_TO_CNY;
    const cnyToBrl = parseFloat(freightForm.cnyToBrl) || DEFAULT_CNY_TO_BRL;

    if (productCny === 0 || weight === 0) {
      return null;
    }

    try {
      return calculateFreight({
        productPriceCny: productCny,
        weight,
        length,
        width,
        height,
        routeId: freightForm.routeId,
        vipLevel,
        usdToCny,
        cnyToBrl,
      });
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      return null;
    }
  }, [freightForm]);

  const handleInputChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFreightInputChange = (field: keyof FreightFormState, value: string) => {
    setFreightForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAgentChange = (agentLabel: string) => {
    const agent = AGENT_OPTIONS.find((a) => a.label === agentLabel);
    if (agent) {
      setForm((prev) => ({
        ...prev,
        selectedAgent: agentLabel,
        serviceFeePercent: agent.value.toString(),
      }));
    }
  };

  const selectedRoute = SHIPPING_ROUTES.find((r) => r.id === freightForm.routeId);

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveCalculator('freight')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeCalculator === 'freight'
                ? 'bg-primary text-background'
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/70'
            }`}
          >
            Frete CSSBuy
          </button>
          <button
            onClick={() => setActiveCalculator('import')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeCalculator === 'import'
                ? 'bg-primary text-background'
                : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/70'
            }`}
          >
            Impostos de Importação
          </button>
        </div>
      </div>

      {activeCalculator === 'freight' ? (
        <>
          <div className="card p-5">
            <h2 className="text-base font-medium text-text-primary mb-4">Informações do Produto</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Valor do Produto (¥)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={freightForm.productPriceCny}
                  onChange={(e) => handleFreightInputChange('productPriceCny', e.target.value)}
                  placeholder="0.00"
                  className="input-field"
                />
                <p className="text-xs text-text-tertiary mt-1.5">
                  Usado para calcular o seguro (3%)
                </p>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Peso Real (kg)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={freightForm.weight}
                  onChange={(e) => handleFreightInputChange('weight', e.target.value)}
                  placeholder="0.00"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Comprimento (cm)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={freightForm.length}
                  onChange={(e) => handleFreightInputChange('length', e.target.value)}
                  placeholder="0"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Largura (cm)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={freightForm.width}
                  onChange={(e) => handleFreightInputChange('width', e.target.value)}
                  placeholder="0"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Altura (cm)
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={freightForm.height}
                  onChange={(e) => handleFreightInputChange('height', e.target.value)}
                  placeholder="0"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="text-base font-medium text-text-primary mb-4">Configurações de Envio</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-text-secondary mb-2">
                  Rota de Envio
                </label>
                <select
                  value={freightForm.routeId}
                  onChange={(e) => handleFreightInputChange('routeId', e.target.value)}
                  className="input-field"
                >
                  {SHIPPING_ROUTES.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.name} - {route.deliveryDays} dias
                      {route.type === 'volumetric' ? ' (Volumétrico)' : ' (Peso Puro)'}
                    </option>
                  ))}
                </select>
                {selectedRoute && (
                  <p className="text-xs text-text-tertiary mt-1.5">
                    1º Peso: {formatCny(selectedRoute.firstWeight)} | 2º Peso: {formatCny(selectedRoute.secondWeight)} a cada {selectedRoute.increment}kg
                    {selectedRoute.minWeight && ` | Peso mínimo: ${selectedRoute.minWeight}kg`}
                    {selectedRoute.maxWeight && ` | Peso máximo: ${selectedRoute.maxWeight}kg`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Nível VIP CSSBuy
                </label>
                <select
                  value={freightForm.vipLevel}
                  onChange={(e) => handleFreightInputChange('vipLevel', e.target.value)}
                  className="input-field"
                >
                  <option value="0">VIP 0 (5% taxa)</option>
                  <option value="1">VIP 1 (4% taxa)</option>
                  <option value="2">VIP 2 (3% taxa)</option>
                  <option value="3">VIP 3 (2.5% taxa)</option>
                  <option value="4">VIP 4 (2% taxa)</option>
                  <option value="5">VIP 5 (1% taxa)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Câmbio USD → CNY
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={freightForm.usdToCny}
                  onChange={(e) => handleFreightInputChange('usdToCny', e.target.value)}
                  placeholder="6.5"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Câmbio CNY → BRL
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={freightForm.cnyToBrl}
                  onChange={(e) => handleFreightInputChange('cnyToBrl', e.target.value)}
                  placeholder="0.80"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {freightResult && (
            <div className="card border-primary/30 p-5">
              <h2 className="text-base font-medium text-text-primary mb-4">Resultado do Frete</h2>

              <div className="space-y-3">
                <div className="bg-surface-elevated rounded-lg p-3 mb-3">
                  <h3 className="text-sm font-medium text-text-secondary mb-2">Análise de Peso</h3>
                  <div className="space-y-2 text-sm">
                    <FreightRow label="Peso Real" value={formatKg(freightResult.actualWeight)} />
                    <FreightRow label="Peso Volumétrico" value={formatKg(freightResult.volumetricWeight)} />
                    <FreightRow
                      label="Peso Efetivo (Cobrado)"
                      value={formatKg(freightResult.effectiveWeight)}
                      highlight
                    />
                  </div>
                </div>

                <FreightRow label="Custo do Frete" value={formatCny(freightResult.shippingCostCny)} />
                <FreightRow label="Seguro (3%)" value={formatCny(freightResult.insuranceCny)} />
                <div className="divider my-3" />
                <FreightRow label="Subtotal" value={formatCny(freightResult.subtotalCny)} />
                <FreightRow
                  label={`Taxa de Serviço (${freightResult.serviceFeePercent}%)`}
                  value={formatCny(freightResult.serviceFeeCny)}
                />
                <div className="divider my-3" />
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text-primary">Total em CNY</span>
                  <span className="font-bold text-primary text-lg">
                    {formatCny(freightResult.totalCny)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-text-primary">Total em BRL</span>
                  <span className="font-bold text-primary text-xl">
                    {formatBrlFreight(freightResult.totalBrl)}
                  </span>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-md p-3 mt-3">
                  <p className="text-primary text-sm">
                    Prazo de entrega: {freightResult.deliveryDays} dias úteis
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="card p-5">
            <h2 className="text-base font-medium text-text-primary mb-4">Valores do Produto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Preço do Produto (¥)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={form.productPriceCny}
              onChange={(e) => handleInputChange('productPriceCny', e.target.value)}
              placeholder="0.00"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Frete Estimado (¥)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={form.shippingCny}
              onChange={(e) => handleInputChange('shippingCny', e.target.value)}
              placeholder="0.00"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Valor em USD (para taxação)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={form.productValueUsd}
              onChange={(e) => handleInputChange('productValueUsd', e.target.value)}
              placeholder="0.00"
              className="input-field"
            />
            <p className="text-xs text-text-tertiary mt-1.5">
              Usado para determinar a faixa de impostos
            </p>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Câmbio CNY → BRL
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={form.exchangeRate}
              onChange={(e) => handleInputChange('exchangeRate', e.target.value)}
              placeholder="0.80"
              className="input-field"
            />
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-base font-medium text-text-primary mb-4">Agente e Taxação</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-2">
              Agente de Compras
            </label>
            <select
              value={form.selectedAgent}
              onChange={(e) => handleAgentChange(e.target.value)}
              className="input-field"
            >
              {AGENT_OPTIONS.map((agent) => (
                <option key={agent.label} value={agent.label}>
                  {agent.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={form.isRemessaConforme}
                onChange={(e) => handleInputChange('isRemessaConforme', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border border-border-emphasis rounded peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 flex items-center justify-center">
                {form.isRemessaConforme && (
                  <svg className="w-3 h-3 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-text-secondary text-sm">
              Vendedor participa do Remessa Conforme
            </span>
          </label>
          <p className="text-xs text-text-tertiary">
            Se marcado e valor ≤ US$ 50, não incide Imposto de Importação (apenas ICMS 17%)
          </p>
        </div>
      </div>

      {result && (
        <div className="card border-primary/30 p-5">
          <h2 className="text-base font-medium text-text-primary mb-4">Resultado</h2>

          <div className="space-y-3">
            <ResultRow label="Produto" value={result.productBrl} />
            <ResultRow label="Frete" value={result.shippingBrl} />
            <ResultRow label="Taxa do Agente" value={result.serviceFee} />
            <div className="divider my-3" />
            <ResultRow label="Subtotal (CIF)" value={result.subtotal} />
            <ResultRow label="IOF (0,38%)" value={result.iof} />
            <ResultRow label="Imposto de Importação" value={result.importTax} highlight={result.importTax > 0} />
            <ResultRow label="ICMS (17%)" value={result.icms} />
            <div className="divider my-3" />
            <div className="flex justify-between items-center">
              <span className="font-medium text-text-primary">Total Final</span>
              <span className="font-bold text-primary text-xl">
                {formatBrl(result.totalBrl)}
              </span>
            </div>
          </div>

          {result.importTax === 0 && (
            <div className="mt-4 bg-primary/10 border border-primary/20 rounded-md p-3">
              <p className="text-primary text-sm">
                Isento de Imposto de Importação (Remessa Conforme até US$ 50)
              </p>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}

interface ResultRowProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function ResultRow({ label, value, highlight = false }: ResultRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className={`text-sm ${highlight ? 'text-danger' : 'text-text-primary'}`}>
        {formatBrl(value)}
      </span>
    </div>
  );
}

interface FreightRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function FreightRow({ label, value, highlight = false }: FreightRowProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className={`text-sm ${highlight ? 'text-primary font-medium' : 'text-text-primary'}`}>
        {value}
      </span>
    </div>
  );
}
