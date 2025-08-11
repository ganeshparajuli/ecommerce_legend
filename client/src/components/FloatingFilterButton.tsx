import React from "react";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";

interface FloatingFilterButtonProps {
  onClick: () => void;
}

export const FloatingFilterButton = ({ onClick }: FloatingFilterButtonProps) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={onClick}
      className="fixed bottom-6 left-6 z-40 flex items-center bg-black text-white rounded-full px-4 py-3 shadow-lg hover:bg-gray-900 transition-colors"
    >
      <Filter className="w-5 h-5 mr-2" />
      <span className="font-medium">Filter</span>
    </motion.button>
  );
};

export default FloatingFilterButton;