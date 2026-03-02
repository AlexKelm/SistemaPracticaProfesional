const express = require("express");
const router = express.Router();
const usuarioModel = require("../models/usuarioModel");
const logger = require("../config/logger");

// GET todos los usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await usuarioModel.getAll();
    res.json(usuarios);
  } catch (err) {
    logger.error({ 
      error: err.message, 
      stack: err.stack,
      user: req.user ? { id: req.user.id, username: req.user.username } : undefined 
    }, "Error al obtener usuarios");
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// GET usuario por ID
router.get("/:id", async (req, res) => {
  try {
    const usuario = await usuarioModel.getById(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(usuario);
  } catch (err) {
    logger.error({ error: err.message }, "Error al obtener usuario");
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// POST crear nuevo usuario
router.post("/", async (req, res) => {
  try {
    const { usuario, password, rol } = req.body;
    
    if (!usuario || !password || !rol) {
      return res.status(400).json({ error: "Faltan campos obligatorios (usuario, password, rol)" });
    }
    
    const result = await usuarioModel.create(usuario, password, rol);
    res.status(201).json({ 
      message: "Usuario creado correctamente",
      id: result.insertId 
    });
  } catch (err) {
    logger.error({ error: err.message }, "Error al crear usuario");
    res.status(500).json({ error: "Error al crear usuario" });
  }
});

// PUT actualizar usuario
router.put("/:id", async (req, res) => {
  try {
    const { usuario, rol, activo, password } = req.body;
    
    if (!usuario || !rol || activo === undefined) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }
    
    await usuarioModel.update(req.params.id, { usuario, rol, activo, password });
    res.json({ message: "Usuario actualizado correctamente" });
  } catch (err) {
    logger.error({ error: err.message }, "Error al actualizar usuario");
    res.status(500).json({ error: "Error al actualizar usuario" });
  }
});

// DELETE usuario 
router.delete("/:id", async (req, res) => {
  try {
    await usuarioModel.deleteUser(req.params.id);
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    logger.error({ error: err.message }, "Error al eliminar usuario");
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

module.exports = router;