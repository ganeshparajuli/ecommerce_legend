// src/constants/userConstants.ts

// Login constants
export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGIN_FAIL = 'USER_LOGIN_FAIL';

// Logout constant
export const USER_LOGOUT = 'USER_LOGOUT';

// Registration constants
export const USER_REGISTER_REQUEST = 'USER_REGISTER_REQUEST';
export const USER_REGISTER_SUCCESS = 'USER_REGISTER_SUCCESS';
export const USER_REGISTER_FAIL = 'USER_REGISTER_FAIL';

// User details constants
export const USER_DETAILS_REQUEST = 'USER_DETAILS_REQUEST';
export const USER_DETAILS_SUCCESS = 'USER_DETAILS_SUCCESS';
export const USER_DETAILS_FAIL = 'USER_DETAILS_FAIL';
export const USER_DETAILS_RESET = 'USER_DETAILS_RESET';

// Profile update constants
export const USER_UPDATE_PROFILE_REQUEST = 'USER_UPDATE_PROFILE_REQUEST';
export const USER_UPDATE_PROFILE_SUCCESS = 'USER_UPDATE_PROFILE_SUCCESS';
export const USER_UPDATE_PROFILE_FAIL = 'USER_UPDATE_PROFILE_FAIL';
export const USER_UPDATE_PROFILE_RESET = 'USER_UPDATE_PROFILE_RESET';

// Admin user management constants
export const GET_ALL_USERS_REQUEST = 'GET_ALL_USERS_REQUEST';
export const GET_ALL_USERS_SUCCESS = 'GET_ALL_USERS_SUCCESS';
export const GET_ALL_USERS_FAIL = 'GET_ALL_USERS_FAIL';

export const UPDATE_USER_REQUEST = 'UPDATE_USER_REQUEST';
export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS';
export const UPDATE_USER_FAIL = 'UPDATE_USER_FAIL';

// Error handling
export const CLEAR_ERROR = 'CLEAR_ERROR';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  address?: string;
  isProfileComplete?: boolean;
  [key: string]: any; // Allow additional properties
}

// For compatibility with structured approach (optional)
export const Login = {
  Request: USER_LOGIN_REQUEST,
  Success: USER_LOGIN_SUCCESS,
  Fail: USER_LOGIN_FAIL,
};

export const Register = {
  Request: USER_REGISTER_REQUEST,
  Success: USER_REGISTER_SUCCESS,
  Fail: USER_REGISTER_FAIL,
};

export const LoadUser = {
  Request: USER_DETAILS_REQUEST,
  Success: USER_DETAILS_SUCCESS,
  Fail: USER_DETAILS_FAIL,
  Reset: USER_DETAILS_RESET,
};

export const UpdateUser = {
  Request: USER_UPDATE_PROFILE_REQUEST,
  Success: USER_UPDATE_PROFILE_SUCCESS,
  Fail: USER_UPDATE_PROFILE_FAIL,
  Reset: USER_UPDATE_PROFILE_RESET,
};

export const AllUser = {
  Request: GET_ALL_USERS_REQUEST,
  Success: GET_ALL_USERS_SUCCESS,
  Fail: GET_ALL_USERS_FAIL,
};

export const AddUser = {
  Request: USER_REGISTER_REQUEST, // Reusing registration constants
  Success: USER_REGISTER_SUCCESS,
  Fail: USER_REGISTER_FAIL,
};

export const LogOut = {
  Success: USER_LOGOUT,
  Fail: "USER_LOGOUT_FAIL", // Not defined in original constants
};

export const ClearError = CLEAR_ERROR;