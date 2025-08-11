import { useEffect, useRef, useState } from "react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Homepage from "./screens/Homepage/Homepage";
import NewArrivals from "./screens/NewArrivals";
import Products from "./screens/Products";
import Categories from "./screens/Categories";
import Brands from "./screens/Brands";
import ProductDetails from "./screens/ProductDetails";
import Cart from "./screens/Cart";
import Checkout from "./screens/Checkout";
import OrderConfirmation from "./screens/OrderConfirmation";
import NotFound from "./screens/NotFound";

// Auth pages
import UserLogin from "./screens/Auth/Login";
import UserRegister from "./screens/Auth/Register";

// Profile pages
import Profile from "./screens/Profile/Profile";
import ProfileSettings from "./screens/Profile/ProfileSettings";
import Wishlist from "./screens/Profile/Wishlist";
import MyOrders from "./screens/Profile/MyOrders";
import Address from "./screens/Profile/Address";

// Admin module - Import specific admin components if they exist
import Admin from "./screens/Admin";

// Footer pages
import AboutUs from "./screens/Footer/AboutUs";
import ContactUs from "./screens/Footer/ContactUs";
import TermsConditions from "./screens/Footer/TermsConditions";
import PrivacyPolicy from "./screens/Footer/PrivacyPolicy";
import DeliveryDetails from "./screens/Footer/DeliveryDetails";
import EMI from "./screens/Footer/EMI";
import Locations from "./screens/Footer/Locations";
import Account from "./screens/Footer/Account";
import CustomerSupport from "./screens/Footer/CustomerSupport";
import Sales from "./screens/Sales";

// Components
import ScrollToTop from "./components/ScrollToTop";
import FloatingCart from "./components/FloatingCart";
import { Toaster } from "./components/ui/toaster";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen"; // Add this import

// Redux actions
import { loadUser } from "./redux/actions/userActions";
import { getCart } from "./redux/actions/cartAction";
import { myOrders } from "./redux/actions/orderAction";

// Import RootState type
import type { RootState } from "./redux/store";
import OrderDetailPage from "./screens/Profile/OrderDetails";
import NavbarSection from "./screens/Homepage/sections/NavbarSection/NavbarSection";

// Helper function to extract user ID from token
const getUserIdFromToken = (token: string): string | null => {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const decodedToken = JSON.parse(jsonPayload);
    return decodedToken.id || decodedToken.sub || decodedToken.user_id || null;
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

// Enhanced loading screen component
const AppLoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 border-4 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 text-sm font-medium">Loading Joy Store...</p>
    </div>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const appInitialized = useRef(false);
  const userDataLoaded = useRef(false);

  // CRITICAL: Add app initialization state
  const [isAppInitialized, setIsAppInitialized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // NEW: Splash screen state - shows on every page refresh
  const [showSplashScreen, setShowSplashScreen] = useState(false);

  // Check if current route is admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Check if current route should show FloatingCart (ONLY Products and related pages)
  const shouldShowFloatingCart =
    location.pathname === "/products" ||
    location.pathname.startsWith("/products/category/") ||
    location.pathname === "/categories" ||
    location.pathname === "/brands";

  // Get user authentication state
  const {
    isAuthenticated,
    loading: userLoading,
    user,
  } = useSelector((state: RootState) => state.user);

  // Get other state data
  const { orders } = useSelector((state: RootState) => state.order);
  const { cartItems } = useSelector((state: RootState) => state.cart);
  const { items: wishlistItems } = useSelector(
    (state: RootState) => state.wishlist
  );

  // Function to load all user data
  const loadAllUserData = async (userId: string) => {
    try {
      console.log("🔄 Loading all user data for user:", userId);

      // Load all user-related data in parallel
      const promises = [
        dispatch(getCart() as any),
        dispatch(myOrders(userId) as any),
        // dispatch(getWishlist() as any), // Uncomment when available
      ];

      await Promise.all(promises);
      userDataLoaded.current = true;
      console.log("✅ All user data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading user data:", error);
    }
  };

  // CRITICAL: Initialize app and check authentication
  useEffect(() => {
    const initializeApp = async () => {
      if (!appInitialized.current) {
        appInitialized.current = true;
        console.log("🚀 App initializing - checking authentication");

        // Check if user has explicitly logged out
        const justLoggedOut = localStorage.getItem("loggedOut");
        const token = localStorage.getItem("token");

        console.log("🔍 App: Initial auth check", {
          hasToken: !!token,
          justLoggedOut,
          isAuthenticated,
        });

        // If logged out, finish initialization immediately
        if (justLoggedOut === "true") {
          console.log("🚪 User is logged out, skipping auth check");
          setIsCheckingAuth(false);
          setIsAppInitialized(true);
          return;
        }

        // If we have a token, verify it with the server
        if (token && !isAuthenticated && !user) {
          console.log("🔄 Token found, verifying with server...");
          try {
            const result = await dispatch(loadUser() as any);
            console.log("✅ Token verification complete", result);
          } catch (error) {
            console.error("❌ Token verification failed:", error);
            // Clear invalid token
            localStorage.removeItem("token");
            localStorage.setItem("loggedOut", "true");
          }
        }

        // Finish initialization
        setIsCheckingAuth(false);
        setIsAppInitialized(true);
        console.log("✅ App initialization complete");
      }
    };

    initializeApp();
  }, [dispatch, isAuthenticated, user]);

  // NEW: Show splash screen after app is initialized
  useEffect(() => {
    if (isAppInitialized && !isCheckingAuth && !userLoading) {
      // Small delay to ensure smooth loading
      const timer = setTimeout(() => {
        setShowSplashScreen(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAppInitialized, isCheckingAuth, userLoading]);

  // Step 2: Load user data after authentication is confirmed
  useEffect(() => {
    const initializeUserData = async () => {
      if (isAuthenticated && user && !userDataLoaded.current && !userLoading) {
        console.log("App: Initializing data for authenticated user");

        // Get user ID from token
        const token = localStorage.getItem("token");
        if (token) {
          const userId = getUserIdFromToken(token);
          if (userId) {
            await loadAllUserData(userId);
          } else {
            console.error("Could not extract user ID from token");
          }
        }
      }
    };

    initializeUserData();
  }, [dispatch, isAuthenticated, user, userLoading]);

  // Step 3: Reset data loading flag when user logs out
  useEffect(() => {
    if (!isAuthenticated && userDataLoaded.current) {
      userDataLoaded.current = false;
      console.log("User logged out - resetting data flags");
    }
  }, [isAuthenticated]);

  // Step 4: Token validation and cleanup
  useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Get expiration from token
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = JSON.parse(atob(base64));

          // Check if token is expired
          if (jsonPayload.exp && jsonPayload.exp * 1000 < Date.now()) {
            console.log("Token expired, logging out");
            localStorage.removeItem("token");
            localStorage.removeItem("userInfo");
            localStorage.setItem("loggedOut", "true");
            window.location.href = "/login";
          }
        } catch (error) {
          console.error("Invalid token format, logging out");
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          localStorage.setItem("loggedOut", "true");
          window.location.href = "/login";
        }
      }
    };

    validateToken();
  }, []);

  // NEW: Handle splash screen close
  const handleCloseSplash = () => {
    setShowSplashScreen(false);
  };

  // CRITICAL: Show loading screen until app is initialized
  if (isCheckingAuth || !isAppInitialized || userLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <>
      <ScrollToTop />
      <Toaster />
      <NavbarSection />

      <Routes>
        {/* ========================================= */}
        {/* PUBLIC ROUTES (No Authentication Required) */}
        {/* ========================================= */}

        <Route path="/" element={<Homepage />} />

        <Route path="/new-arrivals" element={<NewArrivals />} />

        <Route path="/products" element={<Products />} />

        <Route path="/products/category/:category" element={<Products />} />

        <Route path="/categories" element={<Categories />} />

        <Route path="/brands" element={<Brands />} />

        <Route path="/product/:id" element={<ProductDetails />} />

        {/* Cart - Can be accessed by anyone */}
        <Route path="/cart" element={<Cart />} />

        {/* Footer pages - Public */}
        <Route path="/about-us" element={<AboutUs />} />

        <Route path="/contact-us" element={<ContactUs />} />

        <Route path="/terms-conditions" element={<TermsConditions />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route path="/delivery-details" element={<DeliveryDetails />} />

        <Route path="/emi" element={<EMI />} />

        <Route path="/location" element={<Locations />} />

        <Route
          path="/account"
          element={
            <ProtectedRoute redirectTo="/login">
              <Account />
            </ProtectedRoute>
          }
        />

        <Route path="/customer-support" element={<CustomerSupport />} />

        <Route path="/sales" element={<Sales />} />

        {/* ========================================= */}
        {/* AUTHENTICATION ROUTES */}
        {/* ========================================= */}

        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />

        {/* ========================================= */}
        {/* CUSTOMER PROTECTED ROUTES */}
        {/* ========================================= */}

        {/* Checkout - Requires authentication */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute redirectTo="/login">
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* Order Confirmation - Requires authentication */}
        <Route
          path="/order-confirmation"
          element={
            <ProtectedRoute redirectTo="/login">
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />

        {/* Profile routes - all protected */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute redirectTo="/login">
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/settings"
          element={
            <ProtectedRoute redirectTo="/login">
              <ProfileSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/wishlist"
          element={
            <ProtectedRoute redirectTo="/login">
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/orders"
          element={
            <ProtectedRoute redirectTo="/login">
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/address"
          element={
            <ProtectedRoute redirectTo="/login">
              <Address />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/orders/:orderId"
          element={
            <ProtectedRoute redirectTo="/login">
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* ========================================= */}
        {/* ADMIN ROUTES WITH ROLE-BASED ACCESS */}
        {/* ========================================= */}

        {/* Main Admin Route - Handles all admin routes internally */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute
              roles={["admin", "sales", "finance", "sub-admin"]}
              redirectTo="/login"
            >
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* ========================================= */}
        {/* ERROR HANDLING ROUTES */}
        {/* ========================================= */}

        {/* 404 Not Found */}
        <Route path="/404" element={<NotFound />} />

        {/* Unauthorized Access */}
        <Route
          path="/unauthorized"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Access Denied
                </h1>
                <p className="text-gray-600 mb-6">
                  You don't have permission to access this page.
                </p>
                <Link
                  to="/"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Go to Homepage
                </Link>
              </div>
            </div>
          }
        />

        {/* Fallback route - catch all undefined routes */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>

      {/* Only show FloatingCart on Products and related pages (brands, categories) */}
      {shouldShowFloatingCart && <FloatingCart />}

      {/* NEW: Splash Screen - Shows on every page refresh */}
      <SplashScreen isVisible={showSplashScreen} onClose={handleCloseSplash} />
    </>
  );
}

export default App;
