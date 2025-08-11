import { StarIcon } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Card, CardContent } from "../../../../components/ui/card";

export const CustomerReviewsSection = (): JSX.Element => {
  // Testimonial data that can be expanded for multiple testimonials
  const testimonials = [
    {
      id: 1,
      quote:
        "This platform has been so good experience ever since i started buying products here. The user experience is seamless.",
      author: "Abi Shahi",
      role: "User",
      rating: 4,
    },
  ];

  return (
    <section className="relative w-full bg-[#f2f2f2] py-16">
      <div className="container max-w-[1440px] mx-auto relative">
        <div className="flex items-center justify-center">
          <button
            className="absolute left-16 z-10"
            aria-label="Previous testimonial"
          >
            <img
              className="w-[37px] h-[35px]"
              alt="Previous"
              src="/iconss-12.svg"
            />
          </button>

          <Card className="bg-transparent border-none shadow-none max-w-[545px] mx-auto">
            <CardContent className="p-0 flex flex-col items-center">
              <div className="flex justify-center mb-8">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="w-[23px] h-[23px] relative">
                    <StarIcon className="w-[21px] h-5 absolute top-0 left-px text-yellow-500 fill-yellow-500" />
                  </div>
                ))}
              </div>

              <p className="font-['Overpass',Helvetica] font-semibold text-black text-lg text-center mb-6 leading-normal">
                &quot;This platform has been so good experience ever since{" "}
                <br />i started buying products here. The user experience is
                seamless.&quot;
              </p>

              <div className="flex items-center mt-4">
                <Avatar className="w-[45px] h-[45px] bg-black rounded-[22.5px]">
                  <AvatarFallback className="bg-black"></AvatarFallback>
                </Avatar>

                <div className="ml-3">
                  <p className="font-['Gabarito',Helvetica] font-semibold text-black text-base text-center">
                    Abi Shahi
                  </p>
                  <p className="font-['Overpass',Helvetica] font-light text-black text-sm text-center">
                    User
                  </p>
                </div>

                <img
                  className="w-px h-[37px] mx-4"
                  alt="Line"
                  src="/line-3.svg"
                />

                <p className="font-['Overpass',Helvetica] font-bold text-black text-lg text-center">
                  Logo
                </p>
              </div>
            </CardContent>
          </Card>

          <button
            className="absolute right-16 z-10"
            aria-label="Next testimonial"
          >
            <img className="w-[37px] h-[35px]" alt="Next" src="/iconss-1.svg" />
          </button>
        </div>
      </div>
    </section>
  );
};
