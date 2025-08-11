import { orderReducer } from './../reducers/orderReducer';
// src/actions/orderAction.ts
import {
  CreateOrder,
  MyOrders,
  OrderDetails,
  AllOrders,
  UpdateOrderStatus,
  DeleteOrder,
  CancelOrder,
  ClearOrderErrors,
 
} from "../constants/orderConstants";
import type { Order} from "../constants/orderConstants";
import { ClearCart } from "../constants/cartConstants";
import api from "../api";
import type { Dispatch } from "redux";
import { clearCart } from "./cartAction";
// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  return error.response?.data?.message || error.message || "An error occurred";
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

// Order data interface
interface OrderData {
  user_id?: string;
  total_amount?: number;
  totalPrice?: number;
  shipping_address?: any;
  shippingInfo?: any;
  payment_method?: string;
  paymentMethod?: string;
  promo_code?: string;
  discount_amount?: number;
  orderItems: Array<{
    product?: any;
    product_id?: string;
    name?: string;
    image?: string;
    price?: number;
    quantity?: number;
  }>;
}

// Success response interface
interface OrderSuccess {
  success: true;
  orderData: {
    id: string;
    [key: string]: any;
  };
}

// Error response interface
interface OrderError {
  success: false;
  error: string;
}
// Create a new order
export const createOrder = (orderData: OrderData) => async (dispatch: Dispatch): Promise<OrderSuccess | OrderError> => {
  try {
    dispatch({ type: CreateOrder.Request });

    console.log("=== ORDER CREATION DEBUG START ===");
    
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found");
      dispatch({
        type: CreateOrder.Fail,
        payload: "Authentication required. Please log in again.",
      });
      return { success: false, error: "Authentication required" };
    }

    let userId: string | null = null;
    try {
      userId = getUserIdFromToken(token);
      console.log("User ID extracted from token:", userId);
    } catch (e) {
      console.log("Error getting user ID from token:", e);
    }

    if (!userId) {
      console.error("Could not determine user ID from token");
      dispatch({
        type: CreateOrder.Fail,
        payload: "Invalid authentication token. Please log in again.",
      });
      return { success: false, error: "Invalid authentication token" };
    }

    console.log("✅ Using user ID:", userId);

    const transformedOrderData = {
      user_id: userId,
      total_amount: orderData.total_amount || orderData.totalPrice,
      shipping_address: orderData.shipping_address || orderData.shippingInfo,
      payment_method: orderData.payment_method || orderData.paymentMethod,
      promo_code: orderData.promo_code,
      discount_amount: orderData.discount_amount,
      orderItems: orderData.orderItems.map((item) => ({
        product_id: item.product_id || (item.product && typeof item.product === 'object' ? item.product.id : item.product) || "",
        quantity: parseInt(String(item.quantity || 1), 10),
        price: parseFloat(String(item.price || 0)),
      })),
    };

    console.log("📤 Sending order data:", transformedOrderData);

    // 🔥 FIX: Use correct endpoint for your backend
    const { data } = await api.post("order/", transformedOrderData, {  // Your backend uses /api/order
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📥 Backend response:", data);

    await dispatch(clearCart() as any);
    dispatch({ type: ClearCart.Success });
    dispatch({
      type: CreateOrder.Success,
      payload: data,
    });

    return { 
      success: true, 
      orderData: {
        ...transformedOrderData,
        id: data.order_id
      }
    };
  } catch (error) {
    console.error("❌ Order creation error:", error);
    dispatch({
      type: CreateOrder.Fail,
      payload: getErrorMessage(error),
    });
    return { 
      success: false, 
      error: getErrorMessage(error)
    };
  }
};
// Helper function to extract user ID from token
function getUserIdFromToken(token: string): string | null {
  try {
    if (!token) return null;

    // Decode JWT token to get the user ID
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    const decodedToken = JSON.parse(jsonPayload);
    return decodedToken.id || decodedToken.sub || decodedToken.user_id || null;
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
}

// Get logged in user orders
export const myOrders = (id: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch({ type: MyOrders.Request });
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await api.get(`order/user/${id}`, config);

    // CRITICAL FIX: Deep clone the orders data before dispatching
    dispatch({
      type: MyOrders.Success,
      payload: safeClone(data.orders),
    });
  } catch (error) {
    dispatch({
      type: MyOrders.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Get order actions
export const getOrderDetails = (id: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch({ type: OrderDetails.Request });

    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    console.log("Fetching orders for user ID:", id);

    // Try multiple approaches to get the user ID
    
    let link = `/order/${id}`;
    // Make the API call with the user ID (even if undefined)
    const {data} = await api.get(link, config);


    dispatch({
      type: OrderDetails.Success,
      payload: data.order,
    });
    console.log("Orders fetched successfully:", data.order);
  } catch (error) {
    console.error("Error fetching orders:", error);
    dispatch({
      type: OrderDetails.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Get all orders (admin)
export const getAllOrders = () => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch({ type: AllOrders.Request });

    const { data } = await api.get("/order/");

    dispatch({
      type: AllOrders.Success,
      payload: data.orders,
    });
  } catch (error) {
    dispatch({
      type: AllOrders.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Update order status (admin)
export const updateOrderStatus = (id: string, status: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch({ type: UpdateOrderStatus.Request });

    const { data } = await api.put(`order/${id}/status`, { status });

    dispatch({
      type: UpdateOrderStatus.Success,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: UpdateOrderStatus.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Delete order (admin)
export const deleteOrder = (id: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch({ type: DeleteOrder.Request });

    await api.delete(`order/${id}`);

    dispatch({
      type: DeleteOrder.Success,
      payload: id,
    });
  } catch (error) {
    dispatch({
      type: DeleteOrder.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Cancel Order
export const cancelOrder = (orderId: string) => async (dispatch: Dispatch): Promise<void> => {
  try {
    dispatch({ type: CancelOrder.Request });

    // Make API request to cancel the order
    const { data } = await api.post(`order/${orderId}/cancel`);

    dispatch({
      type: CancelOrder.Success,
      payload: data,
    });

    // Refresh the orders list to show updated status
    dispatch(getOrderDetails());
  } catch (error) {
    console.error("Error cancelling order:", error);
    dispatch({
      type: CancelOrder.Fail,
      payload: getErrorMessage(error),
    });
  }
};

// Clear all errors
export const clearErrors = () => async (dispatch: Dispatch): Promise<void> => {
  dispatch({ type: ClearOrderErrors });
};