/**
 * Renderiza el catálogo de joyas con favoritos persistentes y botones no interactivos cuando están guardados
 */
async function renderCatalog(container) {
    container.innerHTML = '<p class="loading">Cargando catálogo...</p>';

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    try {
        // 1. Cargar joyas del catálogo
        const joyas = await API.getProducts();

        // 2. Si está logueado, cargar sus favoritos para marcar los que ya tiene
        let favoritosIds = [];
        if (token) {
            try {
                const favoritos = await API.getMyFavorites();
                favoritosIds = favoritos.map(f => f.id);
            } catch (e) {
                console.warn('⚠️ No se pudieron cargar favoritos:', e.message);
            }
        }

        // 3. Header + Botón solo para admin
        let headerHTML = `<h2>💎 Catálogo de Joyas</h2>`;
        if (role === 'admin') {
            headerHTML += `<button id="btn-toggle-form" class="btn-add-joya">➕ Añadir Nueva Joya</button>`;
        }

        // 4. Formulario inline para admin (oculto por defecto)
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

        // 5. Renderizar grid de joyas
        if (!joyas || joyas.length === 0) {
            container.innerHTML = `${headerHTML}${formHTML}<p class="empty">No hay joyas disponibles en este momento.</p>`;
            setupCatalogEvents(container);
            return;
        }

        container.innerHTML = `
            ${headerHTML}
            ${formHTML}
            <div class="products-grid">
                ${joyas.map(j => {
                    const esFavorito = favoritosIds.includes(j.id);
                    return `
                        <div class="product-card">
                            <img src="${j.imagen_url}" alt="${j.nombre}" onerror="this.onerror=null; this.src='/img/default.jpg'">
                            <div class="product-info">
                                <h3 onclick="navigate('/jewelry/${j.id}')" style="cursor:pointer">${j.nombre}</h3>
                                <p class="tipo">${j.tipo} • ${j.material}</p>
                                <span class="price">${j.precio.toFixed(2)} €</span>
                                ${token ? `
                                    <button class="btn-fav ${esFavorito ? 'is-favorite' : ''}" 
                                            data-joya-id="${j.id}"
                                            ${esFavorito ? 'disabled' : ''}
                                            onclick="${esFavorito ? '' : `toggleFavorite(${j.id}, this)`}">
                                        ${esFavorito ? '✅ Guardado' : '❤️ Añadir a favoritos'}
                                    </button>
                                ` : `
                                    <p class="auth-hint">🔐 <a href="#" onclick="navigate('/login'); return false;">Inicia sesión</a> para guardar favoritos</p>
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        setupCatalogEvents(container);

    } catch (e) {
        console.error('❌ Error al cargar catálogo:', e);
        container.innerHTML = `<h2>⚠️ Error</h2><p>${e.message}</p><button onclick="navigate('/dashboard')" class="btn-secondary">Volver</button>`;
    }
}

/**
 * Configura eventos del formulario de admin
 */
function setupCatalogEvents(container) {
    const toggleBtn = document.getElementById('btn-toggle-form');
    const formContainer = document.getElementById('admin-form-container');

    if (toggleBtn && formContainer) {
        toggleBtn.onclick = () => {
            const isVisible = formContainer.style.display !== 'none';
            formContainer.style.display = isVisible ? 'none' : 'block';
            toggleBtn.textContent = isVisible ? '➕ Añadir Nueva Joya' : '✖️ Ocultar formulario';
        };
    }

    const cancelBtn = document.getElementById('btn-cancel-form');
    const form = document.getElementById('form-joya');

    if (cancelBtn && form) {
        cancelBtn.onclick = () => {
            formContainer.style.display = 'none';
            form.reset();
            if (toggleBtn) toggleBtn.textContent = '➕ Añadir Nueva Joya';
        };
    }

    if (form) {
        form.onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.textContent;

            btn.disabled = true;
            btn.textContent = '⏳ Guardando...';

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
                if (toggleBtn) toggleBtn.textContent = '➕ Añadir Nueva Joya';
                renderCatalog(container);

            } catch (err) {
                alert('❌ Error: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        };
    }
}

/**
 * Toggle favorito: SOLO funciona si la joya NO está ya en favoritos
 * Si ya está guardada, el botón está disabled y esta función ni se ejecuta
 */
async function toggleFavorite(joyaId, btn) {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    // Protección extra: si el botón ya tiene la clase is-favorite, no hacer nada
    if (btn.classList.contains('is-favorite')) {
        return;
    }

    const originalText = btn.textContent;

    try {
        // Feedback visual mínimo (sin deshabilitar el botón para no afectar cursor)
        btn.textContent = '⏳';
        btn.style.opacity = '0.7';

        await API.addToFavorites(joyaId);

        // Estado final: marcado como favorito, no clickeable
        btn.textContent = '✅ Guardado';
        btn.classList.add('is-favorite');
        btn.disabled = true;  // ← Esto hace que el cursor sea "not-allowed" y no se pueda clicar
        btn.onclick = null;   // ← Eliminar cualquier evento click residual

    } catch (err) {
        // Revertir en caso de error
        btn.textContent = originalText;
        btn.style.opacity = '1';
        alert('❌ Error: ' + err.message);
    }
}

// Hacer disponible globalmente
window.toggleFavorite = toggleFavorite;
window.renderCatalog = renderCatalog;