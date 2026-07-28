import {
  AddToCart,
  GetCart,
  UpdateCartItem,
  RemoveCartItem,
  ClearCart,
  GetCartCount,
  ToggleCartItem,
  ClearCartErrors,
} from "../constants/cartConstants";
import type { CartItem, CartState } from "../constants/cartConstants";
import type { Reducer } from "redux";

const initialState: CartState = {
  cartItems: [],
  loading: false,
  error: null,
  total: 0,
  itemCount: 0,
  cartFetched: false,
  count: 0,
};

const calculateTotal = (items: CartItem[]): number =>
  items.reduce((total, item) => (item.selected ? total + item.price * item.quantity : total), 0);

const calculateItemCount = (items: CartItem[]): number =>
  items.reduce((count, item) => (item.selected ? count + item.quantity : count), 0);

export const cartReducer: Reducer<CartState> = (state = initialState, action) => {
  switch (action.type) {
    case AddToCart.Request:
    case GetCart.Request:
    case UpdateCartItem.Request:
    case RemoveCartItem.Request:
    case ClearCart.Request:
    case GetCartCount.Request:
      return { ...state, loading: true, error: null };

    case AddToCart.Success:
      return { ...state, loading: false, error: null };

    case AddToCart.Fail:
    case UpdateCartItem.Fail:
    case RemoveCartItem.Fail:
    case ClearCart.Fail:
      return { ...state, loading: false, error: action.payload };

    case GetCart.Success: {
      const cartItems: CartItem[] = action.payload?.cartItems || [];
      return {
        ...state,
        loading: false,
        cartItems,
        total: action.payload?.cartTotal ?? calculateTotal(cartItems),
        itemCount: action.payload?.itemCount ?? calculateItemCount(cartItems),
        error: null,
        cartFetched: true,
      };
    }

    case GetCart.Fail:
      return { ...state, loading: false, error: action.payload, cartFetched: true };

    case UpdateCartItem.Success:
      return { ...state, loading: false };

    case RemoveCartItem.Success: {
      const remaining = state.cartItems.filter((item) => item.productVariantId !== action.payload);
      return {
        ...state,
        loading: false,
        cartItems: remaining,
        total: calculateTotal(remaining),
        itemCount: calculateItemCount(remaining),
        error: null,
      };
    }

    case ClearCart.Success:
      return { ...state, loading: false, cartItems: [], total: 0, itemCount: 0, count: 0, error: null, cartFetched: false };

    case GetCartCount.Success:
      return { ...state, loading: false, count: action.payload, error: null };

    case GetCartCount.Fail:
      return { ...state, loading: false, error: action.payload };

    case ToggleCartItem: {
      const toggled = state.cartItems.map((item) =>
        item.productVariantId === action.payload.productVariantId ? { ...item, selected: !item.selected } : item
      );
      return { ...state, cartItems: toggled, total: calculateTotal(toggled), itemCount: calculateItemCount(toggled) };
    }

    case ClearCartErrors:
      return { ...state, error: null };

    default:
      return state;
  }
};
