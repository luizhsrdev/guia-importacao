'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="flex gap-4">
      <Link
        href="/admin/products"
        className={`px-4 py-2 rounded-lg transition-colors ${
          isActive('/admin/products')
            ? 'bg-primary text-background font-bold'
            : 'text-textSecondary hover:text-primary hover:bg-surface'
        }`}
      >
        Produtos
      </Link>
      <Link
        href="/admin/sellers"
        className={`px-4 py-2 rounded-lg transition-colors ${
          isActive('/admin/sellers')
            ? 'bg-primary text-background font-bold'
            : 'text-textSecondary hover:text-primary hover:bg-surface'
        }`}
      >
        Vendedores
      </Link>
    </nav>
  );
}
