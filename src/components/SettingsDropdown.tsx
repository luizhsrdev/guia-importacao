'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useCurrency } from '@/contexts/CurrencyContext';

interface SettingsDropdownProps {
  showExchangeRateOnHome: boolean;
  onToggleExchangeRateVisibility: () => void;
}

export function SettingsDropdown({
  showExchangeRateOnHome,
  onToggleExchangeRateVisibility,
}: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { setTheme, resolvedTheme } = useTheme();
  const { currency, effectiveRate, loading, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleClose = () => {
    if (!isOpen) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      setIsOpen(true);
    }
  };

  const isDark = resolvedTheme === 'dark';

  const handleThemeToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const handleCurrencyToggle = () => {
    setCurrency(currency === 'CNY' ? 'BRL' : 'CNY');
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Settings Button */}
      <button
        onClick={handleToggle}
        className={`w-10 h-10 rounded-xl flex items-center justify-center neu-elevated transition-all duration-200 ${
          isOpen ? 'bg-primary/10 text-primary' : ''
        }`}
        aria-label="Configurações"
      >
        <svg
          className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-50 ${
            isClosing ? 'animate-dropdownOut' : 'animate-dropdown'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-border bg-surface-elevated">
            <h3 className="text-text-primary font-semibold text-sm">Configurações</h3>
          </div>

          <div className="p-2 space-y-2">
            {/* Currency Toggle - Full row clickable */}
            <button
              onClick={handleCurrencyToggle}
              className="w-full p-3 rounded-xl border border-border-emphasis hover:bg-surface-elevated active:scale-[0.98] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-text-primary text-sm font-medium">Moeda de Exibição</p>
                </div>
                {/* Animated Currency Toggle */}
                <div className="relative w-10 h-5 flex items-center justify-center overflow-hidden">
                  <span
                    className={`absolute text-primary font-semibold text-sm transition-all duration-300 ease-out ${
                      currency === 'CNY'
                        ? 'translate-y-0 opacity-100'
                        : '-translate-y-full opacity-0'
                    }`}
                  >
                    CNY
                  </span>
                  <span
                    className={`absolute text-primary font-semibold text-sm transition-all duration-300 ease-out ${
                      currency === 'BRL'
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-full opacity-0'
                    }`}
                  >
                    BRL
                  </span>
                </div>
              </div>
            </button>

            {/* Exchange Rate Display with Toggle */}
            <div className="rounded-xl border border-border-emphasis overflow-hidden">
              <div className="p-3 hover:bg-surface-elevated transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-text-primary text-sm font-medium">Cotação Atual</p>
                      <p className="text-text-tertiary text-xs">
                        {loading ? 'Carregando...' : `R$ 1,00 = ¥ ${effectiveRate.toFixed(2)}`}
                      </p>
                    </div>
                  </div>
                  <a
                    href="/cotacao"
                    className="px-3 py-1.5 rounded-lg bg-surface border border-border-emphasis text-xs font-medium text-text-primary hover:bg-surface-elevated transition-colors"
                  >
                    Ver mais
                  </a>
                </div>
              </div>

              {/* Toggle to show/hide on home - Secondary option */}
              <button
                onClick={onToggleExchangeRateVisibility}
                className="flex items-center justify-between w-full px-3 py-2.5 bg-surface-elevated/50 hover:bg-surface-elevated active:scale-[0.99] transition-all duration-200"
              >
                <span className="text-text-secondary text-xs">Sempre exibir cotação na home</span>
                <div
                  className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ease-out ${
                    showExchangeRateOnHome ? 'bg-primary' : 'bg-border-emphasis'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ease-out ${
                      showExchangeRateOnHome ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Theme Toggle - Full row clickable */}
            {mounted && (
              <button
                onClick={handleThemeToggle}
                className="w-full p-3 rounded-xl border border-border-emphasis hover:bg-surface-elevated active:scale-[0.98] transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ease-out ${isDark ? 'bg-amber-500/10' : 'bg-slate-500/10'}`}>
                      <div className="relative w-5 h-5">
                        {/* Sun icon */}
                        <svg
                          className={`w-5 h-5 text-amber-400 absolute inset-0 transition-all duration-500 ease-out ${
                            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                        </svg>
                        {/* Moon icon */}
                        <svg
                          className={`w-5 h-5 text-slate-500 absolute inset-0 transition-all duration-500 ease-out ${
                            isDark ? 'opacity-0 -rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-text-primary text-sm font-medium">{isDark ? 'Modo Escuro' : 'Modo Claro'}</p>
                  </div>
                  {/* Theme Toggle Switch */}
                  <div
                    className={`w-10 h-6 rounded-full p-1 transition-all duration-300 ease-out ${
                      isDark ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ease-out ${
                        isDark ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
