// Base URL for the backend API
const API_URL = "http://127.0.0.1:5000/api/auth";

// A variable to store the authentication token
let token = null;

// Function to set the global token
const setToken = (newToken) => {
  token = newToken;
};

// Helper function for API calls
const fetchApi = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    body: data ? JSON.stringify(data) : null,
  };

  const response = await fetch(url, config);
  
  if (response.status === 204) {
    return { success: true, message: 'Operation successful' };
  }

  const jsonResponse = await response.json();

  if (!response.ok) {
    // Treat 409 (Conflict - e.g., email exists) specifically
    if (response.status === 409) {
        return { error: { status: 409, message: jsonResponse.message || 'Resource conflict.' } };
    }
    // General error handling
    const error = jsonResponse.message || jsonResponse.error || 'API request failed';
    throw new Error(error);
  }

  return jsonResponse;
};

// Registration service function
const register = async (userData) => {
  try {
    const data = await fetchApi('/register', 'POST', userData);
    // Assuming backend returns success message or user object
    return data;
  } catch (error) {
    // Re-throw errors for context to handle
    throw error;
  }
};

// Login service function
const login = async (credentials) => {
  // Placeholder for login implementation - usually returns { access_token: "..." }
  // Since we are focusing on register now, this is a mock implementation
  // This should call a /login endpoint in the real app.
  console.log("Mock Login called with:", credentials);
  if (credentials.email === "test@user.com" && credentials.password === "password") {
      return { access_token: "mock-jwt-token-for-test-user" };
  } else if (credentials.email === "new@user.com") {
      return { access_token: "mock-jwt-token-for-new-user" };
  }
  
  throw new Error("Invalid credentials");
};

// Get user profile (used for token validation and setting user state)
const getProfile = async () => {
  // This would hit a /profile or /me endpoint requiring the token
  // Mock implementation
  if (token) {
      console.log("Mock Profile fetched for token:", token);
      return { 
          id: 1, 
          username: "AuthenticatedUser", 
          email: "authenticated@user.com", 
          role: 'user', 
          created_at: new Date().toISOString() 
      };
  }
  throw new Error("No token provided");
};

const authService = {
  setToken,
  register,
  login,
  getProfile,
  // Add other methods like logout, refreshToken, etc. as needed
};

export default authService;
