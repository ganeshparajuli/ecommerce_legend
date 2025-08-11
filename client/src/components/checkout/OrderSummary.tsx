import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { ProductImage } from "../../utils/imageHelper";
import { PromoCodeInput } from "./PromoCodeInput";
import type { RootState } from "../../redux/store";

interface OrderSummaryProps {
  cartItems: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  finalTotal: number;
  selectedPayment?: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  cartItems,
  subtotal: parentSubtotal,
  shipping,
  tax,
  finalTotal: parentFinalTotal,
  selectedPayment = "cod",
}) => {
  const [calculatedSubtotal, setCalculatedSubtotal] = useState(0);
  const [isCalculating, setIsCalculating] = useState(true);

  // Get promo state from Redux with safe defaults
  const {
    isPromoApplied = false,
    promoCode = "",
    discount: rawDiscount = 0,
  } = useSelector(
    (state: RootState) =>
      state.promo || {
        isPromoApplied: false,
        promoCode: "",
        discount: 0,
      }
  );

  // Safe discount calculation - FIXED THE MAIN ISSUE
  const getSafeDiscount = (discount: any): number => {
    if (typeof discount === "number" && !isNaN(discount)) {
      return Math.max(0, discount); // Ensure non-negative
    }
    if (typeof discount === "string") {
      const parsed = parseFloat(discount);
      return isNaN(parsed) ? 0 : Math.max(0, parsed);
    }
    return 0; // Default to 0 for null, undefined, etc.
  };

  const discount = getSafeDiscount(rawDiscount);

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

  // Calculate our own subtotal to verify parent calculation
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      setIsCalculating(true);

      const calculated = cartItems.reduce((total, item) => {
        const itemPrice = getEstimatedItemPrice(item);
        const quantity = item.quantity || 1;
        const itemTotal = itemPrice * quantity;

        console.log(
          `OrderSummary calculation - Item: ${
            item.name || item.product?.name
          }, Price: ${itemPrice}, Qty: ${quantity}, Total: ${itemTotal}`
        );

        return total + itemTotal;
      }, 0);

      setCalculatedSubtotal(calculated);
      setIsCalculating(false);

      console.log("OrderSummary Debug:", {
        parentSubtotal,
        calculatedSubtotal: calculated,
        shipping,
        tax,
        parentFinalTotal,
        calculatedFinalTotal: calculated + shipping + tax,
        cartItemsCount: cartItems.length,
        discount: discount, // Now safe to log
        isPromoApplied,
        promoCode,
      });

      // Log if there's a significant difference
      if (Math.abs(calculated - parentSubtotal) > 0.01) {
        console.warn("⚠️ Subtotal mismatch!", {
          "Parent subtotal": parentSubtotal,
          "Calculated subtotal": calculated,
          Difference: Math.abs(calculated - parentSubtotal),
        });
      }
    }
  }, [
    cartItems,
    parentSubtotal,
    shipping,
    tax,
    discount,
    isPromoApplied,
    promoCode,
  ]);

  // Use calculated subtotal if it's different from parent, otherwise use parent
  const displaySubtotal =
    Math.abs(calculatedSubtotal - parentSubtotal) > 0.01 &&
    calculatedSubtotal > 0
      ? calculatedSubtotal
      : parentSubtotal;

  // Calculate totals with promo discount
  const subtotalAfterDiscount =
    displaySubtotal - (isPromoApplied ? discount : 0);
  const displayFinalTotal = subtotalAfterDiscount + shipping + tax;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-24">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

      {/* Cart Items Mini List */}
      <div className="mb-6">
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {cartItems.map((item, index) => {
            const itemPrice = getEstimatedItemPrice(item);
            const itemQuantity = item.quantity || 1;
            const itemTotal = itemPrice * itemQuantity;

            return (
              <div
                key={`${item.id || item.product_id || index}-summary`}
                className="flex items-center space-x-3"
              >
                <div className="flex-shrink-0">
                  <ProductImage
                    src={item.image || item.product?.image}
                    alt={item.name || item.product?.name || "Product"}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {item.name || item.product?.name || "Product"}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Qty: {itemQuantity}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {itemPrice > 0 ? (
                        `Rs. ${itemTotal.toFixed(2)}`
                      ) : (
                        <span className="text-gray-400 flex items-center">
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          Loading...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Promo Code Section - Place it here! */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <PromoCodeInput
          isPromoApplied={isPromoApplied}
          promoCode={promoCode}
          discount={discount}
        />
      </div>

      {/* Order Totals */}
      <div className="space-y-3 border-t border-gray-200 pt-4">
        <div className="flex justify-between py-1">
          <span className="text-gray-600 font-medium">Subtotal</span>
          <span className="text-gray-900 font-semibold">
            {isCalculating ? (
              <span className="flex items-center">
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Calculating...
              </span>
            ) : (
              `Rs. ${displaySubtotal.toFixed(2)}`
            )}
          </span>
        </div>

        {/* Show discount row if promo is applied - FIXED THE ERROR HERE */}
        {isPromoApplied && discount > 0 && (
          <div className="flex justify-between py-1 text-green-600">
            <span className="font-medium">Promo Discount ({promoCode})</span>
            <span className="font-semibold">-Rs. {discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between py-1">
          <span className="text-gray-600 font-medium">Shipping</span>
          <span className="text-gray-900 font-semibold">
            {shipping === 0 ? "Free" : `Rs. ${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-gray-600 font-medium">Tax (13%)</span>
          <span className="text-gray-900 font-semibold">
            Rs. {tax.toFixed(2)}
          </span>
        </div>
        <div className="pt-3 border-t border-gray-200">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-xl font-bold text-green-600">
              {isCalculating ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Calculating...
                </span>
              ) : (
                `Rs. ${displayFinalTotal.toFixed(2)}`
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {selectedPayment === "cod" && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Cash on Delivery:</strong> Additional Rs. 500 delivery
            charge applies.
          </p>
        </div>
      )}

      {/* Warning for price mismatch */}
      {Math.abs(calculatedSubtotal - parentSubtotal) > 0.01 &&
        calculatedSubtotal > 0 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-xs text-orange-800">
              <strong>Price Recalculated:</strong> We've updated the total based
              on current item prices.
            </p>
          </div>
        )}

      {/* Continue Shopping Link */}
      <div className="mt-6 text-center">
        <Link
          to="/products"
          className="text-green-600 hover:text-green-700 font-medium hover:underline transition-all duration-300"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
