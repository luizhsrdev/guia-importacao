import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUserStatus } from '@/lib/user-server';
import { GlobalHeader } from '@/components/GlobalHeader';
import VendedoresClient from './VendedoresClient';

export default async function VendedoresPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const { data: user } = await supabase
    .from('users')
    .select('is_premium, is_admin')
    .eq('clerk_id', userId)
    .single();

  if (!user?.is_premium && !user?.is_admin) {
    redirect('/pagamento');
  }

  const [{ data: sellers }, userStatus] = await Promise.all([
    supabase
      .from('sellers')
      .select('*, seller_categories(id, name, slug)')
      .order('created_at', { ascending: false }),
    getCurrentUserStatus(),
  ]);

  const goldSellers = sellers?.filter((s) => s.status === 'gold') || [];
  const blacklistSellers = sellers?.filter((s) => s.status === 'blacklist') || [];

  return (
    <main className="min-h-screen bg-background">
      <GlobalHeader userStatus={userStatus} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Vendedores Verificados
          </h1>
          <p className="text-text-secondary">
            Lista curada de vendedores confiáveis e golpistas conhecidos no Xianyu
          </p>
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-text-secondary">
                {goldSellers.length} vendedores na Lista Dourada
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-danger" />
              <span className="text-text-secondary">
                {blacklistSellers.length} vendedores na Blacklist
              </span>
            </div>
          </div>
        </div>

        <VendedoresClient sellers={sellers || []} />
      </div>
    </main>
  );
}
