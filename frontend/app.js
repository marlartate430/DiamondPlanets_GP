function navigate(path) {
    window.history.pushState({}, '', path);
    handleRoute();
}

async function handleRoute() {
    const path = window.location.pathname;
    const app = document.getElementById('app');
    const navbar = document.getElementById('navbar');

    if (typeof renderNavbar === 'function') renderNavbar(navbar);

    const token = localStorage.getItem('token');
    if (!token && path !== '/login') { navigate('/login'); return; }
    if (token && path === '/login') { navigate('/dashboard'); return; }

    if (path.startsWith('/jewelry/')) {
        const id = path.split('/').pop();
        if (!isNaN(id)) { await renderJoyaDetalle(app, parseInt(id)); return; }
    }

    switch (path) {
        case '/login': await renderLogin(app); break;
        case '/catalog': await renderCatalog(app); break;
        case '/favorites': await renderFavorites(app); break;
        case '/dashboard': case '/': await renderDashboard(app); break;
        default: app.innerHTML = '<h2>404 - Página no encontrada</h2>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('popstate', handleRoute);
    handleRoute();
});