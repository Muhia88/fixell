import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../components/context/ui/authContextValue.jsx';
import api from '../api/axiosConfig';
import ListingCard from '../components/marketplace/ListingCard'; 
import { useNavigate, Link } from 'react-router-dom'; 
import EditListingModal from '../components/listings/EditListingModal';
import MarkAsSoldModal from '../components/listings/MarkAsSoldModal'; 
import Button from '../components/common/Button'; 

export default function MyListingsPage() {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const userId = auth?.user?.id;

  const [editing, setEditing] = useState(null);
  const [selling, setSelling] = useState(null); 

  const PAGE_SIZE = 10;
  const status = 'active'; 
  const fullCacheKey = userId ? `my_listings_full_${status}_${userId}` : null;

  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedAll, setLoadedAll] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => { if (!auth?.loading && !userId) { navigate(`/login?next=${encodeURIComponent('/my-listings')}`) } }, [auth, userId, navigate]);

  const fetchMyListings = React.useCallback(async (page = 1) => {
    if (!userId) return { data: [], page: 1, total_pages: 1 };
    const res = await api.get(`/users/${userId}/listings?page=${page}&limit=${PAGE_SIZE}&status=${status}`);
    return res.data || { data: [], page: 1, total_pages: 1 };
  }, [userId, status]);

  useEffect(() => {
  if (!userId) return;
  try {
    const raw = sessionStorage.getItem(fullCacheKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.value) {
        setItems(parsed.value);
        setLoadedAll(true);
        return;
      }
    }
  } catch (err) {
    try { sessionStorage.removeItem(fullCacheKey); } catch (remErr) { console.warn('Failed to remove bad my-listings cache', remErr); }
    console.warn('Failed to parse my-listings cache', err);
  }

  let cancelled = false;
  const doInitial = async () => {
    setIsLoadingMore(true);
    try {
      const p = await fetchMyListings(1);
      if (!cancelled) {
        setItems(p.data || []);
        setTotalPages(p.total_pages || 1);
        setCurrentPage(1);
        if ((p.page || 1) >= (p.total_pages || 1)) {
          setLoadedAll(true);
          try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: p.data || [] })); } catch (setErr) { console.warn('Failed to write my-listings cache', setErr); }
        }
      }
    } catch (err) {
      console.error('MyListings initial fetch failed', err);
    } finally {
      setIsLoadingMore(false);
    }
  };
  doInitial();
  return () => { cancelled = true };
  }, [userId, fullCacheKey, fetchMyListings]); 

  const loadNextPage = React.useCallback(async () => {
    if (isLoadingMore || loadedAll || !userId) return;
    const next = currentPage + 1;
    if (next > totalPages) { setLoadedAll(true); return; }
    setIsLoadingMore(true);
    try {
      const p = await fetchMyListings(next);
      setItems((prev) => {
        const combined = prev.concat(p.data || []);
        if ((p.page || next) >= (p.total_pages || 1)) {
          setLoadedAll(true);
          try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: combined })); } catch (setErr) { console.warn('Failed to write my-listings cache', setErr); }
        }
        return combined;
      });
      setCurrentPage(next);
      setTotalPages(p.total_pages || totalPages);
    } catch (err) {
      console.error('MyListings loadNextPage failed', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, loadedAll, userId, currentPage, totalPages, fetchMyListings, fullCacheKey]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || loadedAll) return;
    const obs = new IntersectionObserver((entries) => { entries.forEach(en => { if (en.isIntersecting) loadNextPage(); }) }, { root: null, rootMargin: '400px', threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [sentinelRef, loadNextPage, loadedAll]);

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

  const refetch = async () => {
    try { if (fullCacheKey) sessionStorage.removeItem(fullCacheKey) } catch (remErr) { console.warn('Failed to remove my-listings cache', remErr); }
    setItems([]); setLoadedAll(false); setCurrentPage(1); setIsLoadingMore(true); 
    try {
      const p = await fetchMyListings(1); 
      setItems(p.data || []); setTotalPages(p.total_pages || 1);
      if ((p.page || 1) >= (p.total_pages || 1)) {
        setLoadedAll(true); try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: p.data || [] })) } catch (setErr) { console.warn('Failed to write my-listings cache', setErr); }
      }
    } catch { /* ignore */ }
    finally { setIsLoadingMore(false) }
  };

  const handleMarkAsSold = async (listingId, soldPrice) => {
      try {
          await api.post(`/listings/${listingId}/sell`, { sold_price_kes: soldPrice });
          setSelling(null); 
          refetch();

      } catch (err) {
          console.error("Failed to mark as sold:", err);
          alert(`Failed to mark as sold: ${err.response?.data?.message || err.message}`);
      }
  };


  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-r from-green-600 to-lime-500 text-white">
        <h1 className="text-3xl font-bold mb-3">My Active Listings</h1>
        <p className="text-sm opacity-90">Manage the items you're currently selling</p>
         {/* Link to Sold Items Page*/}
         <Link to="/my-listings/sold" className="mt-4 text-white underline hover:text-gray-200 text-sm">
             View Sold Items
         </Link>
      </div>

      <div className="flex-1 w-full px-4 md:px-8 py-6 flex flex-col">
        {(isLoadingMore && items.length === 0) ? (
          <div className="w-full"><SkeletonGrid /></div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">You have no active listings.</h3>
              <p className="text-sm text-gray-500 mb-4">Create a listing or check your sold items.</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/create-listing')} variant="primary">Create Listing</Button>
                <Link to="/my-listings/sold">
                     <Button variant="secondary">View Sold Items</Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {items.map(l => (
                <div key={l.id} className="relative group"> 
                  <ListingCard listing={l} />
                  {/* Actions visible on hover */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button onClick={() => setEditing(l)} className="bg-white/90 px-3 py-1 rounded text-xs shadow hover:bg-white">Edit</button>
                    <button onClick={() => setSelling(l)} className="bg-green-600 text-white px-3 py-1 rounded text-xs shadow hover:bg-green-700">Mark Sold</button>
                    <button onClick={async () => {
                      if (!confirm('Delete this listing? This cannot be undone.')) return;
                      try {
                        await api.delete(`/listings/${l.id}`); refetch();
                      } catch (err) { console.error(err); alert('Delete failed') }
                    }} className="bg-red-500 text-white px-3 py-1 rounded text-xs shadow hover:bg-red-600">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            {/*Infinite Scroll*/}
            <div className="mt-6">
              <div ref={sentinelRef} style={{ height: '10px' }}/>
              {isLoadingMore && items.length > 0 && (
                <div className="mt-6"><SkeletonGrid count={3} /></div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditListingModal listing={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refetch() }} />
      )}

      {/*Mark as Sold Modal*/}
      {selling && (
          <MarkAsSoldModal
              listing={selling}
              onClose={() => setSelling(null)}
              onMarkAsSold={handleMarkAsSold} 
          />
      )}
    </div>
  );
}