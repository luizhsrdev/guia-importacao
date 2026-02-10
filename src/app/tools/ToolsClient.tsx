'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

interface ChineseId {
  identity_number: string;
}

type MessageTab = 'photos' | 'inspection' | 'packaging' | 'negotiation' | 'general' | 'favorites';

// SVG Icons
const Icons = {
  tools: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  id: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  ),
  robot: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  chat: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  warning: (
    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  copy: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  camera: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  inspect: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  package: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  money: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  question: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
};

export function ToolsClient() {
  const [generatedId, setGeneratedId] = useState<ChineseId | null>(null);
  const [isLoadingId, setIsLoadingId] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [activeMessageTab, setActiveMessageTab] = useState<MessageTab>('photos');
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const handleTabsWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (tabsContainerRef.current) {
      e.preventDefault();
      tabsContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const handleGenerateId = async () => {
    setIsLoadingId(true);
    setIdError(null);
    try {
      const response = await fetch('/api/chinese-ids/random');
      const data = await response.json();

      if (data.success && data.data) {
        setGeneratedId(data.data);
      } else {
        setIdError(data.error || 'Erro ao gerar ID');
      }
    } catch {
      setIdError('Erro de conexão');
    } finally {
      setIsLoadingId(false);
    }
  };

  const handleCopyId = async () => {
    if (!generatedId) return;

    try {
      await navigator.clipboard.writeText(generatedId.identity_number);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = generatedId.identity_number;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const messageTabs: { id: MessageTab; label: string; icon: React.ReactNode }[] = [
    { id: 'photos', label: 'Fotos', icon: Icons.camera },
    { id: 'inspection', label: 'Inspeção', icon: Icons.inspect },
    { id: 'packaging', label: 'Embalagem', icon: Icons.package },
    { id: 'negotiation', label: 'Negociação', icon: Icons.money },
    { id: 'general', label: 'Gerais', icon: Icons.question },
    { id: 'favorites', label: 'Favoritos', icon: Icons.star },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between gap-4">
            <Logo size="md" onClick={() => window.location.href = '/'} />
            <Link
              href="/"
              className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium text-text-secondary hover:text-primary hover:bg-surface-elevated transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {Icons.tools}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Ferramentas de Importação
            </h1>
          </div>
          <p className="text-text-secondary">
            Recursos para facilitar suas compras
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Cards 1, 2, 3 */}
          <div className="flex flex-col gap-6">
            {/* Card 1: IMEI Check */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  {Icons.search}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Verificação de IMEI e Garantia
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Verifique IMEI, status iCloud e garantia Apple
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href="https://ifreeicloud.co.uk/free-check"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <p className="font-medium text-text-primary group-hover:text-primary transition-colors">
                    iFreeiCloud
                  </p>
                  <svg className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <a
                  href="https://sickw.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <p className="font-medium text-text-primary group-hover:text-primary transition-colors">
                    SickW
                  </p>
                  <svg className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>

                <a
                  href="https://checkcoverage.apple.com/?locale=pt_BR"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <p className="font-medium text-text-primary group-hover:text-primary transition-colors">
                    Apple Check Coverage
                  </p>
                  <svg className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Card 2: Chinese ID */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {Icons.id}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    ID para Verificação Xianyu
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Obtenha ID chinês para ativar chat
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateId}
                disabled={isLoadingId}
                className="w-full h-11 rounded-xl bg-primary text-black font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoadingId ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Gerando...
                  </>
                ) : (
                  'Gerar ID'
                )}
              </button>

              {/* Error */}
              {idError && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-400">{idError}</p>
                </div>
              )}

              {/* Result */}
              {generatedId && (
                <div className="mt-4">
                  <div className="h-px bg-border my-4" />

                  <div className="p-4 rounded-xl bg-surface-elevated border border-border">
                    <p className="text-xs text-text-muted mb-2">ID para verificação</p>
                    <p className="font-mono text-xl text-primary select-all">{generatedId.identity_number}</p>
                  </div>

                  <button
                    onClick={handleCopyId}
                    className="w-full mt-3 h-10 rounded-xl bg-surface-elevated border border-border text-text-secondary hover:text-primary hover:border-primary/30 font-medium text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {copiedId ? (
                      <>
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copiado!
                      </>
                    ) : (
                      <>
                        {Icons.copy}
                        Copiar ID
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Card 3: AI Assistant */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    {Icons.robot}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                      Assistente para Declaração
                    </h2>
                    <p className="text-sm text-text-secondary">
                      Orientações sobre declaração alfandegária
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-medium">
                  BETA
                </span>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                {Icons.warning}
                <p className="text-sm text-amber-300/90">
                  Ferramenta educacional. Não substitui orientação profissional.
                </p>
              </div>

              {/* Placeholder Button */}
              <button
                disabled
                className="w-full h-11 rounded-xl bg-surface-elevated border border-border text-text-muted font-medium text-sm cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Em breve
              </button>
            </div>
          </div>

          {/* Right Column - Card 4 */}
          <div className="lg:row-span-3">
            {/* Card 4: Pre-made Messages */}
            <div className="bg-surface rounded-2xl border border-border p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  {Icons.chat}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Mensagens Pré-Prontas
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Templates para vendedores e agentes
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Buscar mensagens..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-elevated border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary/50 transition-colors"
                  disabled
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Tabs */}
              <div
                ref={tabsContainerRef}
                onWheel={handleTabsWheel}
                className="flex gap-1 overflow-x-auto pb-2 mb-4 -mx-1 px-1 scrollbar-hide"
              >
                {messageTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveMessageTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      activeMessageTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Messages List Placeholder */}
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-elevated flex items-center justify-center mb-4 text-text-muted">
                  <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-text-secondary font-medium mb-1">
                  Mensagens em breve
                </p>
                <p className="text-sm text-text-muted max-w-[200px]">
                  Templates prontos para copiar e enviar aos vendedores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
