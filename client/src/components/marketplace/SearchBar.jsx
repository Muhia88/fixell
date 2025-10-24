import React from "react";

const SearchBar = ({ value, onChange, onSubmit }) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit && onSubmit();
      }}
      className="w-full"
    >
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search listings (title, description)..."
          className="w-full rounded-xl border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
        />
        <button
          type="submit"
          className="bg-green-600 text-white rounded-xl px-4 py-2 font-medium hover:bg-green-700"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
