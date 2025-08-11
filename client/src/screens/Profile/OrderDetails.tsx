// OrderDetails.tsx - Enhanced with Promo Code Support
import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { myOrders } from "../../redux/actions/orderAction";
import type { RootState } from "../../redux/store";
import { ProductImage } from "../../utils/imageHelper";

// Helper function to extract user ID from token
const getUserIdFromToken = (token: string): string | null => {
  try {
    if (!token) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const decodedToken = JSON.parse(jsonPayload);
    return decodedToken.id || decodedToken.sub || decodedToken.user_id || null;
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "shipped":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "processing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyle(
        status
      )}`}
    >
      <div
        className={`w-2 h-2 rounded-full mr-2 ${
          status?.toLowerCase() === "delivered"
            ? "bg-green-500"
            : status?.toLowerCase() === "shipped"
            ? "bg-blue-500"
            : status?.toLowerCase() === "processing"
            ? "bg-yellow-500"
            : status?.toLowerCase() === "pending"
            ? "bg-orange-500"
            : status?.toLowerCase() === "cancelled"
            ? "bg-red-500"
            : "bg-gray-500"
        }`}
      ></div>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
    </span>
  );
};

// Loading Component
const LoadingComponent: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Loading Order Details
        </h3>
        <p className="text-gray-600 text-center">
          Please wait while we fetch your order information...
        </p>
      </div>
    </div>
  </div>
);

// Error Component
const ErrorComponent: React.FC<{ error: string; onRetry: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
      <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Error Loading Order
      </h3>
      <p className="text-gray-600 mb-6">{error}</p>
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={() => window.history.back()}
          className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
);

// Order Not Found Component
const OrderNotFoundComponent: React.FC<{ orderId: string }> = ({ orderId }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Order Not Found
        </h3>
        <p className="text-gray-600 mb-2">
          We couldn't find the order you're looking for.
        </p>
        <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/profile/orders")}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.order
  );
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  // Find the specific order
  const order = useMemo(() => {
    if (!orders || !Array.isArray(orders) || !orderId) {
      return null;
    }
    return orders.find((order) => order.id === orderId) || null;
  }, [orders, orderId]);

  console.log(order, "Order Details Loaded");

  // Load orders if not loaded and user is authenticated
  useEffect(() => {
    const loadUserOrders = async () => {
      if (isAuthenticated && user && (!orders || orders.length === 0)) {
        const token = localStorage.getItem("token");
        if (token) {
          const userId = getUserIdFromToken(token);
          if (userId) {
            await dispatch(myOrders(userId) as any);
          }
        }
      }
    };

    loadUserOrders();
  }, [dispatch, isAuthenticated, user, orders]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Handle retry
  const handleRetry = () => {
    const token = localStorage.getItem("token");
    if (token) {
      const userId = getUserIdFromToken(token);
      if (userId) {
        dispatch(myOrders(userId) as any);
      }
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingComponent />;
  }

  // Show error state
  if (error) {
    return <ErrorComponent error={error} onRetry={handleRetry} />;
  }

  // Show not found state
  if (!loading && !order && orderId) {
    return <OrderNotFoundComponent orderId={orderId} />;
  }

  if (!order) {
    return <LoadingComponent />;
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Check if promo was applied
  const hasPromoApplied =
    order.promo_code && parseFloat(order.discount_amount || "0") > 0;

  return (
    <div className="mt-48 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/profile/orders")}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Orders
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                Order Details
              </h1>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Summary
                </h2>
                <span className="text-sm text-gray-500">
                  #{order.id.slice(-8).toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(order.created_at).split(",")[0]}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-gray-900">
                    Rs. {parseFloat(order.total_amount).toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {order.payment_method}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Items</p>
                  <p className="font-semibold text-gray-900">
                    {order.items?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Items
                </h2>
              </div>
              <div className="p-6">
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-4">
                    {order.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <ProductImage
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.product_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Quantity:{" "}
                            <span className="font-medium">{item.quantity}</span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Unit Price:{" "}
                            <span className="font-medium">
                              Rs. {parseFloat(item.price).toFixed(2)}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            Rs.{" "}
                            {(parseFloat(item.price) * item.quantity).toFixed(
                              2
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="w-12 h-12 text-gray-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2"
                      />
                    </svg>
                    <p className="text-gray-600">
                      No items found for this order
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Info */}
          <div className="space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Shipping Address
              </h3>
              {order.shipping_address ? (
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-gray-900">
                    {order.shipping_address.name}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address.phone}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address.address}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No shipping address provided
                </p>
              )}
            </div>

            {/* Promo Code Information - Show only if applied */}
            {hasPromoApplied && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-200 p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  🎉 Promo Applied!
                </h3>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-600">
                      Promo Code:
                    </span>
                    <span className="font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
                      {order.promo_code}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      You Saved:
                    </span>
                    <span className="font-bold text-green-600 text-lg">
                      Rs. {parseFloat(order.discount_amount || "0").toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    💰 Great savings on this order!
                  </span>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                Payment Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {order.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <StatusBadge status={order.status} />
                </div>

                {/* Show price breakdown if promo was applied */}
                {hasPromoApplied ? (
                  <>
                    <hr className="my-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-500">
                        Rs.{" "}
                        {(
                          parseFloat(order.total_amount) +
                          parseFloat(order.discount_amount || "0")
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Promo Discount ({order.promo_code}):</span>
                      <span>
                        -Rs.{" "}
                        {parseFloat(order.discount_amount || "0").toFixed(2)}
                      </span>
                    </div>
                    <hr className="my-3" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total Paid:</span>
                      <span className="text-blue-600">
                        Rs. {parseFloat(order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <hr />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        Rs. {parseFloat(order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Order Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Order Placed</p>
                    <p className="text-gray-600">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                </div>
                {order.updated_at && order.updated_at !== order.created_at && (
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Last Updated</p>
                      <p className="text-gray-600">
                        {formatDate(order.updated_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
