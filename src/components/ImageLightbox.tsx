'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ImageLightboxProps {
  src: string;
  alt: string;
  thumbnailClassName?: string;
}

export default function ImageLightbox({
  src,
  alt,
  thumbnailClassName = "w-full h-32 object-cover rounded-lg"
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 200);
  }, []);

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

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  const handleOpen = () => {
    setIsClosing(false);
    setIsOpen(true);
  };

  return (
    <>
      {/* Thumbnail clicável */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onClick={handleOpen}
        className={`${thumbnailClassName} cursor-pointer hover:opacity-80 transition-opacity`}
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
