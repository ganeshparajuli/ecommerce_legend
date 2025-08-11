// src/redux/constants/wishlistConstants.ts
import type { ActionTypes } from '../types/actionTypes';

/**
 * Action types for wishlist operations
 */
export const AddToWishlist: ActionTypes = {
  Request: "ADD_TO_WISHLIST_REQUEST",
  Success: "ADD_TO_WISHLIST_SUCCESS",
  Fail: "ADD_TO_WISHLIST_FAIL",
  Reset: "ADD_TO_WISHLIST_RESET"
};

export const GetWishlist: ActionTypes = {
  Request: "GET_WISHLIST_REQUEST",
  Success: "GET_WISHLIST_SUCCESS",
  Fail: "GET_WISHLIST_FAIL",
};

export const RemoveFromWishlist: ActionTypes = {
  Request: "REMOVE_FROM_WISHLIST_REQUEST",
  Success: "REMOVE_FROM_WISHLIST_SUCCESS",
  Fail: "REMOVE_FROM_WISHLIST_FAIL",
};

export const ClearWishlistError: ActionTypes = {
  Request: "CLEAR_WISHLIST_ERROR",
  Success: "CLEAR_WISHLIST_SUCCESS",
  Fail: "CLEAR_WISHLIST_FAIL",
};

/**
 * Wishlist item interface - matches backend model
 */
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  added_at: string;
  
  // Product details that might be included by the backend
  product_name?: string;
  price?: number;
  image?: string;
  category: string;
  
  // Or a nested product object
  product?: {
    id: string;
    name: string;
    finalPrice?: number;
    actualPrice?: number;
    stock?: number;
    image?: string;
    category?: {
      id: string;
      name: string;
    } | string;
  };
}

/**
 * Wishlist state interface
 */
export interface WishlistState {
  wishlist: WishlistItem[];
  loading: boolean;
  error: string | null;
  success: boolean;
  wishlistFetched?: boolean;
}