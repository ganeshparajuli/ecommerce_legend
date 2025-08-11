import React, {
  Suspense,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { type RootState } from "../../../../redux/store";
import {
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  RefreshCw,
  Mail,
  Package,
  Activity,
  Download,
  FileText,
  ChevronDown,
  type LucideIcon,
  Calendar,
  BarChart3,
  Settings,
  ShoppingCart,
  Eye,
  Filter,
  Star,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { getAllOrders } from "../../../../redux/actions/orderAction";
import { getAllUsers } from "../../../../redux/actions/userActions";
import {
  calculateDashboardStats,
  calculateSalesChartData,
  getRecentOrdersFormatted,
  type DashboardStats,
  type ChartData,
  type FormattedOrder,
  type Order,
  type User,
} from "../../../../utils/dashboardUtils";

const Chart = React.lazy(() => import("react-apexcharts"));

// Enhanced TypeScript interfaces
interface ExportData {
  [key: string]: string | number;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  description?: string;
}

interface ExportConfig {
  type: "orders" | "users" | "sales";
  filename: string;
  headers: string[];
  formatter: (data: any[]) => ExportData[];
}

// Enhanced CSV Export Utilities
const convertToCSV = (data: ExportData[], headers: string[]): string => {
  if (!data.length) return "";

  const csvHeaders = headers.join(",");
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header];
        // Enhanced handling for special characters and data types
        if (value === null || value === undefined) return "";
        const stringValue = String(value);
        if (
          stringValue.includes(",") ||
          stringValue.includes('"') ||
          stringValue.includes("\n")
        ) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
};

const downloadCSV = (csvContent: string, filename: string): void => {
  try {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading CSV:", error);
    throw new Error("Failed to download CSV file");
  }
};

// Enhanced Export Data Formatters
const formatOrdersForExport = (orders: Order[]): ExportData[] => {
  return orders.map((order, index) => ({
    "Order ID": order.id || order._id || `order-${index}`,
    "Customer Name": order.customerName || order.user?.name || "N/A",
    "Customer Email": order.customerEmail || order.user?.email || "N/A",
    "Total Amount": Number(order.totalAmount || order.total || 0).toFixed(2),
    Status: order.status || "Unknown",
    "Payment Method": order.paymentMethod || "N/A",
    "Payment Status": order.paymentStatus || "N/A",
    "Order Date": order.createdAt
      ? new Date(order.createdAt).toLocaleDateString()
      : "N/A",
    "Shipping Address": order.shippingAddress
      ? `${order.shippingAddress.street || ""}, ${
          order.shippingAddress.city || ""
        }, ${order.shippingAddress.state || ""} ${
          order.shippingAddress.zipCode || ""
        }`.trim()
      : "N/A",
    "Items Count": order.items?.length || order.orderItems?.length || 0,
    Discount: Number(order.discount || 0).toFixed(2),
    Tax: Number(order.tax || 0).toFixed(2),
    "Shipping Cost": Number(order.shippingCost || 0).toFixed(2),
  }));
};

const formatUsersForExport = (users: User[]): ExportData[] => {
  return users.map((user, index) => ({
    "User ID": user.id || user._id || `user-${index}`,
    Name: user.name || "N/A",
    Email: user.email || "N/A",
    Phone: user.phone || "N/A",
    Role: user.role || "customer",
    Status: user.isActive !== false ? "Active" : "Inactive",
    Verified: user.isVerified ? "Yes" : "No",
    "Join Date": user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "N/A",
    "Last Login": user.lastLogin
      ? new Date(user.lastLogin).toLocaleDateString()
      : "N/A",
    Address: user.address || "N/A",
    City: user.city || "N/A",
    Country: user.country || "N/A",
    "Orders Count": user.ordersCount || 0,
    "Total Spent": Number(user.totalSpent || 0).toFixed(2),
  }));
};

const formatSalesDataForExport = (orders: Order[]): ExportData[] => {
  const salesByDate = orders.reduce((acc: any, order) => {
    const date = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString()
      : "Unknown";
    const amount = parseFloat(String(order.totalAmount || order.total || 0));

    if (!acc[date]) {
      acc[date] = { date, totalSales: 0, orderCount: 0, customers: new Set() };
    }

    acc[date].totalSales += amount;
    acc[date].orderCount += 1;
    if (order.customerEmail) {
      acc[date].customers.add(order.customerEmail);
    }

    return acc;
  }, {});

  return Object.values(salesByDate).map((item: any) => ({
    Date: item.date,
    "Total Sales": item.totalSales.toFixed(2),
    "Order Count": item.orderCount,
    "Unique Customers": item.customers.size,
    "Average Order Value": (item.totalSales / item.orderCount).toFixed(2),
    "Revenue Per Customer":
      item.customers.size > 0
        ? (item.totalSales / item.customers.size).toFixed(2)
        : "0.00",
  }));
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state selectors with enhanced typing
  const userState = useSelector((state: RootState) => state.user);
  const {
    isAuthenticated,
    user,
    loading: userLoading,
    error: userError,
  } = userState;

  // Enhanced state selectors with better error handling
  const ordersState = useSelector((state: RootState) => {
    const s = state as any;

    // Primary location: state.order.orders
    if (s.order?.orders) {
      console.log(
        "📦 Found orders in state.order:",
        s.order.orders.length,
        "orders"
      );
      return {
        orders: s.order.orders,
        loading: s.order.loading || false,
        error: s.order.error || null,
      };
    }

    // Fallback locations
    const fallbackLocations = [
      { data: s.allOrders?.orders || s.allOrders, location: "allOrders" },
      { data: s.orders?.orders || s.orders, location: "orders" },
      { data: s.orderList?.orders || s.orderList, location: "orderList" },
      { data: s.adminOrders?.orders || s.adminOrders, location: "adminOrders" },
    ];

    for (const { data, location } of fallbackLocations) {
      if (Array.isArray(data) && data.length > 0) {
        console.log(`📦 Found orders in ${location}:`, data.length, "orders");
        return {
          orders: data,
          loading: false,
          error: null,
        };
      }
    }

    return { orders: [], loading: false, error: null };
  });

  const usersState = useSelector((state: RootState) => {
    const s = state as any;

    // Primary location: state.user.users
    if (s.user?.users) {
      console.log(
        "👥 Found users in state.user.users:",
        s.user.users.length,
        "users"
      );
      return {
        users: s.user.users,
        loading: s.user.loading || false,
        error: s.user.error || null,
      };
    }

    // Fallback locations
    const fallbackLocations = [
      { data: s.allUsers?.users || s.allUsers, location: "allUsers" },
      { data: s.users?.users || s.users, location: "users" },
      { data: s.userList?.users || s.userList, location: "userList" },
    ];

    for (const { data, location } of fallbackLocations) {
      if (Array.isArray(data) && data.length > 0) {
        console.log(`👥 Found users in ${location}:`, data.length, "users");
        return {
          users: data,
          loading: false,
          error: null,
        };
      }
    }

    return { users: [], loading: false, error: null };
  });

  // Extract data with enhanced error handling
  const orders: Order[] = Array.isArray(ordersState?.orders)
    ? ordersState.orders
    : [];
  const ordersLoading: boolean = ordersState?.loading || false;
  const ordersError: string | null = ordersState?.error || null;

  const users: User[] = Array.isArray(usersState?.users)
    ? usersState.users
    : [];
  const usersLoading: boolean = usersState?.loading || false;
  const usersError: string | null = usersState?.error || null;

  // Enhanced state management
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [exporting, setExporting] = useState<string>("");
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [dataLoadingProgress, setDataLoadingProgress] = useState<number>(0);

  // Enhanced debug logging
  useEffect(() => {
    console.log("📊 Dashboard Debug Info:");
    console.log("User:", {
      isAuthenticated,
      role: user?.role,
      name: user?.name,
    });
    console.log("Orders:", {
      count: orders.length,
      loading: ordersLoading,
      error: ordersError,
    });
    console.log("Users:", {
      count: users.length,
      loading: usersLoading,
      error: usersError,
    });
    console.log("Last refresh:", lastRefreshTime.toLocaleTimeString());
  }, [
    isAuthenticated,
    user,
    orders.length,
    users.length,
    ordersLoading,
    usersLoading,
    lastRefreshTime,
  ]);

  // Enhanced data fetching with progress tracking
  const fetchDashboardData = useCallback(
    async (showProgress = false) => {
      if (
        !isAuthenticated ||
        !["admin", "sub-admin"].includes(user?.role || "")
      )
        return;

      if (showProgress) setDataLoadingProgress(0);

      try {
        const promises = [];

        if (!orders.length && !ordersLoading) {
          console.log("🔄 Fetching orders...");
          promises.push(dispatch(getAllOrders() as any));
        }

        if (!users.length && !usersLoading && user?.role === "admin") {
          console.log("🔄 Fetching users...");
          promises.push(dispatch(getAllUsers() as any));
        }

        if (promises.length > 0) {
          if (showProgress) setDataLoadingProgress(50);
          await Promise.all(promises);
          if (showProgress) setDataLoadingProgress(100);
          setLastRefreshTime(new Date());
        }
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      } finally {
        if (showProgress) {
          setTimeout(() => setDataLoadingProgress(0), 1000);
        }
      }
    },
    [
      dispatch,
      isAuthenticated,
      user?.role,
      orders.length,
      users.length,
      ordersLoading,
      usersLoading,
    ]
  );

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Enhanced dashboard statistics with better error handling
  const dashboardStats: DashboardStats | null = useMemo(() => {
    try {
      if (orders.length > 0) {
        console.log("📈 Calculating dashboard stats with:", {
          ordersCount: orders.length,
          usersCount: users.length,
        });
        const stats = calculateDashboardStats(orders, users);
        console.log("📈 Calculated stats:", stats);
        return stats;
      }
    } catch (error) {
      console.error("❌ Error calculating dashboard stats:", error);
    }
    return null;
  }, [orders, users]);

  // Enhanced chart data with fallback
  const chartData: ChartData | null = useMemo(() => {
    try {
      if (orders.length > 0) {
        console.log("📊 Calculating chart data with orders:", orders.length);
        return calculateSalesChartData(orders);
      }
    } catch (error) {
      console.error("❌ Error calculating chart data:", error);
    }
    return null;
  }, [orders]);

  // Enhanced recent orders with better error handling
  const recentOrders: FormattedOrder[] = useMemo(() => {
    try {
      if (orders.length > 0) {
        const formatted = getRecentOrdersFormatted(orders, 5);
        console.log("📋 Recent orders formatted:", formatted.length);
        return formatted;
      }
    } catch (error) {
      console.error("❌ Error formatting recent orders:", error);
    }
    return [];
  }, [orders]);

  // Enhanced refresh functionality
  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    console.log("🔄 Refreshing dashboard data...");

    try {
      const promises = [dispatch(getAllOrders() as any)];

      // Only fetch users if admin
      if (user?.role === "admin") {
        promises.push(dispatch(getAllUsers() as any));
      }

      await Promise.all(promises);
      setLastRefreshTime(new Date());
      console.log("✅ Dashboard data refreshed successfully");
    } catch (error) {
      console.error("❌ Error refreshing dashboard data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Enhanced export functionality with better error handling
  const handleExport = async (config: ExportConfig): Promise<void> => {
    const { type, filename, headers, formatter } = config;

    setExporting(type);
    try {
      let data: any[] = [];

      switch (type) {
        case "orders":
          if (!orders.length) throw new Error("No orders data available");
          data = orders;
          break;
        case "users":
          if (!users.length) throw new Error("No users data available");
          data = users;
          break;
        case "sales":
          if (!orders.length) throw new Error("No sales data available");
          data = orders;
          break;
        default:
          throw new Error("Invalid export type");
      }

      const formattedData = formatter(data);
      const csvContent = convertToCSV(formattedData, headers);
      const finalFilename = `${filename}_${
        new Date().toISOString().split("T")[0]
      }.csv`;

      downloadCSV(csvContent, finalFilename);
      console.log(
        `📁 Successfully exported ${data.length} ${type} records to ${finalFilename}`
      );
    } catch (error) {
      console.error(`❌ Error exporting ${type}:`, error);
      alert(
        `Failed to export ${type}. ${
          error instanceof Error ? error.message : "Please try again."
        }`
      );
    } finally {
      setExporting("");
      setShowExportMenu(false);
    }
  };

  // Export configurations
  const exportConfigs: Record<string, ExportConfig> = {
    orders: {
      type: "orders",
      filename: "orders_export",
      headers: [
        "Order ID",
        "Customer Name",
        "Customer Email",
        "Total Amount",
        "Status",
        "Payment Method",
        "Payment Status",
        "Order Date",
        "Shipping Address",
        "Items Count",
        "Discount",
        "Tax",
        "Shipping Cost",
      ],
      formatter: formatOrdersForExport,
    },
    users: {
      type: "users",
      filename: "users_export",
      headers: [
        "User ID",
        "Name",
        "Email",
        "Phone",
        "Role",
        "Status",
        "Verified",
        "Join Date",
        "Last Login",
        "Address",
        "City",
        "Country",
        "Orders Count",
        "Total Spent",
      ],
      formatter: formatUsersForExport,
    },
    sales: {
      type: "sales",
      filename: "sales_data_export",
      headers: [
        "Date",
        "Total Sales",
        "Order Count",
        "Unique Customers",
        "Average Order Value",
        "Revenue Per Customer",
      ],
      formatter: formatSalesDataForExport,
    },
  };

  // Click outside handler for export menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showExportMenu &&
        !(event.target as Element)?.closest(".export-menu")
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showExportMenu]);

  // Enhanced stats cards with better data
  const statsCards: StatCard[] = useMemo(
    () => [
      {
        title: "Total Revenue",
        value: dashboardStats?.totalRevenue || "$0.00",
        change: dashboardStats?.revenueChange || "0%",
        trend: (dashboardStats?.revenueChange?.includes("+")
          ? "up"
          : dashboardStats?.revenueChange?.includes("-")
          ? "down"
          : "neutral") as "up" | "down" | "neutral",
        icon: DollarSign,
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
        description: "Total revenue from all orders",
      },
      {
        title: "Total Customers",
        value: users.length.toString(),
        change: dashboardStats?.customersChange || "0%",
        trend: (dashboardStats?.customersChange?.includes("+")
          ? "up"
          : dashboardStats?.customersChange?.includes("-")
          ? "down"
          : "neutral") as "up" | "down" | "neutral",
        icon: Users,
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        description: "Total registered customers",
      },
      {
        title: "Total Orders",
        value: dashboardStats?.totalOrders || orders.length.toString(),
        change: dashboardStats?.ordersChange || "0%",
        trend: (dashboardStats?.ordersChange?.includes("+")
          ? "up"
          : dashboardStats?.ordersChange?.includes("-")
          ? "down"
          : "neutral") as "up" | "down" | "neutral",
        icon: ShoppingBag,
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600",
        description: "Total orders placed",
      },
      {
        title: "Avg Order Value",
        value:
          dashboardStats?.salesGrowth || orders.length > 0
            ? `$${(
                orders.reduce(
                  (sum, order) =>
                    sum + Number(order.totalAmount || order.total || 0),
                  0
                ) / orders.length
              ).toFixed(2)}`
            : "$0.00",
        change: dashboardStats?.salesGrowthChange || "0%",
        trend: (dashboardStats?.salesGrowthChange?.includes("+")
          ? "up"
          : dashboardStats?.salesGrowthChange?.includes("-")
          ? "down"
          : "neutral") as "up" | "down" | "neutral",
        icon: TrendingUp,
        bgColor: "bg-orange-100",
        iconColor: "text-orange-600",
        description: "Average value per order",
      },
    ],
    [dashboardStats, orders, users]
  );

  // Enhanced chart configuration
  const salesChartConfig = useMemo(
    () => ({
      options: {
        chart: {
          type: "area" as const,
          toolbar: { show: false },
          background: "transparent",
          animations: {
            enabled: true,
            easing: "easeinout",
            speed: 800,
          },
        },
        stroke: {
          curve: "smooth" as const,
          width: 3,
        },
        xaxis: {
          categories: chartData?.categories || [
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
          ],
          labels: {
            style: {
              colors: "#374151",
              fontSize: "12px",
              fontWeight: 500,
            },
          },
        },
        yaxis: {
          labels: {
            formatter: (value: number) => `$${value.toFixed(0)}`,
            style: {
              colors: "#374151",
              fontSize: "12px",
              fontWeight: 500,
            },
          },
        },
        tooltip: {
          y: {
            formatter: (value: number) => `$${value.toFixed(2)}`,
          },
          theme: "light",
          style: {
            fontSize: "14px",
          },
        },
        colors: ["#16a34a"],
        fill: {
          type: "gradient" as const,
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.4,
            opacityTo: 0.1,
            stops: [0, 90, 100],
            colorStops: [
              { offset: 0, color: "#16a34a", opacity: 0.4 },
              { offset: 100, color: "#16a34a", opacity: 0.1 },
            ],
          },
        },
        grid: {
          borderColor: "#e5e7eb",
          strokeDashArray: 4,
          xaxis: { lines: { show: false } },
          yaxis: { lines: { show: true } },
        },
        dataLabels: { enabled: false },
      },
      series: chartData?.series || [
        {
          name: "Sales",
          data: [0, 0, 0, 0, 0, 0, 0],
        },
      ],
    }),
    [chartData]
  );

  // Enhanced loading state
  const isLoading =
    userLoading ||
    (isAuthenticated &&
      ["admin", "sub-admin"].includes(user?.role || "") &&
      (ordersLoading || (usersLoading && user?.role === "admin")) &&
      (!orders.length || (user?.role === "admin" && !users.length)));

  // Enhanced loading screen
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center space-y-6 p-8"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-t-green-600 border-r-green-200 border-b-green-200 border-l-green-200 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800 mb-2">
              Loading Dashboard
            </p>
            <p className="text-sm text-gray-600">Preparing your analytics...</p>
            {dataLoadingProgress > 0 && (
              <div className="mt-4 w-48 bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-green-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${dataLoadingProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // Enhanced access control
  if (!isAuthenticated || !["admin", "sub-admin"].includes(user?.role || "")) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the admin dashboard.
              {user?.role && ` Your current role: ${user.role}`}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-medium"
              >
                Go to Profile
              </button>
              <button
                onClick={() => navigate("/")}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium"
              >
                Go Home
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden p-4 sm:p-6">
      {/* Enhanced header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-2 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <br></br>
                <br></br>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Welcome back, {user?.name || "Admin"}
                </h1>
                <p className="text-gray-600">
                  {user?.role === "admin"
                    ? "Admin Dashboard"
                    : "Sub-Admin Dashboard"}{" "}
                  • Last updated: {lastRefreshTime.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <AnimatePresence>
              {(!dashboardStats || orders.length === 0) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 text-sm text-blue-600 bg-blue-50 px-4 py-3 rounded-xl border border-blue-200 flex items-center"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  <span>
                    Loading dashboard data...
                    {orders.length > 0
                      ? ` ${orders.length} orders loaded`
                      : " Loading orders"}
                    {user?.role === "admin" &&
                      (users.length > 0
                        ? `, ${users.length} users loaded`
                        : ", loading users")}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Enhanced Export Menu */}
            <div className="relative export-menu">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExportMenu(!showExportMenu);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-medium shadow-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform duration-200 ${
                    showExportMenu ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50"
                  >
                    <div className="py-2">
                      <button
                        onClick={() => handleExport(exportConfigs.orders)}
                        disabled={!orders.length || exporting === "orders"}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center">
                          {exporting === "orders" ? (
                            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-3" />
                          ) : (
                            <FileText className="h-4 w-4 mr-3 text-green-600" />
                          )}
                          Export Orders
                        </div>
                        <span className="text-xs text-gray-500">
                          ({orders.length})
                        </span>
                      </button>

                      {user?.role === "admin" && (
                        <button
                          onClick={() => handleExport(exportConfigs.users)}
                          disabled={!users.length || exporting === "users"}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-colors"
                        >
                          <div className="flex items-center">
                            {exporting === "users" ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
                            ) : (
                              <Users className="h-4 w-4 mr-3 text-blue-600" />
                            )}
                            Export Users
                          </div>
                          <span className="text-xs text-gray-500">
                            ({users.length})
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() => handleExport(exportConfigs.sales)}
                        disabled={!orders.length || exporting === "sales"}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center">
                          {exporting === "sales" ? (
                            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-3" />
                          ) : (
                            <TrendingUp className="h-4 w-4 mr-3 text-purple-600" />
                          )}
                          Export Sales Data
                        </div>
                        <span className="text-xs text-gray-500">
                          (Analytics)
                        </span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Refresh Button */}
            <motion.button
              onClick={handleRefresh}
              disabled={refreshing}
              whileHover={{ scale: refreshing ? 1 : 1.02 }}
              whileTap={{ scale: refreshing ? 1 : 0.98 }}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Enhanced error display */}
      <AnimatePresence>
        {(ordersError || usersError || userError) && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start border border-red-200 shadow-sm"
          >
            <AlertCircle
              className="text-red-500 mr-3 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="flex-1">
              <h4 className="text-red-800 font-semibold mb-1">
                Data Loading Error
              </h4>
              <p className="text-red-700 text-sm mb-3">
                {ordersError ||
                  usersError ||
                  userError ||
                  "Failed to load dashboard data"}
              </p>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-sm text-red-600 hover:text-red-800 underline font-medium disabled:opacity-50"
              >
                {refreshing ? "Retrying..." : "Retry Now"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={`stat-${stat.title}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-xl shadow-sm`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  {stat.trend !== "neutral" && (
                    <div
                      className={`flex items-center text-sm font-semibold px-2 py-1 rounded-full ${
                        stat.trend === "up"
                          ? "text-green-700 bg-green-100 border border-green-200"
                          : "text-red-700 bg-red-100 border border-red-200"
                      }`}
                    >
                      {stat.change}
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  {stat.description && (
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Charts and Tables Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Enhanced Sales Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2"
        >
          <Card className="bg-white border border-gray-200 shadow-lg overflow-hidden">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Sales Overview
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Revenue trends over the last 7 days
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                    Sales
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Suspense
                fallback={
                  <div className="flex justify-center items-center h-80">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center space-y-4"
                    >
                      <div className="w-12 h-12 border-4 border-t-green-600 border-r-green-200 border-b-green-200 border-l-green-200 rounded-full animate-spin"></div>
                      <p className="text-gray-500 text-sm">Loading chart...</p>
                    </motion.div>
                  </div>
                }
              >
                <Chart
                  options={salesChartConfig.options}
                  series={salesChartConfig.series}
                  type="area"
                  height={350}
                />
              </Suspense>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Recent Orders */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white border border-gray-200 shadow-lg overflow-hidden h-full">
            <CardHeader className="pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2 text-blue-600" />
                    Recent Orders
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Latest customer orders
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {orders.length > 0 && (
                    <button
                      onClick={() => handleExport(exportConfigs.orders)}
                      disabled={exporting === "orders"}
                      className="text-xs text-gray-600 hover:text-green-600 font-medium hover:underline transition-colors disabled:opacity-50 flex items-center"
                    >
                      {exporting === "orders" ? (
                        <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-1" />
                      ) : (
                        <Download className="h-3 w-3 mr-1" />
                      )}
                      Export
                    </button>
                  )}
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => navigate("/admin/orders")}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors flex items-center"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View All
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {recentOrders.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {recentOrders.map((order, index) => (
                      <motion.div
                        key={`order-${order.id || order.orderId || index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() =>
                          navigate(`/admin/orders/${order.id || order.orderId}`)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm truncate">
                              {order.customer || "Unknown Customer"}
                            </p>
                            <p className="text-xs text-gray-600 truncate mt-1">
                              {order.product || "No Product"} •{" "}
                              {order.id || order.orderId || "No ID"}
                            </p>
                          </div>
                          <div className="text-right ml-3 flex-shrink-0">
                            <p className="font-semibold text-gray-900 text-sm">
                              {order.amount || "$0.00"}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                order.status === "Completed" ||
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "Processing" ||
                                    order.status === "processing"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "Shipped" ||
                                    order.status === "shipped"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {order.status || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 font-medium">
                      No recent orders
                    </p>
                    {orders.length === 0 && !ordersLoading && (
                      <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="mt-3 text-sm text-green-600 hover:text-green-700 underline font-medium disabled:opacity-50"
                      >
                        {refreshing ? "Loading..." : "Refresh Data"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Manage Products",
            description: "Add, edit or remove products",
            icon: Package,
            color: "green",
            route: "/admin/products",
            delay: 0.6,
          },
          {
            title: "View Orders",
            description: "Monitor and process orders",
            icon: ShoppingCart,
            color: "blue",
            route: "/admin/orders",
            delay: 0.7,
          },
          {
            title: "Manage Customers",
            description:
              user?.role === "admin"
                ? "View and manage user accounts"
                : "View customer information",
            icon: Users,
            color: "purple",
            route: "/admin/customers",
            delay: 0.8,
          },
          {
            title: "Settings",
            description: "Configure store settings",
            icon: Settings,
            color: "orange",
            route: "/admin/settings",
            delay: 0.9,
          },
        ].map((action) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: action.delay }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Card
              className={`cursor-pointer hover:shadow-xl transition-all duration-300 bg-white border border-gray-200 hover:border-${action.color}-300 transform hover:scale-105 overflow-hidden group`}
              onClick={() => navigate(action.route)}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div
                    className={`bg-${action.color}-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-shadow`}
                  >
                    <action.icon
                      className={`h-6 w-6 text-${action.color}-600`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
