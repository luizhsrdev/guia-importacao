export interface Category {
  id: string;
  name: string;
  slug: string;
  // Analytics fields
  selection_count?: number;
  last_selected_at?: string;
}

interface ProductBase {
  id: string;
  title: string;
  price_cny: string;
  affiliate_link: string;
  is_sold_out: boolean;
  image_main: string;
  image_hover?: string;
  category_id?: string;
  category?: Category | Category[] | null;
  condition?: string;
  has_box?: boolean;
  has_charger?: boolean;
  has_warranty?: boolean;
  observations?: string;
  created_at?: string;
  // Analytics fields
  view_count?: number;
  card_click_count?: number;
  purchase_click_count?: number;
  card_ctr?: number;
  purchase_ctr?: number;
}

export interface Product extends ProductBase {
  original_link: string;
}

export type PublicProduct = ProductBase;

export type SellerStatus = 'gold' | 'blacklist';

export interface Seller {
  id: string;
  name: string;
  status: SellerStatus;
  category_id?: string;
  seller_categories?: { id?: string; name: string; slug?: string } | null;
  notes?: string;
  affiliate_link?: string;
  profile_link?: string;
  feedback_link?: string;
  image_url?: string;
  blacklist_reason?: string;
  proof_link?: string;
  evidence_images?: string[];
  created_at?: string;
}

export interface UserStatus {
  isAuthenticated: boolean;
  isPremium: boolean;
  isAdmin: boolean;
}

export const enum CacheTag {
  PRODUCTS = 'products',
  SELLERS = 'sellers',
  PAYMENTS = 'payments',
}

export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded';

export interface Payment {
  id: string;
  clerk_user_id: string;
  mercadopago_id: string | null;
  amount: number;
  status: PaymentStatus;
  idempotency_key: string;
  created_at: string;
  approved_at: string | null;
}

export interface ProcessedWebhook {
  id: string;
  webhook_id: string;
  type: string;
  action: string | null;
  processed_at: string;
}

export interface CreatePixResult {
  success: boolean;
  qrCode?: string;
  qrCodeBase64?: string;
  copyPaste?: string;
  paymentId?: string;
  expirationDate?: string;
  error?: string;
}

export interface MercadoPagoWebhookPayload {
  action: string;
  api_version: string;
  data: { id: string };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

export interface ImportCalculationInput {
  productPriceCny: number;
  shippingCny: number;
  exchangeRateCnyToBrl: number;
  serviceFeePercent: number;
  productValueUsd: number;
  isRemessaConforme: boolean;
}

export interface ImportCalculationResult {
  productBrl: number;
  shippingBrl: number;
  serviceFee: number;
  subtotal: number;
  iof: number;
  icms: number;
  importTax: number;
  totalBrl: number;
}

export type ShippingRouteType = 'volumetric' | 'pure_weight';

export type VIPLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface ShippingRoute {
  id: string;
  name: string;
  type: ShippingRouteType;
  firstWeight: number;
  secondWeight: number;
  increment: number;
  deliveryDays: string;
  minWeight?: number;
  maxWeight?: number;
}

export interface FreightCalculationInput {
  productPriceCny: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  routeId: string;
  vipLevel: VIPLevel;
  usdToCny: number;
  cnyToBrl: number;
}

export interface FreightCalculationResult {
  actualWeight: number;
  volumetricWeight: number;
  effectiveWeight: number;
  shippingCostCny: number;
  insuranceCny: number;
  subtotalCny: number;
  serviceFeePercent: number;
  serviceFeeCny: number;
  totalCny: number;
  totalBrl: number;
  deliveryDays: string;
}
