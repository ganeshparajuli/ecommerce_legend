import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck,
  Lock,
  CreditCard,
  CheckCircle,
  Wallet,
  DollarSign,
  Smartphone,
  Building,
  Truck,
  Star,
  Zap,
  Clock,
  Shield,
  AlertCircle,
  Phone,
  Mail,
  MapPin
} from "lucide-react";

interface PaymentOption {
  id: number;
  name: string;
  image: string;
  description?: string;
  isPopular?: boolean;
  processingTime?: string;
  fee?: string;
  type: 'digital' | 'bank' | 'cash' | 'card';
  features?: string[];
  security?: number;
  speed?: number;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 1,
    name: "Esewa",
    image: "/public/esewa-logo-1.png",
    description: "Nepal's most trusted digital wallet",
    isPopular: true,
    processingTime: "Instant",
    fee: "Free",
    type: 'digital',
    features: ["Instant Transfer", "24/7 Available", "Mobile App"],
    security: 5,
    speed: 5
  },
  {
    id: 2,
    name: "Khalti",
    image: "/public/khalti.png", 
    description: "Smart digital payments made easy",
    isPopular: true,
    processingTime: "Instant",
    fee: "Free",
    type: 'digital',
    features: ["QR Payment", "Bill Payment", "Rewards"],
    security: 5,
    speed: 5
  },
  {
    id: 3,
    name: "IME Pay",
    image: "/public/imepay.png",
    description: "Secure mobile payment solution",
    processingTime: "Instant",
    fee: "Free",
    type: 'digital',
    features: ["Mobile Banking", "Fund Transfer", "Secure"],
    security: 5,
    speed: 4
  },
  {
    id: 4,
    name: "Connect IPS",
    image: "/public/cips_logo.png",
    description: "Interbank payment system",
    processingTime: "1-2 minutes",
    fee: "Rs. 5",
    type: 'bank',
    features: ["Bank Transfer", "Real-time", "All Banks"],
    security: 5,
    speed: 4
  },
  {
    id: 5,
    name: "Cash on Delivery",
    image: "/placeholder-cod.png",
    description: "Pay when you receive your order",
    processingTime: "At delivery",
    fee: "Rs. 50",
    type: 'cash',
    features: ["No Advance Payment", "Inspect First", "Cash Payment"],
    security: 4,
    speed: 2
  },
  {
    id: 6,
    name: "Bank Transfer",
    image: "/placeholder-bank.png",
    description: "Direct bank account transfer", 
    processingTime: "2-24 hours",
    fee: "Bank charges apply",
    type: 'bank',
    features: ["All Banks", "Large Amounts", "Traditional"],
    security: 5,
    speed: 2
  },
  {
    id: 7,
    name: "Credit/Debit Card",
    image: "/placeholder-card.png",
    description: "Visa, Mastercard accepted",
    processingTime: "Instant",
    fee: "2.5% + Rs. 10",
    type: 'card',
    features: ["International Cards", "EMI Available", "Rewards"],
    security: 5,
    speed: 5
  },
  {
    id: 8,
    name: "Mobile Banking",
    image: "/placeholder-mobile.png",
    description: "All major banks supported",
    processingTime: "1-5 minutes",
    fee: "Bank charges",
    type: 'bank',
    features: ["All Banks", "Mobile App", "Secure Login"],
    security: 5,
    speed: 4
  }
];

export const PaymentOptions = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'digital' | 'bank' | 'cash' | 'card'>('all');
  const [selectedPayment, setSelectedPayment] = useState<number | null>(null);

  // Contact information
  const contactInfo = {
    kathmandu: {
      city: "Kathmandu",
      phone: "9851343371",
      area: "Tamrakar Complex Shop 9 Newroad"
    },
    pokhara: {
      city: "Pokhara", 
      phone: "985-6060163",
      area: "Mahendrapool, Infront of Sita Bhawan"
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'digital':
        return <Smartphone className="w-4 h-4" />;
      case 'bank':
        return <Building className="w-4 h-4" />;
      case 'cash':
        return <Truck className="w-4 h-4" />;
      case 'card':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'digital':
        return 'bg-blue-500';
      case 'bank':
        return 'bg-green-500';
      case 'cash':
        return 'bg-orange-500';
      case 'card':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const filteredOptions = selectedCategory === 'all' 
    ? paymentOptions 
    : paymentOptions.filter(option => option.type === selectedCategory);

  const handlePaymentSelect = (paymentId: number) => {
    setSelectedPayment(paymentId);
    console.log('Selected payment method:', paymentId);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600 mr-3" />
            <span className="text-green-600 font-semibold text-lg">Secure Payments</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Choose Your Payment Method
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            We support multiple secure payment options for your convenience. All transactions are encrypted and protected.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {[
            { icon: Lock, text: "256-bit SSL", color: "text-green-600" },
            { icon: ShieldCheck, text: "PCI Compliant", color: "text-blue-600" },
            { icon: Zap, text: "Instant Processing", color: "text-yellow-600" },
            { icon: CheckCircle, text: "100% Secure", color: "text-purple-600" }
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm"
            >
              <item.icon className={`w-6 h-6 ${item.color} mx-auto mb-2`} />
              <span className="text-sm font-medium text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-xl p-2 border border-gray-200 shadow-lg">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All Methods', icon: Wallet },
                { key: 'digital', label: 'Digital', icon: Smartphone },
                { key: 'bank', label: 'Banking', icon: Building },
                { key: 'cash', label: 'Cash', icon: Truck },
                { key: 'card', label: 'Cards', icon: CreditCard }
              ].map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key as any)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                    selectedCategory === category.key
                      ? 'bg-red-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {filteredOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => handlePaymentSelect(option.id)}
            >
              <div
                className={`bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-all border-2 relative ${
                  selectedPayment === option.id 
                    ? 'border-red-600' 
                    : 'border-gray-100 hover:border-red-200'
                }`}
              >
                {/* Type Badge */}
                <div className="absolute top-4 left-4">
                  <div className={`${getTypeColor(option.type)} text-white rounded-lg p-1.5`}>
                    {getTypeIcon(option.type)}
                  </div>
                </div>

                {/* Popular Badge */}
                {option.isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </span>
                  </div>
                )}

                {/* Selected Badge */}
                {selectedPayment === option.id && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white rounded-full p-1">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}

                {/* Payment Logo */}
                <div className="flex items-center justify-center h-16 mb-4 mt-8">
                  <img
                    src={option.image}
                    alt={option.name}
                    className="h-12 w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-icon');
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'block';
                      }
                    }}
                  />
                  <CreditCard 
                    className="fallback-icon hidden h-12 w-12 text-gray-400" 
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Payment Info */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {option.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {option.description}
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-3 h-3 text-blue-600 mr-1" />
                        <span className="text-xs font-medium text-gray-600">Time</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{option.processingTime}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center justify-center mb-1">
                        <DollarSign className="w-3 h-3 text-green-600 mr-1" />
                        <span className="text-xs font-medium text-gray-600">Fee</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{option.fee}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center justify-center space-x-4 mb-4">
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-gray-600 mr-1">Security:</span>
                      <div className="flex">{renderStars(option.security || 5)}</div>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-medium text-gray-600 mr-1">Speed:</span>
                      <div className="flex">{renderStars(option.speed || 4)}</div>
                    </div>
                  </div>

                  {/* Features */}
                  {option.features && (
                    <div className="space-y-1">
                      {option.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-center justify-center text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Information */}
        <div className="mb-12 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border border-gray-200">
            <div className="text-center mb-6">
              <ShieldCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Security is Our Priority</h3>
              <p className="text-gray-600">All payment methods are secured with industry-standard encryption</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Lock className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">End-to-End Encryption</h4>
                <p className="text-sm text-gray-600">All transactions are encrypted from start to finish</p>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Fraud Protection</h4>
                <p className="text-sm text-gray-600">Advanced fraud detection keeps your money safe</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Compliance</h4>
                <p className="text-sm text-gray-600">PCI DSS Level 1 certified for maximum security</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-6 max-w-4xl mx-auto border border-gray-200">
            <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-6">
              Our support team is here 24/7 to assist you with payment methods
            </p>
            
            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Kathmandu Phone */}
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-red-600" />
                <div className="text-center">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Kathmandu
                  </div>
                  <a 
                    href={`tel:${contactInfo.kathmandu.phone}`}
                    className="font-semibold text-gray-900 hover:text-red-600"
                  >
                    {contactInfo.kathmandu.phone}
                  </a>
                </div>
              </div>

              {/* Pokhara Phone */}
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-5 h-5 text-red-600" />
                <div className="text-center">
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Pokhara
                  </div>
                  <a 
                    href={`tel:${contactInfo.pokhara.phone}`}
                    className="font-semibold text-gray-900 hover:text-red-600"
                  >
                    {contactInfo.pokhara.phone}
                  </a>
                </div>
              </div>

              {/* Email Support */}
              <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                <div className="text-center">
                  <div className="text-xs text-gray-500">Email Support</div>
                  <a 
                    href="mailto:support@joystore.com"
                    className="font-semibold text-gray-900 hover:text-blue-600"
                  >
                    support@joystore.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentOptions;