import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "../../../../components/ui/use-toast";
import { useAtom } from "jotai";
// import { cartAtom } from "../../../../store/cart";
// import { wishlistAtom, isInWishlistAtom } from "../../../../store/wishlist";

type Product = {
  id: string;
  name: string;
  category?: string;
  price: number;
  originalPrice?: number;
  rating?: number;
  image: string;
  date?: string;
  priceRange?: { min: number; max: number };
};

type ProductsGridProps = {
  products: Product[];
  currentProducts: Product[];
  sortBy: string;
  sortOrder: string;
  toggleSort: (field: string) => void;
  indexOfFirstProduct?: number;
  indexOfLastProduct?: number;
};

export const ProductsGridSection = ({
  currentProducts = [],
  sortBy,
  sortOrder,
  toggleSort,
}: ProductsGridProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cart, setCart] = useAtom(cartAtom);
  const [wishlist, setWishlist] = useAtom(wishlistAtom);
  const [isInWishlist] = useAtom(isInWishlistAtom);

  // Navigate to product details using product ID
  const navigateToProductDetails = (productId: string) => {
    if (!productId) return;
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = (product: Product) => {
    if (!product?.id) return;
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    toast({
      title: "Added to cart",
      description: `${product.name || 'Product'} has been added to your cart.`,
    });
  };

  const toggleWishlist = (product: Product) => {
    if (!product?.id) return;

    if (isInWishlist(product.id)) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      toast({
        title: "Removed from wishlist",
        description: `${product.name || 'Product'} has been removed from your wishlist.`,
      });
    } else {
      setWishlist([...wishlist, product]);
      toast({
        title: "Added to wishlist",
        description: `${product.name || 'Product'} has been added to your wishlist.`,
      });
    }
  };

  return (
    <>
      {/* Sorting Controls - Clean and Minimal */}
      <div className="flex justify-end mb-8">
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-3">Sort by:</span>
          <div className="flex gap-2">
            {[
              { key: 'name', label: 'Name' },
              { key: 'price', label: 'Price' },
              { key: 'date', label: 'Newest' }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => toggleSort(option.key)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  sortBy === option.key
                    ? 'bg-black text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.label}
                {sortBy === option.key && (
                  sortOrder === 'asc' ? (
                    <ArrowUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ArrowDown className="w-4 h-4 ml-2" />
                  )
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid with ID-based navigation */}
      {currentProducts && currentProducts.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {currentProducts.map((product) => product && (
            <motion.div
              key={product.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.4 } 
                }
              }}
              className="group bg-white overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              {/* Product Image - Clickable to product details */}
              <div 
                className="relative aspect-[4/5] overflow-hidden bg-gray-50 cursor-pointer"
                onClick={() => navigateToProductDetails(product.id)}
              >
                <img
                  src={product.image}
                  alt={product.name || 'Product image'}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/image-10-2.png';
                  }}
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                
                {/* Quick Actions */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation to product details
                      toggleWishlist(product);
                    }}
                    className={`rounded-full h-10 w-10 flex items-center justify-center shadow-lg transition-colors ${
                      isInWishlist(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-black hover:bg-black hover:text-white'
                    }`}
                    aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation to product details
                      handleAddToCart(product);
                    }}
                    className="bg-white text-black rounded-full h-10 w-10 flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-colors"
                    aria-label="Add to cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigation to product details
                      navigateToProductDetails(product.id);
                    }}
                    className="bg-white text-black rounded-full h-10 w-10 flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-colors"
                    aria-label="Quick view"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>

                {/* Badges - Clean and Minimal */}
                <div className="absolute top-4 left-4">
                  {product.originalPrice && product.price && product.originalPrice > product.price && (
                    <span className="bg-red-600 text-white text-xs font-bold uppercase px-2 py-1">
                      SALE
                    </span>
                  )}
                </div>
                
                {/* New Badge */}
                {product.date && new Date(product.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-black text-white text-xs font-bold uppercase px-2 py-1">
                      New
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info - Clean and Simple */}
              <div className="p-5">
                {product.category && (
                  <div className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
                    {product.category}
                  </div>
                )}

                {/* Product name links to product detail by ID */}
                <div 
                  onClick={() => navigateToProductDetails(product.id)}
                  className="block cursor-pointer"
                >
                  <h3 className="text-base md:text-lg font-medium text-gray-900 line-clamp-1 group-hover:text-black transition-colors">
                    {product.name || 'Untitled Product'}
                  </h3>
                </div>

                {/* Price Display - Clean */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-black">${(product.price || 0).toFixed(2)}</span>
                    {product.originalPrice && product.price && product.originalPrice > product.price && (
                      <span className="text-sm text-gray-400 line-through">${(product.originalPrice || 0).toFixed(2)}</span>
                    )}
                  </div>
                  
                  {/* Star Rating - Minimal */}
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-sm text-gray-500">{product.rating || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        // No Products Found - Clean Message
        <div className="text-center py-24 bg-gray-50 rounded">
          <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-6 text-lg font-medium text-gray-900">No products found</h3>
          <p className="mt-2 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      )}
    </>
  );
};

export default ProductsGridSection;