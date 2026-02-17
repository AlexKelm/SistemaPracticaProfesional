const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const path = require("path");
const { getConnection } = require("./config/db");
const logger = require("./config/logger");
const requestLogger = require("./middleware/requestlogger");
require('dotenv').config();

// Importar rutas de auth
const authRoutes = require("./routes/authroutes");

// Rutas
const clienteRoutes = require("./routes/clienteRoutes");
const ordenRoutes = require("./routes/ordenRoutes");
const tecnicoRoutes = require("./routes/tecnicoRoutes");
const reclamoRoutes = require("./routes/reclamoRoutes");
const tipoServicioRoutes = require("./routes/tipoServicioRoutes");

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(requestLogger);  // ← AGREGAR (después de cors, antes de rutas)

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, "../public")));

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const conn = await getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM usuario WHERE usuario = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const usuario = rows[0];

    if (!usuario.password) {
      return res.status(500).json({ message: "El usuario no tiene contraseña registrada" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    res.json({
      message: "Login exitoso",
      user: { 
        id: usuario.id_usuario, 
        username: usuario.usuario, 
        rol: usuario.rol 
      }
    });

  } catch (err) {
    logger.error({ error: err.message, stack: err.stack }, "Error en /login");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Registrar ruta de auth (ANTES de las rutas protegidas)
app.use("/api/auth", authRoutes);

// Importar middleware
const { authenticateToken, requireRole } = require("./middleware/auth");

// Proteger rutas existentes (DESPUÉS de registrar authRoutes)
app.use("/api/clientes", authenticateToken, clienteRoutes);
app.use("/api/tecnicos", authenticateToken, tecnicoRoutes);
app.use("/api/ordenes", authenticateToken, ordenRoutes);
app.use("/api/reclamos", authenticateToken, reclamoRoutes);


app.use("/api/tipo-servicio", tipoServicioRoutes);

// Middleware para servir páginas HTML sin extensión
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  const allowedPages = ['login', 'dashboard', 'clientes', 'tecnicos', 'ordenes', 'reclamos', 'agenda'];
  
  if (allowedPages.includes(page)) {
    res.sendFile(path.join(__dirname, `../public/${page}.html`));
  } else {
    next();
  }
});

// Ruta para servir archivos HTML (SPA fallback)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Exportar la app sin iniciar el servidor si es entorno de pruebas
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info("Servidor corriendo en http://localhost:3000");
  });
}

module.exports = app;

