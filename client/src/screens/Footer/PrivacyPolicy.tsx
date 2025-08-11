import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
import { motion } from "framer-motion";
import { Shield, Calendar, Phone, Mail, MapPin, Lock, Users, Eye, Database, Star, Award, Zap } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    content: `Personal Information:
• Name, email address, phone number
• Billing and shipping addresses
• Payment information
• Purchase history

Technical Information:
• IP address and browser details
• Device information
• Cookies and usage data
• Location data (if permitted)`,
    icon: Database
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to:
• Process and fulfill your orders
• Communicate about your purchases
• Send promotional materials (with consent)
• Improve our services and website
• Prevent fraud and enhance security
• Comply with legal obligations`,
    icon: Eye
  },
  {
    title: "3. Information Sharing",
    content: `We may share your information with:
• Payment processors for transactions
• Delivery partners for shipping
• Service providers for website operation
• Law enforcement when required by law

We never sell your personal information to third parties.`,
    icon: Users
  },
  {
    title: "4. Data Security",
    content: `We implement various security measures:
• Encryption of sensitive data
• Secure socket layer (SSL) technology
• Regular security assessments
• Limited access to personal information
• Employee confidentiality agreements`,
    icon: Lock
  },
  {
    title: "5. Your Rights",
    content: `You have the right to:
• Access your personal information
• Correct inaccurate information
• Request deletion of your data
• Opt-out of marketing communications
• Lodge complaints with authorities`,
    icon: Shield
  },
  {
    title: "6. Cookies and Tracking",
    content: `We use cookies to:
• Remember your preferences
• Analyze website traffic
• Improve user experience
• Provide personalized content
• Track marketing effectiveness

You can control cookie settings through your browser.`,
    icon: Database
  },
  {
    title: "7. Marketing Communications",
    content: `We may send you marketing communications:
• Only with your explicit consent
• Containing relevant products and offers
• With clear opt-out options
• At reasonable frequencies

You can unsubscribe at any time.`,
    icon: Mail
  },
  {
    title: "8. Children's Privacy",
    content: `• We do not knowingly collect data from children under 13
• Parents can request removal of children's information
• We comply with children's privacy protection laws
• Special protections are in place for minor's data`,
    icon: Shield
  },
  {
    title: "9. Changes to Privacy Policy",
    content: `• We may update this policy periodically
• Changes will be posted on this page
• Significant changes will be notified via email
• Continued use implies acceptance of changes`,
    icon: Calendar
  },
  {
    title: "10. Data Retention",
    content: `We retain your information:
• As long as necessary for service provision
• To comply with legal obligations
• For legitimate business purposes
• Until you request deletion

Data is securely deleted when no longer needed.`,
    icon: Database
  }
];

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarSection />
      
      <main className="pt-32 sm:pt-36 md:pt-24 lg:pt-32 px-6 sm:px-8 lg:px-10 ">
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
                  <Shield className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                Privacy Policy
              </h1>
              <p className="text-xl text-gray-100 max-w-2xl mx-auto">
                Your privacy is important to us. Learn how we collect, use, and protect your personal information.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Privacy Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-12"
          >
            <div className="flex items-center space-x-4 mb-8">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">Privacy Overview</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-600 font-medium">Last updated: March 1, 2024</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed">
                At <span className="font-bold text-black">Joy Store</span>, we take your privacy seriously. This Privacy Policy describes how we collect,
                use, and protect your personal information when you use our website and services. By using
                our website, you agree to the collection and use of information in accordance with this policy.
              </p>
            </div>
          </motion.div>

          {/* Privacy Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => {
              const IconComponent = section.icon;
              return (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="bg-gray-100 p-3 rounded-xl flex items-center justify-center min-w-[3rem] h-12">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                    </div>
                    <h2 className="text-xl font-bold text-black flex-1">
                      {section.title}
                    </h2>
                  </div>
                  <div className="ml-16">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <div className="prose prose-gray max-w-none">
                        <div className="text-gray-700 leading-relaxed space-y-4">
                          {section.content.split('\n\n').map((paragraph, pIndex) => (
                            <div key={pIndex}>
                              {paragraph.includes('•') ? (
                                <div>
                                  {paragraph.split('\n').map((line, lIndex) => {
                                    if (lIndex === 0 && !line.includes('•')) {
                                      return (
                                        <h4 key={lIndex} className="font-semibold text-gray-800 mb-2">
                                          {line}
                                        </h4>
                                      );
                                    } else if (line.includes('•')) {
                                      return (
                                        <div key={lIndex} className="flex items-start space-x-2 mb-1">
                                          <span className="text-gray-400 mt-1">•</span>
                                          <span className="text-gray-600">{line.replace('• ', '')}</span>
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              ) : (
                                <p className="text-gray-600">{paragraph}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
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
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-black">
                Contact Us About Privacy
              </h2>
            </div>
            
            <p className="text-gray-700 mb-6 leading-relaxed">
              If you have any questions about our Privacy Policy or how we handle your data, please don't hesitate to contact our Data Protection Officer:
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
                      <a href="mailto:privacy@joystore.com.np" className="text-black font-bold hover:text-gray-600 transition-colors">
                        privacy@joystore.com.np
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

          {/* GDPR Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + sections.length * 0.1 }}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-8"
          >
            <div className="text-center">
              <h3 className="text-lg font-bold text-black mb-2">Data Protection Compliance</h3>
              <p className="text-sm text-gray-600">
                This privacy policy complies with applicable data protection laws including the Nepal Data Protection Act. 
                We are committed to transparent data practices and protecting your fundamental privacy rights.
              </p>
            </div>
          </motion.div>

          {/* Data Portability Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + sections.length * 0.1 }}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-6"
          >
            <div className="flex items-center justify-center space-x-3">
              <Lock className="h-6 w-6 text-gray-600" />
              <div className="text-center">
                <h3 className="text-lg font-bold text-black mb-1">Your Data Rights</h3>
                <p className="text-sm text-gray-600">
                  You can request a copy of your data, update your information, or delete your account at any time. 
                  Contact us for assistance with any data-related requests.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default PrivacyPolicy;