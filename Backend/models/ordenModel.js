const { getConnection } = require("../config/db");

// Obtener todas las órdenes
async function getAll() {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    `SELECT o.*, c.razon_social
     FROM orden_servicio o
     JOIN cliente c ON o.cliente_id = c.id`
  );
  await conn.end();
  return rows;
}

// Obtener orden por ID
async function getById(id) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    "SELECT * FROM orden_servicio WHERE id = ?",
    [id]
  );
  await conn.end();
  return rows[0];
}

// Crear orden
async function create(data) {
  const conn = await getConnection();
  let cliente_id = data.cliente_id ?? data.id_cliente ?? null;
  let descripcion = data.descripcion ?? data.observacion ?? null;
  let { estado, prioridad, fecha_creacion, fecha_servicio } = data;

  // Validar obligatorios
  if (!cliente_id || !fecha_creacion) {
    throw new Error("cliente_id y fecha_creacion son obligatorios");
  }

  await conn.execute(
    `INSERT INTO orden_servicio (cliente_id, descripcion, estado, prioridad, fecha_creacion, fecha_servicio)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [cliente_id, descripcion, estado, prioridad, fecha_creacion, fecha_servicio]
  );
  await conn.end();
}

// Actualizar orden
async function update(id, data) {
  const conn = await getConnection();
  let { cliente_id, observacion, estado, prioridad, fecha_creacion, fecha_servicio } = data;
  // Convertir undefined a null
  [cliente_id, observacion, estado, prioridad, fecha_creacion, fecha_servicio] =
    [cliente_id, observacion, estado, prioridad, fecha_creacion, fecha_servicio].map(v => v === undefined ? null : v);

  const [result] = await conn.execute(
    `UPDATE orden_servicio SET cliente_id = ?, observacion = ?, estado = ?, prioridad = ?, fecha_creacion = ?, fecha_servicio = ?
     WHERE id = ?`,
    [cliente_id, observacion, estado, prioridad, fecha_creacion, fecha_servicio, id]
  );
  await conn.end();
  return result;
}

// Eliminar orden
async function remove(id) {
  const conn = await getConnection();
  const [result] = await conn.execute(
    "DELETE FROM orden_servicio WHERE id = ?",
    [id]
  );
  await conn.end();
  return result;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};