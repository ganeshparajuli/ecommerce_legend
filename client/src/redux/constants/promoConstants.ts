// src/constants/promoConstant.ts
// Create PromoCode Constants
export const CREATE_PROMOCODE_REQUEST: string = "CREATE_PROMOCODE_REQUEST";
export const CREATE_PROMOCODE_SUCCESS: string = "CREATE_PROMOCODE_SUCCESS";
export const CREATE_PROMOCODE_FAIL: string = "CREATE_PROMOCODE_FAIL";

// Get All PromoCodes Constants
export const GET_ALL_PROMOCODES_REQUEST: string = "GET_ALL_PROMOCODES_REQUEST";
export const GET_ALL_PROMOCODES_SUCCESS: string = "GET_ALL_PROMOCODES_SUCCESS";
export const GET_ALL_PROMOCODES_FAIL: string = "GET_ALL_PROMOCODES_FAIL";

// Get Active PromoCodes Constants
export const GET_ACTIVE_PROMOCODES_REQUEST: string = "GET_ACTIVE_PROMOCODES_REQUEST";
export const GET_ACTIVE_PROMOCODES_SUCCESS: string = "GET_ACTIVE_PROMOCODES_SUCCESS";
export const GET_ACTIVE_PROMOCODES_FAIL: string = "GET_ACTIVE_PROMOCODES_FAIL";

// Get PromoCode Details Constants
export const GET_PROMOCODE_DETAILS_REQUEST: string = "GET_PROMOCODE_DETAILS_REQUEST";
export const GET_PROMOCODE_DETAILS_SUCCESS: string = "GET_PROMOCODE_DETAILS_SUCCESS";
export const GET_PROMOCODE_DETAILS_FAIL: string = "GET_PROMOCODE_DETAILS_FAIL";

// Update PromoCode Constants
export const UPDATE_PROMOCODE_REQUEST: string = "UPDATE_PROMOCODE_REQUEST";
export const UPDATE_PROMOCODE_SUCCESS: string = "UPDATE_PROMOCODE_SUCCESS";
export const UPDATE_PROMOCODE_FAIL: string = "UPDATE_PROMOCODE_FAIL";
export const UPDATE_PROMOCODE_RESET: string = "UPDATE_PROMOCODE_RESET";

// Delete PromoCode Constants
export const DELETE_PROMOCODE_REQUEST: string = "DELETE_PROMOCODE_REQUEST";
export const DELETE_PROMOCODE_SUCCESS: string = "DELETE_PROMOCODE_SUCCESS";
export const DELETE_PROMOCODE_FAIL: string = "DELETE_PROMOCODE_FAIL";
export const DELETE_PROMOCODE_RESET: string = "DELETE_PROMOCODE_RESET";

// Validate PromoCode Constants
export const VALIDATE_PROMOCODE_REQUEST: string = "VALIDATE_PROMOCODE_REQUEST";
export const VALIDATE_PROMOCODE_SUCCESS: string = "VALIDATE_PROMOCODE_SUCCESS";
export const VALIDATE_PROMOCODE_FAIL: string = "VALIDATE_PROMOCODE_FAIL";
export const VALIDATE_PROMOCODE_RESET: string = "VALIDATE_PROMOCODE_RESET";

// Apply PromoCode Constants
export const APPLY_PROMOCODE: string = "APPLY_PROMOCODE";
export const REMOVE_PROMOCODE: string = "REMOVE_PROMOCODE";

// Clear Errors
export const CLEAR_ERRORS: string = "CLEAR_ERRORS";

// Using the ActionTypes pattern
import type { ActionTypes } from '../types/actionTypes';

export const CreatePromoCode: ActionTypes = {
  Request: CREATE_PROMOCODE_REQUEST,
  Success: CREATE_PROMOCODE_SUCCESS,
  Fail: CREATE_PROMOCODE_FAIL,
};

export const GetAllPromoCodes: ActionTypes = {
  Request: GET_ALL_PROMOCODES_REQUEST,
  Success: GET_ALL_PROMOCODES_SUCCESS,
  Fail: GET_ALL_PROMOCODES_FAIL,
};

export const GetActivePromoCodes: ActionTypes = {
  Request: GET_ACTIVE_PROMOCODES_REQUEST,
  Success: GET_ACTIVE_PROMOCODES_SUCCESS,
  Fail: GET_ACTIVE_PROMOCODES_FAIL,
};

export const GetPromoCodeDetails: ActionTypes = {
  Request: GET_PROMOCODE_DETAILS_REQUEST,
  Success: GET_PROMOCODE_DETAILS_SUCCESS,
  Fail: GET_PROMOCODE_DETAILS_FAIL,
};

export const UpdatePromoCode: ActionTypes = {
  Request: UPDATE_PROMOCODE_REQUEST,
  Success: UPDATE_PROMOCODE_SUCCESS,
  Fail: UPDATE_PROMOCODE_FAIL,
  Reset: UPDATE_PROMOCODE_RESET,
};

export const DeletePromoCode: ActionTypes = {
  Request: DELETE_PROMOCODE_REQUEST,
  Success: DELETE_PROMOCODE_SUCCESS,
  Fail: DELETE_PROMOCODE_FAIL,
  Reset: DELETE_PROMOCODE_RESET,
};

export const ValidatePromoCode: ActionTypes = {
  Request: VALIDATE_PROMOCODE_REQUEST,
  Success: VALIDATE_PROMOCODE_SUCCESS,
  Fail: VALIDATE_PROMOCODE_FAIL,
  Reset: VALIDATE_PROMOCODE_RESET,
};

// PromoCode-specific types
export type DiscountType = 'percentage' | 'fixed';

export type PromoCode = {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit?: number;
  currentUsage: number;
  applicableProducts?: string[]; // Product IDs
  applicableCategories?: string[]; // Category IDs
  createdAt: Date;
  updatedAt: Date;
};

export type PromoCodeState = {
  promoCodes: PromoCode[];
  promoCode: PromoCode | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
  isValidated: boolean;
};