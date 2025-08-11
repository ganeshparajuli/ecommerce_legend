// File: src/screens/Auth/Login.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  LockIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  MonitorIcon,
  CheckCircleIcon,
  XCircleIcon,
  MailIcon,
  PhoneIcon,
  HomeIcon,
  ShoppingCart,
} from "lucide-react";
import type { RootState } from "../../redux/store";
import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
import { login } from "../../redux/actions/userActions";

const UserLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  // Get user login state from Redux store
  const userLogin = useSelector((state: RootState) => state.user);
  const { loading, error, user, isAuthenticated } = userLogin;

  // Get admin settings for company logo (if it exists in Redux)
  const adminSettings = useSelector(
    (state: RootState) => (state as any).adminSettings || {}
  );
  const { companyLogo, companyName } = adminSettings;

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const hasRedirected = useRef(false);

  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberEmail");
    if (rememberedEmail) {
      setUserData((prev) => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (!user || !isAuthenticated || hasRedirected.current) return;

    if (location.pathname === "/login") {
      hasRedirected.current = true;

      // Get the page user was trying to access
      const from = location.state?.from;

      console.log(`🚀 Redirecting user with role: ${user.role}`);
      console.log(`📍 User was trying to access: ${from || "none"}`);

      // Helper function to check if user has access to a specific route
      const hasAccessToRoute = (route: string, userRole: string): boolean => {
        const role = userRole.toLowerCase();

        // Admin routes access control
        if (route.startsWith("/admin")) {
          const adminRoles = ["admin", "sales", "finance", "sub-admin"];
          if (!adminRoles.includes(role)) return false;

          // More specific route access checks
          if (
            route.includes("/admin/dashboard") &&
            !["admin", "sub-admin"].includes(role)
          )
            return false;
          if (route.includes("/admin/users") && role !== "admin") return false;
          if (
            route.includes("/admin/settings") &&
            !["admin", "sub-admin", "sales"].includes(role)
          )
            return false;
          if (
            route.includes("/admin/products") &&
            !["admin", "sub-admin"].includes(role)
          )
            return false;
          if (
            route.includes("/admin/categories") &&
            !["admin", "sub-admin"].includes(role)
          )
            return false;
          if (
            route.includes("/admin/brands") &&
            !["admin", "sub-admin"].includes(role)
          )
            return false;
          if (
            route.includes("/admin/customers") &&
            !["admin", "sub-admin", "sales"].includes(role)
          )
            return false;
          if (
            route.includes("/admin/promocodes") &&
            !["admin", "finance"].includes(role)
          )
            return false;
          if (
            route.includes("/admin/orders") &&
            !["admin", "sales", "finance", "sub-admin"].includes(role)
          )
            return false;

          return true;
        }

        // Profile routes - all authenticated users can access
        if (route.startsWith("/profile")) return true;

        // Checkout, orders etc - all authenticated users can access
        if (["/checkout", "/order-confirmation"].includes(route)) return true;

        // Public routes - everyone can access
        return true;
      };

      // If user was trying to access a specific page AND has access to it, redirect there
      if (from && hasAccessToRoute(from, user.role)) {
        console.log(`✅ Redirecting to originally requested page: ${from}`);
        navigate(from, { replace: true });
        return;
      }

      // Get default route for role
      const getDefaultRouteForRole = (role: string): string => {
        switch (role.toLowerCase()) {
          case "admin":
            return "/admin/dashboard";
          case "sub-admin":
            return "/admin/dashboard";
          case "sales":
            return "/admin/orders";
          case "finance":
            return "/admin/orders";
          default:
            return "/";
        }
      };

      const defaultRoute = getDefaultRouteForRole(user.role);

      if (from && !hasAccessToRoute(from, user.role)) {
        console.log(
          `❌ User doesn't have access to ${from}, redirecting to default: ${defaultRoute}`
        );
        // Use consistent toast styling - delay to avoid conflict
        setTimeout(() => {
          toast.info(
            `Redirected to your default page. You don't have access to the requested page.`,
            {
              duration: 3000,
              position: "top-right",
              style: {
                background: "#ffffff",
                color: "#374151",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "14px",
                padding: "12px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
              },
            }
          );
        }, 1500);
      } else {
        console.log(
          `🏠 No specific route requested, redirecting to default: ${defaultRoute}`
        );
      }

      navigate(defaultRoute, { replace: true });
    }
  }, [user, isAuthenticated, navigate, location]);

  // Form validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!userData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!userData.password) {
      errors.password = "Password is required";
    } else if (userData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) {
      console.log("⚠️ Form already submitting, ignoring duplicate submission");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#ffffff",
          color: "#dc2626",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        },
      });
      return;
    }

    console.log("Form data before dispatch:", userData);

    try {
      // Reset redirect flag before login attempt
      hasRedirected.current = false;

      // Dispatch login action
      const result = await dispatch(login(userData) as any);

      console.log("Login attempt:", userData);

      // Check if login was successful
      if (result?.success) {
        console.log("✅ Login successful, showing success toast");

        // Use consistent toast styling matching products page
        toast.success(
          <div className="flex items-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mr-2 sm:mr-3">
              <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-sm sm:text-base">
                Login Successful!
              </div>
              <div className="text-xs sm:text-sm text-gray-600">
                Redirecting to your dashboard...
              </div>
            </div>
          </div>,
          {
            duration: 4000,
            position: "top-right",
            style: {
              background: "#ffffff",
              color: "#374151",
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "12px 16px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
            },
          }
        );

        // The useEffect above will handle the redirect
      } else if (result?.error) {
        toast.error(result.error, {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#ffffff",
            color: "#dc2626",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            fontSize: "14px",
            padding: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          },
        });
      } else if (error) {
        toast.error(error, {
          duration: 3000,
          position: "top-right",
          style: {
            background: "#ffffff",
            color: "#dc2626",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            fontSize: "14px",
            padding: "12px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          },
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.", {
        duration: 3000,
        position: "top-right",
        style: {
          background: "#ffffff",
          color: "#dc2626",
          border: "1px solid #fecaca",
          borderRadius: "12px",
          fontSize: "14px",
          padding: "12px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        },
      });
    } finally {
      // Save email to local storage if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem("rememberEmail", userData.email);
      } else {
        localStorage.removeItem("rememberEmail");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar Section */}
      <NavbarSection />

      {/* Toaster for notifications - Configure for consistent positioning */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "12px 16px",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          },
        }}
      />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-3 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 mb-16 sm:mb-20 lg:mb-24">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {/* Company Logo & Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            {/* Company Logo */}
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              {companyLogo ? (
                <motion.img
                  src={companyLogo}
                  alt={companyName || "Company Logo"}
                  className="h-12 w-auto sm:h-16 max-w-[200px] object-contain"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              ) : (
                <motion.div
                  className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-3 sm:p-4 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <HomeIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </motion.div>
              )}
            </div>

            <motion.h1
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p
              className="text-gray-700 text-sm sm:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {companyName
                ? `Sign in to your ${companyName} account`
                : "Sign in to your Joy Store account"}
            </motion.p>
          </motion.div>

          {/* Login Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-gray-100"
          >
            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-start"
                >
                  <XCircleIcon className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-black mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                      formErrors.email
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                        : "border-gray-200 focus:ring-green-500 focus:border-green-500 hover:border-gray-300"
                    }`}
                    required
                  />
                </div>
                <AnimatePresence>
                  {formErrors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      {formErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-black mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={userData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-3 sm:py-4 border-2 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 text-sm sm:text-base ${
                      formErrors.password
                        ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                        : "border-gray-200 focus:ring-green-500 focus:border-green-500 hover:border-gray-300"
                    }`}
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </motion.button>
                </div>
                <AnimatePresence>
                  {formErrors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-sm text-red-600 flex items-center"
                    >
                      <XCircleIcon className="w-4 h-4 mr-1" />
                      {formErrors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-black font-medium"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className={`w-full flex items-center justify-center px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-white shadow-lg transition-all duration-300 text-sm sm:text-base ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl"
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRightIcon className="w-5 h-5 ml-2" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Register Link */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-sm text-gray-700">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-green-600 hover:text-green-700 transition-colors"
                >
                  Create one here
                </Link>
              </span>
            </motion.div>
          </motion.div>

          {/* Security Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="bg-gray-50 rounded-2xl p-4 sm:p-6 border border-gray-100"
          >
            <div className="flex items-center justify-center mb-4">
              <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
              <span className="text-sm sm:text-base font-semibold text-black">
                Secure Login
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
              <motion.div
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-green-100 rounded-full p-2 sm:p-3 mb-2">
                  <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <span className="text-xs sm:text-sm text-black font-medium">
                  SSL Encrypted
                </span>
              </motion.div>
              <motion.div
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-blue-100 rounded-full p-2 sm:p-3 mb-2">
                  <SmartphoneIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <span className="text-xs sm:text-sm text-black font-medium">
                  Mobile Friendly
                </span>
              </motion.div>
              <motion.div
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="bg-purple-100 rounded-full p-2 sm:p-3 mb-2">
                  <MonitorIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <span className="text-xs sm:text-sm text-black font-medium">
                  Multi-Device
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Support Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-center bg-white rounded-xl p-3 sm:p-4 border border-gray-100"
          >
            <p className="text-sm sm:text-base text-black font-semibold mb-3">
              Need help?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm">
              <motion.a
                href="tel:9851343371"
                className="text-green-600 hover:text-green-700 transition-colors flex items-center font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <PhoneIcon className="w-4 h-4 mr-1" />
                Kathmandu: 9851343371
              </motion.a>
              <span className="hidden sm:inline text-gray-400">|</span>
              <motion.a
                href="tel:985-6060163"
                className="text-green-600 hover:text-green-700 transition-colors flex items-center font-medium"
                whileHover={{ scale: 1.05 }}
              >
                <PhoneIcon className="w-4 h-4 mr-1" />
                Pokhara: 985-6060163
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <FooterSection />
    </div>
  );
};

export default UserLogin;
