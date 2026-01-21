-- Tabela de reports de vendedores
CREATE TABLE IF NOT EXISTS seller_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  user_id TEXT,
  user_ip TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('broken_link', 'seller_not_responding', 'other')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_seller_reports_seller_id ON seller_reports(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_reports_created_at ON seller_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seller_reports_type ON seller_reports(report_type);

-- Adicionar colunas de contadores na tabela sellers
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS broken_link_reports INTEGER DEFAULT 0;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS seller_not_responding_reports INTEGER DEFAULT 0;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS other_reports INTEGER DEFAULT 0;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS needs_validation BOOLEAN DEFAULT false;

-- Tabela de favoritos de vendedores
CREATE TABLE IF NOT EXISTS seller_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, seller_id)
);

-- Índices para favoritos
CREATE INDEX IF NOT EXISTS idx_seller_favorites_user_id ON seller_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_favorites_seller_id ON seller_favorites(seller_id);

-- Função para incrementar contadores de reports de vendedores
CREATE OR REPLACE FUNCTION report_seller_issue(p_seller_id UUID, p_issue_type TEXT)
RETURNS void AS $$
BEGIN
  CASE p_issue_type
    WHEN 'broken_link' THEN
      UPDATE sellers SET broken_link_reports = broken_link_reports + 1, needs_validation = true WHERE id = p_seller_id;
    WHEN 'seller_not_responding' THEN
      UPDATE sellers SET seller_not_responding_reports = seller_not_responding_reports + 1, needs_validation = true WHERE id = p_seller_id;
    WHEN 'other' THEN
      UPDATE sellers SET other_reports = other_reports + 1, needs_validation = true WHERE id = p_seller_id;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security)
ALTER TABLE seller_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_favorites ENABLE ROW LEVEL SECURITY;

-- Policies para seller_reports
CREATE POLICY "Qualquer um pode criar reports de vendedores" ON seller_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins podem ver todos os reports de vendedores" ON seller_reports FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users WHERE clerk_id = auth.jwt() ->> 'sub' AND is_admin = true
  )
);

CREATE POLICY "Admins podem deletar reports de vendedores" ON seller_reports FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users WHERE clerk_id = auth.jwt() ->> 'sub' AND is_admin = true
  )
);

-- Policies para seller_favorites
CREATE POLICY "Usuários podem ver seus próprios favoritos de vendedores" ON seller_favorites FOR SELECT USING (
  user_id = auth.jwt() ->> 'sub'
);

CREATE POLICY "Usuários podem adicionar favoritos de vendedores" ON seller_favorites FOR INSERT WITH CHECK (
  user_id = auth.jwt() ->> 'sub'
);

CREATE POLICY "Usuários podem remover favoritos de vendedores" ON seller_favorites FOR DELETE USING (
  user_id = auth.jwt() ->> 'sub'
);
