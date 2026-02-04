'use client';

import React, { useEffect, useState } from 'react';
import { useSuggestion, TriggerType } from './SuggestionProvider';

const NUDGE_TEXTS: Record<TriggerType, string> = {
  floating_button: 'Tem alguma sugestão?',
  nudge_time: 'Tem alguma sugestão para a gente?',
  nudge_visit: 'Bem-vindo de volta! Alguma sugestão?',
  nudge_zero_results: 'Não encontrou o que procurava? Nos conte!',
};

export function SuggestionNudge() {
  const { isNudgeVisible, hideNudge, openModal, nudgeTrigger, nudgeSearchQuery, isModalOpen } = useSuggestion();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isNudgeVisible && !isModalOpen) {
      // Small delay for entrance animation
      const showTimer = setTimeout(() => setIsVisible(true), 100);

      // Auto-close after 8 seconds
      const autoCloseTimer = setTimeout(() => {
        handleDismiss();
      }, 8000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(autoCloseTimer);
      };
    } else {
      setIsVisible(false);
    }
  }, [isNudgeVisible, isModalOpen]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Mark dismissal in localStorage for cooldown
    localStorage.setItem('suggestion_nudge_dismissed_at', Date.now().toString());
    localStorage.setItem('suggestion_session_shown', 'true');
    setTimeout(() => hideNudge(), 200);
  };

  const handleClick = () => {
    if (nudgeTrigger) {
      openModal(nudgeTrigger, nudgeSearchQuery || undefined);
    }
  };

  if (!isNudgeVisible || isModalOpen) {
    return null;
  }

  const text = nudgeTrigger ? NUDGE_TEXTS[nudgeTrigger] : NUDGE_TEXTS.nudge_time;

  return (
    <div
      className={`fixed bottom-24 right-6 md:bottom-28 md:right-8 z-40
                  transition-all duration-300 ease-out
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <div className="relative">
        {/* Nudge balloon */}
        <div
          className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 shadow-xl
                     max-w-[260px] cursor-pointer hover:bg-zinc-750 transition-colors"
          onClick={handleClick}
        >
          {/* Close button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-700 hover:bg-zinc-600
                       rounded-full flex items-center justify-center text-zinc-400 hover:text-white
                       transition-colors shadow-lg"
            aria-label="Fechar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Icon and text */}
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#00ff9d]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-[#00ff9d]"
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
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-snug">{text}</p>
              <p className="text-zinc-400 text-xs mt-1">Clique para compartilhar</p>
            </div>
          </div>
        </div>

        {/* Arrow pointing down to the floating button */}
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-zinc-800 border-r border-b border-zinc-700
                        transform rotate-45" />
      </div>
    </div>
  );
}
