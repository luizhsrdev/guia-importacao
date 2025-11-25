# CLAUDE.md - Guia Importação Xianyu

## Contexto do Projeto
Plataforma Freemium de curadoria de produtos Xianyu com área Premium (PIX).

## 🚨 REGRAS CRÍTICAS DE SEGURANÇA

### Links Originais (PRIVACIDADE ABSOLUTA)
- **NUNCA** expor `original_link` em respostas JSON públicas
- **NUNCA** renderizar `original_link` em HTML público
- **APENAS** admins podem visualizar via painel admin
- Sempre verificar RLS policies antes de commit

### Proteção de Rotas
- `/premium` → Verificar `is_premium=true` no middleware
- `/admin` → Verificar `is_admin=true` no middleware
- Webhooks → Validar assinatura SEMPRE

## Stack Tecnológica
- **Framework**: Next.js 14+ App Router
- **Auth**: Clerk (JWT com template Supabase)
- **Database**: Supabase (PostgreSQL + RLS)
- **Pagamentos**: Mercado Pago (PIX prioritário)
- **Imagens**: Cloudinary
- **Deploy**: Vercel

## Padrões de Código

### TypeScript
- Evitar `any` - usar tipos explícitos
- Preferir interfaces para dados do Supabase
- Server Actions para mutações quando possível

### Next.js
- Server Components por padrão
- Client Components apenas quando necessário (`'use client'`)
- Server Actions para filtros AJAX (não API routes)

### Tailwind
- Seguir design system (cores: background #0F0F0F, primary #00ff9d)
- Evitar classes inline complexas - criar componentes
- Usar @apply para padrões repetidos

### Supabase
- Todas as tabelas devem ter RLS habilitado
- Service Role Key APENAS em Server Components/Actions
- Anon Key para cliente

## Estrutura de Desenvolvimento

### Workflow de Branches
- `main` → Produção
- `dev` → Desenvolvimento
- `feature/*` → Features específicas
- Commits descritivos em português

### Testes Antes de Commit
1. Verificar que `original_link` não aparece em Network tab
2. Testar middleware de proteção de rotas
3. Validar RLS policies no Supabase Dashboard
4. Verificar TypeScript sem erros (`npm run build`)

## Comandos Úteis
- Desenvolvimento: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Migrations Supabase: Via SQL Editor

## Referências
- PRD completo: `plan.md`
- Design system: Seção 5 do `plan.md`
