import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth"; // FIX: Removed .js extension to resolve module path error
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

// Component for the Edit Form
const EditProfileForm = ({ user, onSave, onCancel, isSubmitting, updateError }) => {
  const [name, setName] = useState(user.name || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(name);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-indigo-100/50">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            disabled={isSubmitting}
          />
        </div>

        {updateError && (
          <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-md border border-red-200">
            Error: {updateError}
          </p>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition duration-150"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 disabled:opacity-50 transition duration-150 shadow-md"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};


const ProfilePage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // New state for editing
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState("");


  // Function to handle the profile update (PUT request)
  const handleUpdateProfile = async (newName) => {
    setIsSubmitting(true);
    setUpdateError("");

    try {
      // Use axios client which attaches Authorization header via interceptor
      const res = await api.put('/auth/profile', { name: newName });

      // Update local state with new user data
      setUser(res.data.user || res.data);
      setIsEditing(false); // Exit edit mode

    } catch (err) {
      // Ignore cancellation errors from axios/AbortController
      const isCanceled = err?.code === 'ERR_CANCELED' || err?.message === 'canceled' || err?.name === 'CanceledError';
      if (isCanceled) {
        // do nothing — request was intentionally cancelled
        return;
      }

      const message = err.response?.data?.message || err.message || "An unknown error occurred during update.";
      setUpdateError(message);
      console.error("Profile update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Effect to fetch the profile data on load
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const controller = new AbortController();
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        // Use axios client so baseURL and token interceptor are used
        const res = await api.get('/auth/profile', { signal: controller.signal });
        // server returns { user: { ... } }
        setUser(res.data.user || res.data);
      } catch (err) {
        // axios uses different shapes for cancellation errors — detect them here
        const isCanceled = err?.code === 'ERR_CANCELED' || err?.message === 'canceled' || err?.name === 'CanceledError';
        if (isCanceled) {
          // ignore canceled requests (component unmounted or manual abort)
          return;
        }

        // Prefer server-provided message
        const serverMessage = err.response?.data?.message;
        const message = serverMessage || err.message || "An error occurred";
        setError(message);

        // If the server returned 401 or a token-related message, force logout
        const status = err.response?.status;
        if (status === 401 || (message && /token|expired|invalid|unauthorized/i.test(message))) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, [token, navigate, logout]);

  // --- Conditional Rendering for Loading/Error States ---

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="max-w-lg w-full bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Retry
            </button>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // --- Main Profile View/Edit Form ---
  return (
    <div className="min-h-screen w-full bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="md:flex">
            {/* Left column: avatar and actions */}
            <div className="md:w-1/3 bg-gradient-to-b from-indigo-50 to-white p-8 flex flex-col items-center text-center">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center text-4xl font-extrabold text-indigo-700 border-4 border-white shadow-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="absolute -bottom-2 right-0">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium shadow hover:bg-indigo-700 transition"
                  >
                    Edit
                  </button>
                </div>
              </div>

              <h3 className="mt-6 text-xl font-bold text-gray-900">{user.name || 'Unnamed User'}</h3>
              <p className="mt-1 text-sm text-gray-500">{user.role || 'Member'}</p>

              <div className="mt-6 w-full">
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="w-full block px-4 py-2 text-center bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition"
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Right column: details */}
            <div className="md:w-2/3 p-8">
              {isEditing ? (
                <EditProfileForm 
                  user={user} 
                  onSave={handleUpdateProfile} 
                  onCancel={() => { setIsEditing(false); setUpdateError(''); }} 
                  isSubmitting={isSubmitting}
                  updateError={updateError}
                />
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Profile Information</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs uppercase font-medium text-gray-400">Email</p>
                      <p className="mt-1 text-base font-semibold text-gray-800 break-words">{user.email || '—'}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs uppercase font-medium text-gray-400">User ID</p>
                      <p className="mt-1 text-base font-semibold text-gray-800 break-all">{user.id || user.user_id || '—'}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs uppercase font-medium text-gray-400">Joined</p>
                      <p className="mt-1 text-base font-semibold text-gray-800">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs uppercase font-medium text-gray-400">Extra</p>
                      <p className="mt-1 text-base font-semibold text-gray-800">{user.extra || 'Not set'}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3 justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
