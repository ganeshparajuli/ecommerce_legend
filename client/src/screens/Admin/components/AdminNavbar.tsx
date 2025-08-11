// FIXED AdminNavbar.tsx - Replace your entire file with this (JavaScript error fixed)
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar } from '../../../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { 
  Menu, 
  User, 
  Settings, 
  LogOut,
  Clock,
  Zap,
  BarChart3,
  Users,
  Package,
  ShoppingCart,
  Activity,
  Wifi,
  WifiOff,
  Home,
  Tag,
  FolderOpen,
  Ticket,
  Mail,
  MessageCircleQuestion,
  Contact,
  DollarSign
} from 'lucide-react';
import type { RootState } from '../../../redux/store';
import { loadUser, logoutUser } from '../../../redux/actions/userActions';
import { getStoreSettings } from '../../../redux/actions/settingsAction';
import { StoreImage } from '../../../utils/imageHelper';

interface AdminNavbarProps {
  toggleSidebar: () => void;
}

interface QuickActionConfig {
  icon: any;
  label: string;
  path: string;
  color: string;
  roles: string[];
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIXED: Properly extract isAuthenticated from Redux state
  const { user, loading, error, isAuthenticated } = useSelector((state: RootState) => state.user);
  const { storeSettings } = useSelector((state: RootState) => state.settings);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // ✅ FIXED: Debug logging with proper variable access
  // useEffect(() => {
  //   console.log("🔍 =========================");
  //   console.log("🔍 ADMIN NAVBAR DEBUG INFO");
  //   console.log("🔍 =========================");
  //   console.log("User object:", user);
  //   console.log("User role:", user?.role);
  //   console.log("User role type:", typeof user?.role);
  //   console.log("Is authenticated:", isAuthenticated);
  //   console.log("Loading state:", loading);
  //   console.log("Current path:", location.pathname);
  //   console.log("🔍 =========================");
  // }, [user, loading, location.pathname, isAuthenticated]);

  // Load store settings on component mount
  useEffect(() => {
    dispatch(getStoreSettings());
  }, [dispatch]);

  // Function to get initials from name
  const getInitials = (name: string) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get page title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    const pathMap: { [key: string]: string } = {
      '/admin': 'Dashboard',
      '/admin/dashboard': 'Dashboard',
      '/admin/brands': 'Brand Management',
      '/admin/categories': 'Category Management', 
      '/admin/products': 'Product Management',
      '/admin/orders': 'Order Management',
      '/admin/promocodes': 'Promo Code Management',
      '/admin/newsletters': 'Newsletter Management',
      '/admin/customers': 'Customer Management',
      '/admin/sales': 'Sales Management',
      '/admin/faqs': 'FAQ Management',
      '/admin/enquiries': 'Enquiry Management',
      '/admin/settings': 'Settings',
      '/admin/profile': 'Profile Management'
    };
    
    return pathMap[path] || 'Joy Admin Panel';
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  // All quick actions with proper role permissions
  const allQuickActions: QuickActionConfig[] = [
    { 
      icon: BarChart3, 
      label: 'Dashboard', 
      path: '/admin',
      color: 'text-green-600',
      roles: ['admin', 'sub-admin']
    },
    { 
      icon: Package, 
      label: 'Products', 
      path: '/admin/products',
      color: 'text-blue-600',
      roles: ['admin', 'sub-admin', 'sales']
    },
    { 
      icon: ShoppingCart, 
      label: 'Orders', 
      path: '/admin/orders',
      color: 'text-orange-600',
      roles: ['admin', 'finance', 'sales', 'sub-admin']
    },
    { 
      icon: Users, 
      label: 'Customers', 
      path: '/admin/customers',
      color: 'text-purple-600',
      roles: ['admin']
    },
    { 
      icon: DollarSign, 
      label: 'Sales', 
      path: '/admin/sales',
      color: 'text-purple-600',
      roles: ['admin', 'finance', 'sales', 'sub-admin']
    },
    { 
      icon: Tag, 
      label: 'Brands', 
      path: '/admin/brands',
      color: 'text-pink-600',
      roles: ['admin', 'sub-admin', 'sales']
    },
    { 
      icon: FolderOpen, 
      label: 'Categories', 
      path: '/admin/categories',
      color: 'text-indigo-600',
      roles: ['admin', 'sub-admin', 'sales']
    },
    { 
      icon: Ticket, 
      label: 'Promo Codes', 
      path: '/admin/promocodes',
      color: 'text-red-600',
      roles: ['admin', 'finance', 'sales', 'sub-admin']
    },
    { 
      icon: Mail, 
      label: 'Newsletters', 
      path: '/admin/newsletters',
      color: 'text-cyan-600',
      roles: ['admin', 'sub-admin', 'sales']
    },
    { 
      icon: MessageCircleQuestion, 
      label: 'FAQs', 
      path: '/admin/faqs',
      color: 'text-yellow-600',
      roles: ['admin', 'sub-admin']
    },
    { 
      icon: Contact, 
      label: 'Enquiries', 
      path: '/admin/enquiries',
      color: 'text-teal-600',
      roles: ['admin', 'sub-admin', 'sales']
    }
  ];

  // Filter quick actions with better debugging
  const getFilteredQuickActions = (): QuickActionConfig[] => {
    if (!user || !user.role) {
      console.log("❌ No user or role found for quick actions");
      return [];
    }

    const userRole = user.role.toLowerCase().trim();
    console.log(`🔍 Filtering quick actions for role: "${userRole}"`);
    
    const filtered = allQuickActions.filter(action => {
      const hasAccess = action.roles.some(role => role.toLowerCase() === userRole);
      console.log(`📋 ${action.label}: ${hasAccess ? '✅' : '❌'} (needs: ${action.roles.join(', ')})`);
      return hasAccess;
    });
    
    console.log(`🎯 Total quick actions for ${userRole}: ${filtered.length}`);
    return filtered;
  };

  // Always show for admin staff roles
  const shouldShowQuickActions = (): boolean => {
    if (!user?.role) {
      console.log("❌ No user role for quick actions");
      return false;
    }
    
    const userRole = user.role.toLowerCase().trim();
    const adminRoles = ['admin', 'sub-admin', 'sales', 'finance'];
    const shouldShow = adminRoles.includes(userRole);
    
    console.log(`🎮 Should show Quick Actions for "${userRole}": ${shouldShow}`);
    return shouldShow;
  };

  const quickActions = getFilteredQuickActions();

  // Group filtered actions for display
  const getCoreManagementActions = () => quickActions.filter(action => 
    ['Dashboard', 'Products', 'Orders', 'Customers'].includes(action.label)
  );

  const getCatalogActions = () => quickActions.filter(action => 
    ['Brands', 'Categories'].includes(action.label)
  );

  const getMarketingSupportActions = () => quickActions.filter(action => 
    ['Promo Codes', 'Newsletters', 'FAQs', 'Enquiries'].includes(action.label)
  );

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch admin profile data using Redux
  useEffect(() => {
    if ((!user || !user.id) && localStorage.getItem("loggedOut") !== "true") {
      dispatch(loadUser());
    }
  }, [dispatch, user]);

  // Handle logout using Redux and React Router navigation
  const handleLogout = async () => {
    try {
      const response = await dispatch(logoutUser());
      if (response.success) {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Normalize store settings
  const normalizeStoreSettings = (settings: any) => {
    if (!settings) return null;
    
    return {
      storeName: settings.storeName || settings.store_name,
      logo: settings.logo,
    };
  };

  const displayStoreSettings = normalizeStoreSettings(storeSettings) || {
    storeName: 'Joy Admin',
    logo: '',
  };

  return (
    <header className="bg-white shadow-xl border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Left side - Toggle button, logo and title */}
        <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
          </button>
          
          {/* Logo and Brand */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <StoreImage
              src={displayStoreSettings.logo}
              alt="Joy Admin Logo"
              className="h-6 sm:h-8 w-auto object-contain"
            />
            <div className="flex flex-col min-w-0">
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-black truncate">
                  {getPageTitle()}
                </h1>
                <div className="hidden sm:flex items-center space-x-1">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
              </div>
              
              {user && (
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {getGreeting()}, {user.name?.split(' ')[0] || 'Admin'}!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Center - Time and Date (Hidden on mobile) */}
        <div className="hidden lg:flex items-center space-x-4 px-4">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2 rounded-xl border border-gray-200">
            <Clock className="w-4 h-4 text-green-600" />
            <div className="text-center">
              <div className="text-sm font-bold text-black">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-gray-600">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Quick actions and profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* ✅ FIXED: Quick Actions - Should now render without errors */}
          {shouldShowQuickActions() && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-3 py-2 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-lg">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Quick Actions</span>
                  <span className="sm:hidden text-sm font-medium">Actions</span>
                </button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-xl rounded-xl max-h-96 overflow-y-auto">
                <DropdownMenuLabel>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-black">Quick Actions</span>
                    <span className="text-xs text-gray-500 capitalize">({user?.role} - {quickActions.length})</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                
                {/* Debug info if no actions */}
                {quickActions.length === 0 && (
                  <div className="px-4 py-3 text-center">
                    <p className="text-sm text-red-500 font-medium">⚠️ No Quick Actions Found</p>
                    <p className="text-xs text-gray-500 mt-1">Role: {user?.role}</p>
                    <p className="text-xs text-gray-400">Check console for debug info</p>
                  </div>
                )}
                
                {/* Show all available actions */}
                {quickActions.map((action, index) => (
                  <DropdownMenuItem 
                    key={index}
                    onClick={() => {
                      console.log(`🚀 Navigating to: ${action.path}`);
                      navigate(action.path);
                    }}
                    className="hover:bg-gray-50 cursor-pointer transition-all duration-200 rounded-lg mx-2 mb-1"
                  >
                    <action.icon className={`w-4 h-4 mr-3 ${action.color}`} />
                    <span className="text-gray-700 font-medium">{action.label}</span>
                  </DropdownMenuItem>
                ))}
                
                {quickActions.length > 0 && <DropdownMenuSeparator className="bg-gray-200" />}
                
                {/* Settings - Admin only */}
                {user?.role && ['admin'].includes(user.role.toLowerCase()) && (
                  <DropdownMenuItem 
                    onClick={() => navigate('/admin/settings')}
                    className="hover:bg-gray-50 cursor-pointer transition-all duration-200"
                  >
                    <Settings className="w-4 h-4 mr-3 text-gray-600" />
                    <span className="text-gray-700 font-medium">Settings</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  onClick={() => navigate('/')}
                  className="hover:bg-gray-50 cursor-pointer transition-all duration-200"
                >
                  <Home className="w-4 h-4 mr-3 text-green-600" />
                  <span className="text-gray-700 font-medium">Back to Store</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile Time Display */}
          <div className="lg:hidden bg-gradient-to-r from-gray-50 to-gray-100 px-2 py-1 rounded-lg border border-gray-200">
            <div className="text-xs font-bold text-black">
              {formatTime(currentTime)}
            </div>
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none" asChild>
              <button className="flex items-center space-x-2 sm:space-x-3 hover:bg-gray-100 rounded-xl p-1 sm:p-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                  {user?.profileImage || user?.avatar ? (
                    <StoreImage
                      src={user.profileImage || user.avatar}
                      alt={user.name || 'User Profile'}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white w-full h-full flex items-center justify-center rounded-full text-sm sm:text-base font-bold shadow-lg">
                      {loading ? '...' : user ? getInitials(user.name) : 'A'}
                    </div>
                  )}
                </Avatar>
                
                {!loading && user && (
                  <div className="hidden xl:block text-left">
                    <div className="text-sm font-bold text-black truncate max-w-[120px]">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-600 capitalize flex items-center space-x-1">
                      <span>{user.role}</span>
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-64 bg-white border border-gray-200 shadow-xl rounded-xl">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      {user?.profileImage || user?.avatar ? (
                        <StoreImage
                          src={user.profileImage || user.avatar}
                          alt={user.name || 'User Profile'}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white w-full h-full flex items-center justify-center rounded-full text-lg font-bold shadow-lg">
                          {loading ? '...' : user ? getInitials(user.name) : 'A'}
                        </div>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-none text-black truncate">
                        {loading ? 'Loading...' : user?.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-gray-600 mt-1 truncate">
                        {user?.email || ''}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-xs text-gray-500 capitalize font-medium">{user?.role}</span>
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs text-gray-500">
                          {isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="bg-gray-200" />
              
              <DropdownMenuItem 
                onClick={() => navigate('/admin/profile')}
                className="hover:bg-gray-50 cursor-pointer text-gray-700 transition-all duration-200"
              >
                <User className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-medium">My Profile</span>
              </DropdownMenuItem>
              
              {/* Settings - Admin only */}
              {user?.role && ['admin'].includes(user.role.toLowerCase()) && (
                <DropdownMenuItem 
                  onClick={() => navigate('/admin/settings')}
                  className="hover:bg-gray-50 cursor-pointer text-gray-700 transition-all duration-200"
                >
                  <Settings className="w-4 h-4 mr-2 text-green-600" />
                  <span className="font-medium">Settings</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator className="bg-gray-200" />
              
              <DropdownMenuItem 
                onClick={() => navigate('/')}
                className="hover:bg-gray-50 cursor-pointer text-gray-700 transition-all duration-200"
              >
                <Home className="w-4 h-4 mr-2 text-green-600" />
                <span className="font-medium">Back to Store</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-gray-200" />
              
              <DropdownMenuItem 
                className="text-red-600 hover:bg-red-50 cursor-pointer transition-all duration-200"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="sm:hidden border-t border-gray-200 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className="w-3 h-3 text-green-600" />
              ) : (
                <WifiOff className="w-3 h-3 text-red-500" />
              )}
              <span className="text-gray-700 font-medium">
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Activity className="w-3 h-3 text-green-600" />
              <span className="text-gray-700 font-medium">System Active</span>
            </div>
          </div>
          <div className="text-gray-700 font-medium">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;