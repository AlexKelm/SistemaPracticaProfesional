const express = require("express");
const router = express.Router();
const tipoServicioModel = require("../models/tipoServicioModel");
const logger = require("../config/logger");

// GET todos los tipos de servicio
router.get("/", async (req, res) => {
  try {
    const tipos = await tipoServicioModel.getAll();
    res.json(tipos);
  } catch (err) {
    logger.error({ error: err.message }, "Error al obtener tipos de servicio");
    res.status(500).json({ error: "Error al obtener tipos de servicio" });
  }
});

// GET tipo de servicio por ID
router.get("/:id", async (req, res) => {
  try {
    const tipo = await tipoServicioModel.getById(req.params.id);
    if (!tipo) return res.status(404).json({ error: "Tipo de servicio no encontrado" });
    res.json(tipo);
  } catch (err) {
    logger.error({ error: err.message }, "Error al obtener tipo de servicio");
    res.status(500).json({ error: "Error al obtener tipo de servicio" });
  }
});

// Crear tipo de servicio
router.post("/", async (req, res) => {
  try {
    await tipoServicioModel.create(req.body);
    res.json({ message: "Tipo de servicio creado correctamente" });
  } catch (err) {
    console.error("Error al crear tipo de servicio:", err);
    if (err.message === "Nombre es obligatorio") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al crear tipo de servicio" });
  }
});

// Actualizar tipo de servicio
router.put("/:id", async (req, res) => {
  try {
    const result = await tipoServicioModel.update(req.params.id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tipo de servicio no encontrado" });
    }
    res.json({ message: "Tipo de servicio actualizado correctamente" });
  } catch (err) {
    logger.error({ error: err.message }, "Error al actualizar tipo de servicio");
    res.status(500).json({ error: "Error al actualizar tipo de servicio" });
  }
});

// Eliminar tipo de servicio
router.delete("/:id", async (req, res) => {
  try {
    const result = await tipoServicioModel.remove(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Tipo de servicio no encontrado" });
    }
    res.json({ message: "Tipo de servicio eliminado correctamente" });
  } catch (err) {
    logger.error({ error: err.message }, "Error al eliminar tipo de servicio");
    res.status(500).json({ error: "Error al eliminar tipo de servicio" });
  }
});

module.exports = router;
