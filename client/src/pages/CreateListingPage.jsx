import React, { useState, useContext, useEffect } from 'react'
import ImageUploader from '../components/listings/ImageUploader.jsx'
import api from '../api/axiosConfig'
import { AuthContext } from '../components/context/ui/authContextValue.jsx'
import { useToast } from '../components/common/useToast'
import { useNavigate } from 'react-router-dom'

const initialState = {
  title: '',
  description: '',
  price: '',
  category: '',
  condition: '',
  location: '',
  user_id: ''
}

export default function CreateListingPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(initialState)
  const [images, setImages] = useState([])
  const auth = useContext(AuthContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const toast = useToast()

  useEffect(() => {
    if (auth?.user) {
      setForm((f) => ({ ...f, user_id: auth.user.id }))
    }
  }, [auth])

  const next = () => setStep((s) => Math.min(3, s + 1))
  const prev = () => setStep((s) => Math.max(1, s - 1))

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage(null)
    if (!form.title || !form.price) {
      setMessage('Please provide a title and price for your listing.')
      setLoading(false)
      return
    }
    if (images.length === 0) {
      setMessage('Please add at least one image.')
      setLoading(false)
      return
    }
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v)
      })
      images.forEach((file) => fd.append('images', file))

      const res = await api.post('/listings', fd)

      if (res.data && res.data.success) {
        const createdListing = res.data.data;
        setMessage('Listing created successfully')
        toast?.success({ title: 'Listing created', message: `Your listing "${form.title}" was created.` })
        setForm(initialState)
        setImages([])
        const uid = auth?.user?.id;
        if (uid) {
          try { sessionStorage.removeItem(`my_listings_full_active_${uid}`); } catch { /* ignore */ }
        }

        try {
          for (const key of Object.keys(sessionStorage)) {
            if (key && key.startsWith('marketplace_full_')) {
              try { sessionStorage.removeItem(key); } catch { /* ignore */ }
            }
          }
        } catch {
          // not critical, continue
        }

        try {
          if (createdListing) {
            for (const key of Object.keys(sessionStorage)) {
              if (key && key.startsWith('marketplace_full_')) {
                try {
                  const raw = sessionStorage.getItem(key);
                  if (!raw) continue;
                  const parsed = JSON.parse(raw);
                  if (parsed && Array.isArray(parsed.value)) {
                    const exists = parsed.value.find((it) => it && it.id === createdListing.id);
                    if (!exists) {
                      parsed.value.unshift(createdListing);
                      try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), value: parsed.value })); } catch { /* ignore */ }
                    }
                  }
                } catch { /* ignore per-cache errors */ }
              }
            }
            try { window.dispatchEvent(new CustomEvent('marketplace:prepend', { detail: createdListing })); } catch { /* ignore */ }
          }
        } catch { /* ignore optimistic update errors */ }
        navigate('/my-listings')
      } else {
        setMessage(res.data.message || 'Unexpected response')
      }
    } catch (err) {
      console.error(err)
      setMessage(err.response?.data?.message || err.message || 'Error creating listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create Your Listing</h2>

      <div className="mb-4">
        <progress value={step} max={3} className="w-full" />
        <div className="flex justify-between text-sm mt-2">
          <span>Details</span>
          <span>Images</span>
          <span>Review</span>
        </div>
      </div>

      {step === 1 && (
        <div>
          <label className="block mb-2">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="w-full p-2 border mb-3" />

          <label className="block mb-2">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="w-full p-2 border mb-3" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Price</label>
              <input name="price" value={form.price} onChange={handleChange} className="w-full p-2 border mb-3" />
            </div>
            <div>
              <label className="block mb-2">Category</label>
              <input name="category" value={form.category} onChange={handleChange} className="w-full p-2 border mb-3" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Condition</label>
              <input name="condition" value={form.condition} onChange={handleChange} className="w-full p-2 border mb-3" />
            </div>
            <div>
              <label className="block mb-2">Location</label>
              <input name="location" value={form.location} onChange={handleChange} className="w-full p-2 border mb-3" />
            </div>
          </div>

          <label className="block mb-2">User ID (for now)</label>
          <input name="user_id" value={form.user_id} onChange={handleChange} className="w-full p-2 border mb-3" />
        </div>
      )}

      {step === 2 && (
        <div>
          <ImageUploader files={images} setFiles={setImages} />
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="font-bold mb-2">Review</h3>
          <p><strong>Title:</strong> {form.title}</p>
          <p><strong>Description:</strong> {form.description}</p>
          <p><strong>Price:</strong> {form.price}</p>
          <p><strong>Category:</strong> {form.category}</p>
          <p><strong>Condition:</strong> {form.condition}</p>
          <p><strong>Location:</strong> {form.location}</p>
          <div className="mt-3">
            <strong>Images:</strong>
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((f, i) => (
                <div key={i} className="w-24 h-24 border p-1 flex items-center justify-center">
                  <img src={URL.createObjectURL(f)} alt={f.name} className="max-w-full max-h-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <div>
          {step > 1 && <button onClick={prev} className="px-4 py-2 mr-2 border">Back</button>}
        </div>
        <div>
          {step < 3 && <button onClick={next} className="px-4 py-2 bg-blue-600 text-white">Next</button>}
          {step === 3 && (
            <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-green-600 text-white">
              {loading ? 'Creating...' : 'Create Listing'}
            </button>
          )}
        </div>
      </div>

      {message && <div className="mt-4 text-center">{message}</div>}
    </div>
  )
}
