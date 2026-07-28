import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, Tag, X } from "lucide-react";
import {
  applyPromoCode,
  removePromoCode,
} from "../../redux/actions/promoAction";
import type { RootState } from "../../redux/store";

interface PromoCodeInputProps {
  isPromoApplied: boolean;
  promoCode: string;
  discount: number;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  isPromoApplied,
  promoCode,
  discount,
}) => {
  const dispatch = useDispatch();
  const [code, setCode] = useState(promoCode || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get cart total from Redux
  const { cartItems, total: cartTotal } = useSelector(
    (state: RootState) => state.cart
  );

  // Calculate cart total if not available
  const calculateCartTotal = () => {
    if (cartTotal && cartTotal > 0) {
      return cartTotal;
    }

    if (cartItems && cartItems.length > 0) {
      return cartItems.reduce((total, item) => {
        return total + (item.price || 0) * (item.quantity || 1);
      }, 0);
    }

    return 0;
  };

  const handleApplyCode = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // CRITICAL: Prevent form submission
    e.preventDefault();
    e.stopPropagation();

    if (!code.trim()) {
      setError("Please enter a promo code");
      return;
    }

    const currentCartTotal = calculateCartTotal();

    if (currentCartTotal <= 0) {
      setError(
        "Your cart is empty. Please add items before applying a promo code."
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Pass the cart total to the action
      const result = await dispatch(
        applyPromoCode(code, currentCartTotal) as any
      );

      if (result && result.valid) {
        setIsLoading(false);
        console.log("Promo code applied successfully:", code);
      } else {
        setError(result?.message || "Invalid promo code");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Invalid promo code");
      setIsLoading(false);
      console.error("Promo code application failed:", err);
    }
  };

  const handleRemoveCode = (e: React.MouseEvent<HTMLButtonElement>) => {
    // CRITICAL: Prevent form submission
    e.preventDefault();
    e.stopPropagation();

    const currentCartTotal = calculateCartTotal();
    dispatch(removePromoCode(currentCartTotal));
    setCode("");
    setError("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
    if (error) setError(""); // Clear error when user types
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission on Enter
      if (!isLoading && code.trim()) {
        handleApplyCode(e as any);
      }
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 flex items-center">
          <Tag className="w-4 h-4 mr-1 text-green-600" />
          Promo Code
        </h3>
      </div>

      {isPromoApplied ? (
        <div className="bg-green-50 rounded-lg p-3 flex justify-between items-center border border-green-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Tag className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">{promoCode}</p>
              <p className="text-xs text-green-700">
                -Rs. {discount.toFixed(2)} applied
              </p>
            </div>
          </div>
          <button
            type="button" // CRITICAL: Explicitly set type to button
            onClick={handleRemoveCode}
            className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
            title="Remove promo code"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
            <input
              type="text"
              value={code}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Enter promo code (e.g., SAVE20)"
              className="flex-1 px-3 py-2 bg-white text-gray-900 placeholder-gray-500 focus:outline-none"
              disabled={isLoading}
            />
            <button
              type="button" // CRITICAL: Explicitly set type to button
              onClick={handleApplyCode}
              disabled={isLoading || !code.trim()}
              className="bg-green-600 text-white px-4 py-2 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  <span className="text-sm">Applying...</span>
                </>
              ) : (
                <span className="text-sm font-medium">Apply</span>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-600 flex items-center">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Sample codes hint */}
          <div className="mt-2 text-xs text-gray-500">
            Try: SAVE10, SAVE20, FLAT100, or WELCOME
          </div>
        </div>
      )}
    </div>
  );
};
