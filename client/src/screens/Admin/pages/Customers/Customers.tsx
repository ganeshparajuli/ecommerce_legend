import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Avatar } from "../../../../components/ui/avatar";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import { getAllUsers, updateUser, logoutUser } from "../../../../redux/actions/userActions";
import { myOrders, getAllOrders } from "../../../../redux/actions/orderAction";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../../../redux/store";
import {
  Users,
  Search,
  Eye,
  UserCheck,
  UserX,
  ChevronDown,
  Filter,
  DollarSign,
  ShoppingBag,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Activity,
  Loader2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Download,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";

// Add User type extension to include created_at
type User = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  active?: number;
  role?: string;
  image?: string;
  created_at?: string;
  [key: string]: any;
};

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  totalOrders: number;
  totalSpent: number;
  status: "Active" | "Inactive";
  role?: string;
  avatar?: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount?: number;
  totalPrice?: number;
  status?: string;
  created_at: string;
  updated_at?: string;
  orderItems?: Array<any>;
  [key: string]: any;
}

// GLOBAL TRACKING: Use sessionStorage to persist across component remounts
const FETCH_KEY = "customers_data_fetched";
const COMPONENT_MOUNT_KEY = "customers_component_mounts";

// Available roles for role management
const AVAILABLE_ROLES = ['admin', 'user', 'sub-admin', 'sales', 'finance'];

// Helper function to extract user ID from JWT token
const extractUserIdFromToken = (token: string | null): string | null => {
  if (!token) return null;
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    return payload.id || payload.userId || payload.sub || null;
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

const Customers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [sessionRefreshRequired, setSessionRefreshRequired] = useState(false);

  // DEBUGGING: Track component mounts
  const mountId = useRef(Math.random().toString(36).substr(2, 9));
  const renderCount = useRef(0);
  renderCount.current++;

  // Get users from Redux store
  const {
    users,
    loading,
    error: reduxError,
  } = useSelector((state: RootState) => state.user);

  // Get orders from Redux store
  const { orders: allOrders, loading: ordersLoading } = useSelector(
    (state: RootState) => state.order
  );

  // BULLETPROOF FIX: Use sessionStorage + timestamp to prevent duplicate fetches
  useEffect(() => {
    const now = Date.now();
    const lastFetch = sessionStorage.getItem(FETCH_KEY);
    const timeSinceLastFetch = lastFetch ? now - parseInt(lastFetch) : Infinity;

    // Track component mounts for debugging
    const mountCount =
      parseInt(sessionStorage.getItem(COMPONENT_MOUNT_KEY) || "0") + 1;
    sessionStorage.setItem(COMPONENT_MOUNT_KEY, mountCount.toString());

    console.log(
      `🔍 Customers component mount #${mountCount} (ID: ${mountId.current}, Render: ${renderCount.current})`
    );
    console.log(`🔍 Last fetch was ${timeSinceLastFetch}ms ago`);

    // Only fetch if:
    // 1. Never fetched before, OR
    // 2. Last fetch was more than 5 seconds ago (prevents rapid refetches)
    if (!lastFetch || timeSinceLastFetch > 5000) {
      console.log("🔄 Initial data fetch... (Mount #" + mountCount + ")");

      // Mark as fetched BEFORE dispatching to prevent race conditions
      sessionStorage.setItem(FETCH_KEY, now.toString());

      // Dispatch both actions
      dispatch(getAllUsers());
      dispatch(getAllOrders());
    } else {
      console.log("⏭️ Skipping fetch - too recent (Mount #" + mountCount + ")");
    }
  }, []); // EMPTY dependency array

  // Track when initial load is complete
  useEffect(() => {
    if (!loading && !ordersLoading && users && users.length > 0) {
      console.log("✅ Initial data load complete");
    }
  }, [loading, ordersLoading, users]);

  // DEBUGGING: Log when users change
  useEffect(() => {
    console.log(
      `🔍 Users state changed: ${users?.length || 0} users, loading: ${loading}`
    );
  }, [users, loading]);

  // FIXED: Memoize the order metrics calculation with better error handling
  const getCustomerOrderMetrics = useCallback(
    (userId: string) => {
      try {
        if (!allOrders || !Array.isArray(allOrders)) {
          console.log(`📊 No orders data available for user ${userId}`);
          return { totalOrders: 0, totalSpent: 0, orders: [] };
        }

        const userOrders = allOrders.filter((order) => {
          // Ensure order has required properties
          return order && order.user_id === userId;
        });

        console.log(`📊 Found ${userOrders.length} orders for user ${userId}`);

        // Calculate total spent with better error handling
        const totalSpent = userOrders.reduce((sum, order) => {
          try {
            const orderTotal = Number(
              order.total_amount || order.totalPrice || 0
            );
            return sum + (isNaN(orderTotal) ? 0 : orderTotal);
          } catch (error) {
            console.warn(
              `⚠️ Error processing order total for order ${order.id}:`,
              error
            );
            return sum;
          }
        }, 0);

        return {
          totalOrders: userOrders.length,
          totalSpent,
          orders: userOrders,
        };
      } catch (error) {
        console.error(
          `❌ Error in getCustomerOrderMetrics for user ${userId}:`,
          error
        );
        return { totalOrders: 0, totalSpent: 0, orders: [] };
      }
    },
    [allOrders]
  );

  // FIXED: Memoize customers calculation to prevent unnecessary recalculations
  const customers = useMemo((): Customer[] => {
    if (!users || !Array.isArray(users)) return [];

    return users.map((user) => {
      try {
        // Get order metrics for this user
        const { totalOrders, totalSpent } = getCustomerOrderMetrics(user.id);

        return {
          id: user.id,
          name: user.name || "Unknown",
          email: user.email || "No email",
          phone: user.phone || "N/A",
          joinedDate: user.created_at
            ? new Date(user.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
              })
            : "N/A",
          totalOrders,
          totalSpent,
          status: user.active === 1 ? "Active" : "Inactive",
          role: user.role || "User",
          avatar: user.image || undefined,
        };
      } catch (error) {
        console.error(`❌ Error processing user ${user.id}:`, error);
        return {
          id: user.id,
          name: user.name || "Unknown",
          email: user.email || "No email",
          phone: user.phone || "N/A",
          joinedDate: "N/A",
          totalOrders: 0,
          totalSpent: 0,
          status: "Inactive",
          role: "User",
          avatar: undefined,
        };
      }
    });
  }, [users, getCustomerOrderMetrics]);

  // FIXED: Memoize filtered customers to prevent unnecessary recalculations
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.id &&
          customer.id.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === "" || customer.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, statusFilter]);

  // FIXED: Memoize overall metrics calculation
  const { totalCustomers, activeCustomers, totalRevenue } = useMemo(() => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(
      (c) => c.status === "Active"
    ).length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
    };
  }, [customers]);

  // ENHANCED: fetchCustomerOrders with better error handling
  const fetchCustomerOrders = useCallback(
    async (userId: string) => {
      console.log(`🔄 Fetching orders for customer ${userId}`);
      setIsLoadingOrders(true);
      setLocalError(null); // Clear any previous errors

      try {
        // First, try to get orders from the myOrders action
        console.log(`📡 Dispatching myOrders for user ${userId}`);
        const result = await dispatch(myOrders(userId));
        console.log(`📡 myOrders result:`, result);

        // Get the customer's orders from all orders (fallback)
        const { orders } = getCustomerOrderMetrics(userId);
        console.log(`📊 Customer orders from metrics:`, orders);

        // Validate and sanitize order data
        const validOrders = orders.filter((order) => {
          if (!order || !order.id) {
            console.warn(`⚠️ Invalid order found for user ${userId}:`, order);
            return false;
          }
          return true;
        });

        console.log(
          `✅ Setting ${validOrders.length} valid orders for customer ${userId}`
        );
        setCustomerOrders(validOrders);
      } catch (error) {
        console.error(
          `❌ Error fetching customer orders for ${userId}:`,
          error
        );
        setLocalError(
          `Failed to fetch customer orders: ${error.message || "Unknown error"}`
        );
        setCustomerOrders([]); // Set empty array on error
      } finally {
        setIsLoadingOrders(false);
      }
    },
    [dispatch, getCustomerOrderMetrics]
  );

  // View customer details and fetch their orders
  const viewCustomerDetails = useCallback(
    (customer: Customer) => {
      console.log(`👁️ Viewing details for customer:`, customer);
      setSelectedCustomer(customer);
      setShowCustomerDetails(true);
      fetchCustomerOrders(customer.id);
    },
    [fetchCustomerOrders]
  );

  // CSV Export Function
  const exportToCSV = useCallback(() => {
    setIsExporting(true);

    try {
      // Prepare CSV headers
      const headers = [
        "Customer ID",
        "Name",
        "Email",
        "Phone",
        "Role",
        "Joined Date",
        "Status",
        "Total Orders",
        "Total Spent (Rs.)",
        "Average Order Value (Rs.)",
      ];

      // Prepare CSV data
      const csvData = filteredCustomers.map((customer) => {
        const avgOrderValue =
          customer.totalOrders > 0
            ? (customer.totalSpent / customer.totalOrders).toFixed(2)
            : "0.00";

        return [
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          customer.role || "User",
          customer.joinedDate,
          customer.status,
          customer.totalOrders,
          customer.totalSpent.toFixed(2),
          avgOrderValue,
        ];
      });

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...csvData.map((row) =>
          row
            .map((field) =>
              // Escape fields that contain commas or quotes
              typeof field === "string" &&
              (field.includes(",") || field.includes('"'))
                ? `"${field.replace(/"/g, '""')}"`
                : field
            )
            .join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `customers_export_${new Date().toISOString().split("T")[0]}_${new Date()
          .toTimeString()
          .split(" ")[0]
          .replace(/:/g, "-")}.csv`
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message briefly
      setLocalError(null);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      setLocalError("Failed to export CSV file");
    } finally {
      setIsExporting(false);
    }
  }, [filteredCustomers]);

  // ENHANCED: Format order date with error handling
  const formatOrderDate = useCallback((dateString: string) => {
    try {
      if (!dateString) return "N/A";

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn(`⚠️ Invalid date string: ${dateString}`);
        return "Invalid date";
      }

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
    } catch (error) {
      console.error(`❌ Error formatting date ${dateString}:`, error);
      return "Invalid date";
    }
  }, []);

  // Get status class for orders
  const getOrderStatusClass = useCallback((status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getStatusClass = useCallback((status: string) => {
    return status === "Active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  }, []);

  const getInitials = useCallback((name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, []);

  // Get role color classes
  const getRoleClass = useCallback((role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return "bg-red-100 text-red-800 border-red-200";
      case 'sub-admin':
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 'sales':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'finance':
        return "bg-green-100 text-green-800 border-green-200";
      case 'user':
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  // ENHANCED: Update customer role function with session refresh handling
  const updateCustomerRole = useCallback(
    async (customerId: string, newRole: string) => {
      try {
        setIsUpdatingRole(true);
        setLocalError(null);

        console.log(`🔄 Updating role for customer ${customerId} to ${newRole}`);

        const token = localStorage.getItem("token");
        if (!token) {
          setLocalError("Authentication token not found");
          return;
        }

        // Check if we're updating the current user's role
        const currentUserId = extractUserIdFromToken(token);
        const isUpdatingCurrentUser = customerId === currentUserId;

        if (isUpdatingCurrentUser) {
          console.log("⚠️ Warning: Updating current user's role - will require session refresh");
        }

        const updateData = { role: newRole };
        const result = await dispatch(updateUser(customerId, updateData));

        if (result.success) {
          console.log(`✅ Role updated successfully for customer ${customerId}`);
          
          // Update the selected customer's role in the dialog
          if (selectedCustomer && selectedCustomer.id === customerId) {
            setSelectedCustomer({
              ...selectedCustomer,
              role: newRole
            });
          }

          // If updating current user, set session refresh flag and show warning
          if (isUpdatingCurrentUser) {
            setSessionRefreshRequired(true);
            setLocalError("Role updated successfully! Please log out and log back in for changes to take effect.");
          } else {
            // Refresh the user list for other users
            dispatch(getAllUsers());
          }
        } else {
          throw new Error(result.error || "Failed to update role");
        }
      } catch (error) {
        console.error("❌ Error updating customer role:", error);
        setLocalError(`Failed to update customer role: ${error.message || "Unknown error"}`);
      } finally {
        setIsUpdatingRole(false);
      }
    },
    [dispatch, selectedCustomer]
  );

  // Handle session refresh (logout current user)
  const handleSessionRefresh = useCallback(async () => {
    try {
      console.log("🔄 Refreshing session...");
      await dispatch(logoutUser());
      
      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("❌ Error during session refresh:", error);
      // Force redirect anyway
      window.location.href = "/login";
    }
  }, [dispatch]);

  // FIXED: Properly close the toggleCustomerStatus function
  const toggleCustomerStatus = useCallback(
    async (customerId: string) => {
      try {
        const customer = customers.find((c) => c.id === customerId);
        if (!customer) return;

        const newStatus = customer.status === "Active" ? "Inactive" : "Active";

        // Get token from localStorage
        const token = localStorage.getItem("token");
        if (!token) {
          setLocalError("Authentication token not found");
          return;
        }

        // Fix: Pass an object with the 'active' field instead of just the status string
        // Convert status to the numeric value expected by the backend
        const updateData = {
          active: newStatus === "Active" ? 1 : 0, // Convert to 1/0 for database
        };

        // Update in backend - send active as 1 or 0
        const result = await dispatch(updateUser(customerId, updateData));

        // Refresh the user list
        dispatch(getAllUsers());
      } catch (error) {
        console.error("Error updating customer status:", error);
        setLocalError("Failed to update customer status");
      }
    },
    [customers, dispatch]
  );

  // ENHANCED: Render the customer orders table with robust error handling
  const renderCustomerOrdersTable = useCallback(() => {
    if (isLoadingOrders) {
      return (
        <div className="px-4 py-8 text-center text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="font-medium">Loading order history...</p>
        </div>
      );
    }

    if (!customerOrders || customerOrders.length === 0) {
      return (
        <div className="px-6 py-12 text-center">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-700 mb-2">
            No Orders Yet
          </h4>
          <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
            This customer hasn't placed any orders yet. Once they make their
            first purchase, their order history will appear here.
          </p>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md mx-auto">
            <p className="text-sm text-blue-700 font-medium">
              💡 Tip: Encourage first-time purchases with welcome discounts or
              personalized recommendations!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="grid grid-cols-4 gap-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Order ID
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              Date
            </div>
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-2 text-gray-500" />
              Status
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-gray-500" />
              Total
            </div>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {customerOrders.map((order, index) => {
            try {
              // Safely extract order data with fallbacks
              const orderId = order.id || "N/A";
              const orderDate = order.created_at || "";
              const orderStatus = order.status || "Processing";
              const orderTotal = Number(
                order.total_amount || order.totalPrice || 0
              );

              return (
                <div
                  key={`order-${orderId}-${index}`} // Use composite key for safety
                  className={`px-6 py-4 border-b last:border-0 grid grid-cols-4 gap-4 text-sm transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="font-mono text-blue-600 font-bold bg-blue-100 px-3 py-1 rounded-lg">
                      #{String(orderId).slice(-8)}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700 font-medium">
                    {formatOrderDate(orderDate)}
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${getOrderStatusClass(
                        orderStatus
                      )}`}
                    >
                      {orderStatus}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-bold text-lg text-gray-900">
                      Rs. {isNaN(orderTotal) ? "0.00" : orderTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            } catch (error) {
              console.error(
                `❌ Error rendering order at index ${index}:`,
                error,
                order
              );
              return (
                <div
                  key={`error-order-${index}`}
                  className="px-6 py-4 border-b last:border-0 grid grid-cols-4 gap-4 text-sm bg-red-50"
                >
                  <div className="col-span-4 text-center text-red-600">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Error displaying order data
                  </div>
                </div>
              );
            }
          })}
        </div>
        <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-white border-t">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">
              Total Orders:{" "}
              <span className="font-bold text-gray-900">
                {customerOrders.length}
              </span>
            </span>
            <span className="text-gray-600 font-medium">
              Total Value:{" "}
              <span className="font-bold text-green-600">
                Rs.{" "}
                {customerOrders
                  .reduce((sum, order) => {
                    const total = Number(
                      order.total_amount || order.totalPrice || 0
                    );
                    return sum + (isNaN(total) ? 0 : total);
                  }, 0)
                  .toFixed(2)}
              </span>
            </span>
          </div>
        </div>
      </div>
    );
  }, [isLoadingOrders, customerOrders, formatOrderDate, getOrderStatusClass]);

  // Display error message from Redux or local error
  const errorMessage =
    localError || (typeof reduxError === "string" ? reduxError : null);

  // IMPROVED Loading state - only show spinner on very first load
  if (loading && (!users || users.length === 0)) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">
              Loading Customers...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Debug Info - Development Only */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs">
          Mount: {mountId.current} | Renders: {renderCount.current} | Users:{" "}
          {users?.length || 0} | Orders: {allOrders?.length || 0}
        </div>
      )}

      {/* Session Refresh Warning */}
      {sessionRefreshRequired && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
          <RefreshCw className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800">Session Refresh Required</h3>
            <p className="text-amber-700 mb-3">
              Your role has been updated successfully! To access new permissions, please refresh your session.
            </p>
            <button
              onClick={handleSessionRefresh}
              className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Session Now
            </button>
          </div>
          <button
            onClick={() => setSessionRefreshRequired(false)}
            className="text-amber-400 hover:text-amber-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customer Management
            </h1>
            <p className="text-gray-600">
              Manage your customer database and relationships
            </p>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToCSV}
            disabled={isExporting || filteredCustomers.length === 0}
            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </>
            )}
          </button>

          <div className="text-right">
            <p className="text-sm text-gray-500">
              {filteredCustomers.length} customers ready to export
            </p>
            <p className="text-xs text-gray-400">
              Includes customer details & order metrics
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errorMessage && !sessionRefreshRequired && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => setLocalError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Search className="w-4 h-4 mr-2" />
                Search Customers
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, email or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Filter className="w-4 h-4 mr-2" />
                Status Filter
              </label>
              <div className="relative">
                <select
                  className="w-full appearance-none h-12 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-1">
                  Total Customers
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {totalCustomers}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 mb-1">
                  Active Customers
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {activeCustomers}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 mb-1">
                  Total Revenue
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  Rs. {totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customers Table */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="border-b border-gray-200 p-6">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center text-xl font-bold text-gray-900">
              <Users className="w-5 h-5 mr-2" />
              Customers ({filteredCustomers.length})
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export ready data</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-500">
                        {searchTerm || statusFilter
                          ? "No customers match your filters"
                          : "No customers found"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Avatar className="h-12 w-12 mr-4 ring-2 ring-gray-100">
                            {customer.avatar ? (
                              <img
                                src={customer.avatar}
                                alt={customer.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-full h-full flex items-center justify-center font-semibold">
                                {getInitials(customer.name)}
                              </div>
                            )}
                          </Avatar>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {customer.name}
                            </div>
                            <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded mt-1">
                              {customer.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-700">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm text-gray-700">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {customer.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleClass(customer.role || 'user')}`}>
                          {customer.role?.charAt(0).toUpperCase() + customer.role?.slice(1) || "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {customer.joinedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm font-semibold text-gray-900">
                          <ShoppingBag className="w-4 h-4 mr-2 text-gray-400" />
                          {customer.totalOrders}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm font-bold text-green-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Rs. {customer.totalSpent.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                            customer.status
                          )}`}
                        >
                          {customer.status === "Active" ? (
                            <Activity className="w-3 h-3 mr-1" />
                          ) : (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => viewCustomerDetails(customer)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <button
                            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                              customer.status === "Active"
                                ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                                : "text-green-600 hover:text-green-800 hover:bg-green-50"
                            }`}
                            onClick={() => toggleCustomerStatus(customer.id)}
                          >
                            {customer.status === "Active" ? (
                              <>
                                <UserX className="w-4 h-4 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Activate
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">1</span> to{" "}
              <span className="font-semibold">{filteredCustomers.length}</span>{" "}
              of <span className="font-semibold">{customers.length}</span>{" "}
              customers
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                disabled
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              <button className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg text-sm font-semibold">
                1
              </button>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Customer Details Dialog */}
      {selectedCustomer && (
        <Dialog
          open={showCustomerDetails}
          onOpenChange={setShowCustomerDetails}
        >
          <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
            <DialogHeader className="border-b border-gray-200 pb-6 bg-white -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center text-xl font-bold text-gray-900">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  Customer Details
                </div>
                <button
                  onClick={() => setShowCustomerDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8 pt-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              {/* Enhanced Customer Header */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
                      {selectedCustomer.avatar ? (
                        <img
                          src={selectedCustomer.avatar}
                          alt={selectedCustomer.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-full h-full flex items-center justify-center text-2xl font-bold">
                          {getInitials(selectedCustomer.name)}
                        </div>
                      )}
                    </Avatar>
                    <div
                      className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center ${
                        selectedCustomer.status === "Active"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    >
                      {selectedCustomer.status === "Active" ? (
                        <Activity className="w-4 h-4 text-white" />
                      ) : (
                        <X className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">
                        {selectedCustomer.name}
                      </h2>
                      <p className="text-gray-500 font-mono text-sm bg-gray-100 px-3 py-1.5 rounded-lg inline-block">
                        ID: {selectedCustomer.id}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      {selectedCustomer.role && (
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getRoleClass(selectedCustomer.role)}`}>
                          <Users className="w-4 h-4 mr-2" />
                          {selectedCustomer.role.charAt(0).toUpperCase() + selectedCustomer.role.slice(1)}
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${
                          selectedCustomer.status === "Active"
                            ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
                        }`}
                      >
                        {selectedCustomer.status === "Active" ? (
                          <Activity className="w-4 h-4 mr-2" />
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        {selectedCustomer.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Customer Info Grid */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-blue-700 mb-1 block">
                          Email Address
                        </label>
                        <p className="text-gray-900 font-medium break-all">
                          {selectedCustomer.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-green-700 mb-1 block">
                          Phone Number
                        </label>
                        <p className="text-gray-900 font-medium">
                          {selectedCustomer.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-purple-700 mb-1 block">
                          Member Since
                        </label>
                        <p className="text-gray-900 font-medium">
                          {selectedCustomer.joinedDate}
                        </p>
                      </div>
                    </div>

                    {/* ENHANCED ROLE MANAGEMENT SECTION */}
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-indigo-700 mb-2 block">
                          User Role
                        </label>
                        
                        <div className="flex items-center space-x-3">
                          {/* Current Role Display */}
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getRoleClass(selectedCustomer.role || 'user')}`}>
                            <Users className="w-3 h-3 mr-1" />
                            {selectedCustomer.role?.charAt(0).toUpperCase() + selectedCustomer.role?.slice(1) || 'User'}
                          </span>
                          
                          {/* Role Selector */}
                          <div className="relative">
                            <select
                              value={selectedCustomer.role || 'user'}
                              onChange={(e) => updateCustomerRole(selectedCustomer.id, e.target.value)}
                              disabled={isUpdatingRole}
                              className="appearance-none bg-white border border-indigo-300 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {AVAILABLE_ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </option>
                              ))}
                            </select>
                            {isUpdatingRole ? (
                              <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-indigo-600" />
                            ) : (
                              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-600 pointer-events-none" />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-indigo-600 mt-1">
                          Select a role to change user permissions
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-orange-700 mb-1 block">
                          Account Status
                        </label>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(
                            selectedCustomer.status
                          )}`}
                        >
                          {selectedCustomer.status === "Active" ? (
                            <Activity className="w-3 h-3 mr-1" />
                          ) : (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          {selectedCustomer.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Order History */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="flex items-center justify-between text-lg font-semibold text-gray-900">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <ShoppingBag className="w-5 h-5 text-green-600" />
                      </div>
                      Order History
                      {customerOrders.length > 0 && (
                        <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {customerOrders.length} orders
                        </span>
                      )}
                    </div>
                    {isLoadingOrders && (
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    )}
                  </h3>
                </div>
                <div className="p-6">{renderCustomerOrdersTable()}</div>
              </div>

              {/* Enhanced Summary Stats */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
                  Customer Analytics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="p-3 bg-blue-500 rounded-full mx-auto mb-4 w-fit">
                      <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-blue-700 mb-2">
                      Total Orders
                    </p>
                    <p className="text-3xl font-bold text-blue-900">
                      {selectedCustomer.totalOrders}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="p-3 bg-green-500 rounded-full mx-auto mb-4 w-fit">
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-green-700 mb-2">
                      Total Spent
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      Rs. {selectedCustomer.totalSpent.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="p-3 bg-purple-500 rounded-full mx-auto mb-4 w-fit">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-purple-700 mb-2">
                      Average Order
                    </p>
                    <p className="text-3xl font-bold text-purple-900">
                      Rs.{" "}
                      {selectedCustomer.totalOrders > 0
                        ? (
                            selectedCustomer.totalSpent /
                            selectedCustomer.totalOrders
                          ).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => toggleCustomerStatus(selectedCustomer.id)}
                    className={`inline-flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                      selectedCustomer.status === "Active"
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    }`}
                  >
                    {selectedCustomer.status === "Active" ? (
                      <>
                        <UserX className="w-5 h-5 mr-2" />
                        Deactivate Customer
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-5 h-5 mr-2" />
                        Activate Customer
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowCustomerDetails(false)}
                    className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Customers;