// src/components/navigation/AppleDropdown.tsx
'use client';

import Link from 'next/link';
import BaseDropdown from './BaseDropdown';

const appleCategories = [
  { name: 'MacBook', href: '/categoria/macbook' },
  { name: 'Mac Mini', href: '/categoria/mac-mini' },
  { name: 'Apple Watch', href: '/categoria/apple-watch' },
  { name: 'AirPods & Audio', href: '/categoria/airpods-audio' },
  { name: 'iPhone', href: '/categoria/iphone' },
  { name: 'iPad', href: '/categoria/ipad' },
];

export default function AppleDropdown() {
  return (
    <BaseDropdown title="Produtos Apple">
      <div className="grid grid-cols-3 gap-4">
        {appleCategories.map((category, index) => (
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
