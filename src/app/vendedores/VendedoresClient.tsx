'use client';

import { useState } from 'react';
import SellerCard from '@/components/SellerCard';

interface Seller {
  id: string;
  name: string;
  status: 'gold' | 'blacklist';
  category_id?: string;
  notes?: string;
  rating?: string;
  affiliate_link?: string;
  profile_link?: string;
  feedback_link?: string;
  image_url?: string;
  blacklist_reason?: string;
  proof_link?: string;
  evidence_images?: string[];
  seller_categories?: { name: string } | null;
  created_at?: string;
}

interface VendedoresClientProps {
  sellers: Seller[];
}

export default function VendedoresClient({ sellers }: VendedoresClientProps) {
  const [filter, setFilter] = useState<'all' | 'gold' | 'blacklist'>('all');

  const filteredSellers = sellers.filter((seller) => {
    if (filter === 'all') return true;
    return seller.status === filter;
  });

  const goldCount = sellers.filter((s) => s.status === 'gold').length;
  const blacklistCount = sellers.filter((s) => s.status === 'blacklist').length;

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-primary text-background shadow-lg shadow-primary/20'
              : 'bg-surface text-textSecondary hover:text-textMain hover:bg-surface/80 border border-zinc-800'
          }`}
        >
          Todos ({sellers.length})
        </button>
        <button
          onClick={() => setFilter('gold')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            filter === 'gold'
              ? 'bg-primary text-background shadow-lg shadow-primary/20'
              : 'bg-surface text-textSecondary hover:text-textMain hover:bg-surface/80 border border-zinc-800'
          }`}
        >
          Lista Dourada ({goldCount})
        </button>
        <button
          onClick={() => setFilter('blacklist')}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            filter === 'blacklist'
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
              : 'bg-surface text-textSecondary hover:text-textMain hover:bg-surface/80 border border-zinc-800'
          }`}
        >
          Blacklist ({blacklistCount})
        </button>
      </div>

      {/* Grid de vendedores */}
      {filteredSellers.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-zinc-800">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-textSecondary opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-textSecondary text-lg">
            Nenhum vendedor encontrado nesta categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSellers.map((seller) => (
            <SellerCard key={seller.id} seller={seller} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-12 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
        <h3 className="text-textMain font-semibold mb-2 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Aviso Importante
        </h3>
        <p className="text-textSecondary text-sm leading-relaxed">
          Esta lista é baseada em experiências relatadas pela comunidade e nossa
          análise. A <strong>Lista Dourada</strong> contém vendedores com
          histórico positivo, mas sempre faça sua própria pesquisa antes de
          comprar. A <strong>Blacklist</strong> lista vendedores reportados por
          práticas fraudulentas - evite completamente estes perfis.
        </p>
      </div>
    </div>
  );
}
