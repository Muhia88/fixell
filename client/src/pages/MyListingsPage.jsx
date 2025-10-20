import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../components/context/ui/authContextValue.jsx'
import api from '../api/axiosConfig'
import ListingCard from '../components/marketplace/ListingCard'
import { useNavigate } from 'react-router-dom'
import EditListingModal from '../components/listings/EditListingModal'


export default function MyListingsPage() {
  const auth = useContext(AuthContext)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchMy = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/users/${auth.user.id}/listings`)
        setListings(res.data?.data || [])
      } catch (err) {
        console.error(err)
      } finally { setLoading(false) }
    }

    if (!auth?.user) {
      // redirect unauthenticated users to login
      navigate(`/login?next=${encodeURIComponent('/my-listings')}`)
      return
    }
    fetchMy()
  }, [auth, navigate])

  const refetch = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/users/${auth.user.id}/listings`)
      setListings(res.data?.data || [])
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <div className="flex flex-col items-center justify-center py-10 bg-gradient-to-r from-green-600 to-lime-500 text-white">
        <h1 className="text-3xl font-bold mb-3">My Listings</h1>
        <p className="text-sm opacity-90">Manage the items you've listed</p>
      </div>

  <div className="flex-1 w-full px-4 md:px-8 py-6 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : listings.length === 0 ? (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {listings.map(l => (
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
        )}
      </div>

      {editing && (
        <EditListingModal listing={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); refetch() }} />
      )}
    </div>
  )
}
