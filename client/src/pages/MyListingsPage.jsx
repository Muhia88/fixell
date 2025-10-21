import React, { useContext, useEffect, useState, useRef } from 'react'
import { AuthContext } from '../components/context/ui/authContextValue.jsx'
import api from '../api/axiosConfig'
import ListingCard from '../components/marketplace/ListingCard'
import { useNavigate } from 'react-router-dom'
import EditListingModal from '../components/listings/EditListingModal'
export default function MyListingsPage() {
  const auth = useContext(AuthContext)
  const [editing, setEditing] = useState(null)

  const navigate = useNavigate()

  // infinite scroll for user's listings
  const userId = auth?.user?.id
  const PAGE_SIZE = 10
  const fullCacheKey = userId ? `my_listings_full_${userId}` : null

  const [items, setItems] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)
  const sentinelRef = useRef(null)

  // redirect to login if not authenticated
  useEffect(() => {
    if (!auth?.isLoggedIn) {
      // preserve return location
      navigate(`/login?next=${encodeURIComponent('/my-listings')}`)
    }
  }, [auth, navigate])

  // initial load or load from cache
  useEffect(() => {
    if (!userId) return
    try {
      const raw = sessionStorage.getItem(fullCacheKey)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.value) {
          setItems(parsed.value)
          setLoadedAll(true)
          return
        }
      }
    } catch {
      // ignore
    }
    // otherwise fetch first page
    let cancelled = false
    const doInitial = async () => {
      setIsLoadingMore(true)
      try {
        const res = await api.get(`/users/${userId}/listings?page=1&limit=${PAGE_SIZE}`)
        const p = res.data || { data: [], page: 1, total_pages: 1 }
        if (!cancelled) {
          setItems(p.data || [])
          setTotalPages(p.total_pages || 1)
          setCurrentPage(1)
          if ((p.page || 1) >= (p.total_pages || 1)) {
            setLoadedAll(true)
            try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: p.data || [] })) } catch { /* ignore */ }
          }
        }
      } catch (err) {
        console.error('MyListings initial fetch failed', err)
      } finally {
        setIsLoadingMore(false)
      }
    }
    doInitial()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadNextPage = async () => {
    if (isLoadingMore || loadedAll || !userId) return
    const next = currentPage + 1
    if (next > totalPages) { setLoadedAll(true); return }
    setIsLoadingMore(true)
    try {
      const res = await api.get(`/users/${userId}/listings?page=${next}&limit=${PAGE_SIZE}`)
      const p = res.data || { data: [], page: next, total_pages: 1 }
      setItems((prev) => {
        const combined = prev.concat(p.data || [])
        if ((p.page || next) >= (p.total_pages || 1)) {
          setLoadedAll(true)
          try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: combined })) } catch { /* ignore */ }
        }
        return combined
      })
      setCurrentPage(next)
      setTotalPages(p.total_pages || totalPages)
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false)
    }
  }

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || loadedAll) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) loadNextPage() })
    }, { root: null, rootMargin: '400px', threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, currentPage, totalPages, loadedAll])

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

  const refetch = async () => {
    // clear cache and reload first page
  try { if (fullCacheKey) sessionStorage.removeItem(fullCacheKey) } catch { /* ignore */ }
    setItems([])
    setLoadedAll(false)
    setCurrentPage(1)
    try {
      const res = await api.get(`/users/${userId}/listings?page=1&limit=${PAGE_SIZE}`)
      const p = res.data || { data: [], page: 1, total_pages: 1 }
      setItems(p.data || [])
      setTotalPages(p.total_pages || 1)
      if ((p.page || 1) >= (p.total_pages || 1)) {
        setLoadedAll(true)
        try { sessionStorage.setItem(fullCacheKey, JSON.stringify({ ts: Date.now(), value: p.data || [] })) } catch { /* ignore */ }
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-r from-green-600 to-lime-500 text-white">
        <h1 className="text-3xl font-bold mb-3">My Listings</h1>
        <p className="text-sm opacity-90">Manage the items you've listed</p>
      </div>

  <div className="flex-1 w-full px-4 md:px-8 py-6 flex flex-col">
        {(isLoadingMore && items.length === 0) ? (
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <div className="w-full"><SkeletonGrid /></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">You have no listings yet.</h3>
              <p className="text-sm text-gray-500 mb-4">Create a listing to start selling your items.</p>
              <div className="flex justify-center">
                <button onClick={() => navigate('/create-listing')} className="px-4 py-2 bg-green-600 text-white rounded-md">Create Listing</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {items.map(l => (
                <div key={l.id} className="relative">
                  <ListingCard listing={l} />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button onClick={() => setEditing(l)} className="bg-white/90 px-2 py-1 rounded text-sm">Edit</button>
                    <button onClick={async () => {
                      if (!confirm('Delete this listing?')) return
                      try {
                        await api.delete(`/listings/${l.id}`)
                        // refresh list
                        refetch()
                      } catch (err) { console.error(err); alert('Delete failed') }
                    }} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Delete</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <div ref={sentinelRef} />
              {isLoadingMore && (
                <div className="mt-6"><SkeletonGrid /></div>
              )}
            </div>
          </>
        )}
      </div>

      {editing && (
        <EditListingModal listing={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refetch() }} />
      )}
    </div>
  )
}
