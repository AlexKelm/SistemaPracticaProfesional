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

// Obtener todos los usuarios
async function getAll() {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    "SELECT id_usuario, usuario, rol, activo, fecha_creacion FROM usuario ORDER BY id_usuario DESC"
  );
  return rows;
}

// Obtener usuario por ID
async function getById(id) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    "SELECT id_usuario, usuario, rol, activo, fecha_creacion FROM usuario WHERE id_usuario = ?",
    [id]
  );
  return rows[0];
}

// Actualizar usuario
async function update(id, { usuario, rol, activo, password }) {
  const conn = await getConnection();
  
  // Si se proporciona una nueva contraseña, hashearla
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await conn.execute(
      "UPDATE usuario SET usuario = ?, rol = ?, activo = ?, password = ? WHERE id_usuario = ?",
      [usuario, rol, activo, hashedPassword, id]
    );
    return result;
  } else {
    const [result] = await conn.execute(
      "UPDATE usuario SET usuario = ?, rol = ?, activo = ? WHERE id_usuario = ?",
      [usuario, rol, activo, id]
    );
    return result;
  }
}

// Eliminar usuario (soft delete)
async function deleteUser(id) {
  const conn = await getConnection();
  const [result] = await conn.execute(
    "UPDATE usuario SET activo = 0 WHERE id_usuario = ?",
    [id]
  );
  return result;
}

module.exports = { findByUsername, create, verifyPassword, getAll, getById, update, deleteUser };