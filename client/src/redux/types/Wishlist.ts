// src/redux/types/Wishlist.ts

export interface WishlistItem {
  id: string;
  name: string;
  image: string;
  price: number;
  countInStock?: number;
  description?: string;
  brand?: string;
  category?: string;
  rating?: number;
  numReviews?: number;
}

export interface WishlistState {
  loading: boolean;
  items: WishlistItem[];
  error: string | null;
}