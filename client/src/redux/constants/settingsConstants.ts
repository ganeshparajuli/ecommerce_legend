import type { ActionTypes } from '../types/actionTypes';

// Store Settings Action Types
export const GetStoreSettings: ActionTypes = {
  Request: "getStoreSettingsRequest",
  Success: "getStoreSettingsSuccess",
  Fail: "getStoreSettingsFail",
};

export const UpdateStoreSettings: ActionTypes = {
  Request: "updateStoreSettingsRequest",
  Success: "updateStoreSettingsSuccess",
  Reset: "updateStoreSettingsReset",
  Fail: "updateStoreSettingsFail",
};

export const UpdateStoreLogo: ActionTypes = {
  Request: "updateStoreLogoRequest",
  Success: "updateStoreLogoSuccess",
  Reset: "updateStoreLogoReset",
  Fail: "updateStoreLogoFail",
};

export const UpdateFooterLogo: ActionTypes = {
  Request: "updateFooterLogoRequest",
  Success: "updateFooterLogoSuccess",
  Reset: "updateFooterLogoReset",
  Fail: "updateFooterLogoFail",
};

// Notification Settings Action Types
export const GetNotificationSettings: ActionTypes = {
  Request: "getNotificationSettingsRequest",
  Success: "getNotificationSettingsSuccess",
  Fail: "getNotificationSettingsFail",
};

export const UpdateNotificationSettings: ActionTypes = {
  Request: "updateNotificationSettingsRequest",
  Success: "updateNotificationSettingsSuccess",
  Reset: "updateNotificationSettingsReset",
  Fail: "updateNotificationSettingsFail",
};

// Clear Errors
export const ClearSettingsErrors: string = "clearSettingsErrors";

// ===== SUB-STORE LOCATIONS ACTION TYPES =====
export const GetStoreLocations = {
  Request: "getStoreLocationsRequest",
  Success: "getStoreLocationsSuccess", 
  Fail: "getStoreLocationsFail",
};

export const GetStoreLocationById = {
  Request: "getStoreLocationByIdRequest",
  Success: "getStoreLocationByIdSuccess",
  Fail: "getStoreLocationByIdFail",
};

export const AddStoreLocation = {
  Request: "addStoreLocationRequest",
  Success: "addStoreLocationSuccess",
  Fail: "addStoreLocationFail",
};

export const UpdateStoreLocation = {
  Request: "updateStoreLocationRequest",
  Success: "updateStoreLocationSuccess",
  Fail: "updateStoreLocationFail",
};

export const DeleteStoreLocation = {
  Request: "deleteStoreLocationRequest",
  Success: "deleteStoreLocationSuccess",
  Fail: "deleteStoreLocationFail",
};

export const ToggleStoreLocationStatus = {
  Request: "toggleStoreLocationStatusRequest",
  Success: "toggleStoreLocationStatusSuccess",
  Fail: "toggleStoreLocationStatusFail",
};

export const ClearStoreLocationsError = "clearStoreLocationsError";
export const ResetStoreLocationOperation = "resetStoreLocationOperation";

// ===== TYPES =====
export type StoreLocation = {
  id: string;
  locationName: string;
  address: string;
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type StoreLocationsState = {
  locations: StoreLocation[];
  selectedLocation: StoreLocation | null;
  loading: boolean;
  error: string | null;
  fetchingById: boolean;
  operationLoading: boolean; // For add/update/delete operations
  operationSuccess: boolean;
  operationError: string | null;
};

export type StoreSettings = {
  id?: string;
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  logo?: string;
  footerLogo?: string;
  storeDescription?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  businessHours?: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  currency?: string;
  timezone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  subStoreLocations?: StoreLocation[];
};

export type NotificationSettings = {
  id?: string;
  orderConfirmation: boolean;
  orderDelivery: boolean;
  lowStockAlert: boolean;
  newUserRegistration?: boolean;
  orderCancellation?: boolean;
  paymentConfirmation?: boolean;
  newsletterSubscription?: boolean;
  promotionalEmails?: boolean;
  smsNotifications?: boolean;
  emailNotifications?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export type StoreSettingsFormData = {
  storeName?: string;
  storeEmail?: string;
  storePhone?: string;
  storeAddress?: string;
  logo?: File;
  footerLogo?: File;
  storeDescription?: string;
  website?: string;
  socialMedia?: StoreSettings['socialMedia'];
  businessHours?: StoreSettings['businessHours'];
  currency?: string;
  timezone?: string;
  subStoreLocations?: StoreLocation[];
};

export type SettingsState = {
  // Store Settings
  storeSettings: StoreSettings | null;
  storeLoading: boolean;
  storeError: string | null;
  storeSuccess: boolean;
  storeUpdated: boolean;
  logoUploading: boolean;
  footerLogoUploading: boolean;

  // Notification Settings
  notificationSettings: NotificationSettings | null;
  notificationLoading: boolean;
  notificationError: string | null;
  notificationSuccess: boolean;
  notificationUpdated: boolean;

  // Sub-Store Locations
  locations: StoreLocation[];
  selectedLocation: StoreLocation | null;
  locationsLoading: boolean;
  locationsError: string | null;
  fetchingLocationById: boolean;
  locationOperationLoading: boolean;
  locationOperationSuccess: boolean;
  locationOperationError: string | null;

  // General
  loading: boolean;
  error: string | null;
};