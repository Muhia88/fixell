import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth"; // FIX: Removed .js extension to resolve module path error
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
      const res = await fetch("/api/auth/profile", { 
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to update profile");
      }

      const json = await res.json();
      
      // Update local state with new user data
      setUser(json.user || json);
      setIsEditing(false); // Exit edit mode

    } catch (err) {
      setUpdateError(err.message || "An unknown error occurred during update.");
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
        const res = await fetch("/api/auth/profile", { 
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.message || "Failed to load profile");
        }

        const json = await res.json();
        // server returns { user: { ... } }
        setUser(json.user || json);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "An error occurred");
          if (err.message && /token|expired|invalid/i.test(err.message)) {
            // token issues: force logout
            logout();
            navigate("/login");
          }
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isEditing ? "Edit Profile" : "My Profile"}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-600 transition duration-150"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h6a1 1 0 110 2H5v14h10V5h-2a1 1 0 110-2h6a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V3zm10 5a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3A1 1 0 0113 15v-2H7a1 1 0 110-2h6V8z" clipRule="evenodd" />
                </svg>
                Sign Out
            </button>
          </div>
        </div>

        {/* Conditional rendering: Edit Form or Profile View */}
        {isEditing ? (
          <EditProfileForm 
            user={user} 
            onSave={handleUpdateProfile} 
            onCancel={() => {
              setIsEditing(false);
              setUpdateError("");
            }} 
            isSubmitting={isSubmitting}
            updateError={updateError}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="flex-shrink-0">
                <div className="h-28 w-28 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-700 border-4 border-white shadow-md">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name || "Unnamed User"}</h2>
                <p className="text-sm text-gray-500 mb-6">{user.role || "Member"}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs uppercase font-medium text-gray-400">Email Address</p>
                    <p className="text-base font-semibold text-gray-800 break-words">{user.email || "—"}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs uppercase font-medium text-gray-400">User ID</p>
                    <p className="text-base font-semibold text-gray-800 break-all">{user.id || user.user_id || "—"}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs uppercase font-medium text-gray-400">Joined On</p>
                    <p className="text-base font-semibold text-gray-800">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs uppercase font-medium text-gray-400">Additional Info</p>
                    <p className="text-base font-semibold text-gray-800">{user.extra || "Not set"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full mt-8 flex justify-end">
              <button
                onClick={() => setIsEditing(true)} // Toggles to show the form
                className="flex items-center px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-150 shadow-lg shadow-indigo-200/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
