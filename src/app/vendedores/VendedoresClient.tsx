'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'gold' | 'blacklist'>('all');

  const filteredSellers = sellers.filter((seller) => {
    if (filter === 'all') return true;
    return seller.status === filter;
  });

  const goldCount = sellers.filter((s) => s.status === 'gold').length;
  const blacklistCount = sellers.filter((s) => s.status === 'blacklist').length;

  return (
    <div>
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Voltar para Produtos
      </button>

      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-md font-medium transition-all ${
            filter === 'all'
              ? 'btn-primary'
              : 'btn-secondary'
          }`}
        >
          Todos ({sellers.length})
        </button>
        <button
          onClick={() => setFilter('gold')}
          className={`px-6 py-3 rounded-md font-medium transition-all ${
            filter === 'gold'
              ? 'bg-accent-gold text-background'
              : 'btn-secondary'
          }`}
        >
          Lista Dourada ({goldCount})
        </button>
        <button
          onClick={() => setFilter('blacklist')}
          className={`px-6 py-3 rounded-md font-medium transition-all ${
            filter === 'blacklist'
              ? 'btn-danger'
              : 'btn-secondary'
          }`}
        >
          Blacklist ({blacklistCount})
        </button>
      </div>

      {filteredSellers.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-lg border border-border">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-text-tertiary opacity-50"
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
          <p className="text-text-secondary text-lg">
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

      <div className="mt-12 p-6 bg-surface-elevated border border-border rounded-lg">
        <h3 className="text-text-primary font-semibold mb-2 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-accent-blue"
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
        <p className="text-text-secondary text-sm leading-relaxed">
          Esta lista é baseada em experiências relatadas pela comunidade e nossa
          análise. A <span className="text-accent-gold font-medium">Lista Dourada</span> contém vendedores com
          histórico positivo, mas sempre faça sua própria pesquisa antes de
          comprar. A <span className="text-danger font-medium">Blacklist</span> lista vendedores reportados por
          práticas fraudulentas - evite completamente estes perfis.
        </p>
      </div>
    </div>
  );
}
