// src/constants/categoryConstants.ts
import type { ActionTypes } from '../types/actionTypes';

export const GetAllCategories: ActionTypes = {
  Request: "getAllCategoriesRequest",
  Success: "getAllCategoriesSuccess",
  Fail: "getAllCategoriesFail",
};

export const GetCategoryDetails: ActionTypes = {
  Request: "getCategoryDetailsRequest",
  Success: "getCategoryDetailsSuccess",
  Fail: "getCategoryDetailsFail",
};

export const CreateCategory: ActionTypes = {
  Request: "createCategoryRequest",
  Success: "createCategorySuccess",
  Reset: "createCategoryReset",
  Fail: "createCategoryFail",
};

export const UpdateCategory: ActionTypes = {
  Request: "updateCategoryRequest",
  Success: "updateCategorySuccess",
  Reset: "updateCategoryReset",
  Fail: "updateCategoryFail",
};

export const DeleteCategory: ActionTypes = {
  Request: "deleteCategoryRequest",
  Success: "deleteCategorySuccess",
  Reset: "deleteCategoryReset",
  Fail: "deleteCategoryFail",
};

export const ClearCategoryErrors: string = "clearCategoryErrors";

// Category-specific types
export type Category = {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  brandId: string; // This connects the category to its parent brand
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryState = {
  categories: Category[];
  category: Category | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
};