const { getConnection } = require("../config/db");
const bcrypt = require("bcryptjs");

// Buscar usuario por username
async function findByUsername(username) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    "SELECT id_usuario, usuario as username, password as password_hash, rol, activo FROM usuario WHERE usuario = ? AND activo = 1",
    [username]
  );
  return rows[0];
}

// Crear usuario
async function create(username, password, rol = 'tecnico') {
  const conn = await getConnection();
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await conn.execute(
    "INSERT INTO usuario (usuario, password, rol, activo) VALUES (?, ?, ?, 1)",
    [username, hashedPassword, rol]
  );
  return result;
}

// Verificar contraseña
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = { findByUsername, create, verifyPassword };