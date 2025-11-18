const { getConnection } = require("../config/db");

// Asegura que la tabla 'reclamo' exista para los entornos donde el SQL base no la creó
async function ensureTableExists(conn) {
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS reclamo (
      id INT(11) NOT NULL AUTO_INCREMENT,
      cliente_id INT(11) NOT NULL,
      descripcion TEXT DEFAULT NULL,
      estado VARCHAR(20) DEFAULT 'Pendiente',
      fecha_creacion DATE NOT NULL,
      fecha_resolucion DATE DEFAULT NULL,
      PRIMARY KEY (id),
      KEY idx_reclamo_cliente (cliente_id),
      CONSTRAINT reclamo_ibfk_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
}

// Obtener todos los reclamos
async function getAll() {
  const conn = await getConnection();
  try {
    await ensureTableExists(conn);
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
    await ensureTableExists(conn);
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
    await ensureTableExists(conn);
    const { cliente_id, descripcion, estado, fecha_creacion } = data;
    
    if (!cliente_id) {
      throw new Error("cliente_id es obligatorio");
    }

    await conn.execute(
      `INSERT INTO reclamo (cliente_id, descripcion, estado, fecha_creacion)
       VALUES (?, ?, ?, ?)`,
      [cliente_id, descripcion ?? null, (estado ?? "Pendiente"), (fecha_creacion ? new Date(fecha_creacion) : new Date())]
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
    await ensureTableExists(conn);
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
