
export type RequestAction = {
    type: string;
    payload?: any;
  };
  
  export type SuccessAction<T> = {
    type: string;
    payload: T;
  };
  
  export type FailAction = {
    type: string;
    payload: string; // Error message
  };
  
  // Generic action types
  export interface ActionTypes {
    Request: string;
    Success: string;
    Fail: string;
    Reset?: string;
  }