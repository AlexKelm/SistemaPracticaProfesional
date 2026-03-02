let mockExecute, mockEnd;

jest.mock('../../src/config/db', () => ({
  getConnection: jest.fn(() => Promise.resolve({ execute: mockExecute, end: mockEnd }))
}));

const reclamoModel = require('../../src/models/reclamoModel');

describe('reclamoModel', () => {
  beforeEach(() => {
    mockExecute = jest.fn();
    mockEnd = jest.fn().mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAll', () => {
    test('retorna lista con JOIN de cliente', async () => {
      // ensureTableExists -> CREATE
      mockExecute.mockResolvedValueOnce([{}]);
      // SELECT reclamos join cliente
      const mockData = [
        { 
          id: 1, 
          cliente_id: 2,
          detalles: 'Reclamo test',
          razon_social: 'Empresa A',
          estado: 'pendiente'
        }
      ];
      mockExecute.mockResolvedValueOnce([mockData]);
      
      const rows = await reclamoModel.getAll();
      
      expect(rows.length).toBe(1);
      expect(rows[0]).toHaveProperty('razon_social');
    });

    test('retorna array vacío si no hay reclamos', async () => {
      mockExecute.mockResolvedValueOnce([{}]); // ensureTableExists
      mockExecute.mockResolvedValueOnce([[]]);
      
      const rows = await reclamoModel.getAll();
      
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBe(0);
    });
  });

  describe('getById', () => {
    test('retorna reclamo con datos completos', async () => {
      mockExecute
        .mockResolvedValueOnce([{}]) // ensureTableExists
        .mockResolvedValueOnce([[{
          id: 42,
          cliente_id: 5,
          detalles: 'Reclamo específico',
          fecha: '2025-11-20'
        }]]);
      
      const row = await reclamoModel.getById(42);
      
      expect(row.id).toBe(42);
      expect(row).toHaveProperty('detalles');
    });

    test('retorna undefined si reclamo no existe', async () => {
      mockExecute
        .mockResolvedValueOnce([{}]) // ensureTableExists
        .mockResolvedValueOnce([[]]);
      
      const row = await reclamoModel.getById(999);
      
      expect(row).toBeUndefined();
    });
  });

  describe('create', () => {
    test('lanza error si falta detalles', async () => {
      mockExecute.mockResolvedValueOnce([{}]); // ensureTableExists
      
      await expect(reclamoModel.create({}))
        .rejects.toThrow('detalles es obligatorio');
    });

    test('lanza error si detalles es null', async () => {
      mockExecute.mockResolvedValueOnce([{}]); // ensureTableExists
      
      await expect(reclamoModel.create({ detalles: null }))
        .rejects.toThrow('detalles es obligatorio');
    });

    test('lanza error si detalles es string vacío', async () => {
      mockExecute.mockResolvedValueOnce([{}]); // ensureTableExists
      
      await expect(reclamoModel.create({ detalles: '' }))
        .rejects.toThrow('detalles es obligatorio');
    });

    test('crea reclamo con detalles y fecha', async () => {
      mockExecute
        .mockResolvedValueOnce([{}]) // ensureTableExists
        .mockResolvedValueOnce([{ insertId: 10, affectedRows: 1 }]); // INSERT
      
      await reclamoModel.create({
        detalles: 'Reclamo test',
        fecha: '2025-11-20',
        cliente_id: 5
      });
      
      expect(mockExecute).toHaveBeenCalledTimes(2);
    });

    test('crea reclamo solo con detalles (fecha opcional)', async () => {
      mockExecute
        .mockResolvedValueOnce([{}]) // ensureTableExists
        .mockResolvedValueOnce([{ insertId: 11 }]); // INSERT
      
      await reclamoModel.create({ detalles: 'Solo detalles' });
      
      expect(mockExecute).toHaveBeenCalledTimes(2);
    });
  });

  describe('update', () => {
    test('actualiza reclamo correctamente', async () => {
      mockExecute
        .mockResolvedValueOnce([{}]) // ensureTableExists
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE
      
      const res = await reclamoModel.update(1, {
        detalles: 'Detalles actualizados',
        estado: 'resuelto'
      });
      
      expect(res.affectedRows).toBe(1);
    });

    test('retorna 0 affectedRows si reclamo no existe', async () => {
      mockExecute
        .mockResolvedValueOnce([{}]) // ensureTableExists
        .mockResolvedValueOnce([{ affectedRows: 0 }]); // UPDATE
      
      const res = await reclamoModel.update(999, { detalles: 'Test' });
      
      expect(res.affectedRows).toBe(0);
    });

    test('actualiza solo campos proporcionados', async () => {
      mockExecute
        .mockResolvedValueOnce([{}]) // ensureTableExists
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE
      
      await reclamoModel.update(5, { estado: 'resuelto' });
      
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reclamo'),
        expect.arrayContaining([expect.stringMatching(/resuelto/), 5])
      );
    });
  });

  describe('remove', () => {
    test('elimina reclamo correctamente', async () => {
      mockExecute
        .mockResolvedValueOnce([{}]) // ensureTableExists
        .mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      const res = await reclamoModel.remove(1);
      
      expect(res.affectedRows).toBe(1);
    });

    test('retorna 0 affectedRows si reclamo no existe', async () => {
      mockExecute
        .mockResolvedValueOnce([{}]) // ensureTableExists
        .mockResolvedValueOnce([{ affectedRows: 0 }]);
      
      const res = await reclamoModel.remove(999);
      
      expect(res.affectedRows).toBe(0);
    });
  });
});
