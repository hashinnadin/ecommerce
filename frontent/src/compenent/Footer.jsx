import React from "react";
import { FaFacebook, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { HiCake } from "react-icons/hi";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-gray-300 pt-12 pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                <HiCake className="text-white text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-white">SweetMart</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Freshly baked happiness delivered to your doorstep. We craft each cake with love, premium ingredients, and a sprinkle of joy.
            </p>
            
            {/* Social Media */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-rose-500 rounded-lg flex items-center justify-center 
                text-gray-300 hover:text-white transition-all duration-300 hover:scale-110">
                <FaFacebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-pink-500 rounded-lg flex items-center justify-center 
                text-gray-300 hover:text-white transition-all duration-300 hover:scale-110">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 hover:bg-blue-500 rounded-lg flex items-center justify-center 
                text-gray-300 hover:text-white transition-all duration-300 hover:scale-110">
                <FaTwitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-slate-700">
              Quick Navigation
            </h3>
            <ul className="space-y-3">
              {['Home', 'Products', 'Categories', 'Special Offers', 'New Arrivals'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 
                    flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-slate-700">
              Customer Support
            </h3>
            <ul className="space-y-3">
              {[
                'FAQs & Help Center',
                'Shipping Information',
                'Return & Refund Policy',
                'Privacy Policy',
                'Terms & Conditions'
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white hover:translate-x-2 transition-all duration-300 
                    flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 pb-2 border-b border-slate-700">
              Get In Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt className="text-rose-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Our Location</p>
                  <p className="text-gray-400 text-sm">Malappuram, Kerala 676509</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaPhone className="text-rose-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Call Us</p>
                  <p className="text-gray-400 text-sm">+91 98765 43210</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="text-rose-500" />
                </div>
                <div>
                  <p className="text-white font-medium">Email Us</p>
                  <p className="text-gray-400 text-sm">support@sweetmart.com</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl p-6 mb-10 border border-slate-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Sweet Updates</h3>
              <p className="text-gray-400">Subscribe to get news about new arrivals & special offers</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input 
                type="email" 
                placeholder="Your email address"
                className="flex-1 md:w-64 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg 
                focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none text-white"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white 
                font-semibold rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-6"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-500 text-sm">
            © {currentYear} SweetMart. All Rights Reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Cookies Policy
            </a>
          </div>
          
          <div className="text-gray-500 text-sm">
            Made with ❤️ in Kerala
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-3">We Accept</p>
          <div className="flex justify-center gap-4 text-2xl">
            <span className="text-gray-400">💳</span>
            <span className="text-gray-400">📱</span>
            <span className="text-gray-400">🏦</span>
            <span className="text-gray-400">🔗</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;