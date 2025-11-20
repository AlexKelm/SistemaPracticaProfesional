const { getConnection } = require("../config/db");

async function checkTables() {
  try {
    const conn = await getConnection();
    
    console.log("\n=== Tabla cliente ===");
    const [clienteCols] = await conn.execute("DESCRIBE cliente");
    console.table(clienteCols.map(c => ({ Field: c.Field, Type: c.Type, Key: c.Key })));
    
    console.log("\n=== Tabla tecnico ===");
    const [tecnicoCols] = await conn.execute("DESCRIBE tecnico");
    console.table(tecnicoCols.map(c => ({ Field: c.Field, Type: c.Type, Key: c.Key })));
    
    console.log("\n=== Tabla tipo_servicio (si existe) ===");
    try {
      const [tipoCols] = await conn.execute("DESCRIBE tipo_servicio");
      console.table(tipoCols.map(c => ({ Field: c.Field, Type: c.Type, Key: c.Key })));
    } catch (err) {
      console.log("❌ Tabla no existe:", err.message);
    }
    
    console.log("\n=== Tabla reclamos ===");
    try {
      const [reclamoCols] = await conn.execute("DESCRIBE reclamos");
      console.table(reclamoCols.map(c => ({ Field: c.Field, Type: c.Type, Key: c.Key })));
    } catch (err) {
      console.log("❌ Tabla no existe:", err.message);
    }
    
    console.log("\n=== Tabla orden_servicio ===");
    const [ordenCols] = await conn.execute("DESCRIBE orden_servicio");
    console.table(ordenCols.map(c => ({ Field: c.Field, Type: c.Type, Key: c.Key })));
    
    await conn.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkTables();
