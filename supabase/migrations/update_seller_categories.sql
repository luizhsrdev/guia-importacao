-- Deletar categorias antigas de vendedores
DELETE FROM seller_categories;

-- Inserir mesmas categorias dos produtos
INSERT INTO seller_categories (name, slug) VALUES
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
