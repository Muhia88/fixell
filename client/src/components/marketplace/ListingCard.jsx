import React, { useState } from "react";

const ListingCard = ({ listing, onClick }) => {
  const { title, description, price, category, created_at, imageUrl } = listing;
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-150 cursor-pointer"
      onClick={() => onClick && onClick(listing)}
      role={onClick ? "button" : "article"}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' && onClick) onClick(listing); }}
    >
      <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-gray-100 overflow-hidden">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover block"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">No image</div>
        )}

        {/* Price badge overlay */}
        <div className="absolute left-3 bottom-3 bg-white/90 px-3 py-1 rounded-full shadow-sm">
          <span className="text-sm font-bold text-green-600">KSH {price}</span>
        </div>

        {/* subtle gradient for readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-2">
          {title}
        </h3>

        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {description || "No description provided."}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="px-2 py-0.5 bg-gray-100 rounded-full">{category || "General"}</span>
          <span>{created_at ? new Date(created_at).toLocaleDateString() : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
