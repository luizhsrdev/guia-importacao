// src/components/navigation/MaisFerramentasDropdown.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import BaseDropdown from './BaseDropdown';

const ferramentas = [
  { name: 'Cotação CNY/BRL', href: '/cotacao', premium: true },
  { name: 'Comunidade', href: '/comunidade', premium: true },
  { name: 'Planilha Revenda', href: '/planilha-revenda', premium: true },
];

interface MaisFerramentasDropdownProps {
  isPremium: boolean;
}

export default function MaisFerramentasDropdown({ isPremium }: MaisFerramentasDropdownProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent, item: typeof ferramentas[0]) => {
    if (item.premium && !isPremium) {
      e.preventDefault();
      setShowModal(true);
    }
  };

  return (
    <>
      <BaseDropdown title="Ferramentas Premium">
        <div className="grid grid-cols-3 gap-4">
          {ferramentas.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleClick(e, item)}
              className="p-4 rounded-lg hover:bg-surface-elevated transition-colors group relative"
              style={{
                animation: `megaMenuItem 200ms ease-out ${index * 40}ms both`,
              }}
            >
              {/* Badge Premium */}
              {item.premium && !isPremium && (
                <span className="absolute top-2 right-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                  🔒 Premium
                </span>
              )}

              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </BaseDropdown>

      {/* Modal Premium */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-background border border-border rounded-xl max-w-2xl w-full p-8 shadow-2xl">
            <h2 className="text-3xl font-bold mb-3">Conteúdo Premium</h2>
            <p className="text-text-secondary text-lg mb-6">
              Esta ferramenta está disponível apenas para assinantes Premium.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = '/premium'}
                className="flex-1 bg-primary text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-primary-hover transition-all"
              >
                Assinar Premium - R$ 9,90
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-surface-elevated text-text-secondary px-6 py-3 rounded-lg font-medium hover:bg-surface transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
