// Updated Admin.tsx with Role-Based Route Protection - COMPLETE FILE
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import AdminLayout from "./components/AdminLayout";
import RoleBasedRoute from "./components/RoleBasedRoute";

// Import admin pages
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Brands from "./pages/Brands";
import Categories from "./pages/Categories";
import Series from "./pages/Series";
import Newsletters from "./pages/Newsletter";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Enquiry from "./pages/Enquiry";
import Faqs from "./pages/faqs";
import Settings from "./pages/Settings";
import PromoCodes from "./pages/PromoCodes";
import Sales from "./pages/Sales";
import SplashScreens from "./pages/Splash";

// Auth check component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.user
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const Admin: React.FC = () => {
  return (
    <Routes>
      {/* ✅ FIXED: Dashboard - Admin + Sub-Admin */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin", "sub-admin"]}>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Brands - Admin + Sub-Admin + Sales */}
      <Route
        path="/brands"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin", "sub-admin", "sales"]}>
              <AdminLayout>
                <Brands />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Categories - Admin + Sub-Admin + Sales */}
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin", "sub-admin", "sales"]}>
              <AdminLayout>
                <Categories />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      {/* Series - Admin + Sub-Admin + Sales */}
      <Route
        path="/series"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin", "sub-admin", "sales"]}>
              <AdminLayout>
                <Series />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/splash"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin", "sub-admin"]}>
              <AdminLayout>
                <SplashScreens />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Products - Admin + Sub-Admin + Sales */}
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin", "sub-admin", "sales"]}>
              <AdminLayout>
                <Products />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Newsletters - Admin + Sub-Admin + Sales */}
      <Route
        path="/newsletters"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin", "sub-admin", "sales"]}>
              <AdminLayout>
                <Newsletters />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Orders - Admin + Finance + Sales + Sub-Admin */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <RoleBasedRoute
              allowedRoles={["admin", "finance", "sales", "sub-admin"]}
            >
              <AdminLayout>
                <Orders />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Promo Codes - Admin + Finance + Sales + Sub-Admin */}
      <Route
        path="/promocodes"
        element={
          <ProtectedRoute>
            <RoleBasedRoute
              allowedRoles={["admin", "finance", "sales", "sub-admin"]}
            >
              <AdminLayout>
                <PromoCodes />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Customers - Admin only */}
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Customers />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Sales page - Available to Sales, Sub-Admin, Admin */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <RoleBasedRoute
              allowedRoles={["admin", "sub-admin", "finance", "sales"]}
            >
              <AdminLayout>
                <Sales />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: FAQs - Admin + Sub-Admin */}
      <Route
        path="/faqs"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin", "sub-admin"]}>
              <AdminLayout>
                <Faqs />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Enquiries - Admin + Sub-Admin + Sales (removed duplicate) */}
      <Route
        path="/enquiries"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin", "sub-admin", "sales"]}>
              <AdminLayout>
                <Enquiry />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* ✅ FIXED: Settings - Admin only */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <RoleBasedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </RoleBasedRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback route - Redirect based on user role */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
};

// ✅ FIXED: Component to handle role-based redirects
const RoleRedirect: React.FC = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.role?.toLowerCase();

  // Redirect based on user role to their first accessible page
  switch (userRole) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "sub-admin":
      return <Navigate to="/admin" replace />; // ✅ Sub-admin goes to dashboard
    case "finance":
      return <Navigate to="/admin/orders" replace />;
    case "sales":
      return <Navigate to="/admin/orders" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default Admin;
