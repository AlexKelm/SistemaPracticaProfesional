# Sistema de Práctica Profesional

## 📋 Descripción
Sistema integral de gestión de órdenes de servicio técnico desarrollado con Node.js, Express y MySQL. Incluye gestión de usuarios, clientes, técnicos, órdenes de servicio, reclamos y agenda.

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
│   ├── middleware/             # Middleware 
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

### 4. Iniciar el Servidor

**Modo desarrollo** (con auto-reload):
```bash
npm run dev
```

**Modo producción**:
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

## 📝 Scripts <Importantes>

- `npm start` - Inicia el servidor en modo producción
- `npm run dev` - Inicia el servidor en modo desarrollo (con nodemon para auto-reload)
- `npm test` - Ejecuta los tests con Jest
- `npm run coverage` - Genera reporte de cobertura de tests


## 🌐 Acceso a la Aplicación

Después de iniciar el servidor, accede a:
- **Inicio:** http://localhost:3000 (redirige automáticamente a login)
- **Login:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard (requiere login)
- **Clientes:** http://localhost:3000/clientes (requiere login)
- **Órdenes:** http://localhost:3000/ordenes (requiere login)
- **Técnicos:** http://localhost:3000/tecnicos (requiere login)
- **Reclamos:** http://localhost:3000/reclamos (requiere login)
- **Agenda:** http://localhost:3000/agenda (requiere login)

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
- ✅ Implementado JWT para validacion de sesiones

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


## 🚀 Producción

### Requisitos del Servidor
- Node.js v16 o superior
- MySQL Server 5.7+ o MariaDB 10.4+
- 512MB RAM mínimo (recomendado 1GB)
- Puerto 3000 disponible (o configurar otro en .env)

## 📄 Licencia

ISC
