'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CurrencyToggle } from '@/components/CurrencyToggle';
import { AdminLink } from '@/components/AdminLink';

// Importar dropdown components
import AppleDropdown from '@/components/navigation/AppleDropdown';
import PerifericosDropdown from '@/components/navigation/PerifericosDropdown';
import MaisProdutosDropdown from '@/components/navigation/MaisProdutosDropdown';
import MaisFerramentasDropdown from '@/components/navigation/MaisFerramentasDropdown';
import PremiumDropdown from '@/components/navigation/PremiumDropdown';

export default function Header() {
  const { user } = useUser();
  const [isPremium, setIsPremium] = useState(false);

  // Estados para controlar qual dropdown está aberto
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar se usuário é premium
  useEffect(() => {
    if (!user) return;

    fetch('/api/check-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
      .then(res => res.json())
      .then(data => setIsPremium(data.isPremium || data.isAdmin))
      .catch(() => setIsPremium(false));
  }, [user]);

  // Handler para hover com delay de 300ms
  const handleMouseEnter = (dropdownName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(dropdownName);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Delay menor para fechar (150ms)
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between gap-8">

          {/* LEFT SIDE - Logo + Free Products */}
          <div className="flex items-center gap-6">
            {/* Logo + Nome Clicável */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">📊</span>
              <span className="font-semibold text-lg hidden md:inline">Planilha do Sena</span>
            </Link>

            {/* Separador */}
            <div className="hidden md:block h-6 w-px bg-border" />

            {/* Apple Dropdown */}
            <div
              className="relative hidden md:block"
              onMouseEnter={() => handleMouseEnter('apple')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                Apple
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {activeDropdown === 'apple' && <AppleDropdown />}
            </div>

            {/* Periféricos Dropdown */}
            <div
              className="relative hidden md:block"
              onMouseEnter={() => handleMouseEnter('perifericos')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                Periféricos
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {activeDropdown === 'perifericos' && <PerifericosDropdown />}
            </div>

            {/* Mais Produtos Dropdown */}
            <div
              className="relative hidden md:block"
              onMouseEnter={() => handleMouseEnter('mais-produtos')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                Mais Produtos
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {activeDropdown === 'mais-produtos' && <MaisProdutosDropdown />}
            </div>
          </div>

          {/* CENTER - Separador */}
          <div className="hidden md:block h-6 w-px bg-border" />

          {/* RIGHT SIDE - Premium Features + User */}
          <div className="flex items-center gap-6">
            {/* Vendedores */}
            <Link
              href="/vendedores"
              className="hidden md:block text-sm font-medium hover:text-primary transition-colors"
            >
              Vendedores
            </Link>

            {/* Calculadora */}
            <Link
              href="/calculadora"
              className="hidden md:block text-sm font-medium hover:text-primary transition-colors"
            >
              Calculadora
            </Link>

            {/* Mais Ferramentas Dropdown */}
            <div
              className="relative hidden md:block"
              onMouseEnter={() => handleMouseEnter('mais-ferramentas')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                Mais Ferramentas
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {activeDropdown === 'mais-ferramentas' && (
                <MaisFerramentasDropdown isPremium={isPremium} />
              )}
            </div>

            {/* Premium Dropdown */}
            <div
              className="relative hidden md:block"
              onMouseEnter={() => handleMouseEnter('premium')}
              onMouseLeave={handleMouseLeave}
            >
              <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                Premium
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {activeDropdown === 'premium' && (
                <PremiumDropdown isPremium={isPremium} />
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Currency Toggle */}
            <CurrencyToggle />

            {/* User Avatar/Sign In */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden md:inline">Entrar</span>
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <AdminLink />
              <UserButton />
            </SignedIn>
          </div>
        </nav>
      </header>

      {/* Backdrop */}
      {activeDropdown && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </>
  );
}
