// src/actions/checkoutAction.ts
import {
  UpdateShippingInfo,
  UpdatePaymentMethod,
  UpdateCardDetails,
  ApplyPromoCode,
  RemovePromoCode,
  CalculateOrderTotals,
  ResetCheckout,
  ProcessCheckout,
 
} from "../constants/checkoutConstants";
import type { ShippingInfo,
  CardDetails
  } from "../constants/checkoutConstants"
import { createOrder } from "./orderAction";
import type { Dispatch } from "redux";
import type { RootState } from "../store";

// Update shipping information
export const updateShippingInfo = (shippingData: ShippingInfo) => async (dispatch: Dispatch): Promise<boolean> => {
  try {
    dispatch({
      type: UpdateShippingInfo.Request,
    });

    // You could validate data here or make API call if needed
    dispatch({
      type: UpdateShippingInfo.Success,
      payload: shippingData,
    });

    return true;
  } catch (error) {
    dispatch({
      type: UpdateShippingInfo.Fail,
      payload: error instanceof Error ? error.message : "Failed to update shipping information",
    });
    return false;
  }
};

// Update payment method
// export const updatePaymentMethod = (method: string) => (dispatch: Dispatch, getState: () => RootState): void => {
//   // If switching to a non-credit card method, clear card details
//   if (method !== 'credit_card') {
//     dispatch({
//       type: UpdatePaymentMethod,
//       payload: {
//         method: method,
//         cardNumber: '',
//         cardHolder: '',
//         expiry: '',
//         cvv: ''
//       }
//     });
//   } else {
//     // Just update method without clearing card details
//     dispatch({
//       type: UpdatePaymentMethod,
//       payload: { method }
//     });
//   }
// };

export const updatePaymentMethod = (method: string) => (dispatch: Dispatch): void => {
  // Simple version for clarity - just dispatch the method string
  console.log("Updating payment method to:", method);
  
  dispatch({
    type: UpdatePaymentMethod,
    payload: method,
  });
};

// Update card details
export const updateCardDetails = (cardData: CardDetails) => (dispatch: Dispatch): void => {
  dispatch({
    type: UpdateCardDetails,
    payload: cardData,
  });
};

// Apply promo code
export const applyPromoCode = (code: string) => (dispatch: Dispatch, getState: () => any): void => {
  const { subtotal } = getState().checkout;
  // Calculate discount (10% for now, but could be dynamic based on code)
  const discount = subtotal * 0.1;

  dispatch({
    type: ApplyPromoCode,
    payload: {
      promoCode: code,
      discount,
    },
  });
};

// Remove promo code
export const removePromoCode = () => (dispatch: Dispatch): void => {
  dispatch({
    type: RemovePromoCode,
  });
};

// Calculate order totals based on cart items and payment method
export const calculateOrderTotals = (cartItems: any[]) => (dispatch: Dispatch): void => {
  dispatch({
    type: CalculateOrderTotals,
    payload: { cartItems },
  });
};

export const processCheckout = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({
      type: ProcessCheckout.Request,
    });

    const state = getState();

    // Check if checkout exists in state and provide defaults
    const checkout = state.checkout || {};
    const { shippingInfo = {}, paymentInfo = {} } = checkout;

    // Check if cart exists in state and provide defaults
    const cart = state.cart || {};
    const { cartItems = [] } = cart;

    // Promo code is re-validated and its discount recomputed server-side - we only pass the code.
    const promo = state.promo || {};
    const { isPromoApplied = false, promoCode = "" } = promo;

    // Validate required fields using correct field names
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.streetAddress) {
      dispatch({
        type: ProcessCheckout.Fail,
        payload: "Please complete your shipping information",
      });
      return false;
    }

    if (!cartItems.length) {
      dispatch({
        type: ProcessCheckout.Fail,
        payload: "Your cart is empty",
      });
      return false;
    }

    // Only validate card details if payment method is credit_card
    if (paymentInfo.method === "credit_card") {
      if (!paymentInfo.cardNumber || !paymentInfo.cardHolder ||
          !paymentInfo.expiry || !paymentInfo.cvv) {
        dispatch({
          type: ProcessCheckout.Fail,
          payload: "Please complete your credit card information",
        });
        return false;
      }
    }

    // Order items reference the specific variant the customer selected - price and totals
    // are always computed server-side from the current variant price, never trusted here.
    const orderData = {
      shippingAddress: {
        name: shippingInfo.name || "",
        phone: shippingInfo.phone || "",
        address: shippingInfo.streetAddress || "",
        city: shippingInfo.city || "",
        district: shippingInfo.district || "",
        province: shippingInfo.province || "",
        storeLocation: shippingInfo.storeLocation || "",
        postalCode: shippingInfo.postalCode || "",
        country: shippingInfo.country || "Nepal",
      },
      paymentMethod: paymentInfo.method || "cod",
      orderItems: cartItems.map((item: any) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity || 1,
      })),
      promoCode: isPromoApplied ? promoCode : null,
    };

    console.log("Submitting order data:", orderData);

    // Call the createOrder action
    const result = await dispatch(createOrder(orderData) as any);

    if (result?.success) {
      // Reset checkout and promo state
      dispatch({
        type: ProcessCheckout.Success,
      });
      dispatch({ type: ResetCheckout });
      
      // 🔥 FIX: Also reset promo state after successful order
      dispatch({ type: RemovePromoCode });
      
      return true;
    }

    dispatch({
      type: ProcessCheckout.Fail,
      payload: "Failed to create order",
    });
    return false;
  } catch (error) {
    console.error("Checkout processing error:", error);
    dispatch({
      type: ProcessCheckout.Fail,
      payload: error instanceof Error ? error.message : "An unexpected error occurred",
    });
    return false;
  }
};

// Reset checkout state
export const resetCheckout = () => (dispatch: Dispatch): void => {
  dispatch({ type: ResetCheckout });
};