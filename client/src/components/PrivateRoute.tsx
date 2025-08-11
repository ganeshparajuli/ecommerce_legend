import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { loadUser } from "../redux/actions/userActions";
import type { UserState } from "../redux/types/User";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string;
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
  const [initialCheck, setInitialCheck] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const loggedOut = localStorage.getItem("loggedOut");

      if (token && loggedOut !== "true" && !isAuthenticated && !user) {
        await dispatch(loadUser() as any);
      }
      setAuthChecked(true);
    };

    if (!authChecked) {
      checkAuth();
    }
  }, []);

  // Get auth state from Redux store
  const { isAuthenticated, user, loading } = useSelector(
    (state: RootState) => state.user
  );

  // Get token and logout status
  const token = localStorage.getItem("token");
  const justLoggedOut = localStorage.getItem("loggedOut");

  useEffect(() => {
    const performInitialAuthCheck = async () => {
      console.log("🔐 PrivateRoute: Initial auth check", {
        hasToken: !!token,
        justLoggedOut,
        isAuthenticated,
        hasUser: !!user,
      });

      // If user just logged out, don't try to load user
      if (justLoggedOut === "true") {
        console.log("🚪 User is logged out, skipping auth check");
        setInitialCheck(false);
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

      setInitialCheck(false);
    };

    performInitialAuthCheck();
  }, [token, isAuthenticated, user, dispatch, justLoggedOut]);

  // CRITICAL: Show loading during initial check OR when loading user data
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

  // CRITICAL: Check loggedOut flag first
  if (justLoggedOut === "true") {
    console.log("🚪 User is logged out, redirecting to login");
    return <Navigate to={redirectTo} replace />;
  }

  // Not authenticated and no token, redirect to login
  if (!isAuthenticated && !token) {
    console.log("🔒 Not authenticated, redirecting to login");
    return <Navigate to={redirectTo} replace />;
  }

  // If we have a token but still not authenticated after initial check, redirect
  if (token && !isAuthenticated && !initialCheck) {
    console.log(
      "🔑 Token exists but authentication failed, redirecting to login"
    );
    return <Navigate to={redirectTo} replace />;
  }

  // Check roles if specified
  if (roles && user) {
    const allowedRoles = roles.split(",").map((role) => role.trim());
    const hasRequiredRole = user.role && allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
      console.log(`👤 User role ${user.role} not in allowed roles: ${roles}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Success: User is authenticated and authorized
  console.log(
    `✅ Rendering protected route for user: ${user?.name} (${user?.role})`
  );
  return <>{children}</>;
};

export default ProtectedRoute;
