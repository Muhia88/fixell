import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import fixellLogo from "../../assets/logos/fixell-logo.png";
import ProfileIcon from './ProfileIcon';

const Navbar = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
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
        {!isLoggedIn && (
          <Link to="/" className="hover:text-green-600 transition">Home</Link>
        )}
        <Link to="/about" className="hover:text-green-600 transition">About</Link>
        <Link to="/marketplace" className="hover:text-green-600 transition">Marketplace</Link>
        {isLoggedIn && (
          <>
            <Link to="/my-listings" className="hover:text-green-600 transition">My Listings</Link>
            <Link to="/impact" className="hover:text-green-600 transition">My Impact</Link>
            <Link to="/generate-guide" className="hover:text-green-600 transition">AI Assistant</Link>
          </>
        )}
        <Link to="/support" className="hover:text-green-600 transition">Support</Link>
      </div>

      {/* Right: Auth Buttons */}
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <>
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-gray-700 font-medium">Hi! {user?.name?.split(' ')[0] || user?.email || 'User'}</div>
              <ProfileIcon initials={user?.name ? user.name.charAt(0).toUpperCase() : ''} size={36} onClick={() => navigate('/profile')} ariaLabel="Open profile" />
            </div>
            <button
              onClick={() => logout()}
              className="bg-red-500 text-white px-4 py-2 rounded-full font-medium hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate('/login');
              }}
              className="text-gray-700 font-medium hover:text-green-600 transition"
            >
              Log In
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                navigate('/register');
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-full font-medium hover:bg-green-600 transition"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;