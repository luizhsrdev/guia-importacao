import type { Metadata } from 'next';
import CalculatorClient from './CalculatorClient';
import { getCurrentUserStatus } from '@/lib/user-server';

export const metadata: Metadata = {
  title: 'Calculadora de Custo de Importação | Guia Importação Xianyu',
  description:
    'Calcule o custo total de importação via CSSBuy com frete JD Express. Inclui produto, frete, seguro e taxas.',
  keywords: 'calculadora importação china, custo frete cssbuy, jd express calculadora, custo total xianyu',
};

export default async function CalculatorPage() {
  const userStatus = await getCurrentUserStatus();
  return <CalculatorClient userStatus={userStatus} />;
}
