// src/actions/brandAction.ts - FIXED VERSION with deep cloning
import {
  GetAllBrands,
  GetBrandDetails,
  CreateBrand,
  UpdateBrand,
  DeleteBrand,
  ClearBrandErrors,
} from "../constants/brandConstants";
import type { Brand } from "../constants/brandConstants";
import api from "../api";
import type { Dispatch, AnyAction } from "redux";

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  return error.response?.data?.message || error.message || "An error occurred";
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

// FIXED: Get all brands with proper cloning
export const getAllBrands = () => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: GetAllBrands.Request });

    const response = await api.get("brand");

    // FIXED: Deep clone before dispatching
    dispatch({
      type: GetAllBrands.Success,
      payload: safeClone(response.data.brands), // Assuming backend returns { brands: [...] }
    });
  } catch (error) {
    dispatch({
      type: GetAllBrands.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Get brand details with proper cloning
export const getBrandDetails = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: GetBrandDetails.Request });

    const { data } = await api.get(`brand/${id}`);
    // Check if the brand exists
    if (data.success === false || !data.brand) {
      throw new Error(data.message || "Brand not found");
    }

    // FIXED: Deep clone before dispatching
    dispatch({
      type: GetBrandDetails.Success,
      payload: safeClone(data.brand),
    });
  } catch (error) {
    dispatch({
      type: GetBrandDetails.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Get brand details by slug with proper cloning
export const getBrandDetailsBySlug = (slug: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: GetBrandDetails.Request });

    const { data } = await api.get(`brand/slug/${slug}`);
    if (data.success === false || !data.brand) {
      throw new Error(data.message || "Brand not found");
    }

    // FIXED: Deep clone before dispatching
    dispatch({
      type: GetBrandDetails.Success,
      payload: safeClone(data.brand),
    });
  } catch (error) {
    dispatch({
      type: GetBrandDetails.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Create new brand with proper cloning
export const createBrand = (brandData: FormData | Partial<Brand>) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: CreateBrand.Request });
    
    const config = brandData instanceof FormData 
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : {};

    const { data } = await api.post("brand/", brandData, config);
    
    // FIXED: Deep clone before dispatching
    dispatch({
      type: CreateBrand.Success,
      payload: safeClone(data),
    });
  } catch (error) {
    dispatch({
      type: CreateBrand.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Update brand with proper cloning
export const updateBrand = (id: string, brandData: FormData | Partial<Brand>) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateBrand.Request });

    const config = brandData instanceof FormData 
      ? {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      : {};

    const { data } = await api.put(`brand/${id}`, brandData, config);

    // FIXED: Deep clone before dispatching
    dispatch({
      type: UpdateBrand.Success,
      payload: safeClone(data),
    });
  } catch (error) {
    dispatch({
      type: UpdateBrand.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Update brand image with proper cloning
export const updateBrandImage = (id: string, imageData: FormData) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateBrand.Request });

    const { data } = await api.patch(`brand/${id}/image`, imageData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // FIXED: Deep clone before dispatching
    dispatch({
      type: UpdateBrand.Success,
      payload: safeClone(data),
    });
  } catch (error) {
    dispatch({
      type: UpdateBrand.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Remove brand image with proper cloning
export const removeBrandImage = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: UpdateBrand.Request });

    const { data } = await api.delete(`brand/${id}/image`);

    // FIXED: Deep clone before dispatching
    dispatch({
      type: UpdateBrand.Success,
      payload: safeClone(data),
    });
  } catch (error) {
    dispatch({
      type: UpdateBrand.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Delete brand - no changes needed as it only sends ID
export const deleteBrand = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: DeleteBrand.Request });

    await api.delete(`brand/${id}`);

    dispatch({
      type: DeleteBrand.Success,
      payload: id, // Just an ID, no cloning needed
    });
  } catch (error) {
    dispatch({
      type: DeleteBrand.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// FIXED: Get brands with images with proper cloning
export const getBrandsWithImages = () => async (dispatch: Dispatch<AnyAction>): Promise<void> => {
  try {
    dispatch({ type: GetAllBrands.Request });

    const response = await api.get("brand/with-images");

    // FIXED: Deep clone before dispatching
    dispatch({
      type: GetAllBrands.Success,
      payload: safeClone(response.data.brands),
    });
  } catch (error) {
    dispatch({
      type: GetAllBrands.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Clear all errors - no changes needed
export const clearErrors = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: ClearBrandErrors });
};