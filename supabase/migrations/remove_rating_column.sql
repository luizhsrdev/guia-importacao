-- Remover coluna rating da tabela sellers
-- Execute este SQL no SQL Editor do Supabase

ALTER TABLE sellers DROP COLUMN IF EXISTS rating;

-- Comentário para documentação
COMMENT ON TABLE sellers IS 'Tabela de vendedores (gold list e blacklist) - sem rating';
