import React, { useState, useEffect } from "react";
import NavbarSection from "./sections/NavbarSection/NavbarSection";
import { HeroSection } from "./sections/HeroSection/HeroSection";
import { PopularBrands } from "../Homepage/sections/PopularBrands/PopularBrands";
import { NewArrivals } from "./sections/NewArrivals/NewArrivals";
import { TopSelling } from "./sections/TopSelling/TopSelling";
import { NewsletterSection } from "./sections/NewsletterSection/NewsletterSection";
import { FooterSection } from "./sections/FooterSection/FooterSection";
import SplashScreen from "../../components/SplashScreen";

export const Homepage = () => {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if user has dismissed splash recently (within last 24 hours)
    const splashDismissed = localStorage.getItem("splashDismissed");
    const lastDismissed = splashDismissed ? parseInt(splashDismissed) : 0;
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    // Show splash if it wasn't dismissed in the last 24 hours
    if (lastDismissed < twentyFourHoursAgo) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setShowSplash(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseSplash = () => {
    setShowSplash(false);
    // Remember that user dismissed the splash
    localStorage.setItem("splashDismissed", Date.now().toString());
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Responsive main content with improved spacing */}
      <main className="pt-16 sm:pt-20 md:pt-24 lg:pt-28 xl:pt-32">
        <div className="w-full">
          <HeroSection />

          {/* Sections with consistent responsive spacing */}
          <div className="space-y-8 sm:space-y-12 md:space-y-16 lg:space-y-20">
            <PopularBrands />
            <NewArrivals />
            <TopSelling />
            <NewsletterSection />
          </div>
        </div>
      </main>

      <FooterSection />

      {/* Splash Screen Overlay */}
      <SplashScreen isVisible={showSplash} onClose={handleCloseSplash} />
    </div>
  );
};

export default Homepage;
