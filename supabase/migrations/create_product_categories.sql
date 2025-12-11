-- Criar tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir categorias específicas de tecnologia
INSERT INTO product_categories (name, slug) VALUES
  ('Áudio', 'audio'),
  ('Celulares', 'celulares'),
  ('Consoles', 'consoles'),
  ('iPhones', 'iphones'),
  ('Mac Minis', 'mac-minis'),
  ('Macbooks', 'macbooks'),
  ('Notebooks', 'notebooks'),
  ('PCs Portáteis', 'pcs-portateis'),
  ('Peças PC', 'pecas-pc'),
  ('Periféricos', 'perifericos'),
  ('Produtos Apple', 'produtos-apple'),
  ('Vídeo', 'video'),
  ('Smartwatches', 'smartwatches'),
  ('Tablets', 'tablets'),
  ('Fones de Ouvido', 'fones-ouvido'),
  ('Câmeras', 'cameras'),
  ('Drones', 'drones'),
  ('Acessórios Tech', 'acessorios-tech'),
  ('Gaming', 'gaming'),
  ('Outros', 'outros')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES product_categories(id);

ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_product_categories"
  ON product_categories FOR SELECT
  USING (true);

CREATE POLICY "admin_manage_product_categories"
  ON product_categories FOR ALL
  USING (
    (SELECT is_admin FROM users WHERE clerk_id = auth.jwt() ->> 'sub') = true
  );
