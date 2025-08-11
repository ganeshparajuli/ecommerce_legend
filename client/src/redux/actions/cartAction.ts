// src/actions/cartAction.ts - FIXED VERSION with deep cloning
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
// import type {CartItem,
  // CartState} from "../constants/cartConstants"
import api from "../api";
import type { Dispatch } from "redux";
import type { RootState } from "../types";


// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  return error.response?.data?.message || error.message || "An error occurred";
};

// CRITICAL: Helper function to safely clone any data before dispatching
const safeClone = (data: any): any => {
  if (data === null || data === undefined) return data;
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Failed to clone data:", error);
    return data;
  }
};

// Check if user is logged in
const isLoggedIn = (): boolean => {
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");
  return Boolean(token && justLoggedOut !== "true");
};

// FIXED: Initialize cart with proper cloning
export const initializeCart = () => async (dispatch: Dispatch): Promise<void> => {
  try {
    const token = localStorage.getItem("token");
    const justLoggedOut = localStorage.getItem("loggedOut");

    // Don't make any API calls if there's no token or if the user just logged out
    if (!token || justLoggedOut) {
      // Return early with an empty cart instead of trying API calls
      return dispatch({
        type: GetCart.Success,
        payload: { cartItems: [] },
      });
    }

    dispatch({ type: GetCart.Request });

    // Now it's safe to call the API since we have a token
    const { data } = await api.get("cart/");

    // FIXED: Deep clone cart data before dispatching
    dispatch({
      type: GetCart.Success,
      payload: safeClone(data),
    });
  } catch (error) {
    // If API fails (like when user is not logged in), clear cart state
    dispatch({
      type: GetCart.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Add item to cart with proper cloning
// export const addToCart = (productId: string, quantity = 1) => async (dispatch: Dispatch): Promise<"login-required" | "success" | "error"> => {
//   try {
//     if (!isLoggedIn()) {
//       // Handle not logged in state
//       dispatch({
//         type: AddToCart.Fail,
//         payload: "User not logged in",
//       });
//       return "login-required";
//     }

//     dispatch({ type: AddToCart.Request });

//     console.log("Adding item to cart:", { productId, quantity });
    
//     // Make API call with proper payload
//     const { data } = await api.post("cart/", { productId, quantity });
    
//     // Log the API response for debugging
//     console.log("Cart API response:", data);

//     // FIXED: Deep clone response data before dispatching
//     dispatch({
//       type: AddToCart.Success,
//       payload: safeClone(data),
//     });

//     // After successfully adding to cart, refresh cart data
//     // This ensures the UI is synchronized with the server state
//     dispatch(getCart());
//     dispatch(getCartCount());
    
//     return "success";
//   } catch (error) {
//     console.error("Error adding to cart:", error);
    
//     dispatch({
//       type: AddToCart.Fail,
//       payload: getErrorMessage(error),
//     });
    
//     return "error";
//   }
// };
interface SaleInfo {
  originalPrice: number;
  salePrice: number;
  discountType: "percentage" | "fixed";
  discountValue: number;
  saleId: string | number | null;
  saleName: string;
}

export const addToCart = (
  productId: string, 
  quantity = 1, 
  saleInfo?: SaleInfo
) => async (dispatch: Dispatch): Promise<"login-required" | "success" | "error"> => {
  try {
    if (!isLoggedIn()) {
      // Handle not logged in state
      dispatch({
        type: AddToCart.Fail,
        payload: "User not logged in",
      });
      return "login-required";
    }

    dispatch({ type: AddToCart.Request });

    console.log("Adding item to cart:", { productId, quantity, saleInfo });
    
    // Create payload with sale information if provided
    const payload: any = { productId, quantity };
    
    if (saleInfo) {
      payload.saleInfo = saleInfo;
    }
    
    // Make API call with proper payload including sale info
    const { data } = await api.post("cart/", payload);
    
    // Log the API response for debugging
    console.log("Cart API response:", data);

    // FIXED: Deep clone response data before dispatching
    dispatch({
      type: AddToCart.Success,
      payload: safeClone(data),
    });

    // After successfully adding to cart, refresh cart data
    // This ensures the UI is synchronized with the server state
    dispatch(getCart());
    dispatch(getCartCount());
    
    return "success";
  } catch (error) {
    console.error("Error adding to cart:", error);
    
    dispatch({
      type: AddToCart.Fail,
      payload: getErrorMessage(error),
    });
    
    return "error";
  }
};

// FIXED: Get user's cart with proper cloning
export const getCart = () => async (dispatch: Dispatch, getState: () => RootState): Promise<void> => {
  try {
    if (!isLoggedIn()) {
      // Return empty cart if not logged in
      return dispatch({
        type: GetCart.Success,
        payload: { cartItems: [] },
      });
    }

    const { cart } = getState();
    // Skip if we've already fetched the cart
    if (cart.cartFetched) {
      return;
    }

    dispatch({ type: GetCart.Request });

    const { data } = await api.get("cart");

    // FIXED: Deep clone cart data before dispatching
    dispatch({
      type: GetCart.Success,
      payload: safeClone(data),
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    dispatch({
      type: GetCart.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Update cart item with proper cloning
export const updateCartItem = (productId: string, quantity: number) => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!isLoggedIn()) return;

    dispatch({ type: UpdateCartItem.Request });

    const { data } = await api.put(`cart/${productId}`, { quantity });

    // FIXED: Deep clone response data before dispatching
    dispatch({
      type: UpdateCartItem.Success,
      payload: {
        productId,
        quantity,
        data: safeClone(data),
      },
    });
  } catch (error) {
    dispatch({
      type: UpdateCartItem.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Remove item from cart - no changes needed as it only sends productId
export const removeFromCart = (productId: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!isLoggedIn()) return;

    dispatch({ type: RemoveCartItem.Request });

    await api.delete(`cart/${productId}`);

    dispatch({
      type: RemoveCartItem.Success,
      payload: productId, // Just an ID, no cloning needed
    });
    dispatch(getCartCount());
  } catch (error) {
    dispatch({
      type: RemoveCartItem.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Clear cart - no changes needed as it's just clearing state
export const clearCart = () => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!isLoggedIn()) {
      // If not logged in, just clear local state
      return dispatch({ type: ClearCart.Success });
    }

    dispatch({ type: ClearCart.Request });

    await api.delete("cart/");

    dispatch({ type: ClearCart.Success });
  } catch (error) {
    dispatch({
      type: ClearCart.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Get cart count - no changes needed as it only returns a number
export const getCartCount = () => async (dispatch: Dispatch): Promise<void> => {
  try {
    if (!isLoggedIn()) {
      // If not logged in, set count to 0
      return dispatch({
        type: GetCartCount.Success,
        payload: 0,
      });
    }

    dispatch({ type: GetCartCount.Request });

    const { data } = await api.get("cart/count");

    dispatch({
      type: GetCartCount.Success,
      payload: data.count, // Just a number, no cloning needed
    });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    dispatch({
      type: GetCartCount.Fail,
      payload: 0, // Default to 0 on failure
    });
  }
};

// Toggle cart item selection - no changes needed as it's local state
export const toggleCartItem = (productId: string) => async (dispatch: Dispatch): Promise<void> => {
  dispatch({
    type: ToggleCartItem,
    payload: { productId },
  });
};

// Clear all errors - no changes needed
export const clearErrors = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch({ type: ClearCartErrors });
};