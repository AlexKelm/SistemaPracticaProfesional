const { getConnection } = require("../config/db");

async function testOrdenCreation() {
  try {
    const conn = await getConnection();
    
    // Verificar que tengamos un cliente
    const [clientes] = await conn.execute("SELECT id_cliente FROM cliente LIMIT 1");
    if (clientes.length === 0) {
      console.log("⚠️  No hay clientes en la BD. Crea uno primero.");
      await conn.end();
      return;
    }
    
    const cliente_id = clientes[0].id_cliente;
    console.log(`✅ Cliente encontrado: ${cliente_id}`);
    
    // Intentar crear una orden básica
    const fecha_creacion = new Date().toISOString().slice(0, 10);
    
    console.log("\n📝 Creando orden de prueba...");
    await conn.execute(
      `INSERT INTO orden_servicio (cliente_id, observacion, estado, prioridad, fecha_creacion)
       VALUES (?, ?, ?, ?, ?)`,
      [cliente_id, "Orden de prueba - migración", "pendiente", "media", fecha_creacion]
    );
    
    console.log("✅ Orden creada exitosamente");
    
    // Verificar
    const [ordenes] = await conn.execute(
      "SELECT id, cliente_id, observacion, estado, prioridad FROM orden_servicio ORDER BY id DESC LIMIT 1"
    );
    console.table(ordenes);
    
    await conn.end();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

testOrdenCreation();
