import React, { useEffect, useState } from "react";
import { Building, MapPin, AlertCircle } from "lucide-react";
import type { StoreLocation } from "../redux/constants/settingsConstants";

interface ShippingFormData {
  name: string;
  email: string;
  phone: string;
  subStoreLocation: string; // This will store the location ID
  province: string;
  district: string;
  city: string;
  streetAddress: string;
  saveInfo: boolean;
}

interface ShippingFormProps {
  formData: ShippingFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({
  formData,
  onChange,
}) => {
  console.log("ShippingForm render - formData.province:", formData.province);
  console.log("ShippingForm render - formData.district:", formData.district);
  console.log(
    "ShippingForm render - formData.subStoreLocation:",
    formData.subStoreLocation
  );

  // State for selected store (from cart)
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(
    null
  );

  // Load selected store from localStorage (set in cart page)
  useEffect(() => {
    const savedBranch = localStorage.getItem("selectedBranch");
    if (savedBranch) {
      try {
        const branch = JSON.parse(savedBranch);
        setSelectedStore(branch);
        console.log("Loaded selected store from cart:", branch);
      } catch (error) {
        console.error("Error loading selected store:", error);
      }
    }
  }, []);

  // District data for each province (extracted from Cart.tsx)
  const districtData: Record<string, string[]> = {
    koshi: [
      "Taplejung",
      "Panchthar",
      "Ilam",
      "Jhapa",
      "Morang",
      "Sunsari",
      "Dhankuta",
      "Terhathum",
      "Sankhuwasabha",
      "Bhojpur",
      "Solukhumbu",
      "Okhaldhunga",
      "Khotang",
      "Udayapur",
    ],
    province2: [
      "Saptari",
      "Siraha",
      "Dhanusha",
      "Mahottari",
      "Sarlahi",
      "Bara",
      "Parsa",
      "Rautahat",
    ],
    bagmati: [
      "Sindhuli",
      "Ramechhap",
      "Dolakha",
      "Sindhupalchok",
      "Kavrepalanchok",
      "Lalitpur",
      "Bhaktapur",
      "Kathmandu",
      "Nuwakot",
      "Rasuwa",
      "Dhading",
      "Chitwan",
      "Makwanpur",
    ],
    gandaki: [
      "Gorkha",
      "Lamjung",
      "Tanahu",
      "Syangja",
      "Kaski",
      "Manang",
      "Mustang",
      "Myagdi",
      "Parbat",
      "Baglung",
      "Nawalpur",
    ],
    lumbini: [
      "Kapilvastu",
      "Parasi",
      "Rupandehi",
      "Palpa",
      "Gulmi",
      "Arghakhanchi",
      "Pyuthan",
      "Rolpa",
      "East Rukum",
      "Banke",
      "Bardiya",
      "Dang",
    ],
    karnali: [
      "West Rukum",
      "Salyan",
      "Dolpa",
      "Humla",
      "Jumla",
      "Kalikot",
      "Mugu",
      "Surkhet",
      "Dailekh",
      "Jajarkot",
    ],
    sudurpashchim: [
      "Bajura",
      "Bajhang",
      "Achham",
      "Doti",
      "Kailali",
      "Kanchanpur",
      "Dadeldhura",
      "Baitadi",
      "Darchula",
    ],
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log("Province onChange event:");
    console.log("- e.target.name:", e.target.name);
    console.log("- e.target.value:", e.target.value);
    console.log("Available districts:", districtData[e.target.value]);

    // Just update province - let parent handle district reset if needed
    onChange(e);
  };

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={formData.name}
            onChange={onChange}
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={formData.email}
            onChange={onChange}
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          value={formData.phone}
          onChange={onChange}
          placeholder="Enter your phone number"
        />
      </div>

      {/* Selected Store Display (Read-only) */}
      {selectedStore && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Building className="w-4 h-4 mr-1" />
            Selected Store Location
          </label>

          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start">
              <Building className="w-4 h-4 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-green-800 mb-1">
                  {selectedStore.locationName}
                </p>
                <div className="text-green-700 space-y-1">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{selectedStore.address}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-3 h-3 mr-1 text-center">📞</span>
                    <span>{selectedStore.phone}</span>
                  </div>
                  {selectedStore.email && (
                    <div className="flex items-center">
                      <span className="w-3 h-3 mr-1 text-center">✉️</span>
                      <span>{selectedStore.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2 italic">
              Selected in cart • Change in cart if needed
            </p>
          </div>
        </div>
      )}

      {/* No store selected warning */}
      {!selectedStore && (
        <div className="mt-4">
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-800 font-medium">
                No store location selected
              </p>
              <p className="text-yellow-700">
                Please go back to cart and select a store location.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Province <span className="text-red-500">*</span>
        </label>
        <select
          name="province"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          value={formData.province}
          onChange={handleProvinceChange}
        >
          <option value="">Select Province</option>
          <option value="koshi">Koshi Province</option>
          <option value="province2">Madhesh Province</option>
          <option value="bagmati">Bagmati Province</option>
          <option value="gandaki">Gandaki Province</option>
          <option value="lumbini">Lumbini Province</option>
          <option value="karnali">Karnali Province</option>
          <option value="sudurpashchim">Sudurpashchim Province</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            District <span className="text-red-500">*</span>
          </label>
          <select
            key={`district-${formData.province}`}
            name="district"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={formData.district}
            onChange={onChange}
          >
            <option value="">Select District</option>
            {formData.province &&
              districtData[formData.province] &&
              districtData[formData.province].map((district) => {
                const value = district.toLowerCase().replace(/\s+/g, "");
                console.log(`Rendering option: ${district} -> ${value}`);
                return (
                  <option key={district} value={value}>
                    {district}
                  </option>
                );
              })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="city"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            value={formData.city}
            onChange={onChange}
            placeholder="Enter your city"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="streetAddress"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          value={formData.streetAddress}
          onChange={onChange}
          placeholder="Enter your street address"
        />
      </div>

      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="saveInfo"
          name="saveInfo"
          className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
          checked={formData.saveInfo}
          onChange={onChange}
        />
        <label htmlFor="saveInfo" className="ml-2 text-sm text-gray-600">
          Save this information for next time
        </label>
      </div>
    </div>
  );
};
