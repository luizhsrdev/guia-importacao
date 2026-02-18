'use client';

export default function DeclaracaoClient() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <header className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium mb-4">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          BETA
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          Assistente para Declaracao
        </h1>
        <p className="text-text-secondary max-w-lg mx-auto">
          Tire suas duvidas sobre declaracao alfandegaria com nosso assistente de IA
        </p>
      </header>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-8">
        <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <p className="text-sm text-amber-300/90 font-medium mb-1">Aviso Importante</p>
          <p className="text-sm text-amber-300/70">
            Ferramenta educacional que nao substitui consultoria profissional. <strong className="text-amber-300/90">A plataforma nao incentiva sonegacao ou fraudes</strong> — o objetivo e explicar como a Receita Federal funciona e o que nao deve ser feito.
          </p>
        </div>
      </div>

      {/* Chat Container - Placeholder */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-text-primary">Assistente IA</h2>
            <p className="text-xs text-text-secondary">Especialista em declaracao alfandegaria</p>
          </div>
        </div>

        {/* Chat Messages Area - Placeholder */}
        <div className="h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-elevated flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Em breve
          </h3>
          <p className="text-sm text-text-secondary max-w-sm">
            Estamos desenvolvendo um assistente de IA para ajudar com suas duvidas sobre declaracao alfandegaria.
            Fique atento para novidades!
          </p>
        </div>

        {/* Chat Input - Disabled Placeholder */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Digite sua pergunta..."
              disabled
              className="flex-1 h-12 bg-surface-elevated border border-border rounded-xl px-4 text-sm text-text-muted placeholder:text-text-muted cursor-not-allowed"
            />
            <button
              disabled
              className="h-12 px-6 bg-surface-elevated border border-border rounded-xl text-text-muted font-medium text-sm cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Enviar
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
