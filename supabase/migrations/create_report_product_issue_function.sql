-- =============================================
-- FUNÇÃO: report_product_issue
-- Atualiza contadores de report em produtos
-- Execute este arquivo no Supabase SQL Editor
-- =============================================

-- 1. Garantir que as colunas existem na tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS broken_link_reports INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS out_of_stock_reports INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_not_responding_reports INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS wrong_price_reports INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS other_reports INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS needs_validation BOOLEAN DEFAULT false;

-- 2. Criar a função para processar reports
CREATE OR REPLACE FUNCTION report_product_issue(
  p_product_id UUID,
  p_issue_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
  v_new_count INTEGER;
BEGIN
  -- Atualizar contador baseado no tipo de report
  CASE p_issue_type
    WHEN 'broken_link' THEN
      UPDATE products
      SET broken_link_reports = COALESCE(broken_link_reports, 0) + 1,
          needs_validation = true,
          updated_at = NOW()
      WHERE id = p_product_id
      RETURNING broken_link_reports INTO v_new_count;

    WHEN 'out_of_stock' THEN
      UPDATE products
      SET out_of_stock_reports = COALESCE(out_of_stock_reports, 0) + 1,
          needs_validation = true,
          -- Auto-marcar como esgotado se tiver 3+ reports
          is_sold_out = CASE WHEN COALESCE(out_of_stock_reports, 0) + 1 >= 3 THEN true ELSE is_sold_out END,
          updated_at = NOW()
      WHERE id = p_product_id
      RETURNING out_of_stock_reports INTO v_new_count;

    WHEN 'seller_not_responding' THEN
      UPDATE products
      SET seller_not_responding_reports = COALESCE(seller_not_responding_reports, 0) + 1,
          needs_validation = true,
          updated_at = NOW()
      WHERE id = p_product_id
      RETURNING seller_not_responding_reports INTO v_new_count;

    WHEN 'wrong_price' THEN
      UPDATE products
      SET wrong_price_reports = COALESCE(wrong_price_reports, 0) + 1,
          needs_validation = true,
          updated_at = NOW()
      WHERE id = p_product_id
      RETURNING wrong_price_reports INTO v_new_count;

    WHEN 'other' THEN
      UPDATE products
      SET other_reports = COALESCE(other_reports, 0) + 1,
          needs_validation = true,
          updated_at = NOW()
      WHERE id = p_product_id
      RETURNING other_reports INTO v_new_count;

    ELSE
      RAISE EXCEPTION 'Tipo de report inválido: %', p_issue_type;
  END CASE;

  -- Retornar resultado
  v_result := json_build_object(
    'success', true,
    'issue_type', p_issue_type,
    'new_count', v_new_count
  );

  RETURN v_result;
END;
$$;

-- 3. Conceder permissões
GRANT EXECUTE ON FUNCTION report_product_issue(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION report_product_issue(UUID, TEXT) TO anon;

-- 4. Comentário descritivo
COMMENT ON FUNCTION report_product_issue IS 'Incrementa contadores de report para produtos e marca para validação';

-- 5. Verificar se a função foi criada
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_name = 'report_product_issue';
