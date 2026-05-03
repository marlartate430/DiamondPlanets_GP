function renderNavbar(container) {
    const isLoggedIn = !!localStorage.getItem('token');
    const params = new URLSearchParams(window.location.search);
    const search = params.get('q') || '';
    const tipo = params.get('tipo') || '';
    const material = params.get('material') || '';

    container.innerHTML = `
        <div class="navbar">
            <span class="brand" onclick="navigate('/dashboard')" style="cursor:pointer">DiamondPlanets</span>
            ${isLoggedIn ? `
                <form class="nav-search" onsubmit="handleNavbarSearch(event)">
                    <input type="search" id="nav-search-text" placeholder="Buscar joya..." value="${escapeHtml(search)}">
                    <select id="nav-filter-tipo">
                        <option value="">Tipo</option>
                        <option value="anillo" ${tipo === 'anillo' ? 'selected' : ''}>Anillo</option>
                        <option value="collar" ${tipo === 'collar' ? 'selected' : ''}>Collar</option>
                        <option value="pulsera" ${tipo === 'pulsera' ? 'selected' : ''}>Pulsera</option>
                        <option value="pendiente" ${tipo === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                    </select>
                    <select id="nav-filter-material">
                        <option value="">Material</option>
                        <option value="oro" ${material === 'oro' ? 'selected' : ''}>Oro</option>
                        <option value="oro blanco" ${material === 'oro blanco' ? 'selected' : ''}>Oro blanco</option>
                        <option value="plata" ${material === 'plata' ? 'selected' : ''}>Plata</option>
                    </select>
                    <button type="submit" class="btn-search">Buscar</button>
                </form>
            ` : ''}
            <div class="nav-links">
                ${isLoggedIn ? `
                    <a href="#" onclick="navigate('/dashboard'); return false;">Inicio</a>
                    <a href="#" onclick="navigate('/catalog'); return false;">Catalogo</a>
                    <a href="#" onclick="navigate('/favorites'); return false;">Favoritos</a>
                    <button onclick="API.logout()" class="btn-logout">Cerrar sesion</button>
                ` : `
                    <a href="#" onclick="navigate('/login'); return false;">Iniciar sesion / Registro</a>
                `}
            </div>
        </div>
    `;
}

function handleNavbarSearch(event) {
    event.preventDefault();

    const params = new URLSearchParams();
    const search = document.getElementById('nav-search-text').value.trim();
    const tipo = document.getElementById('nav-filter-tipo').value;
    const material = document.getElementById('nav-filter-material').value;

    if (search) params.set('q', search);
    if (tipo) params.set('tipo', tipo);
    if (material) params.set('material', material);

    const query = params.toString();
    navigate(query ? `/catalog?${query}` : '/catalog');
}

window.handleNavbarSearch = handleNavbarSearch;

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}
