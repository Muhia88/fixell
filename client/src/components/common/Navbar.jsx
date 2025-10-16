import React from "react";
import { Link, NavLink } from "react-router-dom";
import fixellLogo from "/logos/fixell-logo.png";

const Navbar = () => {
  // Helper function for NavLink active styling
  const getNavLinkClass = ({ isActive }) =>
    isActive
      ? "text-green-600 font-semibold"
      : "text-gray-700 hover:text-green-600 transition";

  return (
    <nav className="flex justify-between items-center py-4 px-8 bg-white shadow-sm">
      {/* Left: Logo */}
      <Link to="/" className="flex items-center space-x-2">
        <img
          src={fixellLogo}
          alt="Fixell Logo"
          className="h-6 w-auto object-contain"
        />
        <span className="text-xl font-semibold text-gray-800">Fixell</span>
      </Link>

      {/* Center: Navigation Links - Changed to NavLink for active styling */}
      <div className="hidden md:flex space-x-8 font-medium">
        <NavLink to="/" className={getNavLinkClass}>
          Home
        </NavLink>
        <NavLink to="/about" className={getNavLinkClass}>
          About
        </NavLink>
        <NavLink to="/marketplace" className={getNavLinkClass}>
          Marketplace
        </NavLink>
        {/* Added the new AI Guide link here */}
        <NavLink to="/generate-guide" className={getNavLinkClass}>
          AI Guide
        </NavLink>
        <NavLink to="/support" className={getNavLinkClass}>
          Support
        </NavLink>
      </div>

      {/* Right: Auth Buttons - Changed to Link for SPA navigation */}
      <div className="flex items-center space-x-4">
        <Link to="/login" className="text-gray-700 font-medium hover:text-green-600 transition">
          Log In
        </Link>
        <Link to="/register" className="bg-green-500 text-white px-4 py-2 rounded-full font-medium hover:bg-green-600 transition">
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
