import Link from 'next/link';
import { CalculadoraClient } from './CalculadoraClient';

export default function CalculadoraPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="text-primary hover:underline text-sm flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-textMain mb-2">
            Calculadora de Importação
          </h1>
          <p className="text-textSecondary">
            Calcule o custo total de importação da China para o Brasil, incluindo taxas e impostos.
          </p>
        </div>

        <CalculadoraClient />

        <div className="mt-8 bg-surface border border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-textMain mb-4">
            Sobre os impostos
          </h2>
          <div className="space-y-3 text-sm text-textSecondary">
            <p>
              <strong className="text-textMain">Remessa Conforme (até US$ 50):</strong>{' '}
              Apenas ICMS de 17%, sem imposto de importação.
            </p>
            <p>
              <strong className="text-textMain">Acima de US$ 50:</strong>{' '}
              Imposto de Importação de 60% + ICMS de 17% (cascateado).
            </p>
            <p>
              <strong className="text-textMain">IOF:</strong>{' '}
              0,38% sobre o valor da operação de câmbio.
            </p>
            <p>
              <strong className="text-textMain">Taxa do agente:</strong>{' '}
              Varia conforme o agente (CSSBuy, Sugargoo, etc).
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
