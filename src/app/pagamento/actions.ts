'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { mercadoPagoPayment, isMercadoPagoConfigured } from '@/lib/mercadopago';
import { supabase } from '@/lib/supabase';
import { randomUUID } from 'crypto';
import { revalidateTag } from 'next/cache';
import { CacheTag } from '@/types';
import type { CreatePixResult } from '@/types';

const PREMIUM_PRICE_BRL = 89.90;
const PAYMENT_EXPIRATION_MINUTES = 30;

export async function createPixPayment(): Promise<CreatePixResult> {
  if (!isMercadoPagoConfigured()) {
    return { success: false, error: 'Sistema de pagamento não configurado' };
  }

  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Usuário não autenticado' };
  }

  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!userEmail) {
    return { success: false, error: 'Email do usuário não encontrado' };
  }

  const { data: existingUser } = await supabase
    .from('users')
    .select('is_premium')
    .eq('clerk_id', userId)
    .single();

  if (existingUser?.is_premium) {
    return { success: false, error: 'Você já possui acesso premium' };
  }

  const idempotencyKey = randomUUID();
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + PAYMENT_EXPIRATION_MINUTES);

  try {
    const payment = await mercadoPagoPayment.create({
      body: {
        transaction_amount: PREMIUM_PRICE_BRL,
        description: 'Guia Importação - Acesso Premium Vitalício',
        payment_method_id: 'pix',
        date_of_expiration: expirationDate.toISOString(),
        payer: {
          email: userEmail,
        },
        metadata: {
          clerk_user_id: userId,
          idempotency_key: idempotencyKey,
        },
      },
      requestOptions: {
        idempotencyKey,
      },
    });

    if (!payment.id) {
      return { success: false, error: 'Falha ao criar pagamento' };
    }

    const { error: insertError } = await supabase.from('payments').insert({
      clerk_user_id: userId,
      mercadopago_id: payment.id.toString(),
      amount: PREMIUM_PRICE_BRL,
      status: 'pending',
      idempotency_key: idempotencyKey,
    });

    if (insertError) {
      console.error('Erro ao salvar pagamento:', insertError.message);
    }

    const pixData = payment.point_of_interaction?.transaction_data;

    if (!pixData?.qr_code) {
      return { success: false, error: 'QR Code não gerado' };
    }

    return {
      success: true,
      qrCode: pixData.qr_code,
      qrCodeBase64: pixData.qr_code_base64,
      copyPaste: pixData.qr_code,
      paymentId: payment.id.toString(),
      expirationDate: expirationDate.toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao criar pagamento PIX:', message);
    return { success: false, error: `Erro ao processar pagamento: ${message}` };
  }
}

export async function checkPaymentStatus(paymentId: string): Promise<{
  status: string;
  isPaid: boolean;
}> {
  if (!isMercadoPagoConfigured()) {
    return { status: 'error', isPaid: false };
  }

  try {
    const payment = await mercadoPagoPayment.get({ id: paymentId });

    const isPaid = payment.status === 'approved';

    if (isPaid) {
      const clerkUserId = payment.metadata?.clerk_user_id;

      if (clerkUserId) {
        await supabase
          .from('users')
          .update({ is_premium: true })
          .eq('clerk_id', clerkUserId);

        await supabase
          .from('payments')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
          })
          .eq('mercadopago_id', paymentId);

        revalidateTag(CacheTag.PAYMENTS);
      }
    }

    return {
      status: payment.status ?? 'unknown',
      isPaid,
    };
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return { status: 'error', isPaid: false };
  }
}
