### 1. ** Estructura de Carpetas**
```
proyecto/
├── src/                 # Backend (Express.js)
├── public/              # Frontend (HTML, CSS, JS estáticos)
├── package.json         # Dependencias 
└── README.md           # Documentación q
```

### 2. **Separación de Responsabilidades**
- **Backend:** Todo en `src/` (app.js, models, routes, config, scripts)
- **Frontend:** Todo en `public/` (HTML, CSS, JS, imágenes)

### 3. **URLs de API Actualizadas**
- ruta: `/api/clientes` 

### 4. **Scripts en package.json**
```json
{
  "start": "node src/app.js",
  "dev": "nodemon src/app.js",
  "crear-usuario": "node src/scripts/crearUsuario.js",
  "crear-tecnicos": "node src/scripts/crearTecnicos.js"
}
```

## Introduccion

### Paso 1: Instalar Dependencias
```bash
cd "c:\Users\Alex PC\Desktop\SistemaPracticaProfesional"
npm install
```

### Paso 2: Configurar Base de Datos (si es primera vez)
```bash
# Si ya existe la BD, omitir este paso
mysql -u root < BaseDeDatos.sql

# Crear usuario admin
npm run crear-usuario

# (Opcional) Crear técnicos de ejemplo
npm run crear-tecnicos
```

### Paso 3: Iniciar el Servidor

**Desarrollo (con auto-reload):**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

### Paso 4: Acceder a la Aplicación
- **URL:** http://localhost:3000
- **Login:** admin / admin123


## Cambios en URLs 

### Login
- Antes: `fetch("http://localhost:3000/login", ...)`
- Ahora: `fetch("/login", ...)`

### API Endpoints (todos con prefijo `/api`)
```javascript
// Antes
fetch("http://localhost:3000/clientes")      // ❌
fetch("http://localhost:3000/ordenes")       // ❌
fetch("http://localhost:3000/tecnicos")      // ❌

// Ahora (URLs relativas)
fetch("/api/clientes")                        // ✅
fetch("/api/ordenes")                         // ✅
fetch("/api/tecnicos")                        // ✅
```

## ✅ Verificación Rápida

Para verificar que todo funciona:

```bash
# 1. Ver si el servidor inicia
npm start
# Debería mostrar: "✅ Servidor corriendo en http://localhost:3000"

# 2. Probar endpoints en otra terminal
curl http://localhost:3000/api/clientes
# Debería devolver un JSON

# 3. Probar login en navegador
# http://localhost:3000/login
# Usar: admin / admin123
```

## 📋 Archivos de Referencia Creados

1. **ESTRUCTURA_NUEVA.md** - Documentación técnica detallada
2. **VERIFICACION.md** - Checklist de verificación
3. **README.md** - Actualizado con nueva estructura

## ⚠️ Notas Importantes

1. **NO ELIMINAR** la carpeta `Backend/` aún (hasta confirmar que todo funciona)
2. **Las credenciales por defecto** para login son: `admin` / `admin123`
3. **La BD debe estar corriendo** en MySQL en `localhost`
4. **Express sirve archivos estáticos** automáticamente desde `public/`
5. **URLs son ahora relativas** - no dependen de `localhost:3000`

## 🛠️ Próximos Pasos Recomendados

1. **Crear archivo `.env`** para variables de entorno:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=proyecto
PORT=3000
NODE_ENV=development
```

2. **Implementar validación** en los models usando `joi`

3. **Agregar autenticación JWT** para mayor seguridad

4. **Agregar tests** con mocha/chai

5. **Documentar API** con Swagger/OpenAPI

## 🎯 Beneficios de la Nueva Estructura

✅ **Profesional** - Sigue estándares de la industria
✅ **Escalable** - Fácil agregar nuevas funcionalidades
✅ **Mantenible** - Código organizado y claro
✅ **Flexible** - Fácil desplegar en diferentes ambientes
✅ **Seguro** - Mejor gestión de archivos estáticos

## 📞 Soporte

Si tienes problemas:

1. Verifica que MySQL está corriendo
2. Verifica que la BD `proyecto` existe
3. Verifica que Node.js está instalado (`node -v`)
4. Verifica los permisos de archivos

## ¡Listo para Usar! 🚀

Tu proyecto está completamente reestructurado y listo para desarrollo y producción.

**Comandos rápidos:**
```bash
npm install      # Instalar dependencias (una sola vez)
npm run dev      # Iniciar en desarrollo
npm start        # Iniciar en producción
```

¡Que disfrutes tu nuevo proyecto estructura profesionalmente! 🎉
