import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  ArrowLeft,
  Search,
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  NavbarSection,
  Breadcrumb,
} from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
import { useDispatch, useSelector } from "react-redux";
import { myOrders } from "../../redux/actions/orderAction"; // Import the order action
import type { RootState } from "../../redux/store";
import { ProductImage } from "../../utils/imageHelper";
import { formatPrice } from "@/utils/formatPrice";

interface Order {
  id: string;
  orderNumber: string;
  created_at: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total_amount: string;
  items: BackendOrderItem[];
  shippingAddress: string;
  trackingNumber?: string;
}

interface BackendOrderItem {
  product_id: string;
  quantity: number;
  price: string | number;
  product_name?: string; // If backend provides this
  product_image?: string; // If backend provides this
}

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get orders from Redux store
  const {
    orders = [],
    loading,
    error: orderError,
  } = useSelector((state: RootState) => state.order);
  const { user } = useSelector((state: RootState) => state.user);

  console.log(orders, " orders from redux");

  useEffect(() => {
    // Check authentication
    if (!user) {
      navigate("/login");
      return;
    }

    // Dispatch action to fetch orders
    dispatch(myOrders() as any);
  }, [dispatch, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <RefreshCw className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  // In MyOrders.tsx, add this transformation function:
  const transformOrders = (backendOrders: any[]): Order[] => {
    return backendOrders.map((order) => ({
      id: order.id,
      orderNumber: order.id, // Use ID as order number if no specific field
      date: order.created_at,
      status: order.status,
      total: parseFloat(order.total_amount),
      items:
        order.items?.map((item) => ({
          id: item.product_id || item.id,
          name: item.product_name || item.name,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
          image: item.product_image || item.image || "/placeholder.jpg",
        })) || [],
      shippingAddress:
        typeof order.shipping_address === "string"
          ? order.shipping_address
          : `${order.shipping_address?.address || ""}, ${
              order.shipping_address?.city || ""
            }`,
      trackingNumber: order.tracking_number,
    }));
  };

  // Then use it:
  const transformedOrders = transformOrders(orders);
  const filteredOrders = transformedOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const downloadInvoice = (orderId: string) => {
    // Implement invoice download functionality
    console.log("Downloading invoice for order:", orderId);
  };

  const viewOrderDetails = (orderId: string) => {
    navigate(`/profile/orders/${orderId}`);
  };

  const refreshOrders = () => {
    dispatch(myOrders() as any);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NavbarSection />
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto"></div>
            <p className="text-black mt-4 font-medium text-center">
              Loading your orders...
            </p>
          </div>
        </div>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <NavbarSection />
      <Breadcrumb
        items={[
          { name: "Home", href: "/", current: false },
          { name: "Profile", href: "/profile", current: false },
          { name: "My Orders", href: "/profile/orders", current: true },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-lg"
        >
          <div className="flex items-center mb-4 lg:mb-0">
            <button
              onClick={() => navigate("/profile")}
              className="mr-4 p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-black">
                My Orders
              </h1>
              <p className="text-gray-600 text-base lg:text-lg font-medium">
                {orders.length} orders found
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm text-black placeholder-gray-500 w-full sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm text-black"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={refreshOrders}
              className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
              title="Refresh Orders"
            >
              <RefreshCw className="w-5 h-5 text-black" />
            </button>
          </div>
        </motion.div>

        {/* Error Message */}
        {orderError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="text-red-600 mr-3" size={20} />
                <p className="text-red-800 font-medium">
                  {typeof orderError === "string"
                    ? orderError
                    : "Failed to load orders. Please try again."}
                </p>
              </div>
              <button
                onClick={refreshOrders}
                className="text-red-600 hover:text-red-800 underline text-sm font-medium transition-colors"
              >
                Try again
              </button>
            </div>
          </motion.div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 max-w-lg mx-auto">
              <Package className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-black mb-3">
                No orders found
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {orderError
                  ? "Error loading orders. Please try again."
                  : "Start shopping to see your orders here"}
              </p>
              <button
                onClick={() => navigate("/products")}
                className="bg-green-600 text-white px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-300 font-bold text-lg shadow-lg transform hover:scale-105"
              >
                Browse Products
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]"
              >
                <div className="p-6 sm:p-8">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-100">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-xl font-bold text-black">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-gray-600 mt-1 font-medium">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(
                          order.status
                        )} shadow-sm`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-2 capitalize">{order.status}</span>
                      </span>
                      <span className="text-2xl font-bold text-black">
                        Rs {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-4 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-gray-100 transition-colors duration-300"
                      >
                        <div className="rounded-xl overflow-hidden shadow-sm">
                          <ProductImage
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-black truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-gray-600 font-medium">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-6 border-t border-gray-100 space-y-4 lg:space-y-0">
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-1">
                        <span className="text-black font-bold">
                          Shipping to:
                        </span>{" "}
                        {order.shippingAddress}
                      </p>
                      {order.trackingNumber && (
                        <p className="text-sm text-gray-600 font-medium">
                          <span className="text-black font-bold">
                            Tracking:
                          </span>{" "}
                          {order.trackingNumber}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
                      <button
                        onClick={() => viewOrderDetails(order.id)}
                        className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl text-sm font-bold text-black hover:bg-gray-50 transition-all duration-300 bg-white shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button
                        onClick={() => downloadInvoice(order.id)}
                        className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Invoice
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <FooterSection />
    </div>
  );
};

export default MyOrders;
