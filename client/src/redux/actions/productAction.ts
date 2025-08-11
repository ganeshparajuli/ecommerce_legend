// src/actions/productAction.ts - UPDATED with bulk operations and soft delete
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
import type { Product, ProductSearchCriteria, BulkOperationRequest } from "../constants/productConstants";
import api from "../api";
import type { Dispatch, AnyAction } from "redux";

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  if (error.response) {
    if (error.response.data?.error) return error.response.data.error;
    if (error.response.data?.message) return error.response.data.message;
    return `Server error: ${error.response.status} ${error.response.statusText}`;
  } else if (error.request) {
    return "Network error: No response received from server";
  } else {
    return error.message || "An unknown error occurred";
  }
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

// ULTRA-SAFE parseProductData function - prevents ANY mutations
const parseProductData = (product: any): any => {
  if (!product) return null;
  
  const parseJSONField = (field: any): any => {
    if (!field) return null;
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch (e) {
        console.error("Failed to parse JSON field:", e);
        return field; // Return original if parsing fails
      }
    }
    return field;
  };

  // CRITICAL: Use safeClone to create a completely independent copy
  const deepClonedProduct = safeClone(product);

  // Create a completely new object with explicit property assignment
  const parsedProduct = {
    id: deepClonedProduct.id,
    name: deepClonedProduct.name,
    brand: deepClonedProduct.brand,
    category: deepClonedProduct.category,
    price: deepClonedProduct.price,
    originalPrice: deepClonedProduct.originalPrice,
    description: deepClonedProduct.description,
    shortDescription: deepClonedProduct.shortDescription,
    sku: deepClonedProduct.sku,
    stock: deepClonedProduct.stock,
    images: Array.isArray(deepClonedProduct.images) ? [...deepClonedProduct.images] : deepClonedProduct.images,
    colors: Array.isArray(deepClonedProduct.colors) ? [...deepClonedProduct.colors] : deepClonedProduct.colors,
    sizes: Array.isArray(deepClonedProduct.sizes) ? [...deepClonedProduct.sizes] : deepClonedProduct.sizes,
    weight: deepClonedProduct.weight,
    dimensions: deepClonedProduct.dimensions,
    rating: deepClonedProduct.rating,
    reviewCount: deepClonedProduct.reviewCount,
    isActive: deepClonedProduct.isActive,
    isFeatured: deepClonedProduct.isFeatured,
    createdAt: deepClonedProduct.createdAt,
    updatedAt: deepClonedProduct.updatedAt,
    deleted_at: deepClonedProduct.deleted_at, // NEW: For soft delete
    isDeleted: deepClonedProduct.isDeleted, // NEW: For tracking deletion status
    // Parse JSON fields safely from the deep-cloned version
    specifications: parseJSONField(deepClonedProduct.specifications),
    keyFeatures: parseJSONField(deepClonedProduct.keyFeatures),
    tags: parseJSONField(deepClonedProduct.tags),
  };

  // Add any additional properties that weren't explicitly handled
  Object.keys(deepClonedProduct).forEach(key => {
    if (!(key in parsedProduct)) {
      parsedProduct[key] = deepClonedProduct[key];
    }
  });

  return parsedProduct;
};

// EXISTING ACTIONS (keeping all the original ones)

// FIXED: Get all products with loading state prevention and proper cloning
export const getAllProducts = () => async (dispatch: Dispatch<AnyAction>, getState: () => any): Promise<any> => {
  try {
    // Get current state to check if already loading or has data
    const state = getState();
    const { products } = state;
    
    // Prevent duplicate API calls if already loading or has products
    if (products?.loading || (products?.products && products.products.length > 0)) {
      console.log("Products already loading or loaded, skipping API call");
      return { success: true, data: products.products };
    }

    dispatch({ type: GetAllProducts.Request });

    console.log("Fetching all products...");
    const response = await api.get("product");

    console.log("Products fetched successfully:", response.data);

    // FIXED: Parse all products and deep clone to ensure JSON fields are properly handled
    const parsedProducts = Array.isArray(response.data?.data) 
      ? response.data.data.map((product: any) => parseProductData(product))
      : [];

    // CRITICAL: Deep clone the entire parsed products array before dispatching
    dispatch({
      type: GetAllProducts.Success,
      payload: safeClone(parsedProducts),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    
    dispatch({
      type: GetAllProducts.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Get featured products with proper cloning
export const getFeaturedProducts = () => async (dispatch: Dispatch<AnyAction>, getState: () => any): Promise<any> => {
  try {
    // Get current state to check if already loading or has data
    const state = getState();
    const { products } = state;
    
    // Prevent duplicate API calls if already loading featured products
    if (products?.featuredLoading || (products?.featured && products.featured.length > 0)) {
      console.log("Featured products already loading or loaded, skipping API call");
      return { success: true, data: products.featured };
    }

    dispatch({ type: GetFeaturedProducts.Request });

    const response = await api.get("product/featured");

    // FIXED: Parse all featured products and deep clone
    const featuredProducts = Array.isArray(response.data?.data) 
      ? response.data.data.map((product: any) => parseProductData(product))
      : [];

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: GetFeaturedProducts.Success,
      payload: safeClone(featuredProducts),
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: GetFeaturedProducts.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Search products with proper cloning
export const searchProducts = (criteria: ProductSearchCriteria) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: SearchProducts.Request });

    // Build query string
    const params = new URLSearchParams();
    if (criteria.name) params.append('name', criteria.name);
    if (criteria.brand) params.append('brand', criteria.brand);
    if (criteria.category) params.append('category', criteria.category);
    if (criteria.minPrice !== undefined) params.append('minPrice', criteria.minPrice.toString());
    if (criteria.maxPrice !== undefined) params.append('maxPrice', criteria.maxPrice.toString());
    if (criteria.inStock !== undefined) params.append('inStock', criteria.inStock.toString());
    if (criteria.color) params.append('color', criteria.color);

    const response = await api.get(`product/search?${params.toString()}`);

    // FIXED: Parse all search results and deep clone
    const searchResults = Array.isArray(response.data?.data) 
      ? response.data.data.map((product: any) => parseProductData(product))
      : [];

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: SearchProducts.Success,
      payload: safeClone(searchResults),
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: SearchProducts.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Get product details with proper cloning
export const getProductDetails = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: GetProductDetails.Request });

    console.log(`Fetching product details for ID: ${id}`);
    const response = await api.get(`product/${id}`);

    // FIXED: Parse the product data safely and deep clone
    const parsedProduct = response.data?.data ? parseProductData(response.data.data) : null;

    console.log("Product details fetched successfully:", response.data);

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: GetProductDetails.Success,
      payload: safeClone(parsedProduct),
    });

    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product details for ID: ${id}`, error);

    dispatch({
      type: GetProductDetails.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Get product by SKU with proper cloning
export const getProductBySKU = (sku: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: GetProductBySKU.Request });

    const response = await api.get(`product/sku/${sku}`);

    // FIXED: Parse the product data safely and deep clone
    const parsedProduct = response.data?.data ? parseProductData(response.data.data) : null;

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: GetProductBySKU.Success,
      payload: safeClone(parsedProduct),
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: GetProductBySKU.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Create new product with proper cloning
export const createProduct = (productData: Partial<Product> | FormData) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: CreateProduct.Request });

    const formData = productData instanceof FormData 
      ? productData 
      : new FormData();
    
    if (!(productData instanceof FormData)) {
      Object.entries(productData).forEach(([key, value]) => {
        if (key === 'images' && Array.isArray(value)) {
          value.forEach(img => formData.append('images', img));
        } else if (value !== undefined && value !== null) {
          if (key === 'keyFeatures' || key === 'specifications' || key === 'tags') {
            formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
    }
    
    console.log("Sending product data to API");
    
    const response = await api.post("product", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("Product creation successful:", response.data);
    
    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: CreateProduct.Success,
      payload: safeClone(response.data),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to create product:", error);
    
    dispatch({
      type: CreateProduct.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Update product with proper cloning
export const updateProduct = (id: string, productData: Partial<Product> | FormData) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: UpdateProduct.Request });

    console.log(`Updating product with ID: ${id}`);
    
    let response;
    
    if (productData instanceof FormData) {
      response = await api.put(`product/${id}`, productData);
    } else {
      // Convert JSON fields to strings if needed
      const processedData = { ...productData };
      if (processedData.keyFeatures && typeof processedData.keyFeatures !== 'string') {
        processedData.keyFeatures = JSON.stringify(processedData.keyFeatures);
      }
      if (processedData.specifications && typeof processedData.specifications !== 'string') {
        processedData.specifications = JSON.stringify(processedData.specifications);
      }
      if (processedData.tags && typeof processedData.tags !== 'string') {
        processedData.tags = JSON.stringify(processedData.tags);
      }
      
      response = await api.put(`product/${id}`, processedData);
    }

    console.log("Update successful:", response.data);

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: UpdateProduct.Success,
      payload: safeClone(response.data),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to update product:", error);
    
    dispatch({
      type: UpdateProduct.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// Delete product (soft delete by default)
export const deleteProduct = (id: string, hardDelete: boolean = false) => async (dispatch: Dispatch<AnyAction>): Promise<{ success: boolean }> => {
  try {
    dispatch({ type: DeleteProduct.Request });

    const url = hardDelete ? `product/${id}?hard=true` : `product/${id}`;
    await api.delete(url);

    dispatch({
      type: DeleteProduct.Success,
      payload: { id, hardDelete }, // Pass both id and delete type
    });

    return { success: true };
  } catch (error) {
    dispatch({
      type: DeleteProduct.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// NEW: Bulk delete products (soft or hard delete)
export const bulkDeleteProducts = (productIds: string[], hardDelete: boolean = false) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: BulkDeleteProducts.Request });

    console.log(`Bulk ${hardDelete ? 'hard' : 'soft'} deleting products:`, productIds);

    const response = await api.post("product/bulk-delete", {
      productIds,
      hard: hardDelete
    });

    console.log("Bulk delete successful:", response.data);

    dispatch({
      type: BulkDeleteProducts.Success,
      payload: safeClone({
        ...response.data,
        productIds,
        hardDelete
      }),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to bulk delete products:", error);
    
    dispatch({
      type: BulkDeleteProducts.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// NEW: Hard delete product (permanent deletion)
export const hardDeleteProduct = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<{ success: boolean }> => {
  try {
    dispatch({ type: HardDeleteProduct.Request });

    await api.delete(`product/${id}?hard=true`);

    dispatch({
      type: HardDeleteProduct.Success,
      payload: id,
    });

    return { success: true };
  } catch (error) {
    dispatch({
      type: HardDeleteProduct.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// NEW: Get deleted products
export const getDeletedProducts = () => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: GetDeletedProducts.Request });

    console.log("Fetching deleted products...");
    const response = await api.get("product/deleted");

    console.log("Deleted products fetched successfully:", response.data);

    // Parse all deleted products and deep clone
    const deletedProducts = Array.isArray(response.data?.data) 
      ? response.data.data.map((product: any) => parseProductData(product))
      : [];

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: GetDeletedProducts.Success,
      payload: safeClone(deletedProducts),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch deleted products:", error);
    
    dispatch({
      type: GetDeletedProducts.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// NEW: Restore single product
export const restoreProduct = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: RestoreProduct.Request });

    console.log(`Restoring product with ID: ${id}`);
    const response = await api.post(`product/${id}/restore`);

    console.log("Product restore successful:", response.data);

    dispatch({
      type: RestoreProduct.Success,
      payload: safeClone({
        ...response.data,
        id
      }),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to restore product:", error);
    
    dispatch({
      type: RestoreProduct.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// NEW: Bulk restore products
export const bulkRestoreProducts = (productIds: string[]) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: BulkRestoreProducts.Request });

    console.log("Bulk restoring products:", productIds);

    const response = await api.post("product/bulk-restore", {
      productIds
    });

    console.log("Bulk restore successful:", response.data);

    dispatch({
      type: BulkRestoreProducts.Success,
      payload: safeClone({
        ...response.data,
        productIds
      }),
    });

    return response.data;
  } catch (error) {
    console.error("Failed to bulk restore products:", error);
    
    dispatch({
      type: BulkRestoreProducts.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// EXISTING ACTIONS (keeping all others the same)...

// FIXED: Get products by category with proper cloning
export const getProductsByCategory = (category: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: ProductsByCategory.Request });

    const response = await api.get(`product/category/${category}`);

    // FIXED: Parse all products in category and deep clone
    const categoryProducts = Array.isArray(response.data?.data) 
      ? response.data.data.map((product: any) => parseProductData(product))
      : [];

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: ProductsByCategory.Success,
      payload: safeClone(categoryProducts),
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: ProductsByCategory.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Get products by color with proper cloning
export const getProductsByColor = (color: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: ProductsByColor.Request });

    const response = await api.get(`product/color/${color}`);

    // FIXED: Parse all products by color and deep clone
    const colorProducts = Array.isArray(response.data?.data) 
      ? response.data.data.map((product: any) => parseProductData(product))
      : [];

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: ProductsByColor.Success,
      payload: safeClone(colorProducts),
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: ProductsByColor.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Get products by price range with proper cloning
export const getProductsByPriceRange = (minPrice?: number, maxPrice?: number) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: ProductsByPriceRange.Request });

    const params = new URLSearchParams();
    if (minPrice !== undefined) params.append('minPrice', minPrice.toString());
    if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());

    const response = await api.get(`product/price-range?${params.toString()}`);

    // FIXED: Parse all products in price range and deep clone
    const priceRangeProducts = Array.isArray(response.data?.data) 
      ? response.data.data.map((product: any) => parseProductData(product))
      : [];

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: ProductsByPriceRange.Success,
      payload: safeClone(priceRangeProducts),
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: ProductsByPriceRange.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Update product image with proper cloning
export const updateProductImage = (id: string, imageFiles: File[]) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: UpdateProductImage.Request });

    const formData = new FormData();
    imageFiles.forEach(file => formData.append("images", file));

    const response = await api.patch(`product/${id}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: UpdateProductImage.Success,
      payload: safeClone(response.data),
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: UpdateProductImage.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Update product stock with proper cloning
export const updateProductStock = (id: string, quantity: number) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: UpdateProductStock.Request });

    const response = await api.patch(`product/${id}/stock`, { quantity });

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: UpdateProductStock.Success,
      payload: safeClone(response.data),
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: UpdateProductStock.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// FIXED: Update product rating with proper cloning
export const updateProductRating = (id: string, rating: number, reviewCount: number) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: UpdateProductRating.Request });

    const response = await api.patch(`product/${id}/rating`, { rating, reviewCount });

    // CRITICAL: Deep clone before dispatching
    dispatch({
      type: UpdateProductRating.Success,
      payload: safeClone(response.data),
    });

    return response.data;
  } catch (error) {
    dispatch({
      type: UpdateProductRating.Fail,
      payload: getErrorMessage(error),
    });

    throw error;
  }
};

// Clear all errors - no changes needed
export const clearErrors = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: ClearProductErrors });
};