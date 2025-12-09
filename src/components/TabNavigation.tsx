'use client';

import { useRef, useEffect, useState } from 'react';

interface Tab {
  id: string;
  label: string;
  isPremium: boolean;
}

const tabs: Tab[] = [
  { id: 'produtos', label: 'Produtos', isPremium: false },
  { id: 'vendedores', label: 'Vendedores', isPremium: true },
];

interface TabNavigationProps {
  onTabChange: (tabId: string) => void;
  activeTab: string;
  userStatus: {
    isAuthenticated: boolean;
    isPremium: boolean;
    isAdmin: boolean;
  };
}

export default function TabNavigation({
  onTabChange,
  activeTab,
  userStatus,
}: TabNavigationProps) {
  const [showModal, setShowModal] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Atualizar posição do indicador
  useEffect(() => {
    const activeTabElement = tabRefs.current[activeTab];
    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
  }, [activeTab]);

  const handleTabClick = (tab: Tab) => {
    // Se for aba gratuita, muda direto
    if (!tab.isPremium) {
      onTabChange(tab.id);
      return;
    }

    // Se não estiver logado, redireciona
    if (!userStatus.isAuthenticated) {
      window.location.href = '/sign-in';
      return;
    }

    // Se for premium/admin, muda direto (SEM DELAY!)
    if (userStatus.isPremium || userStatus.isAdmin) {
      onTabChange(tab.id);
      return;
    }

    // Se não for premium, abre modal
    setShowModal(true);
  };

  // Determinar se deve mostrar cadeado (CALCULADO NO SERVIDOR)
  const shouldShowLock = (tab: Tab) => {
    if (!tab.isPremium) return false;
    if (!userStatus.isAuthenticated) return true;
    return !(userStatus.isPremium || userStatus.isAdmin);
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
      <div className="relative border-b border-zinc-800 mb-8">
        <div className="flex gap-2 relative">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const showLock = shouldShowLock(tab);

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                onClick={() => handleTabClick(tab)}
                className={`
                  relative px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap
                  ${
                    isActive
                      ? 'text-primary'
                      : 'text-textSecondary hover:text-textMain'
                  }
                `}
              >
                <span className="flex items-center gap-2">
                  {tab.label}

                  {/* Badge Premium (PRÉ-CALCULADO - SEM FLASH!) */}
                  {tab.isPremium && (
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                      Premium
                    </span>
                  )}

                  {/* Cadeado (PRÉ-CALCULADO - SEM FLASH!) */}
                  {showLock && (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </button>
            );
          })}

          {/* Indicador animado */}
          <div
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
            }}
          />
        </div>
      </div>

      {/* Modal Premium */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-black/80 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface border border-zinc-800 rounded-xl max-w-2xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200"
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
                    Vendedores testados e aprovados pela comunidade
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
                    Lista atualizada com provas documentadas
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
                    Avaliações Reais
                  </h3>
                  <p className="text-textSecondary text-sm">
                    Acesso a perfis e histórico detalhado
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
                    Pague uma vez, acesso permanente
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
