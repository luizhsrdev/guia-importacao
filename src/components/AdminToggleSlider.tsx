'use client';

import { useEffect, useRef } from 'react';
import { useAdminMode } from '@/contexts/AdminModeContext';

interface AdminToggleSliderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminToggleSlider({ isOpen, onClose }: AdminToggleSliderProps) {
  const { isAdminModeActive, toggleAdminMode } = useAdminMode();
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300" />
      )}

      {/* Slider */}
      <div
        ref={sliderRef}
        className={`fixed top-0 right-0 h-full w-80 bg-surface border-l border-border shadow-2xl z-50 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Admin</h2>
                <p className="text-xs text-text-muted">Controles administrativos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-elevated hover:bg-border transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <div className="space-y-6">
              {/* Modo Admin Toggle */}
              <div className="bg-surface-elevated rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1">Modo Admin</h3>
                    <p className="text-xs text-text-muted">
                      Exibir controles de edição nos cards
                    </p>
                  </div>
                  <button
                    onClick={toggleAdminMode}
                    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                      isAdminModeActive ? 'bg-red-500' : 'bg-border'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                        isAdminModeActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {isAdminModeActive && (
                  <div className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 mt-2">
                    Controles de admin visíveis
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-5 h-5 text-blue-500 flex-shrink-0">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xs text-text-secondary">
                    Quando ativo, você verá botões de edição nos cards de produtos e opção de adicionar novos produtos.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <p className="text-xs text-text-muted text-center">
              Painel administrativo integrado
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
