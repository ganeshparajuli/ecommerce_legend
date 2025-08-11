// src/constants/saleConstant.ts
import type { ActionTypes } from '../types/actionTypes';

export const GetAllSales: ActionTypes = {
  Request: "getAllSalesRequest",
  Success: "getAllSalesSuccess",
  Fail: "getAllSalesFail",
};

export const GetSaleDetails: ActionTypes = {
  Request: "getSaleDetailsRequest",
  Success: "getSaleDetailsSuccess",
  Fail: "getSaleDetailsFail",
};

export const CreateSale: ActionTypes = {
  Request: "createSaleRequest",
  Success: "createSaleSuccess",
  Reset: "createSaleReset",
  Fail: "createSaleFail",
};

export const UpdateSale: ActionTypes = {
  Request: "updateSaleRequest",
  Success: "updateSaleSuccess",
  Reset: "updateSaleReset",
  Fail: "updateSaleFail",
};

export const DeleteSale: ActionTypes = {
  Request: "deleteSaleRequest",
  Success: "deleteSaleSuccess",
  Reset: "deleteSaleReset",
  Fail: "deleteSaleFail",
};

export const SalesByStatus: ActionTypes = {
  Request: "salesByStatusRequest",
  Success: "salesByStatusSuccess",
  Fail: "salesByStatusFail",
};

export const SaleProducts: ActionTypes = {
  Request: "saleProductsRequest",
  Success: "saleProductsSuccess",
  Fail: "saleProductsFail",
};

export const AddProductsToSale: ActionTypes = {
  Request: "addProductsToSaleRequest",
  Success: "addProductsToSaleSuccess",
  Reset: "addProductsToSaleReset",
  Fail: "addProductsToSaleFail",
};

export const SalesAnalytics: ActionTypes = {
  Request: "salesAnalyticsRequest",
  Success: "salesAnalyticsSuccess",
  Fail: "salesAnalyticsFail",
};

// NEW: Gift-related action types
export const GetSaleGifts: ActionTypes = {
  Request: "getSaleGiftsRequest",
  Success: "getSaleGiftsSuccess",
  Fail: "getSaleGiftsFail",
};

export const UpdateSaleGifts: ActionTypes = {
  Request: "updateSaleGiftsRequest",
  Success: "updateSaleGiftsSuccess",
  Reset: "updateSaleGiftsReset",
  Fail: "updateSaleGiftsFail",
};

export const CalculateCartGifts: ActionTypes = {
  Request: "calculateCartGiftsRequest",
  Success: "calculateCartGiftsSuccess",
  Fail: "calculateCartGiftsFail",
};

export const ClearSaleErrors: string = "clearSaleErrors";

// Sale-specific types
export type SaleStatus = 'active' | 'scheduled' | 'ended' | 'canceled';
export type SaleType = 'percentage' | 'fixed';

export type SaleProduct = {
  productId: string;
  productName: string;
  regularPrice: number;
  salePrice: number;
  discountValue: number;
  discountType: SaleType;
};

// NEW: Gift-related types
export type SaleGift = {
  id: string;
  saleId: string;
  giftProductId: string;
  giftProductName: string;
  giftProductImage?: string;
  giftQuantity: number;
  minPurchaseAmount: number;
  minQuantity: number;
  maxGiftsPerOrder: number;
  isActive: boolean;
};

export type ProductGift = {
  id: string;
  saleId: string;
  mainProductId: string;
  mainProductName: string;
  giftProductId: string;
  giftProductName: string;
  giftProductImage?: string;
  giftQuantity: number;
  minMainQuantity: number;
  maxGiftsPerOrder: number;
  isActive: boolean;
};

export type ApplicableGift = {
  type: 'sale_gift' | 'product_gift';
  giftProductId: string;
  giftProductName: string;
  giftProductImage?: string;
  giftQuantity: number;
  mainProductId?: string;
  reason: string;
  value?: number; // estimated value of the gift
};

export type GiftData = {
  saleGifts: SaleGift[];
  productGifts: ProductGift[];
};

export type Sale = {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  discountType: SaleType;
  discountValue: number;
  status: SaleStatus;
  banner?: string;
  products: SaleProduct[];
  categories?: string[]; // Category IDs
  // NEW: Gift-related fields
  saleGifts?: SaleGift[];
  productGifts?: ProductGift[];
  hasGifts?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type SaleAnalyticsData = {
  periodSales: {
    period: string;
    revenue: number;
    units: number;
  }[];
  topProducts: {
    productId: string;
    productName: string;
    units: number;
    revenue: number;
  }[];
  metrics: {
    totalRevenue: number;
    totalUnits: number;
    averageDiscount: number;
    conversionRate: number;
  };
  // NEW: Gift analytics
  giftMetrics?: {
    totalGiftsGiven: number;
    giftConversionRate: number;
    topGiftProducts: {
      productId: string;
      productName: string;
      timesGifted: number;
    }[];
  };
};

export type SaleState = {
  sales: Sale[];
  sale: Sale | null;
  products: SaleProduct[];
  analytics: SaleAnalyticsData | null;
  // NEW: Gift-related state
  gifts: GiftData | null;
  applicableGifts: ApplicableGift[];
  giftLoading: boolean;
  loading: boolean;
  error: string | null;
  success: boolean;
  isDeleted: boolean;
  isUpdated: boolean;
};