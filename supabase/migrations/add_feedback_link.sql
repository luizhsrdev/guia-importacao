-- Adicionar coluna feedback_link na tabela sellers
-- Execute este SQL no SQL Editor do Supabase

ALTER TABLE sellers
ADD COLUMN IF NOT EXISTS feedback_link TEXT;

-- Comentário para documentação
COMMENT ON COLUMN sellers.feedback_link IS 'Link de feedback/avaliações positivas (apenas para vendedores Gold)';
