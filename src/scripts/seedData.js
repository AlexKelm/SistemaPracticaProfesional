const { getConnection } = require("../config/db");

async function seedData() {
  try {
    const conn = await getConnection();

    // Seed tipo_servicio
    console.log("\n📝 Creando tipos de servicio...");
    const tiposServicio = [
      { detalle: "Instalación eléctrica", precio: 5000.00 },
      { detalle: "Reparación de equipos", precio: 3000.00 },
      { detalle: "Mantenimiento preventivo", precio: 2500.00 },
      { detalle: "Instalación de red", precio: 4000.00 },
      { detalle: "Consultoría técnica", precio: 3500.00 }
    ];

    for (const tipo of tiposServicio) {
      try {
        await conn.execute(
          `INSERT INTO tipo_servicio (detalle, precio_estimado) VALUES (?, ?)`,
          [tipo.detalle, tipo.precio]
        );
        console.log(`✅ Tipo de servicio creado: ${tipo.detalle}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Tipo de servicio ya existe: ${tipo.detalle}`);
        } else {
          console.error(`❌ Error: ${err.message}`);
        }
      }
    }

    // Seed reclamos
    console.log("\n📝 Creando reclamos de ejemplo...");
    const reclamos = [
      { detalles: "Equipo no enciende después del servicio", fecha: "2025-11-01" },
      { detalles: "Instalación incompleta", fecha: "2025-11-05" },
      { detalles: "Demora en el servicio", fecha: "2025-11-10" },
      { detalles: "Falta de repuestos", fecha: "2025-11-12" },
      { detalles: "Sin reclamo", fecha: "2025-11-18" }
    ];

    for (const reclamo of reclamos) {
      try {
        await conn.execute(
          `INSERT INTO reclamos (detalles, fecha) VALUES (?, ?)`,
          [reclamo.detalles, reclamo.fecha]
        );
        console.log(`✅ Reclamo creado: ${reclamo.detalles}`);
      } catch (err) {
        console.error(`❌ Error: ${err.message}`);
      }
    }

    console.log("\n✅ Seed data completado");
    await conn.end();
  } catch (err) {
    console.error("❌ Error general:", err);
    process.exit(1);
  }
}

seedData();
