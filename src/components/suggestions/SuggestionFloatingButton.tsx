'use client';

import React from 'react';
import { useSuggestion } from './SuggestionProvider';

export function SuggestionFloatingButton() {
  const { openModal, isModalOpen } = useSuggestion();

  if (isModalOpen) {
    return null;
  }

  return (
    <button
      onClick={() => openModal('floating_button')}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40
                 bg-[#00ff9d] hover:bg-[#00cc7d] text-black
                 w-14 h-14 rounded-full shadow-lg
                 flex items-center justify-center
                 transition-all duration-200 hover:scale-110
                 group"
      aria-label="Enviar sugestão"
      title="Sentiu falta de algo?"
    >
      {/* Lightbulb icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>

      {/* Tooltip on hover */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-zinc-800 text-white text-sm rounded-lg
                       whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity
                       pointer-events-none shadow-lg">
        Sentiu falta de algo?
      </span>
    </button>
  );
}
