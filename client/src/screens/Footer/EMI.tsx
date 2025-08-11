import React from "react";
import NavbarSection from "../Homepage/sections/NavbarSection/NavbarSection";
import { FooterSection } from "../Homepage/sections/FooterSection/FooterSection";
import { motion } from "framer-motion";
import { Calculator, CreditCard, Building2, TrendingUp } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

const EMI = () => {
  const [amount, setAmount] = React.useState("");
  const [months, setMonths] = React.useState("");
  const [interestRate, setInterestRate] = React.useState("");
  const [emiAmount, setEmiAmount] = React.useState<number | null>(null);

  const calculateEMI = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(amount);
    const rate = parseFloat(interestRate) / 12 / 100;
    const time = parseFloat(months);
    
    const emi = principal * rate * Math.pow(1 + rate, time) / (Math.pow(1 + rate, time) - 1);
    setEmiAmount(Math.round(emi * 100) / 100);
  };

  const banks = [
    {
      name: "Nepal Bank Limited",
      logo: "/bank-logos/nbl.png",
      interestRate: "12-15%",
      processingFee: "1-2%",
      tenure: "3-36 months",
      icon: Building2
    },
    {
      name: "NIC Asia Bank",
      logo: "/bank-logos/nic.png",
      interestRate: "11-14%",
      processingFee: "1%",
      tenure: "6-48 months",
      icon: Building2
    },
    {
      name: "Nabil Bank",
      logo: "/bank-logos/nabil.png",
      interestRate: "11.5-14.5%",
      processingFee: "1-1.5%",
      tenure: "3-36 months",
      icon: Building2
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <NavbarSection />
      
      <main className="pt-50 sm:pt-36 md:pt-28 lg:pt-32 xl:pt-36 2xl:pt-40">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                  <Calculator className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                EMI Calculator
              </h1>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Calculate your monthly installments and plan your purchases with ease
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* EMI Calculator Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
            >
              <div className="flex items-center space-x-4 mb-8">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Calculator className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-black">Calculate Your EMI</h2>
              </div>

              <form onSubmit={calculateEMI} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-bold text-black mb-2">
                    Purchase Amount (NPR)
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="months" className="block text-sm font-bold text-black mb-2">
                    Tenure (Months)
                  </label>
                  <Input
                    id="months"
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    placeholder="Enter number of months"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="interest" className="block text-sm font-bold text-black mb-2">
                    Interest Rate (% per annum)
                  </label>
                  <Input
                    id="interest"
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="Enter interest rate"
                    className="border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Calculate EMI
                </Button>
              </form>

              {emiAmount !== null && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-bold text-black">EMI Details</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="text-gray-600 font-medium">Monthly EMI:</span>
                      <span className="font-bold text-xl text-black">NPR {emiAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="text-gray-600 font-medium">Total Amount:</span>
                      <span className="font-bold text-lg text-black">
                        NPR {(emiAmount * parseFloat(months)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600 font-medium">Total Interest:</span>
                      <span className="font-bold text-lg text-black">
                        NPR {((emiAmount * parseFloat(months)) - parseFloat(amount)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-8"
            >
              {/* Partner Banks */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <CreditCard className="h-6 w-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-black">Partner Banks</h2>
                </div>
                
                <div className="space-y-6">
                  {banks.map((bank, index) => {
                    const BankIcon = bank.icon;
                    return (
                      <motion.div
                        key={bank.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="border border-gray-200 rounded-xl p-6 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                            <BankIcon className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-bold text-black">{bank.name}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-600 font-medium mb-1">Interest Rate</p>
                            <p className="font-bold text-black">{bank.interestRate}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-600 font-medium mb-1">Processing Fee</p>
                            <p className="font-bold text-black">{bank.processingFee}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-600 font-medium mb-1">Tenure</p>
                            <p className="font-bold text-black">{bank.tenure}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-black mb-6">EMI Terms & Conditions</h2>
                
                <div className="space-y-4">
                  {[
                    "Minimum purchase amount: NPR 25,000",
                    "Valid government-issued ID required",
                    "Processing time: 2-3 working days",
                    "Early payment charges may apply",
                    "Interest rates subject to change",
                    "Bank approval required"
                  ].map((term, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 font-medium">{term}</p>
                    </motion.div>
                  ))}
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

export default EMI;