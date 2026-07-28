// src/reducers/promoReducer.ts
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
  UPDATE_PROMOCODE_RESET,
  DELETE_PROMOCODE_REQUEST,
  DELETE_PROMOCODE_SUCCESS,
  DELETE_PROMOCODE_FAIL,
  DELETE_PROMOCODE_RESET,
  VALIDATE_PROMOCODE_REQUEST,
  VALIDATE_PROMOCODE_SUCCESS,
  VALIDATE_PROMOCODE_FAIL,
  VALIDATE_PROMOCODE_RESET,
  APPLY_PROMOCODE,
  REMOVE_PROMOCODE,
  CLEAR_ERRORS,
} from "../constants/promoConstants";
import type { PromoCode } from "../constants/promoConstants";
import type { Reducer } from 'redux';

// ============= INTERFACES =============

// Main promo state interface for checkout flow
interface PromoState {
  loading: boolean;
  isPromoApplied: boolean;
  promoCode: string;
  discount: number;
  discountType: string;
  discountValue: number;
  finalAmount: number;
  error: string | null;
  isValid: boolean;
}

// All promo codes state (for admin)
interface PromoCodesState {
  promoCodes: PromoCode[];
  loading: boolean;
  error: string | null;
  count?: number;
}

// Promo code details state (for admin)
interface PromoCodeDetailsState {
  promoCode: PromoCode | null;
  loading: boolean;
  error: string | null;
}

// Create, update, delete promo code state (for admin)
interface PromoCodeActionState {
  loading: boolean;
  error: string | null;
  success?: boolean;
  isUpdated?: boolean;
  isDeleted?: boolean;
  promoCode?: PromoCode;
}

// Validate promo code state (for users during checkout)
interface PromoCodeValidationState {
  loading: boolean;
  error: string | null;
  valid?: boolean;
  promoData?: any;
  discountAmount?: number;
  finalAmount?: number;
}

// Applied promo code state (old - for backward compatibility)
interface AppliedPromoCodeState {
  promoCode: PromoCode | null;
  discountAmount?: number;
  finalAmount?: number;
}

// ============= INITIAL STATES =============

const initialPromoState: PromoState = {
  loading: false,
  isPromoApplied: false,
  promoCode: "",
  discount: 0,
  discountType: "",
  discountValue: 0,
  finalAmount: 0,
  error: null,
  isValid: true,
};

// ============= MAIN PROMO REDUCER (FOR CHECKOUT FLOW) =============
// THIS IS THE MOST IMPORTANT REDUCER - USE THIS AS state.promo
export const promoReducer: Reducer<PromoState> = (state = initialPromoState, action) => {
  switch (action.type) {
    case VALIDATE_PROMOCODE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case VALIDATE_PROMOCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case VALIDATE_PROMOCODE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isPromoApplied: false,
      };

    case APPLY_PROMOCODE:
      console.log("🎯 APPLY_PROMOCODE action received:", action.payload);
      
      // Extract promo code string
      let promoCodeString = "";
      if (typeof action.payload.promoCode === 'string') {
        promoCodeString = action.payload.promoCode;
      } else if (action.payload.promoCode && action.payload.promoCode.code) {
        promoCodeString = action.payload.promoCode.code;
      }

      return {
        ...state,
        loading: false,
        isPromoApplied: true,
        promoCode: promoCodeString,
        discount: action.payload.discountAmount || 0,
        finalAmount: action.payload.finalAmount || 0,
        error: null,
      };

    case REMOVE_PROMOCODE:
      return {
        ...initialPromoState,
      };

    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// ============= ADMIN REDUCERS =============

// All promo codes reducer (for admin)
export const promoCodesReducer: Reducer<PromoCodesState> = (
  state = { promoCodes: [], loading: false, error: null },
  action
) => {
  switch (action.type) {
    case GET_ALL_PROMOCODES_REQUEST:
      return {
        loading: true,
        promoCodes: [],
        error: null
      };
    case GET_ALL_PROMOCODES_SUCCESS:
      return {
        loading: false,
        promoCodes: action.payload.data || [],
        count: action.payload.meta?.count,
        error: null
      };
    case GET_ALL_PROMOCODES_FAIL:
      return {
        loading: false,
        promoCodes: [],
        error: action.payload,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Active promo codes reducer (for users)
export const activePromoCodesReducer: Reducer<PromoCodesState> = (
  state = { promoCodes: [], loading: false, error: null },
  action
) => {
  switch (action.type) {
    case GET_ACTIVE_PROMOCODES_REQUEST:
      return {
        loading: true,
        promoCodes: [],
        error: null
      };
    case GET_ACTIVE_PROMOCODES_SUCCESS:
      return {
        loading: false,
        promoCodes: action.payload.data || [],
        count: action.payload.meta?.count,
        error: null
      };
    case GET_ACTIVE_PROMOCODES_FAIL:
      return {
        loading: false,
        promoCodes: [],
        error: action.payload,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Promo code details reducer (for admin)
export const promoCodeDetailsReducer: Reducer<PromoCodeDetailsState> = (
  state = { promoCode: null, loading: false, error: null },
  action
) => {
  switch (action.type) {
    case GET_PROMOCODE_DETAILS_REQUEST:
      return {
        loading: true,
        promoCode: null,
        error: null
      };
    case GET_PROMOCODE_DETAILS_SUCCESS:
      return {
        loading: false,
        promoCode: action.payload.data || null,
        error: null
      };
    case GET_PROMOCODE_DETAILS_FAIL:
      return {
        loading: false,
        promoCode: null,
        error: action.payload,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create, update, delete promo code reducer (for admin)
export const promoCodeReducer: Reducer<PromoCodeActionState> = (
  state = { loading: false, error: null },
  action
) => {
  switch (action.type) {
    case CREATE_PROMOCODE_REQUEST:
    case UPDATE_PROMOCODE_REQUEST:
    case DELETE_PROMOCODE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case CREATE_PROMOCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        promoCode: action.payload.data,
        error: null
      };
    case UPDATE_PROMOCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        isUpdated: true,
        promoCode: action.payload.data,
        error: null
      };
    case DELETE_PROMOCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        isDeleted: true,
        error: null
      };
    case CREATE_PROMOCODE_FAIL:
    case UPDATE_PROMOCODE_FAIL:
    case DELETE_PROMOCODE_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case UPDATE_PROMOCODE_RESET:
      return {
        ...state,
        isUpdated: false,
      };
    case DELETE_PROMOCODE_RESET:
      return {
        ...state,
        isDeleted: false,
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Validate promo code reducer (for users during checkout)
export const promoCodeValidationReducer: Reducer<PromoCodeValidationState> = (
  state = { loading: false, error: null },
  action
) => {
  switch (action.type) {
    case VALIDATE_PROMOCODE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case VALIDATE_PROMOCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        valid: true,
        promoData: action.payload.data?.promoData,
        discountAmount: action.payload.data?.discountAmount,
        finalAmount: action.payload.data?.finalAmount,
        error: null
      };
    case VALIDATE_PROMOCODE_FAIL:
      return {
        ...state,
        loading: false,
        valid: false,
        error: action.payload,
      };
    case VALIDATE_PROMOCODE_RESET:
      return {
        loading: false,
        error: null
      };
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Applied promo code reducer (OLD - for backward compatibility)
export const appliedPromoCodeReducer: Reducer<AppliedPromoCodeState> = (
  state = { promoCode: null },
  action
) => {
  switch (action.type) {
    case APPLY_PROMOCODE:
      return {
        promoCode: action.payload.promoCode,
        discountAmount: action.payload.discountAmount,
        finalAmount: action.payload.finalAmount,
      };
    case REMOVE_PROMOCODE:
      return {
        promoCode: null,
        discountAmount: 0,
        finalAmount: action.payload?.originalAmount || 0,
      };
    default:
      return state;
  }
};