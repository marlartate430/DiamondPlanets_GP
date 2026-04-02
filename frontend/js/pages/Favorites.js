async function renderFavorites(container) {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    container.innerHTML = '<p class="loading">Cargando tus favoritos...</p>';
    try {
        const favs = await API.getMyFavorites();
        if (!favs || favs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span style="font-size:3rem;">💔</span>
                    <h3>No tienes joyas favoritas aún</h3>
                    <p>Explora el catálogo y marca las que te gusten.</p>
                    <button onclick="navigate('/catalog')" class="btn-primary" style="margin-top:1rem; width:auto;">Ver Catálogo</button>
                </div>
            `;
            return;
        }
        container.innerHTML = `
            <h2>❤️ Tus Joyas Favoritas</h2>
            <div class="products-grid">
                ${favs.map(j => `
                    <div class="product-card">
                        <img src="${j.imagen_url}" alt="${j.nombre}" onerror="this.onerror=null; this.src='/img/default.jpg';">
                        <div class="product-info">
                            <h3 onclick="navigate('/jewelry/${j.id}')" style="cursor:pointer">${j.nombre}</h3>
                            <p class="tipo">${j.tipo} • ${j.material}</p>
                            <span class="price">${j.precio.toFixed(2)} €</span>
                            <button class="btn-remove" onclick="removeFavorite(${j.id}, this)">🗑️ Quitar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (e) {
        container.innerHTML = `<p class="error">Error al cargar: ${e.message}</p>`;
    }
}

async function removeFavorite(joyaId, btn) {
    try {
        btn.disabled = true;
        btn.textContent = 'Eliminando...';
        await API.removeFavorite(joyaId);
        btn.closest('.product-card').style.opacity = '0';
        setTimeout(() => btn.closest('.product-card').remove(), 300);
    } catch (err) {
        alert('Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = '🗑️ Quitar';
    }
}