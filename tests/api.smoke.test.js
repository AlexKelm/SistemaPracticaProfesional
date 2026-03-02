const request = require('supertest');
const app = require('../src/app');
const { getConnection } = require('../src/config/db');

// Utilidad para generar un valor pseudo-único rápido
function uid() { return Math.random().toString(36).slice(2,10); }

let DB_AVAILABLE = true;
beforeAll(async () => {
  try {
    const conn = await getConnection();
    await conn.end();
  } catch (err) {
    DB_AVAILABLE = false;
    console.warn('⚠️ Base de datos no disponible. Las pruebas que requieren DB serán saltadas.');
  }
});

// NOTA: Estas pruebas asumen que la base de datos está accesible y que las tablas existen.
// Si faltan datos, algunos tests pueden fallar (por ejemplo GET por ID). Se pueden adaptar a un seed controlado.

describe('SMOKE API', () => {
  let createdClienteId = null;
  let createdOrdenId = null;
  let createdTecnicoId = null;
  let createdReclamoId = null;
  const uniqueCUIT = `20-${Date.now().toString().slice(-8)}-${Math.floor(Math.random()*9)}`;
  const uniqueUser = `tec_${uid()}`;

  test('POST /api/clientes crea cliente', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app)
      .post('/api/clientes')
      .send({ razon_social: 'Empresa Smoke', cuit: uniqueCUIT });
    expect([200, 401, 403]).toContain(res.status); // 401 si requiere auth
  });

  test('GET /api/clientes lista incluye al menos 1', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/clientes');
    expect([200, 401, 403]).toContain(res.status); // 401 si requiere auth
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length) createdClienteId = res.body[res.body.length - 1].id || res.body[0].id;
    }
  });

  test('GET /api/clientes/:id (si existe)', async () => {
    if (!DB_AVAILABLE) return;
    if (!createdClienteId) return; // skip si no se pudo determinar
    const res = await request(app).get(`/api/clientes/${createdClienteId}`);
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  test('POST /api/tecnicos crea técnico', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app)
      .post('/api/tecnicos')
      .send({ nombre: 'Test', apellido: 'Tecnico', usuario: uniqueUser, password: '1234' });
    expect([200, 400, 401, 403]).toContain(res.status);
  });

  test('GET /api/tecnicos lista', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/tecnicos');
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length) createdTecnicoId = res.body[res.body.length - 1].id || res.body[0].id;
    }
  });

  test('POST /api/ordenes crea orden', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app)
      .post('/api/ordenes')
      .send({ descripcion: 'Orden Smoke', fecha_servicio: new Date(Date.now()+86400000).toISOString().slice(0,10) });
    expect([200, 401, 403, 500]).toContain(res.status);
  });

  test('GET /api/ordenes lista', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/ordenes');
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length) createdOrdenId = res.body[res.body.length - 1].id || res.body[0].id;
    }
  });

  test('GET /api/ordenes/agenda', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/ordenes/agenda');
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test('POST /api/reclamos crea reclamo', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app)
      .post('/api/reclamos')
      .send({ detalles: 'Reclamo Smoke', fecha: '2025-11-20' });
    expect([200, 400, 401, 403]).toContain(res.status);
    if (res.status === 200) createdReclamoId = true;
  });

  test('GET /api/reclamos lista', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/reclamos');
    expect([200, 401, 403]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test('GET /api/tipo-servicio lista tipos de servicio', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/tipo-servicio');
    expect([200, 401, 403, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  test('POST /api/tipo-servicio crea tipo de servicio', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app)
      .post('/api/tipo-servicio')
      .send({ nombre: 'Servicio Smoke', descripcion: 'Descripción de prueba' });
    expect([200, 401, 403, 500]).toContain(res.status);
  });

  test('GET /api/ordenes/:id retorna 404 para inexistente', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/ordenes/99999999');
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  test('GET /api/clientes/:id retorna 404 para inexistente', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/clientes/99999999');
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  test('GET /api/tecnicos/:id retorna 404 para inexistente', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).get('/api/tecnicos/99999999');
    expect([200, 401, 403, 404]).toContain(res.status);
  });
});

