async function renderLogin(container) {
    container.innerHTML = `
        <div class="auth-wrapper">
            <div class="auth-card">
                <h2 id="auth-title">🔐 Iniciar Sesión</h2>
                <form id="auth-form">
                    <input type="text" id="username" placeholder="Nombre de usuario" style="display:none;">
                    <input type="email" id="email" placeholder="Email" required autocomplete="email">
                    <input type="password" id="password" placeholder="Contraseña" required minlength="6" autocomplete="current-password">
                    <button type="submit" class="btn-primary" id="auth-submit-btn">Entrar</button>
                </form>
                <p id="auth-error" class="error" style="display:none;"></p>
                <p class="auth-switch">
                    <span id="switch-text">¿No tienes cuenta?</span>
                    <a href="#" id="switch-link" onclick="toggleAuthMode(); return false;">Regístrate aquí</a>
                </p>
                <p class="hint" style="margin-top:1rem; font-size:0.8rem; color:#666;">
                    Admin test: <code>admin@diamondplanets.com</code> / <code>admin123</code>
                </p>
            </div>
        </div>
    `;

    let isLogin = true;
    const usernameInput = document.getElementById('username');
    usernameInput.required = false; // ✅ Inicialmente NO requerido (modo login)

    document.getElementById('auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('auth-error');
        const btn = document.getElementById('auth-submit-btn');

        errorEl.style.display = 'none';
        errorEl.textContent = '';
        btn.disabled = true;
        btn.textContent = isLogin ? 'Entrando...' : 'Registrando...';

        try {
            if (isLogin) {
                await API.login(email, password);
                navigate('/dashboard');
            } else {
                const username = document.getElementById('username').value;
                await API.register({ nombre_usuario: username, email, contrasena: password });
                alert('✅ Registro exitoso. Inicia sesión ahora.');
                toggleAuthMode();
            }
        } catch (err) {
            errorEl.textContent = err.message || 'Error desconocido';
            errorEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = isLogin ? 'Entrar' : 'Registrarse';
        }
    });

    window.toggleAuthMode = function() {
        isLogin = !isLogin;
        document.getElementById('auth-title').textContent = isLogin ? '🔐 Iniciar Sesión' : '✨ Crear Cuenta';

        if (!isLogin) {
            // Modo Registro: mostrar y hacer requerido
            usernameInput.style.display = 'block';
            usernameInput.required = true;
            usernameInput.focus();
        } else {
            // Modo Login: ocultar y quitar requerido
            usernameInput.style.display = 'none';
            usernameInput.required = false;
            usernameInput.value = '';
        }

        document.getElementById('auth-submit-btn').textContent = isLogin ? 'Entrar' : 'Registrarse';
        document.getElementById('switch-text').textContent = isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?';
        document.getElementById('switch-link').textContent = isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí';
        document.getElementById('auth-error').style.display = 'none';
    };
}