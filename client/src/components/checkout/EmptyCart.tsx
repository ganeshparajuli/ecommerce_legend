import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";

export const EmptyCart: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Your cart is empty
        </h2>
        <p className="text-gray-600 mb-8">
          Please add some products to your cart before proceeding to checkout.
        </p>
        <Link to="/products">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
};
