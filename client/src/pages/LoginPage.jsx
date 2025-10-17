import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Explicitly adding .js extension for the hook
import { useAuth } from '../hooks/useAuth.js';
// Explicitly adding .jsx extension for the Input component
import Input from '../components/common/input.jsx'; 
// Explicitly adding .jsx extension for the Button component
import Button from '../components/common/Button.jsx'; 

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in (optional but good UX)
    useEffect(() => {
        if (isLoggedIn) {
            navigate('/'); 
        }
    }, [isLoggedIn, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            await login(email, password);
            navigate('/'); 
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Check your credentials.';
            setError(errorMessage);
        }
    };

    return (
        // Full-width layout: card stretches to full viewport width
        <div className="min-h-screen w-full bg-gray-50 p-0">
            {/* Full-width inner container */}
            <div className="w-full h-full bg-white p-6 sm:p-10 border-t border-gray-100">
                <div className="flex flex-col lg:flex-row items-stretch gap-6">
                    {/* Optional left promo panel on large screens */}
                    <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-green-100 to-indigo-100 p-8 rounded-l-lg">
                        <div className="m-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Back</h2>
                            <p className="text-gray-700">Sign in to access your Fixell account and dashboard.</p>
                        </div>
                    </div>

                    {/* Form panel — stretches full width on small screens, 2/3 on large */}
                    <div className="w-full lg:w-2/3 bg-white p-6 sm:p-8 rounded-lg shadow-sm">
                        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
                            Welcome Back
                        </h1>
                        <p className="text-center text-sm text-gray-500 mb-6">
                            Sign in to continue to Fixell.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4 w-full">
                            
                            {/* Error Message Box */}
                            {error && (
                                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm transition-all duration-300">
                                    {error}
                                </div>
                            )}

                            {/* Email Input */}
                            <div>
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>
                            
                            {/* Password Input */}
                            <div>
                                <Input
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Your password"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>

                            {/* Submit Button (Forest Green to match RegisterPage) */}
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full py-2.5 text-lg font-semibold rounded-lg transition-all duration-300 
                                            ${loading 
                                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                                : 'bg-[#228B22] hover:bg-[#1a6e1a] text-white shadow-md hover:shadow-lg'}`
                                        }
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1 transition duration-150">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;