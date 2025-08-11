// src/reducers/checkoutReducer.ts
import {
  UpdateShippingInfo,
  UpdatePaymentMethod,
  UpdateCardDetails,
  ApplyPromoCode,
  RemovePromoCode,
  CalculateOrderTotals,
  ProcessCheckout,
  ResetCheckout
} from "../constants/checkoutConstants";
import type {CheckoutState} from "../constants/checkoutConstants";
import type { Reducer } from 'redux';

const initialState: CheckoutState = {
  shippingInfo: {
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
  },
  paymentInfo: {
    method: "credit_card",
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
  },
  promoCode: "",
  isPromoApplied: false,
  discount: 0,
  deliveryFee: 200,
  codFee: 100,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  loading: false,
  error: null,
};

export const checkoutReducer: Reducer<CheckoutState> = (state = initialState, action) => {
  switch (action.type) {
    case UpdateShippingInfo.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case UpdateShippingInfo.Success:
      return {
        ...state,
        loading: false,
        shippingInfo: action.payload,
      };
    case UpdateShippingInfo.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    // case UpdatePaymentMethod:
    //   // Handle different payload formats (both object and string)
    //   const method = typeof action.payload === 'object' 
    //     ? action.payload.method 
    //     : action.payload;

    //   // If switching to a non-credit card method, clear card details
    //   if (method !== "credit_card") {
    //     return {
    //       ...state,
    //       paymentInfo: {
    //         method: method,
    //         cardNumber: "",
    //         cardHolder: "",
    //         expiry: "",
    //         cvv: "",
    //       },
    //     };
    //   }
      
    //   // Otherwise just update the method (original behavior)
    //   return {
    //     ...state,
    //     paymentInfo: {
    //       ...state.paymentInfo,
    //       method: method,
    //     },
    //   };

    case UpdatePaymentMethod:
  // If switching to a non-credit card method, clear card details
  if (action.payload !== "credit_card") {
    return {
      ...state,
      paymentInfo: {
        method: action.payload,
        cardNumber: "",
        cardHolder: "",
        expiry: "",
        cvv: "",
      },
    };
  }
  
  // Otherwise just update the method (original behavior)
  return {
    ...state,
    paymentInfo: {
      ...state.paymentInfo,
      method: action.payload,
    },
  };
    case UpdateCardDetails:
      return {
        ...state,
        paymentInfo: {
          ...state.paymentInfo,
          ...action.payload,
        },
      };
    case ApplyPromoCode:
      return {
        ...state,
        promoCode: action.payload.promoCode,
        isPromoApplied: true,
        discount: action.payload.discount,
      };
    case RemovePromoCode:
      return {
        ...state,
        promoCode: "",
        isPromoApplied: false,
        discount: 0,
      };
    case CalculateOrderTotals:
      const { cartItems } = action.payload;
      const subtotal = cartItems.reduce((total: number, item: any) => {
        const price = parseFloat(String(item.finalPrice || item.price || 0));
        const quantity = parseInt(String(item.quantity || 1), 10);
        return total + price * quantity;
      }, 0);

      // Use vod for consistency (since your components use "vod")
      const discount = state.isPromoApplied ? subtotal * 0.1 : 0;
      const codFee = (state.paymentInfo.method === "cod" || state.paymentInfo.method === "vod") ? state.codFee : 0;
      const total = subtotal - discount + state.deliveryFee + codFee;

      return {
        ...state,
        subtotal,
        discount,
        total,
      };
    case ProcessCheckout.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case ProcessCheckout.Success:
      return {
        ...state,
        loading: false,
      };
    case ProcessCheckout.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case ResetCheckout:
      return initialState;
    default:
      return state;
  }
};

export default checkoutReducer;