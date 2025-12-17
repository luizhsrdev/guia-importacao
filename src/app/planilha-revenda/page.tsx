'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PlanilhaRevendaPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    fetch('/api/check-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
      .then(res => res.json())
      .then(data => {
        const hasPremium = data.isPremium || data.isAdmin;
        setIsPremium(hasPremium);

        if (!hasPremium) {
          setShowModal(true);
        }

        setIsChecking(false);
      })
      .catch(() => {
        setShowModal(true);
        setIsChecking(false);
      });
  }, [user, isLoaded, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Conteúdo da página "Em Desenvolvimento" */}
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center space-y-6">
          {/* Ícone */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-text-primary">
              Planilha de Revenda
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Estamos preparando uma ferramenta completa para você gerenciar sua
              operação de revenda com cálculos automáticos de margem, custos e
              precificação.
            </p>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
            <svg
              className="w-5 h-5 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              Em Desenvolvimento
            </span>
          </div>

          {/* Botão de voltar */}
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Voltar para Home
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Premium */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-background border border-border rounded-xl max-w-2xl w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                Conteúdo Premium
              </div>
              <h2 className="text-3xl font-bold mb-3">Esta página é exclusiva para assinantes</h2>
              <p className="text-text-secondary text-lg">
                Assine o Premium por apenas R$ 9,90 (pagamento único) e tenha acesso vitalício a todos os recursos.
              </p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={() => router.push('/premium')}
                className="w-full bg-primary text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-primary-hover transition-all"
              >
                Quero Ter Acesso - R$ 9,90
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full bg-surface-elevated text-text-secondary px-6 py-3 rounded-lg font-medium hover:bg-surface transition-all"
              >
                Voltar para Home
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
