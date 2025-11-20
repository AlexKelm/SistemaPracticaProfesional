const { getConnection } = require("../config/db");

async function checkReclamos() {
  try {
    const conn = await getConnection();
    
    console.log("\n=== Estructura de la tabla reclamos ===");
    const [columns] = await conn.execute("DESCRIBE reclamos");
    console.table(columns);
    
    console.log("\n=== Datos en reclamos ===");
    const [reclamos] = await conn.execute("SELECT * FROM reclamos");
    console.table(reclamos);
    
    console.log("\n=== Campo reclamos_id en orden_servicio ===");
    const [ordenStruct] = await conn.execute("DESCRIBE orden_servicio");
    const reclamosIdField = ordenStruct.find(f => f.Field === 'reclamos_id');
    console.table([reclamosIdField]);
    
    console.log("\n✅ Análisis:");
    if (reclamosIdField) {
      console.log(`- El campo reclamos_id en orden_servicio es: ${reclamosIdField.Null === 'YES' ? '✅ NULLABLE (puede ser NULL)' : '❌ NOT NULL (obligatorio)'}`);
    }
    
    await conn.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

checkReclamos();
