// Configuración de la API
const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Función genérica para hacer peticiones HTTP
 * @param {string} endpoint - Endpoint de la API
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} data - Datos a enviar (para POST/PUT)
 * @param {boolean} requiresAuth - Si requiere token de autenticación
 */
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = false) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Añadir token si requiere autenticación
    if (requiresAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // Añadir body si hay datos
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        // Manejar errores HTTP
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Error ${response.status}`);
        }

        // Si la respuesta es 204 No Content
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
}

// ==================== EJEMPLOS DE LLAMADAS AL BACKEND ====================

/**
 * Ejemplo 1: Obtener listado de productos (GET público)
 */
async function getProducts() {
    return await apiRequest('/items', 'GET', null, false);
}

/**
 * Ejemplo 2: Login de usuario (POST)
 */
async function login(email, password) {
    const response = await apiRequest('/auth/login', 'POST', { email, password }, false);
    // Guardar token y rol en localStorage
    if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        localStorage.setItem('userId', response.userId);
    }
    return response;
}

/**
 * Ejemplo 3: Crear producto (POST - solo admin)
 */
async function createProduct(productData) {
    return await apiRequest('/items', 'POST', productData, true);
}

/**
 * Ejemplo 4: Eliminar producto (DELETE - solo admin)
 */
async function deleteProduct(id) {
    return await apiRequest(`/items/${id}`, 'DELETE', null, true);
}

/**
 * Ejemplo 5: Añadir producto a lista personal (POST - usuario estándar)
 */
async function addToMyList(productId) {
    return await apiRequest('/user/lists', 'POST', { itemId: productId }, true);
}

/**
 * Ejemplo 6: Obtener mi lista personal (GET - usuario estándar)
 */
async function getMyList() {
    return await apiRequest('/user/lists', 'GET', null, true);
}

// Exportar funciones para usar en otros archivos
window.API = {
    getProducts,
    login,
    createProduct,
    deleteProduct,
    addToMyList,
    getMyList,
};
