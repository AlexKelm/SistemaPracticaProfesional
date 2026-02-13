let mockExecute, mockEnd;

jest.mock('../../src/config/db', () => ({
  getConnection: jest.fn(() => Promise.resolve({ execute: mockExecute, end: mockEnd }))
}));

const tecnicoModel = require('../../src/models/tecnicoModel');

describe('tecnicoModel', () => {
  beforeEach(() => {
    mockExecute = jest.fn();
    mockEnd = jest.fn().mockResolvedValue();
    // Silenciar console logs
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getAll devuelve lista con datos de persona', async () => {
    const mockData = [{ 
      id_tecnico: 1, 
      nombre: 'Juan', 
      apellido: 'Pérez',
      email: 'juan@test.com',
      telefono: '123456',
      persona_id: 5
    }];
    mockExecute.mockResolvedValueOnce([mockData]);
    const rows = await tecnicoModel.getAll();
    expect(rows.length).toBe(1);
    expect(rows[0]).toHaveProperty('nombre');
    expect(rows[0]).toHaveProperty('persona_id');
  });

  test('getById devuelve objeto con datos completos', async () => {
    const mockData = [{ 
      id_tecnico: 10, 
      nombre: 'María',
      apellido: 'González',
      usuario: 'mgonzalez'
    }];
    mockExecute.mockResolvedValueOnce([mockData]);
    const row = await tecnicoModel.getById(10);
    expect(row.id_tecnico).toBe(10);
    expect(row).toHaveProperty('usuario');
  });

  test('create valida campos obligatorios', async () => {
    await expect(tecnicoModel.create({ nombre: 'x' }))
      .rejects.toThrow('Nombre y apellido son obligatorios');
  });

  test('create inserta persona y tecnico correctamente', async () => {
    // INSERT persona
    mockExecute.mockResolvedValueOnce([{ insertId: 15 }]);
    // INSERT tecnico
    mockExecute.mockResolvedValueOnce([{ insertId: 10, affectedRows: 1 }]);
    
    await tecnicoModel.create({ 
      nombre: 'Pedro', 
      apellido: 'López',
      email: 'pedro@test.com',
      telefono: '123456789'
    });
    
    expect(mockExecute).toHaveBeenCalledTimes(2); // INSERT persona + INSERT tecnico
  });

  test('update falla si técnico no existe', async () => {
    mockExecute.mockResolvedValueOnce([[]]); // Técnico no encontrado
    await expect(tecnicoModel.update(999, { nombre: 'Test' }))
      .rejects.toThrow('Técnico no encontrado');
  });

  test('update actualiza persona correctamente', async () => {
    // SELECT tecnico by id -> existe
    mockExecute.mockResolvedValueOnce([[{ id_tecnico: 1, persona_id: 5 }]]);
    // UPDATE persona
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    const res = await tecnicoModel.update(1, { 
      nombre: 'Carlos',
      email: 'carlos@test.com',
      telefono: '987654321'
    });
    
    expect(res.affectedRows).toBe(1);
  });

  test('remove elimina tecnico y persona correctamente', async () => {
    // SELECT persona_id
    mockExecute.mockResolvedValueOnce([[{ persona_id: 10 }]]);
    // DELETE tecnico
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    // DELETE persona
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    const res = await tecnicoModel.remove(1);
    
    expect(mockExecute).toHaveBeenCalledTimes(3);
    expect(res.affectedRows).toBe(1);
  });

  test('remove lanza error si tecnico no existe', async () => {
    mockExecute.mockResolvedValueOnce([[]]); // Técnico no encontrado
    
    await expect(tecnicoModel.remove(999))
      .rejects.toThrow('Técnico no encontrado');
  });

  test('getOrdenesAsignadas retorna lista de ordenes', async () => {
    const mockOrdenes = [
      { id: 1, observacion: 'Orden 1', razon_social: 'Cliente A' },
      { id: 2, observacion: 'Orden 2', razon_social: 'Cliente B' }
    ];
    mockExecute.mockResolvedValueOnce([mockOrdenes]);
    const rows = await tecnicoModel.getOrdenesAsignadas(1);
    expect(rows.length).toBe(2);
    expect(rows[0]).toHaveProperty('razon_social');
  });

  test('asignarOrden falla si técnico no encontrado', async () => {
    mockExecute.mockResolvedValueOnce([[]]); // Técnico no encontrado
    await expect(tecnicoModel.asignarOrden(999, 2))
      .rejects.toThrow('Técnico no encontrado');
  });

  test('asignarOrden actualiza orden correctamente', async () => {
    // SELECT tecnico -> existe
    mockExecute.mockResolvedValueOnce([[{ nombre_completo: 'Juan Pérez' }]]);
    // UPDATE orden
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    const res = await tecnicoModel.asignarOrden(1, 5);
    expect(res.affectedRows).toBe(1);
  });
});
