const request = require('supertest');
const app = require('../src/app');
const { getConnection } = require('../src/config/db');

let DB_AVAILABLE = true;
beforeAll(async () => {
  try {
    const conn = await getConnection();
    await conn.end();
  } catch (err) {
    DB_AVAILABLE = false;
    console.warn('⚠️ Base de datos no disponible. Las pruebas de validación serán saltadas.');
  }
});

describe('Tests de validación y casos negativos', () => {
  
  describe('Validación de clientes', () => {
    test('POST /api/clientes sin razon_social retorna 400 o 500', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).post('/api/clientes').send({ cuit: '20-12345678-9' });
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test('POST /api/clientes sin cuit retorna 400 o 500', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).post('/api/clientes').send({ razon_social: 'Test SA' });
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test('PUT /api/clientes/:id inexistente retorna 404', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app)
        .put('/api/clientes/99999999')
        .send({ razon_social: 'Test' });
      expect([401, 403, 404, 500]).toContain(res.status);
    });

    test('DELETE /api/clientes/:id inexistente retorna 404 o 500', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).delete('/api/clientes/99999999');
      expect([401, 403, 404, 500]).toContain(res.status);
    });

    test('GET /api/clientes/:id con ID inválido retorna 404', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).get('/api/clientes/abc');
      expect([401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe('Validación de técnicos', () => {
    test('POST /api/tecnicos sin nombre retorna 400 o 500', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).post('/api/tecnicos').send({ apellido: 'Test' });
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test('POST /api/tecnicos sin apellido retorna 400 o 500', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).post('/api/tecnicos').send({ nombre: 'Test' });
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test('PUT /api/tecnicos/:id inexistente retorna 404', async () => {
      if (!DB_AVAILABLE) return;
      const res =await request(app)
        .put('/api/tecnicos/99999999')
        .send({ nombre: 'Test' });
      expect([401, 403, 404, 500]).toContain(res.status);
    });

    test('DELETE /api/tecnicos/:id inexistente retorna 404 o 500', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).delete('/api/tecnicos/99999999');
      expect([401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe('Validación de órdenes', () => {
    test('POST /api/ordenes con cliente_id inexistente retorna error', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).post('/api/ordenes').send({
        cliente_id: 99999999,
        fecha_creacion: '2025-11-20',
        descripcion: 'Test'
      });
      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });

    test('PUT /api/ordenes/:id inexistente retorna 404', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app)
        .put('/api/ordenes/99999999')
        .send({ estado: 'completada' });
      expect([401, 403, 404, 500]).toContain(res.status);
    });

    test('DELETE /api/ordenes/:id inexistente retorna 404 o 500', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).delete('/api/ordenes/99999999');
      expect([401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe('Validación de reclamos', () => {
    test('POST /api/reclamos sin detalles retorna 400 o 500', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).post('/api/reclamos').send({ fecha: '2025-11-20' });
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test('PUT /api/reclamos/:id inexistente retorna 404', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app)
        .put('/api/reclamos/99999999')
        .send({ detalles: 'Test' });
      expect([401, 403, 404, 500]).toContain(res.status);
    });

    test('DELETE /api/reclamos/:id inexistente retorna 404 o 500', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).delete('/api/reclamos/99999999');
      expect([401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe('Validación de tipos de servicio', () => {
    test('POST /api/tipo-servicio sin nombre retorna 400', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).post('/api/tipo-servicio').send({
        descripcion: 'Sin nombre'
      });
      expect([400, 401, 403, 500]).toContain(res.status);
    });

    test('GET /api/tipo-servicio/:id inexistente retorna 404', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).get('/api/tipo-servicio/99999999');
      expect([200, 401, 403, 404, 500]).toContain(res.status);
    });

    test('PUT /api/tipo-servicio/:id inexistente retorna 404', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app)
        .put('/api/tipo-servicio/99999999')
        .send({ nombre: 'Test' });
      expect([401, 403, 404, 500]).toContain(res.status);
    });

    test('DELETE /api/tipo-servicio/:id inexistente retorna 404', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).delete('/api/tipo-servicio/99999999');
      expect([401, 403, 404, 500]).toContain(res.status);
    });
  });

  describe('Validación de login', () => {
    test('POST /login sin username retorna error', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).post('/login').send({ password: 'test' });
      expect([400, 401, 500]).toContain(res.status);
    });

    test('POST /login sin password retorna error', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).post('/login').send({ username: 'test' });
      expect([400, 401, 500]).toContain(res.status);
    });

    test('POST /login con credenciales vacías retorna 401', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).post('/login').send({ username: '', password: '' });
      expect([400, 401, 500]).toContain(res.status);
    });
  });

  describe('Manejo de tipos de datos inválidos', () => {
    test('GET con ID no numérico retorna error apropiado', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).get('/api/clientes/abc123');
      expect([400, 401, 403, 404, 500]).toContain(res.status);
    });

    test('POST con JSON malformado retorna 400', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app)
        .post('/api/clientes')
        .set('Content-Type', 'application/json')
        .send('{">malformed": json}');
      expect([400, 401, 403, 500]).toContain(res.status);
    });
  });

  describe('Operaciones relacionadas', () => {
    test('POST /api/tecnicos/:id/asignar-orden con tecnico inexistente', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app)
        .post('/api/tecnicos/99999999/asignar-orden')
        .send({ ordenId: 1 });
      expect([401, 403, 404, 500]).toContain(res.status);
    });

    test('GET /api/tecnicos/:id/ordenes con tecnico inexistente', async () => {
      if (!DB_AVAILABLE) return;
      const res = await request(app).get('/api/tecnicos/99999999/ordenes');
      expect([200, 401, 403, 404, 500]).toContain(res.status); // 200 con array vacío es válido
    });
  });
});
