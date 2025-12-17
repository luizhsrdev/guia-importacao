-- Migration: Create payments and webhook tracking tables
-- Run this in Supabase SQL Editor

-- Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  mercadopago_id TEXT UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  idempotency_key TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,

  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'refunded'))
);

-- Tabela de webhooks processados (idempotência)
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  action TEXT,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_clerk_user ON payments(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_mercadopago_id ON payments(mercadopago_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_webhook_id ON processed_webhooks(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_processed_at ON processed_webhooks(processed_at);

-- Habilitar RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (apenas service role pode acessar diretamente)
-- O acesso é feito via Server Actions com SUPABASE_SERVICE_ROLE_KEY

DROP POLICY IF EXISTS "Service role full access payments" ON payments;
CREATE POLICY "Service role full access payments" ON payments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access webhooks" ON processed_webhooks;
CREATE POLICY "Service role full access webhooks" ON processed_webhooks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Função para limpar webhooks antigos (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_old_webhooks()
RETURNS void AS $$
BEGIN
  DELETE FROM processed_webhooks
  WHERE processed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
