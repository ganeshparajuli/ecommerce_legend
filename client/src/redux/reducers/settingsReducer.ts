import {
  GetStoreSettings,
  GetStoreLocations,
  GetStoreLocationById,
  AddStoreLocation,
  UpdateStoreLocation,
  DeleteStoreLocation,
  ToggleStoreLocationStatus,
  ClearStoreLocationsError,
  ResetStoreLocationOperation,
  UpdateStoreSettings,
  UpdateStoreLogo,
  UpdateFooterLogo,
  GetNotificationSettings,
  UpdateNotificationSettings,
  ClearSettingsErrors,
} from "../constants/settingsConstants";
import type { SettingsState } from "../constants/settingsConstants";
import type { Reducer, AnyAction } from 'redux';

const initialState: SettingsState = {
  // Store Settings
  storeSettings: null,
  storeLoading: false,
  storeError: null,
  storeSuccess: false,
  storeUpdated: false,
  logoUploading: false,
  footerLogoUploading: false,

  // Notification Settings
  notificationSettings: null,
  notificationLoading: false,
  notificationError: null,
  notificationSuccess: false,
  notificationUpdated: false,

  // Sub-Store Locations
  locations: [],
  selectedLocation: null,
  locationsLoading: false,
  locationsError: null,
  fetchingLocationById: false,
  locationOperationLoading: false,
  locationOperationSuccess: false,
  locationOperationError: null,

  // General
  loading: false,
  error: null,
};

export const settingsReducer: Reducer<SettingsState, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    // ===== STORE SETTINGS =====
    
    case GetStoreSettings.Request:
      return {
        ...state,
        storeLoading: true,
        loading: true,
        storeError: null,
        error: null,
      };

    case GetStoreSettings.Success:
      return {
        ...state,
        storeLoading: false,
        loading: false,
        storeSettings: action.payload,
        storeError: null,
        error: null,
      };

    case GetStoreSettings.Fail:
      return {
        ...state,
        storeLoading: false,
        loading: false,
        storeError: action.payload,
        error: action.payload,
      };

    case UpdateStoreSettings.Request:
      return {
        ...state,
        storeLoading: true,
        loading: true,
        storeError: null,
        error: null,
        storeSuccess: false,
        storeUpdated: false,
      };

    case UpdateStoreSettings.Success:
      return {
        ...state,
        storeLoading: false,
        loading: false,
        storeSuccess: true,
        storeUpdated: true,
        storeSettings: action.payload,
        storeError: null,
        error: null,
      };

    case UpdateStoreSettings.Fail:
      return {
        ...state,
        storeLoading: false,
        loading: false,
        storeError: action.payload,
        error: action.payload,
        storeSuccess: false,
        storeUpdated: false,
      };

    case UpdateStoreSettings.Reset:
      return {
        ...state,
        storeSuccess: false,
        storeUpdated: false,
        storeError: null,
        error: null,
      };

    case UpdateStoreLogo.Request:
      return {
        ...state,
        logoUploading: true,
        storeError: null,
        error: null,
        storeUpdated: false,
      };

    case UpdateStoreLogo.Success:
      return {
        ...state,
        logoUploading: false,
        storeUpdated: true,
        storeSettings: action.payload,
        storeError: null,
        error: null,
      };

    case UpdateStoreLogo.Fail:
      return {
        ...state,
        logoUploading: false,
        storeError: action.payload,
        error: action.payload,
        storeUpdated: false,
      };

    case UpdateStoreLogo.Reset:
      return {
        ...state,
        logoUploading: false,
        storeUpdated: false,
        storeError: null,
        error: null,
      };

    case UpdateFooterLogo.Request:
      return {
        ...state,
        footerLogoUploading: true,
        storeError: null,
        error: null,
        storeUpdated: false,
      };

    case UpdateFooterLogo.Success:
      return {
        ...state,
        footerLogoUploading: false,
        storeUpdated: true,
        storeSettings: action.payload,
        storeError: null,
        error: null,
      };

    case UpdateFooterLogo.Fail:
      return {
        ...state,
        footerLogoUploading: false,
        storeError: action.payload,
        error: action.payload,
        storeUpdated: false,
      };

    case UpdateFooterLogo.Reset:
      return {
        ...state,
        footerLogoUploading: false,
        storeUpdated: false,
        storeError: null,
        error: null,
      };

    // ===== NOTIFICATION SETTINGS =====
    
    case GetNotificationSettings.Request:
      return {
        ...state,
        notificationLoading: true,
        loading: true,
        notificationError: null,
        error: null,
      };

    case GetNotificationSettings.Success:
      return {
        ...state,
        notificationLoading: false,
        loading: false,
        notificationSettings: action.payload,
        notificationError: null,
        error: null,
      };

    case GetNotificationSettings.Fail:
      return {
        ...state,
        notificationLoading: false,
        loading: false,
        notificationError: action.payload,
        error: action.payload,
      };

    case UpdateNotificationSettings.Request:
      return {
        ...state,
        notificationLoading: true,
        loading: true,
        notificationError: null,
        error: null,
        notificationSuccess: false,
        notificationUpdated: false,
      };

    case UpdateNotificationSettings.Success:
      return {
        ...state,
        notificationLoading: false,
        loading: false,
        notificationSuccess: true,
        notificationUpdated: true,
        notificationSettings: action.payload,
        notificationError: null,
        error: null,
      };

    case UpdateNotificationSettings.Fail:
      return {
        ...state,
        notificationLoading: false,
        loading: false,
        notificationError: action.payload,
        error: action.payload,
        notificationSuccess: false,
        notificationUpdated: false,
      };

    case UpdateNotificationSettings.Reset:
      return {
        ...state,
        notificationSuccess: false,
        notificationUpdated: false,
        notificationError: null,
        error: null,
      };

    // ===== SUB-STORE LOCATIONS =====
    
    case GetStoreLocations.Request:
      return {
        ...state,
        locationsLoading: true,
        locationsError: null,
      };

    case GetStoreLocations.Success:
      return {
        ...state,
        locationsLoading: false,
        locations: action.payload,
        locationsError: null,
      };

    case GetStoreLocations.Fail:
      return {
        ...state,
        locationsLoading: false,
        locationsError: action.payload,
      };

    case GetStoreLocationById.Request:
      return {
        ...state,
        fetchingLocationById: true,
        locationsError: null,
      };

    case GetStoreLocationById.Success:
      return {
        ...state,
        fetchingLocationById: false,
        selectedLocation: action.payload,
        locationsError: null,
      };

    case GetStoreLocationById.Fail:
      return {
        ...state,
        fetchingLocationById: false,
        locationsError: action.payload,
      };

    // Add Store Location
    case AddStoreLocation.Request:
      return {
        ...state,
        locationOperationLoading: true,
        locationOperationError: null,
        locationOperationSuccess: false,
      };

    case AddStoreLocation.Success:
      return {
        ...state,
        locationOperationLoading: false,
        locationOperationSuccess: true,
        locationOperationError: null,
        locations: [...state.locations, action.payload],
      };

    case AddStoreLocation.Fail:
      return {
        ...state,
        locationOperationLoading: false,
        locationOperationError: action.payload,
        locationOperationSuccess: false,
      };

    // Update Store Location
    case UpdateStoreLocation.Request:
      return {
        ...state,
        locationOperationLoading: true,
        locationOperationError: null,
        locationOperationSuccess: false,
      };

    case UpdateStoreLocation.Success:
      return {
        ...state,
        locationOperationLoading: false,
        locationOperationSuccess: true,
        locationOperationError: null,
        locations: state.locations.map(location =>
          location.id === action.payload.id ? action.payload : location
        ),
        selectedLocation: state.selectedLocation?.id === action.payload.id 
          ? action.payload 
          : state.selectedLocation,
      };

    case UpdateStoreLocation.Fail:
      return {
        ...state,
        locationOperationLoading: false,
        locationOperationError: action.payload,
        locationOperationSuccess: false,
      };

    // Delete Store Location
    case DeleteStoreLocation.Request:
      return {
        ...state,
        locationOperationLoading: true,
        locationOperationError: null,
        locationOperationSuccess: false,
      };

    case DeleteStoreLocation.Success:
      return {
        ...state,
        locationOperationLoading: false,
        locationOperationSuccess: true,
        locationOperationError: null,
        locations: state.locations.filter(location => location.id !== action.payload),
        selectedLocation: state.selectedLocation?.id === action.payload 
          ? null 
          : state.selectedLocation,
      };

    case DeleteStoreLocation.Fail:
      return {
        ...state,
        locationOperationLoading: false,
        locationOperationError: action.payload,
        locationOperationSuccess: false,
      };

    // Toggle Store Location Status
    case ToggleStoreLocationStatus.Request:
      return {
        ...state,
        locationOperationLoading: true,
        locationOperationError: null,
        locationOperationSuccess: false,
      };

    case ToggleStoreLocationStatus.Success:
      return {
        ...state,
        locationOperationLoading: false,
        locationOperationSuccess: true,
        locationOperationError: null,
        locations: state.locations.map(location =>
          location.id === action.payload.id ? action.payload : location
        ),
        selectedLocation: state.selectedLocation?.id === action.payload.id 
          ? action.payload 
          : state.selectedLocation,
      };

    case ToggleStoreLocationStatus.Fail:
      return {
        ...state,
        locationOperationLoading: false,
        locationOperationError: action.payload,
        locationOperationSuccess: false,
      };

    // Clear Errors and Reset
    case ClearSettingsErrors:
      return {
        ...state,
        storeError: null,
        notificationError: null,
        error: null,
      };

    case ClearStoreLocationsError:
      return {
        ...state,
        locationsError: null,
        locationOperationError: null,
      };

    case ResetStoreLocationOperation:
      return {
        ...state,
        locationOperationLoading: false,
        locationOperationSuccess: false,
        locationOperationError: null,
      };

    default:
      return state;
  }
};