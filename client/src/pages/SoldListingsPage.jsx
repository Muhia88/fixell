import React, { useContext, useEffect, useState, useRef } from 'react';
import { AuthContext } from '../components/context/ui/authContextValue.jsx';
import api from '../api/axiosConfig';
import ListingCard from '../components/marketplace/ListingCard';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';

const SkeletonGrid = ({ count = 10 }) => (
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


const SoldListingsPage = () => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();
    const userId = auth?.user?.id;

    const PAGE_SIZE = 10;
    const status = 'sold';
    const fullCacheKey = userId ? `my_listings_full_${status}_${userId}` : null;

    const [items, setItems] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadedAll, setLoadedAll] = useState(false);
    const sentinelRef = useRef(null);

    useEffect(() => { if (!auth?.loading && !userId) { navigate(`/login?next=${encodeURIComponent('/my-listings/sold')}`) } }, [auth, userId, navigate]);

    const fetchSoldListings = React.useCallback(async (page = 1) => {
        if (!userId) return { data: [], page: 1, total_pages: 1 };
        const res = await api.get(`/users/${userId}/listings?page=${page}&limit=${PAGE_SIZE}&status=sold`);
        return res.data || { data: [], page: 1, total_pages: 1 };
    }, [userId]);

    useEffect(() => {
      if (!userId) return;
      try {
          const raw = sessionStorage.getItem(fullCacheKey);
          if (raw) {
               const parsed = JSON.parse(raw);
               if (parsed && parsed.value) { setItems(parsed.value); setLoadedAll(true); return; }
          }
      } catch (err) {
          try { sessionStorage.removeItem(fullCacheKey); } catch (remErr) { console.warn('Failed to remove bad sold-listings cache', remErr); }
          console.warn('Failed to parse sold-listings cache', err);
      }

      let cancelled = false;
      const doInitial = async () => {
            setIsLoadingMore(true);
            try {
                const p = await fetchSoldListings(1);
                if (!cancelled) {
                    setItems(p.data || []);
                    setTotalPages(p.total_pages || 1);
                    setCurrentPage(1);
                    if ((p.page || 1) >= (p.total_pages || 1)) {
                        setLoadedAll(true);
                        try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: p.data || [] })); } catch (setErr) { console.warn('Failed to write sold-listings cache', setErr); }
                    }
                }
            } catch (err) {
                console.error('SoldListings initial fetch failed', err);
            } finally {
                setIsLoadingMore(false);
            }
      };
      doInitial(); return () => { cancelled = true };
    }, [userId, fullCacheKey, fetchSoldListings]);

    const loadNextPage = React.useCallback(async () => {
        if (isLoadingMore || loadedAll || !userId) return;
        const next = currentPage + 1;
        if (next > totalPages) { setLoadedAll(true); return; }
        setIsLoadingMore(true);
        try {
            const p = await fetchSoldListings(next);
            setItems((prev) => {
                const combined = prev.concat(p.data || []);
                if ((p.page || next) >= (p.total_pages || 1)) {
                    setLoadedAll(true);
                    try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: combined })); } catch (setErr) { console.warn('Failed to write sold-listings cache', setErr); }
                }
                return combined;
            });
            setCurrentPage(next);
            setTotalPages(p.total_pages || totalPages);
        } catch (err) {
            console.error('SoldListings loadNextPage failed', err);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, loadedAll, userId, currentPage, totalPages, fetchSoldListings, fullCacheKey]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el || loadedAll) return;
        const obs = new IntersectionObserver((entries) => { entries.forEach(en => { if (en.isIntersecting) loadNextPage() }) }, { root: null, rootMargin: '400px', threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [sentinelRef, loadNextPage, loadedAll]);


    return (
        <div className="min-h-screen w-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-r from-gray-500 to-gray-700 text-white">
                <h1 className="text-3xl font-bold mb-3">My Sold Items</h1>
                <p className="text-sm opacity-90">Items you have successfully sold</p>
                {/* Link back to Active Listings */}
                <Link to="/my-listings" className="mt-4 text-white underline hover:text-gray-200 text-sm">
                    View Active Listings
                </Link>
            </div>

            <div className="flex-1 w-full px-4 md:px-8 py-6 flex flex-col">
                {(isLoadingMore && items.length === 0) ? (
                    <div className="w-full"><SkeletonGrid /></div>
                ) : items.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-8 bg-white rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">You haven't sold any items yet.</h3>
                            <p className="text-sm text-gray-500 mb-4">Mark items as sold from your active listings page.</p>
                            <Link to="/my-listings">
                                <Button variant="secondary">View Active Listings</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {items.map(l => (
                                <ListingCard key={l.id} listing={l} />
                            ))}
                        </div>

                        <div className="mt-6">
                            <div ref={sentinelRef} style={{ height: '10px' }}/>
                            {isLoadingMore && items.length > 0 && (
                                <div className="mt-6"><SkeletonGrid count={3} /></div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SoldListingsPage;