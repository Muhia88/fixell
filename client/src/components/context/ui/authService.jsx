import api from '../../../api/axiosConfig';

const register = (email, password, name) => {
    // Calls the /api/auth/register endpoint
    return api.post('/auth/register', { email, password, name }); 
};

const login = (email, password) => {
    // Calls the /api/auth/login endpoint
    return api.post('/auth/login', { email, password })
        .then(response => {
            if (response.data.token) {
                // Store the JWT token and user info on successful login
                localStorage.setItem('authToken', response.data.token);
                    // ensure name is present in stored user
                    const user = response.data.user || {};
                    localStorage.setItem('user', JSON.stringify(user));
            }
            return response.data;
        });
};

const logout = () => {
    // Clear user data upon logout
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    // Retrieve user from local storage
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
};

export default authService;