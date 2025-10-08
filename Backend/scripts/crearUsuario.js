const bcrypt = require('bcrypt');
const { getConnection } = require('../config/db');

async function crearUsuario() {
  const nombre = 'Juan';
  const apellido = 'Pérez';
  const usuario = 'admin';
  const passwordPlano = 'admin123';
  const email = 'admin@localhost';
  const rol = 'admin';

  try {
    const passwordHash = await bcrypt.hash(passwordPlano, 10);
    const conn = await getConnection();
    await conn.execute(
      `INSERT INTO usuario (nombre, apellido, usuario, password, email, rol, activo)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nombre, apellido, usuario, passwordHash, email, rol]
    );
    console.log('Usuario creado correctamente');
    await conn.end();
  } catch (err) {
    console.error('Error al crear usuario:', err);
  }
}

crearUsuario();