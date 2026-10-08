import type { ActionTypes } from "../types/actionTypes";
import type { Category } from "./categoryConstants";

export const GetAllCategorySeries: ActionTypes = {
  Request: "getAllCategorySeriesRequest",
  Success: "getAllCategorySeriesSuccess",
  Fail: "getAllCategorySeriesFail",
};

export const GetCategorySeriesDetails: ActionTypes = {
  Request: "getCategorySeriesDetailsRequest",
  Success: "getCategorySeriesDetailsSuccess",
  Fail: "getCategorySeriesDetailsFail",
};

export const CreateCategorySeries: ActionTypes = {
  Request: "createCategorySeriesRequest",
  Success: "createCategorySeriesSuccess",
  Reset: "createCategorySeriesReset",
  Fail: "createCategorySeriesFail",
};

export const UpdateCategorySeries: ActionTypes = {
  Request: "updateCategorySeriesRequest",
  Success: "updateCategorySeriesSuccess",
  Reset: "updateCategorySeriesReset",
  Fail: "updateCategorySeriesFail",
};

export const DeleteCategorySeries: ActionTypes = {
  Request: "deleteCategorySeriesRequest",
  Success: "deleteCategorySeriesSuccess",
  Reset: "deleteCategorySeriesReset",
  Fail: "deleteCategorySeriesFail",
};

export const ClearCategorySeriesErrors: string = "clearCategorySeriesErrors";

export type CategorySeries = {
  id: string;
  categoryId: string;
  seriesName: string;
  isActive: boolean;
  category?: Category & { brand?: { id: string; name: string } };
  createdAt?: Date;
  updatedAt?: Date;
};

export type CategorySeriesState = {
  categorySeries: CategorySeries[];
  series: CategorySeries | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
};
