import React from "react";
import { useNavigate } from "react-router-dom";
import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-full relative">
        {/* Navbar Component */}
        <NavbarSection />
        
        {/* 404 Content */}
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <h2 className="text-9xl font-extrabold text-indigo-600">404</h2>
              <h1 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
              <p className="mt-2 text-base text-gray-500">
                Sorry, we couldn't find the page you're looking for.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                Go back
              </button>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Go home
              </button>
            </div>

            <div className="mt-12">
              <p className="text-sm text-gray-500">
                Looking for something specific? Try using the navigation menu above.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer Section */}
        <FooterSection />
      </div>
    </div>
  );
};

export default NotFound;