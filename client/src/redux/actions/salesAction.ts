// src/actions/saleAction.ts
import {
  GetAllSales,
  GetSaleDetails,
  CreateSale,
  UpdateSale,
  DeleteSale,
  SalesByStatus,
  SaleProducts,
  AddProductsToSale,
  SalesAnalytics,
  GetSaleGifts,
  UpdateSaleGifts,
  CalculateCartGifts,
  ClearSaleErrors,
  type Sale,
  type SaleStatus,
  type SaleProduct,
  type SaleGift,
  type ProductGift,
  type ApplicableGift
} from "../constants/saleConstants";
import api from "../api";
import type { Dispatch } from "redux";

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  return error.response?.data?.message || error.message || "An error occurred";
};  

// Get all sales with error handling improvements
export const getAllSales = () => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: GetAllSales.Request });

  // Log the request for debugging
  console.log("Fetching all sales...");

  const { data } = await api.get("sale/");

  // Log successful response
  console.log("Sales fetched successfully:", data.sales);

  dispatch({
    type: GetAllSales.Success,
    payload: data?.data?.sales,
  });

  return data;
} catch (error) {
  // Enhanced error logging
  console.error("Failed to fetch sales:", error);
  
  dispatch({
    type: GetAllSales.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// Get sale details with improved error handling
export const getSaleDetails = (id: string) => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: GetSaleDetails.Request });

  console.log(`Fetching sale details for ID: ${id}`);

  const { data } = await api.get(`sale/${id}`);

  console.log("Sale details fetched successfully:", data.data?.sale);

  dispatch({
    type: GetSaleDetails.Success,
    payload: data.data?.sale,
  });

  return data;
} catch (error) {
  console.error(`Failed to fetch sale details for ID: ${id}`, error);
  
  dispatch({
    type: GetSaleDetails.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// Create new sale
export const createSale = (saleData: Partial<Sale>) => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: CreateSale.Request });

  console.log("Creating new sale with data:", saleData);

  const { data } = await api.post("sale/create", saleData);

  console.log("Sale created successfully:", data.data?.sale);

  dispatch({
    type: CreateSale.Success,
    payload: data.data?.sale,
  });

  return data;
} catch (error) {
  console.error("Failed to create sale:", error);
  
  dispatch({
    type: CreateSale.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// Update sale
export const updateSale = (id: string, saleData: Partial<Sale>) => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: UpdateSale.Request });

  console.log(`Updating sale ID: ${id} with data:`, saleData);

  const { data } = await api.put(`sale/${id}`, saleData);

  console.log("Sale updated successfully:", data.data?.sale);

  dispatch({
    type: UpdateSale.Success,
    payload: data.data?.sale,
  });

  return data;
} catch (error) {
  console.error(`Failed to update sale ID: ${id}`, error);
  
  dispatch({
    type: UpdateSale.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// Delete sale
export const deleteSale = (id: string) => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: DeleteSale.Request });

  console.log(`Deleting sale ID: ${id}`);

  const { data } = await api.delete(`sale/${id}`);

  console.log("Sale deleted successfully");

  dispatch({
    type: DeleteSale.Success,
    payload: id,
  });

  return data;
} catch (error) {
  console.error(`Failed to delete sale ID: ${id}`, error);
  
  dispatch({
    type: DeleteSale.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// Get sales by status
export const getSalesByStatus = (status: SaleStatus) => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: SalesByStatus.Request });

  console.log(`Fetching sales with status: ${status}`);

  const { data } = await api.get(`sale/status/${status}`);

  console.log(
    `Sales with status '${status}' fetched successfully:`,
    data.data?.sales
  );

  dispatch({
    type: SalesByStatus.Success,
    payload: data.data?.sales,
  });

  return data;
} catch (error) {
  console.error(`Failed to fetch sales with status: ${status}`, error);
  
  dispatch({
    type: SalesByStatus.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// Get sale products
export const getSaleProducts = (id: string) => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: SaleProducts.Request });

  console.log(`Fetching products for sale ID: ${id}`);

  const { data } = await api.get(`sale/${id}/products`);

  console.log(
    `Products for sale ID: ${id} fetched successfully:`,
    data.data?.products
  );

  dispatch({
    type: SaleProducts.Success,
    payload: data.data?.products,
  });

  return data;
} catch (error) {
  console.error(`Failed to fetch products for sale ID: ${id}`, error);
  
  dispatch({
    type: SaleProducts.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// Add products to sale
export const addProductsToSale = (id: string, productIds: string[]) => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: AddProductsToSale.Request });

  console.log(`Adding products to sale ID: ${id}`, productIds);

  const { data } = await api.post(`sale/${id}/products`, { productIds });

  console.log(`Products added to sale ID: ${id} successfully`);

  dispatch({
    type: AddProductsToSale.Success,
    payload: data,
  });

  return data;
} catch (error) {
  console.error(`Failed to add products to sale ID: ${id}`, error);
  
  dispatch({
    type: AddProductsToSale.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// Get sales analytics
export const getSalesAnalytics = () => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: SalesAnalytics.Request });

  console.log("Fetching sales analytics");

  const { data } = await api.get("sale/analytics");

  console.log("Sales analytics fetched successfully:", data.data?.analytics);

  dispatch({
    type: SalesAnalytics.Success,
    payload: data.data?.analytics,
  });

  return data;
} catch (error) {
  console.error("Failed to fetch sales analytics", error);
  
  dispatch({
    type: SalesAnalytics.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// NEW: Get sale gifts
export const getSaleGifts = (saleId: string) => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: GetSaleGifts.Request });

  console.log(`Fetching gifts for sale ID: ${saleId}`);

  const { data } = await api.get(`sale/${saleId}/gifts`);

  console.log("Sale gifts fetched successfully:", data.data?.gifts);

  dispatch({
    type: GetSaleGifts.Success,
    payload: data.data?.gifts,
  });

  return data;
} catch (error) {
  console.error(`Failed to fetch gifts for sale ID: ${saleId}`, error);
  
  dispatch({
    type: GetSaleGifts.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// NEW: Update sale gifts
export const updateSaleGifts = (
saleId: string, 
giftsData: { saleGifts?: Partial<SaleGift>[]; productGifts?: Partial<ProductGift>[] }
) => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: UpdateSaleGifts.Request });

  console.log(`Updating gifts for sale ID: ${saleId}`, giftsData);

  const { data } = await api.put(`sale/${saleId}/gifts`, giftsData);

  console.log("Sale gifts updated successfully");

  dispatch({
    type: UpdateSaleGifts.Success,
    payload: data,
  });

  return data;
} catch (error) {
  console.error(`Failed to update gifts for sale ID: ${saleId}`, error);
  
  dispatch({
    type: UpdateSaleGifts.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// NEW: Calculate applicable gifts for cart
export const calculateCartGifts = (
saleId: string, 
cartItems: Array<{productId: string; quantity: number; price: number}>
) => async (dispatch: Dispatch): Promise<any> => {
try {
  dispatch({ type: CalculateCartGifts.Request });

  console.log(`Calculating gifts for sale ID: ${saleId}`, cartItems);

  const { data } = await api.post(`sale/${saleId}/calculate-gifts`, { cartItems });

  console.log("Cart gifts calculated successfully:", data.data?.applicableGifts);

  dispatch({
    type: CalculateCartGifts.Success,
    payload: data.data?.applicableGifts,
  });

  return data;
} catch (error) {
  console.error(`Failed to calculate gifts for sale ID: ${saleId}`, error);
  
  dispatch({
    type: CalculateCartGifts.Fail,
    payload: getErrorMessage(error),
  });

  throw error;
}
};

// Clear errors
export const clearErrors = () => async (dispatch: Dispatch): Promise<void> => {
dispatch({ type: ClearSaleErrors });
};