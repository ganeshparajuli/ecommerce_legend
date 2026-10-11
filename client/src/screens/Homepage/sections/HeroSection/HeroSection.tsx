import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductImage } from "../../../../utils/imageHelper";
import { getAllProducts } from "../../../../redux/actions/productAction";
import { addToWishlist, removeFromWishlistByProductId } from "../../../../redux/actions/wishlistActions";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/formatPrice";

const isUserLoggedIn = () => Boolean(localStorage.getItem("token") && localStorage.getItem("loggedOut") !== "true");

const calculateDiscount = (actual: number, final: number) => {
  if (!actual || !final || final >= actual) return 0;
  return Math.round(((actual - final) / actual) * 100);
};

export const HeroSection: React.FC = () => {
  const dispatch = useDispatch();
  const { products: allProducts, loading } = useSelector((state: RootState) => state.products);
  const { wishlist } = useSelector((state: RootState) => state.wishlist);

  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);
  const [touchStart, setTouchStart] = useState(0);

  const products = (allProducts || []).filter((p: any) => p.featured === true || p.featured === 1 || p.isFeatured === true);
  const favorites = new Set(Array.isArray(wishlist) ? wishlist.map((i: any) => i.product_id || i.productId) : []);

  useEffect(() => {
    if (!allProducts?.length && !loading) dispatch(getAllProducts() as any);
  }, [dispatch, allProducts?.length, loading]);

  const next = useCallback(() => setCurrent(p => (p + 1) % products.length), [products.length]);
  const prev = useCallback(() => setCurrent(p => (p - 1 + products.length) % products.length), [products.length]);

  useEffect(() => {
    if (!auto || products.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [auto, next, products.length]);

  const manualNav = (fn: () => void) => { setAuto(false); fn(); setTimeout(() => setAuto(true), 8000); };

  const toggleWishlist = async (id: string) => {
    if (!isUserLoggedIn()) { toast.error("Login to save items"); return; }
    if (favorites.has(id)) {
      await dispatch(removeFromWishlistByProductId(id) as any);
      toast.success("Removed from wishlist");
    } else {
      await dispatch(addToWishlist(id) as any);
      toast.success("Saved to wishlist");
    }
  };

  // Skeleton while loading
  if (loading && !products.length) {
    return (
      <div className="h-[480px] md:h-[560px] bg-gray-900 animate-pulse flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="h-[480px] md:h-[560px] bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg mb-4">No featured products</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-sm transition-colors">
            Browse All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const product = products[current];
  const discount = calculateDiscount(Number(product.actualPrice), Number(product.finalPrice));

  return (
    <section
      className="relative bg-gray-900 overflow-hidden select-none"
      style={{ minHeight: "480px" }}
      onTouchStart={e => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={e => {
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) manualNav(diff > 0 ? next : prev);
      }}
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm39 0h1v40h-1zM0 0v1h40V0zm0 39v1h40v-1z'/%3E%3C/g%3E%3C/svg%3E\")" }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="relative max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 items-center gap-0 min-h-[480px] md:min-h-[560px]"
        >
          {/* ── Text side ── */}
          <div className="py-16 lg:py-20 order-2 lg:order-1 text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-5">
              <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                Featured
              </span>
              {discount > 0 && (
                <span className="bg-white/10 text-white/80 text-xs font-medium px-3 py-1 rounded-full">
                  Save {discount}%
                </span>
              )}
              {product.category && (
                <span className="bg-white/10 text-white/60 text-xs px-2.5 py-1 rounded-full capitalize">
                  {product.category}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-white/50 text-sm md:text-base leading-relaxed mb-6 line-clamp-2 max-w-md mx-auto lg:mx-0">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-3 justify-center lg:justify-start mb-8">
              <span className="text-3xl md:text-4xl font-bold text-white">
                {formatPrice(product.finalPrice)}
              </span>
              {discount > 0 && (
                <span className="text-lg text-white/40 line-through">
                  {formatPrice(product.actualPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 justify-center lg:justify-start flex-wrap">
              <Link
                to={`/product/${product.id}`}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                Shop Now
              </Link>
              <Link
                to={`/product/${product.id}`}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl text-sm transition-all"
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3 rounded-xl transition-all ${favorites.has(product.id) ? "bg-red-600 text-white" : "bg-white/10 hover:bg-white/20 text-white/70"}`}
                title="Save to wishlist"
              >
                <Heart className={`w-4 h-4 ${favorites.has(product.id) ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* ── Image side ── */}
          <div className="order-1 lg:order-2 flex items-center justify-center py-10 lg:py-12">
            <div className="relative w-[300px] h-[300px] md:w-[340px] md:h-[340px] lg:w-[420px] lg:h-[420px]">
              {/* Subtle radial glow behind the product */}
              <div className="absolute inset-0 rounded-full bg-white/5 blur-3xl scale-75" />
              <ProductImage
                src={Array.isArray(product.image) ? product.image[0] : product.image}
                alt={product.name}
                className="relative w-full h-full object-contain drop-shadow-2xl"
                fallbackUrl="/placeholder.jpg"
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Arrows ── */}
      {products.length > 1 && (
        <>
          <button
            onClick={() => manualNav(prev)}
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => manualNav(next)}
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ── Dots ── */}
      {products.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {products.map((_, i) => (
            <button
              key={i}
              onClick={() => manualNav(() => setCurrent(i))}
              className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-1.5 bg-red-500" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"}`}
            />
          ))}
        </div>
      )}

      {/* ── Slide counter ── */}
      {products.length > 1 && (
        <div className="absolute bottom-5 right-6 text-white/30 text-xs tabular-nums">
          {String(current + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
