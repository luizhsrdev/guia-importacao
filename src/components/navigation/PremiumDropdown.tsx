// src/components/navigation/PremiumDropdown.tsx
'use client';

import Link from 'next/link';
import BaseDropdown from './BaseDropdown';

interface PremiumDropdownProps {
  isPremium: boolean;
}

export default function PremiumDropdown({ isPremium }: PremiumDropdownProps) {
  return (
    <BaseDropdown>
      <div className="space-y-4">
        {/* Status */}
        <div className="text-center pb-4 border-b border-border">
          {isPremium ? (
            <div className="flex items-center justify-center gap-2 text-primary">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Você é Premium!</span>
            </div>
          ) : (
            <div className="text-text-secondary">
              <p className="font-semibold mb-2">Desbloqueie recursos exclusivos</p>
              <p className="text-sm">Apenas R$ 9,90 pagamento único</p>
            </div>
          )}
        </div>

        {/* Benefícios */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-text-tertiary uppercase">Benefícios Premium:</h4>

          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-primary">✅</span>
              <span className="text-sm">Lista Dourada de Vendedores</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✅</span>
              <span className="text-sm">Blacklist com Provas de Golpes</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✅</span>
              <span className="text-sm">Planilha de Revenda Automática</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✅</span>
              <span className="text-sm">Acesso à Comunidade</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary">✅</span>
              <span className="text-sm">Cotação CNY/BRL em Tempo Real</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        {!isPremium && (
          <Link
            href="/premium"
            className="block w-full bg-primary text-white text-center px-6 py-3 rounded-lg font-bold hover:bg-primary-hover transition-all"
          >
            Assinar Agora - R$ 9,90
          </Link>
        )}
      </div>
    </BaseDropdown>
  );
}
