'use client';

import { useState, useEffect, useRef } from 'react';
import { getPublicProducts } from '../actions';
import { getSellers, getCategories } from './sellers/actions';
import { getCategories as getProductCategories } from './products/actions';
import ProductsClient from './products/ProductsClient';
import SellersClient from './sellers/SellersClient';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [productCategories, setProductCategories] = useState<any[]>([]);
  const [sellerCategories, setSellerCategories] = useState<any[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Buscar dados
  useEffect(() => {
    // Produtos
    getPublicProducts().then((data) => setProducts(data || []));

    // Vendedores
    getSellers().then((data) => setSellers(data || []));

    // Categorias de produtos
    getProductCategories().then((data) => setProductCategories(data || []));

    // Categorias de vendedores
    getCategories().then((data) => setSellerCategories(data || []));
  }, []);

  // Atualizar posição do indicador animado
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);

  const goldSellers = sellers.filter((s) => s.status === 'gold');
  const blacklistSellers = sellers.filter((s) => s.status === 'blacklist');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Painel Administrativo
          </h1>
          <p className="text-textSecondary">
            Gerencie produtos e vendedores
          </p>
        </div>

        {/* Sistema de Abas */}
        <div className="relative border-b border-zinc-800 mb-8">
          <div className="flex gap-2 relative">
            <button
              ref={(el) => {
                tabRefs.current['products'] = el;
              }}
              onClick={() => setActiveTab('products')}
              className={`
                relative px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap
                ${
                  activeTab === 'products'
                    ? 'text-primary'
                    : 'text-textSecondary hover:text-textMain'
                }
              `}
            >
              Produtos ({products.length})
            </button>

            <button
              ref={(el) => {
                tabRefs.current['sellers'] = el;
              }}
              onClick={() => setActiveTab('sellers')}
              className={`
                relative px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap
                ${
                  activeTab === 'sellers'
                    ? 'text-primary'
                    : 'text-textSecondary hover:text-textMain'
                }
              `}
            >
              Vendedores (Gold: {goldSellers.length} | Blacklist:{' '}
              {blacklistSellers.length})
            </button>

            {/* Indicador animado (sublinhado) */}
            <div
              className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
              }}
            />
          </div>
        </div>

        {/* Conteúdo Dinâmico */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in duration-300">
            <ProductsClient
              products={products}
              categories={productCategories}
            />
          </div>
        )}

        {activeTab === 'sellers' && (
          <div className="animate-in fade-in duration-300">
            <SellersClient sellers={sellers} categories={sellerCategories} />
          </div>
        )}
      </div>
    </div>
  );
}
