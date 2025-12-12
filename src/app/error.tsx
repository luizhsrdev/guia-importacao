'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Erro na aplicação:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-surface border border-zinc-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-danger/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-danger"
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

        <h1 className="text-2xl font-bold text-textMain mb-2">
          Algo deu errado
        </h1>

        <p className="text-textSecondary mb-6">
          Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-primary text-background px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all"
          >
            Tentar novamente
          </button>

          <Link
            href="/"
            className="w-full bg-zinc-800 border border-zinc-700 text-textSecondary px-6 py-3 rounded-lg font-medium hover:bg-zinc-700 transition-all inline-block text-center"
          >
            Voltar ao início
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-textSecondary">
            Código do erro: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
