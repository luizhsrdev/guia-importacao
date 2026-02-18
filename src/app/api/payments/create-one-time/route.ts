import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { randomUUID } from 'crypto';
import { supabase } from '@/lib/supabase';
import { createPaymentPreference, isMercadoPagoConfigured } from '@/lib/mercadopago/client';

const LIFETIME_AMOUNT = 9.90;

export async function POST() {
  try {
    // 1. Verificar autenticacao
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Nao autenticado' },
        { status: 401 }
      );
    }

    // Verificar se MP esta configurado
    if (!isMercadoPagoConfigured()) {
      return NextResponse.json(
        { error: 'Sistema de pagamento nao configurado' },
        { status: 500 }
      );
    }

    // 2. Buscar usuario no Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id, email, is_premium, is_admin, premium_type')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      // Buscar email do Clerk se usuario nao existe no Supabase
      const clerkUser = await currentUser();
      if (!clerkUser?.emailAddresses?.[0]?.emailAddress) {
        return NextResponse.json(
          { error: 'Email do usuario nao encontrado' },
          { status: 400 }
        );
      }

      // Criar usuario no Supabase se nao existir
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          clerk_id: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          is_premium: false,
          is_admin: false,
        })
        .select()
        .single();

      if (createError) {
        console.error('[Payment] Erro ao criar usuario:', createError);
        return NextResponse.json(
          { error: 'Erro ao criar usuario' },
          { status: 500 }
        );
      }

      // Usar o usuario recem-criado
      return await processPayment(newUser.clerk_id, clerkUser.emailAddresses[0].emailAddress);
    }

    // 3. Validar se ja nao e premium
    if (user.is_premium || user.is_admin) {
      return NextResponse.json(
        { error: 'Usuario ja possui acesso premium' },
        { status: 400 }
      );
    }

    // Buscar email do Clerk
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || user.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email do usuario nao encontrado' },
        { status: 400 }
      );
    }

    return await processPayment(userId, userEmail);
  } catch (error) {
    console.error('[Payment] Erro ao criar pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar pagamento' },
      { status: 500 }
    );
  }
}

async function processPayment(clerkUserId: string, userEmail: string) {
  // Gerar idempotency key
  const idempotencyKey = randomUUID();

  // 4. Criar preferencia no Mercado Pago
  const preference = await createPaymentPreference({
    userId: clerkUserId,
    userEmail: userEmail,
    amount: LIFETIME_AMOUNT,
  });

  // 5. Salvar na tabela payments
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      clerk_user_id: clerkUserId,
      mercadopago_id: preference.preferenceId,
      amount: LIFETIME_AMOUNT,
      payment_type: 'lifetime',
      status: 'pending',
      idempotency_key: idempotencyKey,
    });

  if (paymentError) {
    console.error('[Payment] Erro ao salvar pagamento:', paymentError);
    // Nao falhar - o webhook vai criar se necessario
  }

  // 6. Retornar dados para o frontend
  return NextResponse.json({
    preferenceId: preference.preferenceId,
    initPoint: preference.initPoint,
    sandboxInitPoint: preference.sandboxInitPoint,
    amount: LIFETIME_AMOUNT,
    paymentType: 'lifetime',
  });
}
