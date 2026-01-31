'use client';

import { useCurrency } from '@/contexts/CurrencyContext';

interface ExchangeRateBadgeProps {
  priceCNY: number | string;
  showDetails?: boolean;
  className?: string;
}

export default function ExchangeRateBadge({
  priceCNY,
  showDetails = false,
  className = '',
}: ExchangeRateBadgeProps) {
  const { currency, effectiveRate, loading, convertToBRL } = useCurrency();

  const price = typeof priceCNY === 'string' ? parseFloat(priceCNY) : priceCNY;

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-5 w-24 bg-surface-elevated rounded" />
      </div>
    );
  }

  if (isNaN(price)) {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className="text-primary font-semibold text-base sm:text-lg tabular-nums tracking-tight">
          ¥ 0.00
        </span>
      </div>
    );
  }

  const priceBRL = convertToBRL(price);
  const isBRL = currency === 'BRL';

  // Apple-style easing: fast start, smooth deceleration, no overshoot
  const appleEasing = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
  const duration = '320ms';

  return (
    <div className={`relative h-[48px] ${className}`}>
      {/* BRL Price */}
      <span
        className="absolute left-0 font-semibold tabular-nums tracking-tight whitespace-nowrap"
        style={{
          transform: isBRL ? 'translateY(0)' : 'translateY(26px)',
          fontSize: isBRL ? '1.125rem' : '0.75rem',
          color: isBRL ? 'var(--primary)' : 'var(--text-secondary)',
          opacity: 1,
          transition: `transform ${duration} ${appleEasing}, font-size ${duration} ${appleEasing}, color ${duration} ${appleEasing}`,
        }}
      >
        R$ {priceBRL.toFixed(2)}
      </span>

      {/* CNY Price */}
      <span
        className="absolute left-0 font-semibold tabular-nums tracking-tight whitespace-nowrap"
        style={{
          transform: isBRL ? 'translateY(26px)' : 'translateY(0)',
          fontSize: isBRL ? '0.75rem' : '1.125rem',
          color: isBRL ? 'var(--text-secondary)' : 'var(--primary)',
          opacity: 1,
          transition: `transform ${duration} ${appleEasing}, font-size ${duration} ${appleEasing}, color ${duration} ${appleEasing}`,
        }}
      >
        ¥ {price.toFixed(2)}
      </span>

      {showDetails && (
        <span className="absolute left-0 text-text-tertiary text-[10px]" style={{ top: '52px' }}>
          Cotação: ¥{effectiveRate.toFixed(2)}/R$
        </span>
      )}
    </div>
  );
}
