'use client';

import { useState, useEffect, useRef } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { AdminLink } from './AdminLink';
import CurrencyToggle from './CurrencyToggle';
import { ThemeToggle } from './ThemeToggle';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-surface border border-border hover:bg-surface-elevated transition-colors"
        aria-label="Abrir menu"
        aria-expanded={isOpen}
      >
        <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm animate-fadeIn">
          <div
            ref={menuRef}
            className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-surface border-l border-border shadow-2xl animate-slideInRight safe-top safe-bottom"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="font-semibold text-text-primary">Menu</span>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors"
                aria-label="Fechar menu"
              >
                <svg className="w-5 h-5 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Moeda</span>
                <CurrencyToggle />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">Tema</span>
                <ThemeToggle />
              </div>

              <div className="divider" />

              <SignedOut>
                <div className="space-y-3">
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full btn-ghost py-3 px-4 rounded-lg text-sm font-medium"
                    >
                      Entrar
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full btn-primary py-3 px-4 rounded-lg text-sm font-medium"
                    >
                      Criar Conta
                    </button>
                  </SignUpButton>
                </div>
              </SignedOut>

              <SignedIn>
                <div onClick={() => setIsOpen(false)}>
                  <AdminLink />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
