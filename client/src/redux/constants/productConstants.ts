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

export const BulkDeleteProducts: ActionTypes = {
  Request: "bulkDeleteProductsRequest",
  Success: "bulkDeleteProductsSuccess",
  Reset: "bulkDeleteProductsReset",
  Fail: "bulkDeleteProductsFail",
};

export const HardDeleteProduct: ActionTypes = {
  Request: "hardDeleteProductRequest",
  Success: "hardDeleteProductSuccess",
  Reset: "hardDeleteProductReset",
  Fail: "hardDeleteProductFail",
};

export const GetDeletedProducts: ActionTypes = {
  Request: "getDeletedProductsRequest",
  Success: "getDeletedProductsSuccess",
  Fail: "getDeletedProductsFail",
};

export const RestoreProduct: ActionTypes = {
  Request: "restoreProductRequest",
  Success: "restoreProductSuccess",
  Reset: "restoreProductReset",
  Fail: "restoreProductFail",
};

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

export const ProductsBySeries: ActionTypes = {
  Request: "productsBySeriesRequest",
  Success: "productsBySeriesSuccess",
  Fail: "productsBySeriesFail",
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

// ---- Variant-first product model (matches the Postgres/Sequelize backend) ----

export type ProductVariantAttributes = Record<string, string>;

export type ProductVariant = {
  id: string;
  productId?: string;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  attributes: ProductVariantAttributes;
  isDefault: boolean;
};

export type ProductImageItem = {
  id?: string;
  url: string;
  sortOrder?: number;
  isPrimary?: boolean;
};

export type PriceRange = { min: number; max: number };

// Product type: real API fields plus derived convenience fields (computed once at fetch
// time in productAction.ts) so the many display-only screens that show a single price/
// stock/color don't each need to know about variants.
export type Product = {
  id: string;
  name: string;
  slug?: string | null;
  brandId: string | null;
  categoryId: string | null;
  seriesId: string | null;
  description: string | null;
  productDetails: string | null;
  keyFeatures: string[];
  specifications: Record<string, any>;
  tags: string[];
  rating: number;
  reviewCount: number;
  availability: string;
  sku: string;
  images: ProductImageItem[];
  variants: ProductVariant[];
  priceRange: PriceRange;
  defaultVariant: ProductVariant;
  created_at: string | Date;
  updated_at: string | Date;
  deleted_at?: string | Date | null;
  isDeleted?: boolean;

  // Derived (view-model) fields - kept for screens that only need a single price/stock/color.
  brand: string | null;
  category: string | null;
  series: string | null;
  image: string[];
  finalPrice: number;
  actualPrice: number;
  discountPrice: number;
  originalPrice: number | null;
  quantity: number;
  color: string | null;
  featured: boolean;
};

export type ProductSearchCriteria = {
  name?: string;
  brandId?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

export type ProductFilter = ProductSearchCriteria & {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
};

export type ProductState = {
  products: Product[];
  featuredProducts: Product[];
  searchResults: Product[];
  seriesProducts: Product[];
  deletedProducts: Product[];
  product: Product | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  productCount: number;
  resultsPerPage: number;
  filteredProductCount: number;
  isUpdated: boolean;
  isDeleted: boolean;
  isBulkDeleted: boolean;
  isRestored: boolean;
  isBulkRestored: boolean;
  filters: ProductFilter;
  searchLoading: boolean;
  searchError: string | null;
  deletedLoading: boolean;
  deletedError: string | null;
  selectedProductIds: string[];
};

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
