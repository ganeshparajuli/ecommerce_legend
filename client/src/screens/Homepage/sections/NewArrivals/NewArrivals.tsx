import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Heart, ShoppingCart, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
import { getAllProducts } from "../../../../redux/actions/productAction";
import { addToCart } from "../../../../redux/actions/cartAction";
import { addToWishlist, removeFromWishlist } from "../../../../redux/actions/wishlistActions";
import { ProductImage } from "../../../../utils/imageHelper";
import { formatPrice } from "@/utils/formatPrice";
import toast from "react-hot-toast";

const isLoggedIn = () => Boolean(localStorage.getItem("token") && localStorage.getItem("loggedOut") !== "true");

const pct = (actual: any, final: any) => {
  const a = parseFloat(actual), f = parseFloat(final);
  if (!a || !f || f >= a) return 0;
  return Math.round(((a - f) / a) * 100);
};

export const NewArrivals = () => {
  const dispatch = useDispatch();
  const { products: all, loading } = useSelector((state: RootState) => state.products);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!all?.length && !loading) dispatch(getAllProducts() as any);
  }, [dispatch, all?.length, loading]);

  const products = [...(all || [])]
    .sort((a: any, b: any) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime())
    .slice(0, 10);

  const handleCart = (product: any) => {
    if (!isLoggedIn()) { toast.error("Login to add to cart"); return; }
    const variantId = product.defaultVariant?.id;
    if (!variantId) { toast.error("Select a variant on product page"); return; }
    setAdding(p => ({ ...p, [product.id]: true }));
    dispatch(addToCart(variantId, 1) as any);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdding(p => ({ ...p, [product.id]: false })), 800);
  };

  const handleWishlist = (id: string) => {
    if (!isLoggedIn()) { toast.error("Login to save items"); return; }
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); dispatch(removeFromWishlist(id) as any); toast.success("Removed from wishlist"); }
      else { next.add(id); dispatch(addToWishlist(id) as any); toast.success("Saved to wishlist"); }
      return next;
    });
  };

  return (
    <section className="bg-white py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h2 className="text-xl font-bold text-gray-900">New Arrivals</h2>
            <p className="text-sm text-gray-400 mt-0.5">Fresh products just landed</p>
          </div>
          <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        {loading && !products.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product: any, i) => {
              const discount = pct(product.actualPrice, product.finalPrice);
              const price = product.finalPrice || product.actualPrice;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200"
                >
                  {/* Image */}
                  <Link to={`/product/${product.id}`} className="relative block aspect-square bg-white overflow-hidden">
                    <ProductImage
                      src={Array.isArray(product.image) ? product.image[0] : product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-400"
                      fallbackUrl="/placeholder.jpg"
                    />
                    {discount > 0 && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        -{discount}%
                      </span>
                    )}
                    <button
                      onClick={e => { e.preventDefault(); handleWishlist(product.id); }}
                      className={`absolute top-2 right-2 p-1.5 rounded-full shadow transition-all ${wishlist.has(product.id) ? "bg-red-600 text-white" : "bg-white/80 text-gray-400 hover:text-red-600"} opacity-0 group-hover:opacity-100`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${wishlist.has(product.id) ? "fill-current" : ""}`} />
                    </button>
                  </Link>

                  {/* Info */}
                  <div className="p-3 border-t border-gray-100">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-red-600 transition-colors mb-1.5">
                        {product.name}
                      </h3>
                    </Link>

                    {product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-1.5">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} className={`w-2.5 h-2.5 ${s < Math.round(product.rating) ? "text-amber-400 fill-current" : "text-gray-200 fill-current"}`} />
                        ))}
                        {product.reviewCount > 0 && <span className="text-[10px] text-gray-400">({product.reviewCount})</span>}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(price)}</span>
                      {discount > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(product.actualPrice)}</span>}
                    </div>

                    <button
                      onClick={() => handleCart(product)}
                      disabled={!!adding[product.id]}
                      className="w-full flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 text-white text-xs font-semibold py-2 rounded-lg transition-all"
                    >
                      {adding[product.id] ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <><ShoppingCart className="w-3 h-3" /> Add to Cart</>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
