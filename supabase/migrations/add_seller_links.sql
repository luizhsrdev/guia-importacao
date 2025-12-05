-- Adicionar colunas profile_link e proof_link na tabela sellers
-- Execute este SQL no SQL Editor do Supabase

ALTER TABLE sellers
ADD COLUMN IF NOT EXISTS profile_link TEXT,
ADD COLUMN IF NOT EXISTS proof_link TEXT;

-- Comentários para documentação
COMMENT ON COLUMN sellers.profile_link IS 'Link do perfil do vendedor no Xianyu (visível para usuários premium)';
COMMENT ON COLUMN sellers.proof_link IS 'Link adicional para discussões, posts ou provas online';
