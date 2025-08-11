// src/actions/categoryAction.ts - MUTATION-SAFE VERSION
import {
  GetAllCategories,
  GetCategoryDetails,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  ClearCategoryErrors,
} from "../constants/categoryConstants";
import type { Category } from "../constants/categoryConstants"
import api from "../api";
import type { Dispatch, AnyAction } from "redux";
import { safeCloneCategory, jsonDeepClone } from "../../utils/cloneUtils";

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  return error.response?.data?.message || error.message || "An error occurred";
};

// CRITICAL FIX: Prevent state mutations in getAllCategories
export const getAllCategories = () => async (dispatch: Dispatch<AnyAction>, getState: () => any): Promise<any> => {
  try {
    // Get current state to check if already loading
    const state = getState();
    const { category } = state;
    
    // More careful loading check to prevent race conditions
    if (category?.loading) {
      console.log("Categories already loading, skipping API call");
      return { success: true, data: category.categories || [] };
    }

    dispatch({ type: GetAllCategories.Request });

    console.log("Fetching all categories...");
    
    // CRITICAL: Make sure we don't mutate the response
    const response = await api.get("category");
    
    // IMPORTANT: Immediately deep clone the response to prevent mutations
    const safeResponse = jsonDeepClone(response.data);

    console.log("Categories API response:", safeResponse);

    // CRITICAL FIX: Handle different API response structures with deep cloning
    let categories = [];
    
    if (safeResponse?.category) {
      categories = Array.isArray(safeResponse.category) 
        ? safeResponse.category 
        : [safeResponse.category];
    } else if (safeResponse?.categories) {
      categories = Array.isArray(safeResponse.categories) 
        ? safeResponse.categories 
        : [safeResponse.categories];
    } else if (safeResponse?.data) {
      categories = Array.isArray(safeResponse.data) 
        ? safeResponse.data 
        : [safeResponse.data];
    } else if (Array.isArray(safeResponse)) {
      categories = safeResponse;
    }

    console.log("Processed categories count:", categories.length);

    // CRITICAL: Process and deeply clone each category
    const processedCategories = categories.map((category: any, index: number) => {
      try {
        // Double-check cloning for safety
        const cloned = safeCloneCategory(category);
        console.log(`Processed category ${index}:`, cloned.name);
        return cloned;
      } catch (cloneError) {
        console.error(`Failed to clone category at index ${index}:`, cloneError);
        // Fallback to JSON clone
        return jsonDeepClone(category);
      }
    });

    // ADDITIONAL SAFETY: Verify no mutations occurred
    console.log("Final processed categories:", processedCategories.length);

    dispatch({
      type: GetAllCategories.Success,
      payload: processedCategories,
    });

    return { success: true, data: processedCategories };
    
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    
    // CRITICAL: Don't let the error propagate state mutations
    const safeError = getErrorMessage(error);
    
    dispatch({
      type: GetAllCategories.Fail,
      payload: safeError,
    });

    return { success: false, error: safeError };
  }
};

// FIXED: All other actions with safe cloning
export const getCategoryDetails = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: GetCategoryDetails.Request });

    const { data } = await api.get(`category/${id}`);
    
    // Immediately clone the response
    const safeData = jsonDeepClone(data);
    
    if (safeData.success === false || !safeData.category) {
      throw new Error(safeData.message || "Category not found");
    }

    const processedCategory = safeCloneCategory(safeData.category);

    dispatch({
      type: GetCategoryDetails.Success,
      payload: processedCategory,
    });
  } catch (error) {
    dispatch({
      type: GetCategoryDetails.Fail,
      payload: getErrorMessage(error),
    });
  }
};

export const createCategory = (categoryData: Partial<Category>) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: CreateCategory.Request });
    
    // Clone input data to prevent mutations
    const safeInput = jsonDeepClone(categoryData);
    const { data } = await api.post("category/", safeInput);
    
    // Clone response data
    const safeData = jsonDeepClone(data);
    const processedData = {
      ...safeData,
      category: safeData.category ? safeCloneCategory(safeData.category) : null
    };
    
    dispatch({
      type: CreateCategory.Success,
      payload: processedData,
    });
  } catch (error) {
    dispatch({
      type: CreateCategory.Fail,
      payload: getErrorMessage(error),
    });
  }
};

export const updateCategory = (id: string, categoryData: Partial<Category>) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateCategory.Request });

    // Clone input data
    const safeInput = jsonDeepClone(categoryData);
    const { data } = await api.put(`category/${id}`, safeInput);

    // Clone response data
    const safeData = jsonDeepClone(data);
    const processedData = {
      ...safeData,
      category: safeData.category ? safeCloneCategory(safeData.category) : null
    };

    dispatch({
      type: UpdateCategory.Success,
      payload: processedData,
    });
  } catch (error) {
    dispatch({
      type: UpdateCategory.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Other actions remain the same but with safe cloning...
export const deleteCategory = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: DeleteCategory.Request });
    await api.delete(`category/${id}`);
    dispatch({
      type: DeleteCategory.Success,
      payload: id,
    });
  } catch (error) {
    dispatch({
      type: DeleteCategory.Fail,
      payload: getErrorMessage(error),
    });
  }
};

export const clearErrors = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: ClearCategoryErrors });
};