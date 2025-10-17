import React, { useState } from "react";
import Navbar from "../components/common/navbar";
import Footer from "../components/common/footer";
import ListingCard from "../components/marketplace/ListingCard";
import FilterSidebar from "../components/marketplace/FilterSidebar";

// Sample data
const listingsData = [
  {
    id: 1,
    title: "Refurbished Chair",
    category: "Furniture",
    price: 1200,
    imageUrl: "/marketplace/refubrished%20chair.jpeg",
  },
  {
    id: 2,
    title: "Stylish Lamp",
    category: "Lighting",
    price: 800,
    imageUrl: "/marketplace/vintage%20lamp.jpeg",
  },
  {
    id: 3,
    title: "Casual Jacket",
    category: "Clothing",
    price: 1500,
    imageUrl:"/marketplace/jacket.jpeg",
  },
  {
    id: 4,
    title: "Office Desk",
    category: "Furniture",
    price: 3500,
    imageUrl: "/marketplace/table.jpeg",
  },
  {
    id: 5,
    title: "Desk Lamp",
    category: "Lighting",
    price: 1200,
    imageUrl: "/marketplace/vintage%20lamp.jpeg",
  },
  {
    id: 6,
    title: "Console Table",
    category: "Furniture",
    price: 2800,
    imageUrl: "/marketplace/table.jpeg",
  },
];

const Marketplace = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Apply filter logic
  const filteredListings = listingsData.filter((item) => {
    const matchCategory = !filters.category || item.category === filters.category;
    const matchMin = !filters.minPrice || item.price >= filters.minPrice;
    const matchMax = !filters.maxPrice || item.price <= filters.maxPrice;
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchMin && matchMax && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Page Header */}
      <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-r from-green-600 to-lime-500 text-white">
        <h1 className="text-3xl font-bold mb-3">Marketplace</h1>
        <p className="text-sm opacity-90">Find refurbished treasures at great prices</p>
      </div>

      {/* Search and Filter Section */}
      <div className="relative container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          {/* Search bar */}
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Toggle Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="ml-4 bg-green-600 text-white px-5 py-2 rounded-xl text-sm hover:bg-green-700"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Floating Filters */}
        {showFilters && (
          <div
            className="absolute inset-0 top-0 right-0 z-50 flex justify-end bg-black/40"
            onClick={() => setShowFilters(false)}
          >
            <div className="mt-20 mr-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
              <FilterSidebar
                onFilterChange={(f) => {
                  setFilters(f);
                  setShowFilters(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 mt-4">
          {filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))
          ) : (
            <p className="text-gray-500 text-center col-span-full py-10">
              No items match your search or filters.
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Marketplace;
