import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import {
  getAllOrders,
  updateOrderStatus as updateStatus,
} from "../../../../redux/actions/orderAction";
import { ProductImage } from "../../../../utils/imageHelper";
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  MapPin,
  Phone,
  Mail,
  Tag,
  Calendar,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  User,
  Hash,
  DollarSign,
  ChevronDown,
  Printer,
  RefreshCw,
  TrendingUp,
  BarChart3,
  X,
  Download,
  FileText
} from "lucide-react";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: string;
  image: string;
  product_image?: string;
}

interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  state?: string;
  country?: string;
}

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_amount: string;
  discount_amount: string;
  payment_method: string;
  user_id: string;
  promo_code: string | null;
  shipping_address: ShippingAddress;
  items: OrderItem[];
}

interface RootState {
  order: {
    orders: Order[];
    loading: boolean;
    error: string | null;
  };
}

const Orders: React.FC = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.order
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Fetch orders when component mounts
  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  // Filter orders based on search term and status filter
  const filteredOrders = orders
    ? orders.filter((order) => {
        const matchesSearch =
          order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.shipping_address?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
    : [];

  const getStatusClass = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    dispatch(updateStatus(orderId, newStatus)).then(() => {
      // Optionally, you can refresh the orders after updating status
      dispatch(getAllOrders());
    });
  };

  // Count orders by status
  const countByStatus = (status: string) => {
    return orders
      ? orders.filter((order) => order.status === status).length
      : 0;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get total items count for an order
  const getTotalItems = (order: Order) => {
    return order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  if (loading)
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700">Loading orders...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="container my-10 mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order Management
            </h1>
            <p className="text-gray-600">Track and manage customer orders</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Search className="w-4 h-4 mr-2" />
                Search Orders
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by order ID or customer name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full appearance-none h-12 px-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-1">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {orders ? orders.length : 0}
                </p>
              </div>
              <div className="p-3 bg-blue-500 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 mb-1">
                  Pending
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {countByStatus("pending")}
                </p>
              </div>
              <div className="p-3 bg-purple-500 rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-yellow-600 mb-1">
                  Processing
                </p>
                <p className="text-3xl font-bold text-yellow-900">
                  {countByStatus("processing")}
                </p>
              </div>
              <div className="p-3 bg-yellow-500 rounded-xl">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-indigo-600 mb-1">
                  Shipped
                </p>
                <p className="text-3xl font-bold text-indigo-900">
                  {countByStatus("shipped")}
                </p>
              </div>
              <div className="p-3 bg-indigo-500 rounded-xl">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-600 mb-1">
                  Delivered
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {countByStatus("delivered")}
                </p>
              </div>
              <div className="p-3 bg-green-500 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader className="border-b border-gray-200 p-6">
          <CardTitle className="flex items-center text-xl font-bold text-gray-900">
            <ShoppingBag className="w-5 h-5 mr-2" />
            Recent Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Hash className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {order.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.shipping_address.name}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <Phone className="w-3 h-3 mr-1" />
                              {order.shipping_address.phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(order.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">
                            {order.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {order.items && order.items.length > 0 ? (
                          <div>
                            <div className="flex items-center font-medium text-gray-900">
                              <Package className="w-4 h-4 mr-1 text-gray-400" />
                              {getTotalItems(order)} items
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[120px] mt-1">
                              {order.items
                                .map((item) => item.product_name)
                                .join(", ")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No items</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center font-bold text-green-600">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Rs. {parseFloat(order.total_amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {order.payment_method.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </button>
                          <div className="relative">
                            <select
                              className="text-sm border border-gray-300 rounded-lg py-1 px-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                              value={order.status}
                              onChange={(e) =>
                                handleUpdateStatus(order.id, e.target.value)
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No orders found
                        </h3>
                        <p className="text-gray-500">
                          {searchTerm || statusFilter
                            ? "Try adjusting your search or filter criteria"
                            : "No orders have been placed yet"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">1</span> to{" "}
              <span className="font-semibold">{filteredOrders.length}</span> of{" "}
              <span className="font-semibold">{orders?.length || 0}</span>{" "}
              orders
            </div>
            <div className="text-sm text-gray-500">
              {(searchTerm || statusFilter) && (
                <span className="text-indigo-600 font-medium">
                  (filtered results)
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="sm:max-w-[900px] max-h-[95vh] overflow-hidden bg-gradient-to-br from-gray-50 to-white">
            <DialogHeader className="border-b border-gray-200 pb-6 bg-white -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center text-xl font-bold text-gray-900">
                  <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  Order Details - #{selectedOrder.id.slice(0, 8)}
                </div>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-8 pt-6 overflow-y-auto max-h-[calc(95vh-120px)]">
              {/* Enhanced Customer Information */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-blue-700 mb-1 block">
                          Full Name
                        </label>
                        <p className="text-gray-900 font-medium">
                          {selectedOrder.shipping_address.name}
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
                          {selectedOrder.shipping_address.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200 h-full">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-semibold text-purple-700 mb-2 block">
                          Shipping Address
                        </label>
                        <div className="text-gray-900 space-y-1">
                          <p className="font-medium">
                            {selectedOrder.shipping_address.address}
                          </p>
                          <p>
                            {selectedOrder.shipping_address.city},{" "}
                            {selectedOrder.shipping_address.postalCode}
                          </p>
                          {selectedOrder.shipping_address.state && (
                            <p>{selectedOrder.shipping_address.state}</p>
                          )}
                          {selectedOrder.shipping_address.country && (
                            <p>{selectedOrder.shipping_address.country}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500 rounded-full">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-600 mb-1">
                        Order Date
                      </h3>
                      <p className="text-lg font-bold text-blue-900">
                        {formatDate(selectedOrder.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-500 rounded-full">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-purple-600 mb-2">
                        Status
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusClass(
                          selectedOrder.status
                        )}`}
                      >
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-1 capitalize">
                          {selectedOrder.status}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-500 rounded-full">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-green-600 mb-1">
                        Payment Method
                      </h3>
                      <p className="text-lg font-bold text-green-900">
                        {selectedOrder.payment_method.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Order Items */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="flex items-center justify-between text-lg font-semibold text-gray-900">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg mr-3">
                        <ShoppingBag className="w-5 h-5 text-orange-600" />
                      </div>
                      Order Items
                      {selectedOrder.items &&
                        selectedOrder.items.length > 0 && (
                          <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {selectedOrder.items.length} items
                          </span>
                        )}
                    </div>
                  </h3>
                </div>

                <div className="p-6">
                  <div className="grid gap-4">
                    {selectedOrder.items &&
                      selectedOrder.items.map((item, index) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                            index % 2 === 0
                              ? "bg-gray-50 border-gray-200"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              {item.product_image || item.image ? (
                                <ProductImage
                                  src={item.product_image || item.image}
                                  alt={item.product_name}
                                  className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center border-2 border-gray-200">
                                  <Package className="w-8 h-8 text-gray-400" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="md:col-span-2">
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {item.product_name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Product ID: {item.product_id}
                                </p>
                              </div>

                              <div className="flex items-center space-x-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Price
                                  </p>
                                  <p className="text-lg font-bold text-gray-900">
                                    Rs. {parseFloat(item.price).toFixed(2)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600">
                                    Qty
                                  </p>
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                                    {item.quantity}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-end">
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-600">
                                    Total
                                  </p>
                                  <p className="text-xl font-bold text-green-600">
                                    Rs.{" "}
                                    {(
                                      parseFloat(item.price) * item.quantity
                                    ).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Order Summary */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  Order Summary
                </h3>

                <div className="space-y-4">
                  {/* Check if promo code is applied */}
                  {selectedOrder.promo_code &&
                  parseFloat(selectedOrder.discount_amount || "0") > 0 ? (
                    <>
                      {/* Original Subtotal */}
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600 font-medium">
                          Subtotal:
                        </span>
                        <span className="font-semibold text-gray-900">
                          Rs.{" "}
                          {(
                            parseFloat(selectedOrder.total_amount) +
                            parseFloat(selectedOrder.discount_amount || "0")
                          ).toFixed(2)}
                        </span>
                      </div>

                      {/* Promo Code Applied Section */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 my-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-500 rounded-full">
                              <Tag className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-green-800">
                                Promo Code: {selectedOrder.promo_code}
                              </h4>
                              <p className="text-sm text-green-700">
                                Customer saved with this promotional offer
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 font-medium">
                              Discount
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              -Rs.{" "}
                              {parseFloat(
                                selectedOrder.discount_amount || "0"
                              ).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Final Total */}
                      <div className="border-t border-gray-300 pt-4">
                        <div className="flex justify-between text-2xl font-bold">
                          <span className="text-gray-900">Total Amount:</span>
                          <span className="text-green-600">
                            Rs.{" "}
                            {parseFloat(selectedOrder.total_amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Customer saved Rs.{" "}
                            {parseFloat(
                              selectedOrder.discount_amount || "0"
                            ).toFixed(2)}{" "}
                            with {selectedOrder.promo_code}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* No Promo Applied - Simple Summary */}
                      <div className="flex justify-between text-lg">
                        <span className="text-gray-600 font-medium">
                          Subtotal:
                        </span>
                        <span className="font-semibold text-gray-900">
                          Rs.{" "}
                          {parseFloat(selectedOrder.total_amount).toFixed(2)}
                        </span>
                      </div>

                      <div className="border-t border-gray-300 pt-4">
                        <div className="flex justify-between text-2xl font-bold">
                          <span className="text-gray-900">Total Amount:</span>
                          <span className="text-green-600">
                            Rs.{" "}
                            {parseFloat(selectedOrder.total_amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowOrderDetails(false)}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 hover:bg-gray-50 font-semibold rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Close
                  </Button>
                  <Button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <Printer className="w-5 h-5 mr-2" />
                    Print Invoice
                  </Button>
                  <Button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <Download className="w-5 h-5 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Orders;