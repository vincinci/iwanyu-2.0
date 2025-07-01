import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Language Section */}
        <div className="mb-8">
          <h3 className="text-lg font-normal text-gray-900 mb-4">Language</h3>
          <select className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" aria-label="Select language">
            <option>English</option>
            <option>Kinyarwanda</option>
            <option>French</option>
          </select>
        </div>

        {/* Payment Methods */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Payment methods</span>
            <div className="flex space-x-3">
              {/* Visa */}
              <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              
              {/* Mastercard */}
              <div className="w-10 h-6 bg-red-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">MC</span>
              </div>
              
              {/* Mobile Money - MTN */}
              <div className="w-10 h-6 bg-yellow-400 rounded flex items-center justify-center">
                <span className="text-black text-xs font-bold">MTN</span>
              </div>
              
              {/* Mobile Money - Airtel */}
              <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">AIR</span>
              </div>
              
              {/* Bank Transfer */}
              <div className="w-10 h-6 bg-gray-700 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">BNK</span>
              </div>
              
              {/* PayPal */}
              <div className="w-10 h-6 bg-blue-700 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">PP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 text-sm text-gray-600">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <span>© 2024, <Link to="/" className="hover:text-yellow-700 transition-colors">iwanyu stores</Link></span>
            <Link to="/privacy-policy" className="hover:text-yellow-700 transition-colors">
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
