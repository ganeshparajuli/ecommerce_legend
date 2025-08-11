// src/reducers/productReducer.ts - UPDATED with bulk operations and soft delete
import {
  GetAllProducts,
  GetFeaturedProducts,
  SearchProducts,
  GetProductDetails,
  GetProductBySKU,
  CreateProduct,
  UpdateProduct,
  DeleteProduct,
  BulkDeleteProducts,
  HardDeleteProduct,
  GetDeletedProducts,
  RestoreProduct,
  BulkRestoreProducts,
  ProductsByCategory,
  ProductsByColor,
  ProductsByPriceRange,
  UpdateProductImage,
  UpdateProductStock,
  UpdateProductRating,
  ClearProductErrors,
} from "../constants/productConstants";
import type { Product, ProductState } from "../constants/productConstants";
import type { Reducer } from 'redux';

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  searchResults: [],
  deletedProducts: [], // NEW: For deleted products
  product: null,
  loading: false,
  error: null,
  success: false,
  isUpdated: false,
  isDeleted: false,
  isBulkDeleted: false, // NEW: For bulk delete status
  isRestored: false, // NEW: For restore status
  isBulkRestored: false, // NEW: For bulk restore status
  filters: {},
  productCount: 0,
  resultsPerPage: 10,
  filteredProductCount: 0,
  searchLoading: false,
  searchError: null,
  deletedLoading: false, // NEW: For deleted products loading
  deletedError: null, // NEW: For deleted products errors
  selectedProductIds: [], // NEW: For bulk operations
};

// CRITICAL FIX: True deep cloning function
const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  
  if (typeof obj === "object") {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        (cloned as any)[key] = deepClone((obj as any)[key]);
      }
    }
    return cloned;
  }
  
  return obj;
};

// FIXED: Ultra-safe product cloning using JSON method + deep clone
const safeCloneProducts = (products: any[]): any[] => {
  if (!Array.isArray(products)) return [];
  
  try {
    // Method 1: JSON deep clone (fastest and safest for most cases)
    const jsonCloned = JSON.parse(JSON.stringify(products));
    return jsonCloned;
  } catch (error) {
    console.warn('JSON clone failed, using manual deep clone:', error);
    // Method 2: Manual deep clone as fallback
    return products.map(product => deepClone(product));
  }
};

// FIXED: Ultra-safe single product cloning
const safeCloneProduct = (product: any): any => {
  if (!product || typeof product !== 'object') return product;
  
  try {
    // JSON deep clone for single product
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.warn('JSON clone failed for single product, using manual deep clone:', error);
    return deepClone(product);
  }
};

export const productReducer: Reducer<ProductState> = (state = initialState, action) => {
  switch (action.type) {
    // Get All Products
    case GetAllProducts.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetAllProducts.Success:
      console.log('🏪 REDUCER: GetAllProducts.Success - SAFE CLONING', {
        payloadLength: action.payload?.length || 0,
      });
      
      return {
        ...state,
        loading: false,
        // CRITICAL: Deep clone the entire payload
        products: safeCloneProducts(action.payload || []),
        productCount: Array.isArray(action.payload) ? action.payload.length : 0,
        error: null,
      };

    case GetAllProducts.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        // Clear products on failure to prevent stale mutations
        products: [],
        productCount: 0,
      };

    // Get Featured Products
    case GetFeaturedProducts.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetFeaturedProducts.Success:
      return {
        ...state,
        loading: false,
        featuredProducts: safeCloneProducts(action.payload || []),
        error: null,
      };

    case GetFeaturedProducts.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        featuredProducts: [], // Clear on failure
      };

    // Search Products
    case SearchProducts.Request:
      return {
        ...state,
        searchLoading: true,
        searchError: null,
      };

    case SearchProducts.Success:
      return {
        ...state,
        searchLoading: false,
        searchResults: safeCloneProducts(action.payload || []),
        filteredProductCount: Array.isArray(action.payload) ? action.payload.length : 0,
        searchError: null,
      };

    case SearchProducts.Fail:
      return {
        ...state,
        searchLoading: false,
        searchError: action.payload,
        searchResults: [], // Clear on failure
      };

    // Get Product Details
    case GetProductDetails.Request:
    case GetProductBySKU.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GetProductDetails.Success:
    case GetProductBySKU.Success:
      return {
        ...state,
        loading: false,
        product: action.payload ? safeCloneProduct(action.payload) : null,
        error: null,
      };

    case GetProductDetails.Fail:
    case GetProductBySKU.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        product: null, // Clear on failure
      };

    // Create Product
    case CreateProduct.Request:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };

    case CreateProduct.Success:
      const newProduct = action.payload?.data;
      if (!newProduct) {
        return {
          ...state,
          loading: false,
          success: true,
          error: null,
        };
      }
      
      return {
        ...state,
        loading: false,
        success: true,
        // CRITICAL: Create entirely new products array
        products: [
          safeCloneProduct(newProduct),
          ...safeCloneProducts(state.products)
        ],
        productCount: state.productCount + 1,
        error: null,
      };

    case CreateProduct.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    case CreateProduct.Reset:
      return {
        ...state,
        success: false,
        error: null,
      };

    // Update Product - CRITICAL FIX
    case UpdateProduct.Request:
    case UpdateProductImage.Request:
    case UpdateProductStock.Request:
    case UpdateProductRating.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isUpdated: false,
      };

    case UpdateProduct.Success:
      const updatedProduct = action.payload?.data;
      if (!updatedProduct) {
        return {
          ...state,
          loading: false,
          isUpdated: true,
          error: null,
        };
      }
      
      return {
        ...state,
        loading: false,
        isUpdated: true,
        // CRITICAL: Create completely new products array
        products: safeCloneProducts(
          state.products.map((product) => 
            product.id === updatedProduct.id ? updatedProduct : product
          )
        ),
        // Update single product state
        product: state.product?.id === updatedProduct.id 
          ? safeCloneProduct(updatedProduct)
          : state.product ? safeCloneProduct(state.product) : null,
        error: null,
      };

    case UpdateProductImage.Success:
      const imageUpdateData = action.payload?.data;
      if (!imageUpdateData) {
        return {
          ...state,
          loading: false,
          isUpdated: true,
          error: null,
        };
      }
      
      return {
        ...state,
        loading: false,
        isUpdated: true,
        products: safeCloneProducts(
          state.products.map((product) => 
            product.id === imageUpdateData.id 
              ? { ...product, image: imageUpdateData.image }
              : product
          )
        ),
        product: state.product?.id === imageUpdateData.id 
          ? safeCloneProduct({ ...state.product, image: imageUpdateData.image })
          : state.product ? safeCloneProduct(state.product) : null,
        error: null,
      };

    case UpdateProductStock.Success:
      const stockUpdateData = action.payload?.data;
      if (!stockUpdateData) {
        return {
          ...state,
          loading: false,
          isUpdated: true,
          error: null,
        };
      }
      
      return {
        ...state,
        loading: false,
        isUpdated: true,
        products: safeCloneProducts(
          state.products.map((product) => 
            product.id === stockUpdateData.id 
              ? { ...product, quantity: stockUpdateData.quantity }
              : product
          )
        ),
        product: state.product?.id === stockUpdateData.id
          ? safeCloneProduct({ ...state.product, quantity: stockUpdateData.quantity })
          : state.product ? safeCloneProduct(state.product) : null,
        error: null,
      };

    case UpdateProductRating.Success:
      const ratingUpdateData = action.payload?.data;
      if (!ratingUpdateData) {
        return {
          ...state,
          loading: false,
          isUpdated: true,
          error: null,
        };
      }
      
      return {
        ...state,
        loading: false,
        isUpdated: true,
        products: safeCloneProducts(
          state.products.map((product) => 
            product.id === ratingUpdateData.id 
              ? { 
                  ...product, 
                  rating: ratingUpdateData.rating,
                  reviewCount: ratingUpdateData.reviewCount 
                }
              : product
          )
        ),
        product: state.product?.id === ratingUpdateData.id
          ? safeCloneProduct({ 
              ...state.product, 
              rating: ratingUpdateData.rating,
              reviewCount: ratingUpdateData.reviewCount 
            })
          : state.product ? safeCloneProduct(state.product) : null,
        error: null,
      };

    case UpdateProduct.Fail:
    case UpdateProductImage.Fail:
    case UpdateProductStock.Fail:
    case UpdateProductRating.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isUpdated: false,
      };

    case UpdateProduct.Reset:
    case UpdateProductImage.Reset:
    case UpdateProductStock.Reset:
    case UpdateProductRating.Reset:
      return {
        ...state,
        isUpdated: false,
        error: null,
      };

    // Delete Product (Updated for soft/hard delete)
    case DeleteProduct.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isDeleted: false,
      };

    case DeleteProduct.Success:
      const { id: deletedId, hardDelete } = action.payload;
      
      if (hardDelete) {
        // For hard delete, remove from all arrays
        return {
          ...state,
          loading: false,
          isDeleted: true,
          products: safeCloneProducts(
            state.products.filter(product => product.id !== deletedId)
          ),
          featuredProducts: safeCloneProducts(
            state.featuredProducts.filter(product => product.id !== deletedId)
          ),
          deletedProducts: safeCloneProducts(
            state.deletedProducts.filter(product => product.id !== deletedId)
          ),
          productCount: Math.max(0, state.productCount - 1),
          error: null,
        };
      } else {
        // For soft delete, remove from active products only
        return {
          ...state,
          loading: false,
          isDeleted: true,
          products: safeCloneProducts(
            state.products.filter(product => product.id !== deletedId)
          ),
          featuredProducts: safeCloneProducts(
            state.featuredProducts.filter(product => product.id !== deletedId)
          ),
          productCount: Math.max(0, state.productCount - 1),
          error: null,
        };
      }

    case DeleteProduct.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isDeleted: false,
      };

    case DeleteProduct.Reset:
      return {
        ...state,
        isDeleted: false,
        error: null,
      };

    // NEW: Bulk Delete Products
    case BulkDeleteProducts.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isBulkDeleted: false,
      };

    case BulkDeleteProducts.Success:
      const { productIds: deletedIds, hardDelete: isHardDelete } = action.payload;
      
      if (isHardDelete) {
        // For hard delete, remove from all arrays
        return {
          ...state,
          loading: false,
          isBulkDeleted: true,
          products: safeCloneProducts(
            state.products.filter(product => !deletedIds.includes(product.id))
          ),
          featuredProducts: safeCloneProducts(
            state.featuredProducts.filter(product => !deletedIds.includes(product.id))
          ),
          deletedProducts: safeCloneProducts(
            state.deletedProducts.filter(product => !deletedIds.includes(product.id))
          ),
          productCount: Math.max(0, state.productCount - deletedIds.length),
          selectedProductIds: [], // Clear selection
          error: null,
        };
      } else {
        // For soft delete, remove from active products only
        return {
          ...state,
          loading: false,
          isBulkDeleted: true,
          products: safeCloneProducts(
            state.products.filter(product => !deletedIds.includes(product.id))
          ),
          featuredProducts: safeCloneProducts(
            state.featuredProducts.filter(product => !deletedIds.includes(product.id))
          ),
          productCount: Math.max(0, state.productCount - deletedIds.length),
          selectedProductIds: [], // Clear selection
          error: null,
        };
      }

    case BulkDeleteProducts.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isBulkDeleted: false,
      };

    case BulkDeleteProducts.Reset:
      return {
        ...state,
        isBulkDeleted: false,
        error: null,
      };

    // NEW: Hard Delete Product
    case HardDeleteProduct.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isDeleted: false,
      };

    case HardDeleteProduct.Success:
      return {
        ...state,
        loading: false,
        isDeleted: true,
        // Remove from all arrays for hard delete
        products: safeCloneProducts(
          state.products.filter(product => product.id !== action.payload)
        ),
        featuredProducts: safeCloneProducts(
          state.featuredProducts.filter(product => product.id !== action.payload)
        ),
        deletedProducts: safeCloneProducts(
          state.deletedProducts.filter(product => product.id !== action.payload)
        ),
        productCount: Math.max(0, state.productCount - 1),
        error: null,
      };

    case HardDeleteProduct.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isDeleted: false,
      };

    case HardDeleteProduct.Reset:
      return {
        ...state,
        isDeleted: false,
        error: null,
      };

    // NEW: Get Deleted Products
    case GetDeletedProducts.Request:
      return {
        ...state,
        deletedLoading: true,
        deletedError: null,
      };

    case GetDeletedProducts.Success:
      return {
        ...state,
        deletedLoading: false,
        deletedProducts: safeCloneProducts(action.payload || []),
        deletedError: null,
      };

    case GetDeletedProducts.Fail:
      return {
        ...state,
        deletedLoading: false,
        deletedError: action.payload,
        deletedProducts: [], // Clear on failure
      };

    // NEW: Restore Product
    case RestoreProduct.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isRestored: false,
      };

    case RestoreProduct.Success:
      const restoredProduct = action.payload?.data;
      const restoredId = action.payload?.id;
      
      return {
        ...state,
        loading: false,
        isRestored: true,
        // Add back to active products if we have the product data
        products: restoredProduct ? [
          safeCloneProduct(restoredProduct),
          ...safeCloneProducts(state.products)
        ] : state.products,
        // Remove from deleted products
        deletedProducts: safeCloneProducts(
          state.deletedProducts.filter(product => product.id !== restoredId)
        ),
        productCount: restoredProduct ? state.productCount + 1 : state.productCount,
        error: null,
      };

    case RestoreProduct.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isRestored: false,
      };

    case RestoreProduct.Reset:
      return {
        ...state,
        isRestored: false,
        error: null,
      };

    // NEW: Bulk Restore Products
    case BulkRestoreProducts.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isBulkRestored: false,
      };

    case BulkRestoreProducts.Success:
      const { productIds: restoredIds, data: restoredProducts } = action.payload;
      
      return {
        ...state,
        loading: false,
        isBulkRestored: true,
        // Add restored products back to active products if available
        products: restoredProducts ? [
          ...safeCloneProducts(restoredProducts),
          ...safeCloneProducts(state.products)
        ] : state.products,
        // Remove from deleted products
        deletedProducts: safeCloneProducts(
          state.deletedProducts.filter(product => !restoredIds.includes(product.id))
        ),
        productCount: restoredProducts ? 
          state.productCount + restoredProducts.length : 
          state.productCount,
        selectedProductIds: [], // Clear selection
        error: null,
      };

    case BulkRestoreProducts.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isBulkRestored: false,
      };

    case BulkRestoreProducts.Reset:
      return {
        ...state,
        isBulkRestored: false,
        error: null,
      };

    // Products By Category
    case ProductsByCategory.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ProductsByCategory.Success:
      const categoryProducts = safeCloneProducts(action.payload || []);
      return {
        ...state,
        loading: false,
        searchResults: categoryProducts,
        filteredProductCount: categoryProducts.length,
        filters: {
          ...state.filters,
          category: categoryProducts.length > 0 ? categoryProducts[0].category : undefined,
        },
        error: null,
      };

    case ProductsByCategory.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        searchResults: [], // Clear on failure
      };

    // Products By Color
    case ProductsByColor.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ProductsByColor.Success:
      const colorProducts = safeCloneProducts(action.payload || []);
      return {
        ...state,
        loading: false,
        searchResults: colorProducts,
        filteredProductCount: colorProducts.length,
        filters: {
          ...state.filters,
          color: colorProducts.length > 0 ? colorProducts[0].color : undefined,
        },
        error: null,
      };

    case ProductsByColor.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        searchResults: [], // Clear on failure
      };

    // Products By Price Range
    case ProductsByPriceRange.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ProductsByPriceRange.Success:
      return {
        ...state,
        loading: false,
        searchResults: safeCloneProducts(action.payload || []),
        filteredProductCount: Array.isArray(action.payload) ? action.payload.length : 0,
        error: null,
      };

    case ProductsByPriceRange.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        searchResults: [], // Clear on failure
      };

    // Clear Errors
    case ClearProductErrors:
      return {
        ...state,
        error: null,
        searchError: null,
        deletedError: null,
      };

    // NEW: Handle selection for bulk operations
    case 'SET_SELECTED_PRODUCTS':
      return {
        ...state,
        selectedProductIds: action.payload,
      };

    case 'CLEAR_SELECTED_PRODUCTS':
      return {
        ...state,
        selectedProductIds: [],
      };

    case 'TOGGLE_PRODUCT_SELECTION':
      const productId = action.payload;
      const isSelected = state.selectedProductIds.includes(productId);
      
      return {
        ...state,
        selectedProductIds: isSelected
          ? state.selectedProductIds.filter(id => id !== productId)
          : [...state.selectedProductIds, productId],
      };

    default:
      return state;
  }
};