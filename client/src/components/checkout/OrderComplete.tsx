import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  CheckCircle2,
  Clock,
  Truck,
  Tag,
  Building,
  MapPin,
  Phone,
  Mail,
  Package,
  Receipt,
  Download,
  Share,
} from "lucide-react";
import { ProductImage } from "../../utils/imageHelper";

interface StoreLocation {
  id: string;
  locationName: string;
  address: string;
  phone: string;
  email?: string;
  isActive: boolean;
}

interface OrderCompleteProps {
  orderId: string | null;
  finalTotal: number;
  paymentMethod: string;
  promoCode?: string;
  discount?: number;
}

export const OrderComplete: React.FC<OrderCompleteProps> = ({
  orderId,
  finalTotal,
  paymentMethod,
  promoCode,
  discount,
}) => {
  const navigate = useNavigate();

  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(
    null
  );
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [calculatedTotals, setCalculatedTotals] = useState({
    subtotal: 0,
    shipping: 200,
    tax: 0,
    total: 0,
    discount: 0,
  });

  useEffect(() => {
    console.log("🔍 OrderComplete - Loading all data...");
    console.log("Props received:", {
      orderId,
      finalTotal,
      paymentMethod,
      promoCode,
      discount,
    });

    // Load store location
    const savedBranch = localStorage.getItem("selectedBranch");
    if (savedBranch) {
      try {
        const branch = JSON.parse(savedBranch);
        setSelectedStore(branch);
        console.log("✅ Store loaded:", branch.locationName);
      } catch (error) {
        console.error("❌ Error loading store:", error);
      }
    }

    // Load order data from localStorage
    const savedOrderData = localStorage.getItem("lastOrderData");
    let orderData = null;

    if (savedOrderData) {
      try {
        orderData = JSON.parse(savedOrderData);
        console.log("💾 Found localStorage data:", orderData);

        if (orderData.items && Array.isArray(orderData.items)) {
          setOrderItems(orderData.items);
        }
      } catch (error) {
        console.error("❌ Error loading order data:", error);
      }
    } else {
      console.log("⚠️ No localStorage data found, using props");
    }

    // IMPROVED: Prioritize localStorage data, then fallback to props
    const shipping = 200;
    const tax = 0;

    let subtotal = 0;
    let total = 0;
    let discountAmount = 0;

    // Priority 1: Use localStorage data if available and valid
    if (orderData && orderData.finalTotal > 0) {
      subtotal = orderData.subtotal || 0;
      total = orderData.finalTotal;
      discountAmount = orderData.discount || 0;
      console.log("✅ Using localStorage totals:", {
        subtotal,
        total,
        discountAmount,
      });
    }
    // Priority 2: Use props if valid
    else if (finalTotal > 0) {
      discountAmount = discount || 0;
      total = finalTotal;
      subtotal = Math.max(0, finalTotal - shipping - tax + discountAmount);
      console.log("✅ Using props totals:", {
        subtotal,
        total,
        discountAmount,
      });
    }
    // Priority 3: Calculate from items if available
    else if (orderData?.items && Array.isArray(orderData.items)) {
      subtotal = orderData.items.reduce((sum: number, item: any) => {
        const itemPrice =
          item.product?.finalPrice || item.product?.price || item.price || 0;
        const quantity = item.quantity || 1;
        return sum + itemPrice * quantity;
      }, 0);
      discountAmount = orderData.discount || discount || 0;
      total = subtotal + shipping + tax - discountAmount;
      console.log("✅ Calculated from items:", {
        subtotal,
        total,
        discountAmount,
      });
    }
    // Fallback: Use minimum values
    else {
      subtotal = 0;
      total = shipping; // At least cover shipping
      discountAmount = 0;
      console.log("⚠️ Using fallback totals:", {
        subtotal,
        total,
        discountAmount,
      });
    }

    // Ensure totals are not negative
    subtotal = Math.max(0, subtotal);
    total = Math.max(shipping, total); // Total should at least be shipping cost
    discountAmount = Math.max(0, discountAmount);

    setCalculatedTotals({
      subtotal,
      shipping,
      tax,
      total,
      discount: discountAmount,
    });

    console.log("📊 Final calculated totals:", {
      subtotal,
      shipping,
      tax,
      total,
      discount: discountAmount,
      source: orderData ? "localStorage" : "props/fallback",
    });
  }, [orderId, finalTotal, paymentMethod, promoCode, discount]);

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card";
      case "cod":
        return "Cash on Delivery";
      case "qr":
        return "QR";
      case "paypal":
        return "PayPal";
      case "apple_pay":
        return "Apple Pay";
      default:
        return "Cash on Delivery";
    }
  };

  const handleDownloadReceipt = () => {
    alert("Receipt download functionality coming soon!");
  };

  const handleShareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Order Confirmation",
        text: `Order #${orderId} has been confirmed!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Order link copied to clipboard!");
    }
  };

  const displayOrderId = orderId || `order-${Date.now()}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 p-8 text-center">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-green-100 text-lg">
            Thank you for your purchase. Your order has been placed
            successfully.
          </p>
        </div>

        <div className="p-8">
          {/* Order Reference & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Reference</p>
              <p className="text-2xl font-bold text-gray-900">
                #{displayOrderId}
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button
                onClick={handleDownloadReceipt}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Receipt
              </Button>
              <Button
                onClick={handleShareOrder}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Items ({orderItems.length})
                </h3>

                {orderItems.length > 0 ? (
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 mr-4">
                          <ProductImage
                            src={item.image || item.product?.image}
                            alt={item.name || item.product?.name || "Product"}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.name || item.product?.name || "Product"}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity || 1}
                          </p>
                          <p className="text-sm font-semibold text-green-600">
                            Rs.{" "}
                            {(
                              item.total ||
                              item.price * (item.quantity || 1) ||
                              0
                            ).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 text-center">
                    <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-blue-800 font-medium">
                      Your order has been processed successfully!
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Order details will be sent to your email shortly.
                    </p>
                  </div>
                )}
              </div>

              {/* Store Location Information */}
              {selectedStore && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Pickup Location
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-700 space-y-2">
                      <p className="font-medium text-green-800 text-base">
                        {selectedStore.locationName}
                      </p>
                      <div className="flex items-center text-green-700">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{selectedStore.address}</span>
                      </div>
                      <div className="flex items-center text-green-700">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{selectedStore.phone}</span>
                      </div>
                      {selectedStore.email && (
                        <div className="flex items-center text-green-700">
                          <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>{selectedStore.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 p-3 bg-green-100 rounded text-sm text-green-800">
                      <strong>💡 Pickup Instructions:</strong>
                      <br />
                      Your order will be prepared at this location. We'll notify
                      you via SMS/email when it's ready for pickup. Please bring
                      a valid ID and this order confirmation.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Receipt className="w-5 h-5 mr-2" />
                  Order Summary
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  {/* Promo Code Applied */}
                  {promoCode && calculatedTotals.discount > 0 && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <Tag className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            Promo Code: {promoCode}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-green-800">
                          -Rs. {calculatedTotals.discount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 ml-6">
                        You saved Rs.{" "}
                        {calculatedTotals.discount.toLocaleString()} on this
                        order! 🎉
                      </p>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        Rs. {calculatedTotals.subtotal.toLocaleString()}
                      </span>
                    </div>

                    {calculatedTotals.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>
                          -Rs. {calculatedTotals.discount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {calculatedTotals.shipping === 0
                          ? "FREE"
                          : `Rs. ${calculatedTotals.shipping.toLocaleString()}`}
                      </span>
                    </div>

                    {calculatedTotals.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">
                          Rs. {calculatedTotals.tax.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          Total Amount
                        </span>
                        <span className="text-xl font-bold text-green-600">
                          Rs. {calculatedTotals.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="font-semibold text-gray-900">
                        {getPaymentMethodName(paymentMethod)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Order Confirmed
                      </p>
                      <p className="text-sm text-gray-500">Just now</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Preparing Order
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedStore ? "1-2 business days" : "Processing"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      {selectedStore ? (
                        <Building className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Truck className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-600">
                        {selectedStore
                          ? "Ready for Pickup"
                          : "Out for Delivery"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedStore
                          ? "We'll notify you"
                          : "3-5 business days"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📧 Email Confirmation
                </h4>
                <p className="text-sm text-blue-800">
                  You will receive an email confirmation shortly with your order
                  details and tracking information.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">
                  {selectedStore
                    ? "📱 Pickup Notification"
                    : "🚚 Delivery Updates"}
                </h4>
                <p className="text-sm text-green-800">
                  {selectedStore
                    ? "We'll send you a notification when your order is ready for pickup at the selected store."
                    : "Track your order status and delivery updates via SMS and email notifications."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={() => navigate("/products")}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                Continue Shopping
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/profile/orders")}
                className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
              >
                View All Orders
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/support")}
                className="border-gray-300 hover:bg-gray-50 w-full sm:w-auto"
              >
                Contact Support
              </Button>
            </div>
          </div>

          {/* Clear localStorage */}
          {selectedStore && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  localStorage.removeItem("selectedBranch");
                  localStorage.removeItem("lastOrderData");
                  console.log("Cleared order data from localStorage");
                }}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear order data for next purchase
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
