const { getConnection } = require("../config/db");

// Obtener todos los técnicos
async function getAll() {
  
  try {
    const conn = await getConnection();
    
    
    const query = "SELECT id_tecnico, nombre, apellido, usuario, email, especialidad, telefono, activo, fecha_creacion FROM tecnico";
    
    
    const [rows] = await conn.execute(query);
    
    
    await conn.end();
    
    return rows;
  } catch (error) {
    console.error('❌ [tecnicoModel] Error en getAll():', error);
    throw error;
  }
}

// Obtener técnico por ID
async function getById(id) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    "SELECT id_tecnico, nombre, apellido, usuario, email, especialidad, telefono, activo, fecha_creacion FROM tecnico WHERE id_tecnico = ?",
    [id]
  );
  await conn.end();
  return rows[0];
}

// Crear técnico
async function create(data) {
  const conn = await getConnection();
  const { nombre, apellido, usuario, password, email, especialidad, telefono, direccion } = data;
  
  // Validar obligatorios
  if (!nombre || !apellido || !usuario || !password) {
    throw new Error("Nombre, apellido, usuario y contraseña son obligatorios");
  }

  // Verificar que el usuario no exista
  const [existingUser] = await conn.execute(
    "SELECT id_tecnico FROM tecnico WHERE usuario = ?",
    [usuario]
  );

  if (existingUser.length > 0) {
    throw new Error("El usuario ya existe");
  }

  await conn.execute(
    `INSERT INTO tecnico (nombre, apellido, usuario, password, email, especialidad, telefono, direccion, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
    [nombre, apellido, usuario, password, email, especialidad, telefono, direccion]
  );
  await conn.end();
}

// Actualizar técnico
async function update(id, data) {
  const conn = await getConnection();
  const { nombre, apellido, usuario, email, especialidad, telefono, direccion, activo } = data;

  // Verificar que el técnico existe
  const [existingTecnico] = await conn.execute(
    "SELECT id_tecnico FROM tecnico WHERE id_tecnico = ?",
    [id]
  );

  if (existingTecnico.length === 0) {
    throw new Error("Técnico no encontrado");
  }

  // Si se está cambiando el usuario, verificar que no exista
  if (usuario) {
    const [existingUser] = await conn.execute(
      "SELECT id_tecnico FROM tecnico WHERE usuario = ? AND id_tecnico != ?",
      [usuario, id]
    );

    if (existingUser.length > 0) {
      throw new Error("El usuario ya existe");
    }
  }

  // Convertir undefined a null para evitar errores de MySQL
  const valores = [
    nombre ?? null,
    apellido ?? null,
    usuario ?? null,
    email ?? null,
    especialidad ?? null,
    telefono ?? null,
    direccion ?? null,
    activo ?? null,
    id
  ];

  const [result] = await conn.execute(
    `UPDATE tecnico 
     SET nombre = ?, apellido = ?, usuario = ?, email = ?, especialidad = ?, telefono = ?, direccion = ?, activo = ? 
     WHERE id_tecnico = ?`,
    valores
  );
  await conn.end();
  return result;
}

// Eliminar técnico (marcar como inactivo)
async function remove(id) {
  const conn = await getConnection();
  const [result] = await conn.execute(
    "UPDATE tecnico SET activo = FALSE WHERE id_tecnico = ?",
    [id]
  );
  await conn.end();
  return result;
}

// Obtener órdenes asignadas a un técnico
async function getOrdenesAsignadas(tecnicoId) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    `SELECT o.*, c.razon_social, c.telefono, c.email
     FROM orden_servicio o
     JOIN cliente c ON o.cliente_id = c.id
     WHERE o.tecnico_asignado = (
       SELECT CONCAT(nombre, ' ', apellido) FROM tecnico WHERE id_tecnico = ?
     )`,
    [tecnicoId]
  );
  await conn.end();
  return rows;
}

// Asignar técnico a una orden
async function asignarOrden(ordenId, tecnicoId) {
  const conn = await getConnection();
  
  // Obtener nombre completo del técnico
  const [tecnico] = await conn.execute(
    "SELECT CONCAT(nombre, ' ', apellido) as nombre_completo FROM tecnico WHERE id_tecnico = ?",
    [tecnicoId]
  );

  if (tecnico.length === 0) {
    throw new Error("Técnico no encontrado");
  }

  const [result] = await conn.execute(
    "UPDATE orden_servicio SET tecnico_asignado = ? WHERE id = ?",
    [tecnico[0].nombre_completo, ordenId]
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
