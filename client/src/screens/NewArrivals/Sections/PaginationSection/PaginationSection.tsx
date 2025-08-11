import React from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  category?: string;
  price: number;
  originalPrice: number;
  rating: number;
  image: string;
};

type PaginationSectionProps = {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
  filteredProducts: Product[];
  indexOfFirstProduct: number;
  indexOfLastProduct: number;
};

export const PaginationSection = ({
  currentPage,
  totalPages,
  paginate,
  filteredProducts,
  indexOfFirstProduct,
  indexOfLastProduct,
}: PaginationSectionProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-black border border-gray-200'
          }`}
        >
          Previous
        </button>
        <button
          onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-100 hover:text-black border border-gray-200'
          }`}
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium text-black">{indexOfFirstProduct + 1}</span> to{' '}
            <span className="font-medium text-black">
              {indexOfLastProduct > filteredProducts.length ? filteredProducts.length : indexOfLastProduct}
            </span>{' '}
            of <span className="font-medium text-black">{filteredProducts.length}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center rounded-l-lg px-3 py-2 transition-all duration-300 ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-black border border-gray-200'
              }`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              const isActive = pageNumber === currentPage;
              
              // Show 5 page buttons at most
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                      isActive
                        ? 'z-10 bg-black text-white border-black'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-black'
                    } transition-all duration-300`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              
              // Show ellipsis
              if (
                (pageNumber === 2 && currentPage > 3) ||
                (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return (
                  <span
                    key={pageNumber}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200"
                  >
                    ...
                  </span>
                );
              }
              
              return null;
            })}
            
            <button
              onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center rounded-r-lg px-3 py-2 transition-all duration-300 ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-black border border-gray-200'
              }`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default PaginationSection;