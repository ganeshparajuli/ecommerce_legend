import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

type Category = {
  id: string;
  name: string;
  image: string;
  link: string;
};

type Product = {
  id: string;
  price: number;
  priceRange?: { min: number; max: number };
  category?: string;
};

type PriceRange = {
  min: number;
  max: number;
};

type FilterSectionProps = {
  categories: Category[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  products?: Product[]; // Make optional to prevent undefined errors
};

export const FilterSection = ({
  categories = [],
  selectedCategory,
  setSelectedCategory,
  products = [] // Provide default empty array
}: FilterSectionProps) => {
  // Filter sections expand/collapse state
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: false,
  });

  // Price range state with defaults
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: 0,
    max: 1000,
  });

  // Calculate actual price range from products
  useEffect(() => {
    if (products && products.length > 0) {
      // Safely determine min and max price from products
      const prices = products.map(p => p.price).filter(price => !isNaN(price));
      
      if (prices.length > 0) {
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        
        setPriceRange({
          min: minPrice,
          max: maxPrice
        });
      }
    }
  }, [products]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    });
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName === selectedCategory ? "" : categoryName);
  };

  return (
    <div className="px-4 py-6">
      {/* Filter Title */}
      <h2 className="text-xl font-semibold mb-6">Filters</h2>

      {/* Categories Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("categories")}
          className="flex justify-between items-center w-full mb-4 text-lg font-medium"
        >
          Categories
          {expandedSections.categories ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {expandedSections.categories && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className={`flex items-center w-full px-2 py-2 rounded-lg text-left ${
                  selectedCategory === category.name
                    ? "bg-black text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <span className="flex-1">{category.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("price")}
          className="flex justify-between items-center w-full mb-4 text-lg font-medium"
        >
          Price Range
          {expandedSections.price ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {expandedSections.price && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">${priceRange.min}</span>
              <span className="text-sm">${priceRange.max}</span>
            </div>
            
            {/* Price slider would go here but we'll use a placeholder */}
            <div className="h-2 bg-gray-200 rounded-full relative">
              <div className="absolute h-full bg-black rounded-full" style={{ width: '50%' }}></div>
              <div className="absolute h-4 w-4 bg-black rounded-full top-1/2 transform -translate-y-1/2" style={{ left: '50%' }}></div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Clear Filters Button */}
      {selectedCategory && (
        <button
          onClick={() => setSelectedCategory("")}
          className="w-full py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default FilterSection;