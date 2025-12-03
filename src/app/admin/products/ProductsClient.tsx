'use client';

import { useState } from 'react';
import ProductForm from '@/components/ProductForm';
import { deleteProduct, toggleSoldOut } from './actions';
import type { ProductFormData } from './actions';

interface Product extends ProductFormData {
  id: string;
  created_at?: string;
}

interface ProductsClientProps {
  products: Product[];
  categories: Array<{ id: string; name: string }>;
}

export default function ProductsClient({
  products: initialProducts,
  categories,
}: ProductsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState(initialProducts);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    const result = await deleteProduct(id);
    if (result.success) {
      setProducts(products.filter((p) => p.id !== id));
      alert('Produto deletado com sucesso!');
    } else {
      alert('Erro ao deletar produto');
    }
  };

  const handleToggleSoldOut = async (id: string, currentStatus: boolean) => {
    const result = await toggleSoldOut(id, currentStatus);
    if (result.success) {
      setProducts(
        products.map((p) =>
          p.id === id ? { ...p, is_sold_out: !currentStatus } : p
        )
      );
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    window.location.reload(); // Recarregar para pegar novos dados
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div>
      {/* Botão Adicionar */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors"
        >
          + Adicionar Novo Produto
        </button>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="mb-8 p-6 bg-surface rounded-xl border border-primary/20">
          <h3 className="text-xl font-bold text-primary mb-4">
            {editingProduct ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <ProductForm
            product={editingProduct || undefined}
            categories={categories}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
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
                      <a
                        href={product.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {product.affiliate_link.substring(0, 50)}...
                      </a>
                    </p>
                    <p>
                      <span className="font-semibold text-danger">
                        🔒 Original:
                      </span>{' '}
                      <a
                        href={product.original_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-danger hover:underline"
                      >
                        {product.original_link.substring(0, 50)}...
                      </a>
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() =>
                        handleToggleSoldOut(product.id, product.is_sold_out)
                      }
                      className="px-4 py-2 bg-surface border border-textSecondary/20 text-textMain rounded-lg hover:bg-surface/80 transition-colors text-sm"
                    >
                      {product.is_sold_out
                        ? '✅ Marcar Disponível'
                        : '❌ Marcar Esgotado'}
                    </button>
                    <button
                      onClick={() =>
                        window.open(product.original_link, '_blank')
                      }
                      className="px-4 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors text-sm"
                    >
                      🔗 Verificar Xianyu
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-4 py-2 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-colors text-sm ml-auto"
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
