'use client';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface rounded-2xl shadow-2xl w-full max-w-md m-4 border-2 border-red-500/30 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header com ícone de alerta */}
        <div className="bg-gradient-to-br from-red-950/50 to-red-900/30 px-6 py-5 border-b-2 border-red-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-400">
              {title}
            </h3>
          </div>
        </div>

        {/* Mensagem */}
        <div className="px-6 py-5">
          <p className="text-text-secondary text-base leading-relaxed">
            {message}
          </p>
          <p className="text-text-muted text-sm mt-3">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        {/* Botões */}
        <div className="bg-surface-elevated px-6 py-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-surface border-2 border-border text-text-primary rounded-lg hover:bg-surface-overlay transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-lg font-bold hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-red-600/30 hover:shadow-red-600/50"
          >
            {isDeleting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Excluindo...
              </span>
            ) : (
              'Sim, excluir'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
