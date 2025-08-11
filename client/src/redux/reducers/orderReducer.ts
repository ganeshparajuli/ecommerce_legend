// src/reducers/orderReducer.ts
import {
  CreateOrder,
  MyOrders,
  OrderDetails,
  AllOrders,
  UpdateOrderStatus,
  DeleteOrder,
  ClearOrderErrors,
  CancelOrder,
  
} from "../constants/orderConstants";
import type {Order,
  OrderState} from "../constants/orderConstants"
import type { Reducer } from 'redux';

const initialState: OrderState = {
  orders: [],
  order: null,
  loading: false,
  error: null,
  success: false,
  isUpdated: false,
  isDeleted: false,
  message: null
};

export const orderReducer: Reducer<OrderState> = (state = initialState, action) => {
  switch (action.type) {
    // Create Order
    case CreateOrder.Request:
      return {
        ...state,
        loading: true,
        error: null,
        success: false,
      };

    case CreateOrder.Success:
      return {
        ...state,
        loading: false,
        success: true,
        order: action.payload.order,
        error: null,
      };

    case CreateOrder.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        success: false,
      };

    // My Orders
    case MyOrders.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case MyOrders.Success:
      return {
        ...state,
        loading: false,
        orders: action.payload,
        error: null,
      };

    case MyOrders.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Order Details
    case OrderDetails.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case OrderDetails.Success:
      return {
        ...state,
        loading: false,
        orders: action.payload,
        error: null,
      };

    case OrderDetails.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // All Orders (Admin)
    case AllOrders.Request:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AllOrders.Success:
      return {
        ...state,
        loading: false,
        orders: action.payload,
        error: null,
      };

    case AllOrders.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Update Order Status (Admin)
    case UpdateOrderStatus.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isUpdated: false,
      };

    case UpdateOrderStatus.Success:
      return {
        ...state,
        loading: false,
        isUpdated: true,
        orders: state.orders.map((order) =>
          order.id === action.payload.order.id ? action.payload.order : order
        ),
        error: null,
      };

    case UpdateOrderStatus.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isUpdated: false,
      };

    case UpdateOrderStatus.Reset:
      return {
        ...state,
        isUpdated: false,
        error: null,
      };

    // Delete Order (Admin)
    case DeleteOrder.Request:
      return {
        ...state,
        loading: true,
        error: null,
        isDeleted: false,
      };

    case DeleteOrder.Success:
      return {
        ...state,
        loading: false,
        isDeleted: true,
        orders: state.orders.filter((order) => order.id !== action.payload),
        error: null,
      };

    case DeleteOrder.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isDeleted: false,
      };

    case DeleteOrder.Reset:
      return {
        ...state,
        isDeleted: false,
        error: null,
      };

    case CancelOrder.Request:
      return {
        ...state,
        loading: true,
      };
    case CancelOrder.Success:
      return {
        ...state,
        loading: false,
        message: "Order cancelled successfully",
      };
    case CancelOrder.Fail:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Clear Errors
    case ClearOrderErrors:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};