'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import ProductForm from '@/components/ProductForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { deleteProduct, toggleSoldOut } from './actions';
import type { Product, Category } from '@/types';

interface ProductsClientProps {
  products: Product[];
  categories: Category[];
}

export default function ProductsClient({
  products: initialProducts,
  categories,
}: ProductsClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null,
  });

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  // Prevenir scroll quando modal está aberto
  useEffect(() => {
    if (isModalOpen) {
      // Calcular largura da scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Aplicar padding para compensar
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Remover ao fechar
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isModalOpen]);

  const handleNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteConfirm({ isOpen: true, productId: id });
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm.productId) return;

    const result = await deleteProduct(deleteConfirm.productId);
    if (result.success) {
      setProducts(products.filter((p) => p.id !== deleteConfirm.productId));
      toast.success('Produto deletado com sucesso!');
    } else {
      toast.error('Erro ao deletar produto');
    }
    setDeleteConfirm({ isOpen: false, productId: null });
  }, [deleteConfirm.productId, products]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirm({ isOpen: false, productId: null });
  }, []);

  const handleToggleSoldOut = async (id: string, currentStatus: boolean) => {
    const result = await toggleSoldOut(id, currentStatus);
    if (result.success) {
      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, is_sold_out: !currentStatus } : p
        )
      );
      toast.success(currentStatus ? 'Produto marcado como disponível' : 'Produto marcado como esgotado');
    } else {
      toast.error('Erro ao atualizar status');
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    router.refresh();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      {/* Botão Adicionar */}
      <button
        onClick={handleNew}
        className="mb-6 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors"
      >
        + Adicionar Novo Produto
      </button>

      {/* Modal de Formulário */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/70 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
              setEditingProduct(null);
            }
          }}
        >
          <div
            className="bg-surface border border-zinc-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="sticky top-0 bg-surface border-b border-zinc-800 px-6 md:px-8 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-textMain">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-textSecondary hover:text-textMain transition-colors p-2 rounded-lg hover:bg-zinc-800"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Formulário */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] px-6 md:px-8 py-6 modal-scroll">
              <ProductForm
                product={editingProduct || undefined}
                categories={categories}
                onSuccess={handleFormSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      <div className="grid gap-6">
        {products.length === 0 ? (
          <div className="text-center py-12 text-textSecondary">
            Nenhum produto cadastrado ainda.
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-surface rounded-xl p-6 border border-textSecondary/20 hover:border-primary/50 transition-colors"
            >
              <div className="flex gap-6">
                {/* Imagens */}
                <div className="flex gap-2">
                  {product.image_main && (
                    <img
                      src={product.image_main}
                      alt={product.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  {product.image_hover && (
                    <img
                      src={product.image_hover}
                      alt={product.title}
                      className="w-24 h-24 object-cover rounded-lg opacity-50"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-textMain mb-1">
                        {product.title}
                      </h3>
                      <p className="text-primary font-bold">
                        {product.price_cny}
                      </p>
                    </div>
                    {product.is_sold_out && (
                      <span className="px-3 py-1 bg-danger text-white text-sm rounded-full">
                        Esgotado
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-sm text-textSecondary mb-4">
                    <p>
                      <span className="font-semibold">Afiliado:</span>{' '}
                      {product.affiliate_link ? (
                        <a
                          href={product.affiliate_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {product.affiliate_link.substring(0, 50)}...
                        </a>
                      ) : (
                        <span className="text-textSecondary italic">Não cadastrado</span>
                      )}
                    </p>
                    <p>
                      <span className="font-semibold text-danger">
                        PRIVADO - Original:
                      </span>{' '}
                      {product.original_link ? (
                        <a
                          href={product.original_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-danger hover:underline"
                        >
                          {product.original_link.substring(0, 50)}...
                        </a>
                      ) : (
                        <span className="text-textSecondary italic">Não cadastrado</span>
                      )}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() =>
                        handleToggleSoldOut(product.id, product.is_sold_out)
                      }
                      className="px-4 py-2 bg-surface border border-textSecondary/20 text-textMain rounded-lg hover:bg-surface/80 transition-colors text-sm"
                    >
                      {product.is_sold_out
                        ? 'Marcar Disponível'
                        : 'Marcar Esgotado'}
                    </button>
                    <button
                      onClick={() =>
                        window.open(product.original_link, '_blank')
                      }
                      className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors text-sm"
                    >
                      Verificar Xianyu
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(product.id)}
                      className="px-4 py-2 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-colors text-sm ml-auto"
                    >
                      Deletar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Deletar Produto"
        message="Tem certeza que deseja deletar este produto? Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
