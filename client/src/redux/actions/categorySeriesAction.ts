import {
  GetAllCategorySeries,
  GetCategorySeriesDetails,
  CreateCategorySeries,
  UpdateCategorySeries,
  DeleteCategorySeries,
  ClearCategorySeriesErrors,
} from "../constants/categorySeriesConstants";
import type { CategorySeries } from "../constants/categorySeriesConstants";
import api from "../api";
import type { Dispatch, AnyAction } from "redux";

const getErrorMessage = (error: any): string => {
  return error.response?.data?.message || error.message || "An error occurred";
};

export const getAllCategorySeries = (categoryId?: string) => async (
  dispatch: Dispatch<AnyAction>
): Promise<any> => {
  try {
    dispatch({ type: GetAllCategorySeries.Request });
    const response = await api.get("categorySeries", { params: categoryId ? { categoryId } : {} });
    const series = response.data?.data || [];
    dispatch({ type: GetAllCategorySeries.Success, payload: series });
    return response.data;
  } catch (error) {
    dispatch({ type: GetAllCategorySeries.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const getCategorySeriesDetails = (id: string) => async (
  dispatch: Dispatch<AnyAction>
): Promise<any> => {
  try {
    dispatch({ type: GetCategorySeriesDetails.Request });
    const response = await api.get(`categorySeries/${id}`);
    dispatch({ type: GetCategorySeriesDetails.Success, payload: response.data?.data });
    return response.data;
  } catch (error) {
    dispatch({ type: GetCategorySeriesDetails.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const createCategorySeries = (payload: {
  series_name: string;
  category_id: string;
  is_active?: boolean;
}) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: CreateCategorySeries.Request });
    const response = await api.post("categorySeries", payload);
    dispatch({ type: CreateCategorySeries.Success, payload: response.data?.data });
    return response.data;
  } catch (error) {
    dispatch({ type: CreateCategorySeries.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const updateCategorySeries = (
  id: string,
  payload: { series_name: string; category_id: string; is_active?: boolean }
) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: UpdateCategorySeries.Request });
    const response = await api.put(`categorySeries/${id}`, payload);
    dispatch({ type: UpdateCategorySeries.Success, payload: response.data?.data });
    return response.data;
  } catch (error) {
    dispatch({ type: UpdateCategorySeries.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const deleteCategorySeries = (id: string) => async (
  dispatch: Dispatch<AnyAction>
): Promise<any> => {
  try {
    dispatch({ type: DeleteCategorySeries.Request });
    const response = await api.delete(`categorySeries/${id}`);
    dispatch({ type: DeleteCategorySeries.Success, payload: id });
    return response.data;
  } catch (error) {
    dispatch({ type: DeleteCategorySeries.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const clearCategorySeriesErrors = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: ClearCategorySeriesErrors });
};

export type { CategorySeries };
