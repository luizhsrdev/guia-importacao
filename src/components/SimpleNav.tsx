'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ICONS = {
  cotacao: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  calculadora: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  ferramentas: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75a4.5 4.5 0 01-4.884 4.484c-1.076-.091-2.264.071-2.95.904l-7.152 8.684a2.548 2.548 0 11-3.586-3.586l8.684-7.152c.833-.686.995-1.874.904-2.95a4.5 4.5 0 016.336-4.486l-3.276 3.276a3.004 3.004 0 002.25 2.25l3.276-3.276c.256.565.398 1.192.398 1.852z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
  vendedores: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  home: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  showOnMobile?: boolean;
}

interface SimpleNavProps {
  userStatus: { isAuthenticated: boolean; isPremium: boolean; isAdmin: boolean };
  onPremiumClick?: () => void;
}

export function SimpleNav({ userStatus, onPremiumClick }: SimpleNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: '/', label: 'Produtos', icon: ICONS.home, showOnMobile: true },
    { href: '/cotacao', label: 'Cotação', icon: ICONS.cotacao },
    { href: '/calculator', label: 'Calculadora', icon: ICONS.calculadora },
    { href: '/tools', label: 'Ferramentas', icon: ICONS.ferramentas },
  ];

  const isVendedoresLocked = !userStatus.isAuthenticated || (!userStatus.isPremium && !userStatus.isAdmin);

  const handleVendedoresClick = (e: React.MouseEvent) => {
    if (!userStatus.isAuthenticated) {
      e.preventDefault();
      window.location.href = '/sign-in';
      return;
    }

    if (!userStatus.isPremium && !userStatus.isAdmin) {
      e.preventDefault();
      onPremiumClick?.();
      return;
    }
  };

  return (
    <nav className="flex items-center gap-0.5">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-primary/10 text-primary border border-primary/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated border border-transparent'
            } ${!item.showOnMobile ? '' : ''}`}
          >
            {item.icon}
            <span className="hidden lg:inline">{item.label}</span>
          </Link>
        );
      })}

      <div className="w-px h-5 bg-border mx-2" />

      <Link
        href="/vendedores"
        onClick={handleVendedoresClick}
        className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
          pathname === '/vendedores'
            ? 'bg-primary/10 text-primary'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
        }`}
      >
        {ICONS.vendedores}
        <span className="hidden lg:inline">Vendedores</span>
        {isVendedoresLocked && (
          <span className="tag-gold text-[9px] px-1.5 h-4">Pro</span>
        )}
      </Link>
    </nav>
  );
}
