// src/reducers/saleReducer.ts
import {
  GetAllSales,
  GetSaleDetails,
  CreateSale,
  UpdateSale,
  DeleteSale,
  SalesByStatus,
  SaleProducts,
  AddProductsToSale,
  SalesAnalytics,
  GetSaleGifts,
  UpdateSaleGifts,
  CalculateCartGifts,
  ClearSaleErrors,
} from "../constants/saleConstants";
import type {
  Sale,
  SaleProduct,
  SaleState,
  GiftData,
  ApplicableGift
} from "../constants/saleConstants"
import type { Reducer } from 'redux';

// Initial state for all reducers
const initialState: SaleState = {
  sales: [],
  sale: null,
  products: [],
  analytics: null,
  // NEW: Gift-related state
  gifts: null,
  applicableGifts: [],
  giftLoading: false,
  loading: false,
  success: false,
  error: null,
  isUpdated: false,
  isDeleted: false
};

// Combined reducer for sales
export const saleReducer: Reducer<SaleState> = (state = initialState, action) => {
  switch (action.type) {
    // Get all sales
    case GetAllSales.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GetAllSales.Success:
      return {
        ...state,
        loading: false,
        sales: action.payload,
        error: null,
      };
    case GetAllSales.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Get sale details
    case GetSaleDetails.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GetSaleDetails.Success:
      return {
        ...state,
        loading: false,
        sale: action.payload,
        error: null,
      };
    case GetSaleDetails.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Create sale
    case CreateSale.Request:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };
    case CreateSale.Success:
      return {
        ...state,
        loading: false,
        success: true,
        sales: [...state.sales, action.payload],
        sale: action.payload,
        error: null,
      };
    case CreateSale.Fail:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };
    case CreateSale.Reset:
      return {
        ...state,
        success: false,
        error: null,
      };

    // Update sale
    case UpdateSale.Request:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };
    case UpdateSale.Success:
      return {
        ...state,
        loading: false,
        success: true,
        isUpdated: true,
        sales: state.sales.map((sale) =>
          sale.id === action.payload.id ? action.payload : sale
        ),
        sale: action.payload,
        error: null,
      };
    case UpdateSale.Fail:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };
    case UpdateSale.Reset:
      return {
        ...state,
        success: false,
        isUpdated: false,
        error: null,
      };

    // Delete sale
    case DeleteSale.Request:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };
    case DeleteSale.Success:
      return {
        ...state,
        loading: false,
        success: true,
        isDeleted: true,
        sales: state.sales.filter((sale) => sale.id !== action.payload),
        error: null,
      };
    case DeleteSale.Fail:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };
    case DeleteSale.Reset:
      return {
        ...state,
        success: false,
        isDeleted: false,
        error: null,
      };

    // Get sales by status
    case SalesByStatus.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SalesByStatus.Success:
      return {
        ...state,
        loading: false,
        sales: action.payload,
        error: null,
      };
    case SalesByStatus.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Get sale products
    case SaleProducts.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SaleProducts.Success:
      return {
        ...state,
        loading: false,
        products: action.payload,
        error: null,
      };
    case SaleProducts.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Add products to sale
    case AddProductsToSale.Request:
      return {
        ...state,
        loading: true,
        success: false,
        error: null,
      };
    case AddProductsToSale.Success:
      return {
        ...state,
        loading: false,
        success: true,
        error: null,
      };
    case AddProductsToSale.Fail:
      return {
        ...state,
        loading: false,
        success: false,
        error: action.payload,
      };
    case AddProductsToSale.Reset:
      return {
        ...state,
        success: false,
        error: null,
      };

    // Get sales analytics
    case SalesAnalytics.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SalesAnalytics.Success:
      return {
        ...state,
        loading: false,
        analytics: action.payload,
        error: null,
      };
    case SalesAnalytics.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // NEW: Get sale gifts
    case GetSaleGifts.Request:
      return {
        ...state,
        giftLoading: true,
        error: null,
      };
    case GetSaleGifts.Success:
      return {
        ...state,
        giftLoading: false,
        gifts: action.payload,
        error: null,
      };
    case GetSaleGifts.Fail:
      return {
        ...state,
        giftLoading: false,
        error: action.payload,
      };

    // NEW: Update sale gifts
    case UpdateSaleGifts.Request:
      return {
        ...state,
        giftLoading: true,
        success: false,
        error: null,
      };
    case UpdateSaleGifts.Success:
      return {
        ...state,
        giftLoading: false,
        success: true,
        error: null,
      };
    case UpdateSaleGifts.Fail:
      return {
        ...state,
        giftLoading: false,
        success: false,
        error: action.payload,
      };
    case UpdateSaleGifts.Reset:
      return {
        ...state,
        success: false,
        error: null,
      };

    // NEW: Calculate cart gifts
    case CalculateCartGifts.Request:
      return {
        ...state,
        giftLoading: true,
        error: null,
      };
    case CalculateCartGifts.Success:
      return {
        ...state,
        giftLoading: false,
        applicableGifts: action.payload,
        error: null,
      };
    case CalculateCartGifts.Fail:
      return {
        ...state,
        giftLoading: false,
        error: action.payload,
        applicableGifts: [],
      };

    // Clear errors
    case ClearSaleErrors:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};