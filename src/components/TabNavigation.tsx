'use client';

import { useState } from 'react';
import { FeatureItem } from './FeatureItem';

interface Tab {
  id: string;
  label: string;
  isPremium: boolean;
}

const TABS: Tab[] = [
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

  const handleTabClick = (tab: Tab) => {
    if (!tab.isPremium) {
      onTabChange(tab.id);
      return;
    }

    if (!userStatus.isAuthenticated) {
      window.location.href = '/sign-in';
      return;
    }

    if (userStatus.isPremium || userStatus.isAdmin) {
      onTabChange(tab.id);
      return;
    }

    setShowModal(true);
  };

  const shouldShowLock = (tab: Tab) => {
    if (!tab.isPremium) return false;
    if (!userStatus.isAuthenticated) return true;
    return !(userStatus.isPremium || userStatus.isAdmin);
  };

  const handleUpgrade = () => {
    window.location.href = '/premium';
  };

  return (
    <>
      <nav className="relative" role="tablist">
        <div className="flex gap-2 relative">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const showLock = shouldShowLock(tab);

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabClick(tab)}
                className={`relative px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                <span className="flex items-center gap-2">
                  {tab.label}

                  {tab.isPremium && !userStatus.isPremium && !userStatus.isAdmin && (
                    <span className="tag-gold">
                      Pro
                    </span>
                  )}

                  {showLock && (
                    <svg
                      className="w-3.5 h-3.5 text-text-muted"
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
        </div>
      </nav>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 animate-fadeIn"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="premium-modal-title"
        >
          <div
            className="bg-surface border border-border rounded-2xl max-w-md w-full p-8 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <span className="tag-gold mb-4 inline-block">
                Premium
              </span>
              <h2 id="premium-modal-title" className="text-2xl font-semibold text-text-primary mb-2">
                Lista de Vendedores
              </h2>
              <p className="text-text-secondary">
                Acesso a vendedores verificados e blacklist
              </p>
            </div>

            <div className="bg-surface-elevated rounded-xl p-5 mb-8 space-y-4">
              <FeatureItem text="Vendedores verificados pela comunidade" />
              <FeatureItem text="Blacklist com provas documentadas" />
              <FeatureItem text="Avaliações e feedbacks reais" />
              <FeatureItem text="Acesso vitalício" />
            </div>

            <div className="text-center py-5 px-6 bg-amber-500 rounded-xl mb-8">
              <p className="text-amber-900/70 text-xs mb-1 uppercase tracking-wide font-medium">
                Pagamento único
              </p>
              <p className="text-3xl font-bold text-white">
                R$ 89,90
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleUpgrade}
                className="w-full bg-primary text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-primary-hover transition-colors duration-150"
              >
                Quero ter acesso
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="w-full text-text-secondary font-medium py-3 px-6 rounded-xl hover:text-text-primary hover:bg-surface-elevated transition-colors duration-150"
              >
                Agora não
              </button>
            </div>

            <p className="text-center text-text-muted text-xs mt-5">
              Garantia de 7 dias ou seu dinheiro de volta
            </p>
          </div>
        </div>
      )}
    </>
  );
}
