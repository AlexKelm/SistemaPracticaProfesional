# Sistema de Practica Profesional

##  Instalación y Uso

### Prerrequisitos
- Node.js (versión 16 o superior)
- MySQL Server

### Instalación
```bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]
cd Proyecto

# Instalar dependencias
npm install
```

### Configuración de Base de Datos
1. Crear base de datos MySQL con el archivo `BaseDeDatos.sql`
3. Crear usuario administrador:
```bash
npm run crear-usuario
las credenciales son "admin", "admin123 luego de aplicar el hasheo
```

### Iniciar el Proyecto
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

Abrir el archivo html sea index.html par ir al login o dashboard.html para ir directo al menu principal 

### Scripts Disponibles
- `npm start` - Inicia el servidor
- `npm run dev` - Inicia con auto-reload (desarrollo)
- `npm run crear-usuario` - Crea usuario administrador
