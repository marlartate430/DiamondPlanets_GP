async function renderJoyaDetalle(container, joyaId) {
    container.innerHTML = '<p class="loading">Cargando detalles...</p>';
    const isLoggedIn = !!localStorage.getItem('token');
    const isAdmin = localStorage.getItem('role') === 'admin';

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

        _renderJoyaView(container, joya, isLoggedIn, isAdmin);

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
 * Renderiza la vista de detalle de la joya (modo lectura).
 * Reutilizable tras guardar cambios.
 */
function _renderJoyaView(container, joya, isLoggedIn, isAdmin) {
    const favAction = isLoggedIn
        ? `<button class="btn-fav btn-fav-detail" onclick="toggleFavorite(${joya.id}, this)">❤️ Añadir a favoritos</button>`
        : `<p class="auth-hint">🔐 <a href="#" onclick="navigate('/login'); return false;">Inicia sesión</a> para guardar favoritos</p>`;

    const adminActions = isAdmin ? `
        <div class="detail-admin-actions">
            <button class="btn-edit-joya" onclick="showEditForm(${joya.id})">✏️ Editar joya</button>
            <button class="btn-delete-joya btn-delete-detail" onclick="deleteJoyaDetalle(${joya.id})">🗑️ Eliminar joya</button>
        </div>
    ` : '';

    container.innerHTML = `
        <div class="detail-container">
            <button onclick="navigate('/catalog')" class="btn-back">← Volver al catálogo</button>
            ${adminActions}
            <div class="detail-grid" id="detail-grid">
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

            <!-- Formulario de edición (oculto por defecto) -->
            <div id="edit-form-container" style="display:none; margin-top:2rem;">
                <div class="admin-form-inline">
                    <h3>✏️ Editar Joya</h3>
                    <form id="form-edit-joya">
                        <div class="form-grid">
                            <input type="text"   id="edit-nombre"    placeholder="Nombre *"        value="${_escHtml(joya.nombre)}"    required>
                            <input type="number" id="edit-precio"    step="0.01" min="0.01"         value="${joya.precio}"             placeholder="Precio (€) *" required>
                            <select id="edit-tipo" required>
                                <option value="anillo"   ${joya.tipo==='anillo'   ?'selected':''}>💍 Anillo</option>
                                <option value="collar"   ${joya.tipo==='collar'   ?'selected':''}>📿 Collar</option>
                                <option value="pulsera"  ${joya.tipo==='pulsera'  ?'selected':''}>⌚ Pulsera</option>
                                <option value="pendiente"${joya.tipo==='pendiente'?'selected':''}>✨ Pendiente</option>
                            </select>
                            <input type="text"   id="edit-material"  placeholder="Material"        value="${_escHtml(joya.material)}">
                            <input type="number" id="edit-stock"     min="0"                       value="${joya.stock}"              placeholder="Stock">
                            <input type="url"    id="edit-imagen_url" placeholder="URL imagen"     value="${_escHtml(joya.imagen_url)}">
                        </div>
                        <textarea id="edit-descripcion" placeholder="Descripción..." rows="3">${_escHtml(joya.descripcion || '')}</textarea>
                        <div class="form-actions" style="margin-top:1rem;">
                            <button type="submit"  class="btn-primary">💾 Guardar cambios</button>
                            <button type="button"  class="btn-secondary" onclick="hideEditForm()">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Conectar submit del formulario de edición
    const form = document.getElementById('form-edit-joya');
    if (form) {
        form.onsubmit = (e) => _submitEditJoya(e, joya.id, container);
    }
}

/**
 * Muestra el formulario de edición y oculta el grid de detalle
 */
function showEditForm(joyaId) {
    const editContainer = document.getElementById('edit-form-container');
    const detailGrid    = document.getElementById('detail-grid');
    if (editContainer) editContainer.style.display = 'block';
    if (detailGrid)    detailGrid.style.display    = 'none';
}

/**
 * Oculta el formulario de edición y vuelve a mostrar el grid
 */
function hideEditForm() {
    const editContainer = document.getElementById('edit-form-container');
    const detailGrid    = document.getElementById('detail-grid');
    if (editContainer) editContainer.style.display = 'none';
    if (detailGrid)    detailGrid.style.display    = 'grid';
}

/**
 * Envía los cambios de edición al backend y re-renderiza la vista
 */
async function _submitEditJoya(e, joyaId, container) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '⏳ Guardando...';

    const payload = {
        nombre:      document.getElementById('edit-nombre').value.trim(),
        precio:      parseFloat(document.getElementById('edit-precio').value),
        tipo:        document.getElementById('edit-tipo').value,
        material:    document.getElementById('edit-material').value.trim() || 'Oro',
        stock:       parseInt(document.getElementById('edit-stock').value) || 0,
        imagen_url:  document.getElementById('edit-imagen_url').value.trim() || '/img/default.jpg',
        descripcion: document.getElementById('edit-descripcion').value.trim()
    };

    try {
        const updated = await API.updateProduct(joyaId, payload);
        alert('✅ Joya actualizada correctamente');
        // Re-renderizar la vista completa con los datos actualizados
        const isLoggedIn = !!localStorage.getItem('token');
        const isAdmin    = localStorage.getItem('role') === 'admin';
        _renderJoyaView(container, updated, isLoggedIn, isAdmin);
    } catch (err) {
        alert('❌ Error al guardar: ' + err.message);
        btn.disabled = false;
        btn.textContent = originalText;
    }
}

/**
 * Elimina la joya actual desde la vista de detalle y redirige al catálogo
 */
async function deleteJoyaDetalle(joyaId) {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    const h1 = document.querySelector('.detail-info h1');
    const nombre = h1 ? h1.textContent : `joya #${joyaId}`;

    if (!confirm(`¿Seguro que quieres eliminar "${nombre}"?\nEsta acción no se puede deshacer.`)) return;

    try {
        await API.deleteProduct(joyaId);
        alert('✅ Joya eliminada correctamente');
        navigate('/catalog');
    } catch (err) {
        alert('❌ Error al eliminar: ' + err.message);
    }
}

/**
 * Escapa caracteres HTML para insertar texto en atributos/contenido de forma segura
 */
function _escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Función global para añadir favoritos (reutilizable)
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

// Exponer funciones globalmente
window.renderJoyaDetalle   = renderJoyaDetalle;
window.showEditForm        = showEditForm;
window.hideEditForm        = hideEditForm;
window.deleteJoyaDetalle   = deleteJoyaDetalle;
window.toggleFavorite      = toggleFavorite;