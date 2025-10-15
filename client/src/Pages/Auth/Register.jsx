import React, { useState } from 'react';
import { useAuth } from '../../components/context/ui/authContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Lock, ArrowLeft } from 'lucide-react';


const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMessage, setServerMessage] = useState({ type: '', text: '' });

  // Access the register function
  const { register } = useAuth(); 
  const navigate = useNavigate();

  // --- Validation Logic ---
  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required.';
    
    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid.';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
    if (serverMessage.text) setServerMessage({ type: '', text: '' });
  };

  // --- Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setServerMessage({ type: '', text: '' });

    try {
      // Call the register function from AuthContext
      const res = await register(formData);
      
      setServerMessage({ 
        type: 'success', 
        text: res.message || 'Registration successful! Redirecting to login...' 
      });
      
      // Redirect to login page after successful registration
      setTimeout(() => navigate('/login'), 2000); 
      
    } catch (error) {
      // Display the error message thrown by the AuthContext/authService
      const errorMessage = error.message || 'An unexpected error occurred during registration.';
      setServerMessage({ 
        type: 'error', 
        text: errorMessage 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Shared Input Component ---
  const InputField = ({ label, name, type = 'text', icon: Icon, error }) => (
    <div className="mb-5">
      <label className="sr-only" htmlFor={name}>{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          placeholder={label}
          value={formData[name]}
          onChange={handleChange}
          className={`w-full px-4 py-3 pl-10 border rounded-xl shadow-sm bg-gray-50 text-gray-900 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out ${
            error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:border-indigo-500'
          }`}
          required
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-lg bg-white p-6 sm:p-10 shadow-2xl rounded-2xl">
        
        <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center mb-6 transition duration-150">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-2">
          Create Fixell Account
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Start sharing and finding repair guides today.
        </p>

        {/* Server Message Display */}
        {serverMessage.text && (
          <div className={`p-4 mb-6 rounded-xl text-sm font-medium border ${
            serverMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-300'
              : 'bg-red-50 text-red-700 border-red-300'
          }`}>
            {serverMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <InputField 
            label="Username" 
            name="username" 
            icon={User}
            error={errors.username} 
          />
          <InputField 
            label="Email Address" 
            name="email" 
            type="email" 
            icon={Mail}
            error={errors.email} 
          />
          <InputField 
            label="Password" 
            name="password" 
            type="password" 
            icon={Lock}
            error={errors.password} 
          />

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white transition duration-300 ease-in-out transform hover:scale-[1.01]
                ${isSubmitting 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-indigo-500/50'
                }`}
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Register'}
            </button>
          </div>
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-800 transition duration-150">
            Sign in here
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
