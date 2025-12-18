'use client';

import { useState, useRef, useEffect } from 'react';
import type { Category } from '@/types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode | null;
}

const ICONS = {
  peripherals: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  more: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  sellers: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  calculator: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

interface HeaderNavProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userStatus: { isAuthenticated: boolean; isPremium: boolean; isAdmin: boolean };
  onPremiumClick: () => void;
}

export function HeaderNav({
  categories,
  activeCategory,
  onCategoryChange,
  activeTab,
  onTabChange,
  userStatus,
  onPremiumClick,
}: HeaderNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const appleCategories = categories.filter((c) => {
    const name = c.name.toLowerCase();
    return (
      name.includes('apple') ||
      name.includes('iphone') ||
      name.includes('ipad') ||
      name.includes('macbook') ||
      name.includes('mac mini') ||
      name.includes('airpods') ||
      (name.includes('watch') && name.includes('apple'))
    );
  });

  const peripheralCategories = categories.filter((c) => {
    const name = c.name.toLowerCase();
    return (
      name.includes('teclado') ||
      name.includes('mouse') ||
      name.includes('headset') ||
      name.includes('fone') ||
      name.includes('monitor') ||
      name.includes('periférico') ||
      name.includes('periferico') ||
      name.includes('acessório') ||
      name.includes('acessorio')
    );
  });

  const otherCategories = categories.filter(
    (c) => !appleCategories.includes(c) && !peripheralCategories.includes(c)
  );

  const navItems: NavItem[] = [
    { id: 'apple', label: 'Apple', icon: null },
    { id: 'perifericos', label: 'Periféricos', icon: ICONS.peripherals },
    { id: 'mais', label: 'Mais', icon: ICONS.more },
  ];

  const getDropdownTitle = (itemId: string): string => {
    switch (itemId) {
      case 'apple':
        return 'Explorar todos os produtos de Apple';
      case 'perifericos':
        return 'Explorar todos os Periféricos';
      case 'mais':
        return 'Explorar Mais Produtos';
      default:
        return '';
    }
  };

  const handleClose = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
      setIsClosing(false);
    }, 250); // Duração da animação de saída
  };

  const handleMouseEnter = (itemId: string) => {
    // Cancela qualquer fechamento pendente
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    // Se já está aberto, apenas troca o item sem fechar (alternância)
    if (openDropdown) {
      setIsClosing(false);
      setIsFirstOpen(false); // Não é primeira abertura, é alternância
      setOpenDropdown(itemId);
    } else {
      // Se está fechado, aguarda 150ms para abrir
      hoverTimeoutRef.current = setTimeout(() => {
        setIsClosing(false);
        setIsFirstOpen(true); // É primeira abertura
        setOpenDropdown(itemId);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    // Agenda o fechamento após 150ms
    hoverTimeoutRef.current = setTimeout(() => {
      handleClose();
    }, 150);
  };

  const getCategoriesForDropdown = (itemId: string): Category[] => {
    if (itemId === 'apple') return appleCategories;
    if (itemId === 'perifericos') return peripheralCategories;
    if (itemId === 'mais') return otherCategories;
    return [];
  };

  const handleCategorySelect = (categoryId: string | null) => {
    if (activeTab !== 'produtos') {
      onTabChange('produtos');
    }
    onCategoryChange(categoryId);
    handleClose();
  };

  const handleVendedoresClick = () => {
    if (!userStatus.isAuthenticated) {
      window.location.href = '/sign-in';
      return;
    }

    if (userStatus.isPremium || userStatus.isAdmin) {
      onTabChange('vendedores');
      return;
    }

    onPremiumClick();
  };

  const isVendedoresLocked = !userStatus.isAuthenticated || (!userStatus.isPremium && !userStatus.isAdmin);

  return (
    <nav ref={dropdownRef} className="flex items-center gap-0.5">
      {navItems.map((item) => {
        const dropdownCategories = getCategoriesForDropdown(item.id);
        const hasCategories = dropdownCategories.length > 0;
        const isDropdownOpen = openDropdown === item.id;
        const isActive = dropdownCategories.some((c) => c.id === activeCategory);

        return (
          <div
            key={item.id}
            className="relative"
            onMouseEnter={() => hasCategories && handleMouseEnter(item.id)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive || isDropdownOpen
                  ? 'bg-primary/10 text-primary'
                  : hasCategories
                  ? 'text-text-secondary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              {item.icon}
              <span className={item.icon ? 'hidden lg:inline' : ''}>{item.label}</span>
              {hasCategories && (
                <svg
                  className={`w-3 h-3 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        );
      })}

      {/* Dropdown único que troca o conteúdo */}
      {openDropdown && (() => {
        const dropdownCategories = getCategoriesForDropdown(openDropdown);
        return (
          <div
            className={`fixed left-0 right-0 top-[64px] bg-background border-t-0 border-b border-border shadow-2xl z-50 overflow-hidden ${
              isClosing ? 'animate-appleDropdownSlideUp' : (isFirstOpen ? 'animate-appleDropdownSlide' : '')
            }`}
            onMouseEnter={() => openDropdown && handleMouseEnter(openDropdown)}
            onMouseLeave={handleMouseLeave}
          >
            {/* Título */}
            <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
              <h2 className="text-2xl font-semibold text-text-primary">
                {getDropdownTitle(openDropdown)}
              </h2>
            </div>

            {/* Grid 3 colunas estilo Apple */}
            <div className="max-w-7xl mx-auto px-6 pb-6">
              <div className="grid grid-cols-3 gap-4">
                {dropdownCategories.map((category, index) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="p-4 rounded-lg hover:bg-muted transition-colors group text-left"
                    style={{
                      animation: isClosing
                        ? `megaMenuItemOut 200ms cubic-bezier(0.32, 0.72, 0, 1) ${index * 20}ms both`
                        : isFirstOpen
                        ? `megaMenuItem 280ms cubic-bezier(0.32, 0.72, 0, 1) ${100 + index * 30}ms both`
                        : 'none',
                    }}
                  >
                    <span className={`text-sm font-medium transition-colors ${
                      activeCategory === category.id
                        ? 'text-primary'
                        : 'text-text-primary group-hover:text-primary'
                    }`}>
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="w-px h-5 bg-border mx-2" />

      <button
        onClick={handleVendedoresClick}
        className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
          activeTab === 'vendedores'
            ? 'bg-primary/10 text-primary'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
        }`}
      >
        {ICONS.sellers}
        <span className="hidden lg:inline">Vendedores</span>
        {isVendedoresLocked && (
          <span className="tag-gold text-[9px] px-1.5 h-4">Pro</span>
        )}
      </button>

      <a
        href="/calculadora"
        className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-elevated transition-all duration-150"
      >
        {ICONS.calculator}
        <span className="hidden lg:inline">Calculadora</span>
      </a>

      {/* Backdrop quando dropdown está aberto */}
      {openDropdown && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-sm ${
            isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          style={{ top: '64px', zIndex: 40 }}
          onMouseEnter={handleMouseLeave}
        />
      )}
    </nav>
  );
}
