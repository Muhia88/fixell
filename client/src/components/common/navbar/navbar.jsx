import React from "react";
import fixellLogo from "../../../assets/logos/fixell-logo.png";


const Navbar = () => {
  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-white shadow-sm">
      {/* Left: Logo */}
      <div className="flex items-center space-x-2">
        <img
          src={fixellLogo}
          alt="Fixell Logo"
          className="h-6 w-auto object-contain"
        />
        <span className="text-xl font-semibold text-gray-800">Fixell</span>
      </div>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
        <a href="#" className="hover:text-green-600 transition">Home</a>
        <a href="#" className="hover:text-green-600 transition">About</a>
        <a href="#" className="hover:text-green-600 transition">Marketplace</a>
        <a href="#" className="hover:text-green-600 transition">Support</a>
      </div>

      {/* Right: Auth Buttons */}
      <div className="flex items-center space-x-4">
        <button className="text-gray-700 font-medium hover:text-green-600 transition">
          Log In
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded-full font-medium hover:bg-green-600 transition">
          Sign Up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
