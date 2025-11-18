let mockExecute, mockEnd;
jest.mock('../../src/config/db', () => ({
  getConnection: jest.fn(() => Promise.resolve({ execute: mockExecute, end: mockEnd }))
}));

const clienteModel = require('../../src/models/clienteModel');

describe('clienteModel', () => {
  beforeEach(() => {
    mockExecute = jest.fn();
    mockEnd = jest.fn().mockResolvedValue();
  });

  test('getAll devuelve filas', async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
    const rows = await clienteModel.getAll();
    expect(Array.isArray(rows)).toBe(true);
    expect(mockEnd).toHaveBeenCalled();
  });

  test('getById devuelve primer registro', async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 2 }]]);
    const row = await clienteModel.getById(2);
    expect(row).toEqual({ id: 2 });
    expect(mockEnd).toHaveBeenCalled();
  });

  test('create lanza error por faltantes', async () => {
    await expect(clienteModel.create({ cuit: 'x' })).rejects.toThrow('Razón social y CUIT son obligatorios');
  });

  test('create inserta con datos válidos', async () => {
    mockExecute.mockResolvedValueOnce([{}]); // INSERT ok
    await clienteModel.create({ razon_social: 'ACME', cuit: '20-11111111-1' });
    expect(mockExecute).toHaveBeenCalled();
    expect(mockEnd).toHaveBeenCalled();
  });

  test('update retorna affectedRows', async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await clienteModel.update(1, { telefono: '123' });
    expect(res.affectedRows).toBe(1);
  });

  test('remove retorna affectedRows', async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await clienteModel.remove(1);
    expect(res.affectedRows).toBe(1);
  });
});
