import React, { useState, useEffect } from 'react'; 
import authService from './authService';
import { AuthContext } from './authContextValue';
import api from '../../../api/axiosConfig'; 

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(authService.getCurrentUser());
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchFullProfile = async () => {
            if (token && user) {
                try {
                    const response = await api.get('/auth/profile');
                    const fullUser = response.data.user;
                    setUser(fullUser); 
                } catch (error) {
                    console.error("Failed to fetch full profile on load:", error);
                    if (error.response?.status === 401) {
                        handleLogout();
                    }
                } finally {
                     setLoading(false); 
                }
            } else {
                 setLoading(false); 
            }
        };
        fetchFullProfile();
    }, [token, user]); 


    const handleLogin = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            setToken(data.token);
            const profileRes = await api.get('/auth/profile');
            setUser(profileRes.data.user); 
            setLoading(false);
            return data; 
        } catch (error) {
            setLoading(false);
            throw error;
        }
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
        setLoading(false); 
    };

    const handleRegister = async (email, password, name, phone_number) => {
        setLoading(true);
        try {
            await authService.register(email, password, name, phone_number);
            const loginData = await authService.login(email, password);
            if (!loginData || !loginData.token) {
                throw new Error('Registration succeeded but auto-login failed');
            }
            setToken(loginData.token); 
            const profileRes = await api.get('/auth/profile');
            setUser(profileRes.data.user);
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
        isLoggedIn: !!user && !!token, 
        login: handleLogin,
        logout: handleLogout,
        register: handleRegister,
        updateLocalUser: (updatedUser) => setUser(updatedUser),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};