import React from "react";
import fixellLogo from "../../../assets/logos/fixell-logo.png";

const Navbar = () => {
  return (
    <nav className="w-full fixed top-0 left-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        
        {/* Left: Logo */}
        <div className="flex items-center space-x-2">
          <img
            src={fixellLogo}
            alt="Fixell Logo"
            className="h-10 w-auto object-contain"
          />
          <span className="text-2xl font-bold text-gray-800">Fixell</span>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
          <a href="#" className="hover:text-green-600 transition">Home</a>
          <a href="#" className="hover:text-green-600 transition">About</a>
          <a href="#" className="hover:text-green-600 transition">Marketplace</a>
          <a href="#" className="hover:text-green-600 transition">Support</a>
        </div>

        {/* Right: Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            type="button"
            className="text-gray-700 font-medium hover:text-green-600 transition"
          >
            Log In
          </button>
          <button
            type="button"
            className="bg-green-500 text-white px-4 py-2 rounded-full font-medium hover:bg-green-600 transition"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Mobile Menu (optional for responsiveness) */}
      <div className="md:hidden flex justify-center space-x-6 py-2 border-t text-gray-700 font-medium">
        <a href="#" className="hover:text-green-600 transition">Home</a>
        <a href="#" className="hover:text-green-600 transition">About</a>
        <a href="#" className="hover:text-green-600 transition">Marketplace</a>
        <a href="#" className="hover:text-green-600 transition">Support</a>
      </div>
    </nav>
  );
};

export default Navbar;
