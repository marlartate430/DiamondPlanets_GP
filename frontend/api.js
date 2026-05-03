const API_BASE_URL = '/api';

async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = false) {
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (token) options.headers['Authorization'] = `Bearer ${token}`;
    }
    if (data && (method === 'POST' || method === 'PUT')) options.body = JSON.stringify(data);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: `Error ${response.status}` }));
        throw new Error(error.message || `Error HTTP: ${response.status}`);
    }
    if (response.status === 204) return null;
    return await response.json();
}

window.API = {
    register: (data) => apiRequest('/auth/register', 'POST', data, false),
    login: async (email, password) => {
        const res = await apiRequest('/auth/login', 'POST', { email, contrasena: password }, false);
        if (res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('role', res.role);
            localStorage.setItem('userId', res.userId);
        }
        return res;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login');
    },
    getProducts: () => apiRequest('/items', 'GET', null, false),
    createProduct: (data) => apiRequest('/items', 'POST', data, true),
    addToFavorites: (joyaId) => apiRequest('/user/favorites', 'POST', { joya_id: joyaId }, true),
    getMyFavorites: () => apiRequest('/user/favorites', 'GET', null, true),
    getProfile: () => apiRequest('/user/profile', 'GET', null, true),
    updateProfile: (data) => apiRequest('/user/profile', 'PUT', data, true),
    removeFavorite: (joyaId) => apiRequest(`/user/favorites/${joyaId}`, 'DELETE', null, true),
    deleteProduct: (joyaId) => apiRequest(`/items/${joyaId}`, 'DELETE', null, true),
    updateProduct: (joyaId, data) => apiRequest(`/items/${joyaId}`, 'PUT', data, true)
};
