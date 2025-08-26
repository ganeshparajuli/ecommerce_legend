import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
// Note: Link component should be imported from react-router-dom in actual implementation
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts } from "../../../../redux/actions/productAction";
import type { RootState } from "../../../../redux/store";
import { ProductImage } from "../../../../utils/imageHelper";
import { formatPrice } from "@/utils/formatPrice";

interface Product {
  id: string;
  name: string;
  actualPrice: number;
  discountPrice: number;
  finalPrice: number;
  description: string;
  image: string;
  category: string;
  size: string;
  color: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  rating?: number;
}

export const TopSelling = () => {
  const dispatch = useDispatch();
  const {
    products: reduxProducts,
    loading,
    error: reduxError,
  } = useSelector((state: RootState) => state.products);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Process products data
  useEffect(() => {
    if (reduxProducts && reduxProducts.length > 0) {
      // Simulate different categories for demo
      const processedProducts = reduxProducts
        .slice(0, 12) // Get 12 products for 3 categories with 4 each
        .map((product: any, index: number) => ({
          ...product,
          rating: 4 + Math.random() * 1,
        }));

      setProducts(processedProducts);
      setIsLoading(false);
    } else if (loading === false) {
      if (reduxError) {
        setError(reduxError);
      }
      setIsLoading(false);
    }
  }, [reduxProducts, loading, reduxError]);

  // Initial fetch
  useEffect(() => {
    if (!reduxProducts || reduxProducts.length === 0) {
      dispatch(getAllProducts() as any);
    }
  }, [dispatch, reduxProducts]);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  // Split products into three categories
  const bestSelling = products.slice(0, 4);
  const latestProducts = products.slice(4, 8);
  const topRated = products.slice(8, 12);

  const sections = [
    {
      title: "FEATURED PRODUCTS",
      products: bestSelling,
    },
    {
      title: "BEST SELLING PRODUCTS",
      products: latestProducts,
    },
    {
      title: "LATEST PRODUCTS",
      products: topRated,
    },
    {
      title: "TOP RATED PRODUCTS",
      products: bestSelling, // Reuse for demo
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index}>
                <div className="h-6 bg-gray-200 rounded mb-6 animate-pulse"></div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, productIndex) => (
                    <div
                      key={productIndex}
                      className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Popular Products
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => dispatch(getAllProducts() as any)}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Popular Products
          </h2>
          <p className="text-gray-600">
            Discover our best-selling and highly-rated products
          </p>
        </div>

        {/* Products Grid - Oliz Style Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                {section.title}
              </h3>
              <div className="space-y-4">
                {section.products.slice(0, 3).map((product, productIndex) => (
                  <a
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="block group"
                  >
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-white hover:shadow-md transition-all">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-white rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                        <ProductImage
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.jpg";
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                          {product.name}
                        </h4>

                        {/* Rating */}
                        <div className="flex items-center mt-1 mb-2">
                          {renderStars(product.rating || 4.5)}
                        </div>

                        {/* Price */}
                        <div className="flex flex-col">
                          {product.actualPrice !== product.finalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.actualPrice)}
                            </span>
                          )}
                          <span className="text-lg font-bold text-black">
                            {formatPrice(product.finalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              {/* View More Link for each category */}
              <div className="text-center mt-6">
                <a
                  href="/products"
                  className="text-red-600 hover:text-red-700 font-medium text-sm inline-flex items-center group"
                >
                  <span>View More</span>
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom section with additional product showcases */}
        <h3 className="flex flex-col text-2xl font-bold text-gray-800 mt-6">
          Recommended Products
        </h3>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          {bestSelling.slice(0, 4).map((product, index) => (
            <a
              key={product.id}
              href={`/product/${product.id}`}
              className="block group"
            >
              <div className="text-center">
                {/* Product Image */}
                <div className="w-full h-32 bg-gray-50 rounded-lg mb-3 overflow-hidden">
                  <ProductImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.jpg";
                    }}
                  />
                </div>

                {/* Product Name */}
                <h4 className="font-medium text-gray-800 text-sm line-clamp-2 group-hover:text-red-600 transition-colors mb-2">
                  {product.name}
                </h4>

                {/* Rating */}
                <div className="flex items-center justify-center mb-2">
                  {renderStars(product.rating || 4.5)}
                </div>

                {/* Price */}
                <div className="text-center">
                  {product.actualPrice !== product.finalPrice && (
                    <span className="text-sm text-gray-500 line-through block">
                      {formatPrice(product.actualPrice)}
                    </span>
                  )}
                  <span className="text-lg font-bold text-black">
                    {formatPrice(product.finalPrice)}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* View All Products CTA */}
        <div className="text-center mt-12">
          <a href="/products">
            <button className="bg-gray-800 hover:bg-black text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center">
              <span>View All Products</span>
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default TopSelling;
