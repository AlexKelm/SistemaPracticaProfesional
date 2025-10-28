const { getConnection } = require("../config/db");

// Obtener todos los reclamos
async function getAll() {
  const conn = await getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT r.*, c.razon_social 
       FROM reclamo r 
       JOIN cliente c ON r.cliente_id = c.id`
    );
    return rows;
  } finally {
    await conn.end();
  }
}

// Obtener reclamo por ID
async function getById(id) {
  const conn = await getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT * FROM reclamo WHERE id = ?",
      [id]
    );
    return rows[0];
  } finally {
    await conn.end();
  }
}

// Crear reclamo
async function create(data) {
  const conn = await getConnection();
  try {
    const { cliente_id, descripcion, estado, fecha_creacion } = data;
    
    if (!cliente_id) {
      throw new Error("cliente_id es obligatorio");
    }

    await conn.execute(
      `INSERT INTO reclamo (cliente_id, descripcion, estado, fecha_creacion)
       VALUES (?, ?, ?, ?)`,
      [cliente_id, descripcion, estado || "Pendiente", fecha_creacion || new Date()]
    );
  } finally {
    await conn.end();
  }
}

// Actualizar reclamo
async function update(id, data) {
  const conn = await getConnection();
  try {
    const { descripcion, estado, fecha_resolucion } = data;
    
    const [result] = await conn.execute(
      `UPDATE reclamo 
       SET descripcion = ?, estado = ?, fecha_resolucion = ? 
       WHERE id = ?`,
      [descripcion ?? null, estado ?? null, fecha_resolucion ?? null, id]
    );
    return result;
  } finally {
    await conn.end();
  }
}

// Eliminar reclamo
async function remove(id) {
  const conn = await getConnection();
  try {
    const [result] = await conn.execute(
      "DELETE FROM reclamo WHERE id = ?",
      [id]
    );
    return result;
  } finally {
    await conn.end();
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
