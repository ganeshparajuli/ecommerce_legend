// src/constants/splashConstants.ts
import type { ActionTypes } from '../types/actionTypes';

export const GetAllSplash: ActionTypes = {
  Request: "getAllSplashRequest",
  Success: "getAllSplashSuccess",
  Fail: "getAllSplashFail",
};

export const GetActiveSplash: ActionTypes = {
  Request: "getActiveSplashRequest",
  Success: "getActiveSplashSuccess",
  Fail: "getActiveSplashFail",
};

export const GetSplashDetails: ActionTypes = {
  Request: "getSplashDetailsRequest",
  Success: "getSplashDetailsSuccess",
  Fail: "getSplashDetailsFail",
};

export const CreateSplash: ActionTypes = {
  Request: "createSplashRequest",
  Success: "createSplashSuccess",
  Reset: "createSplashReset",
  Fail: "createSplashFail",
};

export const UpdateSplash: ActionTypes = {
  Request: "updateSplashRequest",
  Success: "updateSplashSuccess",
  Reset: "updateSplashReset",
  Fail: "updateSplashFail",
};

export const DeleteSplash: ActionTypes = {
  Request: "deleteSplashRequest",
  Success: "deleteSplashSuccess",
  Reset: "deleteSplashReset",
  Fail: "deleteSplashFail",
};

export const ToggleSplashStatus: ActionTypes = {
  Request: "toggleSplashStatusRequest",
  Success: "toggleSplashStatusSuccess",
  Reset: "toggleSplashStatusReset",
  Fail: "toggleSplashStatusFail",
};

export const UpdateSplashOrders: ActionTypes = {
  Request: "updateSplashOrdersRequest",
  Success: "updateSplashOrdersSuccess",
  Reset: "updateSplashOrdersReset",
  Fail: "updateSplashOrdersFail",
};

export const BulkUpdateSplashStatus: ActionTypes = {
  Request: "bulkUpdateSplashStatusRequest",
  Success: "bulkUpdateSplashStatusSuccess",
  Reset: "bulkUpdateSplashStatusReset",
  Fail: "bulkUpdateSplashStatusFail",
};

export const GetSplashStats: ActionTypes = {
  Request: "getSplashStatsRequest",
  Success: "getSplashStatsSuccess",
  Fail: "getSplashStatsFail",
};

export const ClearSplashErrors: string = "clearSplashErrors";

// Splash-specific types
export type Splash = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  imageUrl?: string; // Alternative naming for consistency
  product_id?: string;
  productId?: string; // Alternative naming for consistency
  product_name?: string;
  product_slug?: string;
  product_price?: number;
  is_active: boolean;
  isActive?: boolean; // Alternative naming for consistency
  display_order: number;
  displayOrder?: number; // Alternative naming for consistency
  start_date?: string | Date;
  startDate?: string | Date; // Alternative naming for consistency
  end_date?: string | Date;
  endDate?: string | Date; // Alternative naming for consistency
  button_text?: string;
  buttonText?: string; // Alternative naming for consistency
  button_link?: string;
  buttonLink?: string; // Alternative naming for consistency
  background_color?: string;
  backgroundColor?: string; // Alternative naming for consistency
  text_color?: string;
  textColor?: string; // Alternative naming for consistency
  created_at: string | Date;
  createdAt?: string | Date; // Alternative naming for consistency
  updated_at: string | Date;
  updatedAt?: string | Date; // Alternative naming for consistency
};

export type SplashStats = {
  total: number;
  active: number;
  inactive: number;
  withProducts: number;
  scheduled: number;
};

export type SplashState = {
  splashScreens: Splash[];
  activeSplashScreens: Splash[];
  splash: Splash | null;
  stats: SplashStats | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
  isStatusToggled: boolean;
  isOrdersUpdated: boolean;
  isBulkUpdated: boolean;
};

// Order update type for drag & drop functionality
export type OrderUpdate = {
  id: string;
  displayOrder: number;
};

// Bulk status update type
export type BulkStatusUpdate = {
  ids: string[];
  isActive: boolean;
};