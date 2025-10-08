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
1. Crear base de datos MySQL llamada `proyecto`
2. Configurar credenciales en `Backend/config/db.js`
3. Crear usuario administrador:
```bash
npm run crear-usuario
```

### Iniciar el Proyecto
```bash
npm start
```

El servidor se ejecutará en `http://localhost:3000`

### Scripts Disponibles
- `npm start` - Inicia el servidor
- `npm run dev` - Inicia con auto-reload (desarrollo)
- `npm run crear-usuario` - Crea usuario administrador
