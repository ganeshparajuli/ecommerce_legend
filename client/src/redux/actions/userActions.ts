// Updated userActions.ts - COMPLETE FIXED VERSION with deep cloning and infinite loop prevention
import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_DETAILS_REQUEST,
  USER_DETAILS_SUCCESS,
  USER_DETAILS_FAIL,
  USER_LOGOUT,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
  AllUser
} from "../constants/userConstants";
import api from "../api";
import type { Dispatch, AnyAction } from "redux";

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  return error.response?.data?.message || error.message || "An error occurred";
};

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  address?: string;
  isProfileComplete?: boolean;
  [key: string]: any;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string;
}

// login User
export const login = (userData: LoginCredentials) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    const link = `user/login`;
    const response = await api.post(link, userData);

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.removeItem("loggedOut");

    dispatch({ type: USER_LOGIN_SUCCESS, payload: user });

    return { success: true, payload: { user } };
  } catch (error) {
    // Handle errors gracefully
    const errorMessage = getErrorMessage(error);
    dispatch({ type: USER_LOGIN_FAIL, payload: errorMessage });

    return {
      success: false,
      error: errorMessage,
    };
  }
};

// register User
export const register = (userData: RegisterData) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });
    const link = `user/register`;
    const response = await api.post(link, userData);
    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("newRegistration", "true");
    localStorage.removeItem("loggedOut");

    dispatch({ type: USER_REGISTER_SUCCESS, payload: user });

    return { success: true, payload: { user } };
  } catch (error) {
    // Handle errors gracefully
    const errorMessage = getErrorMessage(error);
    dispatch({ type: USER_REGISTER_FAIL, payload: errorMessage });
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// add user Admin
export const addUser = (userData: RegisterData) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });
    const response = await api.post("user/add", userData);
    const { user } = response.data;
    dispatch({ type: USER_REGISTER_SUCCESS, payload: user });
    return { success: true, payload: { user } };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({ type: USER_REGISTER_FAIL, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Clearing errors
export const clearErrors = () => (dispatch: Dispatch<AnyAction>) => {
  // You might want to add a CLEAR_ERROR constant in userConstants.ts
  dispatch({ type: "CLEAR_ERROR" });
};

// FIXED: Load user profile with better error handling
export const loadUser = () => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: USER_DETAILS_REQUEST });

    const loggedOut = localStorage.getItem("loggedOut");
    if (loggedOut === "true") {
      dispatch({ type: USER_DETAILS_FAIL, payload: "User is logged out" });
      return { success: false, error: "User is logged out" };
    }

    const token = localStorage.getItem("token");
    if (!token) {
      dispatch({ type: USER_DETAILS_FAIL, payload: "No token found" });
      return { success: false, error: "No token found" };
    }

    const userId = extractUserIdFromToken(token);
    if (!userId) {
      dispatch({ type: USER_DETAILS_FAIL, payload: "Invalid token format" });
      return { success: false, error: "Invalid token format" };
    }

    const { data } = await api.get(`user/${userId}`);
    dispatch({ type: USER_DETAILS_SUCCESS, payload: data.data });
    return { success: true, payload: { user: data.data } };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({ type: USER_DETAILS_FAIL, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

// Helper function to extract user ID from JWT token
function extractUserIdFromToken(token: string): string | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    return payload.id || payload.userId || payload.sub; // Common JWT fields for user ID
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
}

// get all users
export const getAllUsers = () => async (dispatch: Dispatch<AnyAction>, getState: () => any): Promise<any> => {
  try {
    const state = getState();
    const users = state.user;
    if (users?.loading || (users?.users && users.users.length > 0)) {
      return { success: true, data: users?.users || [] };
    }

    dispatch({ type: AllUser.Request });
    const response = await api.get("user");
    const parsedUsers = response.data.data || [];
    dispatch({ type: AllUser.Success, payload: parsedUsers });
    return { success: true, payload: { users: parsedUsers } };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({ type: AllUser.Fail, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

export const updateUser = (id: string, userData: Partial<User>) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    dispatch({ type: UPDATE_USER_REQUEST });
    await api.put(`user/${id}`, userData);
    dispatch({ type: UPDATE_USER_SUCCESS, payload: { message: "User updated successfully", userId: id } });
    return { success: true, message: "User updated successfully" };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({ type: UPDATE_USER_FAIL, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

export const updateProfile = (userData: Partial<User>) => async (dispatch: Dispatch<AnyAction>) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { success: false, error: "No token found" };

    const userId = extractUserIdFromToken(token);
    if (!userId) return { success: false, error: "Invalid token format" };

    dispatch({ type: USER_UPDATE_PROFILE_REQUEST });
    const response = await api.put(`user/${userId}`, userData);
    dispatch({ type: USER_UPDATE_PROFILE_SUCCESS, payload: response.data.data });
    return { success: true, payload: { user: response.data.data } };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    dispatch({ type: USER_UPDATE_PROFILE_FAIL, payload: errorMessage });
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = () => (dispatch: Dispatch<AnyAction>) => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("newRegistration");
    localStorage.removeItem("profileModalDismissed");
    localStorage.setItem("loggedOut", "true");

    dispatch({ type: "CLEAR_CART" });

    // Finally, log out the user
    dispatch({ type: USER_LOGOUT });
    
    // IMPORTANT: Return success but don't redirect here
    // Let the component handle the redirect
    return { success: true };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Error during logout:", errorMessage);
    // There's no specific fail action for logout in the constants
    return {
      success: false,
      error: errorMessage
    };
  }
};