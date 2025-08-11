// src/constants/paymentConstant.ts
import type { ActionTypes } from '../types/actionTypes';

export const GetPaymentMethods: ActionTypes = {
  Request: "getPaymentMethodsRequest",
  Success: "getPaymentMethodsSuccess",
  Fail: "getPaymentMethodsFail",
};

export const CreatePaymentIntent: ActionTypes = {
  Request: "addPaymentIntentRequest",
  Success: "addPaymentIntentSuccess",
  Fail: "addPaymentIntentFail",
};

export const AddPaymentMethod: ActionTypes = {
  Request: "addPaymentMethodRequest",
  Success: "addPaymentMethodSuccess",
  Fail: "addPaymentMethodFail",
};

export const DeletePaymentMethod: ActionTypes = {
  Request: "deletePaymentMethodRequest",
  Success: "deletePaymentMethodSuccess",
  Fail: "deletePaymentMethodFail",
};

export const setPaymentMethod: string = "setPaymentMethod";

export const SetDefaultPaymentMethod: ActionTypes = {
  Request: "setDefaultPaymentMethodRequest",
  Success: "setDefaultPaymentMethodSuccess",
  Fail: "setDefaultPaymentMethodFail",
};

export const ClearPaymentErrors: string = "clearPaymentErrors";

// Payment-specific types
export type PaymentMethodType = 'card' | 'paypal' | 'bank_transfer' | string;

export type PaymentMethod = {
  id: string;
  type: PaymentMethodType;
  isDefault: boolean;
  details: {
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    holderName?: string;
    email?: string;
    bankName?: string;
    accountNumber?: string;
  };
  createdAt: Date;
};

export type PaymentIntent = {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  clientSecret?: string;
  createdAt: Date;
};

export type PaymentState = {
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  paymentIntent: PaymentIntent | null;
  loading: boolean;
  error: string | null;
  success: boolean;
};