import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { buildUrl } from '../api/axiosConfig';
import { ArrowLeft, Phone, Tag, MapPin, TagIcon, Package, Calendar } from 'lucide-react';
import Button from '../components/common/Button'; 

const ViewListingPage = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const fetchListing = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/listings/${id}`);
                if (response.data?.success) {
                    setListing(response.data.data);
                } else {
                    throw new Error(response.data?.message || 'Listing not found or unavailable');
                }
            } catch (err) {
                console.error("Failed to fetch listing:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchListing();
        } else {
            setError("No listing ID provided.");
            setLoading(false);
        }
    }, [id]);

    const handleNextImage = () => {
        if (listing && listing.images) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % listing.images.length);
        }
    };

    const handlePrevImage = () => {
        if (listing && listing.images) {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + listing.images.length) % listing.images.length);
        }
    };


    if (loading) {
        return <div className="text-center p-10">Loading listing details...</div>;
    }

    if (error) {
        return (
            <div className="text-center p-10 text-red-600">
                <p>Error loading listing: {error}</p>
                <Button onClick={() => navigate('/marketplace')} className="mt-4">Back to Marketplace</Button>
            </div>
        );
    }

    if (!listing) {
        return <div className="text-center p-10">Listing not found.</div>;
    }

    const currentImageUrl = listing.images?.length > 0 ? buildUrl(listing.images[currentImageIndex]) : null;

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-lg rounded-lg text-left">
            <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft size={16} className="mr-1" /> Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="relative">
                    {currentImageUrl ? (
                        <img
                            src={currentImageUrl}
                            alt={listing.title}
                            className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md border border-gray-200"
                        />
                    ) : (
                        <div className="w-full h-64 md:h-96 bg-gray-100 flex items-center justify-center rounded-lg text-gray-500">
                            No Image Available
                        </div>
                    )}
                    {listing.images && listing.images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 focus:outline-none"
                                aria-label="Previous image"
                            >
                                &#10094;
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 focus:outline-none"
                                aria-label="Next image"
                            >
                                &#10095;
                            </button>
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                {currentImageIndex + 1} / {listing.images.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Details Section */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                    <p className="text-2xl font-semibold text-green-600 mb-4">KES {listing.price?.toLocaleString('en-KE')}</p>

                    <div className="space-y-3 text-sm text-gray-700 mb-6">
                        {listing.category && (
                            <div className="flex items-center">
                                <TagIcon size={16} className="mr-2 text-gray-500" /> Category: <span className="font-medium ml-1">{listing.category}</span>
                            </div>
                        )}
                        {listing.condition && (
                            <div className="flex items-center">
                                <Package size={16} className="mr-2 text-gray-500" /> Condition: <span className="font-medium ml-1">{listing.condition}</span>
                            </div>
                        )}
                        {listing.location && (
                            <div className="flex items-center">
                                <MapPin size={16} className="mr-2 text-gray-500" /> Location: <span className="font-medium ml-1">{listing.location}</span>
                            </div>
                        )}
                        <div className="flex items-center">
                                <Calendar size={16} className="mr-2 text-gray-500" /> Listed on: <span className="font-medium ml-1">{new Date(listing.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                    <p className="text-gray-600 mb-6 whitespace-pre-wrap">{listing.description || 'No description provided.'}</p>

                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Seller Information</h2>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-800 font-medium">{listing.author?.name || 'Seller'}</p>
                        {listing.author?.phone_number ? (
                             <a href={`tel:${listing.author.phone_number}`} className="mt-2 inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                                <Phone size={16} className="mr-2" /> Call Seller ({listing.author.phone_number})
                            </a>
                        ) : (
                            <p className="text-sm text-gray-500 mt-1">Phone number not available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewListingPage;