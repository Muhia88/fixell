import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { User } from 'lucide-react';
import ProfileIcon from '../components/common/ProfileIcon';
import Spinner from '../components/common/Spinner';

const EditProfileForm = ({ user, onSave, onCancel, isSubmitting, updateError }) => {
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone_number || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ name, phone_number: phone });
  };

    return (
    <div className="bg-white p-6 rounded-lg shadow-xl border border-green-100/50">
      <h2 className="text-2xl font-bold text-green-700 mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+254700000000"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isSubmitting}
          />
        </div>

        {updateError && ( <p className="text-sm text-red-600 mb-4 p-3 bg-red-50 rounded-md">{updateError}</p> )}

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="px-6 py-2 border rounded-md hover:bg-gray-100">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};


const ProfilePage = () => {
  const { user, loading, logout, updateLocalUser } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateError, setUpdateError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
        navigate("/login");
    }
  }, [loading, user, navigate]);


  const handleUpdateProfile = async (updatedData) => { 
    setIsSubmitting(true);
    setUpdateError("");
    try {
      const res = await api.put('/auth/profile', updatedData); 
      const updatedUser = res.data.user || res.data;
      updateLocalUser(updatedUser); 
      setIsEditing(false);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Update failed.";
      setUpdateError(message);
      console.error("Profile update error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size={56} />
      </div>
    );
  }

  if (!user) {
      return null; 
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6 font-sans">
      <div className="max-w-5xl mx-auto">
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="text-lg font-medium text-gray-700">Hi, {user?.name?.split(' ')[0] || 'there'}</div>
              <button onClick={() => navigate('/profile')} aria-label="Open profile" className="inline-flex items-center justify-center p-2 rounded-full bg-green-50 hover:bg-green-100">
                <User className="text-green-700" />
              </button>
            </div>
          <div className="md:flex">
            <div className="md:w-1/3 bg-gradient-to-b from-indigo-50 to-white p-8 flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32">
                  <ProfileIcon initials={user.name ? user.name.charAt(0).toUpperCase() : ''} size={128} />
                </div>
                <div className="absolute -bottom-2 right-0">
                    <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium shadow hover:bg-green-700 transition">Edit</button>
                </div>
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">{user.name || 'Unnamed User'}</h3>
              <p className="mt-1 text-sm text-gray-500">{user.email}</p> {/* Show email */}
              <p className="mt-1 text-sm text-gray-500">{user.phone_number || 'No phone number'}</p>
              <div className="mt-6 w-full">
                  <button onClick={() => { logout(); navigate('/login'); }} className="w-full block px-4 py-2 text-center bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition">Sign Out</button>
              </div>
            </div>
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
                      <p className="text-xs uppercase text-gray-400">Full Name</p>
                      <p className="mt-1 font-semibold text-gray-800">{user.name || '—'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs uppercase text-gray-400">Email</p>
                      <p className="mt-1 font-semibold text-gray-800 break-words">{user.email || '—'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs uppercase text-gray-400">Phone</p>
                      <p className="mt-1 font-semibold text-gray-800">{user.phone_number || '—'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs uppercase text-gray-400">Joined</p>
                      <p className="mt-1 font-semibold text-gray-800">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p>
                    </div>
                  </div>
                   <div className="mt-6 flex gap-3 justify-end">
                       <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">Edit Profile</button>
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