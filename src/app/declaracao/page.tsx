import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentUserStatus } from '@/lib/user-server';
import { GlobalHeader } from '@/components/GlobalHeader';
import DeclaracaoClient from './DeclaracaoClient';

export default async function DeclaracaoPage() {
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

  const userStatus = await getCurrentUserStatus();

  return (
    <main className="min-h-screen bg-background">
      <GlobalHeader userStatus={userStatus} />
      <DeclaracaoClient />
    </main>
  );
}
