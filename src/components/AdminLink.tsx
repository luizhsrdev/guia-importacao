'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AdminLink() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      // Verificar se usuário é admin via API
      fetch('/api/check-admin')
        .then((res) => res.json())
        .then((data) => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false));
    }
  }, [user]);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors text-sm font-bold"
    >
      🛠️ Admin
    </Link>
  );
}
