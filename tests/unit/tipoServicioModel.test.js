let mockExecute, mockEnd;

jest.mock('../../src/config/db', () => ({
  getConnection: jest.fn(() => Promise.resolve({ execute: mockExecute, end: mockEnd }))
}));

const tipoServicioModel = require('../../src/models/tipoServicioModel');

describe('tipoServicioModel', () => {
  beforeEach(() => {
    mockExecute = jest.fn();
    mockEnd = jest.fn().mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAll', () => {
    test('retorna lista de todos los tipos de servicio', async () => {
      const mockData = [
        { id: 1, nombre: 'Instalación', descripcion: 'Instalación de equipos' },
        { id: 2, nombre: 'Reparación', descripcion: 'Reparación de fallas' },
        { id: 3, nombre: 'Mantenimiento', descripcion: null }
      ];
      mockExecute.mockResolvedValueOnce([mockData]);
      
      const rows = await tipoServicioModel.getAll();
      
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBe(3);
      expect(rows[0]).toHaveProperty('nombre');
      expect(rows[0]).toHaveProperty('descripcion');
      expect(mockExecute).toHaveBeenCalledWith('SELECT * FROM tipo_servicio');
    });

    test('retorna array vacío si no hay tipos de servicio', async () => {
      mockExecute.mockResolvedValueOnce([[]]);
      
      const rows = await tipoServicioModel.getAll();
      
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBe(0);
    });
  });

  describe('getById', () => {
    test('retorna tipo de servicio por ID', async () => {
      const mockData = [{ id: 5, nombre: 'Consultoría', descripcion: 'Servicios de consultoría' }];
      mockExecute.mockResolvedValueOnce([mockData]);
      
      const row = await tipoServicioModel.getById(5);
      
      expect(row).toHaveProperty('id', 5);
      expect(row).toHaveProperty('nombre', 'Consultoría');
      expect(mockExecute).toHaveBeenCalledWith(
        'SELECT * FROM tipo_servicio WHERE id = ?',
        [5]
      );
    });

    test('retorna undefined si no encuentra el tipo de servicio', async () => {
      mockExecute.mockResolvedValueOnce([[]]);
      
      const row = await tipoServicioModel.getById(999);
      
      expect(row).toBeUndefined();
    });
  });

  describe('create', () => {
    test('crea tipo de servicio con nombre y descripción', async () => {
      mockExecute.mockResolvedValueOnce([{ insertId: 10, affectedRows: 1 }]);
      
      const result = await tipoServicioModel.create({
        nombre: 'Nuevo Servicio',
        descripcion: 'Descripción del servicio'
      });
      
      expect(result.insertId).toBe(10);
      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT INTO tipo_servicio (nombre, descripcion) VALUES (?, ?)',
        ['Nuevo Servicio', 'Descripción del servicio']
      );
    });

    test('crea tipo de servicio solo con nombre (descripción null)', async () => {
      mockExecute.mockResolvedValueOnce([{ insertId: 11, affectedRows: 1 }]);
      
      const result = await tipoServicioModel.create({
        nombre: 'Solo Nombre'
      });
      
      expect(result.insertId).toBe(11);
      expect(mockExecute).toHaveBeenCalledWith(
        'INSERT INTO tipo_servicio (nombre, descripcion) VALUES (?, ?)',
        ['Solo Nombre', null]
      );
    });

    test('lanza error si falta nombre', async () => {
      await expect(tipoServicioModel.create({ descripcion: 'Sin nombre' }))
        .rejects.toThrow('Nombre es obligatorio');
      
      expect(mockExecute).not.toHaveBeenCalled();
    });

    test('lanza error si nombre es null', async () => {
      await expect(tipoServicioModel.create({ nombre: null }))
        .rejects.toThrow('Nombre es obligatorio');
    });

    test('lanza error si nombre es string vacío', async () => {
      await expect(tipoServicioModel.create({ nombre: '' }))
        .rejects.toThrow('Nombre es obligatorio');
    });
  });

  describe('update', () => {
    test('actualiza tipo de servicio correctamente', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      const result = await tipoServicioModel.update(3, {
        nombre: 'Nombre Actualizado',
        descripcion: 'Descripción actualizada'
      });
      
      expect(result.affectedRows).toBe(1);
      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE tipo_servicio SET nombre = ?, descripcion = ? WHERE id = ?',
        ['Nombre Actualizado', 'Descripción actualizada', 3]
      );
    });

    test('retorna 0 affectedRows si tipo de servicio no existe', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);
      
      const result = await tipoServicioModel.update(999, {
        nombre: 'Test'
      });
      
      expect(result.affectedRows).toBe(0);
    });

    test('actualiza permitiendo descripción null', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      await tipoServicioModel.update(1, {
        nombre: 'Test'
      });
      
      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE tipo_servicio SET nombre = ?, descripcion = ? WHERE id = ?',
        ['Test', null, 1]
      );
    });
  });

  describe('remove', () => {
    test('elimina tipo de servicio correctamente', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      const result = await tipoServicioModel.remove(5);
      
      expect(result.affectedRows).toBe(1);
      expect(mockExecute).toHaveBeenCalledWith(
        'DELETE FROM tipo_servicio WHERE id = ?',
        [5]
      );
    });

    test('retorna 0 affectedRows si tipo de servicio no existe', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);
      
      const result = await tipoServicioModel.remove(999);
      
      expect(result.affectedRows).toBe(0);
    });
  });
});
