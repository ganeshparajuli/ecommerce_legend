import React from "react";
import type { ReactNode } from "react";

import { ChevronUp, ChevronDown } from "lucide-react";

interface CheckoutSectionProps {
  title: string;
  number: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export const CheckoutSection: React.FC<CheckoutSectionProps> = ({
  title,
  number,
  isExpanded,
  onToggle,
  children,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        className={`w-full flex items-center justify-between p-6 text-left ${
          isExpanded ? "border-b border-gray-200" : ""
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3">
            {number}
          </div>
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isExpanded && children}
    </div>
  );
};
