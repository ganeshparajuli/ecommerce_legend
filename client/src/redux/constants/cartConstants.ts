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
  
  // Types for cart items and product
  export interface Product {
    id: string | number;
    name: string;
    finalPrice: number;
    image?: string;
    category?: string;
  }
  
  export interface CartItem {
    id: string | number;
    product_id: string | number;
    product: Product;
    quantity: number;
    selected: boolean;
    name?: string;
    finalPrice?: number;
    image?: string;
    category?: string;
  }
  
  // API response interfaces
  export interface CartResponse {
    cartItems?: CartItem[];
    cartItem?: Partial<CartItem>;
    item?: Partial<CartItem>;
    data?: any;
    cartTotal?: number;
    count?: number;
    message?: string;
  }
  
  // Action interfaces
  export interface CartAction {
    type: string;
    payload?: any;
  }