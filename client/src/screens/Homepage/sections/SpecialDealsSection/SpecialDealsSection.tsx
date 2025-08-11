import React from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

export const SpecialDealsSection = (): JSX.Element => {
  return (
    <section className="w-full py-10 bg-[#f2f2f2] overflow-hidden">
      <div className="container flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center md:items-start space-y-6 md:w-1/2">
          <Button className="bg-[#ad5c10] hover:bg-[#ad5c10]/90 text-white font-semibold rounded-[10px] px-6 transform hover:scale-105 transition-transform duration-300">
            <span className="font-['DM_Sans',Helvetica] text-xl">Hurry Up</span>
          </Button>

          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 flex flex-col items-center md:items-start space-y-4">
              <p className="font-['Overpass',Helvetica] font-light text-[#3b3838] text-xl text-center md:text-left">
                up to 20% OFF
              </p>

              <h2 className="font-['Gabarito',Helvetica] font-bold text-[#d33b09] text-6xl text-center md:text-left whitespace-nowrap">
                Check it Out
              </h2>

              <p className="font-['Overpass',Helvetica] font-light text-grey-900 text-xl text-center md:text-left">
                20 Feb to 28 Feb
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-1/2 mt-8 md:mt-0 relative group">
          {/* Animated shadow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#d33b09]/20 to-[#ad5c10]/20 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-300"></div>
          
          {/* Container for the animated image */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              className="w-full max-w-[457px] h-auto object-cover mx-auto transform transition-all duration-700 ease-in-out hover:scale-105 group-hover:rotate-1 rounded-lg"
              alt="Camera pic"
              src="/camera-pic.png"
            />
            
            {/* Overlay with shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
          </div>
          
          {/* Floating bubble decorations */}
          <div className="absolute top-1/4 left-1/4 w-6 h-6 bg-[#d33b09]/20 rounded-full animate-float1 hidden md:block"></div>
          <div className="absolute bottom-1/3 right-1/4 w-8 h-8 bg-[#ad5c10]/30 rounded-full animate-float2 hidden md:block"></div>
          <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-[#d33b09]/20 rounded-full animate-float3 hidden md:block"></div>
        </div>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes float2 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float3 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes shine {
          100% { left: 125%; }
        }
        
        .animate-float1 {
          animation: float1 5s ease-in-out infinite;
        }
        
        .animate-float2 {
          animation: float2 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-float3 {
          animation: float3 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .group:hover .animate-shine {
          animation: shine 1.2s;
        }
      `}</style>
    </section>
  );
};

export default SpecialDealsSection;