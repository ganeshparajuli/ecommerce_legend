import { HeroSection } from "./sections/HeroSection/HeroSection";
import { PopularBrands } from "./sections/PopularBrands/PopularBrands";
import { NewArrivals } from "./sections/NewArrivals/NewArrivals";
import { TopSelling } from "./sections/TopSelling/TopSelling";
import { NewsletterSection } from "./sections/NewsletterSection/NewsletterSection";
import { FooterSection } from "./sections/FooterSection/FooterSection";

export const Homepage = () => (
  <div className="min-h-screen bg-white">
    <main className="pt-[72px] lg:pt-[104px]">
      <HeroSection />
      <PopularBrands />
      <NewArrivals />
      <TopSelling />
      <NewsletterSection />
    </main>
    <FooterSection />
  </div>
);

export default Homepage;
