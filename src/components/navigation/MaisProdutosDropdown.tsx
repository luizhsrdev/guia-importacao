// src/components/navigation/MaisProdutosDropdown.tsx
'use client';

import Link from 'next/link';
import BaseDropdown from './BaseDropdown';

const maisProdutosCategories = [
  { name: 'Áudio', slug: 'audio' },
  { name: 'Gaming', slug: 'gaming' },
  { name: 'Hardware PC', slug: 'hardware-pc' },
  { name: 'Notebooks', slug: 'notebooks' },
  { name: 'Smartwatches & Wearables', slug: 'smartwatches-wearables' },
  { name: 'Tablets & Celulares', slug: 'tablets-celulares' },
  { name: 'Vídeo', slug: 'video' },
];

export default function MaisProdutosDropdown() {
  return (
    <BaseDropdown title="Todos os produtos">
      <div className="grid grid-cols-3 gap-4">
        {maisProdutosCategories.map((category, index) => (
          <Link
            key={category.slug}
            href={`/categoria/${category.slug}`}
            className="p-4 rounded-lg hover:bg-muted transition-colors group"
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
