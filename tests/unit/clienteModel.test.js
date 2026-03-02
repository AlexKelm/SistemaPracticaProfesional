let mockExecute, mockEnd;
jest.mock('../../src/config/db', () => ({
  getConnection: jest.fn(() => Promise.resolve({ execute: mockExecute, end: mockEnd }))
}));

const clienteModel = require('../../src/models/clienteModel');

describe('clienteModel', () => {
  beforeEach(() => {
    mockExecute = jest.fn();
    mockEnd = jest.fn().mockResolvedValue();
    // Limpiar console logs para tests limpios
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getAll devuelve filas con JOIN de persona', async () => {
    const mockData = [{ 
      id: 1, 
      razon_social: 'Empresa Test',
      cuit: '20-12345678-9',
      persona_id: 5,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'test@empresa.com',
      telefono: '123456789'
    }];
    mockExecute.mockResolvedValueOnce([mockData]);
    const rows = await clienteModel.getAll();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows[0]).toHaveProperty('razon_social');
    expect(rows[0]).toHaveProperty('nombre');
  });

  test('getById devuelve primer registro con datos de persona', async () => {
    const mockData = [{ 
      id: 2, 
      razon_social: 'Test Corp',
      nombre: 'María',
      apellido: 'González'
    }];
    mockExecute.mockResolvedValueOnce([mockData]);
    const row = await clienteModel.getById(2);
    expect(row).toHaveProperty('razon_social');
    expect(row).toHaveProperty('nombre');
  });

  test('create lanza error si falta razon_social', async () => {
    await expect(clienteModel.create({ cuit: '20-11111111-1' }))
      .rejects.toThrow('Razón social y CUIT son obligatorios');
  });

  test('create lanza error si falta cuit', async () => {
    await expect(clienteModel.create({ razon_social: 'ACME' }))
      .rejects.toThrow('Razón social y CUIT son obligatorios');
  });

  test('create inserta persona y cliente correctamente', async () => {
    // Mock para INSERT persona (retorna insertId)
    mockExecute.mockResolvedValueOnce([{ insertId: 10 }]);
    // Mock para INSERT cliente
    mockExecute.mockResolvedValueOnce([{ insertId: 5, affectedRows: 1 }]);
    
    const result = await clienteModel.create({ 
      razon_social: 'ACME SA', 
      cuit: '20-11111111-1',
      nombre: 'Pedro',
      apellido: 'López',
      email: 'pedro@acme.com',
      telefono: '111222333'
    });
    
    expect(mockExecute).toHaveBeenCalledTimes(2); // persona + cliente
  });

  test('update actualiza cliente y persona', async () => {
    // Mock para SELECT persona_id
    mockExecute.mockResolvedValueOnce([[{ persona_id: 10 }]]);
    // Mock para UPDATE persona
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    // Mock para UPDATE cliente
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    const res = await clienteModel.update(1, { 
      razon_social: 'Nuevo Nombre',
      nombre: 'Carlos',
      telefono: '999888777'
    });
    
    expect(mockExecute).toHaveBeenCalledTimes(3);
    expect(res.affectedRows).toBe(1);
  });

  test('update lanza error si cliente no existe', async () => {
    mockExecute.mockResolvedValueOnce([[]]); // Cliente no encontrado
    
    await expect(clienteModel.update(999, { razon_social: 'Test' }))
      .rejects.toThrow('Cliente no encontrado');
  });

  test('remove elimina cliente y persona correctamente', async () => {
    // Mock para SELECT persona_id
    mockExecute.mockResolvedValueOnce([[{ persona_id: 10 }]]);
    // Mock para DELETE cliente
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    // Mock para DELETE persona
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    const res = await clienteModel.remove(1);
    
    expect(mockExecute).toHaveBeenCalledTimes(3);
    expect(res.affectedRows).toBe(1);
  });

  test('remove lanza error si cliente no existe', async () => {
    mockExecute.mockResolvedValueOnce([[]]); // Cliente no encontrado
    
    await expect(clienteModel.remove(999))
      .rejects.toThrow('Cliente no encontrado');
  });
});
