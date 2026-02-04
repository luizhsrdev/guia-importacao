'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSuggestion } from './SuggestionProvider';
import toast from 'react-hot-toast';

export function SuggestionModal() {
  const { isModalOpen, closeModal, triggerType, searchQuery } = useSuggestion();
  const [text, setText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpenTime, setModalOpenTime] = useState<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isModalOpen) {
      setModalOpenTime(Date.now());
      setText('');
      setHoneypot('');
      // Focus textarea after animation
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  const handleClose = () => {
    // Mark dismissal in localStorage for cooldown
    localStorage.setItem('suggestion_nudge_dismissed_at', Date.now().toString());
    closeModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (text.trim().length < 10) {
      toast.error('Sugestão deve ter pelo menos 10 caracteres.');
      return;
    }

    if (text.trim().length > 2000) {
      toast.error('Sugestão deve ter no máximo 2000 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          page_url: window.location.href,
          trigger_type: triggerType,
          search_query: searchQuery,
          honeypot,
          modal_open_time: modalOpenTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Erro ao enviar sugestão.');
        return;
      }

      // Mark submission in localStorage for cooldown
      localStorage.setItem('suggestion_nudge_submitted_at', Date.now().toString());

      toast.success('Sugestão enviada com sucesso! Obrigado pelo feedback.');
      closeModal();
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      toast.error('Erro ao enviar sugestão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isModalOpen) {
    return null;
  }

  const getPlaceholderText = () => {
    if (triggerType === 'nudge_zero_results' && searchQuery) {
      return `Não encontrou "${searchQuery}"? Conte-nos o que você procurava...`;
    }
    return 'Escreva sua sugestão, feedback ou o que você gostaria de ver na plataforma...';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl
                   animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#00ff9d]/20 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#00ff9d]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Sentiu falta de algo?</h2>
          </div>
          <p className="text-zinc-400 text-sm">
            Sua opinião nos ajuda a melhorar a plataforma. Conte-nos o que você gostaria de ver!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={getPlaceholderText()}
            className="w-full h-32 bg-zinc-800 border border-zinc-600 rounded-lg p-3 text-white
                       placeholder-zinc-500 resize-none focus:outline-none focus:border-[#00ff9d]
                       transition-colors"
            maxLength={2000}
          />

          {/* Character count */}
          <div className="flex justify-between items-center mt-2 mb-4">
            <span className="text-xs text-zinc-500">Mínimo 10 caracteres</span>
            <span className={`text-xs ${text.length > 1900 ? 'text-yellow-500' : 'text-zinc-500'}`}>
              {text.length}/2000
            </span>
          </div>

          {/* Honeypot field - hidden from users, visible to bots */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            style={{
              position: 'absolute',
              left: '-9999px',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
            aria-hidden="true"
          />

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300
                         rounded-lg font-medium transition-colors"
            >
              Agora não
            </button>
            <button
              type="submit"
              disabled={isSubmitting || text.trim().length < 10}
              className="flex-1 px-4 py-3 bg-[#00ff9d] hover:bg-[#00cc7d] text-black
                         rounded-lg font-medium transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Enviando...
                </>
              ) : (
                'Enviar sugestão'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
