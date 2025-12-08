'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageLightboxProps {
  src: string;
  alt: string;
}

export default function ImageLightbox({ src, alt }: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garantir que está no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevenir scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Fechar com ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const handleOpen = () => {
    setIsClosing(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsClosing(true);
    // Aguardar animação de saída antes de remover do DOM
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200); // Mesma duração da animação
  };

  return (
    <>
      {/* Thumbnail clicável */}
      <img
        src={src}
        alt={alt}
        onClick={handleOpen}
        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
      />

      {/* Modal via Portal com animações */}
      {mounted && isOpen && createPortal(
        <div
          className={`
            fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-xl bg-black/80
            ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}
          `}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={handleClose}
        >
          {/* Botão Fechar */}
          <button
            onClick={handleClose}
            className={`
              absolute top-4 right-4 z-[100000] text-white hover:text-white/80 transition-all
              ${isClosing ? 'opacity-0' : 'opacity-100'}
            `}
            aria-label="Fechar"
            style={{
              fontSize: '48px',
              lineHeight: '48px',
              width: '48px',
              height: '48px',
              transition: 'opacity 200ms'
            }}
          >
            ×
          </button>

          {/* Container da Imagem com Zoom */}
          <div
            className={`
              relative flex items-center justify-center p-8
              ${isClosing
                ? 'animate-zoom-out-95'
                : 'animate-zoom-in-95'
              }
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className="max-w-[85vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
              style={{ display: 'block' }}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
