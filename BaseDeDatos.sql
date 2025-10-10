-- Base de datos para sistema de gestión de órdenes de servicio
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS proyecto;
USE proyecto;

-- Tabla de usuarios para autenticación
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    rol ENUM('admin', 'tecnico', 'usuario') DEFAULT 'usuario',
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    razon_social VARCHAR(200) NOT NULL,
    cuit VARCHAR(20) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    nombre_contacto VARCHAR(100),
    apellido_contacto VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE
);

-- Tabla de órdenes de servicio
CREATE TABLE IF NOT EXISTS orden_servicio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    descripcion TEXT,
    observacion TEXT,
    estado ENUM('pendiente', 'en_proceso', 'completada', 'cancelada') DEFAULT 'pendiente',
    prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
    fecha_creacion DATE NOT NULL,
    fecha_servicio DATE,
    fecha_completado TIMESTAMP NULL,
    tecnico_asignado VARCHAR(100),
    costo DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_cliente_cuit ON cliente(cuit);
CREATE INDEX idx_cliente_razon_social ON cliente(razon_social);
CREATE INDEX idx_orden_cliente ON orden_servicio(cliente_id);
CREATE INDEX idx_orden_estado ON orden_servicio(estado);
CREATE INDEX idx_orden_fecha_servicio ON orden_servicio(fecha_servicio);
CREATE INDEX idx_usuario_username ON usuario(usuario);

-- Insertar usuario administrador por defecto


-- Opcional agregar clientes y ordenes  


-- Insertar algunos datos de ejemplo
INSERT INTO cliente (razon_social, cuit, telefono, email, nombre_contacto, apellido_contacto) VALUES
('Empresa ABC S.A.', '20-12345678-9', '011-1234-5678', 'contacto@empresaabc.com', 'Juan', 'Pérez'),
('Comercial XYZ Ltda.', '30-87654321-0', '011-8765-4321', 'ventas@comercialxyz.com', 'María', 'González'),
('Servicios Técnicos SRL', '27-11223344-5', '011-1122-3344', 'info@serviciostecnicos.com', 'Carlos', 'Rodríguez');

INSERT INTO orden_servicio (cliente_id, descripcion, estado, prioridad, fecha_creacion, fecha_servicio) VALUES
(1, 'Mantenimiento preventivo de equipos informáticos', 'pendiente', 'media', '2024-01-15', '2024-01-20'),
(2, 'Reparación de servidor principal', 'en_proceso', 'alta', '2024-01-16', '2024-01-18'),
(3, 'Instalación de nuevo sistema de red', 'pendiente', 'baja', '2024-01-17', '2024-01-25');
