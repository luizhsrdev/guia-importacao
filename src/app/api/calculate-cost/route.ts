import { NextRequest, NextResponse } from 'next/server';

// Fixed exchange rate USD -> CNY (for now)
const USD_TO_CNY = 7.2;

// Shipping line configurations
interface ShippingLineConfig {
  id: string;
  label: string;
  firstWeightGrams: number; // How many grams the first weight price covers (e.g. 100 or 200)
  firstWeightPriceUsd: number; // Price for first weight in USD
  additionalWeightPriceUsd: number; // Price per additional 100g in USD
  maxWeightGrams: number;
  maxDimensionCm: number;
  maxDimensionSumCm: number;
  volumetricDivisor: number; // e.g. 8000 for formula (L*W*H*1000)/8000, 0 = pure weight only
  usesVolumetricWeight: boolean; // Whether to calculate volumetric weight
  maxInsuredValueCny: number;
  restrictedAttributes: string[]; // Attribute IDs that are restricted
  deliveryDays: string;
}

const SHIPPING_LINES: Record<string, ShippingLineConfig> = {
  'JD-0-3kg': {
    id: 'JD-0-3kg',
    label: 'JD-EXP-EF (0-3kg)',
    firstWeightGrams: 100,
    firstWeightPriceUsd: 7.94,
    additionalWeightPriceUsd: 1.73,
    maxWeightGrams: 3000,
    maxDimensionCm: 70,
    maxDimensionSumCm: 200,
    volumetricDivisor: 8000,
    usesVolumetricWeight: true,
    maxInsuredValueCny: 3000,
    restrictedAttributes: ['powder', 'sea_freight'],
    deliveryDays: '10-15',
  },
  'JD-EXP-EF-Battery-0-12kg': {
    id: 'JD-EXP-EF-Battery-0-12kg',
    label: 'JD-EXP-EF (0-12kg)',
    firstWeightGrams: 100,
    firstWeightPriceUsd: 11.55,
    additionalWeightPriceUsd: 2.16,
    maxWeightGrams: 12000,
    maxDimensionCm: 75,
    maxDimensionSumCm: 200,
    volumetricDivisor: 8000,
    usesVolumetricWeight: true,
    maxInsuredValueCny: 3000,
    restrictedAttributes: ['powder', 'sea_freight'],
    deliveryDays: '12-20',
  },
  'TYG-BR-EXP-F-0-3kg': {
    id: 'TYG-BR-EXP-F-0-3kg',
    label: 'TYG-BR-EXP-F (0-3kg)',
    firstWeightGrams: 100,
    firstWeightPriceUsd: 7.22,
    additionalWeightPriceUsd: 1.46,
    maxWeightGrams: 3000,
    maxDimensionCm: 59,
    maxDimensionSumCm: 999, // No sum restriction mentioned
    volumetricDivisor: 0,
    usesVolumetricWeight: false, // Pure weight only
    maxInsuredValueCny: 4000,
    restrictedAttributes: ['liquid', 'electric', 'food', 'knives', 'powder', 'battery', 'cosmetics', 'magnetic', 'watch', 'perfume', 'electronic', 'sea_freight'],
    deliveryDays: '12-30',
  },
  'GZ-BR-F-B-0-20kg': {
    id: 'GZ-BR-F-B-0-20kg',
    label: 'GZ-BR-F : B (0-20kg)',
    firstWeightGrams: 200, // First 200g
    firstWeightPriceUsd: 14.43,
    additionalWeightPriceUsd: 2.11,
    maxWeightGrams: 20000,
    maxDimensionCm: 120,
    maxDimensionSumCm: 200,
    volumetricDivisor: 8000,
    usesVolumetricWeight: true,
    maxInsuredValueCny: 3500,
    restrictedAttributes: ['powder', 'sea_freight'],
    deliveryDays: '15-30',
  },
  'FJ-BR-EXP-F-0-3kg': {
    id: 'FJ-BR-EXP-F-0-3kg',
    label: 'FJ-BR-EXP-F (0-3kg)',
    firstWeightGrams: 100,
    firstWeightPriceUsd: 7.22,
    additionalWeightPriceUsd: 1.70,
    maxWeightGrams: 3000,
    maxDimensionCm: 59,
    maxDimensionSumCm: 999,
    volumetricDivisor: 0,
    usesVolumetricWeight: false, // Pure weight only
    maxInsuredValueCny: 2000,
    restrictedAttributes: ['liquid', 'electric', 'food', 'knives', 'powder', 'battery', 'cosmetics', 'magnetic', 'watch', 'perfume', 'electronic', 'sea_freight'],
    deliveryDays: '12-30',
  },
  'FJ-BR-EXP-F-3-20kg': {
    id: 'FJ-BR-EXP-F-3-20kg',
    label: 'FJ-BR-EXP-F (3-20kg)',
    firstWeightGrams: 100,
    firstWeightPriceUsd: 7.22,
    additionalWeightPriceUsd: 1.70,
    maxWeightGrams: 20000,
    maxDimensionCm: 80,
    maxDimensionSumCm: 210,
    volumetricDivisor: 0,
    usesVolumetricWeight: false, // Pure weight only
    maxInsuredValueCny: 5000,
    restrictedAttributes: ['liquid', 'electric', 'food', 'knives', 'powder', 'battery', 'cosmetics', 'magnetic', 'watch', 'perfume', 'electronic', 'sea_freight'],
    deliveryDays: '12-30',
  },
};

interface CalculateRequest {
  product_price_cny: number;
  weight_grams: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  shipping_line: string;
  service_fee_rate: number;
  include_insurance: boolean;
}

interface ValidationError {
  type: 'validation_error';
  field: string;
  message: string;
}

function validateInput(body: CalculateRequest, shippingConfig: ShippingLineConfig): ValidationError | null {
  // Validate price
  if (!body.product_price_cny || body.product_price_cny <= 0) {
    return {
      type: 'validation_error',
      field: 'product_price_cny',
      message: 'Informe o preço do produto',
    };
  }

  if (body.product_price_cny > 999999) {
    return {
      type: 'validation_error',
      field: 'product_price_cny',
      message: 'Preço máximo é ¥999.999',
    };
  }

  // Validate weight
  if (!body.weight_grams || body.weight_grams < 1) {
    return {
      type: 'validation_error',
      field: 'weight_grams',
      message: 'Informe o peso do produto',
    };
  }

  if (body.weight_grams > shippingConfig.maxWeightGrams) {
    return {
      type: 'validation_error',
      field: 'weight_grams',
      message: `Peso excede limite de ${shippingConfig.maxWeightGrams.toLocaleString()}g do frete ${shippingConfig.label}`,
    };
  }

  // Validate dimensions
  const dimensions = [
    { name: 'length_cm', label: 'Comprimento', value: body.length_cm },
    { name: 'width_cm', label: 'Largura', value: body.width_cm },
    { name: 'height_cm', label: 'Altura', value: body.height_cm },
  ];

  for (const dim of dimensions) {
    if (!dim.value || dim.value <= 0) {
      return {
        type: 'validation_error',
        field: dim.name,
        message: `Informe ${dim.label.toLowerCase()} da caixa`,
      };
    }

    if (dim.value > shippingConfig.maxDimensionCm) {
      return {
        type: 'validation_error',
        field: dim.name,
        message: `${dim.label} não pode exceder ${shippingConfig.maxDimensionCm}cm (limite ${shippingConfig.label})`,
      };
    }
  }

  // Validate dimension sum
  const dimensionSum = body.length_cm + body.width_cm + body.height_cm;
  if (dimensionSum > shippingConfig.maxDimensionSumCm) {
    return {
      type: 'validation_error',
      field: 'dimensions',
      message: `Soma das dimensões (${dimensionSum.toFixed(1)}cm) excede ${shippingConfig.maxDimensionSumCm}cm (limite ${shippingConfig.label})`,
    };
  }

  // Validate service fee rate
  const validRates = [0.01, 0.02, 0.03, 0.04, 0.05, 0.06];
  if (!validRates.includes(body.service_fee_rate)) {
    return {
      type: 'validation_error',
      field: 'service_fee_rate',
      message: 'Taxa de serviço inválida',
    };
  }

  return null;
}

function calculateVolumetricWeight(length: number, width: number, height: number, divisor: number): number {
  // Formula: (L × W × H × 1000) / divisor
  return (length * width * height * 1000) / divisor;
}

function calculateFreight(weightGrams: number, config: ShippingLineConfig): number {
  // Base price for first weight (e.g. 100g or 200g depending on shipping line)
  if (weightGrams <= config.firstWeightGrams) {
    return config.firstWeightPriceUsd;
  }

  // Additional cost for weight above first weight threshold
  const additionalWeight = weightGrams - config.firstWeightGrams;
  const additionalCost = (additionalWeight / 100) * config.additionalWeightPriceUsd;

  return config.firstWeightPriceUsd + additionalCost;
}

function calculateInsurance(productPrice: number, freightCny: number): number {
  // 3% of (product + freight), max ¥90
  // Insurance covers up to ¥3000 of the total (product + freight)
  const totalValue = productPrice + freightCny;
  const insurance = totalValue * 0.03;
  return Math.min(insurance, 90);
}

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json();

    // Get shipping line config
    const shippingConfig = SHIPPING_LINES[body.shipping_line];
    if (!shippingConfig) {
      return NextResponse.json(
        {
          success: false,
          error: {
            type: 'validation_error',
            field: 'shipping_line',
            message: 'Linha de frete inválida',
          },
        },
        { status: 400 }
      );
    }

    // Validate input
    const validationError = validateInput(body, shippingConfig);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // Calculate volumetric weight (only if shipping line uses it)
    let volumetricWeight = 0;
    let wasVolumetric = false;
    let weightUsed = body.weight_grams;

    if (shippingConfig.usesVolumetricWeight && shippingConfig.volumetricDivisor > 0) {
      volumetricWeight = calculateVolumetricWeight(
        body.length_cm,
        body.width_cm,
        body.height_cm,
        shippingConfig.volumetricDivisor
      );

      // Check if volumetric weight exceeds limit
      if (volumetricWeight > shippingConfig.maxWeightGrams) {
        return NextResponse.json(
          {
            success: false,
            error: {
              type: 'validation_error',
              field: 'volumetric_weight',
              message: `Peso volumétrico (${volumetricWeight.toFixed(0)}g) excede limite de ${shippingConfig.maxWeightGrams.toLocaleString()}g do frete ${shippingConfig.label}`,
            },
          },
          { status: 400 }
        );
      }

      // Determine which weight to use (higher of real vs volumetric)
      wasVolumetric = volumetricWeight > body.weight_grams;
      weightUsed = Math.max(body.weight_grams, volumetricWeight);
    }

    // Calculate freight in USD, then convert to CNY
    const freightUsd = calculateFreight(weightUsed, shippingConfig);
    const freightCny = freightUsd * USD_TO_CNY;

    // Calculate insurance (if enabled)
    // Insurance is 3% of (product + freight), max ¥90, covers up to ¥3000 of total value
    const insuranceCny = body.include_insurance ? calculateInsurance(body.product_price_cny, freightCny) : 0;

    // Calculate service fee
    // Service fee is % of (product + freight)
    const serviceFeeCny = (body.product_price_cny + freightCny) * body.service_fee_rate;

    // Calculate total in CNY
    const totalCny = body.product_price_cny + freightCny + insuranceCny + serviceFeeCny;

    // Fetch exchange rate CNY -> BRL
    let cnyToBrl = 0.81; // Default fallback
    let rateUpdatedAt = new Date().toISOString();

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000';

      const rateResponse = await fetch(`${baseUrl}/api/exchange-rate`, {
        next: { revalidate: 300 },
      });

      if (rateResponse.ok) {
        const rateData = await rateResponse.json();
        // effectiveRate is BRL/CNY ratio (how many BRL per 1 CNY)
        // To convert CNY to BRL, we divide by the rate
        cnyToBrl = 1 / rateData.effectiveRate;
        rateUpdatedAt = rateData.updatedAt;
      }
    } catch (error) {
      console.error('[CALCULATE-COST] Error fetching exchange rate:', error);
      // Continue with fallback rate
    }

    // Calculate all costs in BRL
    const productBrl = body.product_price_cny * cnyToBrl;
    const freightBrl = freightCny * cnyToBrl;
    const insuranceBrl = insuranceCny * cnyToBrl;
    const serviceFeeBrl = serviceFeeCny * cnyToBrl;
    const totalBrl = totalCny * cnyToBrl;

    return NextResponse.json({
      success: true,
      result: {
        weight_analysis: {
          real_weight_g: body.weight_grams,
          volumetric_weight_g: Math.round(volumetricWeight * 100) / 100,
          weight_used_g: Math.round(weightUsed * 100) / 100,
          was_volumetric: wasVolumetric,
          uses_volumetric_weight: shippingConfig.usesVolumetricWeight,
        },
        costs_cny: {
          product: Math.round(body.product_price_cny * 100) / 100,
          freight: Math.round(freightCny * 100) / 100,
          insurance: Math.round(insuranceCny * 100) / 100,
          service_fee: Math.round(serviceFeeCny * 100) / 100,
          total: Math.round(totalCny * 100) / 100,
        },
        costs_brl: {
          product: Math.round(productBrl * 100) / 100,
          freight: Math.round(freightBrl * 100) / 100,
          insurance: Math.round(insuranceBrl * 100) / 100,
          service_fee: Math.round(serviceFeeBrl * 100) / 100,
          total: Math.round(totalBrl * 100) / 100,
        },
        exchange_rates: {
          usd_to_cny: USD_TO_CNY,
          cny_to_brl: Math.round(cnyToBrl * 10000) / 10000,
          updated_at: rateUpdatedAt,
        },
        freight_details: {
          freight_usd: Math.round(freightUsd * 100) / 100,
          shipping_line: shippingConfig.label,
          delivery_days: shippingConfig.deliveryDays,
          max_insured_value_cny: shippingConfig.maxInsuredValueCny,
        },
      },
    });
  } catch (error) {
    console.error('[CALCULATE-COST] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          type: 'server_error',
          field: null,
          message: 'Erro interno do servidor',
        },
      },
      { status: 500 }
    );
  }
}
