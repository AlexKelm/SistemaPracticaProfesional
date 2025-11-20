const { getConnection } = require("../config/db");

async function crearTecnicos() {
  const tecnicos = [
    {
      nombre: "Carlos",
      apellido: "López",
      email: "carlos.lopez@empresa.com",
      telefono: "3764-123456",
      direccion: "Av. Libertador 1234, Posadas"
    },
    {
      nombre: "María",
      apellido: "González",
      email: "maria.gonzalez@empresa.com",
      telefono: "3764-234567",
      direccion: "San Martín 567, Posadas"
    },
    {
      nombre: "Roberto",
      apellido: "Martínez",
      email: "roberto.martinez@empresa.com",
      telefono: "3764-345678",
      direccion: "Mitre 890, Posadas"
    },
    {
      nombre: "Ana",
      apellido: "Silva",
      email: "ana.silva@empresa.com",
      telefono: "3764-456789",
      direccion: "Belgrano 234, Posadas"
    },
  ];

  try {
    const conn = await getConnection();

    for (const tecnico of tecnicos) {
      try {
        // Verificar si la persona ya existe por email
        const [existingPersona] = await conn.execute(
          "SELECT id FROM persona WHERE email = ?",
          [tecnico.email]
        );

        let personaId;

        if (existingPersona.length > 0) {
          personaId = existingPersona[0].id;
          
          // Verificar si ya es técnico
          const [existingTecnico] = await conn.execute(
            "SELECT id FROM tecnico WHERE persona_id = ?",
            [personaId]
          );

          if (existingTecnico.length > 0) {
            console.log(`⚠️  Técnico ${tecnico.nombre} ${tecnico.apellido} (${tecnico.email}) ya existe, saltando...`);
            continue;
          }
        } else {
          // Crear persona (sin direccion - la tabla no tiene esa columna)
          const [resultPersona] = await conn.execute(
            `INSERT INTO persona (nombre, apellido, email, telefono)
             VALUES (?, ?, ?, ?)`,
            [
              tecnico.nombre,
              tecnico.apellido,
              tecnico.email,
              tecnico.telefono
            ]
          );
          personaId = resultPersona.insertId;
        }

        // Crear técnico (solo persona_id, sin fecha_creacion)
        await conn.execute(
          `INSERT INTO tecnico (persona_id) VALUES (?)`,
          [personaId]
        );

        console.log(`✅ Técnico ${tecnico.nombre} ${tecnico.apellido} creado correctamente`);
      } catch (err) {
        console.error(`❌ Error al crear técnico ${tecnico.nombre} ${tecnico.apellido}:`, err.message);
      }
    }

    await conn.end();
    console.log("\n✅ Proceso de creación de técnicos completado");
  } catch (err) {
    console.error("❌ Error general:", err);
    process.exit(1);
  }
}

crearTecnicos();
