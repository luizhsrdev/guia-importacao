# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

**Guia Importação Xianyu** - A freemium platform for curating Chinese marketplace products with premium access (PIX payment) to seller ratings.

**Business Model:**
- Free: Product catalog with CSSBuy affiliate links (commission revenue)
- Premium (R$ 89,90 one-time PIX): Access to Gold/Blacklist seller directories

## Critical Security Rules

### Link Privacy (ABSOLUTE PRIORITY)
- **NEVER** expose `original_link` field in public API responses or frontend renders
- **ONLY** admins can view `original_link` via admin panel
- Always verify RLS policies before any database schema changes
- Test in Network tab that `original_link` never appears in public endpoints

### Route Protection Pattern
The app uses a dual-check system for protected routes:
1. **Middleware** (`src/middleware.ts`): Basic Clerk authentication for all non-public routes
2. **API Route Checks**:
   - `/api/check-admin` - Verifies `is_admin=true` in Supabase users table
   - `/api/check-premium` - Verifies `is_premium=true` or `is_admin=true`
3. **Client-side checks**: Components fetch these endpoints and conditionally render

Protected routes:
- `/premium` → Requires `is_premium=true`
- `/admin/*` → Requires `is_admin=true`
- `/api/webhooks/*` → Must validate signature (Mercado Pago)

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Auth**: Clerk (Google + Email/Password + Magic Link)
- **Database**: Supabase (PostgreSQL with RLS policies)
- **Payments**: Mercado Pago SDK (PIX priority, credit card fallback)
- **Images**: Cloudinary (server-side signed uploads)
- **Styling**: Tailwind CSS
- **Deploy**: Vercel

## Architecture Patterns

### Server Components & Server Actions
- **Default to Server Components** - only use `'use client'` when necessary (interactivity, hooks, browser APIs)
- **Server Actions for mutations** - Files with `'use server'` directive at top:
  - `src/app/actions.ts` - Global actions (product filtering)
  - `src/app/admin/products/actions.ts` - Product CRUD
  - `src/app/admin/sellers/actions.ts` - Seller CRUD
- **No API routes for CRUD** - Server Actions handle all data mutations directly
- All Server Actions use `revalidatePath()` after mutations to update cached data

### Image Upload Flow (Cloudinary)
**IMPORTANT**: Environment variables must NOT have `NEXT_PUBLIC_` prefix (server-side only):
```env
CLOUDINARY_CLOUD_NAME=xxx  # NOT NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

**Upload Pattern:**
1. Client converts image to base64 (browser FileReader API)
2. Client calls Server Action with base64 string
3. Server Action uploads to Cloudinary with credentials
4. Returns Cloudinary URL to save in database

**Files:**
- `src/lib/cloudinary.ts` - Cloudinary config with debug logs
- `src/app/admin/products/actions.ts:uploadImageToCloudinary()` - Single image upload
- `src/app/admin/sellers/actions.ts:uploadEvidenceImages()` - Multiple images (blacklist evidence)

**Troubleshooting:**
- Server must be restarted after changing `.env.local`
- Check terminal for "Configurando Cloudinary..." logs showing all credentials as "Definido"
- Test page at `/admin/test-upload` validates configuration
- Max upload size: 10MB (configured in `next.config.ts`)

### Supabase Usage
- **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`): ONLY in Server Components/Actions - bypasses RLS
- **Anon Key** (not yet implemented): For client-side queries - respects RLS
- **Client**: `src/lib/supabase.ts` exports configured client
- All tables MUST have RLS policies enabled before production

### Authentication Flow (Clerk + Supabase)
1. User signs up/in via Clerk
2. Clerk webhook creates user in Supabase `users` table with `clerk_id`
3. User permissions (`is_admin`, `is_premium`) stored in Supabase
4. Protected routes check Supabase for permissions via `clerk_id`

## Code Standards

### TypeScript
- No `any` types - use explicit types or `unknown`
- Define interfaces for Supabase table data (see Server Action files for examples)
- Server Action parameters must be serializable (no functions, classes, etc.)

### Tailwind Design System
**Colors:**
- Background: `#0F0F0F` (near-black)
- Primary: `#00ff9d` (neon green)
- Text: Inherit from tailwind defaults

**Patterns:**
- Use components for repeated UI patterns (see `src/components/`)
- Avoid complex inline class strings - extract to components
- Use `@apply` in CSS for repeated utility combinations

### File Structure
```
src/
├── app/
│   ├── (auth)/          # Route group for sign-in/sign-up
│   ├── admin/           # Admin panel (products, sellers, test pages)
│   ├── api/             # API routes (check-admin, check-premium)
│   ├── vendedores/      # Premium sellers directory
│   ├── actions.ts       # Global Server Actions
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # Shared React components
│   ├── ProductCard.tsx
│   ├── ProductForm.tsx
│   ├── SellerCard.tsx
│   ├── SellerForm.tsx
│   └── ...
└── lib/                 # Utilities and configs
    ├── cloudinary.ts
    ├── mercadopago.ts
    └── supabase.ts
```

## Development Commands

**Start dev server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
```

**Run linter:**
```bash
npm run lint
```

**Database migrations:**
- Execute SQL files in `supabase/migrations/` via Supabase SQL Editor
- No CLI-based migrations setup yet

## Testing Checklist Before Commits

1. **Security**: Verify `original_link` doesn't appear in browser Network tab
2. **Routes**: Test middleware protection for `/admin` and `/premium` routes
3. **RLS**: Validate Supabase RLS policies in Dashboard
4. **TypeScript**: Run `npm run build` - must complete without errors
5. **Images**: If touching Cloudinary code, test upload flow and check terminal logs

## Database Schema Key Points

**Tables:**
- `users` - Clerk ID, premium status, admin flag
- `products` - Has both `affiliate_link` (public) and `original_link` (admin-only)
- `product_categories` - Product categories with emoji icons
- `sellers` - Gold list and blacklist with evidence images
- `seller_niches` - Seller specialization categories
- `payments` - Mercado Pago transaction records

**Critical RLS Policy:**
```sql
-- Products: Public can read, but original_link must be filtered client-side for non-admins
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "admin_full_access" ON products FOR ALL USING (
  (SELECT is_admin FROM users WHERE clerk_id = auth.jwt() ->> 'sub') = true
);
```

## Environment Variables

See `.env.example` for complete list. Key variables:

**Clerk:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Cloudinary (NO NEXT_PUBLIC_ prefix):**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

**Mercado Pago:**
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`

## Key Files to Reference

- `plan.md` - Complete PRD with user stories and flow diagrams
- `TROUBLESHOOTING_UPLOAD.md` - Comprehensive Cloudinary upload debugging guide
- `.env.example` - Environment variable template
