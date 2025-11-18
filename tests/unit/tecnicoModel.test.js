let mockExecute, mockEnd;

jest.mock('../../src/config/db', () => ({
  getConnection: jest.fn(() => Promise.resolve({ execute: mockExecute, end: mockEnd }))
}));

const tecnicoModel = require('../../src/models/tecnicoModel');

describe('tecnicoModel', () => {
  beforeEach(() => {
    mockExecute = jest.fn();
    mockEnd = jest.fn().mockResolvedValue();
  });

  test('getAll devuelve lista', async () => {
    mockExecute.mockResolvedValueOnce([[{ id_tecnico: 1 }]]);
    const rows = await tecnicoModel.getAll();
    expect(rows.length).toBe(1);
  });

  test('getById devuelve objeto', async () => {
    mockExecute.mockResolvedValueOnce([[{ id_tecnico: 10 }]]);
    const row = await tecnicoModel.getById(10);
    expect(row.id_tecnico).toBe(10);
  });

  test('create valida obligatorios', async () => {
    await expect(tecnicoModel.create({ nombre: 'x' })).rejects.toThrow('Nombre, apellido, usuario y contraseña son obligatorios');
  });

  test('create falla si usuario existe', async () => {
    // SELECT existing user
    mockExecute.mockResolvedValueOnce([[{ id_tecnico: 1 }]]);
    await expect(tecnicoModel.create({ nombre: 'n', apellido: 'a', usuario: 'u', password: 'p' }))
      .rejects.toThrow('El usuario ya existe');
  });

  test('create inserta con datos válidos', async () => {
    // SELECT existing user -> vacío
    mockExecute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{}]); // INSERT
    await tecnicoModel.create({ nombre: 'n', apellido: 'a', usuario: 'u', password: 'p' });
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  test('update falla si técnico no existe', async () => {
    // SELECT tecnico by id -> vacío
    mockExecute.mockResolvedValueOnce([[]]);
    await expect(tecnicoModel.update(1, {})).rejects.toThrow('Técnico no encontrado');
  });

  test('update falla si usuario duplicado', async () => {
    // SELECT tecnico by id -> existe
    mockExecute
      .mockResolvedValueOnce([[{ id_tecnico: 1 }]])
      // SELECT usuario duplicado
      .mockResolvedValueOnce([[{ id_tecnico: 2 }]]);
    await expect(tecnicoModel.update(1, { usuario: 'otro' })).rejects.toThrow('El usuario ya existe');
  });

  test('update retorna affectedRows', async () => {
    // SELECT tecnico by id -> existe
    mockExecute
      .mockResolvedValueOnce([[{ id_tecnico: 1 }]])
      // SELECT usuario duplicado -> vacío (cuando se intenta cambiar usuario)
      .mockResolvedValueOnce([[]])
      // UPDATE
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await tecnicoModel.update(1, { usuario: 'nuevo.user', nombre: 'z' });
    expect(res.affectedRows).toBe(1);
  });

  test('remove retorna affectedRows', async () => {
    mockExecute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await tecnicoModel.remove(1);
    expect(res.affectedRows).toBe(1);
  });

  test('getOrdenesAsignadas retorna lista', async () => {
    mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
    const rows = await tecnicoModel.getOrdenesAsignadas(1);
    expect(rows.length).toBe(1);
  });

  test('asignarOrden falla si técnico no encontrado', async () => {
    mockExecute.mockResolvedValueOnce([[]]);
    await expect(tecnicoModel.asignarOrden(1, 2)).rejects.toThrow('Técnico no encontrado');
  });

  test('asignarOrden actualiza cuando existe', async () => {
    mockExecute
      .mockResolvedValueOnce([[{ nombre_completo: 'A B' }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await tecnicoModel.asignarOrden(1, 2);
    expect(res.affectedRows).toBe(1);
  });
});
