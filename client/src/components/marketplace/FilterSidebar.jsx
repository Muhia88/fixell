import React, { useState } from "react";

const FilterSidebar = ({ categories = [], onFilterChange }) => {
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const apply = () => {
    onFilterChange &&
      onFilterChange({
        category: category || null,
        minPrice: minPrice ? Number(minPrice) : null,
        maxPrice: maxPrice ? Number(maxPrice) : null,
      });
  };

  const clear = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    onFilterChange &&
      onFilterChange({ category: null, minPrice: null, maxPrice: null });
  };

  return (
    <div className="w-full md:w-64 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <h4 className="text-sm font-semibold mb-3">Filters</h4>

      <label className="text-xs text-gray-600">Category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full rounded-md border border-gray-200 px-3 py-2 mt-1 mb-3 text-sm"
      >
        <option value="">All</option>
        <option value="Furniture">Furniture</option>
        <option value="Lighting">Lighting</option>
        <option value="Clothing">Clothing</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <label className="text-xs text-gray-600">Min price</label>
      <input
        type="number"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        placeholder="e.g. 100"
        className="w-full rounded-md border border-gray-200 px-3 py-2 mt-1 mb-3 text-sm"
      />

      <label className="text-xs text-gray-600">Max price</label>
      <input
        type="number"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        placeholder="e.g. 2000"
        className="w-full rounded-md border border-gray-200 px-3 py-2 mt-1 mb-4 text-sm"
      />

      <div className="flex gap-2">
        <button
          onClick={apply}
          className="flex-1 bg-green-600 text-white rounded-xl px-3 py-2 text-sm hover:bg-green-700"
        >
          Apply
        </button>
        <button
          onClick={clear}
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm hover:bg-gray-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default FilterSidebar;
