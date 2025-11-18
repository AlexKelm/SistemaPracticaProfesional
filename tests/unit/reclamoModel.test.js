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

  test('getAll retorna lista (tras ensureTableExists)', async () => {
    // ensureTableExists -> CREATE
    mockExecute.mockResolvedValueOnce([{}]);
    // SELECT reclamos join cliente
    mockExecute.mockResolvedValueOnce([[{ id: 1, cliente_id: 2 }]]);
    const rows = await reclamoModel.getAll();
    expect(rows.length).toBe(1);
    expect(mockEnd).toHaveBeenCalled();
  });

  test('getById retorna objeto', async () => {
    mockExecute
      .mockResolvedValueOnce([{}]) // ensureTableExists
      .mockResolvedValueOnce([[{ id: 42 }]]);
    const row = await reclamoModel.getById(42);
    expect(row.id).toBe(42);
  });

  test('create valida cliente_id obligatorio', async () => {
    await expect(reclamoModel.create({ descripcion: 'x' })).rejects.toThrow('cliente_id es obligatorio');
  });

  test('create inserta con cliente_id', async () => {
    mockExecute
      .mockResolvedValueOnce([{}]) // ensureTableExists
      .mockResolvedValueOnce([{}]); // INSERT
    await reclamoModel.create({ cliente_id: 1, descripcion: 'algo' });
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  test('update retorna affectedRows', async () => {
    mockExecute
      .mockResolvedValueOnce([{}]) // ensureTableExists
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await reclamoModel.update(1, { estado: 'Resuelto' });
    expect(res.affectedRows).toBe(1);
  });

  test('remove retorna affectedRows', async () => {
    mockExecute
      .mockResolvedValueOnce([{}]) // ensureTableExists
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await reclamoModel.remove(1);
    expect(res.affectedRows).toBe(1);
  });
});
