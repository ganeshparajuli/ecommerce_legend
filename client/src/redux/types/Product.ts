// src/redux/types/Product.ts

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
  reviews?: Review[];
}

export interface ProductListState {
  loading: boolean;
  products: Product[];
  error: string | null;
  page?: number;
  pages?: number;
}

export interface ProductDetailsState {
  loading: boolean;
  product?: Product;
  error: string | null;
}

export interface ProductReviewState {
  loading: boolean;
  success: boolean;
  error: string | null;
}