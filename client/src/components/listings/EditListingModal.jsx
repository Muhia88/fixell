import React, { useState } from 'react'
import api from '../../api/axiosConfig'
import ImageUploader from './ImageUploader'
import { buildUrl } from '../../api/axiosConfig'

export default function EditListingModal({ listing, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: listing.title || '',
    description: listing.description || '',
    price: listing.price || '',
    category: listing.category || '',
    condition: listing.condition || '',
    location: listing.location || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [existingImages] = useState(listing.images || [])
  const [toRemove, setToRemove] = useState([])
  const [newFiles, setNewFiles] = useState([])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const save = async () => {
    setLoading(true); setError(null)
    try {
      // if there are new files or images to remove, send multipart/form-data
      let res
      if (newFiles.length > 0 || toRemove.length > 0) {
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, v) })
        // append new files
        newFiles.forEach(f => fd.append('images', f))
        // include remove list as JSON string
        fd.append('remove_images', JSON.stringify(toRemove))
        res = await api.put(`/listings/${listing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        res = await api.put(`/listings/${listing.id}`, form)
      }
      if (res.data?.success) {
        onSaved(res.data.data)
      } else {
        setError(res.data?.message || 'Unexpected')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-lg w-full">
        <h3 className="text-lg font-bold mb-3">Edit Listing</h3>
        {error && <div className="p-2 bg-red-100 text-red-700 mb-2">{error}</div>}
        <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 border mb-2" />
        <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border mb-2" />
        <div className="grid grid-cols-2 gap-2">
          <input name="price" value={form.price} onChange={handleChange} className="p-2 border mb-2" />
          <input name="category" value={form.category} onChange={handleChange} className="p-2 border mb-2" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input name="condition" value={form.condition} onChange={handleChange} className="p-2 border mb-2" />
          <input name="location" value={form.location} onChange={handleChange} className="p-2 border mb-2" />
        </div>

        <div className="mt-3">
          <h4 className="font-semibold mb-2">Existing Images</h4>
          <div className="flex gap-2 flex-wrap mb-2">
            {existingImages.map((img, i) => (
              <div key={i} className="relative w-28 h-28 border p-1">
                <img src={buildUrl(img)} alt="existing" className="max-w-full max-h-full" />
                <label className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 rounded cursor-pointer">
                  <input type="checkbox" className="hidden" checked={toRemove.includes(img)} onChange={() => {
                    setToRemove(prev => prev.includes(img) ? prev.filter(x => x !== img) : [...prev, img])
                  }} />
                  {toRemove.includes(img) ? 'Remove' : 'Remove'}
                </label>
              </div>
            ))}
          </div>

          <h4 className="font-semibold mb-2">Add Images</h4>
          <ImageUploader files={newFiles} setFiles={setNewFiles} />
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={onClose} className="px-3 py-2 border">Cancel</button>
          <button onClick={save} className="px-3 py-2 bg-green-600 text-white" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
