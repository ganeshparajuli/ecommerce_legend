import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
import { motion } from "framer-motion";
import { ScrollText, Calendar, Phone, Mail, MapPin } from "lucide-react";

const sections = [
  {
    title: "1. Introduction",
    content: `These Terms and Conditions govern your use of Joy Store's website and services. By accessing or using our website, you agree to be bound by these terms. Please read them carefully before proceeding with any purchase or transaction.`,
    icon: "📋"
  },
  {
    title: "2. Definitions",
    content: `"Website" refers to Joy Store's e-commerce platform
"User" refers to any person accessing or using the website
"Products" refers to items available for purchase on the website
"Services" refers to any services provided through the website`,
    icon: "📚"
  },
  {
    title: "3. Account Registration",
    content: `Users must provide accurate and complete information during registration
Users are responsible for maintaining the confidentiality of their account
Users must immediately notify Joy Store of any unauthorized use of their account
Joy Store reserves the right to suspend or terminate accounts that violate these terms`,
    icon: "👤"
  },
  {
    title: "4. Product Information",
    content: `Product descriptions and specifications are provided for informational purposes
Images are representative and may vary from actual products
Prices are subject to change without notice
Stock availability is not guaranteed until order confirmation`,
    icon: "📱"
  },
  {
    title: "5. Ordering and Payment",
    content: `Orders are subject to acceptance and availability
Payments must be made through approved payment methods
Prices are inclusive of applicable taxes unless stated otherwise
Payment information is processed securely through trusted payment gateways`,
    icon: "💳"
  },
  {
    title: "6. Shipping and Delivery",
    content: `Delivery times are estimates and may vary by location
Shipping costs are calculated based on delivery location and order value
Risk of loss transfers to the customer upon delivery
Customers must inspect products upon delivery and report any damages`,
    icon: "🚚"
  },
  {
    title: "7. Returns and Refunds",
    content: `Products can be returned within 7 days of delivery
Returns must be in original condition with all packaging and accessories
Refunds will be processed within 7-14 business days
Some products may be exempt from returns (e.g., personalized items)`,
    icon: "↩️"
  },
  {
    title: "8. Warranty",
    content: `Products are covered by manufacturer warranty where applicable
Warranty terms vary by product and manufacturer
Warranty claims must be supported by proof of purchase
Warranty does not cover damage from misuse or unauthorized modifications`,
    icon: "🛡️"
  },
  {
    title: "9. Privacy and Data Protection",
    content: `Personal information is collected and processed according to our Privacy Policy
User data is protected using industry-standard security measures
Information may be shared with service providers for order fulfillment
Users have the right to access and correct their personal information`,
    icon: "🔒"
  },
  {
    title: "10. Intellectual Property",
    content: `All content on the website is protected by copyright and other intellectual property rights
Users may not reproduce, distribute, or modify website content without permission
Trademarks and logos are the property of their respective owners
Unauthorized use of intellectual property may result in legal action`,
    icon: "©️"
  }
];

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarSection />
      
      <main className="pt-32 sm:pt-36 md:pt-24 lg:pt-32 px-4 sm:px-10 lg:px-10">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                  <ScrollText className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Terms and Conditions
              </h1>
              <p className="text-xl text-gray-100 max-w-2xl mx-auto">
                Please read these terms and conditions carefully before using our services
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Overview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-12"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-gray-100 p-3 rounded-xl">
                <ScrollText className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Terms Overview</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-600 font-medium">Last updated: March 1, 2024</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed">
                Welcome to <span className="font-bold text-black">Joy Store</span>. These terms and conditions outline the rules and regulations
                for the use of our website and services. By accessing this website, we assume you
                accept these terms and conditions in full. Do not continue to use Joy Store's website
                if you do not accept all of the terms and conditions stated on this page.
              </p>
            </div>
          </motion.div>

          {/* Terms Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-2xl bg-gray-100 p-3 rounded-xl flex items-center justify-center min-w-[3rem] h-12">
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-bold text-black flex-1">
                    {section.title}
                  </h2>
                </div>
                <div className="ml-16">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="prose prose-gray max-w-none">
                      <div className="text-gray-700 leading-relaxed space-y-3">
                        {section.content.split('\n').map((line, lineIndex) => {
                          if (line.trim() === '') return null;
                          
                          // Check if line starts with a quote (definition)
                          if (line.startsWith('"') && line.includes(' refers to ')) {
                            return (
                              <div key={lineIndex} className="flex items-start space-x-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <div>
                                  <span className="font-semibold text-gray-800">
                                    {line.split(' refers to ')[0]}
                                  </span>
                                  <span className="text-gray-600"> refers to {line.split(' refers to ')[1]}</span>
                                </div>
                              </div>
                            );
                          }
                          
                          // Check if line is a bullet point
                          if (line.includes('must ') || line.includes('are ') || line.includes('may ') || line.includes('will ') || line.includes('does not ')) {
                            return (
                              <div key={lineIndex} className="flex items-start space-x-2">
                                <span className="text-gray-400 mt-1">•</span>
                                <span className="text-gray-600">{line}</span>
                              </div>
                            );
                          }
                          
                          // Regular paragraph
                          return (
                            <p key={lineIndex} className="text-gray-600">{line}</p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + sections.length * 0.1 }}
            className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8 mt-12"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gray-600 p-3 rounded-xl">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-black">
                Contact Us
              </h2>
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              If you have any questions about these Terms and Conditions, please don't hesitate to contact us through any of the following methods:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Mail className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Email</p>
                      <a href="mailto:support@joystore.com.np" className="text-black font-bold hover:text-gray-600 transition-colors">
                        support@joystore.com.np
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Kathmandu Store</p>
                      <a href="tel:9851343371" className="text-black font-bold hover:text-gray-600 transition-colors">
                        +977 985-1343371
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Pokhara Store</p>
                      <a href="tel:9856060163" className="text-black font-bold hover:text-gray-600 transition-colors">
                        +977 985-6060163
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Kathmandu Store</p>
                      <p className="text-black font-bold">Tamrakar Complex Shop 9, Newroad</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                <span className="font-medium">Business Hours:</span> Monday - Saturday, 10:00 AM - 7:00 PM
              </p>
            </div>
          </motion.div>

          {/* Legal Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + sections.length * 0.1 }}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-8 text-center"
          >
            <p className="text-sm text-gray-600">
              <span className="font-bold text-black">Legal Notice:</span> These terms and conditions are governed by the laws of Nepal. 
              Any disputes arising from these terms will be subject to the jurisdiction of Nepalese courts.
            </p>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default TermsConditions;