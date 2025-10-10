import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getActiveSplash } from "../redux/actions/splashAction";
import type { RootState } from "../redux/store";
// import { Button } from "./ui/button";

interface SplashScreenProps {
  onClose: () => void;
  isVisible: boolean;
}

interface SplashItem {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  imageUrl?: string;
  product_id?: string;
  productId?: string;
  product_name?: string;
  product_price?: number;
  button_text?: string;
  buttonText?: string;
  button_link?: string;
  buttonLink?: string;
  background_color?: string;
  backgroundColor?: string;
  text_color?: string;
  textColor?: string;
  display_order: number;
  displayOrder?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onClose,
  isVisible,
}) => {
  const dispatch = useDispatch();
  const { activeSplashScreens, loading } = useSelector(
    (state: RootState) => state.splash
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Fetch active splash screens on mount
  useEffect(() => {
    if (isVisible) {
      dispatch(getActiveSplash() as any);
    }
  }, [dispatch, isVisible]);

  // Auto-advance slides
  useEffect(() => {
    if (isAutoPlaying && activeSplashScreens?.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % activeSplashScreens.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying, activeSplashScreens?.length]);

  // Handle navigation
  const goToNext = useCallback(() => {
    if (activeSplashScreens?.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % activeSplashScreens.length);
    }
  }, [activeSplashScreens?.length]);

  const goToPrev = useCallback(() => {
    if (activeSplashScreens?.length > 1) {
      setCurrentIndex(
        (prev) =>
          (prev - 1 + activeSplashScreens.length) % activeSplashScreens.length
      );
    }
  }, [activeSplashScreens?.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Handle manual navigation (stops auto-play temporarily)
  const handleManualNavigation = (callback: () => void) => {
    setIsAutoPlaying(false);
    callback();
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  // Don't render if not visible or no splash screens
  if (!isVisible || !activeSplashScreens?.length) {
    return null;
  }

  const currentSplash = activeSplashScreens[currentIndex];
  const backgroundStyle = {
    backgroundColor:
      currentSplash.background_color || currentSplash.backgroundColor,
    color: currentSplash.text_color || currentSplash.textColor || "#ffffff",
  };

  const imageUrl = currentSplash.image_url || currentSplash.imageUrl;
  const buttonText = currentSplash.button_text || currentSplash.buttonText;
  const buttonLink = currentSplash.button_link || currentSplash.buttonLink;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-4xl mx-4 h-[80vh] max-h-[600px] rounded-2xl overflow-hidden shadow-2xl"
          style={backgroundStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Background Image */}
          {imageUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Arrows (only show if multiple splash screens) */}
          {activeSplashScreens.length > 1 && (
            <>
              <button
                onClick={() => handleManualNavigation(goToPrev)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={() => handleManualNavigation(goToNext)}
                className="absolute right-16 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors backdrop-blur-sm"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-center p-8">
            <div className="text-center max-w-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Title */}
                  <motion.h1
                    className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
                    style={{
                      color:
                        currentSplash.text_color ||
                        currentSplash.textColor ||
                        "#ffffff",
                    }}
                  >
                    {currentSplash.title}
                  </motion.h1>

                  {/* Description */}
                  {currentSplash.description && (
                    <motion.p
                      className="text-lg md:text-xl opacity-90 max-w-xl mx-auto leading-relaxed"
                      style={{
                        color:
                          currentSplash.text_color ||
                          currentSplash.textColor ||
                          "#ffffff",
                      }}
                    >
                      {currentSplash.description}
                    </motion.p>
                  )}

                  {/* Product Info */}
                  {currentSplash.product_name && (
                    <motion.div className="bg-black/10 backdrop-blur-sm rounded-lg p-4 inline-block">
                      <p className="text-sm opacity-75 mb-1">
                        Featured Product
                      </p>
                      <p className="font-semibold text-lg">
                        {currentSplash.product_name}
                      </p>
                      {currentSplash.product_price && (
                        <p className="text-xl font-bold mt-1">
                          ₨{currentSplash.product_price.toLocaleString()}
                        </p>
                      )}
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    {buttonText && buttonLink && (
                      <div onClick={onClose}>
                        {buttonLink.startsWith("http") ? (
                          <a
                            href={buttonLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                          >
                            {buttonText}
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        ) : (
                          <Link
                            to={buttonLink}
                            className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                          >
                            {buttonText}
                          </Link>
                        )}
                      </div>
                    )}

                    <button
                      onClick={onClose}
                      className="px-6 py-3 border-2 border-white/50 text-white font-medium rounded-full hover:bg-white/10 transition-colors"
                    >
                      Continue Browsing
                    </button>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Slide Indicators */}
          {activeSplashScreens.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
              {activeSplashScreens.map((_, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleManualNavigation(() => setCurrentIndex(index))
                  }
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
