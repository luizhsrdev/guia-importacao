# 🎯 PRD - Plataforma Xianyu (Next.js 14+ Stack)

## 🧠 Seu Papel
Você é um **Desenvolvedor Full-Stack Sênior** especializado em **Next.js 14+ App Router, TypeScript, Clerk, Supabase e Mercado Pago**. Construa o MVP desta plataforma Freemium de curadoria de produtos da China.

---

## 📖 1. CONTEXTO E MODELO DE NEGÓCIO

### Problema
Usuários brasileiros compram da China (Xianyu + CSSBuy) mas:
- ❌ Não identificam vendedores confiáveis vs. golpistas
- ❌ Perdem dinheiro com má qualidade
- ❌ Não têm curadoria de produtos

### Solução Freemium
**Gratuito:** Lista de produtos com links de afiliado CSSBuy (receita por comissão).
**Premium (R$ 89,90 vitalício - PIX):** Acesso a:
- 🥇 Lista Dourada de vendedores confiáveis
- ❌ Blacklist de golpistas (com provas)

### Regra Crítica
Links originais do Xianyu e perfis de vendedores **NUNCA** são expostos a usuários não-admin.

---

## 🛠️ 2. STACK TECNOLÓGICA

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 14+ (App Router, RSC, Server Actions) |
| Auth | Clerk (Google, Email, Magic Link, webhooks) |
| Database | Supabase (PostgreSQL + RLS) |
| Pagamentos | Mercado Pago SDK (PIX + Cartão) |
| Imagens | Cloudinary |
| Deploy | Vercel |

---

## 🗄️ 3. ESTRUTURA DE DADOS (Supabase)

### 3.1 users
id UUID PRIMARY KEY
email TEXT UNIQUE
clerk_id TEXT UNIQUE -- Sincronizado via webhook
is_admin BOOLEAN DEFAULT false
is_premium BOOLEAN DEFAULT false
accepted_terms BOOLEAN DEFAULT false
accepted_terms_date TIMESTAMPTZ
created_at TIMESTAMPTZ DEFAULT NOW()

text

**RLS Policy:**
-- Usuários só leem seus próprios dados
CREATE POLICY "users_read_own" ON users FOR SELECT USING (clerk_id = auth.jwt() ->> 'sub');
-- Admin lê tudo
CREATE POLICY "admin_read_all" ON users FOR SELECT USING ((SELECT is_admin FROM users WHERE clerk_id = auth.jwt() ->> 'sub') = true);

text

### 3.2 products
id UUID PRIMARY KEY
title TEXT NOT NULL
price_cny TEXT
image_main TEXT -- Cloudinary URL
image_hover TEXT -- Efeito mouseover
affiliate_link TEXT NOT NULL -- Público
original_link TEXT NOT NULL -- Privado (admin only)
category_id UUID REFERENCES product_categories(id)
is_sold_out BOOLEAN DEFAULT false
created_at TIMESTAMPTZ DEFAULT NOW()

text

**RLS Policy (Crítica):**
-- Usuários públicos NUNCA veem original_link
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
-- Admin vê tudo
CREATE POLICY "admin_full_access" ON products FOR ALL USING ((SELECT is_admin FROM users WHERE clerk_id = auth.jwt() ->> 'sub') = true);

text

### 3.3 product_categories EVITE EMOJIS
id UUID PRIMARY KEY
name TEXT
slug TEXT UNIQUE


text

### 3.4 sellers (Premium)
id UUID PRIMARY KEY
name TEXT NOT NULL
status TEXT CHECK (status IN ('gold', 'blacklist'))
niche_id UUID REFERENCES seller_niches(id)
notes TEXT -- Para 'gold'
rating TEXT
affiliate_link TEXT
blacklist_reason TEXT -- Para 'blacklist'
evidence_images JSONB -- Array de URLs
created_at TIMESTAMPTZ DEFAULT NOW()

text

**RLS Policy:**
-- Apenas premium lê
CREATE POLICY "sellers_premium_only" ON sellers FOR SELECT USING ((SELECT is_premium FROM users WHERE clerk_id = auth.jwt() ->> 'sub') = true);

text

### 3.5 seller_niches
id UUID PRIMARY KEY
name TEXT
slug TEXT UNIQUE

text

### 3.6 comments (MVP)
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
product_id UUID REFERENCES products(id)
rating INTEGER CHECK (rating BETWEEN 1 AND 5)
delivery_days INTEGER
product_quality TEXT
declared_value DECIMAL
tax_paid DECIMAL
additional_notes TEXT
liability_waiver BOOLEAN DEFAULT true
is_approved BOOLEAN DEFAULT true
created_at TIMESTAMPTZ DEFAULT NOW()

text

### 3.7 payments
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
mercadopago_id TEXT UNIQUE
amount DECIMAL
status TEXT CHECK (status IN ('pending', 'approved', 'rejected'))
created_at TIMESTAMPTZ DEFAULT NOW()

text

---

## 📋 4. REQUISITOS FUNCIONAIS

### Legal
**US-01:** Modal de Termos obrigatório no primeiro acesso (localStorage + banco).
**US-02:** Footer persistente: "⚠️ Não vendemos produtos. Não realizamos envios."

### Home Pública
**US-03:** Carrossel de categorias (filtro AJAX via Server Actions).
**US-04:** Grid de produtos:
- Hover: `image_main` → `image_hover` (fade transition 0.3s).
- Sold Out: grayscale + opacidade 0.6 + badge vermelho.
**US-05:** Bloco de Upsell Premium fixo no fim da página.

### Comentários
**US-06:** Visualizar comentários (estatísticas + lista).
**US-07:** Criar comentário (usuário logado):
- Campos: Entrega (dias), Qualidade, Cotação, Valor declarado, Taxa.
- Checkbox: "Assumo responsabilidade pelas informações".

### Autenticação (Clerk)
**US-08:** Login opcional para navegação (obrigatório para Premium).
**US-09:** Métodos: Email/Senha, Google, Magic Link.

### Pagamento (PIX)
**US-10:** Checkout → Cria preferência Mercado Pago (PIX).
**US-11:** Webhook `/api/webhooks/mercadopago` → Atualiza `is_premium = true`.

**Fluxo:**
graph TD
A[Usuário clica Comprar] --> B{Autenticado?}
B -- Não --> C[/sign-in]
B -- Sim --> D[/api/create-payment]
D --> E[MP SDK: Cria Preferência PIX]
E --> F[Retorna init_point]
F --> G[Redirect Checkout MP]
G --> H[Usuário paga PIX]
H --> I[Webhook: /api/webhooks/mercadopago]
I --> J[Valida assinatura]
J --> K[UPDATE users SET is_premium=true]
K --> L[Acesso /premium liberado]

text

### Área Premium
**US-12:** Middleware protege `/premium` (verificar `is_premium`).
**US-13:** Duas abas:
- 🥇 Lista Dourada: Cards com `sellers.status='gold'` + `affiliate_link`.
- ❌ Blacklist: `sellers.status='blacklist'` + `blacklist_reason` + `evidence_images`.
**US-14:** Filtros por nicho (Server Action).

### Admin (Painel Next.js)
**US-15:** Rota `/admin` protegida (`is_admin=true`).
**US-16:** CRUD de Produtos:
- Upload Cloudinary (`image_main`, `image_hover`).
- Botão "Verificar Xianyu" (abre `original_link` em nova aba).
- Toggle `is_sold_out`.
**US-17:** CRUD de Vendedores (Gold/Blacklist).

---

## 🎨 5. DESIGN SYSTEM (Tailwind)

// tailwind.config.ts
export default {
theme: {
extend: {
colors: {
background: '#0F0F0F',
surface: '#1A1A1A',
primary: '#00ff9d',
danger: '#FF455F',
textMain: '#E0E0E0',
textSecondary: '#888888',
},
fontFamily: {
sans: ['Inter', 'system-ui'],
},
},
},
}

text

**ProductCard (hover effect):**
.product-card {
@apply bg-surface rounded-xl p-4 border border-transparent transition-all duration-300;
}
.product-card:hover {
@apply -translate-y-2 shadow-[0_12px_32px_rgba(0,255,157,0.25)] border-primary;
}
.product-card img.default {
@apply absolute inset-0 opacity-100 transition-opacity duration-300;
}
.product-card img.hover {
@apply absolute inset-0 opacity-0 transition-opacity duration-300;
}
.product-card:hover img.default { @apply opacity-0; }
.product-card:hover img.hover { @apply opacity-100; }
.sold-out { @apply opacity-60 grayscale pointer-events-none; }

text

---

## 🏗️ 6. ARQUITETURA

xianyu-platform/
├── app/
│ ├── (auth)/
│ │ ├── sign-in/[[...sign-in]]/page.tsx
│ │ └── sign-up/[[...sign-up]]/page.tsx
│ ├── (public)/
│ │ ├── page.tsx # Home
│ │ └── layout.tsx # Modal Termos
│ ├── premium/
│ │ ├── page.tsx # Lista Dourada + Blacklist
│ │ └── layout.tsx # Middleware protection
│ ├── admin/
│ │ ├── products/page.tsx
│ │ ├── sellers/page.tsx
│ │ └── layout.tsx
│ ├── api/
│ │ ├── create-payment/route.ts
│ │ ├── webhooks/
│ │ │ ├── clerk/route.ts
│ │ │ └── mercadopago/route.ts
│ │ └── products/route.ts # Filtros AJAX
│ ├── layout.tsx # ClerkProvider
│ └── globals.css
├── components/
│ ├── ProductCard.tsx
│ ├── CategoryCarousel.tsx
│ ├── TermsModal.tsx
│ └── SellerCard.tsx
├── lib/
│ ├── supabase.ts
│ ├── cloudinary.ts
│ └── mercadopago.ts
├── middleware.ts # Clerk + proteção rotas
├── supabase/
│ ├── migrations/
│ └── seed.sql
└── .env.local

text

---

## 🔐 7. SEGURANÇA

### 7.1 RLS Policies (Supabase)
-- Proteger original_link
CREATE POLICY "hide_original_link" ON products FOR SELECT USING (
auth.jwt() ->> 'sub' IN (SELECT clerk_id FROM users WHERE is_admin = true)
);

-- Proteger sellers (premium only)
CREATE POLICY "premium_sellers" ON sellers FOR SELECT USING (
auth.jwt() ->> 'sub' IN (SELECT clerk_id FROM users WHERE is_premium = true)
);

text

### 7.2 Webhook Mercado Pago (Validação)
// app/api/webhooks/mercadopago/route.ts
import crypto from 'crypto';

export async function POST(req: Request) {
const signature = req.headers.get('x-signature');
const requestId = req.headers.get('x-request-id');
const body = await req.text();

const hash = crypto
.createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET!)
.update(body)
.digest('hex');

if (hash !== signature) {
return Response.json({ error: 'Invalid signature' }, { status: 403 });
}

// Processar pagamento...
const data = JSON.parse(body);
if (data.type === 'payment' && data.action === 'payment.updated') {
const payment = await fetch(https://api.mercadopago.com/v1/payments/${data.data.id}, {
headers: { Authorization: Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN} }
}).then(r => r.json());

text
if (payment.status === 'approved') {
  // Atualizar Supabase
  await supabase.from('users').update({ is_premium: true }).eq('id', payment.metadata.user_id);
}
}

return Response.json({ ok: true });
}

text

### 7.3 Middleware (Proteção de Rotas)
// middleware.ts
import { authMiddleware } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

export default authMiddleware({
publicRoutes: ['/', '/api/webhooks/(.*)'],
async afterAuth(auth, req) {
if (!auth.userId && req.nextUrl.pathname.startsWith('/premium')) {
return Response.redirect(new URL('/sign-in', req.url));
}

text
// Verificar is_premium
if (req.nextUrl.pathname.startsWith('/premium')) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data } = await supabase.from('users').select('is_premium').eq('clerk_id', auth.userId).single();
  
  if (!data?.is_premium) {
    return Response.redirect(new URL('/checkout', req.url));
  }
}
}
});

text

---

## 🚀 8. CRONOGRAMA (ETAPAS)

### Etapa 1: Setup (1-2h)
1. Criar projeto Next.js: `npx create-next-app@latest --typescript --tailwind --app`
2. Instalar deps:
npm i @clerk/nextjs @supabase/supabase-js mercadopago cloudinary

text
3. Configurar Clerk (https://clerk.com):
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

text
4. Criar projeto Supabase (https://supabase.com):
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

text
5. Executar migrations (SQL Editor do Supabase):
-- Copiar estrutura da Seção 3

text
6. Configurar RLS Policies (Seção 7.1)

**Meta:** `npm run dev` funciona, autenticação Clerk OK.

**🛑 PARAR E VALIDAR**

---

### Etapa 2: Admin Panel (3-4h)
1. Criar `/app/admin/products/page.tsx`:
- Form com upload Cloudinary
- Botão "Verificar Xianyu"
- Toggle `is_sold_out`
2. Criar `/app/admin/sellers/page.tsx`:
- Form condicional (Gold vs Blacklist)
- Upload múltiplo de provas
3. Middleware: Bloquear se `is_admin=false`

**Meta:** Admin cria produto com 2 imagens + vendedor Gold/Blacklist.

**🛑 PARAR E VALIDAR**

---

### Etapa 3: Frontend Público (4-5h)
1. Criar `/app/(public)/page.tsx`:
- Modal de Termos (localStorage)
- CategoryCarousel (scroll horizontal)
- ProductGrid (efeito hover)
2. Criar Server Action `/app/api/products/route.ts`:
export async function GET(req: Request) {
const { searchParams } = new URL(req.url);
const category = searchParams.get('category');

let query = supabase.from('products').select('*').eq('is_sold_out', false);
if (category !== 'todos') {
query = query.eq('category_id', category);
}

const { data } = await query;
return Response.json({ products: data });
}

text
3. Implementar CSS (Seção 5)

**Meta:** Home linda, filtros AJAX funcionais, hover perfeito.

**🛑 PARAR E VALIDAR**

---

### Etapa 4: Premium + Pagamento (4-5h)
1. Criar `/app/api/create-payment/route.ts`:
import mercadopago from 'mercadopago';

mercadopago.configure({ access_token: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(req: Request) {
const { userId } = await req.json();

const preference = {
items: [{
title: 'Acesso Premium Vitalício',
unit_price: 9.90,
quantity: 1
}],
payment_methods: {
excluded_payment_types: [{ id: 'credit_card' }], // Apenas PIX
},
back_urls: {
success: ${process.env.NEXT_PUBLIC_URL}/checkout/sucesso,
failure: ${process.env.NEXT_PUBLIC_URL}/checkout/erro
},
notification_url: ${process.env.NEXT_PUBLIC_URL}/api/webhooks/mercadopago,
metadata: { user_id: userId }
};

const response = await mercadopago.preferences.create(preference);
return Response.json({ init_point: response.body.init_point });
}

text
2. Implementar webhook (Seção 7.2)
3. Criar `/app/premium/page.tsx`:
- Tabs (Lista Dourada / Blacklist)
- Filtros por nicho

**Meta:** Compra PIX funcional, `is_premium` atualiza, área premium acessível.

**🛑 FINALIZAR MVP**

---

## 📝 9. VARIÁVEIS DE AMBIENTE

Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_WEBHOOK_SECRET=xxx

Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

App
NEXT_PUBLIC_URL=https://seu-dominio.vercel.app