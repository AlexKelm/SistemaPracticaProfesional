const fetch = require('node-fetch');

async function testTecnicosEndpoint() {
  console.log('🧪 Iniciando prueba del endpoint de técnicos...');
  
  try {
    console.log('📡 Realizando petición a http://localhost:3000/tecnicos...');
    const response = await fetch('http://localhost:3000/tecnicos');
    
    console.log('📊 Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('📋 Datos recibidos:', data);
    console.log('📊 Cantidad de técnicos:', data.length);
    
    if (data.length === 0) {
      console.log('⚠️ No hay técnicos en la base de datos');
      console.log('💡 Ejecuta: node scripts/crearTecnicos.js para crear técnicos de ejemplo');
    } else {
      console.log('✅ Endpoint funcionando correctamente');
      data.forEach((tecnico, index) => {
        console.log(`🔧 Técnico ${index + 1}:`, {
          id: tecnico.id_usuario,
          nombre: tecnico.nombre,
          apellido: tecnico.apellido,
          usuario: tecnico.usuario,
          email: tecnico.email,
          activo: tecnico.activo
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('❌ Stack trace:', error.stack);
  }
}

// Ejecutar la prueba
testTecnicosEndpoint();
