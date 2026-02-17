'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

type ReportType = 'broken_link' | 'out_of_stock' | 'seller_not_responding' | 'wrong_price' | 'other';

interface ReportOption {
  type: ReportType;
  label: string;
}

interface ReportAndFavoriteMenuProps {
  itemId: string;
  itemType: 'product' | 'seller';
  isFavorite: boolean;
  onToggleFavorite: () => Promise<void>;
  className?: string;
}

export default function ReportAndFavoriteMenu({
  itemId,
  itemType,
  isFavorite,
  onToggleFavorite,
  className = ''
}: ReportAndFavoriteMenuProps) {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<ReportType | ''>('');
  const [reportDescription, setReportDescription] = useState('');

  // Opções de report baseadas no tipo de item
  const reportOptions: ReportOption[] = itemType === 'product'
    ? [
        { type: 'broken_link', label: 'Link Quebrado/Não Funciona' },
        { type: 'out_of_stock', label: 'Item Esgotado' },
        { type: 'seller_not_responding', label: 'Vendedor não responde' },
        { type: 'wrong_price', label: 'Preço diferente' },
        { type: 'other', label: 'Outro motivo' }
      ]
    : [
        { type: 'broken_link', label: 'Link Quebrado/Não Funciona' },
        { type: 'seller_not_responding', label: 'Vendedor não responde' },
        { type: 'other', label: 'Outro motivo' }
      ];

  const apiEndpoint = itemType === 'product' ? '/api/products/report' : '/api/sellers/report';
  const itemIdField = itemType === 'product' ? 'product_id' : 'seller_id';

  const handleToggleFavorite = async () => {
    await onToggleFavorite();
    setShowOptionsMenu(false);
  };

  const handleOpenReportMenu = () => {
    setShowOptionsMenu(false);
    setShowReportMenu(true);
  };

  const handleSelectReportType = (type: ReportType, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReportType(type);
    setShowReportMenu(false);

    if (type === 'other') {
      setShowReportModal(true);
    } else {
      // Mostrar modal de confirmação para reports diretos
      setShowConfirmModal(true);
    }
  };

  const handleSubmitReport = async (type: ReportType, description: string) => {
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [itemIdField]: itemId,
          report_type: type,
          description: description || undefined
        })
      });

      if (res.ok) {
        toast.success('Report enviado com sucesso!');
        setShowReportModal(false);
        setReportDescription('');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao enviar report');
      }
    } catch (error) {
      console.error('Erro ao enviar report:', error);
      toast.error('Erro ao enviar report');
    }
  };

  const handleConfirmReport = () => {
    if (selectedReportType === 'other' && !reportDescription.trim()) {
      toast.error('Por favor, descreva o problema');
      return;
    }
    handleSubmitReport(selectedReportType as ReportType, reportDescription);
  };

  const handleConfirmDirectReport = () => {
    setShowConfirmModal(false);
    handleSubmitReport(selectedReportType as ReportType, '');
  };

  const getReportLabel = (type: ReportType | '') => {
    const labels: Record<string, string> = {
      broken_link: 'Link Quebrado/Não Funciona',
      out_of_stock: 'Item Esgotado',
      seller_not_responding: 'Vendedor não responde',
      wrong_price: 'Preço diferente',
      other: 'Outro motivo'
    };
    return labels[type] || '';
  };

  return (
    <>
      {/* Menu de Três Pontos */}
      <div className={className.includes('relative') ? className : `absolute ${className}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOptionsMenu(!showOptionsMenu);
            setShowReportMenu(false);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-elevated/90 backdrop-blur-sm border border-border hover:border-border-emphasis transition-all"
        >
          <svg className="w-4 h-4 text-text-muted" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {/* Dropdown Options */}
        {showOptionsMenu && (
          <div className="absolute top-full right-0 mt-2 w-44 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-dropdown z-20">
            <button
              onClick={handleToggleFavorite}
              className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 text-text-primary hover:bg-surface-elevated transition-colors"
            >
              {isFavorite ? (
                <>
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>Remover favorito</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Favoritar</span>
                </>
              )}
            </button>
            <button
              onClick={handleOpenReportMenu}
              className="w-full px-4 py-3 text-left text-sm flex items-center gap-3 text-text-primary hover:bg-surface-elevated transition-colors border-t border-border"
            >
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Reportar</span>
            </button>
          </div>
        )}

        {/* Dropdown Report Types */}
        {showReportMenu && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-dropdown z-20">
            <div className="px-4 py-2 bg-surface-elevated border-b border-border">
              <p className="text-xs font-medium text-text-primary">Qual o problema?</p>
            </div>
            {reportOptions.map((option) => (
              <button
                key={option.type}
                onClick={(e) => handleSelectReportType(option.type, e)}
                className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-elevated transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Confirmação para "Outro motivo" */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
          onClick={() => {
            setShowReportModal(false);
            setReportDescription('');
          }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div
            className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md m-4 border border-border animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Confirmar Report</h3>
                  <p className="text-sm text-text-muted">
                    Tem certeza que deseja reportar {itemType === 'product' ? 'este anúncio' : 'esse vendedor'}?
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Descreva o problema:
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Digite aqui o motivo do report..."
                  className="w-full h-24 px-3 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-primary transition-colors"
                  maxLength={500}
                />
                <p className="text-xs text-text-muted mt-1 text-right">
                  {reportDescription.length}/500
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportDescription('');
                  }}
                  className="flex-1 px-4 py-2.5 bg-surface-elevated border border-border rounded-lg text-sm font-medium text-text-primary hover:border-border-emphasis transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmReport}
                  disabled={!reportDescription.trim()}
                  className="flex-1 px-4 py-2.5 bg-red-500 rounded-lg text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação para Reports Diretos */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn"
          onClick={() => setShowConfirmModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <div
            className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md m-4 border border-border animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">Confirmar Report</h3>
                  <p className="text-sm text-text-muted">
                    Tem certeza que deseja reportar {itemType === 'product' ? 'este anúncio' : 'esse vendedor'}?
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2.5 bg-surface-elevated border border-border rounded-lg text-sm font-medium text-text-primary hover:border-border-emphasis transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDirectReport}
                  className="flex-1 px-4 py-2.5 bg-red-500 rounded-lg text-sm font-semibold text-white hover:bg-red-600 active:scale-[0.98] transition-all"
                >
                  Confirmar Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
