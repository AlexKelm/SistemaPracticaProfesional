const { getConnection } = require("../config/db");

// Obtener todos los clientes
async function getAll() {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    "SELECT id, razon_social, cuit, telefono, email, CONCAT(nombre_contacto, ' ', apellido_contacto) AS referencia FROM cliente"
  );
  await conn.end();
  return rows;
}

// Obtener cliente por ID
async function getById(id) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    "SELECT *, CONCAT(nombre_contacto, ' ', apellido_contacto) AS referencia FROM cliente WHERE id = ?",
    [id]
  );
  await conn.end();
  return rows[0];
}

// Crear cliente
async function create(data) {
  const conn = await getConnection();
  const { razon_social, cuit, telefono, email, nombre_contacto, apellido_contacto } = data;
  
  // Validar obligatorios
  if (!razon_social || !cuit) {
    throw new Error("Razón social y CUIT son obligatorios");
  }

  // Asegúrate de que ningún valor sea undefined
  const valores = [
    razon_social ?? null,
    cuit ?? null,
    telefono ?? null,
    email ?? null,
    nombre_contacto ?? null,
    apellido_contacto ?? null
  ];

  await conn.execute(
    `INSERT INTO cliente (razon_social, cuit, telefono, email, nombre_contacto, apellido_contacto)
     VALUES (?, ?, ?, ?, ?, ?)`,
    valores
  );
  await conn.end();
}

// Actualizar cliente
async function update(id, data) {
  const conn = await getConnection();
  const { razon_social, cuit, telefono, email, nombre_contacto, apellido_contacto } = data;

  // Convertir undefined a null
  const datos = [razon_social, cuit, telefono, email, nombre_contacto, apellido_contacto].map(v => v === undefined ? null : v);

  const [result] = await conn.execute(
    `UPDATE cliente 
     SET razon_social = ?, cuit = ?, telefono = ?, email = ?, nombre_contacto = ?, apellido_contacto = ? 
     WHERE id = ?`,
    [...datos, id]
  );
  await conn.end();
  return result;
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
