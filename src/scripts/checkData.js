const { getConnection } = require("../config/db");

async function checkData() {
  try {
    const conn = await getConnection();
    
    console.log("\n=== Clientes en la BD ===");
    const [clientes] = await conn.execute("SELECT id, razon_social, cuit FROM cliente LIMIT 10");
    if (clientes.length === 0) {
      console.log("⚠️  No hay clientes en la base de datos");
    } else {
      console.table(clientes);
    }
    
    console.log("\n=== Técnicos en la BD ===");
    const [tecnicos] = await conn.execute("SELECT id FROM tecnico LIMIT 10");
    if (tecnicos.length === 0) {
      console.log("⚠️  No hay técnicos en la base de datos");
    } else {
      console.log(`✅ ${tecnicos.length} técnico(s) encontrado(s)`);
    }
    
    console.log("\n=== Tipos de Servicio ===");
    const [tipos] = await conn.execute("SELECT id, detalle FROM tipo_servicio LIMIT 10");
    if (tipos.length === 0) {
      console.log("⚠️  No hay tipos de servicio en la base de datos");
    } else {
      console.table(tipos);
    }
    
    console.log("\n=== Reclamos ===");
    const [reclamos] = await conn.execute("SELECT id, detalles FROM reclamos LIMIT 10");
    if (reclamos.length === 0) {
      console.log("⚠️  No hay reclamos en la base de datos");
    } else {
      console.table(reclamos);
    }
    
    await conn.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkData();
