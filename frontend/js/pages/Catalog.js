async function renderCatalog(container) {
    container.innerHTML = '<p class="loading">Cargando catálogo...</p>';
    const isLoggedIn = !!localStorage.getItem('token');
    const role = localStorage.getItem('role');

    try {
        const joyas = await API.getProducts();

        // Header + Botón solo para admin
        let headerHTML = `<h2>💎 Catálogo de Joyas</h2>`;
        if (role === 'admin') {
            headerHTML += `<button id="btn-toggle-form" class="btn-add-joya">➕ Añadir Nueva Joya</button>`;
        }

        // Formulario oculto (solo admin)
        const formHTML = role === 'admin' ? `
            <div id="admin-form-container" style="display:none; margin: 1.5rem 0;">
                <div class="admin-form-inline">
                    <h3>📦 Nueva Joya</h3>
                    <form id="form-joya">
                        <div class="form-grid">
                            <input type="text" id="nombre" placeholder="Nombre *" required>
                            <input type="number" id="precio" step="0.01" min="0.01" placeholder="Precio (€) *" required>
                            <select id="tipo" required>
                                <option value="">Tipo *</option>
                                <option value="anillo">💍 Anillo</option>
                                <option value="collar">📿 Collar</option>
                                <option value="pulsera">⌚ Pulsera</option>
                                <option value="pendiente">✨ Pendiente</option>
                            </select>
                            <input type="text" id="material" placeholder="Material" value="Oro">
                            <input type="number" id="stock" min="0" placeholder="Stock" value="0">
                            <input type="url" id="imagen_url" placeholder="URL imagen (opcional)">
                        </div>
                        <textarea id="descripcion" placeholder="Descripción..." rows="2"></textarea>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">💾 Guardar Joya</button>
                            <button type="button" id="btn-cancel-form" class="btn-secondary">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        ` : '';

        if (!joyas || joyas.length === 0) {
            container.innerHTML = `${headerHTML}${formHTML}<p>No hay joyas disponibles.</p>`;
            setupCatalogEvents(container);
            return;
        }

        container.innerHTML = `
            ${headerHTML}
            ${formHTML}
            <div class="products-grid">
                ${joyas.map(j => `
                    <div class="product-card">
                        <img src="${j.imagen_url}" alt="${j.nombre}" onerror="this.onerror=null; this.src='/img/default.jpg'">
                        <div class="product-info">
                            <h3 onclick="navigate('/jewelry/${j.id}')" style="cursor:pointer">${j.nombre}</h3>
                            <p class="tipo">${j.tipo} • ${j.material}</p>
                            <span class="price">${j.precio.toFixed(2)} €</span>
                            ${isLoggedIn ? `
                                <button class="btn-fav" onclick="toggleFavorite(${j.id}, this)">❤️ Añadir a favoritos</button>
                            ` : `
                                <p class="auth-hint">🔐 <a href="#" onclick="navigate('/login'); return false;">Inicia sesión</a> para guardar favoritos</p>
                            `}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        setupCatalogEvents(container);
    } catch (e) {
        container.innerHTML = `<h2>⚠️ Error</h2><p>${e.message}</p><button onclick="navigate('/dashboard')">Volver</button>`;
    }
}

function setupCatalogEvents(container) {
    // Toggle formulario
    const toggleBtn = document.getElementById('btn-toggle-form');
    const formContainer = document.getElementById('admin-form-container');
    if (toggleBtn && formContainer) {
        toggleBtn.onclick = () => formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    }

    // Cancelar
    const cancelBtn = document.getElementById('btn-cancel-form');
    const form = document.getElementById('form-joya');
    if (cancelBtn && form) {
        cancelBtn.onclick = () => { formContainer.style.display = 'none'; form.reset(); };
    }

    // Guardar
    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            btn.disabled = true; btn.textContent = 'Guardando...';
            try {
                await API.createProduct({
                    nombre: document.getElementById('nombre').value.trim(),
                    precio: parseFloat(document.getElementById('precio').value),
                    tipo: document.getElementById('tipo').value,
                    material: document.getElementById('material').value.trim() || 'Oro',
                    stock: parseInt(document.getElementById('stock').value) || 0,
                    imagen_url: document.getElementById('imagen_url').value.trim() || '',
                    descripcion: document.getElementById('descripcion').value.trim()
                });
                alert('✅ Joya creada exitosamente');
                form.reset();
                formContainer.style.display = 'none';
                renderCatalog(container); // Recargar catálogo
            } catch (err) {
                alert('❌ Error: ' + err.message);
            } finally {
                btn.disabled = false; btn.textContent = '💾 Guardar Joya';
            }
        };
    }
}

// Función global para favoritos
async function toggleFavorite(joyaId, btn) {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }
    try {
        btn.disabled = true; btn.textContent = '⏳ Guardando...';
        await API.addToFavorites(joyaId);
        btn.textContent = '✅ Guardado'; btn.style.background = 'var(--accent)'; btn.style.color = 'white';
    } catch (err) {
        alert('❌ Error: ' + err.message);
        btn.textContent = '❤️ Añadir a favoritos'; btn.disabled = false;
    }
}