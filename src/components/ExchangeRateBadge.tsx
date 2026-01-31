'use client';

import { useEffect, useState } from 'react';

interface ExchangeRateData {
  officialRate: number;
  manualAdjustment: number;
  effectiveRate: number;
  updatedAt: string;
}

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
  const [rateData, setRateData] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('/api/exchange-rate');
        if (res.ok) {
          const data = await res.json();
          setRateData(data);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  const price = typeof priceCNY === 'string' ? parseFloat(priceCNY) : priceCNY;

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-5 w-24 bg-surface-elevated rounded" />
      </div>
    );
  }

  // Fallback: show only CNY if no rate data or invalid price
  if (!rateData || isNaN(price)) {
    return (
      <div className={`flex flex-col ${className}`}>
        <span className="text-primary font-semibold text-base sm:text-lg tabular-nums tracking-tight">
          ¥ {isNaN(price) ? '0.00' : price.toFixed(2)}
        </span>
      </div>
    );
  }

  // CNY to BRL: priceCNY / effectiveRate
  const priceBRL = price / rateData.effectiveRate;

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
          Cotação: ¥{rateData.effectiveRate.toFixed(3)}/R$
        </span>
      )}
    </div>
  );
}
