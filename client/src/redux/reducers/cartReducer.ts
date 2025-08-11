// src/reducers/cartReducer.ts
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
import type { CartItem,
  CartState} from "../constants/cartConstants"
import type { Reducer } from 'redux';

const initialState: CartState = {
  cartItems: [],
  loading: false,
  error: null,
  total: 0,
  itemCount: 0,
  cartFetched: false, // Flag to track if cart has been fetched
  count: 0, // Separate count from API
};

// Calculate cart total based on selected items
const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    if (item.selected) {
      return total + (item.product?.finalPrice || 0) * item.quantity;
    }
    return total;
  }, 0);
};

// Calculate total number of selected items
const calculateItemCount = (items: CartItem[]): number => {
  return items.reduce((count, item) => {
    if (item.selected) {
      return count + item.quantity;
    }
    return count;
  }, 0);
};

export const cartReducer: Reducer<CartState> = (state = initialState, action) => {
  switch (action.type) {
    // Add to Cart
    case AddToCart.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AddToCart.Success:
      console.log("AddToCart.Success payload:", action.payload);

      // Handle different API response structures
      // Your API might return one of these formats, we need to check for all possible structures
      const cartItemData =
        action.payload.cartItem ||
        action.payload.item ||
        action.payload.data ||
        action.payload;

      // Extract product ID, handling different possible structures
      let productId: string | undefined;
      if (typeof cartItemData === "object" && cartItemData !== null) {
        productId =
          cartItemData.productId ||
          cartItemData.product_id ||
          (cartItemData.product && cartItemData.product.id);
      }

      // If we couldn't find a valid productId, log error and return current state
      if (!productId) {
        console.error(
          "Could not extract productId from cart response:",
          action.payload
        );
        return {
          ...state,
          loading: false,
          error: "Invalid product data returned from server",
        };
      }

      // Check if item already exists in cart
      const existingItemIndex = state.cartItems.findIndex((item) => {
        const itemProductId =
          item.product_id || (item.product && item.product.id);
        return itemProductId === productId;
      });

      let updatedCartItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item
        updatedCartItems = state.cartItems.map((item, index) => {
          if (index === existingItemIndex) {
            return {
              ...item,
              quantity: cartItemData.quantity || item.quantity + 1,
              selected: true,
            };
          }
          return item;
        });
      } else {
        // Format new item for cart state
        const newItem: CartItem = {
          id: cartItemData.id || Date.now().toString(),
          product_id: productId,
          product: {
            id: productId,
            name: cartItemData.productName || cartItemData.name || "Product",
            finalPrice: cartItemData.price || cartItemData.finalPrice || 0,
            image: cartItemData.image || "",
          },
          quantity: cartItemData.quantity || 1,
          selected: true,
        };

        updatedCartItems = [...state.cartItems, newItem];
      }

      return {
        ...state,
        loading: false,
        cartItems: updatedCartItems,
        total: calculateTotal(updatedCartItems),
        itemCount: calculateItemCount(updatedCartItems),
        error: null,
      };

    case AddToCart.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Get Cart
    case GetCart.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetCart.Success:
      const cartItems: CartItem[] = action.payload.cartItems
        ? action.payload.cartItems.map((item: any) => ({
            ...item,
            selected: true,
            product: {
              id: item.product_id,
              name: item.name,
              finalPrice: item.finalPrice,
              image: item.image,
              category: item.category,
            },
          }))
        : []; // Default to empty array if cartItems doesn't exist

      return {
        ...state,
        loading: false,
        cartItems,
        total: action.payload.cartTotal || calculateTotal(cartItems),
        itemCount: cartItems.length,
        error: null,
        cartFetched: true, // Set this flag to true after successful fetch
      };

    case GetCart.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        cartFetched: true, // Also mark as fetched on failure to prevent repeated attempts
      };

    // Update Cart Item
    case UpdateCartItem.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UpdateCartItem.Success:
      const updatedItems = state.cartItems.map((item) => {
        if (item.product_id === action.payload.productId) {
          return {
            ...item,
            quantity: action.payload.quantity,
          };
        }
        return item;
      });

      return {
        ...state,
        loading: false,
        cartItems: updatedItems,
        total: calculateTotal(updatedItems),
        itemCount: calculateItemCount(updatedItems),
        error: null,
      };

    case UpdateCartItem.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Remove Cart Item
    case RemoveCartItem.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case RemoveCartItem.Success:
      const remainingItems = state.cartItems.filter(
        (item) => item.product_id !== action.payload
      );

      return {
        ...state,
        loading: false,
        cartItems: remainingItems,
        total: calculateTotal(remainingItems),
        itemCount: calculateItemCount(remainingItems),
        error: null,
      };

    case RemoveCartItem.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Clear Cart
    case ClearCart.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ClearCart.Success:
      return {
        ...state,
        loading: false,
        cartItems: [],
        total: 0,
        itemCount: 0,
        count: 0,
        error: null,
        cartFetched: false, // Reset this flag when cart is cleared
      };

    case ClearCart.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Get Cart Count
    case GetCartCount.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetCartCount.Success:
      return {
        ...state,
        loading: false,
        count: action.payload, // Store count separately from itemCount
        error: null,
      };

    case GetCartCount.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Toggle Cart Item Selection
    case ToggleCartItem:
      const toggledItems = state.cartItems.map((item) => {
        if (item.product_id === action.payload.productId) {
          return {
            ...item,
            selected: !item.selected,
          };
        }
        return item;
      });

      return {
        ...state,
        cartItems: toggledItems,
        total: calculateTotal(toggledItems),
        itemCount: calculateItemCount(toggledItems),
      };

    // Clear Errors
    case ClearCartErrors:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};