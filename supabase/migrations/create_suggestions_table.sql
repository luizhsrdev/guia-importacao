-- =====================================================
-- TABELA: suggestions
-- Sistema de sugestoes de usuarios
-- Execute este arquivo no Supabase SQL Editor
-- =====================================================

-- 1. Criar tabela de sugestoes
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Conteudo da sugestao
  text TEXT NOT NULL,

  -- Contexto
  page_url TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN (
    'floating_button',      -- Clicou no botao flutuante
    'nudge_time',           -- Nudge por tempo (90s)
    'nudge_visit',          -- Nudge por 3a visita
    'nudge_zero_results'    -- Nudge por busca sem resultados
  )),
  search_query TEXT,        -- Query de busca (quando trigger = nudge_zero_results)

  -- Identificacao do usuario (anonimizada)
  user_id TEXT,             -- Clerk user_id (se autenticado)
  user_ip_hash TEXT NOT NULL, -- SHA256 do IP (nunca armazena IP raw)
  user_agent TEXT,          -- Para detectar bots

  -- Timestamps e status
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE
);

-- 2. Criar indices para performance
CREATE INDEX IF NOT EXISTS idx_suggestions_created_at ON suggestions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_is_read ON suggestions(is_read);
CREATE INDEX IF NOT EXISTS idx_suggestions_trigger_type ON suggestions(trigger_type);
CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_user_ip_hash ON suggestions(user_ip_hash);

-- 3. Habilitar RLS
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Insercao publica (qualquer um pode enviar sugestao)
CREATE POLICY "suggestions_insert_public"
ON suggestions
FOR INSERT
TO public
WITH CHECK (true);

-- 5. Policy: Apenas admins podem ler sugestoes
CREATE POLICY "suggestions_select_admin"
ON suggestions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.jwt() ->> 'sub'
    AND users.is_admin = true
  )
);

-- 6. Policy: Apenas admins podem atualizar sugestoes (marcar como lido)
CREATE POLICY "suggestions_update_admin"
ON suggestions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.jwt() ->> 'sub'
    AND users.is_admin = true
  )
);

-- 7. Policy: Apenas admins podem deletar sugestoes
CREATE POLICY "suggestions_delete_admin"
ON suggestions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.clerk_id = auth.jwt() ->> 'sub'
    AND users.is_admin = true
  )
);

-- 8. Comentario descritivo
COMMENT ON TABLE suggestions IS 'Sugestoes de usuarios coletadas via botao flutuante e nudges proativos';

-- 9. Verificar se a tabela foi criada
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'suggestions'
ORDER BY ordinal_position;
