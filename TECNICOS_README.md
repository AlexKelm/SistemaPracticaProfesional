# Módulo de Técnicos - Sistema de Gestión

## Descripción
El módulo de técnicos permite gestionar los técnicos del sistema, incluyendo su creación, edición, eliminación y visualización de órdenes asignadas.

## Archivos Creados/Modificados

### Backend
- `Backend/models/tecnicoModel.js` - Modelo para manejo de datos de técnicos
- `Backend/routes/tecnicoRoutes.js` - Rutas API para técnicos
- `Backend/app.js` - Integración de rutas de técnicos
- `Backend/scripts/crearTecnicos.js` - Script para crear técnicos de ejemplo

### Frontend
- `tecnicos.html` - Página principal de técnicos (modificada)
- `js/tecnicos.js` - Lógica JavaScript para funcionalidad dinámica
- `css/tecnicos.css` - Estilos para modales y componentes (actualizado)

## Funcionalidades

### 1. Gestión de Técnicos
- **Crear técnico**: Formulario para agregar nuevos técnicos
- **Editar técnico**: Modificar datos de técnicos existentes
- **Eliminar técnico**: Marcar técnico como inactivo
- **Buscar técnicos**: Filtro en tiempo real por nombre, apellido, usuario o email

### 2. Visualización
- **Lista de técnicos**: Tabla con información completa
- **Estado**: Indicador visual de técnicos activos/inactivos
- **Órdenes asignadas**: Ver órdenes de servicio asignadas a cada técnico

### 3. API Endpoints

#### GET `/tecnicos`
Obtiene todos los técnicos registrados.

#### GET `/tecnicos/:id`
Obtiene un técnico específico por ID.

#### POST `/tecnicos`
Crea un nuevo técnico.
```json
{
  "nombre": "Carlos",
  "apellido": "López",
  "usuario": "carlos.lopez",
  "password": "contraseña123",
  "email": "carlos@empresa.com"
}
```

#### PUT `/tecnicos/:id`
Actualiza un técnico existente.

#### DELETE `/tecnicos/:id`
Marca un técnico como inactivo.

#### GET `/tecnicos/:id/ordenes`
Obtiene las órdenes asignadas a un técnico específico.

#### POST `/tecnicos/:id/asignar-orden`
Asigna un técnico a una orden específica.
```json
{
  "ordenId": 123
}
```

## Instalación y Configuración

### 1. Instalar Dependencias
```bash
cd Backend
npm install
```

### 2. Configurar Base de Datos
Asegúrate de que la base de datos esté configurada con la estructura de la tabla `usuario` según `BaseDeDatos.sql`.

### 3. Crear Técnicos de Ejemplo (Opcional)
```bash
cd Backend
node scripts/crearTecnicos.js
```

### 4. Iniciar Servidor
```bash
cd Backend
node app.js
```

### 5. Acceder a la Aplicación
Abre `tecnicos.html` en tu navegador.

## Estructura de Datos

### Tabla `usuario` (para técnicos)
- `id_usuario`: ID único del técnico
- `nombre`: Nombre del técnico
- `apellido`: Apellido del técnico
- `usuario`: Nombre de usuario único
- `password`: Contraseña hasheada
- `email`: Email del técnico
- `rol`: Debe ser 'tecnico'
- `activo`: Estado del técnico (true/false)
- `fecha_creacion`: Fecha de creación del registro

## Características Técnicas

### Seguridad
- Contraseñas hasheadas con bcrypt
- Validación de datos en backend
- Prevención de usuarios duplicados

### Interfaz de Usuario
- Modales responsivos para crear/editar
- Búsqueda en tiempo real
- Indicadores visuales de estado
- Mensajes de confirmación y error

### API RESTful
- Endpoints REST estándar
- Manejo de errores consistente
- Respuestas JSON estructuradas

## Uso

1. **Agregar Técnico**: Haz clic en "Nuevo Técnico" y completa el formulario
2. **Editar Técnico**: Haz clic en "Editar" en la fila del técnico deseado
3. **Eliminar Técnico**: Haz clic en "Eliminar" (marca como inactivo)
4. **Ver Órdenes**: Haz clic en "Ver Órdenes" para ver órdenes asignadas
5. **Buscar**: Usa el campo de búsqueda para filtrar técnicos

## Notas Importantes

- Los técnicos se crean con rol 'tecnico' automáticamente
- La eliminación marca el técnico como inactivo, no lo borra físicamente
- Las contraseñas se hashean automáticamente
- El sistema valida que no existan usuarios duplicados
- Los técnicos pueden ser asignados a órdenes de servicio
