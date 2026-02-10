-- Tabela para armazenar IDs chineses públicos
CREATE TABLE IF NOT EXISTS chinese_ids (
  id SERIAL PRIMARY KEY,
  identity_number VARCHAR(18) NOT NULL UNIQUE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para busca por menor uso (prioriza IDs menos usados)
CREATE INDEX IF NOT EXISTS idx_chinese_ids_usage ON chinese_ids(usage_count ASC, last_used_at ASC NULLS FIRST);
CREATE INDEX IF NOT EXISTS idx_chinese_ids_identity_number ON chinese_ids(identity_number);

-- RLS: Enable
ALTER TABLE chinese_ids ENABLE ROW LEVEL SECURITY;

-- Policy: Public read (anyone can read)
CREATE POLICY "chinese_ids_public_read" ON chinese_ids
  FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update/delete (admin via migrations)
CREATE POLICY "chinese_ids_service_write" ON chinese_ids
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Tabela para favoritos de mensagens (para implementação futura)
CREATE TABLE IF NOT EXISTS message_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  message_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, message_id)
);

-- RLS for message_favorites
ALTER TABLE message_favorites ENABLE ROW LEVEL SECURITY;

-- Users can read their own favorites
CREATE POLICY "message_favorites_read_own" ON message_favorites
  FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own favorites
CREATE POLICY "message_favorites_insert_own" ON message_favorites
  FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own favorites
CREATE POLICY "message_favorites_delete_own" ON message_favorites
  FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
