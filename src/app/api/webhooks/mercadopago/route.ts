import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { supabase } from '@/lib/supabase';
import { mercadoPagoPayment } from '@/lib/mercadopago';
import type { MercadoPagoWebhookPayload } from '@/types';

const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET;
const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;

function verifySignature(
  signature: string | null,
  requestId: string | null,
  dataId: string
): boolean {
  if (!signature || !requestId || !WEBHOOK_SECRET) {
    return false;
  }

  const parts = signature.split(',');
  if (parts.length !== 2) {
    return false;
  }

  const timestampPart = parts[0];
  const signaturePart = parts[1];

  const timestampMatch = timestampPart.match(/ts=(\d+)/);
  const signatureMatch = signaturePart.match(/v1=([a-f0-9]+)/);

  if (!timestampMatch || !signatureMatch) {
    return false;
  }

  const timestamp = timestampMatch[1];
  const receivedSignature = signatureMatch[1];

  const timestampMs = parseInt(timestamp, 10);
  const now = Date.now();

  if (now - timestampMs > MAX_TIMESTAMP_AGE_MS) {
    console.error('Webhook timestamp muito antigo:', {
      received: new Date(timestampMs).toISOString(),
      now: new Date(now).toISOString(),
    });
    return false;
  }

  const template = `id:${dataId};request-id:${requestId};ts:${timestamp};`;
  const expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
    .update(template)
    .digest('hex');

  return receivedSignature === expectedSignature;
}

async function processApprovedPayment(paymentId: string): Promise<void> {
  const payment = await mercadoPagoPayment.get({ id: paymentId });

  if (payment.status !== 'approved') {
    return;
  }

  const clerkUserId = payment.metadata?.clerk_user_id;

  if (!clerkUserId || typeof clerkUserId !== 'string') {
    console.error('clerk_user_id não encontrado no metadata do pagamento');
    return;
  }

  const { error: paymentError } = await supabase
    .from('payments')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
    })
    .eq('mercadopago_id', paymentId);

  if (paymentError) {
    console.error('Erro ao atualizar pagamento:', paymentError.message);
  }

  const { error: userError } = await supabase
    .from('users')
    .update({ is_premium: true })
    .eq('clerk_id', clerkUserId);

  if (userError) {
    console.error('Erro ao ativar premium:', userError.message);
  }

  console.log(`Premium ativado para usuário: ${clerkUserId}`);
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature');
    const requestId = request.headers.get('x-request-id');

    const rawBody = await request.text();
    let body: MercadoPagoWebhookPayload;

    try {
      body = JSON.parse(rawBody);
    } catch {
      console.error('Payload inválido');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!WEBHOOK_SECRET) {
      console.warn('MERCADOPAGO_WEBHOOK_SECRET não configurado, pulando validação');
    } else {
      const isValid = verifySignature(signature, requestId, body.data.id);

      if (!isValid) {
        console.error('Assinatura do webhook inválida');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const webhookId = body.id.toString();

    const { data: existingWebhook } = await supabase
      .from('processed_webhooks')
      .select('id')
      .eq('webhook_id', webhookId)
      .single();

    if (existingWebhook) {
      return NextResponse.json({ status: 'already_processed' });
    }

    const { error: insertError } = await supabase.from('processed_webhooks').insert({
      webhook_id: webhookId,
      type: body.type,
      action: body.action,
    });

    if (insertError) {
      console.error('Erro ao registrar webhook:', insertError.message);
    }

    if (body.type === 'payment') {
      await processApprovedPayment(body.data.id);
    }

    return NextResponse.json({ status: 'processed' });
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ status: 'error_logged' });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
