import React from "react";
import { Lock, Truck, ShieldCheck } from "lucide-react";

interface TrustBadgesProps {
  paymentIcons: Record<string, string>;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ paymentIcons }) => {
  return (
    <div className="mt-6 bg-gray-50 rounded-xl p-4">
      <div className="flex justify-center space-x-6 mb-4">
        <img src={paymentIcons.visa} alt="Visa" className="h-6" />
        <img src={paymentIcons.mastercard} alt="Mastercard" className="h-6" />
        <img src={paymentIcons.paypal} alt="PayPal" className="h-6" />
        <img src={paymentIcons.apple} alt="Apple Pay" className="h-6" />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-600">
        <div className="flex flex-col items-center">
          <Lock className="h-4 w-4 text-indigo-600 mb-1" />
          <span>Secure Payment</span>
        </div>
        <div className="flex flex-col items-center">
          <Truck className="h-4 w-4 text-indigo-600 mb-1" />
          <span>Fast Shipping</span>
        </div>
        <div className="flex flex-col items-center">
          <ShieldCheck className="h-4 w-4 text-indigo-600 mb-1" />
          <span>Buyer Protection</span>
        </div>
      </div>
    </div>
  );
};
