// src/constants/brandConstants.ts
import type { ActionTypes } from '../types/actionTypes';

export const GetAllBrands: ActionTypes = {
  Request: "getAllBrandsRequest",
  Success: "getAllBrandsSuccess",
  Fail: "getAllBrandsFail",
};

export const GetBrandDetails: ActionTypes = {
  Request: "getBrandDetailsRequest",
  Success: "getBrandDetailsSuccess",
  Fail: "getBrandDetailsFail",
};

export const CreateBrand: ActionTypes = {
  Request: "createBrandRequest",
  Success: "createBrandSuccess",
  Reset: "createBrandReset",
  Fail: "createBrandFail",
};

export const UpdateBrand: ActionTypes = {
  Request: "updateBrandRequest",
  Success: "updateBrandSuccess",
  Reset: "updateBrandReset",
  Fail: "updateBrandFail",
};

export const UpdateBrandImage: ActionTypes = {
  Request: "updateBrandImageRequest",
  Success: "updateBrandImageSuccess",
  Reset: "updateBrandImageReset",
  Fail: "updateBrandImageFail",
};

export const DeleteBrand: ActionTypes = {
  Request: "deleteBrandRequest",
  Success: "deleteBrandSuccess",
  Reset: "deleteBrandReset",
  Fail: "deleteBrandFail",
};

export const ClearBrandErrors: string = "clearBrandErrors";

// Brand-specific types
export type Brand = {
  id: string;
  name: string;
  slug?: string;
  image?: string; // Image filename/path
  description?: string;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BrandFormData = {
  name: string;
  image?: File;
  description?: string;
  featured?: boolean;
};

export type BrandState = {
  brands: Brand[];
  brand: Brand | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  isUpdated: boolean;
  isDeleted: boolean;
  imageUploading?: boolean;
};