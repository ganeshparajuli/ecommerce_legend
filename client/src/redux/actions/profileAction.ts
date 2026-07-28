// src/actions/profileAction.ts
import {
    GetProfile,
    UpdateProfile,
    ClearProfileErrors,
    Profile
  } from "../constants/profileConstants";
  import api from "../api";
  import { Dispatch } from "redux";
// Helper function to extract error message
const getErrorMessage = (error: any): string => {
    return error.response?.data?.message || error.message || "An error occurred";
  };
  
  interface DecodedToken {
    id: string;
    exp: number;
    iat: number;
    [key: string]: any;
  }
  
  // Get user profile
  export const getProfile = () => async (dispatch: Dispatch): Promise<void> => {
    try {
      dispatch({ type: GetProfile.Request });
      // Get the token from localStorage
      const token = localStorage.getItem("token");
  
      if (token) {
        // Decode the token to get the user's ID if it's part of the payload
        const decodedToken = JSON.parse(atob(token.split(".")[1])) as DecodedToken;
        const id = decodedToken.id; // Adjust if the ID is stored under a different key
  
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
  
        const link = `user/${id}`; // Use the user's ID to fetch the user data
        const { data } = await api.get(link, config);
        dispatch({ type: GetProfile.Success, payload: data.data });
      } else {
        dispatch({ type: GetProfile.Fail, payload: "No token found" });
      }
    } catch (error) {
      console.error("Error loading user:", error);
      const errorMessage = getErrorMessage(error);
      dispatch({ type: GetProfile.Fail, payload: errorMessage });
    }
  };
  
  // updateProfileImage action
  export const updateProfileImage = (profileData: FormData) => async (dispatch: Dispatch): Promise<boolean> => {
    try {
      dispatch({ type: UpdateProfile.Request });
  
      const token = localStorage.getItem("token");
  
      if (!token) {
        dispatch({ type: UpdateProfile.Fail, payload: "No token found" });
        return false;
      }
  
      const decodedToken = JSON.parse(atob(token.split(".")[1])) as DecodedToken;
      const id = decodedToken.id;
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Required for image uploads
        },
      };
  
      const result = await api.put(`user/update-image/${id}`, profileData, config);
      console.log("Image update result:", result);

      dispatch({
        type: UpdateProfile.Success,
        payload: result?.data?.data || {},
      });
  
      return true;
    } catch (error) {
      console.error("Profile image update error:", error);
      dispatch({
        type: UpdateProfile.Fail,
        payload: getErrorMessage(error),
      });
      return false;
    }
  };
  
  // updateProfileFields action
  export const updateProfileFields = (profileData: Partial<Profile>) => async (dispatch: Dispatch): Promise<boolean> => {
    try {
      dispatch({ type: UpdateProfile.Request });
  
      const token = localStorage.getItem("token");
  
      if (!token) {
        dispatch({ type: UpdateProfile.Fail, payload: "No token found" });
        return false;
      }
  
      const decodedToken = JSON.parse(atob(token.split(".")[1])) as DecodedToken;
      const id = decodedToken.id;
  
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Required for regular fields like name, email
        },
      };
  
      const result = await api.put(`user/${id}`, profileData, config);
      console.log("Profile fields update result:", result);

      dispatch({
        type: UpdateProfile.Success,
        payload: result?.data?.data || {},
      });
  
      return true;
    } catch (error) {
      console.error("Profile fields update error:", error);
      dispatch({
        type: UpdateProfile.Fail,
        payload: getErrorMessage(error),
      });
      return false;
    }
  };
  
  // Reset profile update state
  export const resetProfileUpdate = () => ({
    type: UpdateProfile.Reset,
  });
  
  // Clear profile errors
  export const clearProfileErrors = () => ({
    type: ClearProfileErrors,
  });