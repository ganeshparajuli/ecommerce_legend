// COMPLETE Sidebar.tsx - Replace your entire file with this
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart3,
  Tag,
  FolderOpen,
  Layers,
  Package,
  ShoppingCart,
  Smartphone,
  Ticket,
  Mail,
  Users,
  Contact,
  DollarSign,
  MessageCircleQuestion,
  Settings,
  Home,
  X,
} from "lucide-react";
import type { RootState } from "../../../redux/store";
import { getStoreSettings } from "../../../redux/actions/settingsAction";
import { StoreImage } from "../../../utils/imageHelper";

interface SidebarProps {
  isOpen: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

interface MenuItemConfig {
  path: string;
  icon: any;
  label: string;
  roles: string[];
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isMobile = false,
  onClose,
}) => {
  const location = useLocation();
  const dispatch = useDispatch();

  // Get store settings and user from Redux
  const { storeSettings } = useSelector((state: RootState) => state.settings);
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  // Load store settings on component mount
  useEffect(() => {
    dispatch(getStoreSettings());
  }, [dispatch]);

  // 🔧 FIXED: Define all menu items with proper role permissions
  const allMenuItems: MenuItemConfig[] = [
    {
      path: "/admin",
      icon: BarChart3,
      label: "Dashboard",
      roles: ["admin", "sub-admin"],
    },
    {
      path: "/admin/brands",
      icon: Tag,
      label: "Brands",
      roles: ["admin", "sub-admin", "sales"],
    },
    {
      path: "/admin/categories",
      icon: FolderOpen,
      label: "Categories",
      roles: ["admin", "sub-admin", "sales"],
    },
    {
      path: "/admin/series",
      icon: Layers,
      label: "Series",
      roles: ["admin", "sub-admin", "sales"],
    },
    {
      path: "/admin/splash",
      icon: Smartphone,
      label: "Splash",
      roles: ["admin", "sub-admin"],
    },
    {
      path: "/admin/products",
      icon: Package,
      label: "Products",
      roles: ["admin", "sub-admin", "sales"],
    },
    {
      path: "/admin/orders",
      icon: ShoppingCart,
      label: "Orders",
      roles: ["admin", "finance", "sales", "sub-admin"],
    },
    {
      path: "/admin/promocodes",
      icon: Ticket,
      label: "Promo Codes",
      roles: ["admin", "finance", "sales", "sub-admin"],
    },
    {
      path: "/admin/newsletters",
      icon: Mail,
      label: "Newsletters",
      roles: ["admin", "sub-admin", "sales"],
    },
    {
      path: "/admin/customers",
      icon: Users,
      label: "Customers",
      roles: ["admin"],
    },
    {
      path: "/admin/sales",
      icon: DollarSign,
      label: "Sales",
      roles: ["admin", "finance", "sales", "sub-admin"],
    },
    {
      path: "/admin/faqs",
      icon: MessageCircleQuestion,
      label: "FAQs",
      roles: ["admin", "sub-admin"],
    },
    {
      path: "/admin/enquiries",
      icon: Contact,
      label: "Enquiries",
      roles: ["admin", "sub-admin", "sales"],
    },
    {
      path: "/admin/settings",
      icon: Settings,
      label: "Settings",
      roles: ["admin"],
    },
  ];

  // 🔧 FIXED: Filter menu items with better debugging
  const getFilteredMenuItems = (): MenuItemConfig[] => {
    if (!user || !user.role) {
      console.log("❌ Sidebar: No user or role found");
      return [];
    }

    const userRole = user.role.toLowerCase().trim();
    console.log(`🔍 Sidebar: Filtering menu items for role: "${userRole}"`);

    const filtered = allMenuItems.filter((item) => {
      const hasAccess = item.roles.some(
        (role) => role.toLowerCase() === userRole
      );
      console.log(
        `📋 Sidebar ${item.label}: ${
          hasAccess ? "✅" : "❌"
        } (needs: ${item.roles.join(", ")})`
      );
      return hasAccess;
    });

    console.log(
      `🎯 Sidebar: Total menu items for ${userRole}: ${filtered.length}`
    );
    return filtered;
  };

  const menuItems = getFilteredMenuItems();

  const isActive = (path: string) => {
    if (path === "/admin" && location.pathname === "/admin") {
      return true;
    }
    return location.pathname.startsWith(path) && path !== "/admin";
  };

  const handleLinkClick = () => {
    // Close sidebar on mobile when navigating
    if (isMobile && onClose) {
      onClose();
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
    storeName: "Joy Admin",
    logo: "",
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out shadow-xl lg:shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center my-10 justify-between p-4 sm:p-6 border-b border-gray-200">
        <br></br>
        <br></br>
        <div className="flex items-center">
          <StoreImage
            src={displayStoreSettings.logo}
            alt="Joy Admin Logo"
            className="h-6 sm:h-8 w-auto object-contain"
          />
          <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl font-bold text-black">
            {displayStoreSettings.storeName}
          </h1>
        </div>

        {/* Close button for mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 lg:hidden focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 sm:px-6 py-4 space-y-1 overflow-y-auto">
        {/* Debug info */}
        {/* <div className="p-2 bg-gray-50 rounded-lg text-xs text-gray-600 mb-4">
          <p><strong>Debug Info:</strong></p>
          <p>User: {user?.name || 'None'}</p>
          <p>Role: {user?.role || 'None'}</p>
          <p>Items: {menuItems.length}</p>
          <p>Auth: {isAuthenticated ? 'Yes' : 'No'}</p>
        </div> */}

        {/* Show role-based message if no menu items */}
        {menuItems.length === 0 && user && (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">
              No menu items available for your role:{" "}
              <span className="font-medium capitalize">{user.role}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Check console for detailed role analysis
            </p>
          </div>
        )}

        {/* Render filtered menu items */}
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 group text-sm sm:text-base ${
                isActive(item.path)
                  ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100 hover:text-black"
              }`}
            >
              <IconComponent
                className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 transition-all duration-200 ${
                  isActive(item.path)
                    ? "text-white"
                    : "text-gray-500 group-hover:text-green-600"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 sm:p-6 border-t border-gray-200">
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center text-gray-700 hover:text-black hover:bg-gray-100 transition-all duration-200 group px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base"
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-gray-500 group-hover:text-green-600 transition-colors duration-200" />
          <span className="font-medium">Back to Store</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
