'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import ProductForm from './ProductForm';
import { getProductById } from '@/lib/actions/products';
import type { ProductFormData } from '@/lib/actions/products';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  categories: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

export function ProductFormModal({ isOpen, onClose, productId, categories, onSuccess }: ProductFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [product, setProduct] = useState<ProductFormData | undefined>();
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Lock body scroll when modal is open (prevents layout shift)
  useBodyScrollLock(isOpen);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 150);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // Reset state imediatamente quando o modal abre
      setProduct(undefined);
      setLoading(true);
      loadData();
    } else {
      // Limpar estado quando o modal fecha para evitar dados residuais
      setProduct(undefined);
    }
  }, [isOpen, productId]);

  const loadData = async () => {
    if (!productId) {
      // Produto novo, não precisa carregar dados
      setLoading(false);
      return;
    }

    try {
      const productData = await getProductById(productId);
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
        handleClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  if (!isOpen && !isClosing) return null;

  const handleSuccess = () => {
    onSuccess?.();
    handleClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
    }`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`relative bg-surface rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] m-4 border border-border flex flex-col overflow-hidden ${
          isClosing ? 'animate-scaleOut' : 'animate-scaleIn'
        }`}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-surface border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {productId ? 'Editar Produto' : 'Adicionar Produto'}
            </h2>
            <p className="text-sm text-text-muted mt-0.5">
              {productId ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-lg bg-surface-elevated hover:bg-border transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 modal-scroll">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <ProductForm
              key={productId || 'new'}
              product={product}
              categories={categories}
              onSuccess={handleSuccess}
              onCancel={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
