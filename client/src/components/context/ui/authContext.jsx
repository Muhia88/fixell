import React, { createContext, useState, useEffect } from 'react';
import authService from './authService';

// 1. Create the Context
export const AuthContext = createContext();

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
    const handleRegister = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.register(email, password);
            setLoading(false);
            return data;
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

