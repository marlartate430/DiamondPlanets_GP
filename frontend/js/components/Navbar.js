function renderNavbar(container) {
    const isLoggedIn = !!localStorage.getItem('token');
    container.innerHTML = `
        <div class="navbar">
            <span class="brand" onclick="navigate('/dashboard')" style="cursor:pointer">💎 DiamondPlanets</span>
            <div class="nav-links">
                ${isLoggedIn ? `
                    <a href="#" onclick="navigate('/dashboard'); return false;">Inicio</a>
                    <a href="#" onclick="navigate('/catalog'); return false;">Catálogo</a>
                    <a href="#" onclick="navigate('/favorites'); return false;">Favoritos</a>
                    <button onclick="API.logout()" class="btn-logout">Cerrar Sesión</button>
                ` : `
                    <a href="#" onclick="navigate('/login'); return false;">Iniciar Sesión / Registro</a>
                `}
            </div>
        </div>
    `;
}