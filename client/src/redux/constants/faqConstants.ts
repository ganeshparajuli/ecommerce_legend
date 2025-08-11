// src/constants/faqConstant.ts
// Get FAQs constants
export const GET_FAQS_REQUEST: string = "GET_FAQS_REQUEST";
export const GET_FAQS_SUCCESS: string = "GET_FAQS_SUCCESS";
export const GET_FAQS_FAILURE: string = "GET_FAQS_FAILURE";

// Add FAQ constants
export const ADD_FAQ_REQUEST: string = "ADD_FAQ_REQUEST";
export const ADD_FAQ_SUCCESS: string = "ADD_FAQ_SUCCESS";
export const ADD_FAQ_FAILURE: string = "ADD_FAQ_FAILURE";

// Update FAQ constants
export const UPDATE_FAQ_REQUEST: string = "UPDATE_FAQ_REQUEST";
export const UPDATE_FAQ_SUCCESS: string = "UPDATE_FAQ_SUCCESS";
export const UPDATE_FAQ_FAILURE: string = "UPDATE_FAQ_FAILURE";

// Delete FAQ constants
export const DELETE_FAQ_REQUEST: string = "DELETE_FAQ_REQUEST";
export const DELETE_FAQ_SUCCESS: string = "DELETE_FAQ_SUCCESS";
export const DELETE_FAQ_FAILURE: string = "DELETE_FAQ_FAILURE";

// Clear errors
export const CLEAR_FAQ_ERRORS: string = "CLEAR_FAQ_ERRORS";

// Using the ActionTypes pattern
import type { ActionTypes } from '../types/actionTypes';

export const GetFaqs: ActionTypes = {
  Request: GET_FAQS_REQUEST,
  Success: GET_FAQS_SUCCESS,
  Fail: GET_FAQS_FAILURE,
};

export const AddFaq: ActionTypes = {
  Request: ADD_FAQ_REQUEST,
  Success: ADD_FAQ_SUCCESS,
  Fail: ADD_FAQ_FAILURE,
};

export const UpdateFaq: ActionTypes = {
  Request: UPDATE_FAQ_REQUEST,
  Success: UPDATE_FAQ_SUCCESS,
  Fail: UPDATE_FAQ_FAILURE,
};

export const DeleteFaq: ActionTypes = {
  Request: DELETE_FAQ_REQUEST,
  Success: DELETE_FAQ_SUCCESS,
  Fail: DELETE_FAQ_FAILURE,
};

// FAQ-specific types
export type FAQ = {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type FAQState = {
  faqs: FAQ[];
  loading: boolean;
  error: string | null;
  success: boolean;
};