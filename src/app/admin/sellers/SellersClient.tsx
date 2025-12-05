'use client';

import { useState } from 'react';
import SellerForm from '@/components/SellerForm';
import ImageLightbox from '@/components/ImageLightbox';
import { deleteSeller } from './actions';
import type { SellerFormData } from './actions';

interface Seller extends SellerFormData {
  id: string;
  created_at?: string;
  seller_categories?: { name: string } | null;
}

interface SellersClientProps {
  sellers: Seller[];
  categories: Array<{ id: string; name: string }>;
}

export default function SellersClient({
  sellers: initialSellers,
  categories,
}: SellersClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [sellers, setSellers] = useState(initialSellers);
  const [filter, setFilter] = useState<'all' | 'gold' | 'blacklist'>('all');

  const handleEdit = (seller: Seller) => {
    setEditingSeller(seller);
    setShowForm(true);
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
    setShowForm(false);
    setEditingSeller(null);
    window.location.reload();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSeller(null);
  };

  const filteredSellers = sellers.filter((seller) => {
    if (filter === 'all') return true;
    return seller.status === filter;
  });

  return (
    <div>
      {/* Botão Adicionar */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 px-6 py-3 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors"
        >
          + Adicionar Novo Vendedor
        </button>
      )}

      {/* Formulário */}
      {showForm && (
        <div className="mb-8 p-6 bg-surface rounded-xl border border-primary/20">
          <h3 className="text-xl font-bold text-primary mb-4">
            {editingSeller ? 'Editar Vendedor' : 'Novo Vendedor'}
          </h3>
          <SellerForm
            seller={editingSeller || undefined}
            categories={categories}
            onSuccess={handleFormSuccess}
            onCancel={handleCancel}
          />
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
                  className={`px-3 py-1 rounded-full text-sm font-bold ${
                    seller.status === 'gold'
                      ? 'bg-primary/20 text-primary'
                      : 'bg-danger/20 text-danger'
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
                    className="text-primary hover:underline"
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

                  {/* Rating */}
                  {seller.rating && (
                    <p className="text-textMain">
                      <span className="font-semibold">Rating:</span>{' '}
                      {seller.rating}
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
                    <ImageLightbox
                      src={seller.evidence_images}
                      alt={`${seller.name} - Evidências`}
                    />
                  </div>
                )}

              {/* Ações */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(seller)}
                  className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors text-sm"
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
