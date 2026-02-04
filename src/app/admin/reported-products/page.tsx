'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ProductFormModal } from '@/components/ProductFormModal';
import { SellerFormModal } from '@/components/SellerFormModal';
import { getCategories as getProductCategories } from '@/lib/actions/products';
import { getCategories as getSellerCategories } from '@/lib/actions/sellers';

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
  affiliate_link: string;
  original_link: string;
}

interface ProductReport {
  id: string;
  report_type: string;
  description: string | null;
  created_at: string;
  user_ip: string;
}

interface ReportedSeller {
  id: string;
  name: string;
  status: 'gold' | 'blacklist';
  profile_link: string | null;
  image_url: string | null;
  broken_link_reports: number;
  seller_not_responding_reports: number;
  other_reports: number;
  needs_validation: boolean;
}

interface SellerReport {
  id: string;
  report_type: string;
  description: string | null;
  created_at: string;
  user_ip: string;
}

interface Suggestion {
  id: string;
  text: string;
  page_url: string;
  trigger_type: 'floating_button' | 'nudge_time' | 'nudge_visit' | 'nudge_zero_results';
  search_query: string | null;
  user_id: string | null;
  user_ip_hash: string;
  created_at: string;
  is_read: boolean;
  read_at: string | null;
}

type TabType = 'products' | 'sellers' | 'suggestions';

export default function ReportedProductsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [products, setProducts] = useState<ReportedProduct[]>([]);
  const [sellers, setSellers] = useState<ReportedSeller[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ReportedProduct | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<ReportedSeller | null>(null);
  const [productReports, setProductReports] = useState<ProductReport[]>([]);
  const [sellerReports, setSellerReports] = useState<SellerReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [productCategories, setProductCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [sellerCategories, setSellerCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [suggestionsTotal, setSuggestionsTotal] = useState(0);
  const [suggestionsUnread, setSuggestionsUnread] = useState(0);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  useEffect(() => {
    checkAdminStatus();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      console.log('[REPORTED PRODUCTS] Carregando categorias...');
      const [productCats, sellerCats] = await Promise.all([
        getProductCategories(),
        getSellerCategories()
      ]);
      console.log('[REPORTED PRODUCTS] Product categories:', productCats.length);
      console.log('[REPORTED PRODUCTS] Seller categories:', sellerCats.length);
      setProductCategories(productCats);
      setSellerCategories(sellerCats);
    } catch (error) {
      console.error('[REPORTED PRODUCTS] Erro ao carregar categorias:', error);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/check-admin');
      if (!res.ok) {
        router.push('/');
        return;
      }
      setIsAdmin(true);
      fetchReportedData();
    } catch (error) {
      console.error('Erro ao verificar admin:', error);
      router.push('/');
    }
  };

  const fetchReportedData = async () => {
    try {
      // Buscar produtos, vendedores e sugestões via API
      const [productsRes, sellersRes, suggestionsRes] = await Promise.all([
        fetch('/api/admin/reported-products'),
        fetch('/api/admin/reported-sellers'),
        fetch('/api/admin/suggestions')
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }

      if (sellersRes.ok) {
        const data = await sellersRes.json();
        setSellers(data.sellers || []);
      }

      if (suggestionsRes.ok) {
        const data = await suggestionsRes.json();
        setSuggestions(data.suggestions || []);
        setSuggestionsTotal(data.total || 0);
        setSuggestionsUnread(data.unread || 0);
      }
    } catch (error) {
      console.error('Erro ao buscar dados reportados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSoldOut = async (productId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const res = await fetch('/api/admin/products/mark-sold-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, is_sold_out: newStatus }),
      });

      if (res.ok) {
        toast.success(newStatus ? 'Produto marcado como esgotado' : 'Produto retornado ao estoque');
        fetchReportedData();
      } else {
        toast.error('Erro ao atualizar produto');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar produto');
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
        fetchReportedData();
        setSelectedProduct(null);
      } else {
        toast.error('Erro ao limpar reports');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao limpar reports');
    }
  };

  const handleClearSellerReports = async (sellerId: string) => {
    try {
      const res = await fetch('/api/admin/sellers/clear-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seller_id: sellerId }),
      });

      if (res.ok) {
        toast.success('Reports limpos com sucesso');
        fetchReportedData();
        setSelectedSeller(null);
      } else {
        toast.error('Erro ao limpar reports');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao limpar reports');
    }
  };

  const handleToggleSuggestionRead = async (suggestionId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion_id: suggestionId, is_read: !currentStatus }),
      });

      if (res.ok) {
        toast.success(currentStatus ? 'Marcado como não lido' : 'Marcado como lido');
        fetchReportedData();
        if (selectedSuggestion?.id === suggestionId) {
          setSelectedSuggestion({ ...selectedSuggestion, is_read: !currentStatus });
        }
      } else {
        toast.error('Erro ao atualizar sugestão');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao atualizar sugestão');
    }
  };

  const handleDeleteSuggestion = async (suggestionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta sugestão?')) return;

    try {
      const res = await fetch(`/api/admin/suggestions?id=${suggestionId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Sugestão excluída');
        fetchReportedData();
        setSelectedSuggestion(null);
      } else {
        toast.error('Erro ao excluir sugestão');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir sugestão');
    }
  };

  const fetchProductReports = async (productId: string) => {
    setLoadingReports(true);
    try {
      const res = await fetch(`/api/admin/product-reports?product_id=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setProductReports(data.reports || []);
      }
    } catch (error) {
      console.error('Erro ao buscar reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchSellerReports = async (sellerId: string) => {
    setLoadingReports(true);
    try {
      const res = await fetch(`/api/admin/seller-reports?seller_id=${sellerId}`);
      if (res.ok) {
        const data = await res.json();
        setSellerReports(data.reports || []);
      }
    } catch (error) {
      console.error('Erro ao buscar reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleProductClick = (product: ReportedProduct) => {
    setSelectedProduct(product);
    setSelectedSeller(null);
    fetchProductReports(product.id);
  };

  const handleSellerClick = (seller: ReportedSeller) => {
    setSelectedSeller(seller);
    setSelectedProduct(null);
    fetchSellerReports(seller.id);
  };

  const handleEditProduct = (productId: string) => {
    console.log('[REPORTED PRODUCTS] Clicou em editar produto:', productId);
    console.log('[REPORTED PRODUCTS] Categorias disponíveis:', productCategories.length);
    setEditingProductId(productId);
    console.log('[REPORTED PRODUCTS] editingProductId setado para:', productId);
  };

  const handleEditSeller = (sellerId: string) => {
    console.log('[REPORTED PRODUCTS] Clicou em editar vendedor:', sellerId);
    console.log('[REPORTED PRODUCTS] Categorias disponíveis:', sellerCategories.length);
    setEditingSellerId(sellerId);
    console.log('[REPORTED PRODUCTS] editingSellerId setado para:', sellerId);
  };

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      broken_link: 'Link Quebrado',
      out_of_stock: 'Sem Estoque',
      seller_not_responding: 'Vendedor não responde',
      wrong_price: 'Preço diferente',
      other: 'Outro motivo'
    };
    return labels[type] || type;
  };

  const getTriggerTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      floating_button: 'Botão flutuante',
      nudge_time: 'Tempo na página',
      nudge_visit: 'Visita recorrente',
      nudge_zero_results: 'Busca sem resultados'
    };
    return labels[type] || type;
  };

  const getTriggerTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      floating_button: 'bg-green-500/10 text-green-500 border-green-500/30',
      nudge_time: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
      nudge_visit: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      nudge_zero_results: 'bg-orange-500/10 text-orange-500 border-orange-500/30'
    };
    return colors[type] || 'bg-zinc-500/10 text-zinc-500 border-zinc-500/30';
  };

  // Calcular totais
  const totalProductReports = products.reduce(
    (acc, p) => acc + p.broken_link_reports + p.out_of_stock_reports + p.seller_not_responding_reports + p.wrong_price_reports + p.other_reports,
    0
  );

  const totalSellerReports = sellers.reduce(
    (acc, s) => acc + s.broken_link_reports + s.seller_not_responding_reports + s.other_reports,
    0
  );

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
              <p className="text-sm text-text-muted mt-1">
                Gerencie reports de usuários sobre problemas
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-border hover:border-border-emphasis transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium">Início</span>
            </button>
          </div>
        </div>
      </header>

      {/* Widgets e Abas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Widget Produtos */}
          <button
            onClick={() => setActiveTab('products')}
            className={`bg-surface border-2 rounded-xl p-6 text-left transition-all ${
              activeTab === 'products'
                ? 'border-yellow-500'
                : 'border-border hover:border-border-emphasis'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Produtos</p>
                <p className="text-3xl font-bold text-text-primary">{totalProductReports}</p>
                <p className="text-xs text-text-muted mt-1">{products.length} produto{products.length !== 1 ? 's' : ''} reportado{products.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </button>

          {/* Widget Vendedores */}
          <button
            onClick={() => setActiveTab('sellers')}
            className={`bg-surface border-2 rounded-xl p-6 text-left transition-all ${
              activeTab === 'sellers'
                ? 'border-blue-500'
                : 'border-border hover:border-border-emphasis'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Vendedores</p>
                <p className="text-3xl font-bold text-text-primary">{totalSellerReports}</p>
                <p className="text-xs text-text-muted mt-1">{sellers.length} vendedor{sellers.length !== 1 ? 'es' : ''} reportado{sellers.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </button>

          {/* Widget Sugestões */}
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`bg-surface border-2 rounded-xl p-6 text-left transition-all ${
              activeTab === 'suggestions'
                ? 'border-[#00ff9d]'
                : 'border-border hover:border-border-emphasis'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00ff9d]/10 flex items-center justify-center relative">
                <svg className="w-6 h-6 text-[#00ff9d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {suggestionsUnread > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {suggestionsUnread > 9 ? '9+' : suggestionsUnread}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">Sugestões</p>
                <p className="text-3xl font-bold text-text-primary">{suggestionsTotal}</p>
                <p className="text-xs text-text-muted mt-1">{suggestionsUnread} não lida{suggestionsUnread !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Tabela de Produtos */}
        {activeTab === 'products' && (products.length === 0 ? (
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
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Link OFF
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      S/Estoque
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Outros
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-surface-elevated transition-colors cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
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
                      <td className="px-3 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          product.broken_link_reports > 0
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {product.broken_link_reports}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          product.out_of_stock_reports > 0
                            ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {product.out_of_stock_reports}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          product.seller_not_responding_reports > 0
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {product.seller_not_responding_reports}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          product.wrong_price_reports > 0
                            ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {product.wrong_price_reports}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          product.other_reports > 0
                            ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
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
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {/* Link Afiliado */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(product.affiliate_link, '_blank');
                            }}
                            className="p-2 text-emerald-600 hover:bg-emerald-600/10 rounded-lg transition-colors"
                            title="Abrir link de afiliado (CSSBuy)"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>

                          {/* Link Xianyu */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(product.original_link, '_blank');
                            }}
                            className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                            title="Abrir link original (Xianyu)"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                            </svg>
                          </button>

                          {/* Editar Produto */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProduct(product.id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-600/10 rounded-lg transition-colors"
                            title="Editar produto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Toggle Esgotado/Disponível */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSoldOut(product.id, product.is_sold_out);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              product.is_sold_out
                                ? 'text-green-600 hover:bg-green-600/10'
                                : 'text-rose-600 hover:bg-rose-600/10'
                            }`}
                            title={product.is_sold_out ? 'Retornar ao estoque' : 'Marcar como esgotado'}
                          >
                            {product.is_sold_out ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </button>

                          {/* Limpar Reports */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearReports(product.id);
                            }}
                            className="p-2 text-sky-600 hover:bg-sky-600/10 rounded-lg transition-colors"
                            title="Limpar reports"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        ))}

        {/* Tabela de Vendedores */}
        {activeTab === 'sellers' && (sellers.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Nenhum vendedor reportado</h3>
            <p className="text-sm text-text-muted">Não há vendedores com reports no momento</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-elevated border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Link OFF
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Vendedor
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Outros
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sellers.map((seller) => (
                    <tr
                      key={seller.id}
                      className="hover:bg-surface-elevated transition-colors cursor-pointer"
                      onClick={() => handleSellerClick(seller)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {seller.image_url ? (
                            <img
                              src={seller.image_url}
                              alt={seller.name}
                              className="flex-shrink-0 w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center">
                              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          )}
                          <div className="max-w-[200px]">
                            <p className="text-sm font-medium text-text-primary truncate">
                              {seller.name}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              seller.status === 'gold'
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {seller.status === 'gold' ? 'Verificado' : 'Blacklist'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          seller.broken_link_reports > 0
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {seller.broken_link_reports}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          seller.seller_not_responding_reports > 0
                            ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {seller.seller_not_responding_reports}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                          seller.other_reports > 0
                            ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20'
                            : 'bg-surface-elevated text-text-muted'
                        }`}>
                          {seller.other_reports}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {seller.needs_validation ? (
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
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {/* Link Xianyu */}
                          {seller.profile_link && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(seller.profile_link!, '_blank');
                              }}
                              className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                              title="Abrir perfil (Xianyu)"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                              </svg>
                            </button>
                          )}

                          {/* Editar Vendedor */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSeller(seller.id);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-600/10 rounded-lg transition-colors"
                            title="Editar vendedor"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Limpar Reports */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClearSellerReports(seller.id);
                            }}
                            className="p-2 text-sky-600 hover:bg-sky-600/10 rounded-lg transition-colors"
                            title="Limpar reports"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
        ))}

        {/* Tabela de Sugestões */}
        {activeTab === 'suggestions' && (suggestions.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-semibold text-text-primary mb-2">Nenhuma sugestão recebida</h3>
            <p className="text-sm text-text-muted">As sugestões dos usuários aparecerão aqui</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-elevated border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Sugestão
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Trigger
                    </th>
                    <th className="text-left px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Página
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Data
                    </th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {suggestions.map((suggestion) => (
                    <tr
                      key={suggestion.id}
                      className={`hover:bg-surface-elevated transition-colors cursor-pointer ${
                        !suggestion.is_read ? 'bg-[#00ff9d]/5' : ''
                      }`}
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          {!suggestion.is_read && (
                            <span className="w-2 h-2 bg-[#00ff9d] rounded-full mt-2 flex-shrink-0" />
                          )}
                          <div className="max-w-[300px]">
                            <p className={`text-sm text-text-primary line-clamp-2 ${!suggestion.is_read ? 'font-medium' : ''}`}>
                              {suggestion.text}
                            </p>
                            {suggestion.search_query && (
                              <p className="text-xs text-orange-500 mt-1">
                                Buscou: &quot;{suggestion.search_query}&quot;
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTriggerTypeColor(suggestion.trigger_type)}`}>
                          {getTriggerTypeLabel(suggestion.trigger_type)}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <p className="text-xs text-text-muted max-w-[150px] truncate" title={suggestion.page_url}>
                          {suggestion.page_url.replace(/^https?:\/\/[^/]+/, '')}
                        </p>
                      </td>
                      <td className="px-3 py-4 text-center">
                        {suggestion.user_id ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
                            Autenticado
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-zinc-500/10 text-zinc-400">
                            Anônimo
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-4 text-center">
                        <p className="text-xs text-text-muted">
                          {new Date(suggestion.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {/* Marcar como lido/não lido */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSuggestionRead(suggestion.id, suggestion.is_read);
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              suggestion.is_read
                                ? 'text-zinc-500 hover:bg-zinc-500/10'
                                : 'text-[#00ff9d] hover:bg-[#00ff9d]/10'
                            }`}
                            title={suggestion.is_read ? 'Marcar como não lido' : 'Marcar como lido'}
                          >
                            {suggestion.is_read ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>

                          {/* Excluir */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSuggestion(suggestion.id);
                            }}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir sugestão"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        ))}
      </div>

      {/* Modal de Detalhes dos Reports de Produtos */}
      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-6 border-b border-border">
              <img
                src={selectedProduct.image_main}
                alt={selectedProduct.title}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h2 className="text-lg font-bold text-text-primary mb-1">
                  {selectedProduct.title}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    {selectedProduct.broken_link_reports} Link OFF
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    {selectedProduct.out_of_stock_reports} S/Estoque
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {selectedProduct.seller_not_responding_reports} Vendedor
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    {selectedProduct.wrong_price_reports} Preço
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
                    {selectedProduct.other_reports} Outros
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-elevated hover:bg-surface-overlay transition-colors"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body - Lista de Reports com scroll */}
            <div className="flex-1 overflow-y-auto p-6 max-h-[50vh]">
              {loadingReports ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : productReports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-muted">Nenhum report detalhado encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {productReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-surface-elevated border border-border rounded-xl p-4 hover:bg-surface-overlay transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-sm font-semibold text-text-primary">
                          {getReportTypeLabel(report.report_type)}
                        </span>
                        <span className="text-xs text-text-muted whitespace-nowrap">
                          {new Date(report.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {report.description && (
                        <p className="text-sm text-text-secondary bg-background rounded-lg p-3 border border-border break-words">
                          {report.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-muted">IP:</span>
                        <code className="text-xs bg-background px-2 py-0.5 rounded border border-border text-text-muted">
                          {report.user_ip}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Ações */}
            <div className="flex items-center gap-3 p-6 border-t border-border">
              <button
                onClick={() => window.open(selectedProduct.affiliate_link, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Afiliado
              </button>
              <button
                onClick={() => window.open(selectedProduct.original_link, '_blank')}
                className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                Xianyu
              </button>
              <button
                onClick={() => handleClearReports(selectedProduct.id)}
                className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-sky-600/10 text-sky-600 hover:bg-sky-600/20 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Limpar Reports
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes dos Reports de Vendedores */}
      {selectedSeller && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSeller(null)}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-6 border-b border-border">
              {selectedSeller.image_url ? (
                <img
                  src={selectedSeller.image_url}
                  alt={selectedSeller.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-surface-elevated flex items-center justify-center">
                  <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h2 className="text-lg font-bold text-text-primary mb-1">
                  {selectedSeller.name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    selectedSeller.status === 'gold'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}>
                    {selectedSeller.status === 'gold' ? 'Verificado' : 'Blacklist'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                    {selectedSeller.broken_link_reports} Link OFF
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    {selectedSeller.seller_not_responding_reports} Vendedor
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20">
                    {selectedSeller.other_reports} Outros
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSeller(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-elevated hover:bg-surface-overlay transition-colors"
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body - Lista de Reports com scroll */}
            <div className="flex-1 overflow-y-auto p-6 max-h-[50vh]">
              {loadingReports ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : sellerReports.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-muted">Nenhum report detalhado encontrado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sellerReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-surface-elevated border border-border rounded-xl p-4 hover:bg-surface-overlay transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-sm font-semibold text-text-primary">
                          {getReportTypeLabel(report.report_type)}
                        </span>
                        <span className="text-xs text-text-muted whitespace-nowrap">
                          {new Date(report.created_at).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {report.description && (
                        <p className="text-sm text-text-secondary bg-background rounded-lg p-3 border border-border break-words">
                          {report.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-text-muted">IP:</span>
                        <code className="text-xs bg-background px-2 py-0.5 rounded border border-border text-text-muted">
                          {report.user_ip}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer - Ações */}
            <div className="flex items-center gap-3 p-6 border-t border-border">
              {selectedSeller.profile_link && (
                <button
                  onClick={() => window.open(selectedSeller.profile_link!, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  Perfil Xianyu
                </button>
              )}
              <button
                onClick={() => handleClearSellerReports(selectedSeller.id)}
                className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-sky-600/10 text-sky-600 hover:bg-sky-600/20 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Limpar Reports
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Sugestão */}
      {selectedSuggestion && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedSuggestion(null)}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-6 border-b border-border">
              <div className="w-12 h-12 rounded-xl bg-[#00ff9d]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#00ff9d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-bold text-text-primary">Sugestão</h2>
                  {!selectedSuggestion.is_read && (
                    <span className="px-2 py-0.5 bg-[#00ff9d]/10 text-[#00ff9d] text-xs font-medium rounded-full">
                      Não lida
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getTriggerTypeColor(selectedSuggestion.trigger_type)}`}>
                    {getTriggerTypeLabel(selectedSuggestion.trigger_type)}
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(selectedSuggestion.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSuggestion(null)}
                className="p-2 text-text-muted hover:text-text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Texto da sugestão */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                  Texto da Sugestão
                </h4>
                <div className="bg-background rounded-xl p-4 border border-border">
                  <p className="text-text-primary whitespace-pre-wrap">
                    {selectedSuggestion.text}
                  </p>
                </div>
              </div>

              {/* Query de busca (se houver) */}
              {selectedSuggestion.search_query && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
                    Termo Buscado
                  </h4>
                  <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                    <p className="text-orange-500 font-medium">
                      &quot;{selectedSuggestion.search_query}&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* Detalhes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Página
                  </h4>
                  <a
                    href={selectedSuggestion.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {selectedSuggestion.page_url}
                  </a>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">
                    Usuário
                  </h4>
                  <p className="text-sm text-text-primary">
                    {selectedSuggestion.user_id ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-blue-500 rounded-full" />
                        Autenticado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-zinc-500 rounded-full" />
                        Anônimo
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer - Ações */}
            <div className="flex items-center gap-3 p-6 border-t border-border">
              <button
                onClick={() => handleToggleSuggestionRead(selectedSuggestion.id, selectedSuggestion.is_read)}
                className={`flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl transition-colors font-medium ${
                  selectedSuggestion.is_read
                    ? 'bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500/20'
                    : 'bg-[#00ff9d]/10 text-[#00ff9d] hover:bg-[#00ff9d]/20'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedSuggestion.is_read ? 'Marcar não lido' : 'Marcar lido'}
              </button>
              <button
                onClick={() => handleDeleteSuggestion(selectedSuggestion.id)}
                className="flex-1 flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modais de Edição */}
      {editingProductId && (() => {
        console.log('[REPORTED PRODUCTS] Renderizando ProductFormModal para produto:', editingProductId);
        console.log('[REPORTED PRODUCTS] Categories prop:', productCategories);
        return (
          <ProductFormModal
            isOpen={true}
            onClose={() => {
              console.log('[REPORTED PRODUCTS] ProductFormModal fechado');
              setEditingProductId(null);
              fetchReportedData();
            }}
            productId={editingProductId}
            categories={productCategories}
            onSuccess={() => {
              console.log('[REPORTED PRODUCTS] ProductFormModal sucesso');
              setEditingProductId(null);
              fetchReportedData();
            }}
          />
        );
      })()}

      {editingSellerId && (() => {
        console.log('[REPORTED PRODUCTS] Renderizando SellerFormModal para vendedor:', editingSellerId);
        console.log('[REPORTED PRODUCTS] Categories prop:', sellerCategories);
        return (
          <SellerFormModal
            isOpen={true}
            onClose={() => {
              console.log('[REPORTED PRODUCTS] SellerFormModal fechado');
              setEditingSellerId(null);
              fetchReportedData();
            }}
            sellerId={editingSellerId}
            categories={sellerCategories}
            onSuccess={() => {
              console.log('[REPORTED PRODUCTS] SellerFormModal sucesso');
              setEditingSellerId(null);
              fetchReportedData();
            }}
          />
        );
      })()}
    </div>
  );
}
