import os
import sqlite3
import hashlib
import datetime
import jwt
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
DB_FILE = os.path.join(BASE_DIR, 'diamond_planets.db')

app = Flask(__name__)
SECRET_KEY = 'UNIVERSIDAD_SECRET_KEY'


def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS usuarios
                 (
                     id
                     INTEGER
                     PRIMARY
                     KEY
                     AUTOINCREMENT,
                     nombre_usuario
                     TEXT
                     NOT
                     NULL
                     UNIQUE,
                     email
                     TEXT
                     NOT
                     NULL
                     UNIQUE,
                     contrasena
                     TEXT
                     NOT
                     NULL,
                     dinero
                     REAL
                     DEFAULT
                     0.00,
                     fecha_creacion
                     TIMESTAMP
                     DEFAULT
                     CURRENT_TIMESTAMP
                 )''')
    c.execute('''CREATE TABLE IF NOT EXISTS joyas
                 (
                     id
                     INTEGER
                     PRIMARY
                     KEY
                     AUTOINCREMENT,
                     nombre
                     TEXT
                     NOT
                     NULL,
                     descripcion
                     TEXT,
                     precio
                     REAL
                     NOT
                     NULL,
                     imagen_url
                     TEXT
                     DEFAULT
                     '/img/default.jpg',
                     material
                     TEXT
                     DEFAULT
                     'Oro',
                     tipo
                     TEXT
                     NOT
                     NULL,
                     stock
                     INTEGER
                     DEFAULT
                     0,
                     fecha_creacion
                     TIMESTAMP
                     DEFAULT
                     CURRENT_TIMESTAMP
                 )''')
    c.execute('''CREATE TABLE IF NOT EXISTS favoritos
    (
        id
        INTEGER
        PRIMARY
        KEY
        AUTOINCREMENT,
        usuario_id
        INTEGER
        NOT
        NULL,
        joya_id
        INTEGER
        NOT
        NULL,
        fecha_agregado
        TIMESTAMP
        DEFAULT
        CURRENT_TIMESTAMP,
        UNIQUE
                 (
        usuario_id,
        joya_id
                 ))''')

    if c.execute("SELECT COUNT(*) FROM joyas").fetchone()[0] == 0:
        c.executemany("INSERT INTO joyas (nombre, descripcion, precio, material, tipo, stock) VALUES (?,?,?,?,?,?)", [
            ('Anillo Solitario', 'Elegante anillo con diamante central de 1ct', 1299.99, 'Oro Blanco', 'anillo', 15),
            ('Collar Perlas', 'Collar clásico de perlas cultivadas', 459.50, 'Plata', 'collar', 30)
        ])
    if c.execute("SELECT COUNT(*) FROM usuarios WHERE email='admin@diamondplanets.com'").fetchone()[0] == 0:
        c.execute("INSERT INTO usuarios (nombre_usuario, email, contrasena, dinero) VALUES (?,?,?,?)",
                  ('admin', 'admin@diamondplanets.com', hashlib.sha256('admin123'.encode()).hexdigest(), 5000.00))
    conn.commit()
    conn.close()


init_db()


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization')
        if not auth or not auth.startswith('Bearer '):
            return jsonify({'message': 'Token requerido'}), 401
        try:
            payload = jwt.decode(auth.split(' ')[1], SECRET_KEY, algorithms=['HS256'])
        except:
            return jsonify({'message': 'Token inválido'}), 401
        return f(payload, *args, **kwargs)

    return decorated


def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(user, *args, **kwargs):
        if user.get('role') != 'admin':
            return jsonify({'message': 'Acceso denegado'}), 403
        return f(user, *args, **kwargs)

    return decorated


# ================= API REST =================
@app.route('/api/auth/register', methods=['POST'])
def api_register():
    data = request.get_json()
    if not all(k in data for k in ['nombre_usuario', 'email', 'contrasena']):
        return jsonify({'message': 'Faltan campos obligatorios'}), 400
    hashed = hashlib.sha256(data['contrasena'].encode()).hexdigest()
    conn = get_db()
    try:
        conn.execute('INSERT INTO usuarios (nombre_usuario, email, contrasena) VALUES (?, ?, ?)',
                     (data['nombre_usuario'], data['email'], hashed))
        conn.commit()
        return jsonify({'message': 'Registro exitoso'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'message': 'El usuario o email ya están registrados'}), 409
    finally:
        conn.close()


@app.route('/api/auth/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('contrasena'):
        return jsonify({'message': 'Email y contraseña requeridos'}), 400
    hashed = hashlib.sha256(data['contrasena'].encode()).hexdigest()
    conn = get_db()
    user = conn.execute('SELECT id, email FROM usuarios WHERE email=? AND contrasena=?',
                        (data['email'], hashed)).fetchone()
    conn.close()
    if not user: return jsonify({'message': 'Credenciales incorrectas'}), 401
    role = 'admin' if user['email'] == 'admin@diamondplanets.com' else 'user'
    token = jwt.encode({'userId': user['id'], 'email': user['email'], 'role': role,
                        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)}, SECRET_KEY)
    return jsonify({'token': token, 'role': role, 'userId': user['id']})


@app.route('/api/items', methods=['GET'])
def get_items():
    conn = get_db()
    items = conn.execute(
        'SELECT id, nombre, descripcion, precio, imagen_url, material, tipo, stock FROM joyas WHERE stock > 0').fetchall()
    conn.close()
    return jsonify([dict(i) for i in items]), 200


@app.route('/api/items/<int:item_id>', methods=['GET'])
def get_item_detail(item_id):
    conn = get_db()
    item = conn.execute('SELECT * FROM joyas WHERE id = ?', (item_id,)).fetchone()
    conn.close()
    return jsonify(dict(item)) if item else (jsonify({'message': 'No encontrada'}), 404)


@app.route('/api/items', methods=['POST'])
@admin_required
def create_item(user):
    data = request.get_json()
    if not all(k in data for k in ['nombre', 'precio', 'tipo']):
        return jsonify({'message': 'Faltan campos'}), 400
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO joyas (nombre, descripcion, precio, imagen_url, material, tipo, stock) VALUES (?,?,?,?,?,?,?)",
            (data['nombre'], data.get('descripcion', ''), data['precio'], data.get('imagen_url', '/img/default.jpg'),
             data.get('material', 'Oro'), data['tipo'], data.get('stock', 0)))
        conn.commit()
        return jsonify({'message': 'Creada', 'id': cur.lastrowid}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'message': str(e)}), 500
    finally:
        cur.close(); conn.close()


@app.route('/api/user/favorites', methods=['POST'])
@token_required
def add_favorite(user):
    data = request.get_json()
    joya_id = data.get('joya_id')
    if not joya_id: return jsonify({'message': 'joya_id requerido'}), 400
    conn = get_db()
    try:
        conn.execute('INSERT OR IGNORE INTO favoritos (usuario_id, joya_id) VALUES (?, ?)', (user['userId'], joya_id))
        conn.commit()
        return jsonify({'message': 'Añadido'}), 201
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    finally:
        conn.close()


@app.route('/api/user/favorites', methods=['GET'])
@token_required
def get_favorites(user):
    conn = get_db()
    favs = conn.execute('SELECT j.* FROM favoritos f JOIN joyas j ON f.joya_id = j.id WHERE f.usuario_id = ?',
                        (user['userId'],)).fetchall()
    conn.close()
    return jsonify([dict(f) for f in favs]), 200


@app.route('/api/user/favorites/<int:joya_id>', methods=['DELETE'])
@token_required
def remove_favorite(user, joya_id):
    conn = get_db()
    conn.execute('DELETE FROM favoritos WHERE usuario_id = ? AND joya_id = ?', (user['userId'], joya_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Eliminado de favoritos'}), 200


# ================= SERVIDOR SPA =================
@app.route('/css/<path:filename>')
def serve_css(filename): return send_from_directory(os.path.join(FRONTEND_DIR, 'css'), filename)


@app.route('/js/<path:filename>')
def serve_js(filename): return send_from_directory(os.path.join(FRONTEND_DIR, 'js'), filename)


@app.route('/app.js')
@app.route('/api.js')
def serve_root_js(): return send_from_directory(FRONTEND_DIR, request.path.lstrip('/'))

@app.route('/img/<path:filename>')
def serve_img(filename):
    return send_from_directory(os.path.join(FRONTEND_DIR, 'img'), filename)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def spa_fallback(path):
    return send_from_directory(FRONTEND_DIR, 'index.html')

if __name__ == '__main__':
    print(f"✅ Servidor: http://localhost:5000")
    print(f"🗄️ BD: {DB_FILE}")
    app.run(debug=True, port=5000)