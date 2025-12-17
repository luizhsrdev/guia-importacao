'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface CheckAdminResponse {
  isAdmin: boolean;
}

async function checkAdminStatus(): Promise<boolean> {
  try {
    const response = await fetch('/api/check-admin');
    const data: CheckAdminResponse = await response.json();
    return data.isAdmin;
  } catch {
    return false;
  }
}

export function AdminLink() {
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;

    checkAdminStatus().then(setIsAdmin);
  }, [user]);

  if (!isAdmin) return null;

  return (
    <Link
      href="/admin"
      className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors text-sm font-bold"
    >
      Admin
    </Link>
  );
}
