-- =====================================================
-- RLS POLICIES - Guia Importação Xianyu
-- =====================================================
--
-- IMPORTANTE: Este arquivo implementa Row Level Security (RLS)
-- para todas as tabelas principais do projeto.
--
-- PRÉ-REQUISITOS:
-- Certifique-se que todas as 9 tabelas core existem:
--    - users (clerk_id: TEXT), products, product_categories
--    - sellers, seller_categories
--    - product_reports (user_id: TEXT), seller_reports (user_id: TEXT)
--    - user_favorites (user_id: TEXT), seller_favorites (user_id: TEXT)
--
-- NOTA: Tabelas payments e processed_webhooks foram removidas deste SQL
--       pois não existem no banco atual. Adicione-as depois se necessário.
--
-- AUTENTICAÇÃO: Clerk via TEXT clerk_id (Opção B)
-- - users.clerk_id = TEXT (não UUID)
-- - current_setting('request.jwt.claims')::json->>'sub' retorna clerk_id
--
-- ESTRATÉGIA DE SEGURANÇA:
-- 1. Habilitar RLS em todas as tabelas
-- 2. Criar VIEWS públicas que filtram colunas sensíveis
-- 3. Criar policies de admin (full access para is_admin = true)
-- 4. Criar policies user-scoped (favorites, etc.)
--
-- PROTEÇÃO DE original_link:
-- - Usa VIEW products_public que EXCLUI original_link
-- - Impossível vazar mesmo com SELECT *
-- - Admins usam tabela products direta ou VIEW products_admin
--
-- =====================================================

-- =====================================================
-- FUNÇÃO HELPER: Pegar clerk_id do JWT
-- =====================================================

CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    NULL
  )::TEXT;
$$;

COMMENT ON FUNCTION public.clerk_user_id() IS
'Retorna o clerk_id (TEXT) do usuário autenticado via JWT do Clerk';

-- =====================================================
-- FUNÇÃO HELPER: Verificar se é admin
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE clerk_id = public.clerk_user_id()
    AND is_admin = true
  );
$$;

COMMENT ON FUNCTION public.is_admin() IS
'Verifica se o usuário autenticado tem is_admin = true na tabela users';

-- =====================================================
-- FUNÇÃO HELPER: Verificar se é premium
-- =====================================================

CREATE OR REPLACE FUNCTION public.is_premium()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM users
    WHERE clerk_id = public.clerk_user_id()
    AND (is_premium = true OR is_admin = true)
  );
$$;

COMMENT ON FUNCTION public.is_premium() IS
'Verifica se o usuário autenticado tem is_premium = true OU is_admin = true';

-- =====================================================
-- TABELA: users
-- =====================================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seu próprio registro
CREATE POLICY "users_select_own"
ON users
FOR SELECT
TO authenticated
USING (users.clerk_id = public.clerk_user_id());

-- Policy: Admins podem ver todos os usuários
CREATE POLICY "users_select_admin"
ON users
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Policy: Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "users_update_own"
ON users
FOR UPDATE
TO authenticated
USING (users.clerk_id = public.clerk_user_id())
WITH CHECK (users.clerk_id = public.clerk_user_id());

-- Policy: Apenas admins podem criar/deletar usuários
CREATE POLICY "users_insert_admin"
ON users
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "users_delete_admin"
ON users
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =====================================================
-- TABELA: products
-- =====================================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas admins podem acessar a tabela products diretamente
CREATE POLICY "products_select_admin"
ON products
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "products_insert_admin"
ON products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin"
ON products
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "products_delete_admin"
ON products
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =====================================================
-- VIEW PÚBLICA: products_public
-- =====================================================
-- SEGURANÇA: Exclui original_link
-- Impossível vazar mesmo com SELECT *
-- =====================================================

CREATE OR REPLACE VIEW products_public AS
SELECT
  id,
  title,
  price_cny,
  affiliate_link,  -- ✅ CSSBuy link público
  -- original_link EXCLUÍDO - nunca vaza
  category_id,
  is_sold_out,
  image_main,
  image_hover,
  condition,
  has_box,
  has_charger,
  has_warranty,
  observations,
  created_at,
  view_count,
  card_click_count,
  purchase_click_count,
  card_ctr,
  purchase_ctr,
  broken_link_reports,
  out_of_stock_reports,
  seller_not_responding_reports,
  wrong_price_reports,
  other_reports,
  needs_validation
FROM products;

COMMENT ON VIEW products_public IS
'View pública de produtos SEM original_link. Use esta view para queries públicas.';

-- Grant acesso público à view
GRANT SELECT ON products_public TO public, authenticated;

-- =====================================================
-- VIEW PREMIUM: products_premium
-- =====================================================
-- SEGURANÇA: Retorna original_link apenas para premium/admin
-- =====================================================

CREATE OR REPLACE VIEW products_premium AS
SELECT
  p.*
FROM products p
WHERE public.is_premium();

COMMENT ON VIEW products_premium IS
'View de produtos COM original_link. Apenas para usuários premium/admin.';

-- Grant acesso autenticado à view
GRANT SELECT ON products_premium TO authenticated;

-- =====================================================
-- TABELA: product_categories
-- =====================================================

-- Habilitar RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Leitura pública
CREATE POLICY "product_categories_select_public"
ON product_categories
FOR SELECT
TO public
USING (true);

-- Policy: Apenas admins podem modificar
CREATE POLICY "product_categories_all_admin"
ON product_categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- TABELA: sellers
-- =====================================================

-- Habilitar RLS
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Policy: Leitura pública (TODOS podem ver vendedores)
CREATE POLICY "sellers_select_public"
ON sellers
FOR SELECT
TO public
USING (true);

-- Policy: Admins podem fazer tudo
CREATE POLICY "sellers_all_admin"
ON sellers
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- TABELA: seller_categories
-- =====================================================

-- Habilitar RLS
ALTER TABLE seller_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Leitura pública
CREATE POLICY "seller_categories_select_public"
ON seller_categories
FOR SELECT
TO public
USING (true);

-- Policy: Apenas admins podem modificar
CREATE POLICY "seller_categories_all_admin"
ON seller_categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =====================================================
-- TABELA: product_reports
-- =====================================================

-- Habilitar RLS
ALTER TABLE product_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Inserção pública (qualquer um pode reportar)
CREATE POLICY "product_reports_insert_public"
ON product_reports
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Usuários podem ver seus próprios reports
CREATE POLICY "product_reports_select_own"
ON product_reports
FOR SELECT
TO authenticated
USING (product_reports.user_id = public.clerk_user_id());

-- Policy: Admins podem ver todos os reports
CREATE POLICY "product_reports_select_admin"
ON product_reports
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Policy: Admins podem deletar reports
CREATE POLICY "product_reports_delete_admin"
ON product_reports
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =====================================================
-- TABELA: seller_reports
-- =====================================================

-- Habilitar RLS
ALTER TABLE seller_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Inserção pública (qualquer um pode reportar)
CREATE POLICY "seller_reports_insert_public"
ON seller_reports
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Usuários podem ver seus próprios reports
CREATE POLICY "seller_reports_select_own"
ON seller_reports
FOR SELECT
TO authenticated
USING (seller_reports.user_id = public.clerk_user_id());

-- Policy: Admins podem ver todos os reports
CREATE POLICY "seller_reports_select_admin"
ON seller_reports
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Policy: Admins podem deletar reports
CREATE POLICY "seller_reports_delete_admin"
ON seller_reports
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =====================================================
-- TABELA: user_favorites
-- =====================================================

-- Habilitar RLS
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seus próprios favoritos
CREATE POLICY "user_favorites_select_own"
ON user_favorites
FOR SELECT
TO authenticated
USING (user_favorites.user_id = public.clerk_user_id());

-- Policy: Usuários podem inserir apenas favoritos para si mesmos
CREATE POLICY "user_favorites_insert_own"
ON user_favorites
FOR INSERT
TO authenticated
WITH CHECK (user_favorites.user_id = public.clerk_user_id());

-- Policy: Usuários podem deletar apenas seus próprios favoritos
CREATE POLICY "user_favorites_delete_own"
ON user_favorites
FOR DELETE
TO authenticated
USING (user_favorites.user_id = public.clerk_user_id());

-- Policy: Admins podem ver todos os favoritos
CREATE POLICY "user_favorites_select_admin"
ON user_favorites
FOR SELECT
TO authenticated
USING (public.is_admin());

-- =====================================================
-- TABELA: seller_favorites
-- =====================================================

-- Habilitar RLS
ALTER TABLE seller_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seus próprios favoritos
CREATE POLICY "seller_favorites_select_own"
ON seller_favorites
FOR SELECT
TO authenticated
USING (seller_favorites.user_id = public.clerk_user_id());

-- Policy: Usuários podem inserir apenas favoritos para si mesmos
CREATE POLICY "seller_favorites_insert_own"
ON seller_favorites
FOR INSERT
TO authenticated
WITH CHECK (seller_favorites.user_id = public.clerk_user_id());

-- Policy: Usuários podem deletar apenas seus próprios favoritos
CREATE POLICY "seller_favorites_delete_own"
ON seller_favorites
FOR DELETE
TO authenticated
USING (seller_favorites.user_id = public.clerk_user_id());

-- Policy: Admins podem ver todos os favoritos
CREATE POLICY "seller_favorites_select_admin"
ON seller_favorites
FOR SELECT
TO authenticated
USING (public.is_admin());

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se todas as tabelas têm RLS habilitado
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
      'users', 'products', 'product_categories', 'sellers', 'seller_categories',
      'product_reports', 'seller_reports', 'user_favorites', 'seller_favorites'
    )
  LOOP
    IF NOT (
      SELECT relrowsecurity
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE c.relname = r.tablename
      AND n.nspname = 'public'
    ) THEN
      RAISE WARNING 'RLS não habilitado em: %', r.tablename;
    ELSE
      RAISE NOTICE 'RLS habilitado em: %', r.tablename;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- GUIA DE USO DAS VIEWS
-- =====================================================

-- 1. QUERIES PÚBLICAS (não-autenticados ou usuários normais):
--    USE: products_public
--    Exemplo: SELECT * FROM products_public WHERE is_sold_out = false;
--    Resultado: NÃO contém original_link (seguro)

-- 2. QUERIES PREMIUM (usuários com is_premium = true):
--    USE: products_premium
--    Exemplo: SELECT * FROM products_premium WHERE id = 'xxx';
--    Resultado: Contém original_link SE public.is_premium() = true

-- 3. QUERIES ADMIN (Server Actions com Service Role):
--    USE: products (tabela direta)
--    Exemplo: SELECT * FROM products WHERE id = 'xxx';
--    Resultado: Contém TUDO (bypassa RLS com Service Role Key)

-- =====================================================
-- AVISOS IMPORTANTES
-- =====================================================

-- 1. PROTEÇÃO DE original_link (CRÍTICO):
--    ✅ products_public VIEW exclui original_link
--    ✅ Impossível vazar com SELECT *
--    ✅ Código deve usar products_public para queries públicas
--    ✅ Admins usam tabela products direta (Service Role Key)

-- 2. SERVICE ROLE KEY:
--    - Bypassa TODAS as policies e RLS
--    - NUNCA expor no client-side
--    - Usar APENAS em Server Actions/API Routes
--    - Com Service Role: acessa tabela products direta
--    - Com Anon Key: acessa apenas views públicas

-- 3. CLERK INTEGRATION:
--    - JWT claims vêm como TEXT (não UUID)
--    - Função public.clerk_user_id() extrai do JWT
--    - Funções SECURITY DEFINER permitem acesso a users table

-- 4. TESTING OBRIGATÓRIO:
--    a) Não-autenticado:
--       - SELECT * FROM products_public → OK
--       - SELECT * FROM products → ERRO (RLS bloqueia)
--    b) Usuário normal:
--       - SELECT * FROM products_public → OK
--       - SELECT * FROM products_premium → VAZIO (não é premium)
--    c) Usuário premium:
--       - SELECT * FROM products_premium → OK (retorna original_link)
--    d) Admin:
--       - SELECT * FROM products → OK (full access)

-- 5. MIGRAÇÃO DO CÓDIGO:
--    - Atualizar src/app/actions.ts:
--      * getPublicProducts() → usar products_public
--    - Server Actions de admin continuam usando products direta
--    - API públicas devem usar products_public

-- =====================================================
-- CHECKLIST PRÉ-PRODUÇÃO
-- =====================================================

-- [ ] RLS habilitado em todas as 9 tabelas core
-- [ ] Views criadas (products_public, products_premium)
-- [ ] Grants configurados (public, authenticated)
-- [ ] Funções helper testadas (clerk_user_id, is_admin, is_premium)
-- [ ] Código atualizado para usar products_public
-- [ ] Testes com diferentes níveis de usuário
-- [ ] Verificado que original_link NUNCA vaza em products_public
-- [ ] Service Role Key segura (não exposta)
-- [ ] Anon Key configurada (se usado no client)

-- =====================================================
-- FIM
-- =====================================================
