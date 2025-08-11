// src/reducers/paymentReducer.ts
import {
  GetPaymentMethods,
  AddPaymentMethod,
  DeletePaymentMethod,
  SetDefaultPaymentMethod,
  CreatePaymentIntent,
  setPaymentMethod,
  ClearPaymentErrors,
 
} from "../constants/paymentConstants";
import type { PaymentMethod,
  PaymentState} from "../constants/paymentConstants"
import type { Reducer } from 'redux';

const initialState: PaymentState = {
  paymentMethods: [],
  selectedPaymentMethod: null,
  paymentIntent: null,
  loading: false,
  error: null,
  success: false,
  clientSecret: null
};

export const paymentReducer: Reducer<PaymentState> = (state = initialState, action) => {
  switch (action.type) {
    // Get payment methods
    case GetPaymentMethods.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GetPaymentMethods.Success:
      return {
        ...state,
        loading: false,
        paymentMethods: action.payload,
        error: null,
      };
    case GetPaymentMethods.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Add payment method
    case AddPaymentMethod.Request:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };
    case AddPaymentMethod.Success:
      return {
        ...state,
        loading: false,
        paymentMethods: [...state.paymentMethods, action.payload],
        success: true,
        error: null,
      };
    case AddPaymentMethod.Fail:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // Delete payment method
    case DeletePaymentMethod.Request:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };
    case DeletePaymentMethod.Success:
      return {
        ...state,
        loading: false,
        paymentMethods: state.paymentMethods.filter(
          (method) => method.id !== action.payload
        ),
        success: true,
        error: null,
      };
    case DeletePaymentMethod.Fail:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // Set default payment method
    case SetDefaultPaymentMethod.Request:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };
    case SetDefaultPaymentMethod.Success:
      return {
        ...state,
        loading: false,
        paymentMethods: state.paymentMethods.map((method) => ({
          ...method,
          isDefault: method.id === action.payload.id,
        })),
        success: true,
        error: null,
      };
    case SetDefaultPaymentMethod.Fail:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };

    // Set selected payment method
    case setPaymentMethod:
      return {
        ...state,
        selectedPaymentMethod: action.payload,
      };

    // Create payment intent
    case CreatePaymentIntent.Request:
      return {
        ...state,
        loading: true,
      };
    case CreatePaymentIntent.Success:
      return {
        ...state,
        loading: false,
        clientSecret: action.payload,
        success: true,
      };
    case CreatePaymentIntent.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Clear errors
    case ClearPaymentErrors:
      return {
        ...state,
        error: null,
        success: false,
      };

    default:
      return state;
  }
};