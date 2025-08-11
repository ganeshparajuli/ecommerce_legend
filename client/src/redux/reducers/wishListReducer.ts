import {
  AddToWishlist,
  RemoveFromWishlist,
  GetWishlist,
  ClearWishlistError,
  type WishlistItem,
  type WishlistState
} from "../constants/wishlistConstants";
import type { Reducer } from 'redux';

// Initial state
const initialState: WishlistState = {
  wishlist: [],
  loading: false,
  error: null,
  success: false,
  wishlistFetched: false
};

/**
 * Wishlist reducer to handle all wishlist related actions
 */
export function wishListReducer(
  state = initialState, 
  action: { type: string; payload?: any }
) {
  switch (action.type) {
    // Request cases
    case AddToWishlist.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case RemoveFromWishlist.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetWishlist.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    // Success cases
    case AddToWishlist.Success:
      // Check if item already exists in wishlist to avoid duplicates
      const existingItem = state.wishlist.find(item => item.product_id === action.payload.product_id
      );

      if (existingItem) {
        return {
          ...state,
          loading: false,
          success: true,
          error: null,
        };
      }

      return {
        ...state,
        loading: false,
        wishlist: [...state.wishlist, action.payload],
        success: true,
        error: null,
      };

    case RemoveFromWishlist.Success:
      return {
        ...state,
        loading: false,
        wishlist: state.wishlist.filter(item => item.id !== action.payload),
        success: true,
        error: null,
      };

    case GetWishlist.Success:
      return {
        ...state,
        loading: false,
        wishlist: action.payload,
        wishlistFetched: true,
        success: true,
        error: null,
      };

    // Failure cases
    case AddToWishlist.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case RemoveFromWishlist.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case GetWishlist.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    // Clear error
    case ClearWishlistError.Request:
      return {
        ...state,
        error: null,
      };

    // Reset case if added
    case AddToWishlist.Reset:
      return {
        ...state,
        success: false,
        error: null
      };

    default:
      return state;
  }
}