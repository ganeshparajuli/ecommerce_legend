import React, { useState, useEffect, useRef } from "react";
import { Lock } from "lucide-react";

interface PaymentInfo {
  method: string;
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
}

interface CreditCardInputProps {
  paymentInfo: PaymentInfo;
  onChange: (updates: Partial<PaymentInfo>) => void;
  paymentIcons: Record<string, string>;
  onValidationChange?: (errors: string[]) => void;
}

export const CreditCardInput: React.FC<CreditCardInputProps> = ({
  paymentInfo = { method: "credit_card" },
  onChange,
  paymentIcons,
  onValidationChange,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cardType, setCardType] = useState<string>("");

  // Use a ref instead of state to avoid re-renders
  const prevErrorsRef = useRef<string>("");

  // Real-time card type detection
  useEffect(() => {
    if (!paymentInfo) return;

    const number = paymentInfo.cardNumber?.replace(/\s/g, "") || "";

    if (/^4/.test(number)) setCardType("visa");
    else if (/^5[1-5]/.test(number)) setCardType("mastercard");
    else if (/^3[47]/.test(number)) setCardType("amex");
    else if (/^6(?:011|5)/.test(number)) setCardType("discover");
    else setCardType("");
  }, [paymentInfo?.cardNumber]);

  // Send validation errors to parent component
  useEffect(() => {
    // Skip if no validation handler provided
    if (!onValidationChange) return;

    // Convert errors to string for comparison
    const currentErrorsString = JSON.stringify(errors);

    // Only update if errors have changed
    if (currentErrorsString !== prevErrorsRef.current) {
      // Update our ref
      prevErrorsRef.current = currentErrorsString;

      // Build error messages array
      const errorMessages: string[] = [];

      // Check each field
      if (!paymentInfo?.cardNumber || errors.cardNumber) {
        errorMessages.push("Valid card number is required (16 digits)");
      }

      if (!paymentInfo?.cardHolder || errors.cardHolder) {
        errorMessages.push("Name on card is required");
      }

      if (!paymentInfo?.expiry || errors.expiry) {
        errorMessages.push("Valid expiry date is required (MM/YY format)");
      }

      if (!paymentInfo?.cvv || errors.cvv) {
        errorMessages.push("Valid security code is required (3-4 digits)");
      }

      // Send to parent
      onValidationChange(errorMessages);
    }
  }, [errors, onValidationChange, paymentInfo]);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "cardNumber":
        const digitsOnly = value.replace(/\s/g, "");
        if (!digitsOnly) return "Card number is required";
        if (!/^\d+$/.test(digitsOnly))
          return "Card number must contain only digits";
        if (digitsOnly.length !== 16)
          return "Card number must be exactly 16 digits";
        return "";

      case "cardHolder":
        if (!value.trim()) return "Name on card is required";
        if (value.trim().length < 3) return "Please enter a valid name";
        return "";

      case "expiry":
        if (!value) return "Expiry date is required";
        if (!/^\d{2}\/\d{2}$/.test(value)) return "Use MM/YY format";

        const [month, year] = value.split("/");
        const expMonth = parseInt(month, 10);
        const expYear = parseInt(year, 10) + 2000; // Convert to 4-digit year

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        if (expMonth < 1 || expMonth > 12) return "Invalid month";
        if (
          expYear < currentYear ||
          (expYear === currentYear && expMonth < currentMonth)
        ) {
          return "Card has expired";
        }
        return "";

      case "cvv":
        if (!value) return "Security code is required";
        if (!/^\d{3,4}$/.test(value)) return "CVV must be 3-4 digits";
        return "";

      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === "cardNumber") {
      formattedValue = value
        .replace(/\s/g, "")
        .replace(/(\d{4})/g, "$1 ")
        .trim()
        .slice(0, 19);
    }

    // Format expiry date with slash
    if (name === "expiry") {
      formattedValue = value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d{0,2})/, "$1/$2")
        .slice(0, 5);
    }

    // Limit CVV to 3-4 digits
    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    // Validate the field
    const fieldError = validateField(name, formattedValue);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));

    // Update parent component with new values
    onChange({
      [name]: formattedValue,
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="cardNumber"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Card Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={paymentInfo?.cardNumber || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={`w-full pl-4 pr-12 py-2 border ${
              errors.cardNumber ? "border-red-300 bg-red-50" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            required
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
            {cardType && paymentIcons[cardType] && (
              <img
                src={paymentIcons[cardType]}
                alt={cardType}
                className="h-5"
              />
            )}
          </div>
        </div>
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="cardHolder"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Name on Card <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="cardHolder"
          name="cardHolder"
          value={paymentInfo?.cardHolder || ""}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="John Smith"
          className={`w-full px-4 py-2 border ${
            errors.cardHolder ? "border-red-300 bg-red-50" : "border-gray-300"
          } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
          required
        />
        {errors.cardHolder && (
          <p className="mt-1 text-sm text-red-600">{errors.cardHolder}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="expiry"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="expiry"
            name="expiry"
            value={paymentInfo?.expiry || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="MM/YY"
            maxLength={5}
            className={`w-full px-4 py-2 border ${
              errors.expiry ? "border-red-300 bg-red-50" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            required
          />
          {errors.expiry && (
            <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="cvv"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            CVC <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            value={paymentInfo?.cvv || ""}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="123"
            maxLength={4}
            className={`w-full px-4 py-2 border ${
              errors.cvv ? "border-red-300 bg-red-50" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            required
          />
          {errors.cvv && (
            <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
          )}
        </div>
      </div>

      <div className="flex items-center pt-2 text-sm text-gray-500">
        <Lock className="h-4 w-4 mr-1" />
        <span>Your payment information is secured with SSL encryption</span>
      </div>
    </div>
  );
};
