import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

const SUBSCRIPTION_AMOUNT = 4.90;

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

    // 2. Verificar se o plano existe
    const planId = process.env.MP_SUBSCRIPTION_PLAN_ID;
    if (!planId) {
      console.error('[Subscription] MP_SUBSCRIPTION_PLAN_ID nao configurado');
      return NextResponse.json(
        { error: 'Plano de assinatura nao configurado. Execute o script create-mp-plan.ts primeiro.' },
        { status: 500 }
      );
    }

    // 3. Buscar usuario no Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, clerk_id, email, is_premium, is_admin, premium_type, mp_subscription_id')
      .eq('clerk_id', userId)
      .single();

    // Buscar email do Clerk
    const clerkUser = await currentUser();
    const userEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email do usuario nao encontrado' },
        { status: 400 }
      );
    }

    // Se usuario nao existe no Supabase, criar
    if (userError || !user) {
      const { error: createError } = await supabase
        .from('users')
        .insert({
          clerk_id: userId,
          email: userEmail,
          is_premium: false,
          is_admin: false,
        });

      if (createError) {
        console.error('[Subscription] Erro ao criar usuario:', createError);
        return NextResponse.json(
          { error: 'Erro ao criar usuario' },
          { status: 500 }
        );
      }
    } else {
      // 4. Validar se ja nao e premium
      if (user.is_premium || user.is_admin) {
        return NextResponse.json(
          { error: 'Usuario ja possui acesso premium' },
          { status: 400 }
        );
      }

      // Verificar se ja tem assinatura ativa
      if (user.mp_subscription_id) {
        return NextResponse.json(
          { error: 'Usuario ja possui uma assinatura ativa' },
          { status: 400 }
        );
      }
    }

    // 5. Retornar dados para o frontend criar assinatura via Brick
    return NextResponse.json({
      planId: planId,
      amount: SUBSCRIPTION_AMOUNT,
      userEmail: userEmail,
      clerkUserId: userId,
      publicKey: process.env.NEXT_PUBLIC_MP_PUBLIC_KEY,
    });
  } catch (error) {
    console.error('[Subscription] Erro ao preparar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar assinatura' },
      { status: 500 }
    );
  }
}
