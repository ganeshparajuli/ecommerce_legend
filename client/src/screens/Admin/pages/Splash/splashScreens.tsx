import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createSplash,
  deleteSplash,
  updateSplash,
  getAllSplash,
  toggleSplashStatus,
  getSplashStats,
  bulkUpdateSplashStatus,
  updateSplashOrders,
} from "../../../../redux/actions/splashAction";
import { getAllProducts } from "../../../../redux/actions/productAction";
// Define the splash type
import type { Splash } from "../../../../redux/constants/splashConstants";
import type { Product } from "../../../../redux/constants/productConstants";
import toast from "react-hot-toast";

const SplashScreens = () => {
  const dispatch = useDispatch();
  const {
    splashScreens,
    loading,
    error: splashError,
    stats,
  } = useSelector((state: any) => state.splash);
  const { products, loading: productsLoading } = useSelector(
    (state: any) => state.products
  );

  // State variables
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#6366f1");
  const [textColor, setTextColor] = useState("#ffffff");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [editingSplash, setEditingSplash] = useState<Splash | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [splashToDelete, setSplashToDelete] = useState<Splash | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSplashIds, setSelectedSplashIds] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Fetch all splash screens and products when the component mounts
  useEffect(() => {
    dispatch(getAllSplash());
    dispatch(getAllProducts());
    dispatch(getSplashStats());
  }, [dispatch]);

  // Set error from redux state
  useEffect(() => {
    if (splashError) {
      setError(splashError);
    }
  }, [splashError]);

  // When editing, populate form fields
  useEffect(() => {
    if (editingSplash) {
      setTitle(editingSplash.title || "");
      setDescription(editingSplash.description || "");
      setImageUrl(editingSplash.imageUrl || editingSplash.image_url || "");
      setSelectedProductId(
        editingSplash.productId || editingSplash.product_id || ""
      );
      setIsActive(
        editingSplash.isActive !== undefined
          ? editingSplash.isActive
          : editingSplash.is_active
      );
      setDisplayOrder(
        editingSplash.displayOrder !== undefined
          ? editingSplash.displayOrder
          : editingSplash.display_order || 0
      );
      setStartDate(editingSplash.startDate || editingSplash.start_date || "");
      setEndDate(editingSplash.endDate || editingSplash.end_date || "");
      setButtonText(
        editingSplash.buttonText || editingSplash.button_text || ""
      );
      setButtonLink(
        editingSplash.buttonLink || editingSplash.button_link || ""
      );
      setBackgroundColor(
        editingSplash.backgroundColor ||
          editingSplash.background_color ||
          "#6366f1"
      );
      setTextColor(
        editingSplash.textColor || editingSplash.text_color || "#ffffff"
      );
    }
  }, [editingSplash]);

  // Filter splash screens based on search query, status, and product filter
  const filteredSplashScreens = splashScreens.filter((splash: Splash) => {
    const matchesSearch =
      splash.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (splash.description &&
        splash.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter
      ? statusFilter === "active"
        ? splash.is_active || splash.isActive
        : !(splash.is_active || splash.isActive)
      : true;
    const matchesProduct = productFilter
      ? (splash.product_id || splash.productId) === productFilter
      : true;

    return matchesSearch && matchesStatus && matchesProduct;
  });

  // Get product name by ID
  const getProductName = (productId: string) => {
    const product = products.find((p: Product) => p.id === productId);
    return product ? product.name : "Unknown Product";
  };

  // CSV Export functionality
  const exportToCSV = () => {
    if (filteredSplashScreens.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvData = [
      [
        "Title",
        "Description",
        "Product",
        "Status",
        "Display Order",
        "Button Text",
        "Button Link",
        "Start Date",
        "End Date",
      ], // Headers
      ...filteredSplashScreens.map((splash: Splash) => [
        splash.title,
        splash.description || "",
        splash.productId || splash.product_id
          ? getProductName(splash.productId || splash.product_id)
          : "No Product",
        splash.isActive || splash.is_active ? "Active" : "Inactive",
        splash.displayOrder || splash.display_order || 0,
        splash.buttonText || splash.button_text || "",
        splash.buttonLink || splash.button_link || "",
        splash.startDate || splash.start_date || "",
        splash.endDate || splash.end_date || "",
      ]),
    ];

    const csvContent = csvData
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `splash_screens_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Data exported successfully");
    }
  };

  const handleAddSplash = () => {
    if (!title.trim()) {
      toast.error("Splash title cannot be empty");
      return;
    }

    const splashData = {
      title: title.trim(),
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
      productId: selectedProductId || null,
      isActive,
      displayOrder,
      startDate: startDate || null,
      endDate: endDate || null,
      buttonText: buttonText.trim() || null,
      buttonLink: buttonLink.trim() || null,
      backgroundColor: backgroundColor || null,
      textColor: textColor || null,
    };

    dispatch(createSplash(splashData))
      .then(() => {
        toast.success("Splash screen created successfully");
        resetForm();
        dispatch(getAllSplash());
        dispatch(getSplashStats());
      })
      .catch((error: Error) => {
        toast.error(error.message || "Failed to create splash screen");
      });
  };

  const handleEditClick = (splash: Splash) => {
    setEditingSplash(splash);
  };

  const handleUpdateSplash = () => {
    if (!title.trim() || !editingSplash) {
      toast.error("Splash title cannot be empty");
      return;
    }

    const splashData = {
      title: title.trim(),
      description: description.trim() || null,
      imageUrl: imageUrl.trim() || null,
      productId: selectedProductId || null,
      isActive,
      displayOrder,
      startDate: startDate || null,
      endDate: endDate || null,
      buttonText: buttonText.trim() || null,
      buttonLink: buttonLink.trim() || null,
      backgroundColor: backgroundColor || null,
      textColor: textColor || null,
    };

    dispatch(updateSplash(editingSplash.id, splashData))
      .then(() => {
        toast.success("Splash screen updated successfully");
        setEditingSplash(null);
        resetForm();
        dispatch(getAllSplash());
        dispatch(getSplashStats());
      })
      .catch((error: Error) => {
        toast.error(error.message || "Failed to update splash screen");
      });
  };

  const handleDeleteClick = (splash: Splash) => {
    setSplashToDelete(splash);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!splashToDelete) return;

    dispatch(deleteSplash(splashToDelete.id))
      .then(() => {
        toast.success("Splash screen deleted successfully");
        setShowDeleteModal(false);
        setSplashToDelete(null);
        dispatch(getAllSplash());
        dispatch(getSplashStats());
      })
      .catch((error: Error) => {
        toast.error(error.message || "Failed to delete splash screen");
      });
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSplashToDelete(null);
  };

  const handleToggleStatus = (splash: Splash) => {
    dispatch(toggleSplashStatus(splash.id))
      .then(() => {
        const newStatus = !(splash.isActive || splash.is_active);
        toast.success(
          `Splash screen ${
            newStatus ? "activated" : "deactivated"
          } successfully`
        );
        dispatch(getAllSplash());
        dispatch(getSplashStats());
      })
      .catch((error: Error) => {
        toast.error(error.message || "Failed to toggle splash screen status");
      });
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingSplash) {
        handleUpdateSplash();
      } else {
        handleAddSplash();
      }
    }
  };

  // Handle form cancel
  const handleCancelEdit = () => {
    setEditingSplash(null);
    resetForm();
  };

  // Reset form function
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setSelectedProductId("");
    setIsActive(true);
    setDisplayOrder(0);
    setStartDate("");
    setEndDate("");
    setButtonText("");
    setButtonLink("");
    setBackgroundColor("#6366f1");
    setTextColor("#ffffff");
  };

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSplashIds(
        filteredSplashScreens.map((splash: Splash) => splash.id)
      );
    } else {
      setSelectedSplashIds([]);
    }
  };

  const handleSelectSplash = (splashId: string, checked: boolean) => {
    if (checked) {
      setSelectedSplashIds([...selectedSplashIds, splashId]);
    } else {
      setSelectedSplashIds(selectedSplashIds.filter((id) => id !== splashId));
    }
  };

  // Bulk operations
  const handleBulkStatusUpdate = (status: boolean) => {
    if (selectedSplashIds.length === 0) {
      toast.error("Please select splash screens to update");
      return;
    }

    dispatch(
      bulkUpdateSplashStatus({ ids: selectedSplashIds, isActive: status })
    )
      .then(() => {
        toast.success(
          `${selectedSplashIds.length} splash screens ${
            status ? "activated" : "deactivated"
          } successfully`
        );
        setSelectedSplashIds([]);
        setShowBulkActions(false);
        dispatch(getAllSplash());
        dispatch(getSplashStats());
      })
      .catch((error: Error) => {
        toast.error(error.message || "Failed to update splash screens");
      });
  };

  // Show bulk actions when items are selected
  useEffect(() => {
    setShowBulkActions(selectedSplashIds.length > 0);
  }, [selectedSplashIds]);

  if (loading || productsLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
            <p className="text-black text-lg font-medium">
              Loading splash screens...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen my-10 bg-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-2">
            Splash Screens
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage your splash screens to showcase products and promotional
            content
          </p>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-600 text-sm font-medium">Total</p>
                <p className="text-blue-800 text-2xl font-bold">
                  {stats.total}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-600 text-sm font-medium">Active</p>
                <p className="text-green-800 text-2xl font-bold">
                  {stats.active}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-red-600 text-sm font-medium">Inactive</p>
                <p className="text-red-800 text-2xl font-bold">
                  {stats.inactive}
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-purple-600 text-sm font-medium">
                  With Products
                </p>
                <p className="text-purple-800 text-2xl font-bold">
                  {stats.withProducts}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-orange-600 text-sm font-medium">Scheduled</p>
                <p className="text-orange-800 text-2xl font-bold">
                  {stats.scheduled}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
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

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-blue-700 font-medium">
                  {selectedSplashIds.length} splash screen
                  {selectedSplashIds.length !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkStatusUpdate(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Activate All</span>
                </button>
                <button
                  onClick={() => handleBulkStatusUpdate(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Deactivate All</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedSplashIds([]);
                    setShowBulkActions(false);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search, Filter and Export Section */}
        <div className="mb-6 sm:mb-8 bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Filter by Product
              </label>
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">All Products</option>
                {products.map((product: Product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Search Splash Screens
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Export Data
              </label>
              <button
                onClick={exportToCSV}
                disabled={filteredSplashScreens.length === 0}
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredSplashScreens.length} of {splashScreens.length}{" "}
            splash screens
          </div>
        </div>

        {/* Add/Edit Splash Form */}
        <div className="mb-6 sm:mb-8 bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-black mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  editingSplash
                    ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                }
              />
            </svg>
            {editingSplash ? "Edit Splash Screen" : "Add New Splash Screen"}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter splash screen title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Associated Product
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              >
                <option value="">No Product Association</option>
                {products.map((product: Product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2 lg:col-span-2">
              <label className="block text-sm font-semibold text-black">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter splash screen description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Image URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Display Order
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Start Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                End Date (Optional)
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Button Text */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Button Text
              </label>
              <input
                type="text"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                placeholder="Shop Now"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Button Link */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Button Link
              </label>
              <input
                type="text"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                placeholder="/products"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Background Color
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#6366f1"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-black">
                Text Color
              </label>
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Active Status */}
            <div className="space-y-2 lg:col-span-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="text-sm font-semibold text-black">
                  Active (visible to users)
                </span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={editingSplash ? handleUpdateSplash : handleAddSplash}
              disabled={!title.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-green-600 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    editingSplash
                      ? "M5 13l4 4L19 7"
                      : "M12 6v6m0 0v6m0-6h6m-6 0H6"
                  }
                />
              </svg>
              <span>{editingSplash ? "Update" : "Add"} Splash Screen</span>
            </button>

            {editingSplash && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Splash Screens List */}
        {filteredSplashScreens.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4v10a2 2 0 002 2h6a2 2 0 002-2V8M9 8h6M9 12h6m-3 4h3"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No splash screens found
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter || productFilter
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first splash screen"}
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
                      <input
                        type="checkbox"
                        checked={
                          selectedSplashIds.length ===
                            filteredSplashScreens.length &&
                          filteredSplashScreens.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSplashScreens.map((splash: Splash) => (
                    <tr
                      key={splash.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSplashIds.includes(splash.id)}
                          onChange={(e) =>
                            handleSelectSplash(splash.id, e.target.checked)
                          }
                          className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {(splash.imageUrl || splash.image_url) && (
                            <img
                              src={splash.imageUrl || splash.image_url}
                              alt={splash.title}
                              className="w-10 h-10 rounded-lg object-cover mr-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-semibold text-black">
                              {splash.title}
                            </div>
                            {splash.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {splash.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {splash.productId || splash.product_id
                            ? getProductName(
                                splash.productId || splash.product_id
                              )
                            : "No Product"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(splash)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            splash.isActive || splash.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          } transition-colors cursor-pointer`}
                        >
                          {splash.isActive || splash.is_active
                            ? "Active"
                            : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {splash.displayOrder || splash.display_order || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {(splash.startDate || splash.start_date) && (
                            <div>
                              Start:{" "}
                              {new Date(
                                splash.startDate || splash.start_date
                              ).toLocaleDateString()}
                            </div>
                          )}
                          {(splash.endDate || splash.end_date) && (
                            <div>
                              End:{" "}
                              {new Date(
                                splash.endDate || splash.end_date
                              ).toLocaleDateString()}
                            </div>
                          )}
                          {!(splash.startDate || splash.start_date) &&
                            !(splash.endDate || splash.end_date) && (
                              <span className="text-gray-400">
                                Always Active
                              </span>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        <button
                          onClick={() => handleEditClick(splash)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(splash)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
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
              {filteredSplashScreens.map((splash: Splash) => (
                <div
                  key={splash.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedSplashIds.includes(splash.id)}
                        onChange={(e) =>
                          handleSelectSplash(splash.id, e.target.checked)
                        }
                        className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {(splash.imageUrl || splash.image_url) && (
                            <img
                              src={splash.imageUrl || splash.image_url}
                              alt={splash.title}
                              className="w-12 h-12 rounded-lg object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-black">
                              {splash.title}
                            </h3>
                            <button
                              onClick={() => handleToggleStatus(splash)}
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                splash.isActive || splash.is_active
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              } transition-colors`}
                            >
                              {splash.isActive || splash.is_active
                                ? "Active"
                                : "Inactive"}
                            </button>
                          </div>
                        </div>

                        {splash.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {splash.description}
                          </p>
                        )}

                        <div className="text-sm text-gray-500 space-y-1">
                          <p>
                            Product:{" "}
                            {splash.productId || splash.product_id
                              ? getProductName(
                                  splash.productId || splash.product_id
                                )
                              : "No Product"}
                          </p>
                          <p>
                            Display Order:{" "}
                            {splash.displayOrder || splash.display_order || 0}
                          </p>
                          {(splash.startDate || splash.start_date) && (
                            <p>
                              Start:{" "}
                              {new Date(
                                splash.startDate || splash.start_date
                              ).toLocaleDateString()}
                            </p>
                          )}
                          {(splash.endDate || splash.end_date) && (
                            <p>
                              End:{" "}
                              {new Date(
                                splash.endDate || splash.end_date
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEditClick(splash)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(splash)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
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
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-black">Confirm Delete</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the splash screen{" "}
                <span className="font-semibold text-black">
                  "{splashToDelete?.title}"
                </span>
                ? This action cannot be undone.
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
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

export default SplashScreens;
