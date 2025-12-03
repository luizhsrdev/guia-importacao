import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Verificar se usuário está autenticado
  if (!userId) {
    redirect('/sign-in');
  }

  // Verificar se usuário é admin no Supabase
  const { data: user } = await supabase
    .from('users')
    .select('is_admin')
    .eq('clerk_id', userId)
    .single();

  if (!user?.is_admin) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="bg-surface border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-primary">
                🛠️ Painel Admin
              </h1>
              <nav className="flex gap-4">
                <Link
                  href="/admin/products"
                  className="px-4 py-2 rounded-lg text-textSecondary hover:text-primary hover:bg-surface transition-colors"
                >
                  Produtos
                </Link>
                <Link
                  href="/admin/sellers"
                  className="px-4 py-2 rounded-lg text-textSecondary hover:text-primary hover:bg-surface transition-colors"
                >
                  Vendedores
                </Link>
              </nav>
            </div>
            <Link
              href="/"
              className="text-textSecondary hover:text-primary transition-colors"
            >
              ← Voltar para Home
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">{children}</main>
    </div>
  );
}
