// orderConstant.ts
import type { ActionTypes } from "../types/actionTypes";
  
  // Define the constants with their types
  export const CreateOrder: ActionTypes = {
    Request: "createOrderRequest",
    Success: "createOrderSuccess",
    Fail: "createOrderFail",
  };
  
  export const MyOrders: ActionTypes = {
    Request: "myOrdersRequest",
    Success: "myOrdersSuccess",
    Fail: "myOrdersFail",
  };
  
  export const OrderDetails: ActionTypes = {
    Request: "orderDetailsRequest",
    Success: "orderDetailsSuccess",
    Fail: "orderDetailsFail",
  };
  
  export const AllOrders: ActionTypes = {
    Request: "allOrdersRequest",
    Success: "allOrdersSuccess",
    Fail: "allOrdersFail",
  };
  
  export const UpdateOrderStatus: ActionTypes = {
    Request: "updateOrderStatusRequest",
    Success: "updateOrderStatusSuccess",
    Reset: "updateOrderStatusReset",
    Fail: "updateOrderStatusFail",
  };
  
  export const DeleteOrder: ActionTypes = {
    Request: "deleteOrderRequest",
    Success: "deleteOrderSuccess",
    Reset: "deleteOrderReset",
    Fail: "deleteOrderFail",
  };
  
  export const CancelOrder: ActionTypes = {
    Request: "CancelOrderRequest",
    Success: "CancelOrderSuccess",
    Reset: "CancelOrderReset",
    Fail: "CancelOrderFail",
  };
  
  // This remains a string constant
  export const ClearOrderErrors: string = "clearOrderErrors";