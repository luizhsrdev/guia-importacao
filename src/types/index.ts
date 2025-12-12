export interface Category {
  id: string;
  name: string;
  slug: string;
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
}

export interface Product extends ProductBase {
  original_link: string;
}

export interface PublicProduct extends ProductBase {
  original_link?: string;
}

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
}
