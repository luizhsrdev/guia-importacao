import Link from 'next/link';
import { CalculadoraClient } from './CalculadoraClient';

export default function CalculadoraPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/"
            className="link text-sm flex items-center gap-1"
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
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            Calculadora de Importação
          </h1>
          <p className="text-text-secondary text-sm">
            Calcule o frete CSSBuy e o custo total de importação da China para o Brasil, incluindo taxas e impostos.
          </p>
        </div>

        <CalculadoraClient />

        <div className="mt-8 card p-5">
          <h2 className="text-base font-medium text-text-primary mb-4">
            Informações Importantes
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-text-primary font-medium text-sm mb-2">Frete CSSBuy</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>
                  <span className="text-text-primary font-medium">Peso Volumétrico:</span>{' '}
                  Calculado como (L × W × H × 1000) / 8000. Para rotas volumétricas, o maior entre peso real e volumétrico é cobrado.
                </p>
                <p>
                  <span className="text-text-primary font-medium">Seguro:</span>{' '}
                  3% do valor do produto em CNY, obrigatório para proteção da mercadoria.
                </p>
                <p>
                  <span className="text-text-primary font-medium">Taxa de Serviço:</span>{' '}
                  Varia de 1% a 5% conforme seu nível VIP no CSSBuy.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-text-primary font-medium text-sm mb-2">Impostos de Importação</h3>
              <div className="space-y-2 text-sm text-text-secondary">
                <p>
                  <span className="text-text-primary font-medium">Remessa Conforme (até US$ 50):</span>{' '}
                  Apenas ICMS de 17%, sem imposto de importação.
                </p>
                <p>
                  <span className="text-text-primary font-medium">Acima de US$ 50:</span>{' '}
                  Imposto de Importação de 60% + ICMS de 17% (cascateado).
                </p>
                <p>
                  <span className="text-text-primary font-medium">IOF:</span>{' '}
                  0,38% sobre o valor da operação de câmbio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
