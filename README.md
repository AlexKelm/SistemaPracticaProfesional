# Sistema de Practica Profesional

## 📋 Descripción
Sistema de gestión de órdenes de servicio desarrollado con Node.js, Express y MySQL.

## 📦 Estructura del Proyecto

```
├── src/                          # Código del backend
│   ├── app.js                   # Punto de entrada principal
│   ├── config/                  # Configuración
│   │   └── db.js               # Configuración de base de datos
│   ├── models/                 # Modelos de datos
│   │   ├── clienteModel.js
│   │   ├── ordenModel.js
│   │   ├── tecnicoModel.js
│   │   └── reclamoModel.js
│   ├── routes/                 # Rutas API
│   │   ├── clienteRoutes.js
│   │   ├── ordenRoutes.js
│   │   ├── tecnicoRoutes.js
│   │   └── reclamoRoutes.js
│   ├── middleware/             # Middleware personalizado
│   └── scripts/                # Scripts de utilidad
│       ├── crearUsuario.js
│       └── crearTecnicos.js
├── public/                      # Archivos estáticos (frontend)
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── clientes.html
│   ├── ordenes.html
│   ├── tecnicos.html
│   ├── agenda.html
│   ├── reclamos.html
│   ├── css/                    # Estilos
│   ├── js/                     # Scripts del frontend
│   └── src/                    # Recursos estáticos (imágenes, etc)
├── BaseDeDatos.sql             # Dump de la base de datos
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
1. Crear la base de datos con el archivo `BaseDeDatos.sql`:
```bash
mysql -u root < BaseDeDatos.sql
```

2. (Opcional) Configurar variables de entorno en un archivo `.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=proyecto
PORT=3000
```

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
- `npm run dev` - Inicia el servidor en modo desarrollo (con nodemon)
- `npm run crear-usuario` - Crea un usuario administrador predeterminado
- `npm run crear-tecnicos` - Crea técnicos de ejemplo en la base de datos

## 🌐 Acceso a la Aplicación

Después de iniciar el servidor, accede a:
- **Login:** http://localhost:3000/login.html
- **Dashboard:** http://localhost:3000/dashboard.html (después de autenticarse)
- **Index:** http://localhost:3000 (redirige a login.html)

## 🔗 API Endpoints

### Autenticación
- `POST /login` - Autenticación de usuarios

### Clientes
- `GET /api/clientes` - Obtener todos los clientes
- `GET /api/clientes/:id` - Obtener cliente por ID
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

### Órdenes de Servicio
- `GET /api/ordenes` - Obtener todas las órdenes
- `GET /api/ordenes/:id` - Obtener orden por ID
- `POST /api/ordenes` - Crear nueva orden
- `PUT /api/ordenes/:id` - Actualizar orden
- `DELETE /api/ordenes/:id` - Eliminar orden

### Técnicos
- `GET /api/tecnicos` - Obtener todos los técnicos
- `GET /api/tecnicos/:id` - Obtener técnico por ID
- `GET /api/tecnicos/:id/ordenes` - Obtener órdenes asignadas
- `POST /api/tecnicos` - Crear nuevo técnico
- `PUT /api/tecnicos/:id` - Actualizar técnico
- `DELETE /api/tecnicos/:id` - Eliminar técnico
- `POST /api/tecnicos/:id/asignar-orden` - Asignar orden a técnico

### Reclamos
- `GET /api/reclamos` - Obtener todos los reclamos
- `GET /api/reclamos/:id` - Obtener reclamo por ID
- `POST /api/reclamos` - Crear nuevo reclamo
- `PUT /api/reclamos/:id` - Actualizar reclamo
- `DELETE /api/reclamos/:id` - Eliminar reclamo

## 🔒 Seguridad

- Las contraseñas se hashen con bcrypt
- Se validan todos los datos en el backend
- Se utiliza CORS para control de acceso
- Se previenen usuarios duplicados

## 🛠️ Tecnologías Utilizadas

- **Backend:** Node.js, Express.js
- **Base de datos:** MySQL 2/Promise
- **Autenticación:** bcrypt
- **Frontend:** HTML5, CSS3, JavaScript Vanilla
- **Calendarios:** FullCalendar

## 📄 Licencia

ISC
