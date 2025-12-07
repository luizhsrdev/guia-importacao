'use client';

import { useState, useEffect } from 'react';

interface ImageLightboxProps {
  src: string | string[];
  alt: string;
  className?: string;
}

export default function ImageLightbox({
  src,
  alt,
  className = '',
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = Array.isArray(src) ? src : [src];
  const hasMultiple = images.length > 1;

  // Fechar com ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      // Calcular largura da scrollbar
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const openLightbox = (index: number = 0) => {
    setCurrentIndex(index);
    setIsOpen(true);
  };

  return (
    <>
      {/* Preview / Thumbnails */}
      {hasMultiple ? (
        <div className={`grid grid-cols-3 gap-2 ${className}`}>
          {images.map((image, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
            >
              <img
                src={image}
                alt={`${alt} ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>
          ))}
        </div>
      ) : (
        <div className={className}>
          <img
            src={images[0]}
            alt={alt}
            onClick={() => openLightbox(0)}
            className="w-full max-w-[300px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
          />
        </div>
      )}

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          {/* Container da imagem */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagem */}
            <img
              src={images[currentIndex]}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />

            {/* Botão fechar */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Fechar"
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

            {/* Navegação (múltiplas imagens) */}
            {hasMultiple && (
              <>
                {/* Botão anterior */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Anterior"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Botão próximo */}
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
                  aria-label="Próximo"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Indicador de posição */}
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
