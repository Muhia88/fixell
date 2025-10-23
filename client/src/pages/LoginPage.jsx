import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Input from '../components/common/input.jsx'; 
import Button from '../components/common/Button.jsx'; 

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, loading, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const next = params.get('next') || '/';

    useEffect(() => {
        if (isLoggedIn) {
            navigate(next);
        }
    }, [isLoggedIn, navigate, next]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }

        try {
            await login(email, password);
            navigate(next);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed. Check your credentials.';
            setError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row">
            <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-green-100 to-indigo-100 p-8 items-center justify-center">
                <div className="text-center"> 
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Back</h2>
                    <p className="text-gray-700">Sign in to access your Fixell account and dashboard.</p>
                </div>
            </div>

            <div className="w-full lg:w-2/3 bg-white p-6 sm:p-12 flex flex-col justify-center overflow-y-auto">
                
                <div className="w-full max-w-md mx-auto">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                        Welcome Back
                    </h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Sign in to continue to Fixell.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4 w-full">
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150"
                            />
                        </div>

                        {/* Submit Button*/}
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

                    <p className="mt-6 text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 ml-1 transition duration-150">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;