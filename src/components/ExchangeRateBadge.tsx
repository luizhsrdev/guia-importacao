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

  // Fallback: show only CNY if invalid price
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

  // Moeda selecionada aparece em destaque (verde, grande)
  // Moeda secundária aparece menor e cinza
  if (currency === 'BRL') {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className="text-primary font-semibold text-base sm:text-lg tabular-nums tracking-tight">
          R$ {priceBRL.toFixed(2)}
        </span>
        <span className="text-text-secondary text-xs tabular-nums">
          ¥ {price.toFixed(2)}
        </span>
        {showDetails && (
          <span className="text-text-tertiary text-[10px] mt-1">
            Cotação: ¥{effectiveRate.toFixed(2)}/R$
          </span>
        )}
      </div>
    );
  }

  // currency === 'CNY'
  return (
    <div className={`flex flex-col ${className}`}>
      <span className="text-primary font-semibold text-base sm:text-lg tabular-nums tracking-tight">
        ¥ {price.toFixed(2)}
      </span>
      <span className="text-text-secondary text-xs tabular-nums">
        R$ {priceBRL.toFixed(2)}
      </span>
      {showDetails && (
        <span className="text-text-tertiary text-[10px] mt-1">
          Cotação: ¥{effectiveRate.toFixed(2)}/R$
        </span>
      )}
    </div>
  );
}
