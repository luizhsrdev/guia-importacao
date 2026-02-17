/**
 * Script para criar o plano de assinatura no Mercado Pago
 *
 * Executar UMA VEZ com:
 * npx tsx scripts/create-mp-plan.ts
 *
 * Apos execucao, copie o PLAN_ID gerado e adicione ao .env.local:
 * MP_SUBSCRIPTION_PLAN_ID=<plan_id_gerado>
 */

import { config } from 'dotenv';
import path from 'path';

// Carregar .env.local do diretorio raiz do projeto
config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('🔍 Verificando variaveis de ambiente...');
console.log('MP_ACCESS_TOKEN:', process.env.MP_ACCESS_TOKEN ? '✅ Configurado' : '❌ Nao encontrado');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL ? '✅ Configurado' : '❌ Nao encontrado');
console.log('');

// Validar variaveis necessarias
const requiredEnvVars = {
  MP_ACCESS_TOKEN: process.env.MP_ACCESS_TOKEN,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Variaveis de ambiente nao configuradas:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nAdicione essas variaveis no arquivo .env.local na raiz do projeto.');
  process.exit(1);
}

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

if (APP_URL.includes('localhost') || APP_URL.includes('127.0.0.1')) {
  console.error('❌ NEXT_PUBLIC_APP_URL nao pode ser localhost.');
  console.error('   O Mercado Pago exige uma URL publica para back_url.');
  console.error('   Use uma URL de producao (ex: https://seusite.com.br)');
  process.exit(1);
}

async function createSubscriptionPlan() {
  console.log('========================================');
  console.log('  CRIAR PLANO DE ASSINATURA MERCADO PAGO');
  console.log('========================================\n');

  console.log('Configuracoes:');
  console.log(`- APP_URL: ${APP_URL}`);
  console.log(`- Token: ${MP_ACCESS_TOKEN.substring(0, 20)}...`);
  console.log('\nCriando plano de assinatura mensal de R$ 4,90...\n');

  try {
    const response = await fetch('https://api.mercadopago.com/preapproval_plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        reason: 'Assinatura Premium Mensal - Guia Importacao',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 4.90,
          currency_id: 'BRL',
        },
        back_url: `${APP_URL}/pagamento/sucesso`,
        payment_methods_allowed: {
          payment_types: [
            { id: 'credit_card' },
            { id: 'debit_card' },
          ],
          payment_methods: [],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('ERRO ao criar plano:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('========================================');
    console.log('  PLANO CRIADO COM SUCESSO!');
    console.log('========================================\n');
    console.log('Detalhes do plano:');
    console.log(`- ID: ${data.id}`);
    console.log(`- Status: ${data.status}`);
    console.log(`- Valor: R$ ${data.auto_recurring?.transaction_amount || 4.90}`);
    console.log(`- Frequencia: ${data.auto_recurring?.frequency} ${data.auto_recurring?.frequency_type}`);

    if (data.init_point) {
      console.log(`- Link de teste: ${data.init_point}`);
    }

    console.log('\n========================================');
    console.log('  PROXIMO PASSO');
    console.log('========================================\n');
    console.log('Adicione esta linha ao seu .env.local:\n');
    console.log(`MP_SUBSCRIPTION_PLAN_ID=${data.id}`);
    console.log('\n========================================\n');

    return data;
  } catch (error) {
    console.error('ERRO de conexao:', error);
    process.exit(1);
  }
}

// Executar
createSubscriptionPlan();
