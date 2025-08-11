import React from "react";
import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
import { motion } from "framer-motion";
import { Truck, Clock, Phone, Mail, MapPin, AlertCircle, CheckCircle, Package, Zap } from "lucide-react";

const deliveryZones = [
  {
    zone: "Zone 1 - Kathmandu Valley",
    areas: ["Kathmandu", "Lalitpur", "Bhaktapur"],
    time: "1-2 business days",
    cost: "Free delivery on orders above NPR 25000",
    color: "from-emerald-500 to-teal-600",
    icon: "⚡"
  },
  {
    zone: "Zone 2 - Major Cities",
    areas: ["Pokhara", "Chitwan", "Biratnagar", "Birgunj"],
    time: "2-3 business days",
    cost: "NPR 100 - 200",
    color: "from-blue-500 to-indigo-600",
    icon: "🏙️"
  },
  {
    zone: "Zone 3 - Other Locations",
    areas: ["All other districts"],
    time: "3-5 business days",
    cost: "NPR 200 - 400",
    color: "from-purple-500 to-pink-600",
    icon: "🏔️"
  },
];

const deliveryProcess = [
  {
    step: 1,
    title: "Order Confirmation",
    description: "Instant email confirmation with order details",
    icon: CheckCircle,
    color: "text-emerald-600"
  },
  {
    step: 2,
    title: "Order Processing",
    description: "Quality check and careful packaging",
    icon: Package,
    color: "text-blue-600"
  },
  {
    step: 3,
    title: "Order Dispatch",
    description: "Handed over to our trusted delivery partners",
    icon: Truck,
    color: "text-purple-600"
  },
  {
    step: 4,
    title: "Delivery",
    description: "Safe delivery to your specified address",
    icon: MapPin,
    color: "text-pink-600"
  },
];

const DeliveryDetails = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <NavbarSection />

      <main className="pt-16 sm:pt-20 md:pt-24 lg:pt-28">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                Delivery Information
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto">
                Fast, reliable, and secure delivery all across Nepal
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          {/* Delivery Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20"
          >
            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 sm:p-8 border border-white/20 hover:scale-105">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Lightning Fast
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Experience the fastest delivery service in Nepal with our optimized logistics network and real-time tracking.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 sm:p-8 border border-white/20 hover:scale-105">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Real-time Tracking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Stay updated with live tracking from warehouse to your doorstep. Know exactly when your order arrives.
              </p>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 sm:p-8 border border-white/20 hover:scale-105 sm:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                Nationwide Coverage
              </h3>
              <p className="text-gray-600 leading-relaxed">
                From bustling cities to remote mountain villages - we deliver everywhere across beautiful landscapes of Nepal.
              </p>
            </div>
          </motion.div>

          {/* Delivery Zones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 mb-16 sm:mb-20 border border-white/20"
          >
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Delivery Zones & Charges
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                Transparent pricing with no hidden fees
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {deliveryZones.map((zone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                  className="group relative overflow-hidden bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 sm:p-8 border border-gray-100 hover:scale-105"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${zone.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  <div className="relative">
                    <div className="text-4xl sm:text-5xl mb-4">{zone.icon}</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                      {zone.zone}
                    </h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Areas Covered</p>
                        <p className="text-gray-900 font-semibold">{zone.areas.join(", ")}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Delivery Time</p>
                        <p className="text-gray-900 font-semibold">{zone.time}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Delivery Cost</p>
                        <p className="text-gray-900 font-semibold">{zone.cost}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Delivery Process & Additional Information */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 sm:gap-12">
            {/* Delivery Process */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 border border-white/20"
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-10">
                How Delivery Works
              </h2>

              <div className="space-y-6 sm:space-y-8">
                {deliveryProcess.map((process, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                    className="flex items-start space-x-4 sm:space-x-6 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-lg sm:text-xl">{process.step}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <process.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${process.color}`} />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                          {process.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {process.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="space-y-8"
            >
              {/* Important Notes */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-white/20">
                <div className="flex items-center space-x-4 mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Important Notes
                  </h2>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {[
                    "Delivery times are estimates and may vary based on location and weather conditions",
                    "Orders placed after 2 PM will be processed the next business day",
                    "A valid phone number is required for delivery coordination",
                    "Someone must be present to receive and sign for the delivery",
                    "We may contact you to confirm delivery details"
                  ].map((note, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mt-3 flex-shrink-0"></div>
                      <p className="text-gray-600 leading-relaxed">{note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Support */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-white/20">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                  Need Help?
                </h2>

                <div className="space-y-6">
                  <p className="text-gray-600 text-lg">
                    Our delivery support team is here to help you
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">+977 9851343371 / 9856060163</p>
                        <p className="text-sm text-gray-600">Call us directly</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">support@joystore.com.np</p>
                        <p className="text-sm text-gray-600">Email support</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                    <p className="font-semibold mb-1">Office Hours</p>
                    <p className="text-white/90">Monday to Saturday, 10 AM - 6 PM</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default DeliveryDetails;