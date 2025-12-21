'use client';

import { useEffect, useRef, useState } from 'react';
import ProductForm from './ProductForm';
import { getCategories, getProductById } from '@/app/admin/products/actions';
import type { ProductFormData } from '@/app/admin/products/actions';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  onSuccess?: () => void;
}

export function ProductFormModal({ isOpen, onClose, productId, onSuccess }: ProductFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [product, setProduct] = useState<ProductFormData | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, productId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [categoriesData, productData] = await Promise.all([
        getCategories(),
        productId ? getProductById(productId) : Promise.resolve(null),
      ]);

      setCategories(categoriesData);
      setProduct(productData || undefined);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4 border border-border"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {productId ? 'Editar Produto' : 'Adicionar Produto'}
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              {productId ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-surface-elevated hover:bg-border transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ProductForm
              product={product}
              categories={categories}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
