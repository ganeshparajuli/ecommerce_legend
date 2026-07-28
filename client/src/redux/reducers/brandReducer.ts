// src/reducers/brandReducer.ts
import {
  GetAllBrands,
  GetBrandDetails,
  CreateBrand,
  UpdateBrand,
  UpdateBrandImage,
  DeleteBrand,
  ClearBrandErrors,
} from "../constants/brandConstants";
import type { BrandState } from "../constants/brandConstants";
import type { Reducer, AnyAction } from "redux";

const initialState: BrandState = {
  brands: [],
  brand: null,
  loading: false,
  error: null,
  success: false,
  isUpdated: false,
  isDeleted: false,
  imageUploading: false,
};

export const brandReducer: Reducer<BrandState, AnyAction> = (
  state = initialState,
  action
) => {
  switch (action.type) {
    // All Brands
    case GetAllBrands.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetAllBrands.Success:
      return {
        ...state,
        loading: false,
        brands: action.payload,
        error: null,
      };

    case GetAllBrands.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Brand Details
    case GetBrandDetails.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetBrandDetails.Success:
      return {
        ...state,
        loading: false,
        brand: action.payload,
        error: null,
      };

    case GetBrandDetails.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // New Brand
    case CreateBrand.Request:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };

    case CreateBrand.Success:
      return {
        ...state,
        loading: false,
        success: true,
        brands: [action.payload.data, ...state.brands],
        error: null,
      };

    case CreateBrand.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case CreateBrand.Reset:
      return {
        ...state,
        success: false,
        error: null,
      };

    // Update Brand
    case UpdateBrand.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isUpdated: false,
      };

    case UpdateBrand.Success:
      return {
        ...state,
        loading: false,
        isUpdated: true,
        brands: state.brands.map((brand) =>
          brand.id === action.payload.data.id ? action.payload.data : brand
        ),
        error: null,
      };

    case UpdateBrand.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isUpdated: false,
      };

    case UpdateBrand.Reset:
      return {
        ...state,
        isUpdated: false,
        error: null,
      };

    // Update Brand Image
    case UpdateBrandImage.Request:
      return {
        ...state,
        imageUploading: true,
        error: null,
        isUpdated: false,
      };

    case UpdateBrandImage.Success:
      return {
        ...state,
        imageUploading: false,
        isUpdated: true,
        brands: state.brands.map((brand) =>
          brand.id === action.payload.data.id ? action.payload.data : brand
        ),
        brand:
          state.brand?.id === action.payload.brand.id
            ? action.payload.brand
            : state.brand,
        error: null,
      };

    case UpdateBrandImage.Fail:
      return {
        ...state,
        imageUploading: false,
        error: action.payload,
        isUpdated: false,
      };

    case UpdateBrandImage.Reset:
      return {
        ...state,
        imageUploading: false,
        isUpdated: false,
        error: null,
      };

    // Delete Brand
    case DeleteBrand.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isDeleted: false,
      };

    case DeleteBrand.Success:
      return {
        ...state,
        loading: false,
        isDeleted: true,
        brands: state.brands.filter((brand) => brand.id !== action.payload),
        error: null,
      };

    case DeleteBrand.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isDeleted: false,
      };

    case DeleteBrand.Reset:
      return {
        ...state,
        isDeleted: false,
        error: null,
      };

    // Clear Errors
    case ClearBrandErrors:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
