import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import fixellLogo from "../../assets/logos/fixell-logo.png";

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();

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
        <Link to="/" className="hover:text-green-600 transition">Home</Link>
        <Link to="/about" className="hover:text-green-600 transition">About</Link>
        <Link to="/marketplace" className="hover:text-green-600 transition">Marketplace</Link>
        <Link to="/support" className="hover:text-green-600 transition">Support</Link>
      </div>

      {/* Right: Auth Buttons */}
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            {/* Greeting on medium+ screens, icon on small screens */}
            <Link to="/profile" className="text-gray-700 font-medium hover:text-green-600 transition flex items-center space-x-2">
              <span className="hidden md:inline">Hi! {user?.name?.split(' ')[0] || user?.email || 'User'}</span>
              <svg className="w-6 h-6 md:hidden text-gray-700" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </Link>
            <button
              onClick={() => logout()}
              className="bg-red-500 text-white px-4 py-2 rounded-full font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-gray-700 font-medium hover:text-green-600 transition"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="bg-green-500 text-white px-4 py-2 rounded-full font-medium hover:bg-green-600 transition"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;