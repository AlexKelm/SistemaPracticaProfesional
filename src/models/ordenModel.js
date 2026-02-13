const { getConnection } = require("../config/db");

// Obtener todas las órdenes con joins actualizados
async function getAll() {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    `SELECT 
      o.id,
      o.cliente_id,
      o.observacion,
      o.estado,
      o.prioridad,
      o.fecha_creacion,
      o.fecha_servicio,
      o.fecha_completado,
      o.costo,
      o.tipo_servicio_id,
      o.tecnico_id,
      o.reclamos_id,
      c.razon_social,
      ts.detalle AS tipo_servicio_detalle,
      CONCAT(pt.nombre, ' ', pt.apellido) AS tecnico_nombre
     FROM orden_servicio o
     JOIN cliente c ON o.cliente_id = c.id
     LEFT JOIN tipo_servicio ts ON o.tipo_servicio_id = ts.id
     LEFT JOIN tecnico t ON o.tecnico_id = t.id
     LEFT JOIN persona pt ON t.persona_id = pt.id`
  );
  return rows;
}

// Obtener orden por ID
async function getById(id) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    `SELECT 
      o.*,
      c.razon_social,
      ts.detalle AS tipo_servicio_detalle,
      CONCAT(pt.nombre, ' ', pt.apellido) AS tecnico_nombre
     FROM orden_servicio o
     JOIN cliente c ON o.cliente_id = c.id
     LEFT JOIN tipo_servicio ts ON o.tipo_servicio_id = ts.id
     LEFT JOIN tecnico t ON o.tecnico_id = t.id
     LEFT JOIN persona pt ON t.persona_id = pt.id
     WHERE o.id = ?`,
    [id]
  );
  return rows[0];
}

// Crear orden (requiere cliente_id, tipo_servicio_id, tecnico_id, reclamos_id)
async function create(data) {
  const conn = await getConnection();
  try {
    data = data || {};
    let { cliente_id, observacion, estado, prioridad, fecha_creacion, fecha_servicio, costo, tipo_servicio_id, tecnico_id, reclamos_id } = data;

    // Defaults para campos obligatorios si faltan
    if (!cliente_id) {
      const [clientes] = await conn.execute("SELECT id FROM cliente LIMIT 1");
      if (clientes.length) cliente_id = clientes[0].id;
    }
    
    // tipo_servicio_id y reclamos_id son opcionales si las tablas no existen aún
    if (!tipo_servicio_id) {
      try {
        const [tipos] = await conn.execute("SELECT id FROM tipo_servicio LIMIT 1");
        if (tipos.length) tipo_servicio_id = tipos[0].id;
      } catch (err) {
        // Tabla no existe, crear un valor dummy o hacer NULL
        tipo_servicio_id = null;
      }
    }
    
    if (!tecnico_id) {
      const [tecnicos] = await conn.execute("SELECT id FROM tecnico LIMIT 1");
      if (tecnicos.length) tecnico_id = tecnicos[0].id;
    }
    
    if (!reclamos_id) {
      try {
        const [reclamos] = await conn.execute("SELECT id FROM reclamos LIMIT 1");
        if (reclamos.length) reclamos_id = reclamos[0].id;
      } catch (err) {
        // Tabla no existe, crear un valor dummy o hacer NULL
        reclamos_id = null;
      }
    }
    
    if (!fecha_creacion) {
      fecha_creacion = new Date().toISOString().slice(0,10);
    }

    estado = estado ?? 'pendiente';
    prioridad = prioridad ?? 'media';
    costo = costo ?? 0.00;

    // Validar solo cliente_id y fecha_creacion como obligatorios
    if (!cliente_id || !fecha_creacion) {
      throw new Error("cliente_id y fecha_creacion son obligatorios");
    }

    // Verificar que el cliente existe
    const [clienteExists] = await conn.execute("SELECT id FROM cliente WHERE id = ?", [cliente_id]);
    if (clienteExists.length === 0) {
      throw new Error(`El cliente con id ${cliente_id} no existe en la base de datos`);
    }

    // Construir query dinámicamente según qué campos están disponibles
    const campos = ['cliente_id', 'observacion', 'estado', 'prioridad', 'fecha_creacion', 'costo'];
    const valores = [cliente_id, observacion ?? null, estado, prioridad, fecha_creacion, costo];
    
    if (fecha_servicio !== undefined) {
      campos.push('fecha_servicio');
      valores.push(fecha_servicio);
    }
    
    // Solo agregar FKs si existen y no son null
    if (tipo_servicio_id !== null && tipo_servicio_id !== undefined) {
      campos.push('tipo_servicio_id');
      valores.push(tipo_servicio_id);
    }
    
    if (tecnico_id !== null && tecnico_id !== undefined) {
      campos.push('tecnico_id');
      valores.push(tecnico_id);
    }
    
    if (reclamos_id !== null && reclamos_id !== undefined) {
      campos.push('reclamos_id');
      valores.push(reclamos_id);
    }

    const placeholders = campos.map(() => '?').join(', ');
    const query = `INSERT INTO orden_servicio (${campos.join(', ')}) VALUES (${placeholders})`;
    
    await conn.execute(query, valores);
  } catch (error) {
    throw error;
  }
}

// Actualizar orden
async function update(id, data) {
  const conn = await getConnection();
  let { cliente_id, observacion, estado, prioridad, fecha_creacion, fecha_servicio, costo, tipo_servicio_id, tecnico_id, reclamos_id } = data;
  
  const updates = [];
  const valores = [];

  if (cliente_id !== undefined) { updates.push('cliente_id = ?'); valores.push(cliente_id); }
  if (observacion !== undefined) { updates.push('observacion = ?'); valores.push(observacion); }
  if (estado !== undefined) { updates.push('estado = ?'); valores.push(estado); }
  if (prioridad !== undefined) { updates.push('prioridad = ?'); valores.push(prioridad); }
  if (fecha_creacion !== undefined) { updates.push('fecha_creacion = ?'); valores.push(fecha_creacion); }
  if (fecha_servicio !== undefined) { updates.push('fecha_servicio = ?'); valores.push(fecha_servicio); }
  if (costo !== undefined) { updates.push('costo = ?'); valores.push(costo); }
  if (tipo_servicio_id !== undefined) { updates.push('tipo_servicio_id = ?'); valores.push(tipo_servicio_id); }
  if (tecnico_id !== undefined) { updates.push('tecnico_id = ?'); valores.push(tecnico_id); }
  if (reclamos_id !== undefined) { updates.push('reclamos_id = ?'); valores.push(reclamos_id); }

  if (updates.length === 0) {
    return { affectedRows: 0 };
  }

  valores.push(id);
  const [result] = await conn.execute(
    `UPDATE orden_servicio SET ${updates.join(', ')} WHERE id = ?`,
    valores
  );
  return result;
}

// Eliminar orden
async function remove(id) {
  const conn = await getConnection();
  const [result] = await conn.execute(
    "DELETE FROM orden_servicio WHERE id = ?",
    [id]
  );
  return result;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
