// src/actions/productAction.ts
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
  ProductsBySeries,
  UpdateProductStock,
  UpdateProductRating,
  ClearProductErrors,
} from "../constants/productConstants";
import type { Product, ProductVariant, ProductSearchCriteria } from "../constants/productConstants";
import api from "../api";
import type { Dispatch, AnyAction } from "redux";

const getErrorMessage = (error: any): string => {
  if (error.response) {
    return error.response.data?.error || error.response.data?.message || `Server error: ${error.response.status}`;
  } else if (error.request) {
    return "Network error: No response received from server";
  }
  return error.message || "An unknown error occurred";
};

/**
 * Turns the raw API product (variants[] + priceRange + defaultVariant) into a view-model
 * that also carries flat, single-value fields (finalPrice, quantity, color, image[]...) so
 * screens that only ever show one price/stock/color don't need to know about variants.
 */
export const normalizeProduct = (raw: any): Product => {
  const variants: ProductVariant[] = Array.isArray(raw.variants) ? raw.variants : [];
  const defaultVariant: ProductVariant =
    raw.defaultVariant || variants.find((v) => v.isDefault) || variants[0] || {
      id: "",
      sku: null,
      price: 0,
      compareAtPrice: null,
      quantity: 0,
      attributes: {},
      isDefault: true,
    };
  const priceRange = raw.priceRange || { min: defaultVariant.price, max: defaultVariant.price };
  const totalQuantity = variants.reduce((sum, v) => sum + (v.quantity || 0), 0);

  return {
    ...raw,
    keyFeatures: Array.isArray(raw.keyFeatures) ? raw.keyFeatures : [],
    specifications: raw.specifications && typeof raw.specifications === "object" ? raw.specifications : {},
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    images: Array.isArray(raw.images) ? raw.images : [],
    variants,
    priceRange,
    defaultVariant,
    brand: raw.brand?.name || null,
    category: raw.category?.name || null,
    seriesId: raw.seriesId ?? raw.series?.id ?? null,
    series: raw.series?.seriesName || null,
    image: Array.isArray(raw.images) ? raw.images.map((img: any) => img.url) : [],
    finalPrice: defaultVariant.price,
    actualPrice: defaultVariant.compareAtPrice || defaultVariant.price,
    discountPrice: Math.max(0, (defaultVariant.compareAtPrice || defaultVariant.price) - defaultVariant.price),
    originalPrice: defaultVariant.compareAtPrice,
    quantity: totalQuantity,
    color: defaultVariant.attributes?.color || null,
    featured: !!raw.isFeatured,
  };
};

const normalizeList = (data: any): Product[] => (Array.isArray(data) ? data.map(normalizeProduct) : []);

export const getAllProducts = () => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: GetAllProducts.Request });
    const response = await api.get("product");
    const products = normalizeList(response.data?.data);
    dispatch({ type: GetAllProducts.Success, payload: products });
    return response.data;
  } catch (error) {
    dispatch({ type: GetAllProducts.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const getFeaturedProducts = () => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: GetFeaturedProducts.Request });
    const response = await api.get("product/featured");
    dispatch({ type: GetFeaturedProducts.Success, payload: normalizeList(response.data?.data) });
    return response.data;
  } catch (error) {
    dispatch({ type: GetFeaturedProducts.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const searchProducts = (criteria: ProductSearchCriteria) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: SearchProducts.Request });

    const params = new URLSearchParams();
    if (criteria.name) params.append("name", criteria.name);
    if (criteria.brandId) params.append("brandId", criteria.brandId);
    if (criteria.categoryId) params.append("categoryId", criteria.categoryId);
    if (criteria.minPrice !== undefined) params.append("minPrice", criteria.minPrice.toString());
    if (criteria.maxPrice !== undefined) params.append("maxPrice", criteria.maxPrice.toString());
    if (criteria.inStock !== undefined) params.append("inStock", criteria.inStock.toString());

    const response = await api.get(`product/search?${params.toString()}`);
    dispatch({ type: SearchProducts.Success, payload: normalizeList(response.data?.data) });
    return response.data;
  } catch (error) {
    dispatch({ type: SearchProducts.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const getProductDetails = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: GetProductDetails.Request });
    const response = await api.get(`product/${id}`);
    const product = response.data?.data ? normalizeProduct(response.data.data) : null;
    dispatch({ type: GetProductDetails.Success, payload: product });
    return response.data;
  } catch (error) {
    dispatch({ type: GetProductDetails.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const getProductBySKU = (sku: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: GetProductBySKU.Request });
    const response = await api.get(`product/sku/${sku}`);
    const product = response.data?.data ? normalizeProduct(response.data.data) : null;
    dispatch({ type: GetProductBySKU.Success, payload: product });
    return response.data;
  } catch (error) {
    dispatch({ type: GetProductBySKU.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const createProduct = (formData: FormData) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: CreateProduct.Request });
    const response = await api.post("product", formData, { headers: { "Content-Type": "multipart/form-data" } });
    dispatch({ type: CreateProduct.Success, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({ type: CreateProduct.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const updateProduct = (id: string, formData: FormData) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: UpdateProduct.Request });
    const response = await api.put(`product/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    dispatch({ type: UpdateProduct.Success, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({ type: UpdateProduct.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const deleteProduct = (id: string, hardDelete: boolean = false) => async (dispatch: Dispatch<AnyAction>): Promise<{ success: boolean }> => {
  try {
    dispatch({ type: DeleteProduct.Request });
    await api.delete(`product/${id}`, { data: { hard: hardDelete } });
    dispatch({ type: DeleteProduct.Success, payload: { id, hardDelete } });
    return { success: true };
  } catch (error) {
    dispatch({ type: DeleteProduct.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const bulkDeleteProducts = (productIds: string[], hardDelete: boolean = false) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: BulkDeleteProducts.Request });
    const response = await api.post("product/bulk-delete", { productIds, hard: hardDelete });
    dispatch({ type: BulkDeleteProducts.Success, payload: { ...response.data, productIds, hardDelete } });
    return response.data;
  } catch (error) {
    dispatch({ type: BulkDeleteProducts.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const hardDeleteProduct = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<{ success: boolean }> => {
  try {
    dispatch({ type: HardDeleteProduct.Request });
    await api.delete(`product/${id}`, { data: { hard: true } });
    dispatch({ type: HardDeleteProduct.Success, payload: id });
    return { success: true };
  } catch (error) {
    dispatch({ type: HardDeleteProduct.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const getDeletedProducts = () => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: GetDeletedProducts.Request });
    const response = await api.get("product/deleted");
    dispatch({ type: GetDeletedProducts.Success, payload: normalizeList(response.data?.data) });
    return response.data;
  } catch (error) {
    dispatch({ type: GetDeletedProducts.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const restoreProduct = (id: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: RestoreProduct.Request });
    const response = await api.post(`product/${id}/restore`);
    dispatch({ type: RestoreProduct.Success, payload: { ...response.data, id } });
    return response.data;
  } catch (error) {
    dispatch({ type: RestoreProduct.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const bulkRestoreProducts = (productIds: string[]) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: BulkRestoreProducts.Request });
    const response = await api.post("product/bulk-restore", { productIds });
    dispatch({ type: BulkRestoreProducts.Success, payload: { ...response.data, productIds } });
    return response.data;
  } catch (error) {
    dispatch({ type: BulkRestoreProducts.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const getProductsByCategory = (categoryId: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: ProductsByCategory.Request });
    const response = await api.get(`product/category/${categoryId}`);
    dispatch({ type: ProductsByCategory.Success, payload: normalizeList(response.data?.data) });
    return response.data;
  } catch (error) {
    dispatch({ type: ProductsByCategory.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const getProductsBySeries = (seriesId: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: ProductsBySeries.Request });
    const response = await api.get(`product/series/${seriesId}`);
    dispatch({ type: ProductsBySeries.Success, payload: normalizeList(response.data?.data) });
    return response.data;
  } catch (error) {
    dispatch({ type: ProductsBySeries.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const updateProductStock = (id: string, quantity: number, variantId?: string) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: UpdateProductStock.Request });
    const response = await api.patch(`product/${id}/stock`, { quantity, variantId });
    dispatch({ type: UpdateProductStock.Success, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({ type: UpdateProductStock.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const updateProductRating = (id: string, rating: number, reviewCount: number) => async (dispatch: Dispatch<AnyAction>): Promise<any> => {
  try {
    dispatch({ type: UpdateProductRating.Request });
    const response = await api.patch(`product/${id}/rating`, { rating, reviewCount });
    dispatch({ type: UpdateProductRating.Success, payload: response.data });
    return response.data;
  } catch (error) {
    dispatch({ type: UpdateProductRating.Fail, payload: getErrorMessage(error) });
    throw error;
  }
};

export const clearErrors = () => (dispatch: Dispatch<AnyAction>): void => {
  dispatch({ type: ClearProductErrors });
};
