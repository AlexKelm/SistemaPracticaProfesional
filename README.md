# Sistema de Práctica Profesional

## 📋 Descripción
Sistema integral de gestión de órdenes de servicio técnico desarrollado con Node.js, Express y MySQL. Incluye gestión de clientes, técnicos, órdenes de servicio, reclamos y agenda de citas.

## 📦 Estructura del Proyecto

```
├── src/                          # Código del backend
│   ├── app.js                   # Punto de entrada principal
│   ├── config/                  # Configuración
│   │   └── db.js               # Configuración de base de datos MySQL
│   ├── models/                 # Modelos de datos
│   │   ├── clienteModel.js     # CRUD de clientes
│   │   ├── ordenModel.js       # CRUD de órdenes de servicio
│   │   ├── tecnicoModel.js     # CRUD de técnicos
│   │   ├── reclamoModel.js     # CRUD de reclamos
│   │   └── tipoServicioModel.js # CRUD de tipos de servicio
│   ├── routes/                 # Rutas API REST
│   │   ├── clienteRoutes.js
│   │   ├── ordenRoutes.js
│   │   ├── tecnicoRoutes.js
│   │   ├── reclamoRoutes.js
│   │   └── tipoServicioRoutes.js
│   ├── middleware/             # Middleware personalizado
│   └── scripts/                # Scripts de utilidad
│       ├── crearUsuario.js     # Crear usuario admin
│       ├── crearTecnicos.js    # Generar técnicos de prueba
│       ├── seedData.js         # Poblar base de datos
│       └── checkData.js        # Verificar datos
├── public/                      # Archivos estáticos (frontend)
│   ├── index.html              # Página de inicio
│   ├── login.html              # Autenticación
│   ├── dashboard.html          # Panel principal
│   ├── clientes.html           # Gestión de clientes
│   ├── ordenes.html            # Gestión de órdenes
│   ├── tecnicos.html           # Gestión de técnicos
│   ├── agenda.html             # Calendario de citas
│   ├── reclamos.html           # Gestión de reclamos
│   ├── css/                    # Estilos CSS
│   │   ├── global.css         # Estilos globales
│   │   ├── components.css     # Componentes reutilizables
│   │   ├── dashboard.css      # Estilos del dashboard
│   │   ├── clientes.css
│   │   ├── ordenes.css
│   │   ├── tecnicos.css
│   │   ├── reclamos.css
│   │   ├── agenda.css
│   │   └── login.css
│   └── js/                     # Scripts del frontend
│       ├── dashboard.js
│       ├── clientes.js
│       ├── ordenes.js
│       ├── tecnicos.js
│       ├── reclamos.js
│       ├── agenda.js
│       └── login.js
├── tests/                       # Tests automatizados
│   ├── api.crud.test.js        # Tests de API CRUD
│   ├── api.smoke.test.js       # Tests de humo
│   ├── auth.test.js            # Tests de autenticación
│   └── unit/                   # Tests unitarios
│       ├── clienteModel.test.js
│       ├── ordenModel.test.js
│       ├── reclamoModel.test.js
│       └── tecnicoModel.test.js
├── coverage/                    # Reportes de cobertura de tests
├── docs/                        # Documentación
│   └── test/
│       └── PRUEBAS_IEEE829.md  # Plan de pruebas IEEE 829
├── BaseDeDatos.sql             # Dump de la base de datos
├── FLUJO_FUNCIONAMIENTO.md     # Documentación del flujo
├── package.json
└── README.md
```

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (versión 16 o superior)
- MySQL Server
- npm

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Base de Datos
1. Crear la base de datos ejecutando el script SQL:
```bash
mysql -u root -p < BaseDeDatos.sql
```
O importarlo manualmente desde MySQL Workbench/phpMyAdmin.

2. (Opcional) Configurar variables de entorno en un archivo `.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=proyecto_test
PORT=3000
```

**Nota:** Por defecto se conecta a `proyecto_test` en localhost sin contraseña.

### 3. Crear Usuario Administrador
```bash
npm run crear-usuario
```

Credenciales por defecto:
- **Usuario:** admin
- **Contraseña:** admin123

### 4. Crear Técnicos de Ejemplo (Opcional)
```bash
npm run crear-tecnicos
```

### 5. Iniciar el Servidor

**Modo desarrollo** (con auto-reload):
```bash
npm run dev
```

**Modo producción**:
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

## 📝 Scripts Disponibles

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo (con nodemon para auto-reload)
- `npm test` - Ejecuta los tests con Jest
- `npm run coverage` - Genera reporte de cobertura de tests
- `npm run crear-usuario` - Crea un usuario administrador predeterminado
- `npm run crear-tecnicos` - Crea técnicos de ejemplo en la base de datos
- `npm run seed-data` - Puebla la base de datos con datos de prueba
- `npm run check-data` - Verifica los datos en la base de datos


## 🌐 Acceso a la Aplicación

Después de iniciar el servidor, accede a:
- **Inicio:** http://localhost:3000 (redirige automáticamente a login)
- **Login:** http://localhost:3000/login.html
- **Dashboard:** http://localhost:3000/dashboard.html (requiere autenticación)
- **Clientes:** http://localhost:3000/clientes.html
- **Órdenes:** http://localhost:3000/ordenes.html
- **Técnicos:** http://localhost:3000/tecnicos.html
- **Reclamos:** http://localhost:3000/reclamos.html
- **Agenda:** http://localhost:3000/agenda.html

## 🔗 API Endpoints

### Autenticación
- `POST /login` - Autenticación de usuarios

### Clientes
- `GET /api/clientes` - Obtener todos los clientes con datos de persona
- `GET /api/clientes/:id` - Obtener cliente por ID
- `POST /api/clientes` - Crear nuevo cliente (crea persona automáticamente)
- `PUT /api/clientes/:id` - Actualizar cliente y sus datos de persona
- `DELETE /api/clientes/:id` - Eliminar cliente

**Body para POST/PUT:**
```json
{
  "razon_social": "Empresa ABC S.A.",
  "cuit": "20-12345678-9",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "contacto@empresa.com",
  "telefono": "011-1234-5678"
}
```

### Órdenes de Servicio
- `GET /api/ordenes` - Obtener todas las órdenes con datos de cliente
- `GET /api/ordenes/:id` - Obtener orden por ID
- `POST /api/ordenes` - Crear nueva orden
- `PUT /api/ordenes/:id` - Actualizar orden
- `DELETE /api/ordenes/:id` - Eliminar orden

**Body para POST/PUT:**
```json
{
  "cliente_id": 1,
  "tipo_servicio_id": 2,
  "tecnico_id": 3,
  "observacion": "Reparación urgente",
  "estado": "pendiente",
  "prioridad": "alta",
  "costo": 5000.00,
  "fecha_servicio": "2025-11-20"
}
```

**Estados válidos:** `pendiente`, `en_proceso`, `completada`, `cancelada`  
**Prioridades válidas:** `baja`, `media`, `alta`

### Técnicos
- `GET /api/tecnicos` - Obtener todos los técnicos
- `GET /api/tecnicos/:id` - Obtener técnico por ID
- `GET /api/tecnicos/:id/ordenes` - Obtener órdenes asignadas a un técnico
- `POST /api/tecnicos` - Crear nuevo técnico
- `PUT /api/tecnicos/:id` - Actualizar técnico
- `DELETE /api/tecnicos/:id` - Eliminar técnico
- `POST /api/tecnicos/:id/asignar-orden` - Asignar orden a técnico

**Body para POST/PUT:**
```json
{
  "nombre": "Carlos",
  "apellido": "Rodríguez",
  "email": "carlos@empresa.com",
  "usuario": "crodriguez",
  "password": "password123"
}
```

### Reclamos
- `GET /api/reclamos` - Obtener todos los reclamos
- `GET /api/reclamos/:id` - Obtener reclamo por ID
- `POST /api/reclamos` - Crear nuevo reclamo
- `PUT /api/reclamos/:id` - Actualizar reclamo
- `DELETE /api/reclamos/:id` - Eliminar reclamo

**Body para POST/PUT:**
```json
{
  "detalles": "Cliente reporta falla en equipo",
  "fecha": "2025-11-19"
}
```

### Tipos de Servicio
- `GET /api/tipo-servicio` - Obtener todos los tipos de servicio
- `GET /api/tipo-servicio/:id` - Obtener tipo de servicio por ID
- `POST /api/tipo-servicio` - Crear nuevo tipo
- `PUT /api/tipo-servicio/:id` - Actualizar tipo
- `DELETE /api/tipo-servicio/:id` - Eliminar tipo

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con **bcrypt** (10 rounds)
- ✅ Validación de datos en backend (tipo, formato, obligatorios)
- ✅ **CORS** configurado para control de acceso entre orígenes
- ✅ Prevención de usuarios duplicados (validación de email/usuario)
- ✅ Sanitización de inputs para prevenir SQL injection
- ✅ Sesiones de autenticación validadas
- ⚠️ **Nota:** En producción se recomienda implementar JWT o sessions con express-session

## ✨ Características Principales

### 🎯 Dashboard Interactivo
- Vista general de próximas órdenes de servicio
- Lista de reclamos recientes (ordenados por fecha)
- Estadísticas en tiempo real
- Navegación rápida a cada módulo

### 👥 Gestión de Clientes
- CRUD completo con normalización (tabla `persona`)
- Búsqueda y filtrado en tiempo real
- Datos de contacto (email, teléfono)
- Historial de órdenes por cliente

### 🔧 Gestión de Órdenes de Servicio
- Estados: Pendiente, En Proceso, Completada, Cancelada
- Prioridades: Baja, Media, Alta
- Asignación de técnicos
- Tipos de servicio configurables
- Cálculo de costos
- Observaciones detalladas

### 👨‍🔧 Gestión de Técnicos
- Autenticación individual por técnico
- Visualización de órdenes asignadas
- Sistema de asignación de tareas
- Control de disponibilidad

### 📋 Gestión de Reclamos
- Registro de reclamos de clientes
- Seguimiento por fecha
- Integración con dashboard
- Vinculación opcional con órdenes

### 📅 Agenda de Citas
- Calendario visual con **FullCalendar**
- Visualización de fechas de servicio
- Código de colores por prioridad
- Vista mensual/semanal/diaria

## 🧪 Testing

El proyecto incluye una suite completa de tests automatizados con **Jest** y **Supertest** para garantizar la calidad y estabilidad del código.

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con reporte de cobertura
npm run coverage

# Ver reporte HTML de cobertura
# Abrir: coverage/lcov-report/index.html
```

### Tipos de Tests

#### 1️⃣ **Tests Unitarios** (`tests/unit/`)
Tests aislados de los modelos de datos con mocks de base de datos.

- **`clienteModel.test.js`** - 11 tests
  - ✅ `getAll()` con JOIN de persona
  - ✅ `getById()` con datos de persona
  - ✅ `create()` inserta persona + cliente (2 INSERTs)
  - ✅ `update()` actualiza ambas tablas (persona y cliente)
  - ✅ `remove()` elimina cliente + persona en cascada
  - ✅ Validaciones de campos obligatorios

- **`tecnicoModel.test.js`** - 9 tests
  - ✅ `getAll()` con datos de persona
  - ✅ `create()` inserta persona + técnico
  - ✅ `update()` actualiza datos de persona
  - ✅ `remove()` elimina técnico + persona
  - ✅ `getOrdenesAsignadas()` lista órdenes del técnico
  - ✅ `asignarOrden()` asigna orden a técnico

- **`ordenModel.test.js`** - 6 tests
  - ✅ `getAll()` y `getById()` con JOIN a cliente
  - ✅ `create()` con selección automática de cliente/tipo/técnico
  - ✅ `update()` y `remove()` con validaciones
  - ✅ Manejo de foreign keys opcionales

- **`reclamoModel.test.js`** - 6 tests
  - ✅ CRUD completo de reclamos
  - ✅ Validación de campo `detalles` obligatorio
  - ✅ `ensureTableExists()` para compatibilidad

#### 2️⃣ **Tests de API CRUD** (`api.crud.test.js`)
Tests de integración completos para todos los endpoints REST.

- **Clientes** - 5 tests
  - ✅ GET /api/clientes (lista)
  - ✅ POST /api/clientes (crear con persona)
  - ✅ PUT /api/clientes/:id (actualizar)
  - ✅ DELETE /api/clientes/:id (eliminar en cascada)
  - ✅ Validaciones 400 Bad Request

- **Técnicos** - 5 tests
  - ✅ CRUD completo con normalización persona
  - ✅ GET /api/tecnicos/:id/ordenes
  - ✅ Validaciones de campos obligatorios

- **Órdenes** - 6 tests
  - ✅ CRUD con foreign keys (cliente, tipo_servicio, técnico)
  - ✅ Estados y prioridades válidas
  - ✅ Manejo de costos y fechas

- **Reclamos** - 5 tests
  - ✅ CRUD con campo `detalles`
  - ✅ Manejo de fechas automáticas

#### 3️⃣ **Tests de Autenticación** (`auth.test.js`)
- ✅ POST /login con credenciales válidas
- ✅ POST /login con credenciales inválidas
- ✅ Validación de respuestas (200/401)

#### 4️⃣ **Smoke Tests** (`api.smoke.test.js`)
Tests rápidos para verificar que todos los endpoints respondan.

- ✅ Conexión a base de datos
- ✅ Todos los endpoints GET responden 200
- ✅ Creación básica en cada módulo (POST)

### Cobertura de Tests

**Umbrales mínimos configurados:**
```json
{
  "statements": 75,
  "branches": 65,
  "functions": 85,
  "lines": 75
}
```

**Cobertura actual:**
- ✅ **61 tests pasando** (100% success rate)
- ✅ **7 suites de tests** completas
- ✅ Tiempo de ejecución: ~2 segundos
- ✅ Todos los modelos con +85% de cobertura

### Características de los Tests

**Normalización con `persona`:**
- Los tests reflejan correctamente la arquitectura de DB normalizada
- `clienteModel` y `tecnicoModel` usan tabla `persona` para datos personales
- Tests verifican INSERTs/UPDATEs en ambas tablas
- Eliminación en cascada probada (cliente → persona, técnico → persona)

**Foreign Keys y Cascadas:**
- ✅ `orden_servicio.cliente_id` → CASCADE (elimina órdenes con cliente)
- ✅ `orden_servicio.tecnico_id` → SET NULL (preserva órdenes al eliminar técnico)
- ✅ `persona_referencia` → CASCADE en ambas direcciones
- ✅ Tests verifican comportamiento de cada FK

**Mocking y Aislamiento:**
- Uso de `jest.mock()` para aislar capa de base de datos
- Mock de conexiones con `mockExecute` y `mockEnd`
- Tests unitarios 100% independientes de MySQL
- Silenciado de logs con `jest.spyOn(console)`

**Validaciones Probadas:**
- ✅ Campos obligatorios (razón_social, cuit, nombre, apellido, detalles)
- ✅ Estados y prioridades válidas en órdenes
- ✅ Existencia de registros antes de actualizar/eliminar
- ✅ Responses HTTP correctas (200, 400, 404, 500)

### Estructura de Tests

```
tests/
├── api.crud.test.js         # 🔄 Tests CRUD completos
├── api.smoke.test.js        # 💨 Tests rápidos de salud
├── auth.test.js             # 🔐 Tests de autenticación
└── unit/                    # 🧩 Tests unitarios aislados
    ├── clienteModel.test.js
    ├── ordenModel.test.js
    ├── reclamoModel.test.js
    └── tecnicoModel.test.js
```

### CI/CD Ready

Los tests están configurados para integrarse fácilmente en pipelines:

```yaml
# Ejemplo GitHub Actions
- name: Run Tests
  run: npm test
  
- name: Coverage Report
  run: npm run coverage
  
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

### Mejores Prácticas Implementadas

✅ **AAA Pattern** (Arrange-Act-Assert) en todos los tests  
✅ **Descriptive Names** - Nombres claros que documentan comportamiento  
✅ **Isolated Tests** - Sin dependencias entre tests  
✅ **Fast Execution** - Suite completa en ~2 segundos  
✅ **Deterministic** - Mismo resultado en cada ejecución  
✅ **Comprehensive** - Cubre casos exitosos y de error

## 🛠️ Tecnologías Utilizadas

### Backend
- **Runtime:** Node.js v16+
- **Framework:** Express.js v5.1.0
- **Base de datos:** MySQL (usando mysql2/promise para async/await)
- **Autenticación:** bcrypt v6.0.0
- **CORS:** cors v2.8.5

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Diseño responsive con Flexbox/Grid
- **JavaScript Vanilla** - Sin frameworks, código nativo
- **FullCalendar** - Librería de calendarios interactivos

### Testing & DevOps
- **Jest v29.7** - Framework de testing
- **Supertest v7.0** - Tests de API HTTP
- **Nodemon v3.0** - Auto-reload en desarrollo
- **Cross-env v7.0** - Variables de entorno multiplataforma

### Base de Datos
- **MySQL/MariaDB** - Base de datos relacional
- **Tablas principales:** 
  - `persona` (normalización de datos personales)
  - `cliente` (empresas/clientes)
  - `tecnico` (usuarios técnicos)
  - `orden_servicio` (órdenes de trabajo)
  - `tipo_servicio` (catálogo de servicios)
  - `reclamos` (quejas/reclamos)
  - `persona_referencia` (contactos de referencia)

## 📚 Documentación Adicional

- **`docs/TESTING.md`** - 📖 **Guía completa de testing** (setup, ejecución, troubleshooting)
- **`FLUJO_FUNCIONAMIENTO.md`** - Diagrama de flujo y arquitectura de la aplicación
- **`docs/test/PRUEBAS_IEEE829.md`** - Plan de pruebas según estándar IEEE 829
- **`coverage/lcov-report/index.html`** - Reporte HTML interactivo de cobertura de tests
- **`BaseDeDatos.sql`** - Dump completo del schema de la base de datos
- **`src/scripts/`** - Scripts de utilidad para mantenimiento:
  - `checkData.js` - Verificar datos en la BD
  - `checkOrdenSchema.js` - Validar estructura de orden_servicio
  - `checkReclamos.js` - Verificar tabla reclamos
  - `checkPersonaReferences.js` - Analizar referencias a persona
  - `fixTecnicoForeignKey.js` - Arreglar FK de técnicos
  - `seedData.js` - Poblar BD con datos de prueba

## 🚀 Despliegue en Producción

### Requisitos del Servidor
- Node.js v16 o superior
- MySQL Server 5.7+ o MariaDB 10.4+
- 512MB RAM mínimo (recomendado 1GB)
- Puerto 3000 disponible (o configurar otro en .env)

## 📄 Licencia

ISC
