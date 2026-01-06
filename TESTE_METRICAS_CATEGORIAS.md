# Teste de Métricas de Seleção de Categorias

## Checklist de Verificação

### 1. Verificar Função RPC no Supabase

Execute este SQL no SQL Editor do Supabase:

```sql
-- Verificar se a função existe
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'increment_category_selections';
```

**Resultado esperado:** Deve retornar 1 linha com o nome da função.

---

### 2. Verificar Colunas na Tabela

```sql
-- Verificar colunas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'product_categories'
AND column_name IN ('selection_count', 'last_selected_at')
ORDER BY column_name;
```

**Resultado esperado:**
- `last_selected_at` | timestamp with time zone | NULL
- `selection_count` | integer | 0

---

### 3. Testar a Função Manualmente

Primeiro, pegue um ID real de categoria:

```sql
-- Pegar IDs de categorias existentes
SELECT id, name FROM product_categories LIMIT 5;
```

Depois teste a função com um ID real:

```sql
-- SUBSTITUA 'seu-uuid-aqui' por um ID real da query acima
SELECT increment_category_selections('seu-uuid-aqui');

-- Verificar se funcionou
SELECT id, name, selection_count, last_selected_at
FROM product_categories
WHERE selection_count > 0
ORDER BY last_selected_at DESC;
```

**Resultado esperado:** A categoria testada deve ter `selection_count = 1` e `last_selected_at` com timestamp atual.

---

### 4. Limpar Dados de Teste (Opcional)

```sql
-- Resetar contadores para zero (CUIDADO: isso apaga todas as métricas!)
UPDATE product_categories
SET selection_count = 0, last_selected_at = NULL;
```

---

### 5. Testar no Site (Console do Navegador)

1. Abra o site em **localhost:3002** (ou sua porta)
2. Pressione **F12** para abrir o DevTools
3. Vá na aba **Console**
4. Clique em uma categoria no dropdown (Apple → iPhone, por exemplo)
5. Procure no console por mensagens que começam com `[ANALYTICS]`

**Mensagens esperadas:**
```
[ANALYTICS] Rastreando seleção de categoria: <uuid-da-categoria>
[ANALYTICS] Categoria rastreada com sucesso: <uuid> null
```

**Se aparecer erro:**
```
[ANALYTICS] Erro ao rastrear seleção de categoria: { categoryId: '...', error: '...', details: '...', hint: '...' }
```

Copie a mensagem de erro completa e me envie.

---

### 6. Verificar no Banco após Teste no Site

Depois de clicar em algumas categorias no site, execute:

```sql
-- Ver categorias mais selecionadas
SELECT
  id,
  name,
  emoji,
  selection_count,
  last_selected_at
FROM product_categories
WHERE selection_count > 0
ORDER BY selection_count DESC, last_selected_at DESC
LIMIT 10;
```

**Resultado esperado:** As categorias que você clicou devem aparecer com contadores maiores que zero.

---

### 7. Verificar Dashboard Admin

1. Faça login como admin
2. Abra o painel admin (botão de engrenagem vermelha no header)
3. Role até a seção "Top 5 Categorias"
4. Clique no botão "Atualizar Métricas"

**Resultado esperado:** Deve mostrar as 5 categorias mais clicadas com seus contadores.

---

## Problemas Comuns

### Erro: "function increment_category_selections(uuid) does not exist"

**Solução:** Execute novamente o script SQL completo que forneci anteriormente.

### Erro: "column 'selection_count' does not exist"

**Solução:** Execute a parte do script SQL que adiciona as colunas:

```sql
ALTER TABLE product_categories ADD COLUMN selection_count INTEGER DEFAULT 0;
ALTER TABLE product_categories ADD COLUMN last_selected_at TIMESTAMP WITH TIME ZONE;
```

### Logs aparecem mas banco não atualiza

**Solução:** Verifique se a função RPC tem `SECURITY DEFINER` e se as permissões estão corretas:

```sql
ALTER FUNCTION increment_category_selections(UUID) SECURITY DEFINER;
```

### Nenhum log aparece no console

**Solução:** Verifique se você está clicando para MARCAR a categoria, não para desmarcar. O tracking só acontece ao marcar.

---

## Status das Verificações

- [ ] Função RPC existe no banco
- [ ] Colunas existem na tabela
- [ ] Teste manual da função funcionou
- [ ] Logs aparecem no console do navegador
- [ ] Banco atualiza após cliques no site
- [ ] Dashboard admin mostra as métricas

---

## Comandos Úteis para Debug

```sql
-- Ver todas as funções relacionadas a analytics
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%increment%';

-- Ver estrutura completa da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'product_categories'
ORDER BY ordinal_position;

-- Contar quantas categorias têm seleções
SELECT COUNT(*) as total_com_selecoes
FROM product_categories
WHERE selection_count > 0;

-- Soma total de todas as seleções
SELECT SUM(selection_count) as total_selecoes
FROM product_categories;
```
