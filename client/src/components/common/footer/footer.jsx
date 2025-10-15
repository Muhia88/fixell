import React from "react";
import { FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-50 text-center py-10 mt-16 border-t border-gray-200">
      {/* Main Links */}
      <div className="flex flex-col md:flex-row justify-center items-center space-y-3 md:space-y-0 md:space-x-6 text-gray-700 font-medium mb-6">
        <a href="#" className="hover:text-green-600 transition">About</a>
        <a href="#" className="hover:text-green-600 transition">Contact</a>
        <a href="#" className="hover:text-green-600 transition">Terms of Service</a>
        <a href="#" className="hover:text-green-600 transition">Privacy Policy</a>
      </div>

      {/* Social Icons */}
      <div className="flex justify-center space-x-6 mb-6">
        <a href="#" aria-label="Twitter" className="text-gray-600 hover:text-green-600 transition">
          <FaTwitter size={18} />
        </a>
        <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-green-600 transition">
          <FaInstagram size={18} />
        </a>
        <a href="#" aria-label="Facebook" className="text-gray-600 hover:text-green-600 transition">
          <FaFacebookF size={18} />
        </a>
      </div>

      {/* Copyright */}
      <p className="text-gray-500 text-sm">
        © 2025 Fixell. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
