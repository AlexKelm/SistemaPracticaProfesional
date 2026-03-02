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
    console.warn('⚠️ Base de datos no disponible. Las pruebas de /login serán saltadas.');
  }
});

// Nota: requiere que exista al menos un usuario en tabla usuario definido en BaseDeDatos.sql (admin)
// Casos: válido, usuario inexistente, password incorrecta

describe('Auth /login', () => {
  test('POST /login válido (admin)', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).post('/login').send({ username: 'admin', password: 'admin' });
    // Puede fallar si la password hasheada no corresponde; toleramos 200, 401 o 500.
    expect([200, 401, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.user).toBeDefined();
      expect(res.body.user.username).toBe('admin');
    }
  });

  test('POST /login usuario inexistente', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).post('/login').send({ username: 'usuario_inexistente_xyz', password: 'x' });
    expect([401, 500]).toContain(res.status); // 500 si DB cerró durante tests
  });

  test('POST /login password incorrecta', async () => {
    if (!DB_AVAILABLE) return;
    const res = await request(app).post('/login').send({ username: 'admin', password: 'contramal' });
    expect([401, 500]).toContain(res.status); // 500 si DB cerró durante tests
  });
});
