import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { loadUser } from "../redux/actions/userActions";
import type { UserState } from "../redux/types/User";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string | string[]; // Accept both string and array
  redirectTo?: string;
}

interface RootState {
  user: UserState;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
  redirectTo = "/login",
}) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  // Get auth state from Redux store
  const { isAuthenticated, user, loading } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const loggedOut = localStorage.getItem("loggedOut");

      console.log("🔐 ProtectedRoute: Initial auth check", {
        hasToken: !!token,
        loggedOut,
        isAuthenticated,
        hasUser: !!user,
        currentPath: location.pathname,
      });

      // If user just logged out, don't try to load user
      if (loggedOut === "true") {
        console.log("🚪 User is logged out, skipping auth check");
        setAuthChecked(true);
        return;
      }

      // If we have a token but no user data, load user
      if (token && !isAuthenticated && !user) {
        console.log("🔄 Token exists but no user data, loading user...");
        try {
          await dispatch(loadUser() as any);
        } catch (error) {
          console.error("❌ Failed to load user:", error);
        }
      }

      setAuthChecked(true);
    };

    if (!authChecked) {
      checkAuth();
    }
  }, [dispatch, isAuthenticated, user, authChecked, location.pathname]);

  // Show loading during initial check OR when loading user data
  if (!authChecked || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Get token and logout status
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");

  // Check loggedOut flag first
  if (justLoggedOut === "true") {
    console.log("🚪 User is logged out, redirecting to login");
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  // Not authenticated and no token, redirect to login
  if (!isAuthenticated && !token) {
    console.log("🔒 Not authenticated, redirecting to login");
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  // If we have a token but still not authenticated after check, redirect
  if (token && !isAuthenticated && authChecked) {
    console.log(
      "🔑 Token exists but authentication failed, redirecting to login"
    );
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  // Helper function to normalize roles to array
  const normalizeRoles = (roles: string | string[] | undefined): string[] => {
    if (!roles) return [];
    if (Array.isArray(roles)) return roles;
    if (typeof roles === "string")
      return roles.split(",").map((role) => role.trim());
    return [];
  };

  // Check roles if specified
  if (roles && user) {
    const allowedRoles = normalizeRoles(roles);
    const hasRequiredRole = user.role && allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
      console.log(
        `👤 User role ${user.role} not in allowed roles: ${allowedRoles.join(
          ", "
        )}`
      );
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Success: User is authenticated and authorized

  return <>{children}</>;
};

export default ProtectedRoute;
