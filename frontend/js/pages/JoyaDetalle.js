async function renderJoyaDetalle(container, joyaId) {
    container.innerHTML = '<p class="loading">Cargando detalles...</p>';
    const isLoggedIn = !!localStorage.getItem('token');

    try {
        const joya = await apiRequest(`/items/${joyaId}`, 'GET', null, false);

        if (!joya) {
            container.innerHTML = `
                <p style="text-align:center; padding:3rem;">
                    Joya no encontrada. 
                    <button onclick="navigate('/catalog')" class="btn-secondary" style="margin-top:1rem;">Volver al catálogo</button>
                </p>`;
            return;
        }

        // Renderizar acción según estado de sesión
        const favAction = isLoggedIn
            ? `<button class="btn-fav btn-fav-detail" onclick="toggleFavorite(${joya.id}, this)">❤️ Añadir a favoritos</button>`
            : `<p class="auth-hint">🔐 <a href="#" onclick="navigate('/login'); return false;">Inicia sesión</a> para guardar favoritos</p>`;

        container.innerHTML = `
            <div class="detail-container">
                <button onclick="navigate('/catalog')" class="btn-back">← Volver al catálogo</button>
                <div class="detail-grid">
                    <img src="${joya.imagen_url}" alt="${joya.nombre}" class="detail-img" onerror="this.onerror=null; this.src='/img/default.jpg';">
                    <div class="detail-info">
                        <span class="badge">${joya.tipo.toUpperCase()}</span>
                        <h1>${joya.nombre}</h1>
                        <p class="price-large">${joya.precio.toFixed(2)} €</p>
                        <div class="detail-specs">
                            <p><strong>Material:</strong> ${joya.material}</p>
                            <p><strong>Disponibilidad:</strong> ${joya.stock > 0 ? `✅ ${joya.stock} unidades` : '❌ Agotado'}</p>
                        </div>
                        <p class="desc">${joya.descripcion || 'Sin descripción disponible.'}</p>
                        <div class="detail-actions">
                            ${favAction}
                        </div>
                    </div>
                </div>
            </div>
        `;
    } catch (e) {
        container.innerHTML = `
            <div class="error-state" style="text-align:center; padding:3rem;">
                <h2>⚠️ Error al cargar</h2>
                <p>${e.message}</p>
                <button onclick="navigate('/catalog')" class="btn-secondary" style="margin-top:1rem;">Volver</button>
            </div>
        `;
    }
}

/**
 * Función global para añadir/quitar favoritos (reutilizable)
 */
async function toggleFavorite(joyaId, btn) {
    if (!localStorage.getItem('token')) {
        navigate('/login');
        return;
    }

    try {
        btn.disabled = true;
        btn.textContent = '⏳ Guardando...';
        await API.addToFavorites(joyaId);
        btn.textContent = '✅ Guardado en favoritos';
        btn.style.background = 'var(--accent)';
        btn.style.color = 'white';
        btn.style.borderColor = 'var(--accent)';
    } catch (err) {
        alert('❌ Error: ' + err.message);
        btn.textContent = '❤️ Añadir a favoritos';
        btn.disabled = false;
    }
}