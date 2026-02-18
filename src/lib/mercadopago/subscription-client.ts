import { mpConfig } from './client';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SubscriptionPlanResult {
  id: string;
  status: string;
  init_point: string;
}

/**
 * Cria um plano de assinatura mensal no Mercado Pago
 * Este plano deve ser criado UMA VEZ e o ID salvo no .env.local
 */
export async function createSubscriptionPlan(): Promise<SubscriptionPlanResult> {
  const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      reason: 'Assinatura Premium Mensal - Guia Importacao',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 4.90,
        currency_id: 'BRL',
      },
      back_url: `${APP_URL}/pagamento/sucesso`,
      payment_methods_allowed: {
        payment_types: [
          { id: 'credit_card' },
          { id: 'debit_card' },
        ],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[MP] Erro ao criar plano:', error);
    throw new Error(`Falha ao criar plano: ${JSON.stringify(error)}`);
  }

  const plan = await response.json();
  return {
    id: plan.id,
    status: plan.status,
    init_point: plan.init_point,
  };
}

interface CreateSubscriptionParams {
  planId: string;
  payerEmail: string;
  clerkUserId: string;
}

interface SubscriptionResult {
  id: string;
  status: string;
  init_point: string;
  payer_id: number;
}

/**
 * Cria uma assinatura para um usuario usando um plano existente
 */
export async function createSubscription({
  planId,
  payerEmail,
  clerkUserId,
}: CreateSubscriptionParams): Promise<SubscriptionResult> {
  const response = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      preapproval_plan_id: planId,
      payer_email: payerEmail,
      external_reference: clerkUserId,
      back_url: `${APP_URL}/pagamento/sucesso`,
      reason: 'Assinatura Premium Mensal - Guia Importacao',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 4.90,
        currency_id: 'BRL',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[MP] Erro ao criar assinatura:', error);
    throw new Error(`Falha ao criar assinatura: ${JSON.stringify(error)}`);
  }

  const subscription = await response.json();
  return {
    id: subscription.id,
    status: subscription.status,
    init_point: subscription.init_point,
    payer_id: subscription.payer_id,
  };
}

/**
 * Busca informacoes de uma assinatura pelo ID
 */
export async function getSubscriptionInfo(subscriptionId: string) {
  const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Falha ao buscar assinatura: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Cancela uma assinatura
 */
export async function cancelSubscription(subscriptionId: string) {
  const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      status: 'cancelled',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Falha ao cancelar assinatura: ${JSON.stringify(error)}`);
  }

  return response.json();
}

/**
 * Pausa uma assinatura
 */
export async function pauseSubscription(subscriptionId: string) {
  const response = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      status: 'paused',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Falha ao pausar assinatura: ${JSON.stringify(error)}`);
  }

  return response.json();
}
