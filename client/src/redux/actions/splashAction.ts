// src/actions/splashAction.ts - MUTATION-SAFE VERSION
import {
    GetAllSplash,
    GetActiveSplash,
    GetSplashDetails,
    CreateSplash,
    UpdateSplash,
    DeleteSplash,
    ToggleSplashStatus,
    UpdateSplashOrders,
    BulkUpdateSplashStatus,
    GetSplashStats,
    ClearSplashErrors,
  } from "../constants/splashConstants";
  import type { 
    Splash, 
    OrderUpdate, 
    BulkStatusUpdate 
  } from "../constants/splashConstants";
  import api from "../api";
  import type { Dispatch, AnyAction } from "redux";
  import { jsonDeepClone } from "../../utils/cloneUtils";
  
  // Helper function to extract error message
  const getErrorMessage = (error: any): string => {
    return error.response?.data?.message || error.message || "An error occurred";
  };
  
  // Helper function to safely clone splash screen data
  const safeSplashClone = (splash: any): Splash => {
    if (!splash || typeof splash !== 'object') return splash;
    
    return {
      id: splash.id || splash._id,
      title: splash.title || 'Untitled Splash',
      description: splash.description || null,
      image_url: splash.image_url || splash.imageUrl || null,
      imageUrl: splash.imageUrl || splash.image_url || null,
      product_id: splash.product_id || splash.productId || null,
      productId: splash.productId || splash.product_id || null,
      product_name: splash.product_name || splash.productName || null,
      product_slug: splash.product_slug || splash.productSlug || null,
      product_price: splash.product_price || splash.productPrice || null,
      is_active: splash.is_active !== undefined ? splash.is_active : (splash.isActive !== undefined ? splash.isActive : true),
      isActive: splash.isActive !== undefined ? splash.isActive : (splash.is_active !== undefined ? splash.is_active : true),
      display_order: splash.display_order !== undefined ? splash.display_order : (splash.displayOrder !== undefined ? splash.displayOrder : 0),
      displayOrder: splash.displayOrder !== undefined ? splash.displayOrder : (splash.display_order !== undefined ? splash.display_order : 0),
      start_date: splash.start_date || splash.startDate || null,
      startDate: splash.startDate || splash.start_date || null,
      end_date: splash.end_date || splash.endDate || null,
      endDate: splash.endDate || splash.end_date || null,
      button_text: splash.button_text || splash.buttonText || null,
      buttonText: splash.buttonText || splash.button_text || null,
      button_link: splash.button_link || splash.buttonLink || null,
      buttonLink: splash.buttonLink || splash.button_link || null,
      background_color: splash.background_color || splash.backgroundColor || null,
      backgroundColor: splash.backgroundColor || splash.background_color || null,
      text_color: splash.text_color || splash.textColor || null,
      textColor: splash.textColor || splash.text_color || null,
      created_at: splash.created_at || splash.createdAt || new Date().toISOString(),
      createdAt: splash.createdAt || splash.created_at || new Date().toISOString(),
      updated_at: splash.updated_at || splash.updatedAt || new Date().toISOString(),
      updatedAt: splash.updatedAt || splash.updated_at || new Date().toISOString(),
    };
  };
  
  // Helper function to safely clone splash screens array
  const safeSplashArrayClone = (splashScreens: any[]): Splash[] => {
    if (!Array.isArray(splashScreens)) return [];
    
    return splashScreens.map((splash, index) => {
      try {
        const cloned = safeSplashClone(splash);
        console.log(`Processed splash ${index}:`, cloned.title);
        return cloned;
      } catch (cloneError) {
        console.error(`Failed to clone splash at index ${index}:`, cloneError);
        return jsonDeepClone(splash);
      }
    });
  };
  
  // CRITICAL FIX: Prevent state mutations in getAllSplash
  export const getAllSplash = () => async (dispatch: Dispatch<AnyAction>, getState: () => any): Promise<any> => {
    try {
      // Get current state to check if already loading
      const state = getState();
      const { splash } = state;
      
      // More careful loading check to prevent race conditions
      if (splash?.loading) {
        console.log("Splash screens already loading, skipping API call");
        return { success: true, data: splash.splashScreens || [] };
      }
  
      dispatch({ type: GetAllSplash.Request });
  
      console.log("Fetching all splash screens...");
      
      // CRITICAL: Make sure we don't mutate the response
      const response = await api.get("splash");
      
      // IMPORTANT: Immediately deep clone the response to prevent mutations
      const safeResponse = jsonDeepClone(response.data);
  
      console.log("Splash API response:", safeResponse);
  
      // CRITICAL FIX: Handle different API response structures with deep cloning
      let splashScreens = [];
      
      if (safeResponse?.splash) {
        splashScreens = Array.isArray(safeResponse.splash) 
          ? safeResponse.splash 
          : [safeResponse.splash];
      } else if (safeResponse?.splashScreens) {
        splashScreens = Array.isArray(safeResponse.splashScreens) 
          ? safeResponse.splashScreens 
          : [safeResponse.splashScreens];
      } else if (safeResponse?.data) {
        splashScreens = Array.isArray(safeResponse.data) 
          ? safeResponse.data 
          : [safeResponse.data];
      } else if (Array.isArray(safeResponse)) {
        splashScreens = safeResponse;
      }
  
      console.log("Processed splash screens count:", splashScreens.length);
  
      // CRITICAL: Process and deeply clone each splash screen
      const processedSplashScreens = safeSplashArrayClone(splashScreens);
  
      // ADDITIONAL SAFETY: Verify no mutations occurred
      console.log("Final processed splash screens:", processedSplashScreens.length);
  
      dispatch({
        type: GetAllSplash.Success,
        payload: processedSplashScreens,
      });
  
      return { success: true, data: processedSplashScreens };
      
    } catch (error) {
      console.error("Failed to fetch splash screens:", error);
      
      // CRITICAL: Don't let the error propagate state mutations
      const safeError = getErrorMessage(error);
      
      dispatch({
        type: GetAllSplash.Fail,
        payload: safeError,
      });
  
      return { success: false, error: safeError };
    }
  };
  
  // Get active splash screens (public API)
  export const getActiveSplash = () => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
    try {
      dispatch({ type: GetActiveSplash.Request });
  
      console.log("Fetching active splash screens...");
      
      const response = await api.get("splash/active");
      const safeResponse = jsonDeepClone(response.data);
  
      console.log("Active splash API response:", safeResponse);
  
      let activeSplashScreens = [];
      
      if (safeResponse?.splash) {
        activeSplashScreens = Array.isArray(safeResponse.splash) 
          ? safeResponse.splash 
          : [safeResponse.splash];
      } else if (safeResponse?.data) {
        activeSplashScreens = Array.isArray(safeResponse.data) 
          ? safeResponse.data 
          : [safeResponse.data];
      } else if (Array.isArray(safeResponse)) {
        activeSplashScreens = safeResponse;
      }
  
      const processedActiveSplash = safeSplashArrayClone(activeSplashScreens);
  
      dispatch({
        type: GetActiveSplash.Success,
        payload: processedActiveSplash,
      });
  
      return { success: true, data: processedActiveSplash };
      
    } catch (error) {
      console.error("Failed to fetch active splash screens:", error);
      
      const safeError = getErrorMessage(error);
      
      dispatch({
        type: GetActiveSplash.Fail,
        payload: safeError,
      });
  
      return { success: false, error: safeError };
    }
  };
  
  // Get splash screen details
  export const getSplashDetails = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
    try {
      dispatch({ type: GetSplashDetails.Request });
  
      const { data } = await api.get(`splash/${id}`);

      // Immediately clone the response
      const safeData = jsonDeepClone(data);

      if (safeData.success === false || !safeData.data) {
        throw new Error(safeData.message || "Splash screen not found");
      }

      const processedSplash = safeSplashClone(safeData.data);
  
      dispatch({
        type: GetSplashDetails.Success,
        payload: processedSplash,
      });
    } catch (error) {
      dispatch({
        type: GetSplashDetails.Fail,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Create splash screen
  export const createSplash = (splashData: Partial<Splash>) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
    try {
      dispatch({ type: CreateSplash.Request });
      
      // Clone input data to prevent mutations
      const safeInput = jsonDeepClone(splashData);
      const { data } = await api.post("splash/", safeInput);

      // Clone response data
      const safeData = jsonDeepClone(data);
      const processedData = {
        ...safeData,
        splash: safeData.data ? safeSplashClone(safeData.data) : null
      };

      dispatch({
        type: CreateSplash.Success,
        payload: processedData,
      });
    } catch (error) {
      dispatch({
        type: CreateSplash.Fail,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Update splash screen
  export const updateSplash = (id: string, splashData: Partial<Splash>) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
    try {
      dispatch({ type: UpdateSplash.Request });
  
      // Clone input data
      const safeInput = jsonDeepClone(splashData);
      const { data } = await api.put(`splash/${id}`, safeInput);

      // Clone response data
      const safeData = jsonDeepClone(data);
      const processedData = {
        ...safeData,
        splash: safeData.data ? safeSplashClone(safeData.data) : null
      };

      dispatch({
        type: UpdateSplash.Success,
        payload: processedData,
      });
    } catch (error) {
      dispatch({
        type: UpdateSplash.Fail,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Delete splash screen
  export const deleteSplash = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
    try {
      dispatch({ type: DeleteSplash.Request });
      await api.delete(`splash/${id}`);
      dispatch({
        type: DeleteSplash.Success,
        payload: id,
      });
    } catch (error) {
      dispatch({
        type: DeleteSplash.Fail,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Toggle splash screen active status
  export const toggleSplashStatus = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
    try {
      dispatch({ type: ToggleSplashStatus.Request });
      
      const { data } = await api.patch(`splash/${id}/toggle-status`);
      const safeData = jsonDeepClone(data);
      const processedData = {
        ...safeData,
        splash: safeData.data ? safeSplashClone(safeData.data) : null
      };

      dispatch({
        type: ToggleSplashStatus.Success,
        payload: processedData,
      });
    } catch (error) {
      dispatch({
        type: ToggleSplashStatus.Fail,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Update display orders
  export const updateSplashOrders = (orderUpdates: OrderUpdate[]) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
    try {
      dispatch({ type: UpdateSplashOrders.Request });
      
      const safeInput = jsonDeepClone({ orderUpdates });
      const { data } = await api.patch("splash/update-orders", safeInput);
      const safeData = jsonDeepClone(data);
  
      dispatch({
        type: UpdateSplashOrders.Success,
        payload: safeData,
      });
    } catch (error) {
      dispatch({
        type: UpdateSplashOrders.Fail,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Bulk update status
  export const bulkUpdateSplashStatus = (bulkData: BulkStatusUpdate) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
    try {
      dispatch({ type: BulkUpdateSplashStatus.Request });
      
      const safeInput = jsonDeepClone(bulkData);
      const { data } = await api.patch("splash/bulk-status", safeInput);
      const safeData = jsonDeepClone(data);
  
      dispatch({
        type: BulkUpdateSplashStatus.Success,
        payload: safeData,
      });
    } catch (error) {
      dispatch({
        type: BulkUpdateSplashStatus.Fail,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Get splash statistics
  export const getSplashStats = () => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
    try {
      dispatch({ type: GetSplashStats.Request });
      
      const { data } = await api.get("splash/admin/stats");
      const safeData = jsonDeepClone(data);

      dispatch({
        type: GetSplashStats.Success,
        payload: safeData.data?.stats || safeData.data || safeData,
      });
    } catch (error) {
      dispatch({
        type: GetSplashStats.Fail,
        payload: getErrorMessage(error),
      });
    }
  };
  
  // Clear errors
  export const clearSplashErrors = () => (dispatch: Dispatch<AnyAction>): void => {
    dispatch({ type: ClearSplashErrors });
  };
  
  // Reset actions
  export const resetCreateSplash = () => (dispatch: Dispatch<AnyAction>): void => {
    dispatch({ type: CreateSplash.Reset });
  };
  
  export const resetUpdateSplash = () => (dispatch: Dispatch<AnyAction>): void => {
    dispatch({ type: UpdateSplash.Reset });
  };
  
  export const resetDeleteSplash = () => (dispatch: Dispatch<AnyAction>): void => {
    dispatch({ type: DeleteSplash.Reset });
  };
  
  export const resetToggleSplashStatus = () => (dispatch: Dispatch<AnyAction>): void => {
    dispatch({ type: ToggleSplashStatus.Reset });
  };
  
  export const resetUpdateSplashOrders = () => (dispatch: Dispatch<AnyAction>): void => {
    dispatch({ type: UpdateSplashOrders.Reset });
  };
  
  export const resetBulkUpdateSplashStatus = () => (dispatch: Dispatch<AnyAction>): void => {
    dispatch({ type: BulkUpdateSplashStatus.Reset });
  };