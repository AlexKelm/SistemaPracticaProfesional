const { getConnection } = require("../config/db");

async function checkOrdenSchema() {
  try {
    const conn = await getConnection();
    
    console.log("\n=== Estructura de la tabla orden_servicio ===");
    const [columns] = await conn.execute("DESCRIBE orden_servicio");
    console.table(columns);
    
    await conn.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkOrdenSchema();
