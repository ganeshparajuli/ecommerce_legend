// src/constants/productConstants.ts
import type { ActionTypes } from '../types/actionTypes';

// Action types
export const GetAllProducts: ActionTypes = {
  Request: "getAllProductsRequest",
  Success: "getAllProductsSuccess",
  Fail: "getAllProductsFail",
};

export const GetFeaturedProducts: ActionTypes = {
  Request: "getFeaturedProductsRequest",
  Success: "getFeaturedProductsSuccess",
  Fail: "getFeaturedProductsFail",
};

export const SearchProducts: ActionTypes = {
  Request: "searchProductsRequest",
  Success: "searchProductsSuccess",
  Fail: "searchProductsFail",
};

export const GetProductDetails: ActionTypes = {
  Request: "getProductDetailsRequest",
  Success: "getProductDetailsSuccess",
  Fail: "getProductDetailsFail",
};

export const GetProductBySKU: ActionTypes = {
  Request: "getProductBySKURequest",
  Success: "getProductBySKUSuccess",
  Fail: "getProductBySKUFail",
};

export const CreateProduct: ActionTypes = {
  Request: "createProductRequest",
  Success: "createProductSuccess",
  Reset: "createProductReset",
  Fail: "createProductFail",
};

export const UpdateProduct: ActionTypes = {
  Request: "updateProductRequest",
  Success: "updateProductSuccess",
  Reset: "updateProductReset",
  Fail: "updateProductFail",
};

export const DeleteProduct: ActionTypes = {
  Request: "deleteProductRequest",
  Success: "deleteProductSuccess",
  Reset: "deleteProductReset",
  Fail: "deleteProductFail",
};

// NEW: Bulk Delete Actions
export const BulkDeleteProducts: ActionTypes = {
  Request: "bulkDeleteProductsRequest",
  Success: "bulkDeleteProductsSuccess",
  Reset: "bulkDeleteProductsReset",
  Fail: "bulkDeleteProductsFail",
};

// NEW: Hard Delete Actions
export const HardDeleteProduct: ActionTypes = {
  Request: "hardDeleteProductRequest",
  Success: "hardDeleteProductSuccess",
  Reset: "hardDeleteProductReset",
  Fail: "hardDeleteProductFail",
};

// NEW: Get Deleted Products Actions
export const GetDeletedProducts: ActionTypes = {
  Request: "getDeletedProductsRequest",
  Success: "getDeletedProductsSuccess",
  Fail: "getDeletedProductsFail",
};

// NEW: Restore Products Actions
export const RestoreProduct: ActionTypes = {
  Request: "restoreProductRequest",
  Success: "restoreProductSuccess",
  Reset: "restoreProductReset",
  Fail: "restoreProductFail",
};

// NEW: Bulk Restore Actions
export const BulkRestoreProducts: ActionTypes = {
  Request: "bulkRestoreProductsRequest",
  Success: "bulkRestoreProductsSuccess",
  Reset: "bulkRestoreProductsReset",
  Fail: "bulkRestoreProductsFail",
};

export const ProductsByCategory: ActionTypes = {
  Request: "productsByCategoryRequest",
  Success: "productsByCategorySuccess",
  Fail: "productsByCategoryFail",
};

export const ProductsByColor: ActionTypes = {
  Request: "productsByColorRequest",
  Success: "productsByColorSuccess",
  Fail: "productsByColorFail",
};

export const ProductsByPriceRange: ActionTypes = {
  Request: "productsByPriceRangeRequest",
  Success: "productsByPriceRangeSuccess",
  Fail: "productsByPriceRangeFail",
};

export const UpdateProductImage: ActionTypes = {
  Request: "updateProductImageRequest",
  Success: "updateProductImageSuccess",
  Reset: "updateProductImageReset",
  Fail: "updateProductImageFail",
};

export const UpdateProductStock: ActionTypes = {
  Request: "updateProductStockRequest",
  Success: "updateProductStockSuccess",
  Reset: "updateProductStockReset",
  Fail: "updateProductStockFail",
};

export const UpdateProductRating: ActionTypes = {
  Request: "updateProductRatingRequest",
  Success: "updateProductRatingSuccess",
  Reset: "updateProductRatingReset",
  Fail: "updateProductRatingFail",
};

export const ClearProductErrors: string = "clearProductErrors";

// Product type that matches your backend model
export type Product = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  description: string | null;
  actualPrice: number | null;
  discountPrice: number | null;
  finalPrice: number | null;
  originalPrice?: number | null;
  savings?: number | null;
  quantity: number;  // This is 'stock' in backend
  featured: boolean;
  image: string | null;  // JSON string of image paths
  color: string | null;
  sku: string;
  keyFeatures: string[] | string;  // Can be JSON string or array
  specifications: Record<string, any> | string;  // Can be JSON string or object
  productDetails: string | null;
  rating: number;
  reviewCount: number;
  availability: string;
  tags: string[] | string;  // Can be JSON string or array
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date | null; // NEW: For soft delete tracking
  isDeleted?: boolean; // NEW: For tracking deletion status
};

// Helper type for parsed images
export type ParsedProductImages = string[];

// Search criteria type
export type ProductSearchCriteria = {
  name?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  color?: string;
};

export type ProductFilter = {
  name?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  color?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

// NEW: Bulk operation types
export type BulkOperationRequest = {
  productIds: string[];
  action: 'soft-delete' | 'hard-delete' | 'restore';
};

export type BulkOperationResponse = {
  success: boolean;
  affectedCount: number;
  message: string;
  errors?: string[];
};

export type ProductState = {
  products: Product[];
  featuredProducts: Product[];
  searchResults: Product[];
  deletedProducts: Product[]; // NEW: For deleted products
  product: Product | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  productCount: number;
  resultsPerPage: number;
  filteredProductCount: number;
  isUpdated: boolean;
  isDeleted: boolean;
  isBulkDeleted: boolean; // NEW: For bulk delete status
  isRestored: boolean; // NEW: For restore status
  isBulkRestored: boolean; // NEW: For bulk restore status
  filters: ProductFilter;
  searchLoading: boolean;
  searchError: string | null;
  deletedLoading: boolean; // NEW: For deleted products loading
  deletedError: string | null; // NEW: For deleted products errors
  selectedProductIds: string[]; // NEW: For bulk operations
};

// Helper function to parse product images from JSON string
export const parseProductImages = (imageData: string | null): string[] => {
  if (!imageData) return [];
  try {
    return JSON.parse(imageData);
  } catch {
    return [];
  }
};

// Helper function to parse JSON fields
export const parseJSONField = <T>(field: string | T | null, defaultValue: T): T => {
  if (!field) return defaultValue;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return defaultValue;
    }
  }
  return field;
};