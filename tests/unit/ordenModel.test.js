let mockExecute, mockEnd;

jest.mock('../../src/config/db', () => ({
  getConnection: jest.fn(() => Promise.resolve({ execute: mockExecute, end: mockEnd }))
}));

const ordenModel = require('../../src/models/ordenModel');

describe('ordenModel', () => {
  beforeEach(() => {
    mockExecute = jest.fn();
    mockEnd = jest.fn().mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAll', () => {
    test('retorna lista de órdenes con JOIN', async () => {
      const mockData = [
        { 
          id: 1, 
          cliente_id: 2,
          razon_social: 'Empresa A',
          estado: 'pendiente',
          tecnico_nombre: 'Juan Pérez'
        }
      ];
      mockExecute.mockResolvedValueOnce([mockData]);
      
      const rows = await ordenModel.getAll();
      
      expect(rows.length).toBe(1);
      expect(rows[0]).toHaveProperty('razon_social');
      expect(rows[0]).toHaveProperty('tecnico_nombre');
    });

    test('retorna array vacío si no hay órdenes', async () => {
      mockExecute.mockResolvedValueOnce([[]]);
      
      const rows = await ordenModel.getAll();
      
      expect(Array.isArray(rows)).toBe(true);
      expect(rows.length).toBe(0);
    });
  });

  describe('getById', () => {
    test('retorna orden con datos completos', async () => {
      const mockData = [{
        id: 99,
        cliente_id: 5,
        razon_social: 'Cliente Test',
        tipo_servicio_detalle: 'Reparación',
        tecnico_nombre: 'María González'
      }];
      mockExecute.mockResolvedValueOnce([mockData]);
      
      const row = await ordenModel.getById(99);
      
      expect(row.id).toBe(99);
      expect(row).toHaveProperty('razon_social');
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('WHERE o.id = ?'),
        [99]
      );
    });

    test('retorna undefined si orden no existe', async () => {
      mockExecute.mockResolvedValueOnce([[]]);
      
      const row = await ordenModel.getById(999);
      
      expect(row).toBeUndefined();
    });
  });

  describe('create', () => {
    test('crea orden con todos los parámetros', async () => {
      // SELECT cliente exists
      mockExecute.mockResolvedValueOnce([[{ id: 5 }]]);
      // INSERT
      mockExecute.mockResolvedValueOnce([{ insertId: 10 }]);
      
      await ordenModel.create({
        cliente_id: 5,
        observacion: 'Test orden',
        estado: 'pendiente',
        prioridad: 'alta',
        fecha_creacion: '2025-11-20',
        fecha_servicio: '2025-11-25',
        costo: 1500.50,
        tipo_servicio_id: 1,
        tecnico_id: 3,
        reclamos_id: 2
      });
      
      expect(mockExecute).toHaveBeenCalledTimes(2);
    });

    test('usa valores por defecto si faltan campos opcionales', async () => {
      // SELECT clientes
      mockExecute.mockResolvedValueOnce([[{ id: 5 }]]);
      // SELECT tipo_servicio
      mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
      // SELECT tecnicos
      mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
      // SELECT reclamos
      mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
      // SELECT cliente exists
      mockExecute.mockResolvedValueOnce([[{ id: 5 }]]);
      // INSERT
      mockExecute.mockResolvedValueOnce([{ insertId: 10 }]);
      
      await ordenModel.create({ fecha_creacion: '2025-11-20' });
      
      expect(mockExecute).toHaveBeenCalled();
    });

    test('genera fecha_creacion automática si falta', async () => {
      // SELECT clientes
      mockExecute.mockResolvedValueOnce([[{ id: 5 }]]);
      // SELECT tipo_servicio
      mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
      // SELECT tecnicos
      mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
      // SELECT reclamos
      mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
      // SELECT cliente exists
      mockExecute.mockResolvedValueOnce([[{ id: 5 }]]);
      // INSERT
      mockExecute.mockResolvedValueOnce([{ insertId: 10 }]);
      
      await ordenModel.create({});
      
      expect(mockExecute).toHaveBeenCalled();
    });

    test('lanza error si no puede setear cliente_id', async () => {
      // SELECT clientes -> vacío
      mockExecute.mockResolvedValueOnce([[]]);
      // SELECT tipo_servicio
      mockExecute.mockResolvedValueOnce([[]]);
      // SELECT tecnicos
      mockExecute.mockResolvedValueOnce([[]]);
      // SELECT reclamos
      mockExecute.mockResolvedValueOnce([[]]);
      
      await expect(ordenModel.create({}))
        .rejects.toThrow('cliente_id y fecha_creacion son obligatorios');
    });

    test('lanza error si cliente no existe', async () => {
      // SELECT cliente exists -> vacío
      mockExecute.mockResolvedValueOnce([[]]);
      // SELECT tecnicos (necesario porque no se provee tecnico_id)
      mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
      
      await expect(ordenModel.create({ cliente_id: 999, fecha_creacion: '2025-11-20' }))
        .rejects.toThrow('El cliente con id 999 no existe en la base de datos');
    });

    test('maneja error cuando tabla tipo_servicio no existe', async () => {
      // SELECT clientes
      mockExecute.mockResolvedValueOnce([[{ id: 5 }]]);
      // SELECT tipo_servicio -> error
      mockExecute.mockRejectedValueOnce(new Error('Table does not exist'));
      // SELECT tecnicos
      mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
      // SELECT reclamos -> error
      mockExecute.mockRejectedValueOnce(new Error('Table does not exist'));
      // SELECT cliente exists
      mockExecute.mockResolvedValueOnce([[{ id: 5 }]]);
      // INSERT
      mockExecute.mockResolvedValueOnce([{ insertId: 10 }]);
      
      await ordenModel.create({ fecha_creacion: '2025-11-20' });
      
      expect(mockExecute).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    test('actualiza múltiples campos', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      const res = await ordenModel.update(2, {
        estado: 'completada',
        observacion: 'Trabajo finalizado',
        costo: 2500.00
      });
      
      expect(res.affectedRows).toBe(1);
      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orden_servicio SET'),
        expect.arrayContaining(['completada', 'Trabajo finalizado', 2500.00, 2])
      );
    });

    test('actualiza solo los campos proporcionados', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      await ordenModel.update(5, { estado: 'Finalizada' });
      
      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE orden_servicio SET estado = ? WHERE id = ?',
        ['Finalizada', 5]
      );
    });

    test('retorna 0 affectedRows si no se proporcionan campos', async () => {
      const res = await ordenModel.update(1, {});
      
      expect(res.affectedRows).toBe(0);
      expect(mockExecute).not.toHaveBeenCalled();
    });

    test('retorna affectedRows cuando actualiza', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 2 }]);
      
      const res = await ordenModel.update(2, { estado: 'Finalizada' });
      
      expect(res.affectedRows).toBe(2);
    });

    test('puede actualizar con undefined en campos opcionales', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      await ordenModel.update(1, {
        observacion: undefined,
        estado: 'pendiente'
      });
      
      // Solo debe actualizar estado, no observacion
      expect(mockExecute).toHaveBeenCalledWith(
        'UPDATE orden_servicio SET estado = ? WHERE id = ?',
        ['pendiente', 1]
      );
    });
  });

  describe('remove', () => {
    test('elimina orden correctamente', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
      
      const res = await ordenModel.remove(3);
      
      expect(res.affectedRows).toBe(1);
      expect(mockExecute).toHaveBeenCalledWith(
        'DELETE FROM orden_servicio WHERE id = ?',
        [3]
      );
    });

    test('retorna 0 affectedRows si orden no existe', async () => {
      mockExecute.mockResolvedValueOnce([{ affectedRows: 0 }]);
      
      const res = await ordenModel.remove(999);
      
      expect(res.affectedRows).toBe(0);
    });
  });
});
