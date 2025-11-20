const { getConnection } = require("../config/db");

// Obtener todos los clientes con sus datos de persona
async function getAll() {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    `SELECT 
      c.id, 
      c.razon_social, 
      c.cuit, 
      c.fecha_creacion, 
      c.activo,
      p.id AS persona_id,
      p.nombre, 
      p.apellido, 
      p.email, 
      p.telefono
     FROM cliente c
     JOIN persona p ON c.persona_id = p.id
     ORDER BY c.razon_social`
  );
  await conn.end();
  return rows;
}

// Obtener cliente por ID con sus datos de persona
async function getById(id) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    `SELECT 
      c.id, 
      c.razon_social, 
      c.cuit, 
      c.fecha_creacion, 
      c.activo,
      p.id AS persona_id,
      p.nombre, 
      p.apellido, 
      p.email, 
      p.telefono
     FROM cliente c
     JOIN persona p ON c.persona_id = p.id
     WHERE c.id = ?`,
    [id]
  );
  await conn.end();
  return rows[0];
}

// Crear cliente (primero crea persona, luego cliente)
async function create(data) {
  const conn = await getConnection();
  try {
    const { razon_social, cuit, nombre, apellido, telefono, email } = data;
    
    // Validar obligatorios
    if (!razon_social || !cuit) {
      throw new Error("Razón social y CUIT son obligatorios");
    }

    // 1) Crear persona del cliente
    const [personaResult] = await conn.execute(
      `INSERT INTO persona (nombre, apellido, email, telefono) VALUES (?, ?, ?, ?)`,
      [nombre || 'Sin nombre', apellido || 'Sin apellido', email || null, telefono || null]
    );
    const persona_id = personaResult.insertId;

    // 2) Crear cliente
    const [result] = await conn.execute(
      `INSERT INTO cliente (persona_id, razon_social, cuit) VALUES (?, ?, ?)`,
      [persona_id, razon_social, cuit]
    );
    
    return result;
  } finally {
    await conn.end();
  }
}

// Actualizar cliente (actualiza datos en persona)
async function update(id, data) {
  const conn = await getConnection();
  try {
    const { razon_social, cuit, nombre, apellido, telefono, email } = data;

    // 1) Obtener persona_id del cliente
    const [clienteRows] = await conn.execute(`SELECT persona_id FROM cliente WHERE id = ?`, [id]);
    if (!clienteRows.length) {
      throw new Error("Cliente no encontrado");
    }
    const persona_id = clienteRows[0].persona_id;

    // 2) Actualizar datos de persona
    if (nombre !== undefined || apellido !== undefined || telefono !== undefined || email !== undefined) {
      const updates = [];
      const valores = [];
      if (nombre !== undefined) { updates.push('nombre = ?'); valores.push(nombre); }
      if (apellido !== undefined) { updates.push('apellido = ?'); valores.push(apellido); }
      if (email !== undefined) { updates.push('email = ?'); valores.push(email); }
      if (telefono !== undefined) { updates.push('telefono = ?'); valores.push(telefono); }
      
      if (updates.length > 0) {
        valores.push(persona_id);
        await conn.execute(`UPDATE persona SET ${updates.join(', ')} WHERE id = ?`, valores);
      }
    }

    // 3) Actualizar datos de cliente
    if (razon_social !== undefined || cuit !== undefined) {
      const updates = [];
      const valores = [];
      if (razon_social !== undefined) { updates.push('razon_social = ?'); valores.push(razon_social); }
      if (cuit !== undefined) { updates.push('cuit = ?'); valores.push(cuit); }
      
      if (updates.length > 0) {
        valores.push(id);
        const [result] = await conn.execute(`UPDATE cliente SET ${updates.join(', ')} WHERE id = ?`, valores);
        return result;
      }
    }

    return { affectedRows: 1 };
  } finally {
    await conn.end();
  }
}

// Eliminar cliente
async function remove(id) {
  const conn = await getConnection();
  const [result] = await conn.execute(
    "DELETE FROM cliente WHERE id = ?",
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
