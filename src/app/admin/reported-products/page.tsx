'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface ReportedProduct {
  id: string;
  title: string;
  image_main: string;
  broken_link_reports: number;
  out_of_stock_reports: number;
  seller_not_responding_reports: number;
  wrong_price_reports: number;
  other_reports: number;
  is_sold_out: boolean;
  needs_validation: boolean;
}

export default function ReportedProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ReportedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/check-admin');
      if (!res.ok) {
        router.push('/');
        return;
      }
      setIsAdmin(true);
      fetchReportedProducts();
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      router.push('/');
    }
  };

  const fetchReportedProducts = async () => {
    try {
      const res = await fetch('/api/admin/reported-products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Erro ao buscar produtos reportados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSoldOut = async (productId: string) => {
    try {
      const res = await fetch('/api/admin/products/mark-sold-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.ok) {
        toast.success('Produto marcado como esgotado');
        fetchReportedProducts();
      } else {
        toast.error('Erro ao marcar produto');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao marcar produto');
    }
  };

  const handleClearReports = async (productId: string) => {
    try {
      const res = await fetch('/api/admin/products/clear-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });

      if (res.ok) {
        toast.success('Reports limpos com sucesso');
        fetchReportedProducts();
      } else {
        toast.error('Erro ao limpar reports');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao limpar reports');
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalReports = products.reduce(
    (acc, p) => acc + p.broken_link_reports + p.out_of_stock_reports + p.seller_not_responding_reports + p.wrong_price_reports + p.other_reports,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Produtos Reportados</h1>
              <p className="text-sm text-text-muted mt-1">
                Gerencie reports de usuários sobre problemas em produtos
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:border-border-emphasis transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm font-medium">Voltar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-muted">Total de Reports</p>
                <p className="text-2xl font-bold text-text-primary">{totalReports}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-muted">Produtos com Problemas</p>
                <p className="text-2xl font-bold text-text-primary">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-text-muted">Precisam Validação</p>
                <p className="text-2xl font-bold text-text-primary">
                  {products.filter(p => p.needs_validation).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {products.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Nenhum produto reportado</h3>
            <p className="text-sm text-text-muted">Não há produtos com reports no momento</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-elevated border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="text-center px-2 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider" title="Link Quebrado">
                      ⚠️
                    </th>
                    <th className="text-center px-2 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider" title="Sem Estoque">
                      📦
                    </th>
                    <th className="text-center px-2 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider" title="Vendedor Não Responde">
                      💬
                    </th>
                    <th className="text-center px-2 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider" title="Preço Diferente">
                      💰
                    </th>
                    <th className="text-center px-2 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider" title="Outros">
                      📝
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-surface-elevated transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_main}
                            alt={product.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="max-w-[200px]">
                            <p className="text-sm font-medium text-text-primary line-clamp-2">
                              {product.title}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                          product.broken_link_reports > 0
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {product.broken_link_reports}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                          product.out_of_stock_reports > 0
                            ? 'bg-orange-500/10 text-orange-500'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {product.out_of_stock_reports}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                          product.seller_not_responding_reports > 0
                            ? 'bg-blue-500/10 text-blue-500'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {product.seller_not_responding_reports}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                          product.wrong_price_reports > 0
                            ? 'bg-purple-500/10 text-purple-500'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {product.wrong_price_reports}
                        </span>
                      </td>
                      <td className="px-2 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                          product.other_reports > 0
                            ? 'bg-pink-500/10 text-pink-500'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {product.other_reports}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {product.is_sold_out ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            Esgotado
                          </span>
                        ) : product.needs_validation ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                            Precisa Validar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Ativo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!product.is_sold_out && (
                            <button
                              onClick={() => handleMarkAsSoldOut(product.id)}
                              className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              title="Marcar como esgotado"
                            >
                              Marcar Esgotado
                            </button>
                          )}
                          <button
                            onClick={() => handleClearReports(product.id)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Limpar reports"
                          >
                            Limpar Reports
                          </button>
                          <button
                            onClick={() => window.open(`/?product=${product.id}`, '_blank')}
                            className="p-1.5 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Ver produto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
