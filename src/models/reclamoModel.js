const { getConnection } = require("../config/db");

// Asegura que la tabla 'reclamos' exista (ya está definida en el esquema, pero mantenemos por compatibilidad)
async function ensureTableExists(conn) {
  // En el nuevo esquema la tabla ya se crea; esta función se deja vacía o se puede eliminar
  // Si querés mantener auto-creación:
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS reclamos (
      id INT NOT NULL AUTO_INCREMENT,
      detalles VARCHAR(400) DEFAULT NULL,
      fecha DATE DEFAULT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB;
  `);
}

// Obtener todos los reclamos
async function getAll() {
  const conn = await getConnection();
  try {
    await ensureTableExists(conn);
    const [rows] = await conn.execute(
      `SELECT r.* FROM reclamos r`
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
    await ensureTableExists(conn);
    const [rows] = await conn.execute(
      "SELECT * FROM reclamos WHERE id = ?",
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
    await ensureTableExists(conn);
    const { detalles, fecha } = data;
    
    if (!detalles) {
      throw new Error("detalles es obligatorio");
    }

    await conn.execute(
      `INSERT INTO reclamos (detalles, fecha)
       VALUES (?, ?)`,
      [detalles, fecha ? new Date(fecha) : new Date()]
    );
  } finally {
    await conn.end();
  }
}

// Actualizar reclamo
async function update(id, data) {
  const conn = await getConnection();
  try {
    await ensureTableExists(conn);
    const { detalles, fecha } = data;
    
    const updates = [];
    const valores = [];
    if (detalles !== undefined) { updates.push('detalles = ?'); valores.push(detalles); }
    if (fecha !== undefined) { updates.push('fecha = ?'); valores.push(fecha); }

    if (updates.length === 0) {
      return { affectedRows: 0 };
    }

    valores.push(id);
    const [result] = await conn.execute(
      `UPDATE reclamos SET ${updates.join(', ')} WHERE id = ?`,
      valores
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
    await ensureTableExists(conn);
    const [result] = await conn.execute(
      "DELETE FROM reclamos WHERE id = ?",
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
