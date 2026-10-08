import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCategorySeries,
  deleteCategorySeries,
  updateCategorySeries,
  getAllCategorySeries,
} from "../../../../redux/actions/categorySeriesAction";
import { getAllCategories } from "../../../../redux/actions/categoryAction";
import { getAllBrands } from "../../../../redux/actions/brandAction";
import type { CategorySeries } from "../../../../redux/constants/categorySeriesConstants";
import type { Category } from "../../../../redux/constants/categoryConstants";
import type { Brand } from "../../../../redux/constants/brandConstants";
import toast from "react-hot-toast";

const Series = () => {
  const dispatch = useDispatch();
  const {
    categorySeries,
    loading,
    error: seriesError,
  } = useSelector((state: any) => state.categorySeries);
  const { categories, loading: categoriesLoading } = useSelector(
    (state: any) => state.category
  );
  const { brands, loading: brandsLoading } = useSelector(
    (state: any) => state.brand
  );

  // Form state
  const [seriesName, setSeriesName] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Filter/search state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [editingSeries, setEditingSeries] = useState<CategorySeries | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<CategorySeries | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllCategorySeries() as any);
    dispatch(getAllCategories() as any);
    dispatch(getAllBrands() as any);
  }, [dispatch]);

  useEffect(() => {
    if (seriesError) setError(seriesError);
  }, [seriesError]);

  // Categories that belong to the currently selected brand
  const brandCategories = categories.filter(
    (category: Category) => !selectedBrandId || category.brandId === selectedBrandId
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c: Category) => c.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const getBrandName = (categoryId: string) => {
    const category = categories.find((c: Category) => c.id === categoryId);
    const brand = category ? brands.find((b: Brand) => b.id === category.brandId) : null;
    return brand ? brand.name : "No Brand";
  };

  const filteredSeries = categorySeries.filter((series: CategorySeries) => {
    const matchesSearch = series.seriesName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? series.categoryId === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setSeriesName("");
    setIsActive(true);
    setSelectedCategoryId("");
    if (brands.length > 0) {
      setSelectedBrandId(brands[0].id);
    } else {
      setSelectedBrandId("");
    }
    setEditingSeries(null);
  };

  useEffect(() => {
    if (brands.length > 0 && !selectedBrandId && !editingSeries) {
      setSelectedBrandId(brands[0].id);
    }
  }, [brands, selectedBrandId, editingSeries]);

  const handleAddSeries = () => {
    if (!seriesName.trim()) {
      toast.error("Series name cannot be empty");
      return;
    }
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }

    dispatch(
      createCategorySeries({
        series_name: seriesName.trim(),
        category_id: selectedCategoryId,
        is_active: isActive,
      }) as any
    )
      .then(() => {
        toast.success("Series created successfully");
        resetForm();
        dispatch(getAllCategorySeries() as any);
      })
      .catch((err: Error) => {
        toast.error(err.message || "Failed to create series");
      });
  };

  const handleEditClick = (series: CategorySeries) => {
    setEditingSeries(series);
    setSeriesName(series.seriesName);
    setSelectedCategoryId(series.categoryId);
    setIsActive(series.isActive);
    const category = categories.find((c: Category) => c.id === series.categoryId);
    setSelectedBrandId(category?.brandId || "");
  };

  const handleUpdateSeries = () => {
    if (!seriesName.trim() || !editingSeries) {
      toast.error("Series name cannot be empty");
      return;
    }
    if (!selectedCategoryId) {
      toast.error("Please select a category");
      return;
    }

    dispatch(
      updateCategorySeries(editingSeries.id, {
        series_name: seriesName.trim(),
        category_id: selectedCategoryId,
        is_active: isActive,
      }) as any
    )
      .then(() => {
        toast.success("Series updated successfully");
        resetForm();
        dispatch(getAllCategorySeries() as any);
      })
      .catch((err: Error) => {
        toast.error(err.message || "Failed to update series");
      });
  };

  const handleDeleteClick = (series: CategorySeries) => {
    setSeriesToDelete(series);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!seriesToDelete) return;

    dispatch(deleteCategorySeries(seriesToDelete.id) as any)
      .then(() => {
        toast.success("Series deleted successfully");
        setShowDeleteModal(false);
        setSeriesToDelete(null);
      })
      .catch((err: Error) => {
        toast.error(err.message || "Failed to delete series");
      });
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSeriesToDelete(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingSeries) {
        handleUpdateSeries();
      } else {
        handleAddSeries();
      }
    }
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setSelectedCategoryId("");
  };

  if (loading || categoriesLoading || brandsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
            <p className="text-black text-lg font-medium">Loading series...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <br />
      <div className="container my-10 mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">
            Category Series
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage product lineups within a category (e.g. "iPhone 16 Series" under the iPhone category)
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 text-xl font-bold leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter */}
        <div className="mb-6 sm:mb-8 bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Filter by Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">All Categories</option>
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Search Series
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search series..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredSeries.length} of {categorySeries.length} series
          </div>
        </div>

        {/* Add/Edit Series Form */}
        <div className="mb-6 sm:mb-8 bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingSeries ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
            </svg>
            {editingSeries ? "Edit Series" : "Add New Series"}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBrandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="" disabled>
                  Select a Brand
                </option>
                {brands.map((brand: Brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                disabled={!selectedBrandId}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  !selectedBrandId ? "bg-gray-100" : ""
                }`}
              >
                <option value="" disabled>
                  {selectedBrandId ? "Select a Category" : "Select a brand first"}
                </option>
                {brandCategories.map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Series Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={seriesName}
                onChange={(e) => setSeriesName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g. iPhone 16 Series"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-black">
              Active (visible to shoppers)
            </label>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={editingSeries ? handleUpdateSeries : handleAddSeries}
              disabled={!seriesName.trim() || !selectedCategoryId}
              className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingSeries ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
              </svg>
              <span>{editingSeries ? "Update" : "Add"} Series</span>
            </button>

            {editingSeries && (
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Series List */}
        {filteredSeries.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No series found</h3>
            <p className="text-gray-500">
              {searchQuery || categoryFilter
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first series"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Series Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSeries.map((series: CategorySeries) => (
                    <tr key={series.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-black">{series.seriesName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{getCategoryName(series.categoryId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">{getBrandName(series.categoryId)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            series.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {series.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        <button
                          onClick={() => handleEditClick(series)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(series)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredSeries.map((series: CategorySeries) => (
                <div key={series.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-black">{series.seriesName}</h3>
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                            series.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {series.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getBrandName(series.categoryId)} &middot; {getCategoryName(series.categoryId)}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEditClick(series)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(series)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black">Confirm Delete</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the series{" "}
                <span className="font-semibold text-black">"{seriesToDelete?.seriesName}"</span>?
                Products already assigned to it will keep their series cleared. This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="flex-1 px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Series;
