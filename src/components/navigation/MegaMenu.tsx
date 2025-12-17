'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface MegaMenuCategory {
  name: string;
  href: string;
  icon?: React.ReactNode;
  color?: string; // Cor de fundo do card da categoria
}

interface MegaMenuProps {
  label: string;
  categories: MegaMenuCategory[];
  icon?: React.ReactNode;
  isActive?: boolean;
}

export function MegaMenu({ label, categories, icon, isActive = false }: MegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const openTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Limpar timeouts ao desmontar
  useEffect(() => {
    return () => {
      if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMouseEnter = () => {
    // Cancelar timeout de fechar se existir
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    // Delay de 300ms antes de abrir
    openTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
      setIsAnimating(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    // Cancelar timeout de abrir se existir
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }

    // Delay de 150ms para fechar
    closeTimeoutRef.current = setTimeout(() => {
      handleClose();
    }, 150);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 200); // Tempo da animação de fade out
  };

  const handleItemClick = () => {
    handleClose();
  };

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Botão do menu */}
      <button
        className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
          isActive || isOpen
            ? 'bg-primary/10 text-primary'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
        }`}
      >
        {icon}
        <span className={icon ? 'hidden lg:inline' : ''}>{label}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu dropdown */}
      {isOpen && (
        <>
          {/* Backdrop com fadeIn */}
          <div
            className={`fixed inset-0 bg-black/30 z-40 ${
              isAnimating ? 'animate-fadeIn' : 'opacity-0'
            }`}
            style={{ top: '64px' }} // Altura do header
          />

          {/* Painel do menu com slide-down */}
          <div
            className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] max-w-[90vw] bg-background border border-border rounded-xl shadow-lg z-50 p-6 ${
              isAnimating ? 'animate-megaMenuSlide' : 'opacity-0'
            }`}
          >
            {/* Grid de 3 colunas com stagger animation */}
            <div className="grid grid-cols-3 gap-4">
              {categories.map((category, index) => (
                <Link
                  key={category.href}
                  href={category.href}
                  onClick={handleItemClick}
                  className="group"
                  style={{
                    animation: isAnimating ? `megaMenuItem 200ms ease-out ${index * 40}ms both` : 'none',
                  }}
                >
                  <div
                    className={`p-4 rounded-lg transition-all hover:scale-105 ${
                      category.color || 'bg-zinc-800 dark:bg-zinc-700'
                    }`}
                  >
                    {category.icon && (
                      <div className="text-3xl mb-2">{category.icon}</div>
                    )}
                    <span className="text-sm font-medium text-white">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
