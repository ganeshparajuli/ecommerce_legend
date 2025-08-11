import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  TruckIcon,
  HeartIcon,
  UsersIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  AwardIcon,
  TrendingUpIcon,
  CheckCircleIcon,
  MessageCircleIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon
} from "lucide-react";
import { PageLayout, Breadcrumb } from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";

const AboutUs = () => {
  const navigate = useNavigate();
  
  const [counters, setCounters] = useState({
    customers: 0,
    products: 0,
    years: 0,
    satisfaction: 0
  });

  // Animate counters
  useEffect(() => {
    const targetValues = {
      customers: 50000,
      products: 10000,
      years: 8,
      satisfaction: 98
    };

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const intervals = Object.keys(targetValues).map((key) => {
      const target = targetValues[key as keyof typeof targetValues];
      const increment = target / steps;
      let current = 0;

      return setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(intervals.find(i => i === interval));
        }
        setCounters(prev => ({
          ...prev,
          [key]: Math.floor(current)
        }));
      }, stepDuration);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  const breadcrumbItems = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about-us", current: true },
  ];

  const values = [
    {
      icon: ShieldCheckIcon,
      title: "Quality Assurance",
      description: "We ensure every product meets the highest quality standards before reaching our customers.",
      color: "text-blue-600"
    },
    {
      icon: TruckIcon,
      title: "Fast Delivery",
      description: "Quick and reliable delivery service to get your products to you as soon as possible.",
      color: "text-green-600"
    },
    {
      icon: HeartIcon,
      title: "Customer First",
      description: "Our customers are at the heart of everything we do. Your satisfaction is our priority.",
      color: "text-red-600"
    },
    {
      icon: UsersIcon,
      title: "Expert Team",
      description: "Our knowledgeable team is here to help you find the perfect products for your needs.",
      color: "text-purple-600"
    }
  ];

  const milestones = [
    {
      year: "2016",
      title: "Company Founded",
      description: "Started as a small electronics retailer with a vision to provide quality products."
    },
    {
      year: "2018",
      title: "Online Expansion",
      description: "Launched our e-commerce platform to serve customers nationwide."
    },
    {
      year: "2020",
      title: "Brand Partnerships",
      description: "Established partnerships with major brands like Apple, Samsung, and Sony."
    },
    {
      year: "2022",
      title: "Multiple Locations",
      description: "Expanded to serve customers in both Kathmandu and Pokhara."
    },
    {
      year: "2024",
      title: "50K+ Customers",
      description: "Reached a milestone of serving over 50,000 satisfied customers."
    }
  ];

  const leadership = [
    {
      name: "Sagar Dhakal",
      role: "Chairperson",
      image: "/team-member-1.jpg",
      description: "Leading Joy Store with vision and strategic direction for sustainable growth."
    },
    {
      name: "Guru Sharma",
      role: "Managing Director",
      image: "/team-member-2.jpg",
      description: "Managing daily operations and ensuring exceptional customer service standards."
    },
    {
      name: "Rajesh Thapa",
      role: "Head of Sales",
      image: "/team-member-3.jpg",
      description: "Expert in customer relations and product expertise across all categories."
    },
    {
      name: "Anita Shrestha",
      role: "Operations Manager",
      image: "/team-member-4.jpg",
      description: "Managing logistics and ensuring smooth operations across all locations."
    }
  ];

  const socialLinks = [
    {
      name: "Facebook",
      icon: FacebookIcon,
      url: "https://facebook.com/joystorenepal",
      color: "text-blue-600 hover:text-blue-700"
    },
    {
      name: "Instagram",
      icon: InstagramIcon,
      url: "https://www.instagram.com/joy_store_nepal?igsh=MW9uMTVxeGJlam9mZw==",
      color: "text-pink-600 hover:text-pink-700"
    },
    {
      name: "WhatsApp",
      icon: MessageCircleIcon,
      url: "https://wa.me/9779851343371",
      color: "text-green-600 hover:text-green-700"
    }
  ];

  return (
    <div>
      <PageLayout>
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
          {/* Hero Section */}
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-blue-600/10"></div>
            <div className="container mx-auto px-4 relative z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-4xl mx-auto"
              >
                <div className="flex items-center justify-center mb-6">
                  <AwardIcon className="w-12 h-12 text-red-600 mr-4" />
                  <span className="text-red-600 font-semibold text-xl">About Joy Store</span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                  Your Trusted
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-blue-600"> Electronics </span>
                  Partner
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  For over a decade, Joy Store has been Nepal's premier destination for quality electronics, 
                  smartphones, and lifestyle products. We're committed to bringing you the latest technology 
                  with exceptional service and unbeatable prices.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/products')}
                    className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Explore Products
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/contact-us')}
                    className="bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
                  >
                    Contact Us
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { key: "customers", label: "Happy Customers", suffix: "+" },
                  { key: "products", label: "Products Available", suffix: "+" },
                  { key: "years", label: "Years Experience", suffix: "" },
                  { key: "satisfaction", label: "Satisfaction Rate", suffix: "%" }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-blue-600 mb-2">
                      {counters[stat.key as keyof typeof counters]}{stat.suffix}
                    </div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Our Story Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Story</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  What started as a small electronics shop has grown into Nepal's most trusted technology retailer, 
                  serving thousands of customers with premium products and exceptional service.
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    Building Trust Through Quality
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Founded in 2016, Joy Store began with a simple mission: to provide Nepal with access to 
                    the world's best electronics at fair prices. What set us apart was our commitment to 
                    authenticity, warranty, and after-sales service.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Today, we're proud to be authorized retailers for major brands including Apple, Samsung, 
                    Sony, and many others. Our team of experts ensures every product is genuine, and our 
                    customer service team is always ready to help.
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      "100% Authentic Products",
                      "Official Brand Warranties",
                      "Expert Technical Support",
                      "Nationwide Delivery"
                    ].map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center"
                      >
                        <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="bg-gradient-to-br from-red-100 to-blue-100 rounded-2xl p-8 h-96 flex items-center justify-center">
                    <div className="text-6xl">🏪</div>
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl">
                    <div className="flex items-center space-x-2">
                      <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-semibold">4.9/5 Rating</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-20 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Values</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  These core values guide everything we do and shape our relationship with customers, 
                  partners, and the community.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {values.map((value, index) => (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                  >
                    <div className={`inline-flex items-center justify-center w-16 h-16 ${value.color} bg-opacity-10 rounded-2xl mb-6`}>
                      <value.icon className={`w-8 h-8 ${value.color}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  From a small startup to Nepal's leading electronics retailer - 
                  here are the key milestones in our journey.
                </p>
              </motion.div>

              <div className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-red-600 to-blue-600 rounded-full"></div>
                
                <div className="space-y-12">
                  {milestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.year}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 }}
                      className={`flex items-center ${
                        index % 2 === 0 ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div className={`w-1/2 ${index % 2 === 0 ? "pr-8" : "pl-8"}`}>
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                          <div className="text-2xl font-bold text-red-600 mb-2">{milestone.year}</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                          <p className="text-gray-600">{milestone.description}</p>
                        </div>
                      </div>
                      
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full border-4 border-white shadow-lg"></div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Leadership Team Section */}
          <section className="py-20 bg-white/50 backdrop-blur-sm">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Leadership Team</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  The passionate individuals behind Joy Store who work tirelessly to bring you 
                  the best products and service experience.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {leadership.map((member, index) => (
                  <motion.div
                    key={member.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl">
                      👨‍💼
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <div className="text-red-600 font-medium mb-3">{member.role}</div>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact Info Section */}
          <section className="py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Visit Our Stores</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Experience our products firsthand at our physical locations or contact us for any queries.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    icon: MapPinIcon,
                    title: "Kathmandu Store",
                    details: ["Tamrakar Complex Shop 9", "Newroad, Kathmandu", "Nepal"]
                  },
                  {
                    icon: MapPinIcon,
                    title: "Pokhara Store", 
                    details: ["Mahendrapool", "Infront of Sita Bhawan", "Pokhara, Nepal"]
                  },
                  {
                    icon: ClockIcon,
                    title: "Store Hours",
                    details: ["Mon - Sat: 10 AM - 8 PM", "Sunday: 11 AM - 6 PM", "Holidays: Closed"]
                  }
                ].map((info, index) => (
                  <motion.div
                    key={info.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-8 shadow-lg text-center"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-6">
                      <info.icon className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{info.title}</h3>
                    <div className="space-y-2">
                      {info.details.map((detail, idx) => (
                        <div key={idx} className="text-gray-600">{detail}</div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Contact Numbers & Social Media */}
              <div className="grid md:grid-cols-2 gap-8">
                {/* Phone Numbers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                      <PhoneIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Contact Numbers</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Kathmandu:</span>
                      <a 
                        href="tel:9851343371" 
                        className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                      >
                        9851343371
                      </a>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Pokhara:</span>
                      <a 
                        href="tel:985-6060163" 
                        className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                      >
                        985-6060163
                      </a>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600">Email:</span>
                      <a 
                        href="mailto:support@joystore.com" 
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        support@joystore.com
                      </a>
                    </div>
                  </div>
                </motion.div>

                {/* Social Media */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 shadow-lg"
                >
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                      <UsersIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Follow Us</h3>
                    <p className="text-gray-600 text-sm mt-2">Stay connected for latest updates and offers</p>
                  </div>
                  
                  <div className="space-y-4">
                    {socialLinks.map((social, index) => (
                      <motion.a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300"
                      >
                        <social.icon className={`w-6 h-6 ${social.color} mr-4`} />
                        <span className="font-semibold text-gray-900">{social.name}</span>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-r from-red-600 to-blue-600">
            <div className="container mx-auto px-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-white mb-6">
                  Ready to Experience the Joy Store Difference?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands of satisfied customers who trust us for their electronics needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/products')}
                    className="bg-white text-red-600 px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Shop Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/contact-us')}
                    className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-red-600 transition-all duration-300"
                  >
                    Contact Us
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      </PageLayout>
      
      {/* Footer Section */}
      <FooterSection />
    </div>
  );
};

export default AboutUs;