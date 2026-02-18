'use client';

import { useState } from 'react';
import { AdminToggleSlider } from '@/components/AdminToggleSlider';

export default function AdminToggleSliderClient() {
  const [showAdminSlider, setShowAdminSlider] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAdminSlider(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center justify-center group z-40 border border-red-500/30"
        title="Painel Admin"
      >
        <svg className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
      <AdminToggleSlider
        isOpen={showAdminSlider}
        onClose={() => setShowAdminSlider(false)}
      />
    </>
  );
}
