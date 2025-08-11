export const GET_ENQUIRIES_REQUEST: string = "GET_ENQUIRIES_REQUEST";
export const GET_ENQUIRIES_SUCCESS: string = "GET_ENQUIRIES_SUCCESS";
export const GET_ENQUIRIES_FAILURE: string = "GET_ENQUIRIES_FAILURE";
import type {ActionTypes} from "../types/actionTypes"
// Get single enquiry details
export const GET_ENQUIRY_DETAILS_REQUEST: string = "GET_ENQUIRY_DETAILS_REQUEST";
export const GET_ENQUIRY_DETAILS_SUCCESS: string = "GET_ENQUIRY_DETAILS_SUCCESS";
export const GET_ENQUIRY_DETAILS_FAILURE: string = "GET_ENQUIRY_DETAILS_FAILURE";

// Update enquiry status (Read/Unread/Archived)
export const UPDATE_ENQUIRY_STATUS_REQUEST: string = "UPDATE_ENQUIRY_STATUS_REQUEST";
export const UPDATE_ENQUIRY_STATUS_SUCCESS: string = "UPDATE_ENQUIRY_STATUS_SUCCESS";
export const UPDATE_ENQUIRY_STATUS_FAILURE: string = "UPDATE_ENQUIRY_STATUS_FAILURE";

// Send enquiry reply
export const SEND_ENQUIRY_REPLY_REQUEST: string = "SEND_ENQUIRY_REPLY_REQUEST";
export const SEND_ENQUIRY_REPLY_SUCCESS: string = "SEND_ENQUIRY_REPLY_SUCCESS";
export const SEND_ENQUIRY_REPLY_FAILURE: string = "SEND_ENQUIRY_REPLY_FAILURE";

// Delete enquiry
export const DELETE_ENQUIRY_REQUEST: string = "DELETE_ENQUIRY_REQUEST";
export const DELETE_ENQUIRY_SUCCESS: string = "DELETE_ENQUIRY_SUCCESS";
export const DELETE_ENQUIRY_FAILURE: string = "DELETE_ENQUIRY_FAILURE";

// Clear errors
export const CLEAR_ENQUIRY_ERRORS: string = "CLEAR_ENQUIRY_ERRORS";

// Using the pattern from other files, grouping actions into objects
export const GetEnquiries: ActionTypes = {
  Request: GET_ENQUIRIES_REQUEST,
  Success: GET_ENQUIRIES_SUCCESS,
  Fail: GET_ENQUIRIES_FAILURE,
};

export const GetEnquiryDetails: ActionTypes = {
  Request: GET_ENQUIRY_DETAILS_REQUEST,
  Success: GET_ENQUIRY_DETAILS_SUCCESS,
  Fail: GET_ENQUIRY_DETAILS_FAILURE,
};

export const UpdateEnquiryStatus: ActionTypes = {
  Request: UPDATE_ENQUIRY_STATUS_REQUEST,
  Success: UPDATE_ENQUIRY_STATUS_SUCCESS,
  Fail: UPDATE_ENQUIRY_STATUS_FAILURE,
};

export const SendEnquiryReply: ActionTypes = {
  Request: SEND_ENQUIRY_REPLY_REQUEST,
  Success: SEND_ENQUIRY_REPLY_SUCCESS,
  Fail: SEND_ENQUIRY_REPLY_FAILURE,
};

export const DeleteEnquiry: ActionTypes = {
  Request: DELETE_ENQUIRY_REQUEST,
  Success: DELETE_ENQUIRY_SUCCESS,
  Fail: DELETE_ENQUIRY_FAILURE,
};

// Enquiry-specific types
export type EnquiryStatus = 'read' | 'unread' | 'archived';

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  replies?: EnquiryReply[];
  createdAt: Date;
  updatedAt: Date;
};

export type EnquiryReply = {
  id: string;
  enquiryId: string;
  message: string;
  createdAt: Date;
};

export type EnquiryState = {
  enquiries: Enquiry[];
  enquiry: Enquiry | null;
  loading: boolean;
  error: string | null;
  success: boolean;
};