// src/api.ts - FIXED VERSION (prevents mutations)
import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

// Define extended API interface with custom methods
interface CustomAPI extends AxiosInstance {
  checkAuth: () => boolean;
  resetLoggedOutFlag: () => void;
}

// Replace with your own API endpoint
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
}) as CustomAPI;

// CRITICAL: Safe logging function that doesn't mutate data
const safeLog = (message: string, data?: any) => {
  if (data && typeof data === 'object') {
    // Clone data before logging to prevent mutations
    try {
      const safeData = JSON.parse(JSON.stringify(data));
      console.log(message, safeData);
    } catch (error) {
      console.log(message, '[Complex object - could not clone safely]');
    }
  } else {
    console.log(message, data);
  }
};

// Add a request interceptor to attach JWT token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem("token");
  const isCartEndpoint = config.url?.includes("cart") || false;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;

    // Add debug logging for cart-related requests to help troubleshoot
    if (isCartEndpoint) {
      console.log(`Auth token added to ${config.url} request`);
    }
  } else if (isCartEndpoint) {
    // Log warning if no token found for cart endpoints
    console.warn(`No auth token available for ${config.url} request`);
  }

  // Check for loggedOut flag if it's a cart endpoint
  if (isCartEndpoint) {
    const loggedOut = localStorage.getItem("loggedOut");
    if (loggedOut === "true") {
      console.warn("Request made while loggedOut flag is true");
    }
  }

  return config;
});

// CRITICAL FIX: Response interceptor that prevents mutations
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    // FIXED: Use safe logging that doesn't mutate response.data
    if (response.config.url?.includes("cart")) {
      console.log(
        `Cart API success: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`
      );
      // CRITICAL: Use safeLog instead of direct console.log
      safeLog("Response data:", response.data);
    }
    
    // CRITICAL: Deep clone response data to prevent mutations downstream
    if (response.data && typeof response.data === 'object') {
      try {
        // Create a completely new response object with cloned data
        const clonedResponse = {
          ...response,
          data: JSON.parse(JSON.stringify(response.data))
        };
        return clonedResponse;
      } catch (cloneError) {
        console.warn("Failed to clone response data, returning original:", cloneError);
        return response;
      }
    }
    
    return response;
  },
  (error: any): Promise<never> => {
    // Safely check if response exists before accessing status
    if (error.response) {
      if (error.response.status === 401) {
        console.error("Unauthorized API request:", error.config?.url);

        // Check if token exists but is invalid/expired
        const token = localStorage.getItem("token");
        if (token) {
          console.error("Token exists but is invalid or expired");

          // Only remove token if "auth" endpoint rejected it
          // This prevents wiping credentials during temporary network issues
          if (
            error.config?.url?.includes("auth") ||
            error.config?.url?.includes("login")
          ) {
            localStorage.removeItem("token");
            localStorage.setItem("loggedOut", "true");

            // SAFER: Use setTimeout to prevent mutation during error handling
            setTimeout(() => {
              if (window.location.pathname !== "/login") {
                window.location.href = "/login";
              }
            }, 0);
          }
        } else {
          console.error("No token found for authenticated request");
        }
      }

      // FIXED: Special handling for cart-related errors with safe logging
      if (error.config?.url?.includes("cart")) {
        console.error(`Cart API error (${error.response.status}):`);
        safeLog("Cart error data:", error.response.data);
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to check auth status (can be used before making sensitive requests)
api.checkAuth = function (): boolean {
  const token = localStorage.getItem("token");
  const loggedOut = localStorage.getItem("loggedOut");

  const isLoggedIn = Boolean(token && loggedOut !== "true");

  console.log("Auth check: token exists =", Boolean(token));
  console.log("Auth check: loggedOut flag =", loggedOut);
  console.log("Auth check: considered logged in =", isLoggedIn);

  return isLoggedIn;
};

// Function to clear the loggedOut flag (call this after successful login)
api.resetLoggedOutFlag = function (): void {
  localStorage.removeItem("loggedOut");
  console.log("Cleared loggedOut flag");
};

export default api;