import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import PageLayout from "../../components/PageLayout";
import {
  updateShippingInfo,
  updatePaymentMethod,
  updateCardDetails,
  calculateOrderTotals,
  processCheckout,
  resetCheckout,
} from "../../redux/actions/checkoutAction";
import { getCart } from "../../redux/actions/cartAction";
import type { RootState } from "../../redux/store";
import type {
  ShippingInfo,
  CardDetails,
} from "../../redux/constants/checkoutConstants";

// Import your components
import { ShippingForm } from "../../components/checkout/ShippingForm";
import { PaymentMethodSelector } from "../../components/checkout/PaymentMethodSelector";
import { OrderReview } from "../../components/checkout/OrderReview";
import { OrderSummary } from "../../components/checkout/OrderSummary";
import { CheckoutSection } from "../../components/checkout/CheckoutSection";
import { OrderComplete } from "../../components/checkout/OrderComplete";
import { EmptyCart } from "../../components/checkout/EmptyCart";
import { TrustBadges } from "../../components/checkout/TrustBadges";
import { DeliveryInfo } from "../../components/checkout/DeliveryInfo";

// Payment method icons
const PaymentMethodIcons = {
  visa: "/visa.svg",
  mastercard: "/mastercard.svg",
  paypal: "/paypal.svg",
  apple: "/apple-pay.svg",
};

const getEstimatedItemPrice = (item: any): number => {
  console.log("🔍 Getting price for item:", {
    itemName: item.name || item.product?.name,
    itemPrice: item.price,
    itemFinalPrice: item.finalPrice,
    productPrice: item.product?.price,
    productFinalPrice: item.product?.finalPrice,
    fullItem: item,
  });

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
  if (price > 0) {
    console.log("✅ Using item.price:", price);
    return price;
  }

  // Check item.finalPrice
  price = parsePrice(item.finalPrice);
  if (price > 0) {
    console.log("✅ Using item.finalPrice:", price);
    return price;
  }

  // Check item.product.finalPrice
  if (item.product) {
    price = parsePrice(item.product.finalPrice);
    if (price > 0) {
      console.log("✅ Using item.product.finalPrice:", price);
      return price;
    }

    // Check item.product.price
    price = parsePrice(item.product.price);
    if (price > 0) {
      console.log("✅ Using item.product.price:", price);
      return price;
    }
  }

  console.warn(
    "❌ No valid price found for item:",
    item.name || item.product?.name || "Unknown item"
  );
  return 0;
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [savedOrderData, setSavedOrderData] = useState(null);

  // Get data from Redux
  const {
    cartItems,
    total: cartTotal,
    loading: cartLoading,
  } = useSelector((state: RootState) => state.cart);
  const {
    loading,
    error: checkoutError,
    paymentInfo = { method: "credit_card" },
  } = useSelector((state: RootState) => state.checkout);
  const { user } = useSelector((state: RootState) => state.user);

  // Get promo state from Redux - IMPORTANT!
  const {
    isPromoApplied = false,
    promoCode = "",
    discount: promoDiscount = 0,
  } = useSelector(
    (state: RootState) =>
      state.promo || {
        isPromoApplied: false,
        promoCode: "",
        discount: 0,
      }
  );

  // Log promo state for debugging

  // Function to update payment info
  const handlePaymentInfoUpdate = (updates: Partial<PaymentInfo>) => {
    dispatch(updateCardDetails(updates));
  };

  // Loading states
  const [isInitializing, setIsInitializing] = useState(true);
  const [dataReady, setDataReady] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: "/checkout" } });
    }
  }, [user, navigate]);

  // Initialize cart and check data readiness
  useEffect(() => {
    const initializeCheckout = async () => {
      if (user) {
        setIsInitializing(true);
        try {
          // Make sure cart is loaded
          if (!cartItems || cartItems.length === 0) {
            await dispatch(getCart() as any);
          }

          // Small delay to ensure data is fully loaded
          setTimeout(() => {
            setIsInitializing(false);
            setDataReady(true);
          }, 500);
        } catch (error) {
          console.error("Error initializing checkout:", error);
          setIsInitializing(false);
        }
      }
    };

    initializeCheckout();
  }, [dispatch, user]);

  // Monitor cart items changes
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      console.log("📦 Cart Items Analysis:", cartItems);
      cartItems?.forEach((item, index) => {
        console.log(`📋 Item ${index}:`, {
          item,
          calculatedPrice: getEstimatedItemPrice(item),
          hasProduct: !!item.product,
          productPrice: item.product?.finalPrice || item.product?.price,
        });
      });

      // Mark data as ready when cart items are loaded
      if (!dataReady && !isInitializing) {
        setDataReady(true);
      }
    }
  }, [cartItems, dataReady, isInitializing]);

  // Form states
  const [formData, setFormData] = useState<ShippingInfo>({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    streetAddress: user?.address || "",
    storeLocation: "",
    province: "",
    district: "",
    city: "",
    saveInfo: true,
  });

  // Load selected branch from localStorage
  useEffect(() => {
    const savedBranch = localStorage.getItem("selectedBranch");
    if (savedBranch) {
      try {
        const branch = JSON.parse(savedBranch);
        setFormData((prev) => ({
          ...prev,
          storeLocation: branch.id || "",
        }));
      } catch (error) {
        console.error("Error loading saved branch:", error);
      }
    }
  }, []);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    nameOnCard: "",
    expiryDate: "",
    cvv: "",
  });
  const [initializedPaymentMethod, setInitializedPaymentMethod] =
    useState(false);

  useEffect(() => {
    // Only run once initially to set the payment method from Redux
    if (!initializedPaymentMethod && paymentInfo && paymentInfo.method) {
      console.log(
        "Initial payment method sync from Redux:",
        paymentInfo.method
      );
      setPaymentMethod(paymentInfo.method);
      setInitializedPaymentMethod(true);
    }
  }, [paymentInfo, initializedPaymentMethod]);

  useEffect(() => {
    console.log("Payment method in component state:", paymentMethod);
  }, [paymentMethod]);

  // UI states
  const [expandedSection, setExpandedSection] = useState("shipping");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [cardValidationErrors, setCardValidationErrors] = useState<string[]>(
    []
  );

  const handleValidationChange = (errors: string[]) => {
    setCardValidationErrors(errors);
    console.log("Credit Card Validation Errors:", errors);
  };

  // 🎯 IMPROVED CALCULATION LOGIC WITH PROMO DISCOUNT
  const calculateTotals = () => {
    // Don't calculate if order is complete or cart is being cleared
    if (orderComplete) {
      console.log("🛑 Skipping calculation - order is complete");
      return {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        finalTotal: 0,
        discount: 0,
        subtotalAfterDiscount: 0,
      };
    }

    // Don't calculate if cart is empty and we're not in a loading state
    if (
      (!cartItems || cartItems.length === 0) &&
      !cartLoading &&
      !isInitializing
    ) {
      console.log("🛑 Skipping calculation - cart is empty and not loading");
      return {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        finalTotal: 0,
        discount: 0,
        subtotalAfterDiscount: 0,
      };
    }

    console.log("💰 Starting total calculation...");

    // Method 1: Try Redux total first
    const reduxTotal = cartTotal || 0;

    // Method 2: Calculate manually
    let manualSubtotal = 0;
    if (cartItems && cartItems.length > 0) {
      manualSubtotal = cartItems.reduce((total, item, index) => {
        const itemPrice = getEstimatedItemPrice(item);
        const quantity = item.quantity || 1;
        const itemTotal = itemPrice * quantity;

        console.log(`💵 Item ${index} calculation:`, {
          name: item.name || item.product?.name,
          price: itemPrice,
          quantity,
          itemTotal,
          runningTotal: total + itemTotal,
        });

        return total + itemTotal;
      }, 0);
    }

    // Choose the best total
    let bestSubtotal = 0;
    if (manualSubtotal > 0 && reduxTotal > 0) {
      bestSubtotal = Math.max(manualSubtotal, reduxTotal);
      console.log("🔄 Using higher of manual vs Redux:", {
        manualSubtotal,
        reduxTotal,
        chosen: bestSubtotal,
      });
    } else if (manualSubtotal > 0) {
      bestSubtotal = manualSubtotal;
      console.log("✅ Using manual calculation:", bestSubtotal);
    } else if (reduxTotal > 0) {
      bestSubtotal = reduxTotal;
      console.log("✅ Using Redux total:", bestSubtotal);
    } else {
      console.warn("⚠️ No valid subtotal found!");
      // Return zeros instead of continuing with invalid data
      return {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        finalTotal: 0,
        discount: 0,
        subtotalAfterDiscount: 0,
      };
    }

    // Apply promo discount if active - ADD SAFETY CHECKS
    const safePromoDiscount = Number(promoDiscount) || 0;
    const discountAmount = isPromoApplied ? Math.max(0, safePromoDiscount) : 0;
    const subtotalAfterDiscount = Math.max(0, bestSubtotal - discountAmount);

    const shipping = 200;
    const tax = 0;
    const finalTotal = subtotalAfterDiscount + shipping + tax;

    console.log("📊 Final Calculation Result:", {
      subtotal: bestSubtotal,
      promoDiscount: safePromoDiscount,
      discountAmount,
      subtotalAfterDiscount,
      shipping,
      tax,
      finalTotal,
      reduxTotal,
      manualSubtotal,
      cartItemsCount: cartItems?.length || 0,
      isPromoApplied,
      promoCode,
    });

    return {
      subtotal: bestSubtotal,
      shipping,
      tax,
      finalTotal,
      discount: discountAmount,
      subtotalAfterDiscount,
    };
  };
  // Use the improved calculation
  const {
    subtotal,
    shipping,
    tax,
    finalTotal,
    discount,
    subtotalAfterDiscount,
  } = calculateTotals();

  // Debug log the values being passed to OrderSummary

  // Update checkout totals when cart changes
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      dispatch(calculateOrderTotals(cartItems) as any);
    }
  }, [cartItems, dispatch]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handlePaymentMethodChange = (method: string) => {
    // Skip if method isn't changing
    if (method === paymentMethod) return;

    console.log("Changing payment method to:", method);

    // Update local state
    setPaymentMethod(method);

    // Update Redux - use the action creator directly
    dispatch(updatePaymentMethod(method) as any);

    // Clear validation errors when switching to non-credit card payment
    if (method !== "credit_card") {
      setCardValidationErrors([]);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // CRITICAL: Capture current order data BEFORE processing checkout
      const currentTotals = calculateTotals();

      // Enhanced item data with explicit price information
      const itemsWithPrices = (cartItems || []).map((item) => ({
        ...item,
        // Ensure price is explicitly set using the same logic as calculation
        price: getEstimatedItemPrice(item),
        finalPrice: getEstimatedItemPrice(item),
        // Keep original data structure but add calculated price
        calculatedPrice: getEstimatedItemPrice(item),
      }));

      const orderDataToSave = {
        items: itemsWithPrices,
        subtotal: currentTotals.subtotal,
        shipping: currentTotals.shipping,
        tax: currentTotals.tax,
        finalTotal: currentTotals.finalTotal,
        discount: currentTotals.discount,
        subtotalAfterDiscount: currentTotals.subtotalAfterDiscount,
        promoCode: isPromoApplied ? promoCode : null,
        isPromoApplied,
        paymentMethod,
        timestamp: new Date().toISOString(),
      };

      // Save to localStorage BEFORE processing checkout
      localStorage.setItem("lastOrderData", JSON.stringify(orderDataToSave));
      console.log("💾 Saved order data to localStorage:", orderDataToSave);

      // Also save to state for immediate use
      setSavedOrderData(orderDataToSave);

      // IMPORTANT: Log the payment method and promo details before submission
      console.log("Submitting order with:", {
        paymentMethod,
        isPromoApplied,
        promoCode,
        promoDiscount,
        finalTotal: currentTotals.finalTotal, // Use calculated total
      });

      // First update shipping info in Redux
      await dispatch(updateShippingInfo(formData) as any);

      // IMPORTANT: Make sure we're using the correct payment method from component state
      // This is critical - explicitly update payment method right before checkout
      await dispatch(updatePaymentMethod(paymentMethod) as any);

      // Double-check the payment method is set correctly
      console.log("Payment method confirmed as:", paymentMethod);

      // Only validate card details if credit card is selected
      if (paymentMethod === "credit_card") {
        if (cardValidationErrors.length > 0) {
          setIsProcessing(false);
          alert(
            `Please fix the credit card errors: ${cardValidationErrors[0]}`
          );
          return;
        }

        // Update card details in Redux
        if (cardDetails && Object.keys(cardDetails).length > 0) {
          const processedCardDetails = {
            ...cardDetails,
            cardNumber: cardDetails.cardNumber?.replace(/\s/g, "") || "",
          };
          await dispatch(updateCardDetails(processedCardDetails) as any);
        }
      }

      // Process checkout (this will include promo details from Redux state)
      const result = await dispatch(processCheckout() as any);

      if (result === true) {
        setOrderComplete(true);
        setOrderId("order-" + new Date().getTime()); // Temporary ID if needed
        dispatch(resetCheckout() as any);
      } else {
        console.error("Checkout failed:", result);
        alert(`Checkout failed. Please try again.`);
        // Clear saved data if checkout failed
        localStorage.removeItem("lastOrderData");
        setSavedOrderData(null);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "An unexpected error occurred";
      alert(`Error processing your order: ${errorMessage}`);
      // Clear saved data if checkout failed
      localStorage.removeItem("lastOrderData");
      setSavedOrderData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Show loading state while initializing

  if (isInitializing || cartLoading) {
    return (
      <PageLayout backgroundColor="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="inline-block p-6 rounded-2xl bg-white backdrop-blur-sm border border-gray-200 shadow-2xl mb-6">
              <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto" />
            </div>
            <p className="text-gray-600 text-lg font-medium">
              Preparing your checkout...
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // If no items in cart, redirect to cart page
  if ((!cartItems || cartItems.length === 0) && !orderComplete) {
    return (
      <PageLayout backgroundColor="bg-white">
        <EmptyCart />
      </PageLayout>
    );
  }

  if (orderComplete) {
    const orderDataForComplete = savedOrderData || {
      finalTotal: 0,
      discount: 0,
      promoCode: null,
    };

    return (
      <PageLayout backgroundColor="bg-white">
        <OrderComplete
          orderId={orderId}
          finalTotal={orderDataForComplete.finalTotal}
          paymentMethod={paymentMethod}
          promoCode={orderDataForComplete.promoCode}
          discount={orderDataForComplete.discount}
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout backgroundColor="bg-white">
      <div className="max-w-7xl mx-auto mt-20 px-4 sm:px-6 lg:px-8 py-8">
        {/* Checkout Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/cart")}
              className="flex items-center text-gray-600 hover:text-green-600 mb-2 bg-white px-3 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back to cart</span>
            </button>
            <h1 className="text-3xl sm:text-4xl font-bold text-black">
              Secure Checkout
            </h1>
          </div>

          <div className="hidden sm:flex items-center mt-4 sm:mt-0 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-200">
            <ShieldCheck className="h-6 w-6 text-green-600 mr-2" />
            <span className="text-sm text-gray-700 font-medium">
              256-bit SSL Encryption
            </span>
          </div>
        </div>

        {/* Debug Information (only in development) */}

        {/* Error Display */}
        {checkoutError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 text-red-800 shadow-xl">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <p className="font-medium">{checkoutError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Enhanced sections with clean white design */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Shipping Address Section */}
                <CheckoutSection
                  title="Shipping Information"
                  number={1}
                  isExpanded={expandedSection === "shipping"}
                  onToggle={() => toggleSection("shipping")}
                >
                  <ShippingForm
                    formData={formData}
                    onChange={handleInputChange}
                  />
                  <div className="p-6 pt-0 flex justify-end">
                    <button
                      type="button"
                      className="text-green-600 hover:text-green-500 flex items-center bg-green-50 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => toggleSection("payment")}
                    >
                      <span className="font-medium">Continue to Payment</span>
                      <ChevronDown className="h-5 w-5 ml-1 transform rotate-270" />
                    </button>
                  </div>
                </CheckoutSection>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Payment Method Section */}
                <CheckoutSection
                  title="Payment Method"
                  number={2}
                  isExpanded={expandedSection === "payment"}
                  onToggle={() => toggleSection("payment")}
                >
                  <PaymentMethodSelector
                    paymentInfo={paymentInfo}
                    updatePaymentInfo={handlePaymentInfoUpdate}
                    setPaymentMethod={handlePaymentMethodChange}
                    paymentIcons={PaymentMethodIcons}
                    onValidationChange={handleValidationChange}
                  />
                  <div className="p-6 pt-0 flex justify-between">
                    <button
                      type="button"
                      className="text-gray-600 hover:text-black flex items-center bg-gray-50 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => toggleSection("shipping")}
                    >
                      <ChevronUp className="h-5 w-5 mr-1 transform rotate-90" />
                      <span className="font-medium">Back to Shipping</span>
                    </button>

                    <button
                      type="button"
                      className="text-green-600 hover:text-green-500 flex items-center bg-green-50 px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={() => toggleSection("review")}
                    >
                      <span className="font-medium">Review Order</span>
                      <ChevronDown className="h-5 w-5 ml-1 transform rotate-270" />
                    </button>
                  </div>
                </CheckoutSection>
              </div>

              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Review Order Section */}
                <CheckoutSection
                  title="Review Order"
                  number={3}
                  isExpanded={expandedSection === "review"}
                  onToggle={() => toggleSection("review")}
                >
                  {dataReady ? (
                    <OrderReview
                      cartItems={cartItems || []}
                      shippingData={formData}
                      paymentInfo={{ method: paymentMethod }}
                      cardDetails={cardDetails}
                      paymentIcons={PaymentMethodIcons}
                      isProcessing={isProcessing}
                      onEditShipping={() => toggleSection("shipping")}
                      onEditPayment={() => toggleSection("payment")}
                      onPlaceOrder={handleSubmit}
                      finalTotal={finalTotal}
                      discount={isPromoApplied ? discount : 0}
                      promoCode={isPromoApplied ? promoCode : ""}
                    />
                  ) : (
                    <div className="p-6 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-green-600 animate-spin mr-2" />
                      <span className="text-gray-600">
                        Loading order details...
                      </span>
                    </div>
                  )}
                </CheckoutSection>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
                  <OrderSummary
                    cartItems={cartItems || []}
                    subtotal={subtotal}
                    shipping={shipping}
                    tax={tax}
                    finalTotal={finalTotal}
                    selectedPayment={paymentMethod}
                    discount={discount} // ← ADD THIS
                    isPromoApplied={isPromoApplied} // ← ADD THIS
                    promoCode={promoCode} // ← ADD THIS
                  />
                </div>

                {/* Enhanced Trust Badges */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
                  <TrustBadges paymentIcons={PaymentMethodIcons} />
                </div>

                {/* Enhanced Delivery Information */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
                  <DeliveryInfo />
                </div>

                {/* Need Help */}
                <div className="text-center bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">
                    Need help?{" "}
                    <a
                      href="#"
                      className="text-green-600 hover:text-green-500 font-medium hover:underline transition-all duration-300"
                    >
                      Contact our support team
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default Checkout;
