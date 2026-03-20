// ==================== ENRUTAMIENTO SIMPLE ====================

const routes = {
    '/': 'Dashboard',
    '/login': 'Login',
    '/admin': 'AdminPanel',
    '/dashboard': 'Dashboard',
};

/**
 * Función para navegar entre vistas de la SPA
 */
function navigate(path) {
    window.history.pushState({}, '', path);
    handleRoute();
}

/**
 * Manejar la ruta actual y renderizar la vista correspondiente
 */
async function handleRoute() {
    const path = window.location.pathname;
    const app = document.getElementById('app');
    const navbar = document.getElementById('navbar');

    // Renderizar navbar
    renderNavbar(navbar);

    // Proteger rutas según rol
    const role = localStorage.getItem('role');
    
    if (path === '/admin' && role !== 'admin') {
        app.innerHTML = '<h2>⛔ Acceso denegado. Solo administradores.</h2>';
        return;
    }

    // Renderizar vista según ruta
    switch (path) {
        case '/login':
            await renderLogin(app);
            break;
        case '/admin':
            await renderAdminPanel(app);
            break;
        case '/dashboard':
        case '/':
            await renderDashboard(app);
            break;
        default:
            app.innerHTML = '<h2>404 - Página no encontrada</h2>';
    }
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', () => {
    // Manejar navegación con botones atrás/adelante
    window.addEventListener('popstate', handleRoute);
    
    // Iniciar la aplicación
    handleRoute();
});

// ==================== EJEMPLO DE LLAMADA AL BACKEND ====================

/**
 * Ejemplo práctico: Cargar productos desde el backend al iniciar
 */
async function loadProductsExample() {
    try {
        console.log('📡 Llamando al backend para obtener productos...');
        
        // LLAMADA AL BACKEND (ejemplo real)
        const products = await API.getProducts();
        
        console.log('✅ Productos recibidos:', products);
        
        // Renderizar productos en el DOM
        const app = document.getElementById('app');
        if (products && products.length > 0) {
            app.innerHTML = `
                <h2>📦 Listado de Productos</h2>
                <div class="products-grid">
                    ${products.map(product => `
                        <div class="product-card">
                            <h3>${product.name}</h3>
                            <p>${product.description}</p>
                            <span class="price">${product.price}€</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            app.innerHTML = '<h2>No hay productos disponibles</h2>';
        }
    } catch (error) {
        console.error('❌ Error al cargar productos:', error);
        document.getElementById('app').innerHTML = `
            <h2>⚠️ Error de conexión</h2>
            <p>No se pudo conectar con el backend. Asegúrate de que el servidor está ejecutándose.</p>
            <p>Detalle: ${error.message}</p>
        `;
    }
}
