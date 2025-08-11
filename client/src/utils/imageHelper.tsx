import React, { useState, useEffect, useRef } from "react";

// Base URL for images - use environment variable or default
const IMAGE_SERVER_URL = import.meta.env.VITE_IMAGE_SERVER_URL || window.location.origin ;

// Types for image sources
type ImageSource = string | string[] | Record<string, any> | null | undefined;

/**
 * Parse image data from various formats into an array
 */
export const parseProductImages = (imageData: ImageSource): string[] => {
  if (!imageData) return [];

  try {
    // Case 1: Already an array
    if (Array.isArray(imageData)) {
      return imageData.filter((img) => img && typeof img === "string");
    }

    // Case 2: String (could be JSON or single path)
    if (typeof imageData === "string") {
      // Empty string
      if (!imageData.trim()) return [];

      // JSON array string
      if (imageData.trim().startsWith("[") && imageData.trim().endsWith("]")) {
        try {
          const parsed = JSON.parse(imageData);
          if (Array.isArray(parsed)) {
            return parsed.filter((img) => img && typeof img === "string");
          }
        } catch (e) {
          console.warn("Failed to parse image JSON:", e);
          return [imageData]; // Fallback to treating as single image
        }
      }

      // Single image path
      return [imageData];
    }

    // Case 3: Object with image property
    if (typeof imageData === "object" && imageData !== null) {
      const possibleKeys = ["image", "images", "src", "url"];
      for (const key of possibleKeys) {
        if (imageData[key]) {
          return parseProductImages(imageData[key]);
        }
      }
    }

    return [];
  } catch (error) {
    console.error("Error parsing product images:", error);
    return [];
  }
};

/**
 * Get a specific image URL by index
 */
export const getImageUrl = (
  imageData: ImageSource,
  index = 0,
  debug = false
): string | null => {
  const images = parseProductImages(imageData);

  if (debug) {
    console.log("ImageHelper Debug:", {
      originalData: imageData,
      parsedImages: images,
      requestedIndex: index,
      totalImages: images.length,
    });
  }

  if (images.length === 0 || index >= images.length || index < 0) {
    return null;
  }

  const imagePath = images[index];
  if (!imagePath) return null;

  let normalizedPath = imagePath;

  // Handle absolute URLs
  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    return normalizedPath;
  }

  // Fix backslashes (Windows paths)
  normalizedPath = normalizedPath.replace(/\\/g, "/");

  // Remove leading slash if present
  if (normalizedPath.startsWith("/")) {
    normalizedPath = normalizedPath.substring(1);
  }

  // ✅ ADD UPLOADS PREFIX HERE
  // Since backend serves from /uploads/, we need to add it if not present
  if (!normalizedPath.startsWith("uploads/")) {
    normalizedPath = `uploads/${normalizedPath}`;
  }

  // Construct final URL
  const finalUrl = `${IMAGE_SERVER_URL}/${normalizedPath}`;

  if (debug) {
    console.log("Final image URL:", finalUrl);
  }

  return finalUrl;
};

/**
 * Get all image URLs
 */
export const getAllImageUrls = (imageData: ImageSource): string[] => {
  const images = parseProductImages(imageData);
  return images
    .map((_, index) => getImageUrl(imageData, index))
    .filter((url): url is string => url !== null);
};

/**
 * Enhanced Image component with better error handling
 */
interface ImageProps {
  src: ImageSource;
  alt?: string;
  className?: string;
  index?: number;
  fallbackUrl?: string;
  onClick?: () => void;
  debug?: boolean;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt = "Image",
  className = "w-full h-auto",
  index = 0,
  fallbackUrl = "/placeholder.jpg",
  onClick,
  debug = false,
  onLoad,
  onError,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 1;
  const imgRef = useRef<HTMLImageElement>(null);
  const isMountedRef = useRef(true);

  // Get the image URL
  const imageUrl = getImageUrl(src, index, debug);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMountedRef.current) return;

    // Reset all states when source changes (this fixes navigation)
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);

    if (imageUrl) {
      setCurrentSrc(imageUrl);
      if (debug) {
        console.log("Setting image URL:", imageUrl);
      }
    } else {
      setCurrentSrc(fallbackUrl);
      setIsLoading(false);
      if (debug) {
        console.log("No valid image URL, using fallback:", fallbackUrl);
      }
    }
  }, [imageUrl, fallbackUrl, debug]); // Removed isComponentMounted dependency

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!isMountedRef.current) return;

    if (debug) {
      console.error("Image load error:", {
        src: currentSrc,
        retryCount,
        maxRetries,
        originalSrc: imageUrl,
      });
    }

    // Only retry if we haven't exceeded max retries and we're not already on fallback
    if (retryCount < maxRetries && imageUrl && currentSrc !== fallbackUrl) {
      setRetryCount((prev) => prev + 1);
      // Simple retry without cache busting (which can cause issues)
      setTimeout(() => {
        if (isMountedRef.current && imageUrl) {
          setCurrentSrc(imageUrl);
        }
      }, 100);
    } else {
      // Final fallback
      if (!hasError && isMountedRef.current) {
        setHasError(true);
        setCurrentSrc(fallbackUrl);
        setIsLoading(false);
        onError?.(e);
      }
    }
  };

  const handleLoad = () => {
    if (isMountedRef.current) {
      setIsLoading(false);
      setHasError(false); // Reset error state on successful load
      onLoad?.();
    }
  };

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={handleError}
      onLoad={handleLoad}
      loading="eager" // FIXED: Changed from lazy to eager for critical images like logos
      key={imageUrl} // FIXED: Force re-render when URL changes
    />
  );
};

/**
 * Specialized Product Image component
 */
export const ProductImage: React.FC<ImageProps> = (props) => {
  return (
    <Image
      {...props}
      alt={props.alt || "Product image"}
      className={props.className || "w-full h-64 object-cover"}
    />
  );
};

/**
 * Product Image Gallery component
 */
interface ProductImageGalleryProps {
  images: ImageSource;
  className?: string;
  imageClassName?: string;
  maxImages?: number;
  debug?: boolean;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  className = "grid grid-cols-2 md:grid-cols-3 gap-4",
  imageClassName = "w-full h-32 object-cover rounded-lg",
  maxImages = 10,
  debug = false,
}) => {
  const imageUrls = getAllImageUrls(images).slice(0, maxImages);

  if (imageUrls.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center justify-center bg-gray-200 rounded-lg h-32">
          <span className="text-gray-500">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {imageUrls.map((url, index) => (
        <ProductImage
          key={index}
          src={images}
          index={index}
          className={imageClassName}
          debug={debug}
        />
      ))}
    </div>
  );
};

/**
 * Main Product Image with Thumbnails
 */
interface ProductImageViewerProps {
  images: ImageSource;
  className?: string;
  debug?: boolean;
}

export const ProductImageViewer: React.FC<ProductImageViewerProps> = ({
  images,
  className = "",
  debug = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const imageUrls = getAllImageUrls(images);

  if (imageUrls.length === 0) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gray-200 rounded-lg h-64`}
      >
        <span className="text-gray-500">No images available</span>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Main Image */}
      <div className="mb-4">
        <ProductImage
          src={images}
          index={selectedIndex}
          className="w-full h-64 md:h-96 object-cover rounded-lg"
          debug={debug}
        />
      </div>

      {/* Thumbnails */}
      {imageUrls.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`border-2 rounded-lg overflow-hidden ${
                selectedIndex === index
                  ? "border-blue-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <ProductImage
                src={images}
                index={index}
                className="w-full h-16 object-cover"
                debug={debug}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Other specialized components
export const UserImage: React.FC<ImageProps> = (props) => {
  return (
    <Image
      {...props}
      alt={props.alt || "User profile"}
      className={props.className || "w-12 h-12 rounded-full object-cover"}
    />
  );
};

export const BrandImage: React.FC<ImageProps> = (props) => {
  return (
    <Image
      {...props}
      alt={props.alt || "Brand logo"}
      className={props.className || "w-12 h-12 object-contain"}
    />
  );
};
export const StoreImage: React.FC<ImageProps> = (props) => {
  return (
    <Image
      {...props}
      alt={props.alt || "Store logo"}
      className={props.className || "w-12 h-12 object-contain"}
    />
  );
};

export const CategoryImage: React.FC<ImageProps> = (props) => {
  return (
    <Image
      {...props}
      alt={props.alt || "Category image"}
      className={props.className || "w-full h-32 object-cover"}
    />
  );
};

// Backwards compatibility
export const getProductImageUrl = getImageUrl;
export const getUserImageUrl = getImageUrl;
export const getCategoryImageUrl = getImageUrl;

// Default export
export default {
  // Core functions
  parseProductImages,
  getImageUrl,
  getAllImageUrls,

  // Components
  Image,
  ProductImage,
  ProductImageGallery,
  ProductImageViewer,
  UserImage,
  BrandImage,
  CategoryImage,

  // Backwards compatibility
  getProductImageUrl,
  getUserImageUrl,
  getCategoryImageUrl,
};
