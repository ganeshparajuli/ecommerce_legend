export const AddToCart = {
  Request: "addToCartRequest",
  Success: "addToCartSuccess",
  Fail: "addToCartFail",
};

export const GetCart = {
  Request: "getCartRequest",
  Success: "getCartSuccess",
  Fail: "getCartFail",
};

export const UpdateCartItem = {
  Request: "updateCartItemRequest",
  Success: "updateCartItemSuccess",
  Fail: "updateCartItemFail",
};

export const RemoveCartItem = {
  Request: "removeCartItemRequest",
  Success: "removeCartItemSuccess",
  Fail: "removeCartItemFail",
};

export const ClearCart = {
  Request: "clearCartRequest",
  Success: "clearCartSuccess",
  Fail: "clearCartFail",
};

export const GetCartCount = {
  Request: "getCartCountRequest",
  Success: "getCartCountSuccess",
  Fail: "getCartCountFail",
};

export const ToggleCartItem = "toggleCartItem";
export const ClearCartErrors = "clearCartErrors";

export interface CartItemVariant {
  id: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  attributes: Record<string, string>;
}

export interface CartItemProduct {
  id: string;
  name: string;
  image: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  productVariantId: string;
  quantity: number;
  selected: boolean;
  price: number;
  isOnSale: boolean;
  discountType?: "percentage" | "fixed" | null;
  discountValue?: number | null;
  variant: CartItemVariant | null;
  product: CartItemProduct | null;
}

export interface CartState {
  cartItems: CartItem[];
  loading: boolean;
  error: string | null;
  total: number;
  itemCount: number;
  cartFetched: boolean;
  count: number;
}
