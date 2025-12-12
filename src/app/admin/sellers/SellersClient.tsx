'use client';

import { useState, useEffect } from 'react';
import SellerForm from '@/components/SellerForm';
import ImageLightbox from '@/components/ImageLightbox';
import { deleteSeller } from './actions';
import type { Seller, Category } from '@/types';

interface SellersClientProps {
  sellers: Seller[];
  categories: Category[];
}

export default function SellersClient({
  sellers: initialSellers,
  categories,
}: SellersClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [sellers, setSellers] = useState(initialSellers);
  const [filter, setFilter] = useState<'all' | 'gold' | 'blacklist'>('all');

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
    setEditingSeller(null);
    setIsModalOpen(true);
  };

  const handleEdit = (seller: Seller) => {
    setEditingSeller(seller);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este vendedor?')) return;

    const result = await deleteSeller(id);
    if (result.success) {
      setSellers(sellers.filter((s) => s.id !== id));
      alert('Vendedor deletado com sucesso!');
    } else {
      alert('Erro ao deletar vendedor');
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setEditingSeller(null);
    window.location.reload();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingSeller(null);
  };

  const filteredSellers = sellers.filter((seller) => {
    if (filter === 'all') return true;
    return seller.status === filter;
  });

  return (
    <div>
      {/* Botão Adicionar */}
      <button
        onClick={handleNew}
        className="mb-6 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors"
      >
        + Adicionar Novo Vendedor
      </button>

      {/* Modal de Formulário */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/70 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
              setEditingSeller(null);
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
                {editingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingSeller(null);
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
              <SellerForm
                seller={editingSeller || undefined}
                categories={categories}
                onSuccess={handleFormSuccess}
                onCancel={handleCancel}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-primary text-background'
              : 'bg-surface text-textSecondary hover:text-textMain'
          }`}
        >
          Todos ({sellers.length})
        </button>
        <button
          onClick={() => setFilter('gold')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'gold'
              ? 'bg-primary text-background'
              : 'bg-surface text-textSecondary hover:text-textMain'
          }`}
        >
          Gold ({sellers.filter((s) => s.status === 'gold').length})
        </button>
        <button
          onClick={() => setFilter('blacklist')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'blacklist'
              ? 'bg-danger text-white'
              : 'bg-surface text-textSecondary hover:text-textMain'
          }`}
        >
          Blacklist ({sellers.filter((s) => s.status === 'blacklist').length})
        </button>
      </div>

      {/* Lista de Vendedores */}
      <div className="grid gap-6">
        {filteredSellers.length === 0 ? (
          <div className="text-center py-12 text-textSecondary">
            Nenhum vendedor cadastrado ainda.
          </div>
        ) : (
          filteredSellers.map((seller) => (
            <div
              key={seller.id}
              className={`bg-surface rounded-xl p-6 border ${
                seller.status === 'gold'
                  ? 'border-primary/50'
                  : 'border-danger/50'
              } hover:shadow-lg transition-all`}
            >
              {/* Nome + Status Badge */}
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-textMain">
                  {seller.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${
                    seller.status === 'gold'
                      ? 'bg-primary/20 text-primary border-primary/30'
                      : 'bg-red-600/20 text-red-400 border-red-600/30'
                  }`}
                >
                  {seller.status === 'gold' ? 'Gold' : 'Blacklist'}
                </span>
              </div>

              {/* Categoria */}
              {seller.seller_categories && (
                <p className="text-textSecondary text-sm mb-4">
                  Categoria: {seller.seller_categories.name}
                </p>
              )}

              {/* Link do Perfil (AMBOS) */}
              {seller.profile_link && (
                <p className="text-textMain mb-3">
                  <span className="font-semibold">Perfil:</span>{' '}
                  <a
                    href={seller.profile_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`hover:underline ${
                      seller.status === 'blacklist' ? 'text-danger' : 'text-primary'
                    }`}
                  >
                    {seller.profile_link.substring(0, 50)}...
                  </a>
                </p>
              )}

              {/* Conteúdo específico do status */}
              {seller.status === 'gold' ? (
                <div className="space-y-3 mb-4">
                  {/* Descrição */}
                  {seller.notes && (
                    <div className="p-4 bg-background rounded-lg">
                      <p className="font-semibold text-primary mb-2">
                        Descrição:
                      </p>
                      <p className="text-textSecondary text-sm">
                        {seller.notes}
                      </p>
                    </div>
                  )}

                  {/* Link de Feedback */}
                  {seller.feedback_link && (
                    <p className="text-textMain">
                      <span className="font-semibold">Feedback:</span>{' '}
                      <a
                        href={seller.feedback_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {seller.feedback_link.substring(0, 50)}...
                      </a>
                    </p>
                  )}

                  {/* Link de Afiliado */}
                  {seller.affiliate_link && (
                    <p className="text-textMain">
                      <span className="font-semibold">Link Afiliado:</span>{' '}
                      <a
                        href={seller.affiliate_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {seller.affiliate_link.substring(0, 50)}...
                      </a>
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {/* Motivo da Blacklist */}
                  {seller.blacklist_reason && (
                    <div className="p-4 bg-danger/10 border border-danger/30 rounded-lg">
                      <p className="font-semibold text-danger mb-2">Motivo:</p>
                      <p className="text-textMain text-sm">
                        {seller.blacklist_reason}
                      </p>
                    </div>
                  )}

                  {/* Link de Prova */}
                  {seller.proof_link && (
                    <p className="text-textMain">
                      <span className="font-semibold">Link de Prova:</span>{' '}
                      <a
                        href={seller.proof_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-danger hover:underline"
                      >
                        {seller.proof_link.substring(0, 50)}...
                      </a>
                    </p>
                  )}
                </div>
              )}

              {/* IMAGENS (ÚLTIMO ELEMENTO) */}
              {seller.status === 'gold' && seller.image_url && (
                <div className="mb-4">
                  <ImageLightbox
                    src={seller.image_url}
                    alt={seller.name}
                  />
                </div>
              )}

              {seller.status === 'blacklist' &&
                seller.evidence_images &&
                seller.evidence_images.length > 0 && (
                  <div className="mb-4">
                    <p className="font-semibold text-danger mb-2">
                      Evidências ({seller.evidence_images.length}):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {seller.evidence_images.map((img, index) => (
                        <ImageLightbox
                          key={index}
                          src={img}
                          alt={`${seller.name} - Prova ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

              {/* Ações */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(seller)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    seller.status === 'blacklist'
                      ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20'
                      : 'bg-primary text-background hover:bg-primary/90 shadow-lg shadow-primary/20'
                  }`}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(seller.id)}
                  className="px-4 py-2 bg-danger/20 text-danger rounded-lg hover:bg-danger/30 transition-colors text-sm ml-auto"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
