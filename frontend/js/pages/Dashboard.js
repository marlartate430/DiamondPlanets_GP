/**
 * Renderizar la página Dashboard (listado general de productos)
 */
async function renderDashboard(container) {
    container.innerHTML = '<h2>📦 Listado General de Productos</h2><p>Cargando...</p>';

    try {
        // LLAMADA AL BACKEND
        const products = await API.getProducts();

        if (products && products.length > 0) {
            container.innerHTML = `
                <h2>📦 Listado General de Productos</h2>
                <div class="products-grid">
                    ${products.map(product => `
                        <div class="product-card">
                            <h3>${product.name}</h3>
                            <p>${product.description || 'Sin descripción'}</p>
                            <span class="price">${product.price || 0}€</span>
                            <button onclick="addToMyListExample(${product.id})">
                                ➕ Añadir a mi lista
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            container.innerHTML = '<h2>No hay productos disponibles</h2>';
        }
    } catch (error) {
        container.innerHTML = `
            <h2>⚠️ Error</h2>
            <p>${error.message}</p>
            <button onclick="navigate('/login')">Ir a Login</button>
        `;
    }
}

/**
 * Ejemplo: Añadir producto a lista personal
 */
async function addToMyListExample(productId) {
    try {
        await API.addToMyList(productId);
        alert('✅ Producto añadido a tu lista personal');
    } catch (error) {
        alert('❌ Error: ' + error.message);
    }
}
