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
    <div className="space-y-6">
      <div className="bg-surface border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-textMain mb-4">Valores do Produto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-textSecondary mb-2">
              Preço do Produto (¥)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={form.productPriceCny}
              onChange={(e) => handleInputChange('productPriceCny', e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-textMain placeholder:text-zinc-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-textSecondary mb-2">
              Frete Estimado (¥)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={form.shippingCny}
              onChange={(e) => handleInputChange('shippingCny', e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-textMain placeholder:text-zinc-500 focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm text-textSecondary mb-2">
              Valor em USD (para taxação)
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={form.productValueUsd}
              onChange={(e) => handleInputChange('productValueUsd', e.target.value)}
              placeholder="0.00"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-textMain placeholder:text-zinc-500 focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Usado para determinar a faixa de impostos
            </p>
          </div>

          <div>
            <label className="block text-sm text-textSecondary mb-2">
              Câmbio CNY → BRL
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={form.exchangeRate}
              onChange={(e) => handleInputChange('exchangeRate', e.target.value)}
              placeholder="0.80"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-textMain placeholder:text-zinc-500 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface border border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-bold text-textMain mb-4">Agente e Taxação</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-textSecondary mb-2">
              Agente de Compras
            </label>
            <select
              value={form.selectedAgent}
              onChange={(e) => handleAgentChange(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-textMain focus:outline-none focus:border-primary"
            >
              {AGENT_OPTIONS.map((agent) => (
                <option key={agent.label} value={agent.label}>
                  {agent.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="remessaConforme"
              checked={form.isRemessaConforme}
              onChange={(e) => handleInputChange('isRemessaConforme', e.target.checked)}
              className="w-5 h-5 rounded border-zinc-700 bg-zinc-800 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <label htmlFor="remessaConforme" className="text-textSecondary">
              Vendedor participa do Remessa Conforme
            </label>
          </div>
          <p className="text-xs text-zinc-500">
            Se marcado e valor ≤ US$ 50, não incide Imposto de Importação (apenas ICMS 17%)
          </p>
        </div>
      </div>

      {result && (
        <div className="bg-surface border border-primary/30 rounded-xl p-6">
          <h2 className="text-lg font-bold text-textMain mb-4">Resultado</h2>

          <div className="space-y-3">
            <ResultRow label="Produto" value={result.productBrl} />
            <ResultRow label="Frete" value={result.shippingBrl} />
            <ResultRow label="Taxa do Agente" value={result.serviceFee} />
            <div className="border-t border-zinc-700 my-2" />
            <ResultRow label="Subtotal (CIF)" value={result.subtotal} />
            <ResultRow label="IOF (0,38%)" value={result.iof} />
            <ResultRow label="Imposto de Importação" value={result.importTax} highlight={result.importTax > 0} />
            <ResultRow label="ICMS (17%)" value={result.icms} />
            <div className="border-t border-zinc-700 my-2" />
            <div className="flex justify-between items-center text-lg">
              <span className="font-bold text-textMain">Total Final</span>
              <span className="font-bold text-primary text-xl">
                {formatBrl(result.totalBrl)}
              </span>
            </div>
          </div>

          {result.importTax === 0 && (
            <div className="mt-4 bg-primary/10 border border-primary/20 rounded-lg p-3">
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
      <span className="text-textSecondary">{label}</span>
      <span className={highlight ? 'text-red-400' : 'text-textMain'}>
        {formatBrl(value)}
      </span>
    </div>
  );
}
