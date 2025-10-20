import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import ListingCard from "../components/marketplace/ListingCard";
import FilterSidebar from "../components/marketplace/FilterSidebar";
import { AuthContext } from "../components/context/ui/authContextValue.jsx";
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
// session cache used directly via sessionStorage for full-list caching

const Marketplace = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const auth = useContext(AuthContext)
  const navigate = useNavigate()
  // infinite scroll: initial 10 then load more as user scrolls
  const PAGE_SIZE = 10
  const fullCacheKey = `marketplace_full_${searchTerm || ''}_${filters.category || ''}_${filters.minPrice || ''}_${filters.maxPrice || ''}`

  const [items, setItems] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  // try load entire result from sessionStorage cache first
  useEffect(() => {
    // attempt to load cached full results for this filter/search combination
    try {
      const raw = sessionStorage.getItem(fullCacheKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && Array.isArray(parsed.value)) {
          setItems(parsed.value)
          setLoadedAll(true)
          setCurrentPage(Math.ceil((parsed.value.length || 0) / PAGE_SIZE) || 1)
          return
        }
      }
    } catch {
      // parse error - clear the bad cache entry
      try { sessionStorage.removeItem(fullCacheKey) } catch (err) { console.warn('failed to remove bad cache', err) }
    }

    // otherwise reset to initial state and trigger fetch
    setItems([])
    setCurrentPage(1)
    setLoadedAll(false)
  }, [fullCacheKey])

  const fetchPage = useCallback(async (pageToFetch = 1) => {
    const params = new URLSearchParams()
    params.set('page', pageToFetch)
    params.set('limit', PAGE_SIZE)
    if (searchTerm) params.set('q', searchTerm)
    if (filters.category) params.set('category', filters.category)
    if (filters.minPrice) params.set('min_price', filters.minPrice)
    if (filters.maxPrice) params.set('max_price', filters.maxPrice)
    const res = await api.get(`/listings?${params.toString()}`)
    return res.data || { success: false, page: pageToFetch, total_pages: 1, data: [] }
  }, [searchTerm, filters.category, filters.minPrice, filters.maxPrice])

  // initial load (first page) if not cached
  useEffect(() => {
    let cancelled = false
    const doInitial = async () => {
      if (loadedAll) return
      setIsLoadingMore(true)
      try {
        const p = await fetchPage(1)
        if (!cancelled) {
          setItems(p.data || [])
          setTotalPages(p.total_pages || 1)
          setCurrentPage(1)
          if ((p.page || 1) >= (p.total_pages || 1)) {
            setLoadedAll(true)
            try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: p.data || [] })) } catch (err) { console.warn('cache set failed', err) }
          }
        }
      } catch (e) {
        console.error('Marketplace initial fetch failed', e)
      } finally {
        // Always clear loading flag for UX stability (safe if component is still mounted)
        setIsLoadingMore(false)
      }
    }
    doInitial()
    return () => { cancelled = true }
  }, [fullCacheKey, loadedAll, fetchPage])

  // display state so we can clear immediately on scroll/load
  // Server handles filtering/search; displayListings mirrors items (no duplicate state required)
  const filteredPaged = items

  // Simple skeleton grid shown while page is loading
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
  )

  // no-op: items is the single source of truth

  // load next page when sentinel intersects
  const sentinelRef = useRef(null)

  const loadNextPage = async () => {
    if (isLoadingMore || loadedAll) return
    const next = currentPage + 1
    if (next > totalPages) {
      setLoadedAll(true)
      return
    }
    setIsLoadingMore(true)
    try {
      const p = await fetchPage(next)
      setItems((prev) => {
        const combined = prev.concat(p.data || [])
        if ((p.page || next) >= (p.total_pages || 1)) {
          setLoadedAll(true)
          try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: combined })) } catch (err) { console.warn('cache set failed', err) }
        }
        return combined
      })
      setCurrentPage(next)
      setTotalPages(p.total_pages || totalPages)
    } catch {
      console.error('Marketplace loadNextPage failed')
    } finally {
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    if (loadedAll) return
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) loadNextPage()
      })
    }, { root: null, rootMargin: '400px', threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, currentPage, totalPages, loadedAll])

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">

      {/* Page Header */}
      <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-r from-green-600 to-lime-500 text-white">
        <h1 className="text-3xl font-bold mb-3">Marketplace</h1>
        <p className="text-sm opacity-90">Find refurbished treasures at great prices</p>
      </div>

      {/* Search and Filter Section */}
  <div className="relative w-full px-4 md:px-8 py-6 flex-1 flex flex-col">
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

          {/* Create Listing Button */}
          <button
            onClick={() => {
              if (auth?.user) {
                navigate('/create-listing')
              } else {
                // send them to login with redirect back to create page
                navigate(`/login?next=${encodeURIComponent('/create-listing')}`)
              }
            }}
            className="ml-4 bg-white text-green-600 border border-green-600 px-5 py-2 rounded-xl text-sm hover:bg-green-50"
          >
            Create Listing
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

        {/* Listings Grid (fills remaining vertical space) */}
        <div className="flex-1 mt-4">
          { isLoadingMore ? (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
              <div className="w-full">
                <SkeletonGrid />
              </div>
            </div>
          ) : filteredPaged.length > 0 ? (
            <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {filteredPaged.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <div className="mt-6">
              <div ref={sentinelRef} />
              {isLoadingMore && (
                <div className="mt-6"><SkeletonGrid /></div>
              )}
            </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center px-6 py-10">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No items match your search or filters.</h3>
                <p className="text-sm text-gray-500">Try clearing filters or create a new listing to get started.</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Marketplace;
