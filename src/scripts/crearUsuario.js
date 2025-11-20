const bcrypt = require("bcrypt");
const { getConnection } = require("../config/db");

async function crearUsuario() {
  const usuario = "admin";
  const passwordPlano = "admin123";
  const rol = "admin";

  try {
    const passwordHash = await bcrypt.hash(passwordPlano, 10);
    const conn = await getConnection();
    
    // Verificar si el usuario ya existe
    const [existing] = await conn.execute(
      "SELECT id_usuario FROM usuario WHERE usuario = ?",
      [usuario]
    );

    if (existing.length > 0) {
      console.log(`⚠️  Usuario '${usuario}' ya existe`);
      await conn.end();
      return;
    }

    // Insertar en la tabla usuario (esquema actual sin nombre/apellido/email)
    await conn.execute(
      `INSERT INTO usuario (usuario, password, rol, activo)
       VALUES (?, ?, ?, 1)`,
      [usuario, passwordHash, rol]
    );
    
    console.log("✅ Usuario admin creado correctamente");
    console.log("   Usuario: admin");
    console.log("   Contraseña: admin123");
    console.log("   Rol: admin");
    
    await conn.end();
  } catch (err) {
    console.error("❌ Error al crear usuario:", err);
    process.exit(1);
  }
}

crearUsuario();
