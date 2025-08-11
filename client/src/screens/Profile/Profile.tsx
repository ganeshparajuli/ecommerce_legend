import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Package, Heart, Settings, LogOut, User, ShoppingBag, Star, Award } from "lucide-react";
import type { RootState } from "../../redux/store";
import { logoutUser } from "../../redux/actions/userActions";
import api from "../../redux/api";
import { toast } from "react-hot-toast";
import {
  NavbarSection,
  Breadcrumb,
} from "../Homepage/sections/NavbarSection/NavbarSection";
import FooterSection from "../Homepage/sections/FooterSection/FooterSection";

// Profile dashboard card component
const ProfileCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  className = "",
  count = null,
  isLogout = false,
}) => (
  <div
    onClick={onClick}
    className={`group relative overflow-hidden bg-white rounded-2xl border border-gray-200 
               hover:border-${isLogout ? 'red' : 'green'}-300 hover:shadow-xl transition-all duration-300 cursor-pointer 
               transform hover:scale-[1.02] hover:-translate-y-1 ${className}`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${isLogout ? 'from-red-50/50 to-red-100/50' : 'from-green-50/50 to-green-100/50'} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    
    <div className="relative p-6 sm:p-8">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${isLogout ? 'bg-red-100 group-hover:bg-red-200' : 'bg-green-100 group-hover:bg-green-200'} rounded-xl transition-all duration-300`}>
          <Icon className={`w-6 h-6 ${isLogout ? 'text-red-600' : 'text-green-600'}`} />
        </div>
        {count !== null && (
          <div className="bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">
            {count}
          </div>
        )}
      </div>
      
      <div>
        <h3 className={`text-lg sm:text-xl font-bold text-black mb-2 group-hover:text-${isLogout ? 'red' : 'green'}-700 transition-colors duration-300`}>
          {title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${isLogout ? 'from-red-600 to-red-700' : 'from-green-600 to-green-700'} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
    </div>
  </div>
);

// Stats card component
const StatsCard = ({ icon: Icon, title, value, bgColor, iconColor, isLoading }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 ${bgColor} rounded-xl mb-4`}>
          <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />
        </div>
        <p className="text-sm sm:text-base text-gray-600 font-medium mb-1">
          {title}
        </p>
        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 h-8 sm:h-10 w-16 sm:w-20 rounded-lg" />
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  </div>
);

// Main Profile component
const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  // Get data from Redux store
  const {
    user,
    loading: userLoading,
    isAuthenticated,
  } = useSelector((state: RootState) => state.user);
  const { orders, loading: ordersLoading } = useSelector(
    (state: RootState) => state.order
  );
  const { items: wishlistItems, loading: wishlistLoading } = useSelector(
    (state: RootState) => state.wishlist
  );

  // Check authentication on component mount
  useEffect(() => {
    if (!api.checkAuth() || !isAuthenticated) {
      toast.error("Please login to view your profile");
      navigate("/login");
      return;
    }

    // If user is not loaded after a reasonable time, show error
    const timeoutId = setTimeout(() => {
      if (!user && !userLoading) {
        setError(
          "Failed to load user profile. Please try refreshing the page."
        );
      }
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [navigate, isAuthenticated, user, userLoading]);

  // Handle sign out
  const handleSignOut = () => {
    dispatch(logoutUser() as any);
    toast.success("You have been signed out successfully");
    navigate("/login");
  };

  // Get user initials
  const getUserInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <NavbarSection />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-red-500 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Refresh Page
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isInitialLoading = userLoading && !user;
  const isDataLoading = ordersLoading || wishlistLoading;

  return (
    <div className="min-h-screen bg-white">
      <NavbarSection />
      <Breadcrumb
        items={[
          { name: "Home", href: "/", current: false },
          { name: "Profile", href: "/profile", current: true },
        ]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-3xl p-6 sm:p-8 lg:p-12 mb-8 sm:mb-12 shadow-2xl">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-48 -translate-x-48 blur-3xl" />
          
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-4 ring-white/30 shadow-xl">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-green-600 font-bold text-xl sm:text-2xl lg:text-3xl">
                      {isInitialLoading ? "..." : getUserInitials(user?.name)}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
            </div>
            
            <div className="text-white text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                    Welcome Back!
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-2xl opacity-90 font-medium">
                    {isInitialLoading ? "Loading..." : user?.name || "User"}
                  </p>
                  {user?.email && (
                    <p className="text-sm sm:text-base opacity-75 mt-1">{user.email}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-sm font-medium">
                      {user?.active === 1 ? "✨ Active Member" : "⏸️ Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <StatsCard
            icon={Package}
            title="Total Orders"
            value={orders?.length || 0}
            bgColor="bg-green-100"
            iconColor="text-green-600"
            isLoading={ordersLoading}
          />
          
          <StatsCard
            icon={Heart}
            title="Wishlist Items"
            value={wishlistItems?.length || 0}
            bgColor="bg-red-100"
            iconColor="text-red-600"
            isLoading={wishlistLoading}
          />
          
          <StatsCard
            icon={Award}
            title="Member Since"
            value={user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear()}
            bgColor="bg-gray-100"
            iconColor="text-black"
            isLoading={userLoading}
          />
        </div>

        {/* Loading Indicator for Data */}
        {isDataLoading && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent" />
              <p className="text-green-800 font-medium">Loading your data...</p>
            </div>
          </div>
        )}

        {/* Profile Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
          <ProfileCard
            icon={User}
            title="Profile Settings"
            description="Manage your account details, personal information, and preferences"
            onClick={() => navigate("/profile/settings")}
          />

          <ProfileCard
            icon={Package}
            title="My Orders"
            description="Track your orders, view order history, and manage returns"
            onClick={() => navigate("/profile/orders")}
            count={orders?.length || 0}
          />

          <ProfileCard
            icon={Heart}
            title="Wishlist"
            description="View and manage your saved items and favorite products"
            onClick={() => navigate("/profile/wishlist")}
            count={wishlistItems?.length || 0}
          />

          <ProfileCard
            icon={LogOut}
            title="Sign Out"
            description="Securely sign out of your account"
            onClick={handleSignOut}
            isLogout={true}
          />
        </div>

        {/* Quick Actions Banner */}
        <div className="bg-gradient-to-r from-black to-gray-800 rounded-3xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Continue Shopping
              </h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Discover new products and add them to your collection
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 font-medium"
              >
                Browse Products
              </button>
              <button
                onClick={() => navigate("/categories")}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-300 transform hover:scale-105 font-medium backdrop-blur-sm border border-white/20"
              >
                View Categories
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <FooterSection />
    </div>
  );
};

export default Profile;