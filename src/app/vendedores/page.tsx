import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUserStatus } from '@/lib/user-server';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AdminModeProvider } from '@/contexts/AdminModeContext';
import VendedoresClient from './VendedoresClient';
import AdminToggleSliderClient from './AdminToggleSliderClient';

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

  const [{ data: sellers }, { data: sellerCategories }, userStatus] = await Promise.all([
    supabase
      .from('sellers')
      .select('*, seller_categories(id, name, slug)')
      .order('created_at', { ascending: false }),
    supabase
      .from('seller_categories')
      .select('id, name')
      .order('name', { ascending: true }),
    getCurrentUserStatus(),
  ]);

  return (
    <AdminModeProvider
      isUserAdmin={userStatus.isAdmin}
      isUserAuthenticated={userStatus.isAuthenticated}
    >
      <main className="min-h-screen bg-background">
        <GlobalHeader userStatus={userStatus} />

        <VendedoresClient
          sellers={sellers || []}
          sellerCategories={sellerCategories || []}
        />

        {userStatus.isAdmin && <AdminToggleSliderClient />}
      </main>
    </AdminModeProvider>
  );
}
