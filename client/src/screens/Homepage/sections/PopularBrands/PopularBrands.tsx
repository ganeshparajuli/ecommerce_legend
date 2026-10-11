import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getAllBrands } from "../../../../redux/actions/brandAction";
import type { RootState } from "../../../../redux/store";
import { BrandImage } from "../../../../utils/imageHelper";

export const PopularBrands = () => {
  const dispatch = useDispatch();
  const brands = useSelector((state: RootState) => state.brand.brands);
  const loading = useSelector((state: RootState) => state.brand.loading);

  useEffect(() => {
    if (!brands?.length && !loading) dispatch(getAllBrands());
  }, [dispatch, brands?.length, loading]);

  const list = Array.isArray(brands) ? brands.slice(0, 12) : [];

  return (
    <section className="bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center gap-6 py-5 overflow-x-auto scrollbar-none">
          {/* Label */}
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 whitespace-nowrap flex-shrink-0 pr-4 border-r border-gray-200">
            Our Brands
          </span>

          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-20 h-8 bg-gray-100 rounded animate-pulse flex-shrink-0" />
            ))
          ) : (
            list.map((brand: any) => (
              <Link
                key={brand.id}
                to={`/products?brand=${brand.slug || brand.name?.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex-shrink-0 group"
                title={brand.name}
              >
                <div className="h-8 flex items-center justify-center px-2 opacity-50 hover:opacity-100 transition-opacity duration-200">
                  <BrandImage
                    src={brand.image}
                    alt={brand.name}
                    className="h-7 max-w-[80px] object-contain"
                    fallbackText={brand.name?.charAt(0)}
                  />
                </div>
              </Link>
            ))
          )}

          {/* View all */}
          {list.length > 0 && (
            <Link
              to="/brands"
              className="flex-shrink-0 ml-auto flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap pl-4 border-l border-gray-200 transition-colors"
            >
              All Brands <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularBrands;
