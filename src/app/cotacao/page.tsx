import type { Metadata } from 'next';
import CotacaoClient from './CotacaoClient';

export const metadata: Metadata = {
  title: 'Calculadora de Cotação BRL → CNY | Guia Importação Xianyu',
  description:
    'Converta valores de Yuan (CNY) para Real (BRL) com a cotação atualizada. Saiba quanto custa seu produto da China em reais.',
  keywords: 'cotação yuan real, converter cny brl, taxa câmbio china brasil, xianyu cotação',
};

export default function CotacaoPage() {
  return <CotacaoClient />;
}
