import React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  Award,
  Smartphone,
  ExternalLink,
  Navigation,
} from "lucide-react";
import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";

const locations = [
  {
    name: "Joy Store - Kathmandu",
    subtitle: "Apple Authorized Reseller",
    address: "Tamrakar Complex Shop 9",
    street: "Newroad",
    city: "Kathmandu",
    phone: "9851343371",
    whatsapp: "+977 9851343371",
    email: "kathmandu@joystore.com.np",
    hours: "10:00 AM - 8:00 PM",
    featured: true,
    rating: 5.1,
    reviews: "5.1K",
    coordinates: { lat: 27.703, lng: 85.308 },
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.454!2d85.308!3d27.703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb190a29c8b4c3%3A0x6bb7c35e8b4d0bb7!2sNew%20Road%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1629789145684!5m2!1sen!2snp",
  },
  {
    name: "Joy Store - Pokhara",
    subtitle: "Apple Authorized Reseller",
    address: "Mahendrapool",
    street: "Infront of Sita Bhawan",
    city: "Pokhara",
    phone: "9856060163",
    whatsapp: "+977 9856060163",
    email: "pokhara@joystore.com.np",
    hours: "10:00 AM - 8:00 PM",
    featured: false,
    rating: 4.9,
    reviews: "2.8K",
    coordinates: { lat: 28.2096, lng: 83.9819 },
    mapUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3516.0305842767036!2d83.9819!3d28.2096!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39959cb5c8f4c4c7%3A0x6bb7c35e8b4d0bb7!2sMahendrapul%2C%20Pokhara%2033700!5e0!3m2!1sen!2snp!4v1629789145684!5m2!1sen!2snp",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const Location = () => {
  // Function to open Google Maps with directions
  const openInGoogleMaps = (location) => {
    const { lat, lng } = location.coordinates;
    const address = `${location.address}, ${location.street}, ${location.city}`;
    const encodedAddress = encodeURIComponent(address);

    // Create Google Maps URL for directions
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedAddress}`;

    window.open(googleMapsUrl, "_blank");
  };

  // Function to open location in Google Maps (just view, no directions)
  const viewInGoogleMaps = (location) => {
    const { lat, lng } = location.coordinates;
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <NavbarSection />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className=" relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <Award className="h-8 w-8 text-yellow-400 mr-3" />
              <span className="text-lg font-semibold text-white bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
                Apple Authorized Reseller
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Visit Our
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Stores
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Experience premium Apple products and expert service at our
              conveniently located stores across Nepal
            </p>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white bg-opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 bg-opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </section>

      {/* Locations Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {locations.map((location, index) => (
              <motion.div
                key={location.name}
                variants={itemVariants}
                className={`group relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] ${
                  location.featured
                    ? "bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200"
                    : "bg-white"
                }`}
              >
                {location.featured && (
                  <div className="absolute top-6 right-6 z-10">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Featured Store
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 min-h-[500px]">
                  {/* Store Information */}
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="space-y-8">
                      {/* Header */}
                      <div>
                        <div className="flex items-center space-x-3 mb-3">
                          <Smartphone className="h-8 w-8 text-blue-600" />
                          <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            {location.subtitle}
                          </span>
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                          {location.name}
                        </h2>

                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-5 w-5 text-yellow-400 fill-current"
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold text-gray-700">
                            {location.rating}
                          </span>
                          <span className="text-gray-500">
                            ({location.reviews} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-6">
                        {/* Address */}
                        <div className="flex items-start space-x-4 group/item">
                          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                            <MapPin className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-lg">
                              Address
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                              {location.address}
                              <br />
                              {location.street}
                              <br />
                              <span className="font-medium text-gray-800">
                                {location.city}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center space-x-4 group/item">
                          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                            <Phone className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-lg">
                              Phone & WhatsApp
                            </p>
                            <div className="space-y-1">
                              <a
                                href={`tel:${location.phone}`}
                                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 block"
                              >
                                {location.phone}
                              </a>
                              <a
                                href={`https://wa.me/${location.whatsapp.replace(
                                  /\s+/g,
                                  ""
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
                              >
                                <span className="mr-2">WhatsApp</span>
                                <svg
                                  className="h-4 w-4"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center space-x-4 group/item">
                          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-2xl shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                            <Mail className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-lg">
                              Email
                            </p>
                            <a
                              href={`mailto:${location.email}`}
                              className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                            >
                              {location.email}
                            </a>
                          </div>
                        </div>

                        {/* Hours */}
                        <div className="flex items-center space-x-4 group/item">
                          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-2xl shadow-lg group-hover/item:scale-110 transition-transform duration-300">
                            <Clock className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-lg">
                              Business Hours
                            </p>
                            <div className="text-gray-600">
                              <p>Monday - Saturday: {location.hours}</p>
                              <p>
                                Sunday:{" "}
                                <span className="text-red-500 font-medium">
                                  Closed
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6">
                        <a
                          href={`tel:${location.phone}`}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center text-sm"
                        >
                          Call Now
                        </a>
                        <a
                          href={`https://wa.me/${location.whatsapp.replace(
                            /\s+/g,
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center text-sm"
                        >
                          WhatsApp
                        </a>
                        <button
                          onClick={() => openInGoogleMaps(location)}
                          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center text-sm flex items-center justify-center"
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Directions
                        </button>
                        <button
                          onClick={() => viewInGoogleMaps(location)}
                          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center text-sm flex items-center justify-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Map
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Map */}
                  <div className="relative h-[400px] xl:h-full min-h-[400px] rounded-b-3xl xl:rounded-r-3xl xl:rounded-bl-none overflow-hidden group/map">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>

                    {/* Click overlay for map interaction */}
                    <div
                      className="absolute inset-0 z-20 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-40"
                      onClick={() => viewInGoogleMaps(location)}
                    >
                      <div className="bg-white rounded-full p-4 shadow-2xl transform scale-90 group-hover/map:scale-100 transition-transform duration-300">
                        <ExternalLink className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>

                    {/* Map overlay button */}
                    <div className="absolute top-4 right-4 z-30">
                      <button
                        onClick={() => openInGoogleMaps(location)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center text-sm font-medium"
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Get Directions
                      </button>
                    </div>

                    <iframe
                      src={location.mapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      title={`${location.name} Map`}
                    ></iframe>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Award className="h-16 w-16 text-yellow-400 mx-auto mb-8" />
            <h2 className="text-4xl font-bold text-white mb-6">
              Why Choose Joy Store?
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              As an Apple Authorized Reseller, we provide genuine products,
              expert support, and warranty services you can trust. Visit us
              today for the best Apple experience in Nepal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 backdrop-blur-sm">
                  <Award className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Authorized Dealer
                </h3>
                <p className="text-blue-100">
                  Official Apple products with warranty
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 backdrop-blur-sm">
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  5 Star Service
                </h3>
                <p className="text-blue-100">
                  Excellent customer reviews and support
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white bg-opacity-20 rounded-full p-4 w-16 h-16 mx-auto mb-4 backdrop-blur-sm">
                  <Smartphone className="h-8 w-8 text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Expert Support
                </h3>
                <p className="text-blue-100">
                  Professional advice and technical help
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Location;
