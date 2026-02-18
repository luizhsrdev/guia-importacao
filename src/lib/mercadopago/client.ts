import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// Configuracao do cliente Mercado Pago
const accessToken = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;

if (!accessToken) {
  console.warn('[MercadoPago] Access token nao configurado');
}

export const mpConfig = new MercadoPagoConfig({
  accessToken: accessToken ?? '',
  options: {
    timeout: 10000,
  },
});

export const paymentClient = new Payment(mpConfig);
export const preferenceClient = new Preference(mpConfig);

export function isMercadoPagoConfigured(): boolean {
  return Boolean(accessToken);
}

interface CreatePaymentPreferenceParams {
  userId: string;
  userEmail: string;
  amount?: number;
}

interface PaymentPreferenceResult {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint: string;
}

/**
 * Cria uma preferencia de pagamento para pagamento unico (vitalicio)
 */
export async function createPaymentPreference({
  userId,
  userEmail,
  amount = 9.90,
}: CreatePaymentPreferenceParams): Promise<PaymentPreferenceResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const preference = await preferenceClient.create({
    body: {
      items: [
        {
          id: 'premium-lifetime',
          title: 'Acesso Premium Vitalicio - Guia Importacao',
          description: 'Acesso completo e vitalicio a lista de vendedores verificados e blacklist',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: amount,
        },
      ],
      payer: {
        email: userEmail,
      },
      back_urls: {
        success: `${appUrl}/pagamento/sucesso`,
        failure: `${appUrl}/pagamento/erro`,
        pending: `${appUrl}/pagamento/pendente`,
      },
      auto_return: 'approved',
      notification_url: `${appUrl}/api/webhooks/mercadopago`,
      external_reference: userId,
      metadata: {
        clerk_user_id: userId,
        payment_type: 'lifetime',
        amount: amount,
      },
      statement_descriptor: 'GUIA IMPORTACAO',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
    },
  });

  if (!preference.id || !preference.init_point) {
    throw new Error('Falha ao criar preferencia de pagamento');
  }

  return {
    preferenceId: preference.id,
    initPoint: preference.init_point,
    sandboxInitPoint: preference.sandbox_init_point || preference.init_point,
  };
}

/**
 * Busca informacoes de um pagamento pelo ID
 */
export async function getPaymentInfo(paymentId: string) {
  const payment = await paymentClient.get({ id: paymentId });
  return payment;
}

/**
 * Busca informacoes de um pagamento por external_reference (clerk_user_id)
 */
export async function getPaymentByExternalReference(externalReference: string) {
  const payments = await paymentClient.search({
    options: {
      criteria: 'desc',
      sort: 'date_created',
      external_reference: externalReference,
    },
  });
  return payments.results?.[0] || null;
}
