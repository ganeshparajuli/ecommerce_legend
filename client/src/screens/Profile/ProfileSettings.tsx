import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  ArrowLeft,
  Camera,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import {
  NavbarSection,
  Breadcrumb,
} from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
import authUtils from "../../utils/authUtils";
import { updateUser, loadUser } from "../../redux/actions/userActions";
import type { RootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import api from "../../redux/api";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Errors {
  [key: string]: string;
}

const ProfileSettings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const {
    user,
    loading: userLoading,
    error: userError,
  } = useSelector((state: RootState) => state.user);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Get token from localStorage for debugging
  const token = localStorage.getItem("token");

  // Enhanced fetchUserData with multiple endpoint attempts for reliability
  const fetchUserData = async (userId: string) => {
    try {
      setLoading(true);

      // Ensure we have a token
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        setErrors({
          general: "Authentication token not found. Please log in again.",
        });
        setLoading(false);
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Try multiple endpoints for better reliability
      const endpoints = [
        "/user/me",
        "/user/profile",
        userId ? `/user/${userId}` : null,
      ].filter(Boolean); // Remove null entries

      let userData = null;
      let lastError = null;

      // Try each endpoint in sequence until one works
      for (const endpoint of endpoints) {
        try {
          console.log(`Attempting to fetch user data from ${endpoint}`);
          const response = await api.get(endpoint, config);

          if (response.data && (response.data.user || response.data)) {
            userData = response.data.user || response.data;
            console.log("User data received from", endpoint, userData);
            break; // Exit loop if we got valid data
          }
        } catch (error) {
          console.log(`Failed to fetch from ${endpoint}:`, error);
          lastError = error;
          // Continue to next endpoint
        }
      }

      if (userData) {
        // Successfully got user data from one of the endpoints
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          address: userData.address || "",
        });

        // If we got userId, store it for future
        if (userData.id) {
          localStorage.setItem("userId", userData.id);
        }

        // Clear any errors
        if (errors.general) {
          setErrors({});
        }
      } else {
        // All endpoints failed
        console.error("All API endpoints failed to return valid user data");

        if (lastError?.response) {
          console.error(
            "Last API error:",
            lastError.response.status,
            lastError.response.data
          );
          setErrors({
            general: `Failed to load user data (${
              lastError.response.status
            }): ${lastError.response.data?.message || "Unknown error"}`,
          });
        } else {
          setErrors({
            general:
              "Failed to load user data from server. Please try logging in again.",
          });
        }
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error);
      setErrors({
        general: "An unexpected error occurred while fetching user data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to retry loading user data
  const retryLoadUser = () => {
    setErrors({});

    // Try to dispatch Redux action first
    dispatch(loadUser() as any)
      .then(() => {
        console.log("User data loaded via Redux");
      })
      .catch((err) => {
        console.error("Failed to load user via Redux:", err);

        // Fallback: try direct API call
        const userId =
          authUtils.getUser()?.id || localStorage.getItem("userId");
        if (userId) {
          fetchUserData(userId);
        } else {
          setErrors({ general: "Cannot identify user. Please log in again." });
        }
      });
  };

  useEffect(() => {
    const loggedOut = localStorage.getItem("loggedOut");

    // First check if we're logged out
    if (loggedOut === "true") {
      console.log("User is logged out, redirecting to login");
      navigate("/login");
      return;
    }

    // Check authentication and load data
    if (!api.checkAuth()) {
      console.log("No auth token found, redirecting to login");
      navigate("/login");
      return;
    }

    // Load user data - first try Redux
    dispatch(loadUser() as any);

    // Use a timeout to switch to direct API call if Redux is taking too long
    const timer = setTimeout(() => {
      if (userLoading || (!user && !userError)) {
        console.log(
          "Redux user loading taking too long, trying direct API call"
        );
        const userId =
          authUtils.getUser()?.id || localStorage.getItem("userId");
        if (userId) {
          fetchUserData(userId);
        }
      }
    }, 2000); // 2 second timeout

    return () => clearTimeout(timer);
  }, [dispatch, navigate]);

  // Effect to update form when Redux user data changes
  useEffect(() => {
    // Normalize user data from Redux state before using
    if (user) {
      console.log("Raw Redux user data:", user);

      // Handle different potential data structures for better resilience
      let normalizedUser;

      if (user.user) {
        // Handle nested user object: { user: {...} }
        normalizedUser = user.user;
      } else if (typeof user === "object" && user.id) {
        // Handle direct user object: { id: '...', name: '...' }
        normalizedUser = user;
      } else if (typeof user === "string") {
        // Handle case where user might be a string (unlikely but defensive)
        try {
          normalizedUser = JSON.parse(user);
        } catch (e) {
          console.error("Failed to parse user string:", e);
          normalizedUser = null;
        }
      } else {
        console.warn("Unknown user data format:", user);
        normalizedUser = null;
      }

      // Only proceed if we have valid normalized user data
      if (normalizedUser && (normalizedUser.name || normalizedUser.email)) {
        console.log("Normalized user data:", normalizedUser);

        setFormData({
          name: normalizedUser.name || "",
          email: normalizedUser.email || "",
          phone: normalizedUser.phone || "",
          address: normalizedUser.address || "",
        });

        setLoading(false);

        // Clear any previous errors
        if (errors.general) {
          setErrors({});
        }
      } else {
        console.error("Invalid user data after normalization");

        // If the user data is invalid after normalization, try direct API
        if (loading) {
          const userId =
            authUtils.getUser()?.id || localStorage.getItem("userId");
          if (userId) {
            console.log("User data invalid, trying direct API call");
            fetchUserData(userId);
          } else {
            // Try to decode the token to get the userId
            const token = localStorage.getItem("token");
            if (token) {
              try {
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split("")
                    .map(function (c) {
                      return (
                        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                      );
                    })
                    .join("")
                );

                const payload = JSON.parse(jsonPayload);
                const tokenUserId = payload.id || payload.userId || payload.sub;

                if (tokenUserId) {
                  console.log(
                    "Extracted user ID from token, trying direct API call"
                  );
                  fetchUserData(tokenUserId);
                }
              } catch (e) {
                console.error("Failed to extract userId from token:", e);
                setErrors({
                  general: "Cannot identify user. Please log in again.",
                });
                setLoading(false);
              }
            }
          }
        }
      }
    } else if (!userLoading && userError) {
      console.error("Redux user error:", userError);

      // If we have a Redux error and we're still loading, try direct API
      if (loading) {
        const userId =
          authUtils.getUser()?.id || localStorage.getItem("userId");
        if (userId) {
          console.log("Trying direct API call after Redux error");
          fetchUserData(userId);
        } else {
          setErrors({
            general:
              "Failed to load user information. Please try logging in again.",
          });
          setLoading(false);
        }
      }
    }
  }, [user, userLoading, userError, loading, errors]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setErrors({});

      // Get user ID from Redux state or local storage
      const normalizedUser =
        user && typeof user === "object" && user.user ? user.user : user;
      const userId =
        normalizedUser?.id ||
        authUtils.getUser()?.id ||
        localStorage.getItem("userId");

      if (!userId) {
        setErrors({
          general: "User ID not found. Please try logging in again.",
        });
        setSaving(false);
        return;
      }

      console.log(
        "Updating user profile for ID:",
        userId,
        "with data:",
        formData
      );

      const result = await dispatch(updateUser(userId, formData) as any);

      if (!result?.success) {
        throw new Error(result?.error || "Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error("Profile update error:", error);

      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else if (error.message) {
        setErrors({ general: `Update failed: ${error.message}` });
      } else {
        setErrors({ general: "Failed to update profile. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);

      // Create a FormData object for the file upload
      const formData = new FormData();
      formData.append("profileImage", file);

      // Get normalized user ID from various potential sources
      const normalizedUser =
        user && typeof user === "object" && user.user ? user.user : user;
      const userId =
        normalizedUser?.id ||
        authUtils.getUser()?.id ||
        localStorage.getItem("userId");

      if (!userId) {
        setErrors({
          general: "User ID not found. Please try logging in again.",
        });
        setSaving(false);
        return;
      }

      console.log("Uploading profile image for user ID:", userId);

      // Upload the image using the API
      const response = await api.put(
        `user/update-image/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Image upload response:", response);

      if (response.data.success) {
        // Reload user data to update the profile image
        dispatch(loadUser() as any);

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setErrors({ general: response.data.message || "Image upload failed" });
      }
    } catch (error: any) {
      console.error("Profile image upload error:", error);

      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({
          general: "Failed to upload profile image. Please try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavbarSection />
        <div className="flex flex-col justify-center items-center h-screen space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
          <p className="text-black font-medium">Loading profile settings...</p>
        </div>
        <FooterSection />
      </div>
    );
  }

  // Get normalized user for profile image display
  const normalizedUser =
    user && typeof user === "object" && user.user
      ? user.user
      : typeof user === "object"
      ? user
      : null;

  return (
    <div className="min-h-screen bg-white">
      <NavbarSection />
      <Breadcrumb
        items={[
          { name: "Home", href: "/", current: false },
          { name: "Profile", href: "/profile", current: false },
          { name: "Settings", href: "/profile/settings", current: true },
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate("/profile")}
                  className="mr-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    Profile Settings
                  </h1>
                  <p className="text-white/80 text-sm mt-1">
                    Manage your account information and preferences
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="m-6 p-4 bg-green-50 border border-green-200 rounded-xl"
            >
              <div className="flex items-center">
                <CheckCircle className="text-green-600 mr-3" size={20} />
                <p className="text-green-800 font-medium">
                  Profile updated successfully!
                </p>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="text-red-600 mr-3" size={20} />
                  <p className="text-red-800 font-medium">{errors.general}</p>
                </div>
                <button
                  onClick={retryLoadUser}
                  className="ml-auto p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-300"
                  title="Retry loading user data"
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            </motion.div>
          )}

          <div className="p-6 sm:p-8">
            {/* Profile Picture */}
            <div className="mb-8 text-center">
              <div className="relative inline-block">
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
                  {normalizedUser?.profileImage ? (
                    <img
                      src={normalizedUser.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/150";
                      }}
                    />
                  ) : (
                    <User className="w-12 h-12 sm:w-14 sm:h-14 text-gray-400" />
                  )}
                </div>
                <button
                  className="absolute bottom-2 right-2 bg-green-600 rounded-full p-3 hover:bg-green-700 transition-all duration-300 shadow-lg transform hover:scale-110"
                  onClick={() =>
                    document.getElementById("imageUpload")?.click()
                  }
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  type="file"
                  id="imageUpload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600 font-medium">
                Click the camera icon to change your profile picture
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-black mb-3"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 ${
                      errors.name ? "border-red-500" : "border-gray-200"
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-black font-medium`}
                    placeholder="Enter your full name"
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-black mb-3"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 ${
                      errors.email ? "border-red-500" : "border-gray-200"
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-black font-medium`}
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-bold text-black mb-3"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 ${
                      errors.phone ? "border-red-500" : "border-gray-200"
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-black font-medium`}
                    placeholder="Enter your phone number"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-bold text-black mb-3"
                >
                  Address
                </label>
                <div className="relative">
                  <div className="absolute top-4 left-0 pl-4 pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    rows={4}
                    value={formData.address}
                    onChange={handleChange}
                    className={`block w-full pl-12 pr-4 py-4 border-2 ${
                      errors.address ? "border-red-500" : "border-gray-200"
                    } rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all duration-300 text-black font-medium`}
                    placeholder="Enter your full address"
                  />
                </div>
                {errors.address && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-8 py-4 border border-transparent rounded-xl shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 font-bold ${
                    saving ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {saving ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      Saving Changes...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Save className="w-5 h-5 mr-3" />
                      Save Changes
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      <FooterSection />
    </div>
  );
};

export default ProfileSettings;