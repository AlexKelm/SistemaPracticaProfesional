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

  test('getAll retorna lista', async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 1, cliente_id: 2 }]]);
    const rows = await ordenModel.getAll();
    expect(rows.length).toBe(1);
  });

  test('getById retorna objeto', async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 99 }]]);
    const row = await ordenModel.getById(99);
    expect(row.id).toBe(99);
  });

  test('create usa cliente existente si falta cliente_id', async () => {
    // Primer SELECT clientes -> devuelve uno
    mockExecute.mockResolvedValueOnce([[{ id: 5 }]]);
    // INSERT
    mockExecute.mockResolvedValueOnce([{}]);
    await ordenModel.create({ descripcion: 'Orden sin cliente explícito' });
    expect(mockExecute.mock.calls[1][0]).toContain('INSERT INTO orden_servicio');
  });

  test('create lanza error si no puede setear cliente_id', async () => {
    // SELECT clientes -> vacío
    mockExecute.mockResolvedValueOnce([[]]);
    await expect(ordenModel.create({})).rejects.toThrow('cliente_id y fecha_creacion son obligatorios');
  });

  test('update retorna affectedRows', async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 2 }]);
    const res = await ordenModel.update(2, { estado: 'Finalizada' });
    expect(res.affectedRows).toBe(2);
  });

  test('remove retorna affectedRows', async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await ordenModel.remove(3);
    expect(res.affectedRows).toBe(1);
  });
});
