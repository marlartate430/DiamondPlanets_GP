CREATE DATABASE IF NOT EXISTS Diamond_planets;
USE Diamond_planets;

-- -----------------------------------------------------
-- Tabla: usuarios
-- Contiene la información de inicio de sesión y el dinero
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    dinero DECIMAL(12, 2) DEFAULT 0.00,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Tabla: joyas_compradas
-- Relaciona a los usuarios con las joyas (de la API) que han comprado
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS joyas_compradas (
    usuario_id INT NOT NULL,
    diamante_id INT NOT NULL,
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(usuario_id, diamante_id)

    CONSTRAINT fk_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Datos de prueba
-- -----------------------------------------------------
INSERT INTO usuarios (nombre_usuario, email, contrasena, dinero)
VALUES ('usuario_demo', 'demo@email.com', 'hash_de_la_contrasena', 5000.00);

INSERT INTO joyas_compradas (usuario_id, diamante_id, precio_compra)
VALUES (1, 1, 326.00);