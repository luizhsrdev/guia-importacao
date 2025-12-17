// src/components/navigation/PerifericosDropdown.tsx
'use client';

import Link from 'next/link';
import BaseDropdown from './BaseDropdown';

const perifericosCategories = [
  { name: 'Mouses', href: '/categoria/mouses' },
  { name: 'Teclados', href: '/categoria/teclados' },
  { name: 'Webcams', href: '/categoria/webcams' },
  { name: 'Monitores', href: '/categoria/monitores' },
  { name: 'Headsets', href: '/categoria/headsets' },
  { name: 'Controles', href: '/categoria/controles' },
];

export default function PerifericosDropdown() {
  return (
    <BaseDropdown title="Periféricos & Acessórios">
      <div className="grid grid-cols-3 gap-4">
        {perifericosCategories.map((category, index) => (
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
