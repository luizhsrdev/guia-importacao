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
      handleSubmitReport(type, '');
    }
  };

  const handleSubmitReport = async (type: ReportType, description: string) => {
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [itemIdField]: itemId,
          issue_type: type,
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

  return (
    <>
      {/* Menu de Três Pontos */}
      <div className={`absolute ${className}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOptionsMenu(!showOptionsMenu);
            setShowReportMenu(false);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-elevated hover:bg-surface-overlay border border-border transition-colors"
        >
          <svg className="w-4 h-4 text-text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {/* Dropdown Options */}
        {showOptionsMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-surface-elevated border border-border rounded-xl shadow-xl overflow-hidden animate-slideInUp z-20">
            <button
              onClick={handleToggleFavorite}
              className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-overlay transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              {isFavorite ? 'Remover favorito' : 'Favoritar'}
            </button>
            <button
              onClick={handleOpenReportMenu}
              className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-overlay transition-colors flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Reportar
            </button>
          </div>
        )}

        {/* Dropdown Report Types */}
        {showReportMenu && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-surface-elevated border border-border rounded-xl shadow-xl overflow-hidden animate-slideInUp z-20">
            <div className="px-4 py-2 border-b border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Qual o Problema?</p>
            </div>
            {reportOptions.map((option) => (
              <button
                key={option.type}
                onClick={(e) => handleSelectReportType(option.type, e)}
                className="w-full px-4 py-3 text-left text-sm text-text-primary hover:bg-surface-overlay transition-colors"
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowReportModal(false);
            setReportDescription('');
          }}
        >
          <div
            className="bg-surface rounded-2xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Descreva o problema
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Por favor, forneça detalhes sobre o problema encontrado.
            </p>
            <textarea
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              placeholder="Ex: O vendedor não responde mensagens há 3 dias..."
              className="w-full h-32 px-4 py-3 bg-surface-elevated border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportDescription('');
                }}
                className="flex-1 h-11 px-4 rounded-xl bg-surface-elevated text-text-primary font-medium hover:bg-surface-overlay transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmReport}
                className="flex-1 h-11 px-4 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
              >
                Enviar Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
