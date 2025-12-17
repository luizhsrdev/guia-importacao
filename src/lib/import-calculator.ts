import type { ImportCalculationInput, ImportCalculationResult } from '@/types';

const IOF_RATE = 0.0038;
const ICMS_RATE = 0.17;
const IMPORT_TAX_RATE_HIGH = 0.60;
const REMESSA_CONFORME_LIMIT_USD = 50;

export function calculateImportCost(input: ImportCalculationInput): ImportCalculationResult {
  const {
    productPriceCny,
    shippingCny,
    exchangeRateCnyToBrl,
    serviceFeePercent,
    productValueUsd,
    isRemessaConforme,
  } = input;

  const productBrl = productPriceCny * exchangeRateCnyToBrl;
  const shippingBrl = shippingCny * exchangeRateCnyToBrl;
  const subtotalBeforeFee = productBrl + shippingBrl;

  const serviceFee = subtotalBeforeFee * (serviceFeePercent / 100);
  const cifBrl = subtotalBeforeFee + serviceFee;

  const iof = cifBrl * IOF_RATE;

  let importTaxRate = 0;

  if (isRemessaConforme && productValueUsd <= REMESSA_CONFORME_LIMIT_USD) {
    importTaxRate = 0;
  } else if (productValueUsd > REMESSA_CONFORME_LIMIT_USD) {
    importTaxRate = IMPORT_TAX_RATE_HIGH;
  }

  const importTax = cifBrl * importTaxRate;

  const icmsBase = cifBrl + iof + importTax;
  const icms = (icmsBase / (1 - ICMS_RATE)) * ICMS_RATE;

  const totalBrl = cifBrl + iof + importTax + icms;

  return {
    productBrl: roundToTwo(productBrl),
    shippingBrl: roundToTwo(shippingBrl),
    serviceFee: roundToTwo(serviceFee),
    subtotal: roundToTwo(cifBrl),
    iof: roundToTwo(iof),
    icms: roundToTwo(icms),
    importTax: roundToTwo(importTax),
    totalBrl: roundToTwo(totalBrl),
  };
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatBrl(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
