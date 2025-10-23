import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/common/input';
import Button from '../components/common/Button';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState(''); 
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const { register, loading } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        if (!name || name.trim().length < 2) {
            setError('Please enter a valid name (at least 2 characters).');
            return false;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setError('Please enter a valid email address.');
            return false;
        }
        if (!phoneNumber || !/^\+?[0-9\s-]{7,}$/.test(phoneNumber)) {
            setError('Please enter a valid phone number (e.g., +2547...).');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setError('');
        setSuccessMessage('');

        try {
            await register(email, password, name, phoneNumber);
            setSuccessMessage('Registration successful! Redirecting to home...');
            setTimeout(() => navigate('/'), 800);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 p-0">
            <div className="w-full h-full bg-white p-6 sm:p-10 border-t border-gray-100">
                <div className="flex flex-col lg:flex-row items-stretch gap-6">
                    {/* Left Panel */}
                    <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-green-100 to-indigo-100 p-8 rounded-lg">
                         <div className="m-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Fixell</h2>
                            <p className="text-gray-700">
                                Create account to start repairing, listing and connecting with the community.
                            </p>
                        </div>
                    </div>

                    {/* Form Panel */}
                    <div className="w-full lg:w-2/3 bg-white p-6 sm:p-8 rounded-lg shadow-sm">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                            Create Your Fixell Account
                        </h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Start repairing, listing, and connecting with the community.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error/Success Messages */}
                            {error && ( /* ... */ <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">{error}</div> )}
                            {successMessage && ( /* ... */ <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">{successMessage}</div> )}

                            {/* Email Input */}
                            <div>
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    placeholder="e.g., user@example.com" required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>

                            {/* Name Input */}
                            <div>
                                <Input
                                    label="Full Name"
                                    type="text"
                                    value={name} onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Jane Doe" required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>

                            {/*Phone Input*/}
                            <div>
                                <Input
                                    label="Phone Number"
                                    type="tel" 
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="e.g., +254712345678"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <Input
                                    label="Password" type="password"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Minimum 6 characters" required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>

                            {/* Confirm Password Input */}
                            <div>
                                <Input
                                    label="Confirm Password" type="password"
                                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter password" required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button type="submit" disabled={loading || !!successMessage}
                                className={`w-full py-2.5 text-lg font-semibold rounded-lg transition-all duration-300 ${loading || !!successMessage ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#228B22] hover:bg-[#1a6e1a] text-white'}`}
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </Button>
                        </form>

                        <p className="mt-6 text-sm text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;