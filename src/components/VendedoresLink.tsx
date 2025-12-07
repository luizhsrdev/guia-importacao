'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function VendedoresLink() {
  const { user, isLoaded } = useUser();
  const [showModal, setShowModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);

  // Verificar se usuário é premium
  useEffect(() => {
    if (!isLoaded || !user) {
      setIsCheckingPremium(false);
      return;
    }

    // Buscar status premium do Supabase
    fetch('/api/check-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        setIsPremium(data.isPremium);
        setIsCheckingPremium(false);
      })
      .catch(() => setIsCheckingPremium(false));
  }, [user, isLoaded]);

  const handleClick = (e: React.MouseEvent) => {
    // Se não estiver logado, vai para login
    if (!user) {
      return; // Link normal funciona
    }

    // Se for premium, deixa navegar normalmente
    if (isPremium) {
      return; // Link normal funciona
    }

    // Se não for premium, bloqueia e abre modal
    e.preventDefault();
    setShowModal(true);
  };

  const handleUpgrade = () => {
    alert('Sucesso! Em breve você será redirecionado para o pagamento.');
    setShowModal(false);
  };

  const handleDecline = () => {
    setShowModal(false);
    setTimeout(() => {
      alert('Não, prefiro correr riscos.');
    }, 100);
  };

  return (
    <>
      {/* Link normal */}
      <Link
        href={user ? (isPremium ? '/vendedores' : '#') : '/sign-in'}
        onClick={handleClick}
        className="px-6 py-2 rounded-lg font-medium bg-surface border border-zinc-700 text-textMain hover:bg-zinc-800 transition-all text-sm"
      >
        Vendedores
        {!isCheckingPremium && !isPremium && user && (
          <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
            Premium
          </span>
        )}
      </Link>

      {/* Modal Premium */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/70 animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface border border-zinc-800 rounded-xl max-w-2xl w-full p-8 shadow-2xl animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-block bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                Conteúdo Premium
              </div>
              <h2 className="text-3xl font-bold text-textMain mb-3">
                Acesso à Lista de Vendedores
              </h2>
              <p className="text-textSecondary text-lg">
                Proteja seus investimentos com informações exclusivas
              </p>
            </div>

            {/* Benefícios */}
            <div className="bg-background rounded-lg p-6 mb-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-primary"
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
                <div>
                  <h3 className="text-textMain font-semibold mb-1">
                    Lista Dourada de Fornecedores
                  </h3>
                  <p className="text-textSecondary text-sm">
                    Vendedores testados e aprovados pela comunidade com
                    histórico de transações seguras
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-primary"
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
                <div>
                  <h3 className="text-textMain font-semibold mb-1">
                    Blacklist de Golpistas
                  </h3>
                  <p className="text-textSecondary text-sm">
                    Lista atualizada de vendedores com histórico de fraudes, com
                    provas documentadas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-primary"
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
                <div>
                  <h3 className="text-textMain font-semibold mb-1">
                    Avaliações e Feedbacks Reais
                  </h3>
                  <p className="text-textSecondary text-sm">
                    Acesso a links de perfis, avaliações de clientes e histórico
                    detalhado
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <svg
                    className="w-4 h-4 text-primary"
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
                <div>
                  <h3 className="text-textMain font-semibold mb-1">
                    Acesso Vitalício
                  </h3>
                  <p className="text-textSecondary text-sm">
                    Pague uma única vez e tenha acesso permanente a todas as
                    atualizações
                  </p>
                </div>
              </div>
            </div>

            {/* Preço */}
            <div className="text-center mb-6 p-6 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="text-textSecondary text-sm mb-2">
                Acesso Vitalício por apenas
              </div>
              <div className="text-4xl font-bold text-primary mb-2">
                R$ 89,90
              </div>
              <div className="text-textSecondary text-sm">
                Pagamento único via PIX
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleUpgrade}
                className="w-full bg-primary text-background px-6 py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Quero Ter Acesso Seguro
              </button>

              <button
                onClick={handleDecline}
                className="w-full bg-zinc-800 border border-zinc-700 text-textSecondary px-6 py-3 rounded-lg font-medium hover:bg-zinc-700 transition-all"
              >
                Não, Prefiro Continuar no Plano Gratuito
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-center text-textSecondary text-xs mt-6">
              Garantia de 7 dias: Se não ficar satisfeito, devolvemos 100% do
              valor
            </p>
          </div>
        </div>
      )}
    </>
  );
}
