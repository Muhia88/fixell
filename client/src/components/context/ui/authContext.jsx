import React, { useState } from 'react';
import authService from './authService';
import { AuthContext } from './authContextValue';

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
    // Initialize state from local storage or null
    const [user, setUser] = useState(authService.getCurrentUser()); 
    const [token, setToken] = useState(localStorage.getItem('authToken')); 
    const [loading, setLoading] = useState(false);

    // Function to handle login
    const handleLogin = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            // Update state with new user and token
            setUser(data.user); 
            setToken(data.token);
            setLoading(false);
            return data;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    // Function to handle logout
    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    // Function to handle registration (no need to store token here, login required after register)
    const handleRegister = async (email, password, name) => {
        setLoading(true);
        try {
            // Call register endpoint with name
            await authService.register(email, password, name);
            // On successful registration, immediately log the user in
            const loginData = await authService.login(email, password);
            // Ensure auto-login succeeded and returned a token
            if (!loginData || !loginData.token) {
                // Treat this as an error so caller UI doesn't redirect blindly
                throw new Error('Registration succeeded but auto-login failed');
            }
            setUser(loginData.user);
            setToken(loginData.token);
            setLoading(false);
            return loginData;
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const value = {
        user,
        token,
        loading,
        isLoggedIn: !!user, // Check if user exists
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

