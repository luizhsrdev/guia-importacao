'use client';

import { useState, useEffect } from 'react';

interface TopProduct {
  id: string;
  title: string;
  view_count: number;
  card_click_count: number;
  purchase_click_count: number;
  card_ctr: number;
}

interface TopCategory {
  id: string;
  name: string;
  emoji?: string;
  selection_count: number;
}

interface AdminMetricsContentProps {
  adminMode: boolean;
  onToggleAdminMode: () => void;
}

export default function AdminMetricsContent({
  adminMode,
  onToggleAdminMode
}: AdminMetricsContentProps) {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/top-metrics');
      const data = await res.json();
      setTopProducts(data.topProducts || []);
      setTopCategories(data.topCategories || []);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {/* Toggle Modo Admin */}
      <div className="bg-surface-elevated border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-sm text-text-primary">Modo Admin</h3>
            <p className="text-xs text-text-muted">
              {adminMode ? 'Edição ativada' : 'Apenas visualização'}
            </p>
          </div>
          <button
            onClick={onToggleAdminMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              adminMode ? 'bg-primary' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                adminMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {adminMode && (
          <p className="text-xs text-primary mt-2">
            Botões de edição visíveis nos cards
          </p>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Top Produtos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-text-primary flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Produtos Mais Acessados
              </h3>
              <button
                onClick={fetchMetrics}
                className="text-xs text-primary hover:text-primary-hover transition-colors"
              >
                Atualizar
              </button>
            </div>
            <div className="space-y-2">
              {topProducts.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4 bg-surface-elevated rounded-lg border border-border">
                  Nenhum dado disponível ainda
                </p>
              ) : (
                topProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={product.id}
                    className="bg-surface-elevated rounded-lg p-3 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 flex items-start gap-2">
                        <span className="text-base font-bold text-primary min-w-[24px]">
                          #{index + 1}
                        </span>
                        <h4 className="text-xs font-medium line-clamp-1 flex-1 text-text-primary">
                          {product.title}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted">
                      <div className="flex items-center gap-1" title="Visualizações">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{product.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Cliques no Card">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                        <span>{product.card_click_count}</span>
                      </div>
                      <div className="flex items-center gap-1" title="Cliques para Compra">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{product.purchase_click_count}</span>
                      </div>
                      <div
                        className={`font-medium ml-auto ${
                          product.card_ctr >= 10
                            ? 'text-emerald-500'
                            : product.card_ctr >= 5
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}
                        title="Card CTR"
                      >
                        {product.card_ctr.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Categorias */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-text-primary flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Categorias Mais Selecionadas
            </h3>
            <div className="space-y-2">
              {topCategories.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4 bg-surface-elevated rounded-lg border border-border">
                  Nenhum dado disponível ainda
                </p>
              ) : (
                topCategories.slice(0, 5).map((category, index) => (
                  <div
                    key={category.id}
                    className="bg-surface-elevated rounded-lg p-3 border border-border hover:border-primary/50 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-primary min-w-[24px]">
                        #{index + 1}
                      </span>
                      {category.emoji && (
                        <span className="text-xl">{category.emoji}</span>
                      )}
                      <div>
                        <p className="text-sm font-medium text-text-primary">{category.name}</p>
                        <p className="text-xs text-text-muted">
                          {category.selection_count} seleções
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Footer Info */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-xs text-text-secondary">
        <div className="flex gap-2">
          <span>💡</span>
          <p>
            <strong>Dica:</strong> Use as métricas para identificar produtos e categorias
            populares e priorizá-los na home.
          </p>
        </div>
      </div>
    </div>
  );
}
