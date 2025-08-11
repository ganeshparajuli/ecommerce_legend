// src/redux/types/reduxTypes.ts
// Import newsletter types from constants
import type { Newsletter, NewsletterState } from '../constants/newsletterConstant';

// Existing user types
export interface UserState {
  loading: boolean;
  user: any | null;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
}

// Existing cart types
export interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  totalAmount: number;
  itemCount: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Existing order types
export interface OrderState {
  loading: boolean;
  order: any | null;
  error: string | null;
}

export interface OrdersState {
  loading: boolean;
  orders: any[];
  error: string | null;
}

export interface OrderCreateState {
  loading: boolean;
  success: boolean;
  order: any | null;
  error: string | null;
}

export interface OrderDetailsState {
  loading: boolean;
  order: any | null;
  error: string | null;
}

export interface OrderPayState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

export interface OrderListMyState {
  loading: boolean;
  orders: any[];
  error: string | null;
}

// Existing product types
export interface ProductListState {
  loading: boolean;
  products: any[];
  error: string | null;
  page: number;
  pages: number;
}

export interface ProductDetailsState {
  loading: boolean;
  product: any | null;
  error: string | null;
}

export interface ProductReviewState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

// Existing wishlist types
export interface WishlistState {
  loading: boolean;
  items: any[];
  error: string | null;
}

// NEW: Newsletter types - Export the imported types
export type { Newsletter, NewsletterState };

// NEW: Additional admin-related types
export interface BrandState {
  loading: boolean;
  brands: any[];
  error: string | null;
}

export interface CategoryState {
  loading: boolean;
  categories: any[];
  error: string | null;
}

export interface PromoCodeState {
  loading: boolean;
  promoCodes: any[];
  error: string | null;
}