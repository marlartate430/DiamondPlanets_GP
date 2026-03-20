/**
 * Verificar si el usuario está logueado
 */
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

/**
 * Obtener rol del usuario
 */
function getUserRole() {
    return localStorage.getItem('role');
}

/**
 * Cerrar sesión
 */
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
}

/**
 * Proteger ruta según rol
 */
function guard(roleRequired) {
    if (!isAuthenticated()) {
        navigate('/login');
        return false;
    }
    
    if (roleRequired && getUserRole() !== roleRequired) {
        alert('⛔ No tienes permisos para acceder');
        navigate('/dashboard');
        return false;
    }
    
    return true;
}
