async function renderDashboard(container) {
    container.innerHTML = `
        <div class="dashboard-menu">
            <h2>💎 Bienvenido a DiamondPlanets</h2>
            <p class="dashboard-subtitle">¿Qué deseas hacer hoy?</p>
            <div class="menu-grid">
                <div class="menu-card" onclick="navigate('/catalog')">
                    <span class="menu-icon">📦</span>
                    <h3>Consultar Catálogo</h3>
                    <p>Explora nuestra colección completa de joyas</p>
                </div>
                <div class="menu-card" onclick="navigate('/favorites')">
                    <span class="menu-icon">❤️</span>
                    <h3>Mis Favoritos</h3>
                    <p>Revisa las joyas que has guardado</p>
                </div>
            </div>
        </div>
    `;
}