import React, { useState } from "react";
import { buildUrl } from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom'; 

const ListingCard = ({ listing }) => { 
  const navigate = useNavigate(); 
  const { id, title, description, price, category, created_at, status } = listing;
  const rawImage = (listing.images && listing.images.length > 0) ? listing.images[0] : listing.imageUrl;
  const imageUrl = rawImage ? buildUrl(rawImage) : rawImage;
  const [imgError, setImgError] = useState(false);

  const handleClick = () => {
      if (id && status === 'active') { 
          navigate(`/listing/${id}`);
      }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-shadow duration-150 ${status === 'active' ? 'hover:shadow-md cursor-pointer' : 'opacity-70'}`}
      onClick={handleClick}
      role={status === 'active' ? "button" : "article"}
      tabIndex={status === 'active' ? 0 : -1} 
      onKeyDown={(e) => { if (e.key === 'Enter' && status === 'active') handleClick(); }}
      aria-disabled={status !== 'active'} 
    >
      <div className="relative w-full h-48 sm:h-56 bg-gray-100 overflow-hidden">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl} alt={title} loading="lazy" onError={() => setImgError(true)}
            className="w-full h-full object-cover block"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-500">No image</div>
        )}

        <div className="absolute left-3 bottom-3 bg-white/90 px-3 py-1 rounded-full shadow-sm">
          <span className="text-sm font-bold text-green-600">KES {price?.toLocaleString('en-KE')}</span>
        </div>

        {status === 'sold' && (
             <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                Sold
             </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="p-4">
        <h3 className={`text-base font-semibold text-gray-800 mb-1 line-clamp-2 ${status === 'sold' ? 'line-through' : ''}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
          {description || "No description."}
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