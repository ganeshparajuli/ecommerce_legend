import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Settings as SettingsIcon,
  Store,
  Phone,
  Mail,
  MapPin,
  Upload,
  Save,
  X,
  Plus,
  Edit3,
  Trash2,
  Building,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import toast from "react-hot-toast";
import type { RootState, AppDispatch } from "../../../../redux/store";
import {
  updateStoreSettings,
  getStoreSettings,
  resetStoreSettingsState,
  clearSettingsErrors,
  // Sub-store location actions
  getStoreLocations,
  addStoreLocation,
  updateStoreLocation,
  deleteStoreLocation,
  toggleStoreLocationStatus,
  clearStoreLocationsError,
  resetStoreLocationOperation,
} from "../../../../redux/actions/settingsAction";
import type {
  StoreSettings,
  StoreLocation,
} from "../../../../redux/constants/settingsConstants";
import { getImageUrl } from "../../../../utils/imageHelper";

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const {
    storeSettings: reduxStoreSettings,
    storeLoading,
    storeError,
    storeSuccess,
    storeUpdated,
    logoUploading,
    footerLogoUploading,
    // Sub-store locations state
    locations,
    selectedLocation,
    locationsLoading,
    locationsError,
    locationOperationLoading,
    locationOperationSuccess,
    locationOperationError,
  } = useSelector((state: RootState) => state.settings);

  // Local form state
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    logo: "",
    footerLogo: "",
  });

  // Sub-store locations local state
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(
    null
  );
  const [newLocation, setNewLocation] = useState<Partial<StoreLocation>>({
    locationName: "",
    address: "",
    phone: "",
    email: "",
    isActive: true,
  });

  // File upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [footerLogoPreview, setFooterLogoPreview] = useState<string | null>(
    null
  );

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load settings and locations on component mount
  useEffect(() => {
    console.log("Loading store settings and locations on mount...");
    dispatch(getStoreSettings());
    dispatch(getStoreLocations());
  }, [dispatch]);

  // Update local state when Redux state changes
  useEffect(() => {
    console.log("Redux store settings changed:", reduxStoreSettings);
    if (reduxStoreSettings) {
      const normalizedSettings = {
        storeName:
          reduxStoreSettings.storeName || reduxStoreSettings.store_name || "",
        storeEmail:
          reduxStoreSettings.storeEmail || reduxStoreSettings.store_email || "",
        storePhone:
          reduxStoreSettings.storePhone || reduxStoreSettings.store_phone || "",
        storeAddress:
          reduxStoreSettings.storeAddress ||
          reduxStoreSettings.store_address ||
          "",
        logo: reduxStoreSettings.logo || "",
        footerLogo:
          reduxStoreSettings.footerLogo || reduxStoreSettings.footer_logo || "",
        storeDescription:
          reduxStoreSettings.storeDescription ||
          reduxStoreSettings.store_description ||
          "",
        website: reduxStoreSettings.website || "",
        socialMedia:
          reduxStoreSettings.socialMedia ||
          reduxStoreSettings.social_media ||
          {},
        businessHours:
          reduxStoreSettings.businessHours ||
          reduxStoreSettings.business_hours ||
          {},
        currency: reduxStoreSettings.currency || "NPR",
        timezone: reduxStoreSettings.timezone || "Asia/Kathmandu",
        ...reduxStoreSettings,
      };
      console.log("Normalized settings:", normalizedSettings);
      setStoreSettings(normalizedSettings);
    }
  }, [reduxStoreSettings]);

  // Handle success messages
  useEffect(() => {
    if (storeSuccess && storeUpdated) {
      toast.success("Store settings saved successfully!");
      dispatch(resetStoreSettingsState());
    }
  }, [storeSuccess, storeUpdated, dispatch]);

  useEffect(() => {
    if (locationOperationSuccess) {
      toast.success("Location operation completed successfully!");
      dispatch(resetStoreLocationOperation());
      handleCancelLocationEdit();
    }
  }, [locationOperationSuccess, dispatch]);

  // Handle error messages
  useEffect(() => {
    if (storeError) {
      toast.error(storeError);
      dispatch(clearSettingsErrors());
    }
  }, [storeError, dispatch]);

  useEffect(() => {
    if (locationsError || locationOperationError) {
      toast.error(locationsError || locationOperationError);
      dispatch(clearStoreLocationsError());
    }
  }, [locationsError, locationOperationError, dispatch]);

  // ===== SUB-STORE LOCATION MANAGEMENT =====

  const handleAddLocation = () => {
    setIsAddingLocation(true);
    setEditingLocationId(null);
    setNewLocation({
      locationName: "",
      address: "",
      phone: "",
      email: "",
      isActive: true,
    });
  };

  const handleEditLocation = (location: StoreLocation) => {
    setIsAddingLocation(true);
    setEditingLocationId(location.id);
    setNewLocation({ ...location });
  };

  const handleSaveLocation = async () => {
    // Validate location
    if (!newLocation.locationName?.trim()) {
      toast.error("Location name is required");
      return;
    }
    if (!newLocation.address?.trim()) {
      toast.error("Address is required");
      return;
    }
    if (!newLocation.phone?.trim()) {
      toast.error("Phone number is required");
      return;
    }

    try {
      if (editingLocationId) {
        // Update existing location
        await dispatch(
          updateStoreLocation(
            editingLocationId,
            newLocation as Partial<StoreLocation>
          )
        );
      } else {
        // Add new location
        await dispatch(
          addStoreLocation(
            newLocation as Omit<StoreLocation, "id" | "createdAt" | "updatedAt">
          )
        );
      }
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await dispatch(deleteStoreLocation(locationId));
      } catch (error) {
        console.error("Error deleting location:", error);
      }
    }
  };

  const handleToggleLocationStatus = async (locationId: string) => {
    try {
      await dispatch(toggleStoreLocationStatus(locationId));
    } catch (error) {
      console.error("Error toggling location status:", error);
    }
  };

  const handleCancelLocationEdit = () => {
    setIsAddingLocation(false);
    setEditingLocationId(null);
    setNewLocation({
      locationName: "",
      address: "",
      phone: "",
      email: "",
      isActive: true,
    });
  };

  // ===== FILE UPLOAD HANDLERS =====

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Logo file selected:", file.name, file.size, file.type);

      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Logo preview created");
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setLogoFile(null);
      setLogoPreview(null);
    }
  };

  const handleFooterLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log(
        "Footer logo file selected:",
        file.name,
        file.size,
        file.type
      );

      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setFooterLogoFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Footer logo preview created");
        setFooterLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFooterLogoFile(null);
      setFooterLogoPreview(null);
    }
  };

  // ===== FORM VALIDATION =====

  const validateStoreSettings = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      storeSettings?.storeName?.trim() &&
      storeSettings.storeName.trim().length < 2
    ) {
      newErrors.storeName = "Store name must be at least 2 characters";
    }

    if (storeSettings?.storeEmail?.trim()) {
      if (
        !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
          storeSettings.storeEmail
        )
      ) {
        newErrors.storeEmail = "Invalid email format";
      }
    }

    if (
      storeSettings?.storePhone?.trim() &&
      storeSettings.storePhone.trim().length < 5
    ) {
      newErrors.storePhone = "Phone number must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ===== SAVE HANDLERS =====

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== Save Store Settings Called ===");
    console.log("Store Settings:", storeSettings);
    console.log("Logo File:", logoFile);
    console.log("Footer Logo File:", footerLogoFile);
    console.log("Store Loading:", storeLoading);

    if (!storeSettings || storeLoading) {
      toast.error("Please wait for settings to load");
      return;
    }

    if (!validateStoreSettings()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      const formData = new FormData();

      // Add all text fields
      Object.keys(storeSettings).forEach((key) => {
        if (
          key !== "logo" &&
          key !== "footerLogo" &&
          storeSettings[key] !== null &&
          storeSettings[key] !== undefined
        ) {
          formData.append(key, storeSettings[key].toString());
        }
      });

      // Add files if selected
      if (logoFile) {
        console.log("Adding logo file to request:", logoFile.name);
        formData.append("logo", logoFile);
      }

      if (footerLogoFile) {
        console.log("Adding footer logo file to request:", footerLogoFile.name);
        formData.append("footerLogo", footerLogoFile);
      }

      // Debug FormData contents
      console.log("FormData contents:");
      for (let pair of formData.entries()) {
        console.log(
          pair[0],
          typeof pair[1] === "object"
            ? `File: ${(pair[1] as File).name}`
            : pair[1]
        );
      }

      console.log("Sending all data to PUT endpoint...");
      await dispatch(updateStoreSettings(formData));

      // Clear file inputs and previews on success
      if (logoFile) {
        setLogoFile(null);
        setLogoPreview(null);
        const fileInput = document.getElementById(
          "logoUpload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }

      if (footerLogoFile) {
        setFooterLogoFile(null);
        setFooterLogoPreview(null);
        const fileInput = document.getElementById(
          "footerLogoUpload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }

      // Refresh settings after save
      setTimeout(async () => {
        await dispatch(getStoreSettings());
        console.log("Settings refreshed after save");
      }, 500);
    } catch (error) {
      console.error("Failed to save store settings:", error);
      toast.error("Failed to save settings: " + (error as Error).message);
    }
  };

  // ===== IMAGE DISPLAY COMPONENT =====

  const ImageDisplay = ({
    src,
    alt,
    preview,
  }: {
    src?: string;
    alt: string;
    preview?: string | null;
  }) => {
    const getImageSrc = () => {
      if (preview) {
        console.log("Showing preview for", alt, ":", preview);
        return preview;
      }

      if (src && src.trim()) {
        let imageUrl = getImageUrl(src, 0, false);
        if (imageUrl) {
          const timestamp = new Date().getTime();
          const separator = imageUrl.includes("?") ? "&" : "?";
          imageUrl = `${imageUrl}${separator}_cb=${timestamp}`;
          console.log("Generated image URL for", alt, ":", imageUrl);
        }
        return imageUrl || "/placeholder-logo.png";
      }

      return "/placeholder-logo.png";
    };

    const [imgSrc, setImgSrc] = useState(getImageSrc());
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
      const newSrc = getImageSrc();
      console.log(
        "Image source changing for",
        alt,
        "from",
        imgSrc,
        "to",
        newSrc
      );
      setImgSrc(newSrc);
      setHasError(false);
    }, [src, preview, alt]);

    return (
      <div className="relative">
        <img
          src={imgSrc}
          alt={alt}
          className="h-16 w-auto object-contain rounded-lg shadow-sm border"
          onError={(e) => {
            console.log("Image failed to load for", alt, ":", imgSrc);
            if (!hasError) {
              setHasError(true);
              (e.target as HTMLImageElement).src = "/placeholder-logo.png";
            }
          }}
          onLoad={() => {
            console.log("Image loaded successfully for", alt, ":", imgSrc);
            setHasError(false);
          }}
        />
        {src && src.trim() && !preview && (
          <p className="text-xs text-gray-500 mt-1 truncate max-w-[120px]">
            Current: {src.split("/").pop()}
          </p>
        )}
        {preview && (
          <p className="text-xs text-green-600 mt-1">Preview (unsaved)</p>
        )}
        {hasError && (
          <p className="text-xs text-red-500 mt-1">Failed to load</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen my-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 space-y-8">
        {/* Store Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/70 backdrop-blur-md shadow-xl border border-white/20 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50/50 to-blue-50/30 border-b border-gray-200/50">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <div className="p-2 bg-blue-100 rounded-xl mr-3">
                  <Store className="w-5 h-5 text-blue-600" />
                </div>
                Store Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSaveStoreSettings}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label
                      htmlFor="storeName"
                      className="text-sm font-semibold text-gray-700 flex items-center"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      Store Name
                    </label>
                    <Input
                      id="storeName"
                      value={storeSettings?.storeName || ""}
                      onChange={(e) => {
                        setStoreSettings({
                          ...storeSettings,
                          storeName: e.target.value,
                        });
                        if (errors.storeName)
                          setErrors({ ...errors, storeName: "" });
                      }}
                      placeholder="Enter store name"
                      className={`h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 ${
                        errors.storeName ? "border-red-500" : ""
                      }`}
                    />
                    {errors.storeName && (
                      <p className="text-red-500 text-sm">{errors.storeName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="storeEmail"
                      className="text-sm font-semibold text-gray-700 flex items-center"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email Address
                    </label>
                    <Input
                      id="storeEmail"
                      value={storeSettings?.storeEmail || ""}
                      onChange={(e) => {
                        setStoreSettings({
                          ...storeSettings,
                          storeEmail: e.target.value,
                        });
                        if (errors.storeEmail)
                          setErrors({ ...errors, storeEmail: "" });
                      }}
                      placeholder="Enter store email"
                      type="email"
                      className={`h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 ${
                        errors.storeEmail ? "border-red-500" : ""
                      }`}
                    />
                    {errors.storeEmail && (
                      <p className="text-red-500 text-sm">
                        {errors.storeEmail}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="storePhone"
                      className="text-sm font-semibold text-gray-700 flex items-center"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Phone Number
                    </label>
                    <Input
                      id="storePhone"
                      value={storeSettings?.storePhone || ""}
                      onChange={(e) => {
                        setStoreSettings({
                          ...storeSettings,
                          storePhone: e.target.value,
                        });
                        if (errors.storePhone)
                          setErrors({ ...errors, storePhone: "" });
                      }}
                      placeholder="Enter store phone"
                      className={`h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 ${
                        errors.storePhone ? "border-red-500" : ""
                      }`}
                    />
                    {errors.storePhone && (
                      <p className="text-red-500 text-sm">
                        {errors.storePhone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="storeAddress"
                      className="text-sm font-semibold text-gray-700 flex items-center"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Address
                    </label>
                    <Input
                      id="storeAddress"
                      value={storeSettings?.storeAddress || ""}
                      onChange={(e) => {
                        setStoreSettings({
                          ...storeSettings,
                          storeAddress: e.target.value,
                        });
                        if (errors.storeAddress)
                          setErrors({ ...errors, storeAddress: "" });
                      }}
                      placeholder="Enter store address"
                      className={`h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20 ${
                        errors.storeAddress ? "border-red-500" : ""
                      }`}
                    />
                    {errors.storeAddress && (
                      <p className="text-red-500 text-sm">
                        {errors.storeAddress}
                      </p>
                    )}
                  </div>

                  {/* Store Logo Upload */}
                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor="logoUpload"
                      className="text-sm font-semibold text-gray-700 flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Store Logo
                    </label>

                    <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <ImageDisplay
                        src={storeSettings?.logo}
                        alt="Store Logo"
                        preview={logoPreview}
                      />
                      <div className="flex-1">
                        <Input
                          id="logoUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload PNG, JPG or SVG. Max file size: 2MB
                          <br />
                          <strong>
                            Click "Save Store Settings" below to upload the logo
                          </strong>
                        </p>
                        {logoFile && (
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-sm text-green-600">
                              ✓ {logoFile.name} selected
                            </span>
                            <Button
                              type="button"
                              onClick={() => {
                                console.log("Removing logo file and preview");
                                setLogoFile(null);
                                setLogoPreview(null);
                                const fileInput = document.getElementById(
                                  "logoUpload"
                                ) as HTMLInputElement;
                                if (fileInput) fileInput.value = "";
                              }}
                              size="sm"
                              variant="outline"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Logo Upload */}
                  <div className="space-y-2 md:col-span-2">
                    <label
                      htmlFor="footerLogoUpload"
                      className="text-sm font-semibold text-gray-700 flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Footer Logo
                    </label>

                    <div className="flex items-center space-x-6 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
                      <ImageDisplay
                        src={storeSettings?.footerLogo}
                        alt="Footer Logo"
                        preview={footerLogoPreview}
                      />
                      <div className="flex-1">
                        <Input
                          id="footerLogoUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleFooterLogoChange}
                          className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Upload PNG, JPG or SVG. Max file size: 2MB
                          <br />
                          <strong>
                            Click "Save Store Settings" below to upload the
                            footer logo
                          </strong>
                        </p>
                        {footerLogoFile && (
                          <div className="flex items-center mt-2 space-x-2">
                            <span className="text-sm text-green-600">
                              ✓ {footerLogoFile.name} selected
                            </span>
                            <Button
                              type="button"
                              onClick={() => {
                                console.log(
                                  "Removing footer logo file and preview"
                                );
                                setFooterLogoFile(null);
                                setFooterLogoPreview(null);
                                const fileInput = document.getElementById(
                                  "footerLogoUpload"
                                ) as HTMLInputElement;
                                if (fileInput) fileInput.value = "";
                              }}
                              size="sm"
                              variant="outline"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    type="submit"
                    disabled={storeLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-8 rounded-xl shadow-lg hover:shadow-xl"
                  >
                    {storeLoading ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save Store Settings
                        {(logoFile || footerLogoFile) && (
                          <span className="ml-2 px-2 py-1 bg-white/20 rounded text-xs">
                            +{" "}
                            {[
                              logoFile && "Logo",
                              footerLogoFile && "Footer Logo",
                            ]
                              .filter(Boolean)
                              .join(" & ")}
                          </span>
                        )}
                      </div>
                    )}
                  </Button>

                  {(logoFile || footerLogoFile) && (
                    <p className="text-sm text-blue-600 mt-2">
                      💡 Files selected will be uploaded when you save
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sub-Store Locations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/70 backdrop-blur-md shadow-xl border border-white/20 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50/50 to-red-50/30 border-b border-gray-200/50">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-xl mr-3">
                    <Building className="w-5 h-5 text-orange-600" />
                  </div>
                  Sub-Store Locations
                  <span className="ml-3 px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-lg">
                    {locations.length} Location
                    {locations.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <Button
                  onClick={handleAddLocation}
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  disabled={isAddingLocation || locationOperationLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Location
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Add/Edit Location Form */}
              <AnimatePresence>
                {isAddingLocation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Plus className="w-5 h-5 mr-2 text-green-600" />
                      {editingLocationId ? "Edit Location" : "Add New Location"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Building className="w-4 h-4 mr-2" />
                          Location Name *
                        </label>
                        <Input
                          value={newLocation.locationName || ""}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              locationName: e.target.value,
                            })
                          }
                          placeholder="Enter location name"
                          className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-green-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          Phone Number *
                        </label>
                        <Input
                          value={newLocation.phone || ""}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              phone: e.target.value,
                            })
                          }
                          placeholder="Enter phone number"
                          className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-green-500/20"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Address *
                        </label>
                        <Input
                          value={newLocation.address || ""}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              address: e.target.value,
                            })
                          }
                          placeholder="Enter full address"
                          className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-green-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Email (Optional)
                        </label>
                        <Input
                          value={newLocation.email || ""}
                          onChange={(e) =>
                            setNewLocation({
                              ...newLocation,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter email address"
                          type="email"
                          className="h-12 rounded-xl border-gray-200 focus:ring-2 focus:ring-green-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Status
                        </label>
                        <div className="flex items-center space-x-3 pt-2">
                          <Button
                            type="button"
                            onClick={() =>
                              setNewLocation({
                                ...newLocation,
                                isActive: !newLocation.isActive,
                              })
                            }
                            variant="outline"
                            size="sm"
                            className={`h-12 px-4 rounded-xl ${
                              newLocation.isActive
                                ? "border-green-500 text-green-700 bg-green-50"
                                : "border-gray-300 text-gray-500"
                            }`}
                          >
                            {newLocation.isActive ? (
                              <ToggleRight className="w-5 h-5 mr-2" />
                            ) : (
                              <ToggleLeft className="w-5 h-5 mr-2" />
                            )}
                            {newLocation.isActive ? "Active" : "Inactive"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-6">
                      <Button
                        onClick={handleSaveLocation}
                        disabled={locationOperationLoading}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-12 px-6 rounded-xl"
                      >
                        {locationOperationLoading ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Saving...
                          </div>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {editingLocationId
                              ? "Update Location"
                              : "Save Location"}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleCancelLocationEdit}
                        variant="outline"
                        className="h-12 px-6 rounded-xl"
                        disabled={locationOperationLoading}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Locations List */}
              <div className="space-y-4">
                {locationsLoading ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-lg">
                      Loading locations...
                    </p>
                  </div>
                ) : locations.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      No sub-store locations added yet
                    </p>
                    <p className="text-gray-400 text-sm">
                      Click "Add Location" to create your first sub-store
                      location
                    </p>
                  </div>
                ) : (
                  locations.map((location, index) => (
                    <motion.div
                      key={location.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-6 rounded-2xl border-2 transition-all ${
                        location.isActive
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <Building className="w-4 h-4 mr-2 text-gray-600" />
                              <span className="font-semibold text-gray-900">
                                {location.locationName}
                              </span>
                              <span
                                className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                  location.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {location.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {location.address}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center text-sm text-gray-600 mb-1">
                              <Phone className="w-3 h-3 mr-1" />
                              {location.phone}
                            </div>
                            {location.email && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Mail className="w-3 h-3 mr-1" />
                                {location.email}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              onClick={() =>
                                handleToggleLocationStatus(location.id)
                              }
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 rounded-lg"
                              disabled={locationOperationLoading}
                            >
                              {location.isActive ? (
                                <ToggleRight className="w-4 h-4" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              onClick={() => handleEditLocation(location)}
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 rounded-lg"
                              disabled={
                                locationOperationLoading || isAddingLocation
                              }
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteLocation(location.id)}
                              size="sm"
                              variant="outline"
                              className="h-8 px-3 rounded-lg text-red-600 hover:bg-red-50"
                              disabled={locationOperationLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
