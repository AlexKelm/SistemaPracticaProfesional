const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { getConnection } = require("./config/db");

const clienteRoutes = require("./routes/clienteRoutes");
const ordenRoutes = require("./routes/ordenRoutes");
const tecnicoRoutes = require("./routes/tecnicoRoutes");


const app = express();
app.use(express.json());
app.use(cors());


// login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const conn = await getConnection();

    const [rows] = await conn.execute(
      "SELECT * FROM usuario WHERE usuario = ?",
      [req.body.username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const usuario = rows[0];

    if (!usuario.password) {
      return res.status(500).json({ message: "El usuario no tiene contraseña registrada" });
    }

    const passwordValida = await bcrypt.compare(req.body.password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    res.json({
      message: "Login exitoso",
      user: { id: usuario.id_usuario, username: usuario.username, rol: usuario.rol }
    });

    await conn.end();

  } catch (err) {
    console.error("❌ Error en /login:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// rutas de clientes
app.use("/clientes", clienteRoutes);

app.use("/ordenes", ordenRoutes);

// rutas de técnicos
app.use("/tecnicos", tecnicoRoutes);

// Iniciar servidor
app.listen(3000, () => {
  console.log("✅ Servidor backend corriendo en http://localhost:3000");
});
