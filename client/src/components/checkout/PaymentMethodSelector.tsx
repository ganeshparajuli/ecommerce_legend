import React, { useEffect, useCallback, useRef, useState } from "react";
import { MessageCircle } from "lucide-react"; // WhatsApp icon

interface PaymentInfo {
  method: string;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
}

interface PaymentMethodSelectorProps {
  paymentInfo: PaymentInfo;
  updatePaymentInfo: (updates: Partial<PaymentInfo>) => void;
  setPaymentMethod: (method: string) => void;
  paymentIcons: Record<string, string>;
  onValidationChange?: (errors: string[]) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentInfo,
  updatePaymentInfo,
  setPaymentMethod,
  paymentIcons,
  onValidationChange,
}) => {
  const hasSetInitialMethod = useRef(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // WhatsApp configuration
  const WHATSAPP_NUMBER = "9851343371";
  const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

  useEffect(() => {
    if (!hasSetInitialMethod.current && paymentInfo && paymentInfo.method) {
      console.log("Initial sync from Redux:", paymentInfo.method);
      setPaymentMethod(paymentInfo.method);
      hasSetInitialMethod.current = true;
    }
  }, [paymentInfo, setPaymentMethod]);

  const handleMethodSelect = (method: string) => {
    console.log("User selected payment method:", method);

    if (paymentInfo.method === method) return;

    updatePaymentInfo({ method });
    setPaymentMethod(method);

    if (method !== "credit_card" && onValidationChange) {
      onValidationChange([]);
    }
  };

  const handleValidationChange = useCallback(
    (errors: string[]) => {
      if (onValidationChange) {
        onValidationChange(errors);
      }
    },
    [onValidationChange]
  );

  useEffect(() => {
    if (paymentInfo && paymentInfo.method && setPaymentMethod) {
      console.log("Syncing payment method from Redux:", paymentInfo.method);
      setPaymentMethod(paymentInfo.method);
    }
  }, [paymentInfo, setPaymentMethod]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsQRModalOpen(false);
      }
    };

    if (isQRModalOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isQRModalOpen]);

  const openQRModal = () => {
    setIsQRModalOpen(true);
  };

  const closeQRModal = () => {
    setIsQRModalOpen(false);
  };

  // Function to open WhatsApp with pre-filled message
  const openWhatsAppForPayment = () => {
    const message = encodeURIComponent(
      "Hi! I have made a payment via QR code for my order. I'm sending you the payment receipt screenshot for confirmation. Thank you!"
    );
    const whatsappURL = `${WHATSAPP_URL}?text=${message}`;
    window.open(whatsappURL, "_blank");
  };

  // Function to open WhatsApp chat
  const openWhatsAppChat = () => {
    window.open(WHATSAPP_URL, "_blank");
  };

  // Generate QR code data (you can customize this based on your payment gateway)
  const generateQRData = () => {
    // This would typically include payment details like amount, merchant ID, etc.
    // For demo purposes, using a simple string - replace with actual payment data
    const paymentData = {
      merchant: "YourMerchantName",
      amount: "100.00", // You'd get this from your order total
      currency: "USD",
      orderId: "ORDER123", // You'd get this from your order
    };
    return `payment:${JSON.stringify(paymentData)}`;
  };

  return (
    <div className="px-4 pb-4">
      {/* Cash on Delivery Option - Styled to match Cart.tsx */}
      <div className="p-4 border border-gray-300 rounded-lg bg-white mb-4">
        <div className="flex items-center">
          <input
            type="radio"
            id="cod"
            name="payment"
            value="cod"
            checked={paymentInfo.method === "cod"}
            onChange={() => handleMethodSelect("cod")}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="ml-3">
            <label htmlFor="cod" className="font-semibold text-gray-900">
              Cash on Delivery
            </label>
            <p className="text-sm text-gray-600">
              Pay when you receive your order
            </p>
          </div>
        </div>
      </div>

      {/* COD Instructions */}
      {paymentInfo.method === "cod" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-4">
          <p className="text-sm text-green-800">
            You'll pay for your order when it arrives. Please have the exact
            amount ready.
          </p>
        </div>
      )}

      {/* QR Payment Option */}
      <div className="p-4 border border-gray-300 rounded-lg bg-white mb-4">
        <div className="flex items-center">
          <input
            type="radio"
            id="qr"
            name="payment"
            value="qr"
            checked={paymentInfo.method === "qr"}
            onChange={() => handleMethodSelect("qr")}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
          />
          <div className="ml-3 flex-1">
            <label htmlFor="qr" className="font-semibold text-gray-900">
              QR Code Payment
            </label>
            <p className="text-sm text-gray-600">
              Scan QR code to pay with your mobile wallet
            </p>
          </div>
          {/* WhatsApp Chat Icon - Always visible but more prominent when QR is selected */}
          <div className="ml-3">
            <button
              onClick={openWhatsAppChat}
              className={`p-2 rounded-full transition-all duration-200 ${
                paymentInfo.method === "qr"
                  ? "bg-green-500 hover:bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Display */}
      {paymentInfo.method === "qr" && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mt-4">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Scan to pay with FonePay
            </p>
            <div className="flex justify-center">
              <div
                className="w-40 h-40 bg-white border border-gray-300 rounded-lg p-1 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={openQRModal}
                title="Click to enlarge QR code"
              >
                <img
                  src="/joyqr.jpg"
                  alt="FonePay QR Code"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Click to enlarge</p>
          </div>

          {/* WhatsApp Payment Instructions */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">
                  📱 Payment Confirmation Required
                </h4>
                <p className="text-sm text-blue-800 mb-3">
                  After completing your payment via QR code, please send your
                  payment receipt screenshot to our WhatsApp for order
                  confirmation.
                </p>
                <button
                  onClick={openWhatsAppForPayment}
                  className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Payment Receipt
                </button>
              </div>
            </div>
          </div>

          {/* Additional Instructions */}
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Your order will be processed only
              after we receive and verify your payment receipt via WhatsApp.
              This helps us confirm your payment and ensures faster order
              processing.
            </p>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQRModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4 relative">
            {/* Close button */}
            <button
              onClick={closeQRModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
              title="Close"
            >
              ×
            </button>

            {/* Modal content */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                FonePay QR Code
              </h3>
              <div className="flex justify-center mb-4">
                <div className="w-64 h-64 bg-white border border-gray-300 rounded-lg p-2">
                  <img
                    src="/joyqr.jpg"
                    alt="FonePay QR Code"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Open your FonePay app and scan this QR code
              </p>
              <p className="text-xs text-gray-500 mb-4">
                JOY STORE PRIVATE LIMITED
              </p>

              {/* WhatsApp Button in Modal */}
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-600 mb-3">
                  After payment, send receipt via WhatsApp:
                </p>
                <button
                  onClick={openWhatsAppForPayment}
                  className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Chat Button - Alternative positioning */}
      {paymentInfo.method === "qr" && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={openWhatsAppChat}
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 pulse-animation"
            title="Chat on WhatsApp for support"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      )}

      <style jsx>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
      `}</style>
    </div>
  );
};
