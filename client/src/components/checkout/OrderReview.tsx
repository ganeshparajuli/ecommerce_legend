import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Loader2,
  Tag,
  Building,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { ProductImage } from "../../utils/imageHelper";
import { formatPrice } from "@/utils/formatPrice";

interface ShippingFormData {
  name: string;
  email: string;
  phone: string;
  subStoreLocation: string;
  province: string;
  district: string;
  city: string;
  streetAddress: string;
  saveInfo: boolean;
}

interface PaymentInfo {
  method: string;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
}

interface CardDetails {
  cardNumber: string;
  nameOnCard: string;
  expiryDate: string;
  cvv: string;
}

interface StoreLocation {
  id: string;
  locationName: string;
  address: string;
  phone: string;
  email?: string;
  isActive: boolean;
}

interface OrderReviewProps {
  cartItems: any[];
  shippingData: ShippingFormData;
  paymentInfo: PaymentInfo;
  cardDetails: CardDetails;
  paymentIcons: Record<string, string>;
  isProcessing: boolean;
  onEditShipping: () => void;
  onEditPayment: () => void;
  onPlaceOrder: () => void;
  finalTotal?: number;
  discount?: number;
  promoCode?: string;
}

export const OrderReview: React.FC<OrderReviewProps> = ({
  cartItems,
  shippingData,
  paymentInfo,
  cardDetails,
  paymentIcons,
  isProcessing,
  onEditShipping,
  onEditPayment,
  onPlaceOrder,
  finalTotal,
  discount = 0,
  promoCode = "",
}) => {
  // State for selected store (from cart)
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(
    null
  );

  // Load selected store from localStorage (set in cart page)
  useEffect(() => {
    const savedBranch = localStorage.getItem("selectedBranch");
    if (savedBranch) {
      try {
        const branch = JSON.parse(savedBranch);
        setSelectedStore(branch);
        console.log("Loaded selected store for order review:", branch);
      } catch (error) {
        console.error("Error loading selected store:", error);
      }
    }
  }, []);

  const getEstimatedItemPrice = (item: any): number => {
    // Helper function to safely convert price to number
    const parsePrice = (price: any): number => {
      if (typeof price === "number" && price > 0) {
        return price;
      }
      if (typeof price === "string" && price.trim() !== "") {
        const parsed = parseFloat(price);
        return !isNaN(parsed) && parsed > 0 ? parsed : 0;
      }
      return 0;
    };

    // Check item.price first
    let price = parsePrice(item.price);
    if (price > 0) return price;

    // Check item.finalPrice
    price = parsePrice(item.finalPrice);
    if (price > 0) return price;

    // Check item.product.finalPrice
    if (item.product) {
      price = parsePrice(item.product.finalPrice);
      if (price > 0) return price;

      // Check item.product.price
      price = parsePrice(item.product.price);
      if (price > 0) return price;
    }

    return 0;
  };

  const getProvinceName = (province: string) => {
    if (!province) return "";

    switch (province) {
      case "koshi":
        return "Koshi Province";
      case "province2":
        return "Madhesh Province";
      case "bagmati":
        return "Bagmati Province";
      case "gandaki":
        return "Gandaki Province";
      case "lumbini":
        return "Lumbini Province";
      case "karnali":
        return "Karnali Province";
      case "sudurpashchim":
        return "Sudurpashchim Province";
      default:
        return province;
    }
  };

  // Check if cart items are still loading
  const isCartLoading = !cartItems || cartItems.length === 0;

  // Check if shipping data is complete
  const isShippingComplete =
    shippingData?.name && shippingData?.email && shippingData?.phone;

  // Check if payment info is complete
  const isPaymentComplete =
    paymentInfo?.method &&
    (paymentInfo.method !== "credit_card" ||
      (cardDetails?.cardNumber && cardDetails?.nameOnCard));

  return (
    <div className="px-4 pb-4">
      {/* Loading State */}
      {isCartLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-green-600 animate-spin mr-2" />
          <span className="text-gray-600">Loading your order...</span>
        </div>
      ) : (
        <>
          {/* Order Items Review */}
          <div className="divide-y divide-gray-200 mb-6">
            {cartItems.map((item, index) => {
              const itemPrice = getEstimatedItemPrice(item);
              const itemQuantity = item.quantity || 1;
              const itemTotal = itemPrice * itemQuantity;

              return (
                <div
                  key={`${item.id || item.product_id || index}-${
                    item.color || "default"
                  }`}
                  className="py-4 flex items-center"
                >
                  <div className="relative">
                    <ProductImage
                      src={item.image || item.product?.image}
                      alt={item.name || item.product?.name || "Product"}
                      className="w-16 h-16 object-cover bg-gray-100 rounded-lg"
                    />
                    {itemPrice === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 rounded-lg">
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {item.name || item.product?.name || "Product"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.color && `Color: ${item.color}`}
                      {item.color && itemQuantity > 1 && ` · `}
                      {itemQuantity > 1 && `Qty: ${itemQuantity}`}
                    </p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {itemPrice > 0 ? (
                        `${formatPrice(itemTotal.toFixed(2))}`
                      ) : (
                        <span className="text-gray-400 flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Loading price...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Code Applied */}
          {promoCode && discount > 0 && (
            <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Tag className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">
                      Promo Code Applied: {promoCode}
                    </p>
                    <p className="text-sm text-green-700">
                      You saved {formatPrice(discount.toFixed(2))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Store Location Information */}
          {selectedStore && (
            <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  Selected Store Location
                </h4>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <p className="font-medium text-green-800">
                  {selectedStore.locationName}
                </p>
                <div className="flex items-center text-green-700">
                  <MapPin className="w-3 h-3 mr-2" />
                  <span>{selectedStore.address}</span>
                </div>
                <div className="flex items-center text-green-700">
                  <Phone className="w-3 h-3 mr-2" />
                  <span>{selectedStore.phone}</span>
                </div>
                {selectedStore.email && (
                  <div className="flex items-center text-green-700">
                    <Mail className="w-3 h-3 mr-2" />
                    <span>{selectedStore.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No store selected warning */}
          {!selectedStore && (
            <div className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 mr-2 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm text-yellow-800">
                  No store location selected. Please go back to cart and select
                  a store.
                </span>
              </div>
            </div>
          )}

          {/* Shipping Information Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">
                Shipping Information
              </h4>
              <button
                type="button"
                className="text-xs text-green-600 hover:text-green-500 font-medium hover:underline transition-colors"
                onClick={onEditShipping}
              >
                Edit
              </button>
            </div>
            {isShippingComplete ? (
              <div className="text-sm text-gray-700 space-y-1">
                <p className="font-medium">{shippingData.name}</p>
                <p>
                  {shippingData.email} | {shippingData.phone}
                </p>
                {shippingData.streetAddress && (
                  <p>{shippingData.streetAddress}</p>
                )}
                {shippingData.city && shippingData.district && (
                  <p>
                    {shippingData.city}, {shippingData.district}
                  </p>
                )}
                {shippingData.province && (
                  <p>{getProvinceName(shippingData.province)}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center text-amber-600">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">
                  Please complete shipping information
                </span>
              </div>
            )}
          </div>

          {/* Payment Method Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">Payment Method</h4>
              <button
                type="button"
                className="text-xs text-green-600 hover:text-green-500 font-medium hover:underline transition-colors"
                onClick={onEditPayment}
              >
                Edit
              </button>
            </div>
            <div className="text-sm text-gray-700">
              {paymentInfo.method === "credit_card" ? (
                <>
                  {cardDetails?.cardNumber ? (
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                      <span>
                        •••• {cardDetails.cardNumber.slice(-4)}
                        {cardDetails.expiryDate &&
                          ` (Expires: ${cardDetails.expiryDate})`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-600">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Please complete payment information</span>
                    </div>
                  )}
                </>
              ) : paymentInfo.method === "cod" ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded mr-2 flex items-center justify-center">
                    <span className="text-green-600 text-xs">💰</span>
                  </div>
                  <span>
                    Cash on Delivery - Pay when you receive your order
                  </span>
                </div>
              ) : paymentInfo.method === "paypal" ? (
                <div className="flex items-center">
                  <img
                    src={paymentIcons.paypal}
                    alt="PayPal"
                    className="h-4 mr-2"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span>PayPal</span>
                </div>
              ) : paymentInfo.method === "apple_pay" ? (
                <div className="flex items-center">
                  <img
                    src={paymentIcons.apple}
                    alt="Apple Pay"
                    className="h-4 mr-2"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span>Apple Pay</span>
                </div>
              ) : paymentInfo.method === "qr" ? (
                <div className="flex items-center">
                  <img
                    src={paymentIcons.apple}
                    alt="QR Pay"
                    className="h-4 mr-2"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span>QR</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>No payment method selected</span>
                </div>
              )}
            </div>
          </div>

          {/* Final Total Display */}
          {finalTotal && (
            <div className="bg-indigo-50 p-4 rounded-lg mb-6 border border-indigo-200">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  Total to Pay:
                </span>
                <span className="text-xl font-bold text-indigo-600">
                  {formatPrice(finalTotal.toFixed(2))}
                </span>
              </div>
              {discount > 0 && (
                <p className="text-sm text-indigo-600 mt-1">
                  Includes {formatPrice(discount.toFixed(2))} promo discount
                </p>
              )}
            </div>
          )}

          {/* Place Order Button */}
          <Button
            onClick={onPlaceOrder}
            className="w-full bg-green-600 hover:bg-green-700 py-3 text-lg font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              isProcessing ||
              !isShippingComplete ||
              !isPaymentComplete ||
              !selectedStore
            }
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Processing...
              </>
            ) : (
              "Place Order"
            )}
          </Button>

          {/* Warning messages */}
          {(!isShippingComplete || !isPaymentComplete || !selectedStore) && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                Please complete all required information before placing your
                order.
                {!selectedStore &&
                  " Make sure to select a store location in the cart."}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
