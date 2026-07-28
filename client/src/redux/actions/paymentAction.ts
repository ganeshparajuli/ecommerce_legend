// src/actions/paymentAction.ts
import {
    GetPaymentMethods,
    AddPaymentMethod,
    DeletePaymentMethod,
    SetDefaultPaymentMethod,
    CreatePaymentIntent,
    setPaymentMethod,
    ClearPaymentErrors,
    PaymentMethod,
    PaymentIntent
  } from "../constants/paymentConstants";
  import api from "../api";
  import { Dispatch } from "redux";
  import type { RootState } from "../store";
// Helper function to extract error message
const getErrorMessage = (error: any): string => {
    return error.response?.data?.message || error.message || "An error occurred";
  };
  
  // Get payment methods for the current user
  export const getPaymentMethods = () => async (dispatch: Dispatch): Promise<void> => {
    try {
      dispatch({ type: GetPaymentMethods.Request });
  
      // Assuming your api already has authentication headers set up
      const { data } = await api.get("payment-methods");
  
      dispatch({
        type: GetPaymentMethods.Success,
        payload: data.paymentMethods || [],
      });
    } catch (error) {
      dispatch({
        type: GetPaymentMethods.Fail,
        payload: getErrorMessage(error),
      });
    }
  };
  
  interface CardData {
    number: string;
    expMonth: number;
    expYear: number;
    cvc: string;
    name?: string;
  }
  
  // Add a new payment method
  export const addPaymentMethod = (cardData: CardData) => async (dispatch: Dispatch): Promise<boolean> => {
    try {
      dispatch({ type: AddPaymentMethod.Request });
  
      const { data } = await api.post("payment-methods", cardData);
  
      dispatch({
        type: AddPaymentMethod.Success,
        payload: data.paymentMethod,
      });
  
      return true;
    } catch (error) {
      dispatch({
        type: AddPaymentMethod.Fail,
        payload: getErrorMessage(error),
      });
  
      return false;
    }
  };
  
  // Delete a payment method
  export const deletePaymentMethod = (cardId: string) => async (dispatch: Dispatch): Promise<boolean> => {
    try {
      dispatch({ type: DeletePaymentMethod.Request });
  
      await api.delete(`payment-methods/${cardId}`);
  
      dispatch({
        type: DeletePaymentMethod.Success,
        payload: cardId,
      });
  
      return true;
    } catch (error) {
      dispatch({
        type: DeletePaymentMethod.Fail,
        payload: getErrorMessage(error),
      });
  
      return false;
    }
  };
  
  interface OrderData {
    id?: string;
    total: number;
  }
  
  // Create payment Intent for checkout
  export const createPaymentIntent = (orderData: OrderData) => async (dispatch: Dispatch, getState: () => RootState): Promise<string | null> => {
    try {
      dispatch({ type: CreatePaymentIntent.Request });
  
      const { user } = getState().user;
  
      // Use your api instance instead of axios directly if it has auth headers set up
      const { data } = await api.post("payments/create-payment-intent", {
        amount: orderData.total,
        currency: "usd",
        customerId: user.stripeCustomerId,
        orderId: orderData.id,
      });
  
      dispatch({
        type: CreatePaymentIntent.Success,
        payload: data.clientSecret,
      });
  
      return data.clientSecret;
    } catch (error) {
      dispatch({
        type: CreatePaymentIntent.Fail,
        payload: getErrorMessage(error),
      });
      return null;
    }
  };
  
  // Set a payment method as default
  export const setDefaultPaymentMethod = (cardId: string) => async (dispatch: Dispatch): Promise<boolean> => {
    try {
      dispatch({ type: SetDefaultPaymentMethod.Request });
  
      const { data } = await api.put(`payment-methods/${cardId}/default`);
  
      dispatch({
        type: SetDefaultPaymentMethod.Success,
        payload: data.paymentMethod,
      });
  
      return true;
    } catch (error) {
      dispatch({
        type: SetDefaultPaymentMethod.Fail,
        payload: getErrorMessage(error),
      });
  
      return false;
    }
  };
  
  // Set selected payment method
  export const setSelectedPaymentMethod = (method: PaymentMethod) => (dispatch: Dispatch): void => {
    dispatch({
      type: setPaymentMethod,
      payload: method,
    });
  };
  
  // Clear payment errors
  export const clearPaymentErrors = () => ({
    type: ClearPaymentErrors,
  });