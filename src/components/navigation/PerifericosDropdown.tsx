// src/components/navigation/PerifericosDropdown.tsx
'use client';

import Link from 'next/link';
import BaseDropdown from './BaseDropdown';

const perifericosCategories = [
  { name: 'Mouses', slug: 'mouses' },
  { name: 'Teclados', slug: 'teclados' },
  { name: 'Webcams', slug: 'webcams' },
  { name: 'Monitores', slug: 'monitores' },
  { name: 'Headsets', slug: 'headsets' },
  { name: 'Controles', slug: 'controles' },
];

export default function PerifericosDropdown() {
  return (
    <BaseDropdown title="Periféricos & Acessórios">
      <div className="grid grid-cols-3 gap-4">
        {perifericosCategories.map((category, index) => (
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
