const { getConnection } = require("../config/db");

(async () => {
  const conn = await getConnection();
  try {
    console.log("=== Tablas que referencian a 'persona' ===");
    const [fks] = await conn.execute(`
      SELECT 
        TABLE_NAME, 
        CONSTRAINT_NAME, 
        COLUMN_NAME,
        REFERENCED_COLUMN_NAME
      FROM information_schema.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_NAME = 'persona' 
        AND TABLE_SCHEMA = 'proyecto_test'
    `);
    console.table(fks);

    console.log("\n=== Estructura de tabla persona_referencia (si existe) ===");
    try {
      const [personaRef] = await conn.execute('DESCRIBE persona_referencia');
      console.table(personaRef);
    } catch (e) {
      console.log("Tabla persona_referencia no existe");
    }
  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    await conn.end();
    process.exit(0);
  }
})();
