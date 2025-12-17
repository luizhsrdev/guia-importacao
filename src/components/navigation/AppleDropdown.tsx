// src/components/navigation/AppleDropdown.tsx
'use client';

import Link from 'next/link';
import BaseDropdown from './BaseDropdown';

const appleCategories = [
  { name: 'MacBook', slug: 'macbook' },
  { name: 'Mac Mini', slug: 'mac-mini' },
  { name: 'Apple Watch', slug: 'apple-watch' },
  { name: 'AirPods & Audio', slug: 'airpods-audio' },
  { name: 'iPhone', slug: 'iphone' },
  { name: 'iPad', slug: 'ipad' },
];

export default function AppleDropdown() {
  return (
    <BaseDropdown title="Todos os produtos">
      <div className="grid grid-cols-3 gap-4">
        {appleCategories.map((category, index) => (
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
