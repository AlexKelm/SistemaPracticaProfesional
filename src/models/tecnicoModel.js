const { getConnection } = require("../config/db");
const logger = require("../config/logger");

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
    return rows;
  } catch (error) {
    logger.error({ error: error.message }, "[tecnicoModel] Error en getAll()");
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
  } catch (error) {
    throw error;
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
  } catch (error) {
    throw error;
  }
}

// Eliminar técnico (primero obtiene persona_id, luego elimina técnico y persona)
async function remove(id) {
  const conn = await getConnection();
  try {
    logger.debug({ tecnicoId: id, type: typeof id }, "Intentando eliminar técnico");
    
    // 1) Obtener persona_id antes de eliminar
    const [tecnicoRows] = await conn.execute(
      "SELECT persona_id FROM tecnico WHERE id = ?",
      [id]
    );
    
    logger.debug({ result: tecnicoRows }, "Resultado de búsqueda técnico");
    
    if (!tecnicoRows.length) {
      throw new Error("Técnico no encontrado");
    }
    
    const persona_id = tecnicoRows[0].persona_id;
    logger.debug({ persona_id }, "Técnico encontrado");
    
    // 2) Eliminar técnico (esto elimina en cascada referencias si las hay)
    await conn.execute("DELETE FROM tecnico WHERE id = ?", [id]);
    logger.debug("Técnico eliminado");
    
    // 3) Eliminar persona asociada
    const [result] = await conn.execute("DELETE FROM persona WHERE id = ?", [persona_id]);
    logger.debug("Persona eliminada");
    
    return result;
  } catch (error) {
    throw error;
  }
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
