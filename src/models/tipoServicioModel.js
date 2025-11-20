const { getConnection } = require("../config/db");

// Obtener todos los tipos de servicio
async function getAll() {
  const conn = await getConnection();
  const [rows] = await conn.execute("SELECT * FROM tipo_servicio");
  await conn.end();
  return rows;
}

// Obtener tipo de servicio por ID
async function getById(id) {
  const conn = await getConnection();
  const [rows] = await conn.execute("SELECT * FROM tipo_servicio WHERE id = ?", [id]);
  await conn.end();
  return rows[0];
}

// Crear tipo de servicio
async function create(tipoServicio) {
  const { nombre, descripcion } = tipoServicio;
  if (!nombre) {
    throw new Error("Nombre es obligatorio");
  }
  const conn = await getConnection();
  const [result] = await conn.execute(
    "INSERT INTO tipo_servicio (nombre, descripcion) VALUES (?, ?)",
    [nombre, descripcion || null]
  );
  await conn.end();
  return result;
}

// Actualizar tipo de servicio
async function update(id, tipoServicio) {
  const { nombre, descripcion } = tipoServicio;
  const conn = await getConnection();
  const [result] = await conn.execute(
    "UPDATE tipo_servicio SET nombre = ?, descripcion = ? WHERE id = ?",
    [nombre, descripcion || null, id]
  );
  await conn.end();
  return result;
}

// Eliminar tipo de servicio
async function remove(id) {
  const conn = await getConnection();
  const [result] = await conn.execute("DELETE FROM tipo_servicio WHERE id = ?", [id]);
  await conn.end();
  return result;
}

module.exports = { getAll, getById, create, update, remove };
