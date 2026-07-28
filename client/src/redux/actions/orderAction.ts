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

// Order data interface - matches the backend contract exactly. Price/total/discount are
// always computed server-side from the current variant price, never trusted from the client.
interface OrderData {
  shippingAddress: Record<string, any>;
  paymentMethod: string;
  promoCode?: string | null;
  orderItems: Array<{
    productVariantId: string;
    quantity: number;
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
// Create a new order. Auth is handled by the api client's request interceptor
// (Authorization header) - the server derives the user from the JWT, never from the body.
export const createOrder = (orderData: OrderData) => async (dispatch: Dispatch): Promise<OrderSuccess | OrderError> => {
  try {
    dispatch({ type: CreateOrder.Request });

    const { data } = await api.post("order/", orderData);
    const order = data.data;

    await dispatch(clearCart() as any);
    dispatch({ type: ClearCart.Success });
    dispatch({
      type: CreateOrder.Success,
      payload: order,
    });

    return { success: true, orderData: order };
  } catch (error) {
    console.error("Order creation error:", error);
    dispatch({
      type: CreateOrder.Fail,
      payload: getErrorMessage(error),
    });
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

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
      payload: safeClone(data.data),
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
      payload: data.data,
    });
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
      payload: data.data,
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