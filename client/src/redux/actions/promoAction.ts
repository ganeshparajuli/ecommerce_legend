// src/actions/promoAction.ts
import {
    CREATE_PROMOCODE_REQUEST,
    CREATE_PROMOCODE_SUCCESS,
    CREATE_PROMOCODE_FAIL,
    GET_ALL_PROMOCODES_REQUEST,
    GET_ALL_PROMOCODES_SUCCESS,
    GET_ALL_PROMOCODES_FAIL,
    GET_ACTIVE_PROMOCODES_REQUEST,
    GET_ACTIVE_PROMOCODES_SUCCESS,
    GET_ACTIVE_PROMOCODES_FAIL,
    GET_PROMOCODE_DETAILS_REQUEST,
    GET_PROMOCODE_DETAILS_SUCCESS,
    GET_PROMOCODE_DETAILS_FAIL,
    UPDATE_PROMOCODE_REQUEST,
    UPDATE_PROMOCODE_SUCCESS,
    UPDATE_PROMOCODE_FAIL,
    DELETE_PROMOCODE_REQUEST,
    DELETE_PROMOCODE_SUCCESS,
    DELETE_PROMOCODE_FAIL,
    VALIDATE_PROMOCODE_REQUEST,
    VALIDATE_PROMOCODE_SUCCESS,
    VALIDATE_PROMOCODE_FAIL,
    APPLY_PROMOCODE,
    REMOVE_PROMOCODE,
    CLEAR_ERRORS
  } from "../constants/promoConstants";
  import type { PromoCode } from "../constants/promoConstants";
  import api from "../api";
  import type { Dispatch } from "redux";
// Helper function to extract error message
const getErrorMessage = (error: any): string => {
    return error.response?.data?.message || error.message || "An error occurred";
  };
  
  interface PromoCodeFormData {
    code: string;
    description?: string;
    min_purchase?: number;                    // ← FIXED: removed "_amount"
    max_discount_amount?: number;             // ← This was already correct
    valid_from: string | Date;
    valid_until: string | Date;
    max_uses?: number;
    is_active: boolean;
  }
  
  interface ValidationResponse {
    valid: boolean;
    promoCode?: any;
    discountAmount?: number;
    finalAmount?: number;
    message?: string;
  }
  
  // Create a new promo code (Admin)
  // Fixed createPromoCode action in promoAction.ts
export const createPromoCode = (promoCodeData: PromoCodeFormData) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
  try {
    dispatch({ type: CREATE_PROMOCODE_REQUEST });

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const validFromDate = new Date(promoCodeData.valid_from);
    const validUntilDate = new Date(promoCodeData.valid_until);

    const formattedValidFrom = validFromDate.toISOString().split("T")[0];
    const formattedValidUntil = validUntilDate.toISOString().split("T")[0];

    const formattedData = {
      code: promoCodeData.code.toUpperCase(),
      description: promoCodeData.description || null,
      min_purchase: Number(promoCodeData.min_purchase) || 0,        // ← FIXED: removed "_amount"
      max_discount_amount: Number(promoCodeData.max_discount_amount) || 0,  // ← FIXED: changed to backend field name
      valid_from: formattedValidFrom,
      valid_until: formattedValidUntil,
      max_uses: Number(promoCodeData.max_uses) || 0,
      is_active: Boolean(promoCodeData.is_active),
    };

    // Log the formatted data for debugging
    console.log("Sending promo code data:", formattedData);

    const { data } = await api.post("promo", formattedData, config);

    dispatch({
      type: CREATE_PROMOCODE_SUCCESS,
      payload: data,
    });

    return "success";
  } catch (error) {
    dispatch({
      type: CREATE_PROMOCODE_FAIL,
      payload: getErrorMessage(error),
    });
    return "error";
  }
};
  
  // Get all promo codes (Admin)
  export const getAllPromoCodes = () => async (dispatch: Dispatch): Promise<void> => {
    try {
      dispatch({ type: GET_ALL_PROMOCODES_REQUEST });
  
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      const { data } = await api.get("promo/admin", config);
  
      dispatch({
        type: GET_ALL_PROMOCODES_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: GET_ALL_PROMOCODES_FAIL,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Get all active promo codes (User)
  export const getActivePromoCodes = () => async (dispatch: Dispatch): Promise<void> => {
    try {
      dispatch({ type: GET_ACTIVE_PROMOCODES_REQUEST });
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
  
      const { data } = await api.get("promo/active", config);
  
      dispatch({
        type: GET_ACTIVE_PROMOCODES_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: GET_ACTIVE_PROMOCODES_FAIL,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Get promo code details (Admin)
  export const getPromoCode = (id: string) => async (dispatch: Dispatch): Promise<void> => {
    try {
      dispatch({ type: GET_PROMOCODE_DETAILS_REQUEST });
  
      const response = await api.get(`promo/admin/${id}`);
  
      dispatch({
        type: GET_PROMOCODE_DETAILS_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: GET_PROMOCODE_DETAILS_FAIL,
        payload: getErrorMessage(error),
      });
    }
  };
  
  interface UpdatePromoCodeData {
    code: string;
    description?: string;
    min_purchase: number;
    max_discount?: number;
    start_date: string | Date; // Field name used in update
    end_date: string | Date;   // Field name used in update
    max_uses: number;
    is_active: boolean;
  }
  
  // Update promo code (Admin)
  export const updatePromoCode = (id: string, promoCodeData: UpdatePromoCodeData) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
    try {
      dispatch({ type: UPDATE_PROMOCODE_REQUEST });
  
      const formattedData = {
        code: promoCodeData.code,
        description: promoCodeData.description,
        minPurchase: Number(promoCodeData.min_purchase),
        maxDiscount: Number(promoCodeData.max_discount),
        validFrom: promoCodeData.start_date, // Field name conversion
        validUntil: promoCodeData.end_date,  // Field name conversion
        maxUses: Number(promoCodeData.max_uses),
        isActive: Boolean(promoCodeData.is_active),
      };
  
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
  
      const { data } = await api.put(`promo/admin/${id}`, formattedData, config);
  
      dispatch({
        type: UPDATE_PROMOCODE_SUCCESS,
        payload: data,
      });
  
      return "success";
    } catch (error) {
      dispatch({
        type: UPDATE_PROMOCODE_FAIL,
        payload: getErrorMessage(error),
      });
      return "error";
    }
  };
  
  // Delete promo code (Admin)
  export const deletePromoCode = (id: string) => async (dispatch: Dispatch): Promise<"success" | "error"> => {
    try {
      dispatch({ type: DELETE_PROMOCODE_REQUEST });
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
  
      await api.delete(`promo/admin/${id}`, config);
  
      dispatch({
        type: DELETE_PROMOCODE_SUCCESS,
      });
  
      return "success";
    } catch (error) {
      dispatch({
        type: DELETE_PROMOCODE_FAIL,
        payload: getErrorMessage(error),
      });
      return "error";
    }
  };
  
  // Validate a promo code during checkout
  export const validatePromoCode = (code: string, itemsPrice: number) => async (dispatch: Dispatch): Promise<ValidationResponse> => {
    try {
      dispatch({ type: VALIDATE_PROMOCODE_REQUEST });
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
  
      // Make sure itemsPrice is a valid number
      const purchaseAmount = Number(itemsPrice);
  
      if (isNaN(purchaseAmount) || purchaseAmount < 0) {
        throw new Error("Valid purchase amount is required");
      }
  
      console.log("Sending promo validation request:", {
        code: code.toUpperCase(),
        purchaseAmount: purchaseAmount, // EXACTLY matching the backend field name
      });
  
      const { data } = await api.post(
        "promo/validate",
        {
          code: code.toUpperCase(),
          purchaseAmount: purchaseAmount, // This MUST match the field name in your backend
        },
        config
      );
  
      console.log("Promo validation response:", data);
  
      if (data.success) {
        dispatch({
          type: VALIDATE_PROMOCODE_SUCCESS,
          payload: data,
        });
  
        // If validation is successful, also apply the promo code
        const promoDetails = data.data;
  
        dispatch({
          type: APPLY_PROMOCODE,
          payload: {
            promoCode: promoDetails.promoCode,
            discountAmount: promoDetails.discountAmount,
            finalAmount: promoDetails.finalAmount,
          },
        });
  
        return {
          valid: true,
          promoCode: promoDetails.promoCode,
          discountAmount: promoDetails.discountAmount,
          finalAmount: promoDetails.finalAmount,
          message: data.message,
        };
      } else {
        throw new Error(data.message || "Invalid promo code");
      }
    } catch (error) {
      console.error("Promo validation error:", error);
  
      // Get proper error message from response
      const errorMessage = getErrorMessage(error);
  
      dispatch({
        type: VALIDATE_PROMOCODE_FAIL,
        payload: errorMessage,
      });
  
      return {
        valid: false,
        message: errorMessage,
      };
    }
  };
  
  // Apply a promo code (local state only, after validation)
  export const applyPromoCode = (code: string, originalAmount: number) => async (dispatch: Dispatch): Promise<ValidationResponse> => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
  
      // Make sure we have a valid amount
      const purchaseAmount = Number(originalAmount);
      
      if (isNaN(purchaseAmount) || purchaseAmount <= 0) {
        throw new Error("Valid purchase amount is required");
      }
  
      console.log("Sending promo validation request:", {
        code: code.toUpperCase(),
        purchaseAmount: purchaseAmount,
      });
  
      // Make an API call to validate and get the promo code details
      const { data } = await api.post(
        "promo/validate",
        {
          code: code.toUpperCase(),
          purchaseAmount: purchaseAmount, // Changed from itemsPrice to purchaseAmount
        },
        config
      );
  
      console.log("Promo validation response:", data);
  
      if (data.success && data.data) {
        const promoDetails = data.data;
        
        // Use the discount amount calculated by the backend
        const discountAmount = promoDetails.discountAmount || 0;
        const finalAmount = promoDetails.finalAmount || (originalAmount - discountAmount);
  
        // Dispatch the action to update state
        dispatch({
          type: APPLY_PROMOCODE,
          payload: {
            promoCode: promoDetails.promoCode,
            discountAmount: discountAmount,
            finalAmount: finalAmount,
          },
        });
  
        return {
          valid: true,
          promoCode: promoDetails.promoCode,
          discountAmount: discountAmount,
          finalAmount: finalAmount,
          message: data.message,
        };
      } else {
        throw new Error(data.message || "Invalid promo code");
      }
    } catch (error: any) {
      console.error("Error applying promo code:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Invalid promo code";
      
      // Don't apply any discount on error
      dispatch({
        type: VALIDATE_PROMOCODE_FAIL,
        payload: errorMessage,
      });
  
      return {
        valid: false,
        message: errorMessage,
      };
    }
  };
  
  // Remove an applied promo code
  export const removePromoCode = (originalAmount: number) => (dispatch: Dispatch): void => {
    dispatch({
      type: REMOVE_PROMOCODE,
      payload: {
        originalAmount,
      },
    });
  };
  
  // Clear all errors
  export const clearErrors = () => (dispatch: Dispatch): void => {
    dispatch({ type: CLEAR_ERRORS });
  };