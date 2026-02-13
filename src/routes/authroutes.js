const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const usuarioModel = require("../models/usuarioModel");
const logger = require("../config/logger");

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contraseña requeridos" });
    }

    // Buscar usuario
    const user = await usuarioModel.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Verificar contraseña
    const isValid = await usuarioModel.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        rol: user.rol
      }
    });
  } catch (err) {
    logger.error({ 
      error: err.message, 
      stack: err.stack,
      username: req.body.username,
      ip: req.ip 
    }, "Error en login");
    res.status(500).json({ error: "Error en el servidor" });
  }
});



module.exports = router;