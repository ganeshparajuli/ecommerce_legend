// newsletterAction.ts - FIXED VERSION with deep cloning
import {
  CreateNewsletter,
  ClearNewsletterErrors,
  DeleteNewsletter,
  GetAllNewsletters,
  GetNewsletterDetails
} from "../constants/newsletterConstant";
import type { Newsletter } from "../constants/newsletterConstant";
import api from "../api";
import type { Dispatch, AnyAction } from "redux";

// Helper function to extract error message
const getErrorMessage = (error: any): string =>
  error.response?.data?.message || error.message || "An error occurred";

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

// FIXED: Get all newsletters with proper cloning
export const getAllNewsletters = () => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {


    dispatch({ type: GetAllNewsletters.Request });
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await api.get("newsletters",config);
    
    if (data.success === false || !data.data) {
      throw new Error(data.message || "No newsletters found");
    }
    
    // CRITICAL FIX: Deep clone the data before dispatching
    dispatch({
      type: GetAllNewsletters.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: GetAllNewsletters.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Get newsletter details with proper cloning
export const getNewsletterDetails = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: GetNewsletterDetails.Request });
    const { data } = await api.get(`newsletters/${id}`);

    if (data.success === false || !data.data) {
      throw new Error(data.message || "Newsletter not found");
    }

    // FIXED: Deep clone the newsletter data before dispatching
    dispatch({
      type: GetNewsletterDetails.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: GetNewsletterDetails.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Create a new newsletter with proper cloning
export const createNewsletter = (newsletter: Newsletter) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: CreateNewsletter.Request });
    const { data } = await api.post("newsletters", newsletter);

    if (data.success === false || !data.data) {
      throw new Error(data.message || "Failed to create newsletter");
    }

    // FIXED: Deep clone the newsletter data before dispatching
    dispatch({
      type: CreateNewsletter.Success,
      payload: safeClone(data.data),
    });
  } catch (error) {
    dispatch({
      type: CreateNewsletter.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Subscribe to newsletter (alias for createNewsletter for better semantics)
export const subscribeNewsletter = (email: string, name?: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  const newsletterData: Omit<Newsletter, 'id' | 'subscribedAt'> = {
    email,
    name: name || email.split('@')[0], // Use email prefix as name if not provided
    status: true
  };
  
  return dispatch(createNewsletter(newsletterData as Newsletter));
};

// Subscribe with email only (backward compatibility)
export const subscribeNewsletterEmail = (email: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  return dispatch(subscribeNewsletter(email));
};

// Delete a newsletter - no changes needed as it only sends a message
export const deleteNewsletter = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: DeleteNewsletter.Request });
    const { data } = await api.delete(`newsletters/${id}`);
    
    if (data.success === false) {
      throw new Error(data.message || "Failed to delete newsletter");
    }
    
    dispatch({
      type: DeleteNewsletter.Success,
      payload: data.message, // Just a string message, no cloning needed
    });
  } catch (error) {
    dispatch({
      type: DeleteNewsletter.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Unsubscribe from newsletter - no changes needed as it only sends a message
export const unsubscribeNewsletter = (email: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: DeleteNewsletter.Request });
    const { data } = await api.post("newsletters/unsubscribe", { email });
    
    if (data.success === false) {
      throw new Error(data.message || "Failed to unsubscribe");
    }
    
    dispatch({
      type: DeleteNewsletter.Success,
      payload: data.message, // Just a string message, no cloning needed
    });
    
    // Refresh the newsletter list
    dispatch(getAllNewsletters());
  } catch (error) {
    dispatch({
      type: DeleteNewsletter.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Clear newsletter errors - no changes needed
export const clearNewsletterErrors = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: ClearNewsletterErrors });
};

// Reset newsletter creation state - no changes needed
export const resetNewsletterCreate = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: CreateNewsletter.Reset });
};

// Reset newsletter deletion state - no changes needed
export const resetNewsletterDelete = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: DeleteNewsletter.Reset });
};