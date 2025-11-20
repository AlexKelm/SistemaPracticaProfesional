const { getConnection } = require("../config/db");

async function checkSchema() {
  try {
    const conn = await getConnection();
    
    console.log("\n=== Estructura de la tabla usuario ===");
    const [columns] = await conn.execute("DESCRIBE usuario");
    console.table(columns);
    
    console.log("\n=== Usuarios existentes ===");
    const [users] = await conn.execute("SELECT id_usuario, usuario, rol, activo, fecha_creacion FROM usuario");
    console.table(users);
    
    await conn.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkSchema();
