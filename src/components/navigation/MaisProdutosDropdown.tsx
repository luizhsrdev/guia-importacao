// src/components/navigation/MaisProdutosDropdown.tsx
'use client';

import Link from 'next/link';
import BaseDropdown from './BaseDropdown';

const maisCategories = [
  { name: 'Áudio', href: '/categoria/audio' },
  { name: 'Gaming', href: '/categoria/gaming' },
  { name: 'Hardware PC', href: '/categoria/hardware-pc' },
  { name: 'Notebooks', href: '/categoria/notebooks' },
  { name: 'Smartwatches & Wearables', href: '/categoria/smartwatches-wearables' },
  { name: 'Tablets & Celulares', href: '/categoria/tablets-celulares' },
  { name: 'Vídeo', href: '/categoria/video' },
];

export default function MaisProdutosDropdown() {
  return (
    <BaseDropdown title="Mais Produtos">
      <div className="grid grid-cols-3 gap-4">
        {maisCategories.map((category, index) => (
          <Link
            key={category.href}
            href={category.href}
            className="p-4 rounded-lg hover:bg-surface-elevated transition-colors group"
            style={{
              animation: `megaMenuItem 200ms ease-out ${index * 40}ms both`,
            }}
          >
            <span className="text-sm font-medium group-hover:text-primary transition-colors">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </BaseDropdown>
  );
}
