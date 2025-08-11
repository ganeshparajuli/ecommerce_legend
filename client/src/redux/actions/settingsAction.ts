// settingsAction.ts - Complete version with sub-store location CRUD

import {
  GetStoreLocations, 
  GetStoreLocationById, 
  AddStoreLocation,
  UpdateStoreLocation,
  DeleteStoreLocation,
  ToggleStoreLocationStatus,
  ClearStoreLocationsError,
  ResetStoreLocationOperation,
  GetStoreSettings,
  UpdateStoreSettings,
  UpdateStoreLogo,
  UpdateFooterLogo,
  GetNotificationSettings,
  UpdateNotificationSettings,
  ClearSettingsErrors,
} from "../constants/settingsConstants";
import type { 
  StoreSettings, 
  NotificationSettings, 
  StoreSettingsFormData,
  StoreLocation 
} from "../constants/settingsConstants";
import api from "../api";
import type { Dispatch, AnyAction } from "redux";

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  return error.response?.data?.error || error.response?.data?.message || error.message || "An error occurred";
};

// CRITICAL: Helper function to safely clone any data before dispatching
const safeClone = (data: any): any => {
  if (data === null || data === undefined) return data;
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Failed to clone data:", error);
    return data;
  }
};

// ===== STORE SETTINGS ACTIONS =====

export const getStoreSettings = () => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: GetStoreSettings.Request });

    const response = await api.get("store-settings");

    dispatch({
      type: GetStoreSettings.Success,
      payload: safeClone(response.data.data),
    });
  } catch (error) {
    dispatch({
      type: GetStoreSettings.Fail,
      payload: getErrorMessage(error),
    });
  }
};

export const updateStoreSettings = (settingsData: FormData | StoreSettingsFormData) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateStoreSettings.Request });
    
    const config = settingsData instanceof FormData 
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : {};

    const { data } = await api.put("store-settings", settingsData, config);
    
    dispatch({
      type: UpdateStoreSettings.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: UpdateStoreSettings.Fail,
      payload: getErrorMessage(error),
    });
  }
};

export const updateStoreLogo = (logoData: FormData) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateStoreLogo.Request });

    const { data } = await api.patch("store-settings/logo", logoData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    dispatch({
      type: UpdateStoreLogo.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: UpdateStoreLogo.Fail,
      payload: getErrorMessage(error),
    });
  }
};

export const updateFooterLogo = (logoData: FormData) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateFooterLogo.Request });

    const { data } = await api.patch("store-settings/footer-logo", logoData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    dispatch({
      type: UpdateFooterLogo.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: UpdateFooterLogo.Fail,
      payload: getErrorMessage(error),
    });
  }
};

export const removeStoreLogo = () => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateStoreLogo.Request });

    const { data } = await api.delete("store-settings/logo");

    dispatch({
      type: UpdateStoreLogo.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: UpdateStoreLogo.Fail,
      payload: getErrorMessage(error),
    });
  }
};

export const removeFooterLogo = () => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateFooterLogo.Request });

    const { data } = await api.delete("store-settings/footer-logo");

    dispatch({
      type: UpdateFooterLogo.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: UpdateFooterLogo.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// ===== NOTIFICATION SETTINGS ACTIONS =====

export const getNotificationSettings = () => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: GetNotificationSettings.Request });

    const response = await api.get("notification-settings");

    dispatch({
      type: GetNotificationSettings.Success,
      payload: safeClone(response.data.data),
    });
  } catch (error) {
    dispatch({
      type: GetNotificationSettings.Fail,
      payload: getErrorMessage(error),
    });
  }
};

export const updateNotificationSettings = (settings: Partial<NotificationSettings>) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateNotificationSettings.Request });

    const { data } = await api.put("notification-settings", settings);
    
    dispatch({
      type: UpdateNotificationSettings.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: UpdateNotificationSettings.Fail,
      payload: getErrorMessage(error),
    });
  }
};

export const resetNotificationSettings = () => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateNotificationSettings.Request });

    const { data } = await api.post("notification-settings/reset");
    
    dispatch({
      type: UpdateNotificationSettings.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: UpdateNotificationSettings.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// ===== SUB-STORE LOCATIONS ACTIONS =====

// Get all store locations
export const getStoreLocations = (activeOnly: boolean = false) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: GetStoreLocations.Request });

    const response = await api.get(`store-settings/locations${activeOnly ? '?activeOnly=true' : ''}`);

    dispatch({
      type: GetStoreLocations.Success,
      payload: safeClone(response.data.data || []),
    });
  } catch (error) {
    console.error("Error fetching store locations:", error);
    dispatch({
      type: GetStoreLocations.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Get store location by ID
export const getStoreLocationById = (locationId: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: GetStoreLocationById.Request });

    const response = await api.get(`store-settings/locations/${locationId}`);

    dispatch({
      type: GetStoreLocationById.Success,
      payload: safeClone(response.data.data),
    });
  } catch (error) {
    console.error("Error fetching store location:", error);
    dispatch({
      type: GetStoreLocationById.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Add new store location
export const addStoreLocation = (locationData: Omit<StoreLocation, 'id' | 'createdAt' | 'updatedAt'>) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: AddStoreLocation.Request });

    const response = await api.post("store-settings/locations", locationData);

    dispatch({
      type: AddStoreLocation.Success,
      payload: safeClone(response.data.data),
    });

    // Also refresh the full locations list
    dispatch(getStoreLocations() as any);
  } catch (error) {
    console.error("Error adding store location:", error);
    dispatch({
      type: AddStoreLocation.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Update store location
export const updateStoreLocation = (locationId: string, updateData: Partial<StoreLocation>) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateStoreLocation.Request });

    const response = await api.put(`store-settings/locations/${locationId}`, updateData);

    dispatch({
      type: UpdateStoreLocation.Success,
      payload: safeClone(response.data.data),
    });

    // Also refresh the full locations list
    dispatch(getStoreLocations() as any);
  } catch (error) {
    console.error("Error updating store location:", error);
    dispatch({
      type: UpdateStoreLocation.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Delete store location
export const deleteStoreLocation = (locationId: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: DeleteStoreLocation.Request });

    await api.delete(`store-settings/locations/${locationId}`);

    dispatch({
      type: DeleteStoreLocation.Success,
      payload: locationId,
    });

    // Also refresh the full locations list
    dispatch(getStoreLocations() as any);
  } catch (error) {
    console.error("Error deleting store location:", error);
    dispatch({
      type: DeleteStoreLocation.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Toggle store location status
export const toggleStoreLocationStatus = (locationId: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: ToggleStoreLocationStatus.Request });

    const response = await api.patch(`store-settings/locations/${locationId}/toggle-status`);

    dispatch({
      type: ToggleStoreLocationStatus.Success,
      payload: safeClone(response.data.data),
    });

    // Also refresh the full locations list
    dispatch(getStoreLocations() as any);
  } catch (error) {
    console.error("Error toggling store location status:", error);
    dispatch({
      type: ToggleStoreLocationStatus.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// ===== RESET ACTIONS =====

export const resetStoreSettingsState = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: UpdateStoreSettings.Reset });
};

export const resetNotificationSettingsState = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: UpdateNotificationSettings.Reset });
};

export const resetLogoUploadState = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: UpdateStoreLogo.Reset });
};

export const resetFooterLogoUploadState = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: UpdateFooterLogo.Reset });
};

export const clearSettingsErrors = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: ClearSettingsErrors });
};

// Clear store locations error
export const clearStoreLocationsError = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: ClearStoreLocationsError });
};

// Reset store location operation state
export const resetStoreLocationOperation = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: ResetStoreLocationOperation });
};

export const loadInitialSettings = () => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    await Promise.all([
      dispatch(getStoreSettings()),
      dispatch(getNotificationSettings()),
      dispatch(getStoreLocations()),
    ]);
  } catch (error) {
    console.error('Failed to load initial settings:', error);
  }
};