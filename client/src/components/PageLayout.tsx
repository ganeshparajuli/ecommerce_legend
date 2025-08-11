import React from "react";
import NavbarSection from "../screens/Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../screens/Homepage/sections/FooterSection/FooterSection";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarSection />
      <main className={`pt-[150px] sm:pt-[170px] md:pt-[80px] ${className}`}>
        {children}
      </main>
      <FooterSection />
    </div>
  );
};

export default PageLayout;
