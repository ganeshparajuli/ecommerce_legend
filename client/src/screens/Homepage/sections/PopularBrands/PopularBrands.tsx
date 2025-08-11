import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Star,
  ShoppingBag,
  ChevronLeft,
  Pause,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllBrands } from "../../../../redux/actions/brandAction";
import type { RootState } from "../../../../redux/store";
import type { Brand } from "../../../../redux/constants/brandConstants";
import { BrandImage } from "../../../../utils/imageHelper";

export const PopularBrands = () => {
  const dispatch = useDispatch();

  const brands = useSelector((state: RootState) => state.brand.brands);
  const loading = useSelector((state: RootState) => state.brand.loading);
  const reduxError = useSelector((state: RootState) => state.brand.error);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredBrand, setHoveredBrand] = useState<string | null>(null);
  const [visibleBrands, setVisibleBrands] = useState(6); // Show 6 brands like Oliz
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isLoading = loading || (!brands && !reduxError);
  const hasBrands = Array.isArray(brands) && brands.length > 0;

  // Process brand data
  const processedBrands = hasBrands
    ? brands.map((brand, index) => ({
        ...brand,
        count: brand.productsCount || Math.floor(Math.random() * 300) + 25,
        link: `/products?brand=${brand.slug || brand.name.toLowerCase().replace(/\s+/g, '-')}`,
      }))
    : [];

  // Responsive visible brands calculation
  useEffect(() => {
    const updateVisibleBrands = () => {
      const width = window.innerWidth;
      if (width >= 1200) setVisibleBrands(6);
      else if (width >= 1024) setVisibleBrands(4);
      else if (width >= 768) setVisibleBrands(3);
      else if (width >= 640) setVisibleBrands(2);
      else setVisibleBrands(1);
    };

    updateVisibleBrands();
    window.addEventListener("resize", updateVisibleBrands);
    return () => window.removeEventListener("resize", updateVisibleBrands);
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (isPlaying && hasBrands && processedBrands.length > visibleBrands) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % processedBrands.length);
      }, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, hasBrands, processedBrands.length, visibleBrands]);

  // Fetch brands on mount
  useEffect(() => {
    if (!hasBrands && !loading) {
      dispatch(getAllBrands());
    }
  }, [dispatch, hasBrands, loading]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % processedBrands.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? processedBrands.length - 1 : prev - 1
    );
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Get visible brands for current index
  const getVisibleBrands = () => {
    if (!hasBrands) return [];

    const visible = [];
    for (let i = 0; i < visibleBrands; i++) {
      const index = (currentIndex + i) % processedBrands.length;
      visible.push(processedBrands[index]);
    }
    return visible;
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">FEATURED BRANDS</h2>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 h-24 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (reduxError || (!hasBrands && !loading)) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">FEATURED BRANDS</h2>
          <p className="text-gray-600 mb-6">
            {reduxError ? "Failed to load brands" : "No brands found"}
          </p>
          <button
            onClick={() => dispatch(getAllBrands())}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  const visibleBrandsList = getVisibleBrands();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">FEATURED BRANDS</h2>
          <p className="text-gray-600">
            Discover our trusted brand partners ({processedBrands.length} brands available)
          </p>
        </div>

        {/* Brands Grid - Static Layout like Oliz Store */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {visibleBrandsList.map((brand, index) => (
            <motion.div
              key={`${brand.id}-${currentIndex}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
              onMouseEnter={() => setHoveredBrand(brand.id)}
              onMouseLeave={() => setHoveredBrand(null)}
            >
              <Link to={brand.link} className="block">
                <div className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition-shadow flex items-center justify-center h-24 group-hover:bg-white border border-transparent hover:border-gray-200">
                  <BrandImage
                    src={brand.image}
                    alt={brand.name}
                    className="max-w-full max-h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                    fallbackText={brand.name.charAt(0)}
                    onError={(error) => {
                      console.error(`❌ Brand image failed to load for ${brand.name}:`, error);
                    }}
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Navigation Controls - Only show if more brands than visible */}
        {processedBrands.length > visibleBrands && (
          <div className="flex items-center justify-center mt-8 space-x-4">
            <button
              onClick={goToPrev}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={goToNext}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Dots Indicator */}
        {processedBrands.length > visibleBrands && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: Math.ceil(processedBrands.length / visibleBrands) }).map(
              (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * visibleBrands)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    Math.floor(currentIndex / visibleBrands) === index
                      ? "bg-red-600 w-6"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              )
            )}
          </div>
        )}

        {/* View All Brands CTA */}
        <div className="text-center mt-12">
          <Link to="/brands">
            <button className="bg-gray-800 hover:bg-black text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center">
              <span>View All Brands ({processedBrands.length})</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularBrands;