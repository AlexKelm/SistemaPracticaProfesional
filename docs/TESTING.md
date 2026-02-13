# 🧪 Documentación de Testing

## Índice
- [Resumen](#resumen)
- [Configuración](#configuración)
- [Ejecutar Tests](#ejecutar-tests)
- [Tipos de Tests](#tipos-de-tests)
- [Estructura de Archivos](#estructura-de-archivos)
- [Cobertura](#cobertura)
- [Mejores Prácticas](#mejores-prácticas)
- [Troubleshooting](#troubleshooting)

---

## Resumen

El proyecto cuenta con **61 tests** organizados en **7 suites** que garantizan la calidad del código:

| Suite | Tests | Descripción |
|-------|-------|-------------|
| `clienteModel.test.js` | 11 | Tests unitarios del modelo Cliente |
| `tecnicoModel.test.js` | 9 | Tests unitarios del modelo Técnico |
| `ordenModel.test.js` | 6 | Tests unitarios del modelo Orden |
| `reclamoModel.test.js` | 6 | Tests unitarios del modelo Reclamo |
| `api.crud.test.js` | 21 | Tests de integración de API REST |
| `auth.test.js` | 3 | Tests de autenticación |
| `api.smoke.test.js` | 5 | Tests de smoke (salud básica) |

**Total:** 61 tests ✅ | Tiempo: ~2 segundos ⚡

---

## Configuración

### Dependencias

```json
{
  "jest": "^29.7.0",
  "supertest": "^7.0.0",
  "cross-env": "^7.0.3"
}
```

### Jest Config (package.json)

```json
{
  "jest": {
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "statements": 75,
        "branches": 65,
        "functions": 85,
        "lines": 75
      }
    }
  }
}
```

### Variables de Entorno

Los tests usan `NODE_ENV=test` automáticamente:

```bash
cross-env NODE_ENV=test jest --runInBand
```

---

## Ejecutar Tests

### Comandos Básicos

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm run coverage

# Watch mode (desarrollo)
npm test -- --watch

# Solo un archivo
npm test -- clienteModel.test.js

# Tests con verbose
npm test -- --verbose
```

### Ver Reporte de Cobertura

```bash
# Generar reporte
npm run coverage

# Abrir reporte HTML
# Windows
start coverage/lcov-report/index.html

# Linux/Mac
open coverage/lcov-report/index.html
```

---

## Tipos de Tests

### 1. Tests Unitarios (`tests/unit/`)

Tests aislados con **mocks** de base de datos para probar lógica pura.

#### `clienteModel.test.js`

```javascript
describe('clienteModel', () => {
  test('create inserta persona y cliente correctamente', async () => {
    // Mock para INSERT persona (retorna insertId)
    mockExecute.mockResolvedValueOnce([{ insertId: 10 }]);
    // Mock para INSERT cliente
    mockExecute.mockResolvedValueOnce([{ insertId: 5, affectedRows: 1 }]);
    
    const result = await clienteModel.create({ 
      razon_social: 'ACME SA', 
      cuit: '20-11111111-1',
      nombre: 'Pedro',
      apellido: 'López'
    });
    
    expect(mockExecute).toHaveBeenCalledTimes(2); // persona + cliente
  });
});
```

**Aspectos clave:**
- ✅ Mock de `getConnection()` y `execute()`
- ✅ Verifica normalización con tabla `persona`
- ✅ Tests de eliminación en cascada
- ✅ Validación de campos obligatorios

#### `tecnicoModel.test.js`

```javascript
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
```

**Aspectos clave:**
- ✅ Eliminación de técnico + persona
- ✅ Actualización solo de tabla `persona`
- ✅ Tests de asignación de órdenes

#### `ordenModel.test.js`

```javascript
test('create usa cliente existente si falta cliente_id', async () => {
  // SELECT clientes
  mockExecute.mockResolvedValueOnce([[{ id: 5 }]]);
  // SELECT tipo_servicio
  mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
  // SELECT tecnicos
  mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
  // ... más mocks
  
  await ordenModel.create({ fecha_creacion: '2025-11-20' });
  expect(mockExecute).toHaveBeenCalled();
});
```

**Aspectos clave:**
- ✅ Selección automática de FKs opcionales
- ✅ Validación de cliente obligatorio
- ✅ Manejo de múltiples foreign keys

#### `reclamoModel.test.js`

```javascript
test('create valida detalles obligatorio', async () => {
  mockExecute.mockResolvedValueOnce([{}]); // ensureTableExists
  await expect(reclamoModel.create({}))
    .rejects.toThrow('detalles es obligatorio');
});
```

**Aspectos clave:**
- ✅ Validación de campo `detalles`
- ✅ Mock de `ensureTableExists()`
- ✅ CRUD básico

---

### 2. Tests de Integración (`api.crud.test.js`)

Tests **E2E** con base de datos real usando **Supertest**.

```javascript
describe('CRUD API', () => {
  test('POST /api/clientes crea cliente con persona', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .send({
        razon_social: 'Test Corp',
        cuit: '20-99999999-9',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'test@test.com'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('creado');
    clienteId = res.body.id;
  });
  
  test('DELETE /api/clientes/:id elimina en cascada', async () => {
    const res = await request(app).delete(`/api/clientes/${clienteId}`);
    expect(res.status).toBe(200);
  });
});
```

**Flujo típico:**
1. **POST** - Crear registro
2. **GET** - Verificar creación
3. **PUT** - Actualizar
4. **GET** - Verificar actualización
5. **DELETE** - Eliminar
6. **GET** - Verificar eliminación (404)

**Aspectos probados:**
- ✅ Status codes correctos (200, 400, 404, 500)
- ✅ Estructura de responses
- ✅ Validaciones de backend
- ✅ Foreign keys y cascadas
- ✅ Normalización con `persona`

---

### 3. Tests de Autenticación (`auth.test.js`)

```javascript
test('POST /login con credenciales válidas', async () => {
  const res = await request(app)
    .post('/login')
    .send({ username: 'admin', password: 'admin123' });
  
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('redirect');
});
```

---

### 4. Smoke Tests (`api.smoke.test.js`)

Tests rápidos para verificar que **todo funciona básicamente**.

```javascript
describe('SMOKE API', () => {
  test('GET /api/clientes responde', async () => {
    const res = await request(app).get('/api/clientes');
    expect(res.status).toBe(200);
  });
  
  test('POST /api/clientes crea mínimo', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .send({ razon_social: 'Test', cuit: '20-00000000-0' });
    expect([200, 400]).toContain(res.status);
  });
});
```

---

## Estructura de Archivos

```
tests/
├── unit/                       # Tests unitarios (mocks)
│   ├── clienteModel.test.js   # 11 tests - Cliente + Persona
│   ├── tecnicoModel.test.js   # 9 tests - Técnico + Persona
│   ├── ordenModel.test.js     # 6 tests - Órdenes + FKs
│   └── reclamoModel.test.js   # 6 tests - Reclamos
├── api.crud.test.js           # 21 tests - API REST E2E
├── api.smoke.test.js          # 5 tests - Salud básica
└── auth.test.js               # 3 tests - Login
```

---

## Cobertura

### Umbrales Configurados

```json
{
  "statements": 75,  // Mínimo 75% de líneas ejecutadas
  "branches": 65,    // Mínimo 65% de ramas (if/else)
  "functions": 85,   // Mínimo 85% de funciones
  "lines": 75        // Mínimo 75% de líneas de código
}
```

### Estado Actual

✅ **Todas las métricas superan los umbrales**

| Archivo | Statements | Branches | Functions | Lines |
|---------|------------|----------|-----------|-------|
| `clienteModel.js` | 90%+ | 75%+ | 100% | 90%+ |
| `tecnicoModel.js` | 88%+ | 70%+ | 100% | 88%+ |
| `ordenModel.js` | 85%+ | 65%+ | 90%+ | 85%+ |
| `reclamoModel.js` | 92%+ | 80%+ | 100% | 92%+ |

### Revisar Cobertura

```bash
npm run coverage
```

Genera reportes en:
- `coverage/lcov-report/index.html` (visual)
- `coverage/coverage-final.json` (JSON)
- `coverage/lcov.info` (para CI/CD)

---

## Mejores Prácticas

### ✅ Estructura AAA (Arrange-Act-Assert)

```javascript
test('ejemplo', async () => {
  // ARRANGE - Preparar datos y mocks
  mockExecute.mockResolvedValueOnce([{ id: 1 }]);
  
  // ACT - Ejecutar función
  const result = await model.getById(1);
  
  // ASSERT - Verificar resultado
  expect(result).toHaveProperty('id');
});
```

### ✅ Nombres Descriptivos

❌ Mal:
```javascript
test('test1', () => { ... });
```

✅ Bien:
```javascript
test('create lanza error si falta razon_social', () => { ... });
```

### ✅ Tests Independientes

```javascript
describe('clienteModel', () => {
  beforeEach(() => {
    // Reset mocks para cada test
    mockExecute = jest.fn();
    mockEnd = jest.fn().mockResolvedValue();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
});
```

### ✅ Silenciar Logs en Tests

```javascript
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
```

### ✅ Aislamiento de Base de Datos

- Tests unitarios: **Mock completo** (no tocan DB)
- Tests integración: **Base de datos real** pero con datos temporales
- Usar `--runInBand` para evitar concurrencia

---

## Troubleshooting

### ❌ Error: "Cannot find module"

**Solución:**
```bash
npm install
```

### ❌ Tests de integración fallan

**Causas comunes:**
1. MySQL no está corriendo
2. Base de datos `proyecto_test` no existe
3. Credenciales incorrectas

**Solución:**
```bash
# Verificar MySQL
mysql -u root -p -e "SHOW DATABASES;"

# Crear DB test
mysql -u root -p < BaseDeDatos.sql
```

### ❌ "Port 3000 already in use"

**Solución:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### ❌ Tests lentos

**Solución:**
```bash
# Ejecutar en paralelo (solo si no usan DB)
npm test -- --maxWorkers=4

# O usar solo tests unitarios
npm test -- tests/unit/
```

### ❌ Fallos intermitentes

**Causas:**
- Orden de ejecución aleatorio
- Estado compartido entre tests
- Conexiones de BD no cerradas

**Solución:**
```bash
# Ejecutar en orden secuencial
npm test -- --runInBand

# Ver detalles
npm test -- --verbose
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: proyecto_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run tests
        run: npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Mantenimiento

### Agregar Nuevos Tests

1. **Test Unitario:**
   ```bash
   touch tests/unit/nuevoModel.test.js
   ```

2. **Seguir estructura existente:**
   ```javascript
   let mockExecute, mockEnd;
   
   jest.mock('../../src/config/db', () => ({
     getConnection: jest.fn(() => Promise.resolve({ 
       execute: mockExecute, 
       end: mockEnd 
     }))
   }));
   
   const nuevoModel = require('../../src/models/nuevoModel');
   
   describe('nuevoModel', () => {
     beforeEach(() => {
       mockExecute = jest.fn();
       mockEnd = jest.fn().mockResolvedValue();
     });
     
     test('getAll devuelve lista', async () => {
       mockExecute.mockResolvedValueOnce([[{ id: 1 }]]);
       const rows = await nuevoModel.getAll();
       expect(Array.isArray(rows)).toBe(true);
     });
   });
   ```

3. **Ejecutar:**
   ```bash
   npm test -- nuevoModel.test.js
   ```

### Actualizar Tests

Cuando cambies el código:

1. ✅ Actualiza tests afectados
2. ✅ Ejecuta suite completa: `npm test`
3. ✅ Verifica cobertura: `npm run coverage`
4. ✅ Commit tests junto con código

---

## Recursos

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest GitHub](https://github.com/ladjs/supertest)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [AAA Pattern](https://automationpanda.com/2020/07/07/arrange-act-assert-a-pattern-for-writing-good-tests/)

---

## Contacto y Soporte

Para dudas sobre tests:
1. Revisar este documento
2. Ver ejemplos en `tests/unit/`
3. Consultar logs de ejecución con `--verbose`
4. Abrir issue en el repositorio

**Última actualización:** Noviembre 2025
