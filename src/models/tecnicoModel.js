const { getConnection } = require("../config/db");

// Obtener todos los técnicos con sus datos de persona
async function getAll() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.execute(
      `SELECT 
        t.id AS id_tecnico,
        p.nombre,
        p.apellido,
        p.email,
        p.telefono,
        t.persona_id
       FROM tecnico t
       JOIN persona p ON t.persona_id = p.id`
    );
    await conn.end();
    return rows;
  } catch (error) {
    console.error('❌ [tecnicoModel] Error en getAll():', error);
    throw error;
  }
}

// Obtener técnico por ID con sus datos de persona
async function getById(id) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    `SELECT 
      t.id AS id_tecnico,
      p.nombre,
      p.apellido,
      p.email,
      p.telefono,
      t.persona_id
     FROM tecnico t
     JOIN persona p ON t.persona_id = p.id
     WHERE t.id = ?`,
    [id]
  );
  await conn.end();
  return rows[0];
}

// Crear técnico (primero crea persona, luego técnico)
async function create(data) {
  const conn = await getConnection();
  try {
    const { nombre, apellido, email, telefono } = data || {};

    // Validar obligatorios
    if (!nombre || !apellido) {
      throw new Error("Nombre y apellido son obligatorios");
    }

    // 1) Crear persona del técnico
    const [personaResult] = await conn.execute(
      `INSERT INTO persona (nombre, apellido, email, telefono) VALUES (?, ?, ?, ?)`,
      [nombre, apellido, email ?? null, telefono ?? null]
    );
    const persona_id = personaResult.insertId;

    // 2) Crear técnico
    await conn.execute(
      `INSERT INTO tecnico (persona_id) VALUES (?)`,
      [persona_id]
    );
  } finally {
    await conn.end();
  }
}

// Actualizar técnico (actualiza datos en persona)
async function update(id, data) {
  const conn = await getConnection();
  try {
    const { nombre, apellido, email, telefono } = data;

    // Obtener persona_id del técnico
    const [tecnicoRows] = await conn.execute(`SELECT persona_id FROM tecnico WHERE id = ?`, [id]);

    if (tecnicoRows.length === 0) {
      throw new Error("Técnico no encontrado");
    }

    const persona_id = tecnicoRows[0].persona_id;

    // Actualizar datos de persona
    const updates = [];
    const valores = [];
    if (nombre !== undefined) { updates.push('nombre = ?'); valores.push(nombre); }
    if (apellido !== undefined) { updates.push('apellido = ?'); valores.push(apellido); }
    if (email !== undefined) { updates.push('email = ?'); valores.push(email); }
    if (telefono !== undefined) { updates.push('telefono = ?'); valores.push(telefono); }
    
    if (updates.length > 0) {
      valores.push(persona_id);
      const [result] = await conn.execute(`UPDATE persona SET ${updates.join(', ')} WHERE id = ?`, valores);
      return result;
    }

    return { affectedRows: 0 };
  } finally {
    await conn.end();
  }
}

// Eliminar técnico
async function remove(id) {
  const conn = await getConnection();
  const [result] = await conn.execute(
    "DELETE FROM tecnico WHERE id = ?",
    [id]
  );
  await conn.end();
  return result;
}

// Obtener órdenes asignadas a un técnico
async function getOrdenesAsignadas(tecnicoId) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    `SELECT o.*, c.razon_social, p.telefono, p.email
     FROM orden_servicio o
     JOIN cliente c ON o.cliente_id = c.id
     JOIN persona p ON c.persona_id = p.id
     WHERE o.tecnico_id = ?`,
    [tecnicoId]
  );
  await conn.end();
  return rows;
}

// Asignar técnico a una orden
async function asignarOrden(ordenId, tecnicoId) {
  const conn = await getConnection();
  
  // Verificar que el técnico exista
  const [tecnico] = await conn.execute(
    "SELECT id FROM tecnico WHERE id = ?",
    [tecnicoId]
  );

  if (tecnico.length === 0) {
    throw new Error("Técnico no encontrado");
  }

  const [result] = await conn.execute(
    "UPDATE orden_servicio SET tecnico_id = ? WHERE id = ?",
    [tecnicoId, ordenId]
  );
  await conn.end();
  return result;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getOrdenesAsignadas,
  asignarOrden
};
