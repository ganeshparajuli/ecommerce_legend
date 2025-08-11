import React from "react";
import { Truck, Clock, ShieldCheck } from "lucide-react";

export const DeliveryInfo: React.FC = () => {
  return (
    <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center mb-4">
        <Truck className="h-5 w-5 text-indigo-600 mr-2" />
        <h3 className="text-sm font-medium text-gray-900">
          Delivery Information
        </h3>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p className="flex items-center">
          <Clock className="h-4 w-4 text-gray-400 mr-2" />
          Estimated delivery: 3-5 business days
        </p>
        <p className="flex items-center">
          <ShieldCheck className="h-4 w-4 text-gray-400 mr-2" />
          Free returns within 30 days
        </p>
      </div>
    </div>
  );
};
