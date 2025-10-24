import api from '../../../api/axiosConfig';

const register = (email, password, name, phone_number) => {

    return api.post('/auth/register', { email, password, name, phone_number });
};

const login = (email, password) => {
    return api.post('/auth/login', { email, password })
        .then(response => {
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                const user = response.data.user || {};
                localStorage.setItem('user', JSON.stringify({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    created_at: user.created_at
                 }));
            }
            return response.data;
        });
};

const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
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