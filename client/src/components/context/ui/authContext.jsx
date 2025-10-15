import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "./authService.jsx";
import PropTypes from "prop-types";

// --- CONTEXT CREATION ---
export const AuthContext = createContext();

// --- PROVIDER COMPONENT ---
export const AuthProvider = ({ children }) => {
  // State for user session
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Utility Functions ---

  const handleAuthSuccess = async (accessToken) => {
    localStorage.setItem("token", accessToken);
    authService.setToken(accessToken);
    const profileData = await authService.getProfile();

    if (profileData && !profileData.error) {
      // Assuming 'hospital' role needs to be mapped to 'hospital_admin' based on previous logic
      if (profileData.role === 'hospital') profileData.role = 'hospital_admin';
      setUser(profileData);
      setIsAuthenticated(true);
      return profileData;
    } else {
      throw new Error("Failed to fetch profile after successful authentication.");
    }
  };

  const handleAuthFailure = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token");
    authService.setToken(null);
  }

  // --- Core Authentication Logic ---

  // Initial check for existing token
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        authService.setToken(token);
        try {
          // Attempt to fetch profile to validate token
          const profileData = await authService.getProfile(); 
          if (profileData && !profileData.error) {
            if (profileData.role === 'hospital') profileData.role = 'hospital_admin';
            setUser(profileData);
            setIsAuthenticated(true);
          } else {
            handleAuthFailure();
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error);
          handleAuthFailure();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Login function
  const login = async (payload) => {
    setLoading(true);
    try {
      const res = await authService.login(payload);
      if (res?.error) {
        throw new Error(res.error.message || "Login failed");
      }

      if (res.access_token) {
        const profile = await handleAuthSuccess(res.access_token);
        return { user: profile };
      }
      throw new Error("Login failed: No access token received.");

    } catch (error) {
      handleAuthFailure();
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Registration function
  const register = async (payload) => {
    setLoading(true);
    try {
        const res = await authService.register(payload);
        
        if (res?.error) {
            // Handle specific backend errors (e.g., 409 conflict)
            const errorMsg = res.error.message || "Registration failed due to server error.";
            throw new Error(errorMsg);
        }
        
        // After successful registration, return success message for the component to handle redirection
        return { success: true, message: res.message || "Registration successful. You can now log in." };

    } catch (error) {
        // Only throw the error, don't clear tokens, as a registration failure doesn't mean the token is bad.
        throw error;
    } finally {
        setLoading(false);
    }
  };


  // Logout function
  const logout = () => {
    handleAuthFailure();
  };

  // Refresh profile function
  const refreshProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const profileData = await authService.getProfile();
      if (profileData && !profileData.error) {
        if (profileData.role === 'hospital') profileData.role = 'hospital_admin';
        setUser(profileData);
        setIsAuthenticated(true);
        return profileData;
      }
    } catch (err) {
      console.error('Failed to refresh profile', err);
    }
    return null;
  };

  const contextValue = { 
    user, 
    isAuthenticated, 
    loading, 
    login, 
    logout, 
    refreshProfile,
    register // Add the new register function
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// --- HOOK ---
export const useAuth = () => {
  return useContext(AuthContext);
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};