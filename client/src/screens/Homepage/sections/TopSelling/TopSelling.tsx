import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Star, TrendingUp, Zap } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../redux/store";
import { getAllProducts } from "../../../../redux/actions/productAction";
import { ProductImage } from "../../../../utils/imageHelper";
import { formatPrice } from "@/utils/formatPrice";

const pct = (actual: any, final: any) => {
  const a = parseFloat(actual), f = parseFloat(final);
  if (!a || !f || f >= a) return 0;
  return Math.round(((a - f) / a) * 100);
};

export const TopSelling = () => {
  const dispatch = useDispatch();
  const { products: all, loading } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    if (!all?.length && !loading) dispatch(getAllProducts() as any);
  }, [dispatch, all?.length, loading]);

  const products = (all || []).slice(0, 8);
  const featured = products.slice(0, 4);
  const rest = products.slice(4, 8);

  return (
    <section className="bg-gray-50 py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 space-y-10">

        {/* ── Popular Products ── */}
        <div>
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-6 bg-red-600 rounded-full" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Popular Products</h2>
                <p className="text-sm text-gray-400 mt-0.5">Our best-selling picks</p>
              </div>
            </div>
            <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading && !products.length ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl animate-pulse">
                  <div className="aspect-square bg-gray-100 rounded-t-xl" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-6 bg-gray-100 rounded mt-2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map((product: any, i) => {
                const discount = pct(product.actualPrice, product.finalPrice);
                const price = product.finalPrice || product.actualPrice;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link to={`/product/${product.id}`} className="group block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200">
                      <div className="relative aspect-square bg-white overflow-hidden">
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
                        {i === 0 && (
                          <span className="absolute top-2 right-2 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" /> #1
                          </span>
                        )}
                      </div>
                      <div className="p-3 border-t border-gray-100">
                        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors mb-1.5">
                          {product.name}
                        </h3>
                        {product.rating > 0 && (
                          <div className="flex items-center gap-1 mb-1.5">
                            {[...Array(5)].map((_, s) => (
                              <Star key={s} className={`w-2.5 h-2.5 ${s < Math.round(product.rating) ? "text-amber-400 fill-current" : "text-gray-200 fill-current"}`} />
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{formatPrice(price)}</span>
                          {discount > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(product.actualPrice)}</span>}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Deals Banner ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Red banner */}
          <div className="relative bg-red-600 rounded-2xl overflow-hidden p-8 flex items-center justify-between min-h-[160px]">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -right-4 -bottom-12 w-64 h-64 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-white/80" />
                <span className="text-white/80 text-xs font-medium uppercase tracking-wider">Flash Deals</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-1">Up to 30% Off</h3>
              <p className="text-white/60 text-sm mb-4">On selected electronics</p>
              <Link to="/products" className="inline-flex items-center gap-1.5 bg-white text-red-600 hover:bg-red-50 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
                Shop Deals <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Dark banner */}
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden p-8 flex items-center justify-between min-h-[160px]">
            <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute -right-4 -bottom-12 w-64 h-64 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-white/50" />
                <span className="text-white/50 text-xs font-medium uppercase tracking-wider">Trending Now</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-1">New Collection</h3>
              <p className="text-white/40 text-sm mb-4">Latest arrivals this season</p>
              <Link to="/new-arrivals" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
                Explore <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Recommended Products ── */}
        {rest.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-6 bg-gray-900 rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Recommended</h2>
                  <p className="text-sm text-gray-400 mt-0.5">Handpicked for you</p>
                </div>
              </div>
              <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {rest.map((product: any, i) => {
                const discount = pct(product.actualPrice, product.finalPrice);
                const price = product.finalPrice || product.actualPrice;
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link to={`/product/${product.id}`} className="group block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200">
                      <div className="relative aspect-square bg-white overflow-hidden">
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
                      </div>
                      <div className="p-3 border-t border-gray-100">
                        <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors mb-1.5">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">{formatPrice(price)}</span>
                          {discount > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(product.actualPrice)}</span>}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopSelling;
