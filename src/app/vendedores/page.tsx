import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import VendedoresClient from './VendedoresClient';

export default async function VendedoresPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Buscar dados do usuário no Supabase
  const { data: user } = await supabase
    .from('users')
    .select('is_premium, is_admin')
    .eq('clerk_id', userId)
    .single();

  // Bloquear se não for premium nem admin
  if (!user?.is_premium && !user?.is_admin) {
    redirect('/'); // TODO: Redirecionar para página de upgrade premium
  }

  // Buscar vendedores com categorias
  const { data: sellers } = await supabase
    .from('sellers')
    .select('*, seller_categories(id, name, slug)')
    .order('created_at', { ascending: false });

  const goldSellers = sellers?.filter((s) => s.status === 'gold') || [];
  const blacklistSellers = sellers?.filter((s) => s.status === 'blacklist') || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-textMain mb-2">
            Vendedores Verificados
          </h1>
          <p className="text-textSecondary">
            Lista curada de vendedores confiáveis e golpistas conhecidos no Xianyu
          </p>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-textSecondary">
                {goldSellers.length} vendedores na Lista Dourada
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span className="text-textSecondary">
                {blacklistSellers.length} vendedores na Blacklist
              </span>
            </div>
          </div>
        </div>

        <VendedoresClient sellers={sellers || []} />
      </div>
    </div>
  );
}
