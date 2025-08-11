import React, { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent } from "../../../../components/ui/card";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export const SpeakerDealsSection = (): JSX.Element => {
  // Speaker data array
  const speakers = [
    {
      id: 1,
      name: "JBL Premium Speaker",
      price: "Just Starting at NPR 5,000",
      image: "/image-3-1.png",
      color: "#f2f2f2",
    },
    {
      id: 2,
      name: "Marshall Studio Speaker",
      price: "Premium Quality at NPR 7,500",
      image: "/speaker-marshall.png", // Replace with actual image path
      color: "#e8e8e8",
    },
    {
      id: 3,
      name: "Bose Wireless Speaker",
      price: "Special Offer: NPR 6,000",
      image: "/speaker-bose.png", // Replace with actual image path
      color: "#f0f0f0",
    }
  ];

  const [currentSpeaker, setCurrentSpeaker] = useState(0);
  const [direction, setDirection] = useState('next');
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-rotate speakers
  useEffect(() => {
    const interval = setInterval(() => {
      nextSpeaker();
    }, 4000);

    return () => clearInterval(interval);
  }, [currentSpeaker]);

  // Handle animation state
  useEffect(() => {
    if (isAnimating) {
      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 600); // Match this with animation duration

      return () => clearTimeout(timeout);
    }
  }, [isAnimating]);

  const nextSpeaker = () => {
    setIsAnimating(true);
    setDirection('next');
    setCurrentSpeaker((prev) => (prev + 1) % speakers.length);
  };

  const prevSpeaker = () => {
    setIsAnimating(true);
    setDirection('prev');
    setCurrentSpeaker((prev) => (prev - 1 + speakers.length) % speakers.length);
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-center font-['Gabarito',Helvetica] text-3xl md:text-4xl font-bold mb-10">
          Premium Audio Deals
        </h2>
        
        <div className="flex justify-center">
          <Card 
            className="w-full max-w-[569px] h-[400px] rounded-[10px] overflow-hidden shadow-lg relative"
            style={{
              backgroundColor: speakers[currentSpeaker].color,
              transition: "background-color 0.5s ease"
            }}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 pt-16 pb-16 h-full">
              <div className="text-center mb-8 relative z-10">
                <p className="font-['Overpass',Helvetica] font-normal text-[#000000a6] text-[22px] mb-2">
                  Unmatchable Speaker
                </p>
                <h3 className="font-['Gabarito',Helvetica] font-normal text-black text-[32px]">
                  {speakers[currentSpeaker].price}
                </h3>
              </div>

              <Button className="bg-[#ad5c10] text-white rounded-[40px] h-[49px] w-40 font-['DM_Sans',Helvetica] hover:bg-[#964f0e] mb-8 relative z-10 transform transition-transform duration-300 hover:scale-105">
                Shop Now
              </Button>

              {/* Image container with animation */}
              <div className="relative h-44 w-48">
                {speakers.map((speaker, index) => (
                  <img
                    key={speaker.id}
                    className={`absolute top-0 left-0 w-48 h-44 object-contain
                      ${currentSpeaker === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}
                      ${isAnimating && currentSpeaker === index 
                        ? direction === 'next' 
                          ? 'animate-slide-in-right' 
                          : 'animate-slide-in-left'
                        : ''}
                      ${isAnimating && (currentSpeaker === (index + 1) % speakers.length || 
                        (currentSpeaker === 0 && index === speakers.length - 1))
                        ? direction === 'next' 
                          ? 'animate-slide-out-left' 
                          : 'animate-slide-out-right'
                        : ''}
                      transition-opacity duration-500`}
                    alt={speaker.name}
                    src={speaker.image}
                  />
                ))}
              </div>

              {/* Navigation dots */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {speakers.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setDirection(index > currentSpeaker ? 'next' : 'prev');
                      setIsAnimating(true);
                      setCurrentSpeaker(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 
                      ${currentSpeaker === index ? 'w-6 bg-[#ad5c10]' : 'bg-gray-400'}`}
                    aria-label={`View speaker ${index + 1}`}
                  />
                ))}
              </div>

              {/* Navigation arrows */}
              <button
                onClick={prevSpeaker}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md hover:bg-white transition-colors z-20"
                aria-label="Previous speaker"
              >
                <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
              </button>
              <button
                onClick={nextSpeaker}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md hover:bg-white transition-colors z-20"
                aria-label="Next speaker"
              >
                <ChevronRightIcon className="h-6 w-6 text-gray-700" />
              </button>

              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-[#ad5c10]/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-10 left-10 w-16 h-16 bg-[#ad5c10]/5 rounded-full blur-lg"></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutLeft {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
        
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.6s forwards;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.6s forwards;
        }
        
        .animate-slide-out-left {
          animation: slideOutLeft 0.6s forwards;
        }
        
        .animate-slide-out-right {
          animation: slideOutRight 0.6s forwards;
        }
      `}</style>
    </section>
  );
};

export default SpeakerDealsSection;