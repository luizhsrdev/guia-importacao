# Setup: Sistema de Reports e Favoritos para Vendedores

## 🔧 O que foi feito:

1. ✅ **Componentes Genéricos Criados**:
   - `ReportAndFavoriteMenu.tsx` - Menu reutilizável para produtos E vendedores
   - `FavoriteBadge.tsx` - Badge de favorito reutilizável

2. ✅ **APIs Criadas**:
   - `/api/sellers/report/route.ts` - Report de vendedores
   - `/api/seller-favorites/route.ts` - Favoritos de vendedores

3. ✅ **Hook Criado**:
   - `useSellerFavorites.ts` - Gerenciamento de estado

4. ✅ **SellerCard Atualizado**:
   - Integrado com componentes genéricos
   - Menu de três pontos
   - Badge de favorito

5. ✅ **SQL Migration Preparado**:
   - `supabase/migrations/create_seller_reports_and_favorites.sql`

---

## 📋 O QUE VOCÊ PRECISA FAZER:

### **PASSO 1: Executar SQL no Supabase**

1. Acesse o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (ícone de banco de dados na sidebar)
4. Clique em **New Query**
5. Cole o conteúdo completo do arquivo: `supabase/migrations/create_seller_reports_and_favorites.sql`
6. Clique em **RUN** (ou pressione `Cmd/Ctrl + Enter`)
7. **Aguarde a confirmação**: "Success. No rows returned"

**O que esse SQL faz:**
- Cria tabela `seller_reports`
- Cria tabela `seller_favorites`
- Adiciona colunas de contadores na tabela `sellers`:
  - `broken_link_reports`
  - `seller_not_responding_reports`
  - `other_reports`
  - `needs_validation`
- Cria função `report_seller_issue()`
- Configura RLS (Row Level Security)

---

### **PASSO 2: Verificar se funcionou**

Execute este SQL para verificar:

```sql
-- Verificar se tabelas foram criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('seller_reports', 'seller_favorites');

-- Verificar se colunas foram adicionadas
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'sellers'
AND column_name IN ('broken_link_reports', 'seller_not_responding_reports', 'other_reports', 'needs_validation');

-- Verificar se função foi criada
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'report_seller_issue';
```

**Resultado esperado:**
- 2 tabelas encontradas
- 4 colunas encontradas
- 1 função encontrada

---

### **PASSO 3: Testar na interface**

1. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse a página `/vendedores`

3. Faça login (se ainda não estiver logado)

4. **Teste o menu de três pontos**:
   - Passe o mouse sobre um card de vendedor
   - Clique no menu de três pontos (⋮) no canto superior direito
   - Deve aparecer: "Favoritar" e "Reportar"

5. **Teste favoritar**:
   - Clique em "Favoritar"
   - Deve aparecer uma estrela amarela no canto superior esquerdo
   - Toast de sucesso deve aparecer

6. **Teste reportar**:
   - Clique em "Reportar"
   - Escolha uma opção:
     - "Link Quebrado/Não Funciona" → Envia imediatamente
     - "Vendedor não responde" → Envia imediatamente
     - "Outro motivo" → Abre modal para descrição
   - Toast de sucesso deve aparecer

---

## 🐛 Possíveis Erros e Soluções:

### **Erro: "relation 'seller_reports' does not exist"**
**Causa:** SQL não foi executado
**Solução:** Execute o PASSO 1 novamente

### **Erro: "column 'broken_link_reports' does not exist"**
**Causa:** ALTER TABLE não funcionou (talvez coluna já exista)
**Solução:** Verifique se as colunas já existem:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name = 'sellers';
```

### **Erro: "function report_seller_issue does not exist"**
**Causa:** Função SQL não foi criada
**Solução:** Execute apenas a parte CREATE FUNCTION do SQL

### **Erro: "Erro ao enviar report" (no toast)**
**Causa:** API retornou erro
**Solução:**
1. Abra o DevTools (F12)
2. Vá na aba Network
3. Tente reportar novamente
4. Clique na requisição `/api/sellers/report`
5. Veja a resposta (Response tab)
6. Me envie o erro exato

### **Erro: "Faça login para favoritar vendedores"**
**Causa:** Você não está logado
**Solução:** Faça login primeiro

---

## 📊 Estrutura do Banco de Dados:

### Tabela: `seller_reports`
```
id                              UUID (PK)
seller_id                       UUID (FK → sellers.id)
user_id                         TEXT (Clerk ID, pode ser null)
user_ip                         TEXT
report_type                     TEXT ('broken_link', 'seller_not_responding', 'other')
description                     TEXT (obrigatório se report_type = 'other')
created_at                      TIMESTAMP
```

### Tabela: `seller_favorites`
```
id                              UUID (PK)
user_id                         TEXT (Clerk ID)
seller_id                       UUID (FK → sellers.id)
created_at                      TIMESTAMP
UNIQUE(user_id, seller_id)
```

### Tabela: `sellers` (colunas adicionadas)
```
broken_link_reports             INTEGER DEFAULT 0
seller_not_responding_reports   INTEGER DEFAULT 0
other_reports                   INTEGER DEFAULT 0
needs_validation                BOOLEAN DEFAULT false
```

---

## ✅ Checklist Final:

- [ ] SQL executado no Supabase
- [ ] Tabelas verificadas (seller_reports, seller_favorites)
- [ ] Colunas verificadas na tabela sellers
- [ ] Função SQL verificada (report_seller_issue)
- [ ] Servidor reiniciado (npm run dev)
- [ ] Menu de três pontos aparece ao passar o mouse
- [ ] Favoritar funciona (estrela amarela aparece)
- [ ] Reportar funciona (toast de sucesso)
- [ ] Modal de "Outro motivo" funciona

---

## 🎯 Próximos Passos (se tudo funcionar):

1. Criar página admin para ver reports de vendedores (similar a `/admin/reported-products`)
2. Adicionar notificações de reports para admins
3. Implementar filtros por tipo de report

---

**Dúvidas?** Me envie o erro exato que está acontecendo! 🚀
