import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Fixell */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3 text-lg">Fixell</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Fixell connects customers with reliable repair professionals and
              service providers, making fixing things easier than ever.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><a href="#" className="hover:text-green-600 transition">About Us</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Careers</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Blog</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Contact</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Support</h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li><a href="#" className="hover:text-green-600 transition">Help Center</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-green-600 transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-600 transition">FAQs</a></li>
            </ul>
          </div>

          {/* Newsletter / Socials */}
          <div>
            <h3 className="text-gray-800 font-semibold mb-3">Stay Connected</h3>
            <p className="text-gray-600 text-sm mb-3">
              Subscribe to our newsletter for updates and offers.
            </p>
            <form className="flex space-x-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Fixell. All rights reserved.</p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            <a href="#" className="hover:text-green-600 transition">Facebook</a>
            <a href="#" className="hover:text-green-600 transition">Twitter</a>
            <a href="#" className="hover:text-green-600 transition">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
