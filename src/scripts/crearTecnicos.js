const bcrypt = require('bcrypt');
const { getConnection } = require('../config/db');

async function crearTecnicos() {
  const tecnicos = [
    {
      nombre: 'Carlos',
      apellido: 'López',
      usuario: 'carlos.lopez',
      password: 'tecnico123',
      email: 'carlos.lopez@empresa.com',
      especialidad: 'Electricidad',
      telefono: '3764-123456'
    },
    {
      nombre: 'María',
      apellido: 'González',
      usuario: 'maria.gonzalez',
      password: 'tecnico123',
      email: 'maria.gonzalez@empresa.com',
      especialidad: 'Electrónica',
      telefono: '3764-234567'
    },
    {
      nombre: 'Roberto',
      apellido: 'Martínez',
      usuario: 'roberto.martinez',
      password: 'tecnico123',
      email: 'roberto.martinez@empresa.com',
      especialidad: 'Informática',
      telefono: '3764-345678'
    },
    {
      nombre: 'Ana',
      apellido: 'Silva',
      usuario: 'ana.silva',
      password: 'tecnico123',
      email: 'ana.silva@empresa.com',
      especialidad: 'Redes',
      telefono: '3764-456789'
    }
  ];

  try {
    const conn = await getConnection();
    
    for (const tecnico of tecnicos) {
      try {
        // Verificar si el usuario ya existe
        const [existing] = await conn.execute(
          'SELECT id_tecnico FROM tecnico WHERE usuario = ?',
          [tecnico.usuario]
        );

        if (existing.length > 0) {
          console.log(`⚠️  Técnico ${tecnico.usuario} ya existe, saltando...`);
          continue;
        }

        const passwordHash = await bcrypt.hash(tecnico.password, 10);
        
        await conn.execute(
          `INSERT INTO tecnico (nombre, apellido, usuario, password, email, especialidad, telefono, activo)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [tecnico.nombre, tecnico.apellido, tecnico.usuario, passwordHash, tecnico.email, tecnico.especialidad, tecnico.telefono]
        );
        
        console.log(`✅ Técnico ${tecnico.nombre} ${tecnico.apellido} creado correctamente`);
      } catch (err) {
        console.error(`❌ Error al crear técnico ${tecnico.usuario}:`, err.message);
      }
    }
    
    await conn.end();
    console.log('🎉 Proceso de creación de técnicos completado');
  } catch (err) {
    console.error('❌ Error general:', err);
  }
}

crearTecnicos();
