import React from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';

const DonateTab = ({ isDark }) => {
  return (
    <div className={`max-w-2xl mx-auto rounded-xl shadow-lg p-8 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-center mb-6">
        <div className="bg-green-100 p-4 rounded-full animate-pulse">
          <Heart className="w-12 h-12 text-green-600 fill-current" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-2">Support Our Farmers</h2>
      <p className={`mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Your contribution helps us provide free AI tools to farmers across Nepal.
      </p>

      <div className={`border-4 border-dashed rounded-xl p-8 mb-6 inline-block transform hover:scale-105 transition duration-300 ${isDark ? 'border-gray-600 bg-gray-700' : 'border-green-200 bg-green-50'}`}>
        <div className="bg-white p-2 rounded-lg inline-block mb-3">
           <img
             src="assets/sc.png"
             alt="eSewa QR Code"
             className="w-48 h-48 mx-auto"
           />
        </div>
        <p className="mt-2 font-bold text-green-600 flex items-center justify-center">
          Scan with eSewa <ArrowUpRight className="w-4 h-4 ml-1"/>
        </p>
      </div>
        <p className={`text-sm opacity-70 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Thank you for making a difference in the lives of our farmers!
        </p>
    </div>
  );
}
export default DonateTab;