// Example: src/components/ProductList.tsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import {
  getAllProducts,
  searchProducts,
  getFeaturedProducts,
  updateProductStock,
  clearErrors,
} from "../redux/actions/productAction";
import {
  formatProductForDisplay,
  formatPrice,
  getStockStatus,
  parseProductImages,
} from "../utils/productHelper";

const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error, searchResults, searchLoading } =
    useSelector((state: RootState) => state.products);

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    category: "",
    brand: "",
  });

  // Load products on mount
  useEffect(() => {
    dispatch(getAllProducts());
    dispatch(getFeaturedProducts());
  }, [dispatch]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearErrors());
    };
  }, [dispatch]);

  // Handle search
  const handleSearch = () => {
    if (
      searchTerm ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.category ||
      filters.brand
    ) {
      dispatch(
        searchProducts({
          name: searchTerm,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          category: filters.category,
          brand: filters.brand,
        })
      );
    } else {
      dispatch(getAllProducts());
    }
  };

  // Handle stock update
  const handleStockUpdate = async (productId: string, newQuantity: number) => {
    try {
      await dispatch(updateProductStock(productId, newQuantity));
      // Refresh products after update
      dispatch(getAllProducts());
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  const displayProducts = searchResults.length > 0 ? searchResults : products;

  if (loading || searchLoading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-list">
      {/* Search and Filter Section */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <input
          type="number"
          placeholder="Min Price"
          value={filters.minPrice || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
        />

        <input
          type="number"
          placeholder="Max Price"
          value={filters.maxPrice || ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Product Grid */}
      <div className="product-grid">
        {displayProducts.map((product) => {
          const formattedProduct = formatProductForDisplay(product);
          const images = parseProductImages(product.image);
          const stockStatus = getStockStatus(product.quantity);

          return (
            <div key={product.id} className="product-card">
              {/* Product Image */}
              {images.length > 0 && <img src={images[0]} alt={product.name} />}

              {/* Product Info */}
              <h3>{product.name}</h3>
              {product.brand && <p className="brand">{product.brand}</p>}

              {/* Price Display */}
              <div className="price-section">
                {product.originalPrice &&
                product.originalPrice > product.finalPrice ? (
                  <>
                    <span className="original-price">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <span className="final-price">
                      {formatPrice(product.finalPrice)}
                    </span>
                    {product.savings && (
                      <span className="savings">
                        Save {formatPrice(product.savings)}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="price">
                    {formatPrice(product.finalPrice)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className={`stock-status ${stockStatus.status}`}>
                {stockStatus.message}
              </div>

              {/* Rating */}
              {product.rating > 0 && (
                <div className="rating">
                  ⭐ {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                </div>
              )}

              {/* Key Features */}
              {formattedProduct.keyFeatures.length > 0 && (
                <ul className="key-features">
                  {formattedProduct.keyFeatures
                    .slice(0, 3)
                    .map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                </ul>
              )}

              {/* Admin Stock Update (example) */}
              {/* In real app, check if user is admin */}
              <div className="admin-controls">
                <button
                  onClick={() => {
                    const newQuantity = prompt(
                      `Update stock for ${product.name}:`,
                      product.quantity.toString()
                    );
                    if (newQuantity) {
                      handleStockUpdate(product.id, parseInt(newQuantity));
                    }
                  }}
                >
                  Update Stock
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
