const { getConnection } = require("../config/db");

async function fixTecnicoForeignKey() {
  const conn = await getConnection();
  try {
    console.log("🔧 Arreglando foreign key de orden_servicio -> tecnico...\n");

    // 1) Hacer tecnico_id nullable (permitir NULL)
    console.log("1️⃣ Haciendo tecnico_id nullable...");
    await conn.execute(`
      ALTER TABLE orden_servicio 
      MODIFY tecnico_id INT NULL
    `);
    console.log("✅ tecnico_id ahora permite NULL\n");

    // 2) Crear foreign key con ON DELETE SET NULL
    console.log("2️⃣ Creando foreign key con ON DELETE SET NULL...");
    await conn.execute(`
      ALTER TABLE orden_servicio 
      ADD CONSTRAINT fk_orden_tecnico 
      FOREIGN KEY (tecnico_id) 
      REFERENCES tecnico(id) 
      ON DELETE SET NULL 
      ON UPDATE CASCADE
    `);
    console.log("✅ Foreign key creada\n");

    console.log("🎉 ¡Listo! Ahora puedes eliminar técnicos sin problemas.");
    console.log("   Las órdenes asignadas quedarán con tecnico_id = NULL");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await conn.end();
    process.exit(0);
  }
}

fixTecnicoForeignKey();
