// ENHANCED AdminLayout.tsx - Improved UI and Responsiveness
"use client";
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Changed from next/navigation
import Sidebar from './Sidebar';
import AdminNavbar from './AdminNavbar';
import FooterSection from '../../../screens/Homepage/sections/FooterSection/FooterSection';
import type { RootState } from '../../../redux/store';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get user state for debugging
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate(); // Changed from useRouter

  // Handle responsive sidebar behavior
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      
      // For sales users, always show sidebar on desktop
      if (!mobile && user?.role) {
        setSidebarOpen(true);
      } else if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [user?.role]);

  // Auto-open sidebar for authenticated users on desktop
  useEffect(() => {
    if (isAuthenticated && user && !isMobile) {
      console.log("🔓 User authenticated, opening sidebar for role:", user.role);
      setSidebarOpen(true);
    }
  }, [isAuthenticated, user, isMobile]);

  const toggleSidebar = () => {
    console.log("🔄 Toggling sidebar. Current state:", sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Enhanced Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ease-out"
          onClick={handleOverlayClick}
        />
      )}

      {/* Enhanced Sidebar */}
      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        transition-all duration-300 ease-in-out
        ${isMobile ? 'w-72' : sidebarOpen ? 'w-64' : 'w-16'}
      `}>
        <Sidebar 
          isOpen={sidebarOpen} 
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
     
      {/* Enhanced Main Content */}
      <div className={`
        flex flex-col flex-1 min-w-0 
        transition-all duration-300 ease-in-out
        ${!isMobile && !sidebarOpen ? 'ml-0' : ''}
        relative
      `}>
        {/* Enhanced Navbar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <AdminNavbar toggleSidebar={toggleSidebar} />
        </div>
        
        {/* Enhanced Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-indigo-600/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/5 to-pink-600/5 rounded-full blur-3xl"></div>
          </div>
          
          {/* Content Container with Enhanced Styling */}
          <div className="relative z-10 p-3 sm:p-4 lg:p-6 xl:p-8 max-w-full">
            {/* Enhanced Content Wrapper */}
            <div className="w-full max-w-none">
              {/* Content with subtle animation */}
              <div className="animate-fadeIn">
                {children}
              </div>
            </div>
          </div>
          
          {/* Enhanced Scroll to Top Button */}
          <div className="fixed bottom-6 right-6 z-20">
            <button
              onClick={() => {
                // Scroll to top of the main content area
                const mainElement = document.querySelector('main');
                if (mainElement) {
                  mainElement.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  // Fallback to window scroll
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="hidden lg:flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-md text-gray-600 rounded-full shadow-lg hover:shadow-xl border border-gray-200/50 transition-all duration-300 hover:scale-110 hover:bg-indigo-50 hover:text-indigo-600 group"
              title="Scroll to top"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
          <FooterSection/>
        </main>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        /* Enhanced scrollbar styling */
        main::-webkit-scrollbar {
          width: 6px;
        }
        
        main::-webkit-scrollbar-track {
          background: transparent;
        }
        
        main::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        
        main::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        
        /* Smooth transitions for all interactive elements */
        * {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;