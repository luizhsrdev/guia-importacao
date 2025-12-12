import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PagamentoClient } from './PagamentoClient';

export default async function PagamentoPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { data: user } = await supabase
    .from('users')
    .select('is_premium')
    .eq('clerk_id', userId)
    .single();

  if (user?.is_premium) {
    redirect('/vendedores');
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-textMain mb-2">
            Acesso Premium
          </h1>
          <p className="text-textSecondary">
            Desbloqueie a lista completa de vendedores verificados
          </p>
        </div>

        <div className="bg-surface border border-zinc-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-textSecondary">Acesso Vitalício</span>
            <span className="text-3xl font-bold text-primary">R$ 89,90</span>
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-3 text-textSecondary">
              <CheckIcon />
              <span>Lista Dourada de vendedores confiáveis</span>
            </li>
            <li className="flex items-center gap-3 text-textSecondary">
              <CheckIcon />
              <span>Blacklist de golpistas conhecidos</span>
            </li>
            <li className="flex items-center gap-3 text-textSecondary">
              <CheckIcon />
              <span>Atualizações constantes da curadoria</span>
            </li>
            <li className="flex items-center gap-3 text-textSecondary">
              <CheckIcon />
              <span>Acesso vitalício, pague uma vez só</span>
            </li>
          </ul>

          <PagamentoClient />
        </div>

        <p className="text-center text-xs text-textSecondary">
          Pagamento seguro via Mercado Pago. Acesso liberado instantaneamente após confirmação.
        </p>
      </div>
    </main>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-5 h-5 text-primary flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
