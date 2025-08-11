// src/constants/checkoutConstants.ts
import type { ActionTypes } from '../types/actionTypes';

export const UpdateShippingInfo: ActionTypes = {
  Request: "updateShippingInfoRequest",
  Success: "updateShippingInfoSuccess",
  Fail: "updateShippingInfoFail"
};

export const UpdatePaymentMethod: string = "updatePaymentMethod";
export const UpdateCardDetails: string = "updateCardDetails";
export const ApplyPromoCode: string = "applyPromoCode";
export const RemovePromoCode: string = "removePromoCode";
export const CalculateOrderTotals: string = "calculateOrderTotals";
export const ResetCheckout: string = "resetCheckout";

// Add the missing ProcessCheckout constant
export const ProcessCheckout: ActionTypes = {
  Request: "processCheckoutRequest",
  Success: "processCheckoutSuccess",
  Fail: "processCheckoutFail"
};

// Type definitions matching your actual state structure
export type ShippingInfo = {
  name: string;
  email?: string;
  phone: string;
  storeLocation: string;
  province: string;
  district: string;
  city: string;
  streetAddress: string;
  saveInfo: boolean;
};

export type PaymentInfo = {
  method: string;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
};

export type CardDetails = {
  cardNumber: string;
  nameOnCard: string;
  expiryDate: string;
  cvv: string;
};

export type CheckoutState = {
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  promoCode: string;
  isPromoApplied: boolean;
  discount: number;
  deliveryFee: number;
  codFee: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  loading: boolean;
  error: string | null;
};