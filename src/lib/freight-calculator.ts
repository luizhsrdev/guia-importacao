import type {
  ShippingRoute,
  FreightCalculationInput,
  FreightCalculationResult,
  VIPLevel,
} from '@/types';

const INSURANCE_RATE = 0.03;

const VIP_SERVICE_FEE: Record<VIPLevel, number> = {
  0: 5,
  1: 4,
  2: 3,
  3: 2.5,
  4: 2,
  5: 1,
};

export const SHIPPING_ROUTES: ShippingRoute[] = [
  {
    id: 'china-post-air',
    name: 'China Post Air Mail',
    type: 'volumetric',
    firstWeight: 48,
    secondWeight: 25,
    increment: 0.5,
    deliveryDays: '15-30',
    maxWeight: 2,
  },
  {
    id: 'china-post-sal',
    name: 'China Post SAL',
    type: 'volumetric',
    firstWeight: 38,
    secondWeight: 18,
    increment: 0.5,
    deliveryDays: '30-60',
    maxWeight: 2,
  },
  {
    id: 'ems',
    name: 'EMS',
    type: 'volumetric',
    firstWeight: 120,
    secondWeight: 30,
    increment: 0.5,
    deliveryDays: '7-15',
  },
  {
    id: 'epacket-air',
    name: 'E-Packet Air',
    type: 'volumetric',
    firstWeight: 65,
    secondWeight: 28,
    increment: 0.5,
    deliveryDays: '12-20',
    maxWeight: 2,
  },
  {
    id: 'epacket',
    name: 'ePacket',
    type: 'volumetric',
    firstWeight: 55,
    secondWeight: 20,
    increment: 0.5,
    deliveryDays: '15-25',
    maxWeight: 2,
  },
  {
    id: 'sea-mail',
    name: 'Sea Mail',
    type: 'pure_weight',
    firstWeight: 30,
    secondWeight: 12,
    increment: 0.5,
    deliveryDays: '60-90',
    maxWeight: 2,
  },
  {
    id: 'china-post-train',
    name: 'China Post Via Train',
    type: 'volumetric',
    firstWeight: 42,
    secondWeight: 15,
    increment: 0.5,
    deliveryDays: '25-40',
  },
  {
    id: 'china-post-water',
    name: 'China Post Water Mails',
    type: 'volumetric',
    firstWeight: 35,
    secondWeight: 14,
    increment: 0.5,
    deliveryDays: '45-75',
  },
  {
    id: 'dhl',
    name: 'DHL',
    type: 'pure_weight',
    firstWeight: 180,
    secondWeight: 45,
    increment: 0.5,
    deliveryDays: '3-7',
    minWeight: 0.5,
  },
  {
    id: 'fedex-small',
    name: 'FedEx Small',
    type: 'pure_weight',
    firstWeight: 160,
    secondWeight: 40,
    increment: 0.5,
    deliveryDays: '4-8',
    minWeight: 0.5,
    maxWeight: 5,
  },
];

function calculateVolumetricWeight(
  length: number,
  width: number,
  height: number
): number {
  return Math.ceil((length * width * height * 1000) / 8000);
}

function calculateEffectiveWeight(
  actualWeight: number,
  volumetricWeight: number,
  routeType: 'volumetric' | 'pure_weight'
): number {
  if (routeType === 'pure_weight') {
    return actualWeight;
  }
  return Math.max(actualWeight, volumetricWeight);
}

function calculateShippingCost(
  effectiveWeight: number,
  route: ShippingRoute
): number {
  if (effectiveWeight <= 1) {
    return route.firstWeight;
  }

  const additionalWeight = effectiveWeight - 1;
  const additionalBlocks = Math.ceil(additionalWeight / route.increment);
  return route.firstWeight + additionalBlocks * route.secondWeight;
}

export function calculateFreight(
  input: FreightCalculationInput
): FreightCalculationResult {
  const route = SHIPPING_ROUTES.find((r) => r.id === input.routeId);

  if (!route) {
    throw new Error('Rota de envio inválida');
  }

  const volumetricWeight = calculateVolumetricWeight(
    input.length,
    input.width,
    input.height
  );

  const effectiveWeight = calculateEffectiveWeight(
    input.weight,
    volumetricWeight,
    route.type
  );

  const shippingCostCny = calculateShippingCost(effectiveWeight, route);

  const insuranceCny = input.productPriceCny * INSURANCE_RATE;

  const subtotalCny = shippingCostCny + insuranceCny;

  const serviceFeePercent = VIP_SERVICE_FEE[input.vipLevel];
  const serviceFeeCny = subtotalCny * (serviceFeePercent / 100);

  const totalCny = subtotalCny + serviceFeeCny;
  const totalBrl = totalCny * input.cnyToBrl;

  return {
    actualWeight: Math.round(input.weight * 100) / 100,
    volumetricWeight: Math.round(volumetricWeight * 100) / 100,
    effectiveWeight: Math.round(effectiveWeight * 100) / 100,
    shippingCostCny: Math.round(shippingCostCny * 100) / 100,
    insuranceCny: Math.round(insuranceCny * 100) / 100,
    subtotalCny: Math.round(subtotalCny * 100) / 100,
    serviceFeePercent,
    serviceFeeCny: Math.round(serviceFeeCny * 100) / 100,
    totalCny: Math.round(totalCny * 100) / 100,
    totalBrl: Math.round(totalBrl * 100) / 100,
    deliveryDays: route.deliveryDays,
  };
}

export function formatCny(value: number): string {
  return `¥ ${value.toFixed(2)}`;
}

export function formatBrl(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatKg(value: number): string {
  return `${value.toFixed(2)} kg`;
}
