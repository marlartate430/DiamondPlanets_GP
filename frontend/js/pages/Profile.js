async function renderProfile(container) {
    if (!localStorage.getItem('token')) { navigate('/login'); return; }

    container.innerHTML = '<p class="loading">Cargando perfil...</p>';

    try {
        const profile = await API.getProfile();
        container.innerHTML = `
            <section class="profile-page">
                <h2>Mi perfil</h2>
                <form id="profile-form" class="profile-form">
                    <div class="form-grid">
                        <label>
                            Usuario *
                            <input type="text" id="profile-username" value="${escapeHtml(profile.nombre_usuario || '')}" required>
                        </label>
                        <label>
                            Email *
                            <input type="email" id="profile-email" value="${escapeHtml(profile.email || '')}" required>
                        </label>
                        <label>
                            Nombre
                            <input type="text" id="profile-name" value="${escapeHtml(profile.nombre || '')}">
                        </label>
                        <label>
                            Apellidos
                            <input type="text" id="profile-surname" value="${escapeHtml(profile.apellidos || '')}">
                        </label>
                        <label>
                            Telefono
                            <input type="tel" id="profile-phone" value="${escapeHtml(profile.telefono || '')}">
                        </label>
                        <label>
                            Saldo
                            <input type="text" value="${Number(profile.dinero || 0).toFixed(2)} EUR" disabled>
                        </label>
                    </div>
                    <label>
                        Direccion
                        <textarea id="profile-address" rows="3">${escapeHtml(profile.direccion || '')}</textarea>
                    </label>
                    <p id="profile-message" class="profile-message"></p>
                    <button type="submit" class="btn-primary">Guardar cambios</button>
                </form>
            </section>
        `;

        setupProfileEvents(container);
    } catch (e) {
        container.innerHTML = `<p class="error" style="display:block;">Error al cargar perfil: ${e.message}</p>`;
    }
}

function setupProfileEvents(container) {
    const form = document.getElementById('profile-form');
    const message = document.getElementById('profile-message');

    form.onsubmit = async (event) => {
        event.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;

        btn.disabled = true;
        btn.textContent = 'Guardando...';
        message.textContent = '';
        message.className = 'profile-message';

        try {
            await API.updateProfile({
                nombre_usuario: document.getElementById('profile-username').value.trim(),
                email: document.getElementById('profile-email').value.trim(),
                nombre: document.getElementById('profile-name').value.trim(),
                apellidos: document.getElementById('profile-surname').value.trim(),
                telefono: document.getElementById('profile-phone').value.trim(),
                direccion: document.getElementById('profile-address').value.trim()
            });

            message.textContent = 'Perfil actualizado correctamente.';
            message.classList.add('success');
        } catch (e) {
            message.textContent = e.message;
            message.classList.add('error-text');
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    };
}

window.renderProfile = renderProfile;
