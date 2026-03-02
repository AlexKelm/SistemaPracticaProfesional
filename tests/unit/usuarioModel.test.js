let mockExecute, mockEnd;

jest.mock('../../src/config/db', () => ({
  getConnection: jest.fn(() => Promise.resolve({ execute: mockExecute, end: mockEnd }))
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((plain, hashed) => {
    // Simula comparación: si hashed empieza con "hashed_[plain]", es correcto
    return Promise.resolve(hashed === `hashed_${plain}`);
  })
}));

const usuarioModel = require('../../src/models/usuarioModel');
const bcrypt = require('bcryptjs');

describe('usuarioModel', () => {
  beforeEach(() => {
    mockExecute = jest.fn();
    mockEnd = jest.fn().mockResolvedValue();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByUsername', () => {
    test('retorna usuario existente y activo', async () => {
      const mockData = [{
        id_usuario: 1,
        username: 'admin',
        password_hash: 'hashed_admin',
        rol: 'admin',
        activo: 1
      }];
      mockExecute.mockResolvedValueOnce([mockData]);

      const user = await usuarioModel.findByUsername('admin');

      expect(user).toHaveProperty('username', 'admin');
      expect(user).toHaveProperty('rol', 'admin');
      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT id_usuario, usuario as username, password as password_hash, rol, activo FROM usuario WHERE usuario = ? AND activo = 1',
        ['admin']
      );
    });

    test('retorna undefined si usuario no existe', async () => {
      mockExecute.mockResolvedValueOnce([[]]);

      const user = await usuarioModel.findByUsername('noexiste');

      expect(user).toBeUndefined();
    });

    test('retorna undefined si usuario está inactivo', async () => {
      // La consulta ya filtra por activo = 1, así que retornaría vacío
      mockExecute.mockResolvedValueOnce([[]]);

      const user = await usuarioModel.findByUsername('inactivo');

      expect(user).toBeUndefined();
    });
  });

  describe('create', () => {
    test('crea usuario con todos los parámetros', async () => {
      mockExecute.mockResolvedValueOnce([{ insertId: 5, affectedRows: 1 }]);

      const result = await usuarioModel.create('nuevo_user', 'password123', 'admin');

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result.insertId).toBe(5);
      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT INTO usuario (usuario, password, rol, activo) VALUES (?, ?, ?, 1)',
        ['nuevo_user', 'hashed_password123', 'admin']
      );
    });

    test('crea usuario con rol por defecto (tecnico)', async () => {
      mockExecute.mockResolvedValueOnce([{ insertId: 6, affectedRows: 1 }]);

      const result = await usuarioModel.create('tecnico1', 'pass');

      expect(result.insertId).toBe(6);
      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT INTO usuario (usuario, password, rol, activo) VALUES (?, ?, ?, 1)',
        ['tecnico1', 'hashed_pass', 'tecnico']
      );
    });

    test('hashea la contraseña correctamente', async () => {
      mockExecute.mockResolvedValueOnce([{ insertId: 7 }]);

      await usuarioModel.create('user', 'mypassword', 'tecnico');

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
    });
  });

  describe('verifyPassword', () => {
    test('retorna true cuando la contraseña es correcta', async () => {
      const isValid = await usuarioModel.verifyPassword('password123', 'hashed_password123');

      expect(isValid).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password123');
    });

    test('retorna false cuando la contraseña es incorrecta', async () => {
      const isValid = await usuarioModel.verifyPassword('wrong', 'hashed_password123');

      expect(isValid).toBe(false);
    });

    test('retorna false cuando hash no coincide', async () => {
      const isValid = await usuarioModel.verifyPassword('test', 'different_hash');

      expect(isValid).toBe(false);
    });
  });

  describe('getAll', () => {
    test('retorna lista de todos los usuarios', async () => {
      const mockData = [
        { id_usuario: 1, usuario: 'admin', rol: 'admin', activo: 1, fecha_creacion: '2025-01-01' },
        { id_usuario: 2, usuario: 'tecnico1', rol: 'tecnico', activo: 1, fecha_creacion: '2025-01-02' },
        { id_usuario: 3, usuario: 'tecnico2', rol: 'tecnico', activo: 0, fecha_creacion: '2025-01-03' }
      ];
      mockExecute.mockResolvedValueOnce([mockData]);

      const rows = await usuarioModel.getAll();

      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBe(3);
      expect(rows[0]).toHaveProperty('usuario');
      expect(rows[0]).toHaveProperty('rol');
      // Verifica que no incluya password
      expect(rows[0]).not.toHaveProperty('password');
      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT id_usuario, usuario, rol, activo, fecha_creacion FROM usuario ORDER BY id_usuario DESC'
      );
    });

    test('retorna array vacío si no hay usuarios', async () => {
      mockExecute.mockResolvedValueOnce([[]]);

      const rows = await usuarioModel.getAll();

      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBe(0);
    });
  });

  describe('getById', () => {
    test('retorna usuario por ID sin password', async () => {
      const mockData = [{
        id_usuario: 5,
        usuario: 'testuser',
        rol: 'tecnico',
        activo: 1,
        fecha_creacion: '2025-01-10'
      }];
      mockExecute.mockResolvedValueOnce([mockData]);

      const user = await usuarioModel.getById(5);

      expect(user).toHaveProperty('id_usuario', 5);
      expect(user).toHaveProperty('usuario', 'testuser');
      expect(user).not.toHaveProperty('password');
      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT id_usuario, usuario, rol, activo, fecha_creacion FROM usuario WHERE id_usuario = ?',
        [5]
      );
    });

    test('retorna undefined si usuario no existe', async () => {
      mockExecute.mockResolvedValueOnce([[]]);

      const user = await usuarioModel.getById(999);

      expect(user).toBeUndefined();
    });
  });

  describe('update', () => {
    test('actualiza usuario sin cambiar password', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await usuarioModel.update(3, {
        usuario: 'updated_user',
        rol: 'admin',
        activo: 1
      });

      expect(result.affectedRows).toBe(1);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE usuario SET usuario = ?, rol = ?, activo = ? WHERE id_usuario = ?',
        ['updated_user', 'admin', 1, 3]
      );
    });

    test('actualiza usuario cambiando también el password', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await usuarioModel.update(3, {
        usuario: 'updated_user',
        rol: 'admin',
        activo: 1,
        password: 'newpassword'
      });

      expect(result.affectedRows).toBe(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE usuario SET usuario = ?, rol = ?, activo = ?, password = ? WHERE id_usuario = ?',
        ['updated_user', 'admin', 1, 'hashed_newpassword', 3]
      );
    });

    test('hashea nueva contraseña correctamente', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await usuarioModel.update(1, {
        usuario: 'user',
        rol: 'tecnico',
        activo: 1,
        password: 'secretpass'
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('secretpass', 10);
    });

    test('retorna 0 affectedRows si usuario no existe', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const result = await usuarioModel.update(999, {
        usuario: 'test',
        rol: 'tecnico',
        activo: 1
      });

      expect(result.affectedRows).toBe(0);
    });
  });

  describe('deleteUser', () => {
    test('realiza soft delete (activo = 0)', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await usuarioModel.deleteUser(5);

      expect(result.affectedRows).toBe(1);
      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE usuario SET activo = 0 WHERE id_usuario = ?',
        [5]
      );
    });

    test('retorna 0 affectedRows si usuario no existe', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);

      const result = await usuarioModel.deleteUser(999);

      expect(result.affectedRows).toBe(0);
    });

    test('no elimina registros de la tabla (soft delete)', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      await usuarioModel.deleteUser(3);

      // Verifica que usó UPDATE, no DELETE
      const call = mockExecute.mock.calls[0][0];
      expect(call).toContain('UPDATE');
      expect(call).not.toContain('DELETE FROM');
    });
  });
});
