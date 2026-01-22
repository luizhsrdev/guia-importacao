'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminMode } from '@/contexts/AdminModeContext';

export function AdminReportsNotification() {
  const [reportCount, setReportCount] = useState(0);
  const router = useRouter();
  const { isAdminModeActive } = useAdminMode();

  const fetchReportCount = async () => {
    try {
      const response = await fetch('/api/admin/reports/count');
      if (response.ok) {
        const data = await response.json();
        setReportCount(data.count || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar contagem de reports:', error);
    }
  };

  useEffect(() => {
    // Buscar imediatamente
    fetchReportCount();

    // Atualizar a cada 6 horas (21600000ms) - 3-4 vezes ao dia
    const interval = setInterval(fetchReportCount, 21600000);

    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    router.push('/admin/reported-products');
  };

  // Só mostrar se admin mode estiver ativo e houver reports
  if (!isAdminModeActive || reportCount === 0) return null;

  return (
    <button
      onClick={handleClick}
      className="relative w-9 h-9 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors flex items-center justify-center group"
      title={`${reportCount} item${reportCount > 1 ? 's' : ''} reportado${reportCount > 1 ? 's' : ''}`}
    >
      {/* Bell Icon */}
      <svg
        className="w-4 h-4 text-yellow-500 group-hover:scale-110 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      {/* Badge */}
      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-background">
        {reportCount > 99 ? '99+' : reportCount}
      </span>
    </button>
  );
}
