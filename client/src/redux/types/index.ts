// src/redux/types/index.ts

// Import all the types from individual files
import type { User, UserState } from './User';
import type { CartItem, CartState } from './Cart';
import type { Order, OrderItem, OrderDetailsState, OrderCreateState, OrderPayState, OrderListMyState } from './Order';
import type { Product, ProductListState, ProductDetailsState, ProductReviewState } from './Product';
import type { WishlistItem, WishlistState } from './Wishlist';

// Define the root state interface
export interface RootState {
  userLogin: UserState;
  userRegister: UserState;
  userDetails: UserState;
  userUpdateProfile: {
    loading: boolean;
    success: boolean;
    error: string | null;
  };
  cart: CartState;
  orderCreate: OrderCreateState;
  orderDetails: OrderDetailsState;
  orderPay: OrderPayState;
  orderListMy: OrderListMyState;
  productList: ProductListState;
  productDetails: ProductDetailsState;
  productReview: ProductReviewState;
  wishlist: WishlistState;
}

// Re-export all types
export {
  User,
  UserState,
  CartItem,
  CartState,
  Order,
  OrderItem,
  OrderCreateState,
  OrderDetailsState,
  OrderPayState,
  OrderListMyState,
  Product,
  ProductListState,
  ProductDetailsState,
  ProductReviewState,
  WishlistItem,
  WishlistState
};