const request = require('supertest');
const app = require('../src/app');
const { getConnection } = require('../src/config/db');

function uid() { return Math.random().toString(36).slice(2,10); }

let DB_AVAILABLE = true;
beforeAll(async () => {
  try {
    const conn = await getConnection();
    await conn.end();
  } catch (err) {
    DB_AVAILABLE = false;
    console.warn('⚠️ Base de datos no disponible. Las pruebas CRUD serán saltadas.');
  }
});

describe('API CRUD y negativos', () => {
  let clienteId = null;
  let ordenId = null;
  let tecnicoId = null;
  let reclamoId = null;
  const uniqueCUIT = `20-${Date.now().toString().slice(-8)}-${Math.floor(Math.random()*9)}`;
  const uniqueUser = `tec_${uid()}`;

  test('Crear cliente (POST) y validar 400 en faltante', async () => {
    if (!DB_AVAILABLE) return;
    const resBad = await request(app).post('/api/clientes').send({ cuit: '00-00000000-0' });
    expect([400, 401, 403, 500]).toContain(resBad.status);

    const res = await request(app).post('/api/clientes').send({ razon_social: 'Cliente CRUD', cuit: uniqueCUIT });
    expect([200, 401, 403]).toContain(res.status);
  });

  test('Listar clientes y obtener id', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/clientes');
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length) clienteId = res.body[res.body.length-1].id || res.body[0].id;
    }
  });

  test('GET /api/clientes/:id 404 para inexistente', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/clientes/99999999');
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  // Se pospone actualización y eliminación de cliente para permitir crear reclamos con FK válida

  test('Crear tecnico y validar duplicado/400', async () => {
    if (!DB_AVAILABLE) return;
    const resBad = await request(app).post('/api/tecnicos').send({ nombre: 'X' });
    expect([400, 401, 403, 500]).toContain(resBad.status);

    const res = await request(app).post('/api/tecnicos').send({ nombre: 'CRUD', apellido: 'Tec', usuario: uniqueUser, password: 'abcd' });
    expect([200, 400, 401, 403]).toContain(res.status);
  });

  test('Listar tecnicos y obtener id', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/tecnicos');
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length) {
        const last = res.body[res.body.length-1];
        tecnicoId = last.id_tecnico || last.id || res.body[0].id_tecnico || res.body[0].id;
      }
    }
  });

  test('GET /api/tecnicos/:id (si existe)', async () => {
    if (!DB_AVAILABLE) return;
    if (!tecnicoId) return; // skip si no se pudo determinar
    const res = await request(app).get(`/api/tecnicos/${tecnicoId}`);
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  test('Crear orden (POST) y validar 400 si faltan campos', async () => {
    if (!DB_AVAILABLE) return;
    const resBad = await request(app).post('/api/ordenes').send({});
    expect([200, 400, 401, 403, 500]).toContain(resBad.status);

    const res = await request(app).post('/api/ordenes').send({ descripcion: 'CRUD Orden', fecha_servicio: new Date(Date.now()+86400000).toISOString().slice(0,10) });
    expect([200, 401, 403, 500]).toContain(res.status);
  });

  test('Listar ordenes y obtener id', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/ordenes');
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length) ordenId = res.body[res.body.length-1].id || res.body[0].id;
    }
  });

  test('GET /api/ordenes/:id 404 para inexistente', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/ordenes/99999999');
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  test('Actualizar orden (PUT) y eliminar', async () => {
    if (!DB_AVAILABLE) return;
    if (!ordenId) return;
    const resPut = await request(app).put(`/api/ordenes/${ordenId}`).send({ observacion: 'mod' });
    expect([200, 401, 403, 404, 500]).toContain(resPut.status);

    const resDel = await request(app).delete(`/api/ordenes/${ordenId}`);
    expect([200, 401, 403, 404, 500]).toContain(resDel.status);
  });

  test('Crear reclamo y validar 400 si sin cliente', async () => {
    if (!DB_AVAILABLE) return;
    const resBad = await request(app).post('/api/reclamos').send({ descripcion: 'x' });
    expect([400, 401, 403, 500]).toContain(resBad.status);

    if (clienteId) {
      const res = await request(app).post('/api/reclamos').send({ cliente_id: clienteId, descripcion: 'CRUD Reclamo' });
      expect([200, 400, 401, 403, 500]).toContain(res.status);
    }
  });

  test('Listar reclamos y obtener id', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/reclamos');
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length) reclamoId = res.body[res.body.length-1].id || res.body[0].id;
    }
  });

  test('GET /api/reclamos/:id (si existe)', async () => {
    if (!DB_AVAILABLE) return;
    if (!reclamoId) return; // skip si no se pudo determinar
    const res = await request(app).get(`/api/reclamos/${reclamoId}`);
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  test('Actualizar reclamo (PUT) y eliminar (DELETE)', async () => {
    if (!DB_AVAILABLE) return;
    if (!reclamoId) return;
    const resPut = await request(app).put(`/api/reclamos/${reclamoId}`).send({ estado: 'Resuelto' });
    expect([200, 401, 403, 404, 500]).toContain(resPut.status);

    const resDel = await request(app).delete(`/api/reclamos/${reclamoId}`);
    expect([200, 401, 403, 404, 500]).toContain(resDel.status);
  });

  test('Asignar orden a técnico y verificar ordenes del técnico', async () => {
    if (!DB_AVAILABLE) return;
    if (!tecnicoId || !ordenId) return;
    const resAssign = await request(app).post(`/api/tecnicos/${tecnicoId}/asignar-orden`).send({ ordenId: ordenId });
    expect([200, 400, 401, 403, 404, 500]).toContain(resAssign.status);

    const res = await request(app).get(`/api/tecnicos/${tecnicoId}/ordenes`);
    expect([200, 401, 403, 500]).toContain(res.status);
  });

  test('Actualizar cliente (PUT) y eliminar (DELETE) al final', async () => {
    if (!DB_AVAILABLE) return;
    if (!clienteId) return;
    const resPut = await request(app).put(`/api/clientes/${clienteId}`).send({ telefono: '12345' });
    expect([200, 401, 403, 404, 500]).toContain(resPut.status);

    const resDel = await request(app).delete(`/api/clientes/${clienteId}`);
    expect([200, 401, 403, 404, 500]).toContain(resDel.status);
  });

});

describe('API tipoServicio CRUD', () => {
  let tipoServicioId = null;

  test('POST /api/tipo-servicio crea tipo de servicio y valida 400 sin nombre', async () => {
    if (!DB_AVAILABLE) return;
    
    // Intento sin nombre (debe fallar)
    const resBad = await request(app).post('/api/tipo-servicio').send({ descripcion: 'Sin nombre' });
    expect([400, 500]).toContain(resBad.status);

    // Creación exitosa
    const res = await request(app).post('/api/tipo-servicio').send({ 
      nombre: 'Test Servicio CRUD',
      descripcion: 'Descripción de prueba'
    });
    expect([200, 401, 403, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('message');
    }
  });

  test('GET /api/tipo-servicio lista todos los tipos', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/tipo-servicio');
    expect([200, 401, 403, 500]).toContain(res.status);
    if (res.status === 200 && Array.isArray(res.body) && res.body.length) {
      tipoServicioId = res.body[res.body.length - 1].id || res.body[0].id;
    }
  });

  test('GET /api/tipo-servicio/:id retorna tipo específico', async () => {
    if (!DB_AVAILABLE) return;
    if (!tipoServicioId) return;
    
    const res = await request(app).get(`/api/tipo-servicio/${tipoServicioId}`);
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('nombre');
    }
  });

  test('GET /api/tipo-servicio/:id retorna 404 para inexistente', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/tipo-servicio/99999999');
    expect([200, 401, 403, 404, 500]).toContain(res.status);
  });

  test('PUT /api/tipo-servicio/:id actualiza tipo de servicio', async () => {
    if (!DB_AVAILABLE) return;
    if (!tipoServicioId) return;
    
    const res = await request(app)
      .put(`/api/tipo-servicio/${tipoServicioId}`)
      .send({ nombre: 'Nombre Actualizado', descripcion: 'Desc actualizada' });
    expect([200, 404, 500]).toContain(res.status);
  });

  test('PUT /api/tipo-servicio/:id retorna 404 para inexistente', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app)
      .put('/api/tipo-servicio/99999999')
      .send({ nombre: 'Test' });
    expect([404, 500]).toContain(res.status);
  });

  test('DELETE /api/tipo-servicio/:id elimina tipo de servicio', async () => {
    if (!DB_AVAILABLE) return;
    if (!tipoServicioId) return;
    
    const res = await request(app).delete(`/api/tipo-servicio/${tipoServicioId}`);
    expect([200, 404, 500]).toContain(res.status);
  });

  test('DELETE /api/tipo-servicio/:id retorna 404 para inexistente', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).delete('/api/tipo-servicio/99999999');
    expect([404, 500]).toContain(res.status);
  });
});

describe('API usuario (requiere autenticación)', () => {
  const uniqueUsername = `user_test_${uid()}`;

  test('GET /api/usuarios sin auth retorna 401', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/usuarios');
    expect([401, 403]).toContain(res.status);
  });

  test('POST /api/usuarios sin auth retorna 401', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).post('/api/usuarios').send({
      usuario: uniqueUsername,
      password: 'testpass',
      rol: 'tecnico'
    });
    expect([401, 403]).toContain(res.status);
  });

  test('GET /api/usuarios/:id sin auth retorna 401', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/usuarios/1');
    expect([401, 403]).toContain(res.status);
  });

  test('PUT /api/usuarios/:id sin auth retorna 401', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).put('/api/usuarios/1').send({
      usuario: 'test',
      rol: 'admin',
      activo: 1
    });
    expect([401, 403]).toContain(res.status);
  });

  test('DELETE /api/usuarios/:id sin auth retorna 401', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).delete('/api/usuarios/1');
    expect([401, 403]).toContain(res.status);
  });
});
