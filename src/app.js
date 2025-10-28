const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const path = require("path");
const { getConnection } = require("./config/db");

// Rutas
const clienteRoutes = require("./routes/clienteRoutes");
const ordenRoutes = require("./routes/ordenRoutes");
const tecnicoRoutes = require("./routes/tecnicoRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

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
      await conn.end();
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const usuario = rows[0];

    if (!usuario.password) {
      await conn.end();
      return res.status(500).json({ message: "El usuario no tiene contraseña registrada" });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      await conn.end();
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    await conn.end();

    res.json({
      message: "Login exitoso",
      user: { 
        id: usuario.id_usuario, 
        username: usuario.usuario, 
        rol: usuario.rol 
      }
    });

  } catch (err) {
    console.error("❌ Error en /login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Rutas API
app.use("/api/clientes", clienteRoutes);
app.use("/api/ordenes", ordenRoutes);
app.use("/api/tecnicos", tecnicoRoutes);

// Ruta para servir archivos HTML (SPA fallback)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
