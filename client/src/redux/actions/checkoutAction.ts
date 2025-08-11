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
import type { RootState } from "../types";

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

interface OrderData {
  shippingInfo: ShippingInfo;
  paymentMethod: string;
  cardDetails?: CardDetails;
  orderItems: Array<{
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  itemsPrice: number;
  shippingPrice: number;
  codFee: number;
  discount: number;
  totalPrice: number;
}

export const processCheckout = () => async (dispatch: Dispatch, getState: () => RootState) => {
  try {
    dispatch({
      type: ProcessCheckout.Request,
    });

    const state = getState();
    
    // Check if checkout exists in state and provide defaults
    const checkout = state.checkout || {};
    const {
      shippingInfo = {},
      paymentInfo = {},
      subtotal = 0,
      deliveryFee = 0,
      codFee = 0,
      total = 0,
    } = checkout;
    
    // Check if cart exists in state and provide defaults
    const cart = state.cart || {};
    const { cartItems = [] } = cart;

    // 🔥 FIX: Get promo data from Redux promo state
    const promo = state.promo || {};
    const {
      isPromoApplied = false,
      promoCode = '',
      discount = 0
    } = promo;

    // Log the payment method to debug
    console.log("Payment method at checkout:", paymentInfo.method);
    console.log("Shipping info received:", shippingInfo);
    console.log("Promo info:", { isPromoApplied, promoCode, discount }); // 🔥 NEW: Log promo data

    // Validate required fields using correct field names
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.streetAddress) {
      console.error("Missing shipping information");
      dispatch({
        type: ProcessCheckout.Fail,
        payload: "Please complete your shipping information",
      });
      return false;
    }

    if (!cartItems.length) {
      console.error("Cart is empty");
      dispatch({
        type: ProcessCheckout.Fail,
        payload: "Your cart is empty",
      });
      return false;
    }

    // Only validate card details if payment method is credit_card
    if (paymentInfo.method === "credit_card") {
      console.log("Validating credit card details:", paymentInfo);
      
      if (!paymentInfo.cardNumber || !paymentInfo.cardHolder || 
          !paymentInfo.expiry || !paymentInfo.cvv) {
        console.error("Missing credit card details");
        dispatch({
          type: ProcessCheckout.Fail,
          payload: "Please complete your credit card information",
        });
        return false;
      }
    } else {
      console.log("Non-credit card payment method selected:", paymentInfo.method);
    }

    // 🔥 Calculate correct final total manually
    const calculatedSubtotal = cartItems.reduce((total, item) => {
      const itemPrice = item.finalPrice || item.price || item.product?.finalPrice || item.product?.price || 0;
      return total + (itemPrice * (item.quantity || 1));
    }, 0);
    
    const finalDiscountAmount = isPromoApplied ? discount : 0;
    const finalCodFee = paymentInfo.method === "cod" ? codFee : 0;
    const finalTotalAmount = calculatedSubtotal - finalDiscountAmount + deliveryFee + finalCodFee;

    console.log("🔍 Checkout state debug:", {
      'checkout.total': total,
      'checkout.subtotal': subtotal,
      'calculatedSubtotal': calculatedSubtotal,
      'checkout.deliveryFee': deliveryFee,
      'promo.discount': discount,
      'finalDiscountAmount': finalDiscountAmount,
      'finalCodFee': finalCodFee,
      'finalTotalAmount': finalTotalAmount
    });

    // 🔥 FIX: Create order data that matches your backend API structure
    const orderData = {
      // Backend expects these exact field names:
      user_id: state.auth?.user?.id || null, // Add user ID from auth state
      total_amount: finalTotalAmount, // 🔥 FIX: Use correctly calculated final total
      shipping_address: {
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
      payment_method: paymentInfo.method || 'cod', // Default to COD
      
      // 🔥 FIX: Map orderItems to match backend structure - correct product_id mapping
      orderItems: cartItems.map((item: any) => ({
        product_id: item.product?.id || item.product_id || item.product || item.id || '', // Use actual product ID first
        quantity: item.quantity || 1,
        price: item.finalPrice || item.price || item.product?.finalPrice || item.product?.price || 0,
      })),

      // 🔥 FIX: Include promo data that was missing
      promo_code: isPromoApplied ? promoCode : null,
      discount_amount: finalDiscountAmount,

      // Optional: Include card details if credit card payment
      ...(paymentInfo.method === "credit_card" ? {
        cardDetails: {
          cardNumber: paymentInfo.cardNumber || '',
          nameOnCard: paymentInfo.cardHolder || '',
          expiryDate: paymentInfo.expiry || '',
          cvv: paymentInfo.cvv || '',
        }
      } : {})
    };

    console.log("🔥 NEW: Submitting order data with promo info:", orderData);

    // Call the createOrder action
    const success = await dispatch(createOrder(orderData) as any);

    if (success) {
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