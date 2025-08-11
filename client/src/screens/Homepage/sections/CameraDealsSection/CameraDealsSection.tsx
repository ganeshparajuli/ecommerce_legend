import React from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";

export const CameraDealsSection = (): JSX.Element => {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-['Gabarito',Helvetica] text-3xl md:text-4xl font-bold mb-10">
          Smart Security Deals
        </h2>
        
        <div className="flex flex-wrap justify-center gap-6">
          {/* Camera Deal Card */}
          <Card className="w-full max-w-[589px] h-auto rounded-[10px] bg-[#f2f2f2] overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="text-center mb-6">
                <h3 className="font-['Overpass',Helvetica] text-[22px] text-[#000000a6] mb-2">
                  Security Smart Camera
                </h3>
                <h2 className="font-['Gabarito',Helvetica] text-[32px] text-black">
                  Just Starting at NPR 10,000
                </h2>
              </div>

              <Button className="bg-[#ad5c10] hover:bg-[#964f0d] text-white rounded-[40px] px-6 py-3 mb-6 transform transition-transform hover:scale-105">
                Shop Now
              </Button>

              <div className="overflow-hidden rounded-lg relative">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-[#ad5c10]/10 rounded-full blur-xl animate-pulse-slow opacity-70"></div>
                
                <img
                  className="w-[203px] h-[169px] object-cover animate-zoom-in-out relative"
                  alt="Security Camera"
                  src="/image-7-1.png"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Optional: Second Card for Balance */}
          <Card className="w-full max-w-[589px] h-auto rounded-[10px] bg-[#e8f0fe] overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="text-center mb-6">
                <h3 className="font-['Overpass',Helvetica] text-[22px] text-[#000000a6] mb-2">
                  Doorbell Camera Bundle
                </h3>
                <h2 className="font-['Gabarito',Helvetica] text-[32px] text-black">
                  Special Offer: NPR 15,000
                </h2>
              </div>

              <Button className="bg-[#3b83f6] hover:bg-[#2563eb] text-white rounded-[40px] px-6 py-3 mb-6 transform transition-transform hover:scale-105">
                View Deal
              </Button>

              <div className="overflow-hidden rounded-lg relative">
                <div className="absolute inset-0 bg-[#3b83f6]/10 rounded-full blur-xl animate-pulse-slow opacity-70 animation-delay-1000"></div>
                
                <img
                  className="w-[203px] h-[169px] object-cover animate-zoom-in-out animation-delay-2000"
                  alt="Doorbell Camera"
                  src="/image-7-1.png" // Replace with actual doorbell camera image
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes zoomInOut {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 0.4; }
        }
        
        .animate-zoom-in-out {
          animation: zoomInOut 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default CameraDealsSection;