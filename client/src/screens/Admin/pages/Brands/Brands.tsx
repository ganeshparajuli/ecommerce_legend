import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createBrand,
  deleteBrand,
  updateBrand,
  getAllBrands,
} from "../../../../redux/actions/brandAction";
import type { Brand } from "../../../../redux/constants/brandConstants";
import toast from "react-hot-toast";
import type { RootState } from "../../../../redux/store";
import { BrandImage } from "../../../../utils/imageHelper";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  Download,
  FileText,
} from "lucide-react";

// CSV Export Utilities
const convertToCSV = (data: any[], headers: string[]): string => {
  if (!data.length) return "";

  const csvHeaders = headers.join(",");
  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header];
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || "";
      })
      .join(",");
  });

  return [csvHeaders, ...csvRows].join("\n");
};

const downloadCSV = (csvContent: string, filename: string): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const Brands = () => {
  const dispatch = useDispatch();
  const {
    brands,
    loading,
    error: brandError,
  } = useSelector((state: RootState) => state.brand);

  console.log(brands, " brands from redux");

  // State variables
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Fetch all brands when the component mounts
  useEffect(() => {
    dispatch(getAllBrands() as any);
  }, [dispatch]);

  // Set error from redux state
  useEffect(() => {
    if (brandError) {
      setError(brandError);
    }
  }, [brandError]);

  // Filter brands based on search query
  const filteredBrands = brands.filter((brand: Brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle CSV Export
  const handleExportBrands = async (): Promise<void> => {
    if (!brands.length) {
      toast.error("No brands data available to export");
      return;
    }

    setExporting(true);
    try {
      const formattedData = brands.map((brand) => ({
        "Brand ID": brand.id || "",
        Name: brand.name || "",
        Slug: brand.slug || "",
        Image: brand.image || "No Image",
        "Created Date": brand.createdAt
          ? new Date(brand.createdAt).toLocaleDateString()
          : "N/A",
        "Updated Date": brand.updatedAt
          ? new Date(brand.updatedAt).toLocaleDateString()
          : "N/A",
      }));

      const headers = [
        "Brand ID",
        "Name",
        "Slug",
        "Image",
        "Created Date",
        "Updated Date",
      ];
      const csvContent = convertToCSV(formattedData, headers);
      const filename = `brands_export_${
        new Date().toISOString().split("T")[0]
      }.csv`;

      downloadCSV(csvContent, filename);
      toast.success(`Exported ${brands.length} brands successfully`);
    } catch (error) {
      console.error("Error exporting brands:", error);
      toast.error("Failed to export brands. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBrandImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBrandImage(null);
      setImagePreview(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setBrandName("");
    setBrandImage(null);
    setImagePreview(null);
    setEditingBrand(null);
  };

  const handleAddBrand = () => {
    if (!brandName.trim()) {
      toast.error("Brand name cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("name", brandName.trim());
    if (brandImage) {
      formData.append("image", brandImage);
    }

    dispatch(createBrand(formData) as any)
      .then(() => {
        toast.success("Brand created successfully");
        resetForm();
        dispatch(getAllBrands() as any);
      })
      .catch((error: Error) => {
        toast.error(error.message || "Failed to create brand");
      });
  };

  const handleEditClick = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    // Set current image preview if exists
    if (brand.image) {
      const baseUrl = import.meta.env.VITE_IMAGE_SERVER_URL;
      setImagePreview(`${baseUrl}/uploads/${brand.image}`);
    }
  };

  const handleUpdateBrand = () => {
    if (!brandName.trim() || !editingBrand) {
      toast.error("Brand name cannot be empty");
      return;
    }

    const formData = new FormData();
    formData.append("name", brandName.trim());
    if (brandImage) {
      formData.append("image", brandImage);
    }

    dispatch(updateBrand(editingBrand.id, formData) as any)
      .then(() => {
        toast.success("Brand updated successfully");
        resetForm();
        dispatch(getAllBrands() as any);
      })
      .catch((error: Error) => {
        toast.error(error.message || "Failed to update brand");
      });
  };

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (!brandToDelete) return;

    dispatch(deleteBrand(brandToDelete.id) as any)
      .then(() => {
        toast.success(`Brand ${brandToDelete.name} deleted successfully`);
        setShowDeleteModal(false);
        setBrandToDelete(null);
        dispatch(getAllBrands() as any);
      })
      .catch((error: Error) => {
        toast.error(error.message || "Failed to delete brand");
      });
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setBrandToDelete(null);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editingBrand) {
        handleUpdateBrand();
      } else {
        handleAddBrand();
      }
    }
  };

  // Handle form cancel
  const handleCancelEdit = () => {
    resetForm();
  };

  // Remove image preview
  const handleRemoveImage = () => {
    setBrandImage(null);
    setImagePreview(null);
  };

  // Refresh brands
  const handleRefresh = () => {
    dispatch(getAllBrands() as any);
    toast.success("Brands refreshed");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-2xl">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-t-green-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            Loading Brands...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-10 sm:space-y-6 max-w-full">
      <br></br>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">
              Brand Management
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Manage your brand collection ({brands.length} total)
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <motion.button
              onClick={handleExportBrands}
              disabled={!brands.length || exporting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm sm:text-base min-w-[120px]"
            >
              {exporting ? (
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </motion.button>
            <motion.button
              onClick={handleRefresh}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-medium text-sm sm:text-base min-w-[120px]"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start"
          >
            <AlertCircle
              className="text-red-500 mr-3 flex-shrink-0 mt-0.5"
              size={18}
            />
            <div className="flex-1">
              <p className="text-red-700 text-sm sm:text-base font-medium">
                {error}
              </p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 ml-3"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands by name..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm sm:text-base"
          />
        </div>
      </motion.div>

      {/* Add/Edit Brand Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100"
      >
        <div className="flex items-center mb-4 sm:mb-6">
          <div
            className={`p-2 sm:p-3 rounded-xl mr-3 ${
              editingBrand ? "bg-blue-100" : "bg-green-100"
            }`}
          >
            {editingBrand ? (
              <Edit2
                className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  editingBrand ? "text-blue-600" : "text-green-600"
                }`}
              />
            ) : (
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-black">
            {editingBrand ? "Edit Brand" : "Add New Brand"}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Left Column - Form Fields */}
          <div className="space-y-4 sm:space-y-6">
            {/* Brand Name Input */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Brand Name *
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter brand name"
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm sm:text-base"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Brand Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="brand-image-upload"
                />
                <label
                  htmlFor="brand-image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 text-center">
                    Click to upload image
                    <br />
                    <span className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={editingBrand ? handleUpdateBrand : handleAddBrand}
                disabled={!brandName.trim()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed hover:from-green-700 hover:to-green-800 transition-all font-medium text-sm sm:text-base"
              >
                {editingBrand ? "Update Brand" : "Add Brand"}
              </motion.button>
              {editingBrand && (
                <motion.button
                  onClick={handleCancelEdit}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 sm:flex-none px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all font-medium text-sm sm:text-base"
                >
                  Cancel
                </motion.button>
              )}
            </div>
          </div>

          {/* Right Column - Image Preview */}
          <div className="flex items-center justify-center">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Brand Preview"
                  className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-2xl border border-gray-200 shadow-lg"
                />
                <motion.button
                  onClick={handleRemoveImage}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg hover:bg-red-600 shadow-lg"
                  type="button"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            ) : (
              <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
                <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 text-center">
                  Image preview will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Brands List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {filteredBrands.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm sm:text-base font-medium">
              {searchQuery ? "No brands match your search" : "No brands found"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-sm text-green-600 hover:text-green-700 underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBrands.map((brand: Brand, index: number) => (
                    <motion.tr
                      key={brand.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {brand.image ? (
                          <img
                            src={`${
                              import.meta.env.VITE_IMAGE_SERVER_URL
                            }/uploads/${brand.image}`}
                            alt={brand.name}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.jpg";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-black">
                        {brand.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {brand.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <div className="flex justify-end space-x-3">
                          <motion.button
                            onClick={() => handleEditClick(brand)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteClick(brand)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="text-red-600 hover:text-red-800 font-medium flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredBrands.map((brand: Brand, index: number) => (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {brand.image ? (
                      <img
                        src={`${
                          import.meta.env.VITE_IMAGE_SERVER_URL
                        }/uploads/${brand.image}`}
                        alt={brand.name}
                        className="w-16 h-16 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-black truncate">
                        {brand.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {brand.slug}
                      </p>
                      <div className="flex space-x-4 mt-2">
                        <motion.button
                          onClick={() => handleEditClick(brand)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteClick(brand)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCancelDelete}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-xl mr-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-black">Confirm Delete</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete the brand "{brandToDelete?.name}
                "? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  onClick={handleCancelDelete}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-all font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleConfirmDelete}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium"
                >
                  Delete Brand
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Brands;
