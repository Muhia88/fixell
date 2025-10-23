import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import ListingCard from "../components/marketplace/ListingCard"; 
import FilterSidebar from "../components/marketplace/FilterSidebar";
import { AuthContext } from "../components/context/ui/authContextValue.jsx";
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const Marketplace = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  // debounced search term prevents rapid-fire requests while user types
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  // update debouncedSearchTerm after a pause (350ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 350);
    return () => clearTimeout(t);
  }, [searchTerm]);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const PAGE_SIZE = 10;
  const status = 'active'; 
  const fullCacheKey = `marketplace_full_${status}_${debouncedSearchTerm || ''}_${filters.category || ''}_${filters.minPrice || ''}_${filters.maxPrice || ''}`;

  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(fullCacheKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.value)) {
          setItems(parsed.value);
          setLoadedAll(true);
          setCurrentPage(Math.ceil((parsed.value.length || 0) / PAGE_SIZE) || 1);
          return; 
        }
      }
    } catch (err) {
      try { sessionStorage.removeItem(fullCacheKey); } catch (removeErr) { console.warn('Failed to remove bad cache', removeErr); }
      console.warn('Failed to parse marketplace cache', err);
    }
    setItems([]);
    setCurrentPage(1);
    setLoadedAll(false);
  }, [fullCacheKey]);

  const fetchPage = useCallback(async (pageToFetch = 1) => {
    const params = new URLSearchParams();
    params.set('page', pageToFetch);
    params.set('limit', PAGE_SIZE);
    params.set('status', status); 
    if (debouncedSearchTerm) params.set('q', debouncedSearchTerm);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('min_price', filters.minPrice);
    if (filters.maxPrice) params.set('max_price', filters.maxPrice);
    const res = await api.get(`/listings?${params.toString()}`);
    return res.data || { success: false, page: pageToFetch, total_pages: 1, data: [] };
  }, [debouncedSearchTerm, filters.category, filters.minPrice, filters.maxPrice, status]);

  useEffect(() => {
    let cancelled = false;
    const doInitial = async () => {
      if (loadedAll) return;
      setIsLoadingMore(true);
      try {
        const p = await fetchPage(1);
        if (!cancelled) {
          setItems(p.data || []);
          setTotalPages(p.total_pages || 1);
          setCurrentPage(1);
          if ((p.page || 1) >= (p.total_pages || 1)) {
            setLoadedAll(true);
            try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: p.data || [] })); } catch (setErr) { console.warn('Failed to write marketplace cache', setErr); }
          }
        }
      } catch (e) {
        console.error('Marketplace initial fetch failed', e);
      } finally {
        setIsLoadingMore(false);
      }
    };
    doInitial();
    return () => { cancelled = true; };
  }, [fullCacheKey, loadedAll, fetchPage]);

  const SkeletonGrid = ({ count = PAGE_SIZE }) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-40 bg-gray-200 rounded-md" />
          <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
          <div className="mt-1 h-3 bg-gray-200 rounded w-1/2" />
        </div>
      ))}
    </div>
  );

   const sentinelRef = useRef(null);
   const loadNextPage = useCallback(async () => {
    if (isLoadingMore || loadedAll) return;
    const next = currentPage + 1;
    if (next > totalPages) { setLoadedAll(true); return; }
    setIsLoadingMore(true);
    try {
      const p = await fetchPage(next);
      setItems((prev) => {
        const combined = prev.concat(p.data || []);
        if ((p.page || next) >= (p.total_pages || 1)) {
          setLoadedAll(true);
          try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: combined })); } catch (setErr) { console.warn('Failed to write marketplace cache', setErr); }
        }
        return combined;
      });
      setCurrentPage(next);
      setTotalPages(p.total_pages || totalPages);
    } catch (err) {
      console.error('Marketplace loadNextPage failed', err);
    } finally {
      setIsLoadingMore(false);
    }
   }, [isLoadingMore, loadedAll, currentPage, totalPages, fetchPage, fullCacheKey]);

   useEffect(() => {
    if (loadedAll) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) loadNextPage(); });
    }, { root: null, rootMargin: '400px', threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
   }, [sentinelRef, loadNextPage, loadedAll]);


  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-r from-green-600 to-lime-500 text-white">
         <h1 className="text-3xl font-bold mb-3">Marketplace</h1>
         <p className="text-sm opacity-90">Find refurbished treasures at great prices</p>
      </div>

      {/* Search and Filter Section */}
      <div className="relative w-full px-4 md:px-8 py-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          {/* Search bar */}
          <input type="text" placeholder="Search items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-xl border" />
          {/* Filter Button */}
          <button onClick={() => setShowFilters(!showFilters)} className="ml-4 bg-green-600 text-white px-5 py-2 rounded-xl">
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {/* Create Listing Button */}
          <button onClick={() => navigate(auth?.user ? '/create-listing' : `/login?next=${encodeURIComponent('/create-listing')}`)}
            className="ml-4 bg-white text-green-600 border border-green-600 px-5 py-2 rounded-xl">
            Create Listing
          </button>
        </div>
        {/* Floating Filters */}
        {showFilters && ( 
          <div className="absolute inset-0 top-0 right-0 z-50 flex justify-end bg-black/40" onClick={() => setShowFilters(false)}>
              <div className="mt-20 mr-4 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
                  <FilterSidebar onFilterChange={(f) => { setFilters(f); setShowFilters(false); }} />
              </div>
          </div>
        )}

        {/* Listings Grid */}
        <div className="flex-1 mt-4">
          { isLoadingMore && items.length === 0 ? ( 
            <div className="w-full"><SkeletonGrid /></div>
          ) : items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {items.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <div className="mt-6">
                <div ref={sentinelRef} style={{ height: '10px' }} /> 
                {isLoadingMore && items.length > 0 && ( 
                  <div className="mt-6"><SkeletonGrid count={3} /></div>
                )}
              </div>
            </>
          ) : (
             <div className="text-center p-10">
                 <h3 className="text-xl font-semibold text-gray-700">No items found.</h3>
                 <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;