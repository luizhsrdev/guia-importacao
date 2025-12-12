'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createPixPayment, checkPaymentStatus } from './actions';
import type { CreatePixResult } from '@/types';

type PaymentState = 'idle' | 'loading' | 'showing_pix' | 'checking' | 'success' | 'error';

const POLLING_INTERVAL_MS = 5000;
const MAX_POLLING_ATTEMPTS = 60;

function PixIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.897 6.103a3.003 3.003 0 00-4.243 0l-1.293 1.293a.75.75 0 01-1.061 0L9.697 5.793a.75.75 0 00-1.061 0L6.103 8.326a3.003 3.003 0 000 4.243l2.533 2.533a.75.75 0 010 1.061l-2.533 2.534a3.003 3.003 0 000 4.242l.707.707a3.003 3.003 0 004.243 0l1.293-1.293a.75.75 0 011.061 0l1.603 1.603a.75.75 0 001.061 0l2.533-2.533a3.003 3.003 0 000-4.243l-2.533-2.533a.75.75 0 010-1.061l2.533-2.534a3.003 3.003 0 000-4.242l-.707-.707z" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin w-5 h-5"
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
  );
}

export function PagamentoClient() {
  const router = useRouter();
  const [state, setState] = useState<PaymentState>('idle');
  const [pixData, setPixData] = useState<CreatePixResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);

  const handleGeneratePix = useCallback(async () => {
    setState('loading');
    setErrorMessage('');

    const result = await createPixPayment();

    if (!result.success) {
      setState('error');
      setErrorMessage(result.error ?? 'Erro ao gerar PIX');
      return;
    }

    setPixData(result);
    setState('showing_pix');
    setPollingCount(0);
  }, []);

  const handleCopyCode = useCallback(async () => {
    if (!pixData?.copyPaste) return;

    try {
      await navigator.clipboard.writeText(pixData.copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Erro ao copiar');
    }
  }, [pixData?.copyPaste]);

  useEffect(() => {
    if (state !== 'showing_pix' || !pixData?.paymentId) return;

    if (pollingCount >= MAX_POLLING_ATTEMPTS) {
      setState('error');
      setErrorMessage('Tempo de espera esgotado. Tente novamente.');
      return;
    }

    const interval = setInterval(async () => {
      const result = await checkPaymentStatus(pixData.paymentId!);

      if (result.isPaid) {
        setState('success');
        clearInterval(interval);
        setTimeout(() => {
          router.push('/vendedores');
          router.refresh();
        }, 2000);
      } else {
        setPollingCount((prev) => prev + 1);
      }
    }, POLLING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [state, pixData?.paymentId, pollingCount, router]);

  if (state === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-text-primary mb-2">
          Pagamento Confirmado!
        </h3>
        <p className="text-text-secondary">
          Redirecionando para os vendedores...
        </p>
      </div>
    );
  }

  if (state === 'showing_pix' && pixData) {
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg flex items-center justify-center">
          {pixData.qrCodeBase64 ? (
            <img
              src={`data:image/png;base64,${pixData.qrCodeBase64}`}
              alt="QR Code PIX"
              className="w-48 h-48"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-text-tertiary">
              QR Code indisponível
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-text-secondary mb-2">Código Copia e Cola:</p>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={pixData.copyPaste ?? ''}
              className="input-field pr-20 font-mono text-sm truncate"
            />
            <button
              onClick={handleCopyCode}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-background text-sm font-bold rounded-md hover:bg-primary/90 transition-colors"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-text-secondary text-sm">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Aguardando pagamento...</span>
        </div>

        {pixData.expirationDate && (
          <p className="text-center text-xs text-text-tertiary">
            Expira em 30 minutos
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleGeneratePix}
        disabled={state === 'loading'}
        className="w-full btn-primary px-6 py-4 rounded-md font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {state === 'loading' ? (
          <>
            <LoadingSpinner />
            <span>Gerando PIX...</span>
          </>
        ) : (
          <>
            <PixIcon />
            <span>Pagar com PIX</span>
          </>
        )}
      </button>

      {state === 'error' && errorMessage && (
        <div className="bg-danger/10 border border-danger/20 rounded-md p-4">
          <p className="text-danger text-sm text-center">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
