-- =============================================
-- EXCHANGE RATES TABLE - VERSÃO CORRIGIDA
-- Execute este arquivo completo no Supabase SQL Editor
-- =============================================

-- 1. Remover tabela existente (se houver)
DROP TABLE IF EXISTS public.exchange_rates CASCADE;

-- 2. Criar tabela com estrutura correta
CREATE TABLE public.exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  official_rate NUMERIC(10,6) NOT NULL DEFAULT 1.32,
  manual_adjustment NUMERIC(5,4) NOT NULL DEFAULT 0.95,
  effective_rate NUMERIC(10,6) GENERATED ALWAYS AS (official_rate * manual_adjustment) STORED,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Criar índice para consultas rápidas
CREATE INDEX idx_exchange_rates_active ON public.exchange_rates (is_active, created_at DESC);

-- 4. Habilitar RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Leitura pública (qualquer um pode ler taxas ativas)
CREATE POLICY "Leitura pública de cotações"
ON public.exchange_rates
FOR SELECT
TO public
USING (is_active = true);

-- 6. Policy: Admins podem fazer tudo
CREATE POLICY "Admins gerenciam cotações"
ON public.exchange_rates
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE clerk_id = auth.jwt() ->> 'sub'
    AND is_admin = true
  )
);

-- 7. Conceder permissões
GRANT SELECT ON public.exchange_rates TO anon;
GRANT SELECT ON public.exchange_rates TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.exchange_rates TO authenticated;

-- 8. Inserir cotação inicial (BRL -> CNY = 1.45, ajuste 95%)
INSERT INTO public.exchange_rates (official_rate, manual_adjustment, notes, is_active)
VALUES (1.45, 0.95, 'Cotação inicial - BRL para CNY via Binance + CSSBuy', true);

-- 9. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_exchange_rates_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exchange_rates_updated_at
  BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW
  EXECUTE FUNCTION update_exchange_rates_timestamp();

-- 10. Verificar resultado
SELECT
  id,
  official_rate,
  manual_adjustment,
  effective_rate,
  notes,
  is_active,
  created_at
FROM public.exchange_rates
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 1;
