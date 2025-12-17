'use client';

import { useState, useMemo } from 'react';
import { calculateImportCost, formatBrl } from '@/lib/import-calculator';
import type { ImportCalculationResult } from '@/types';

const DEFAULT_CNY_TO_BRL = 0.80;

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

const INITIAL_FORM: FormState = {
  productPriceCny: '',
  shippingCny: '',
  serviceFeePercent: '5',
  productValueUsd: '',
  exchangeRate: DEFAULT_CNY_TO_BRL.toString(),
  isRemessaConforme: true,
  selectedAgent: 'CSSBuy (5%)',
};

export function CalculadoraClient() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

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

  const handleInputChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  return (
    <div className="space-y-5">
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
