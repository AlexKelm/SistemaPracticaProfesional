const express = require("express");
const router = express.Router();
const reclamoModel = require("../models/reclamoModel");

// GET todos los reclamos
router.get("/", async (req, res) => {
  try {
    const reclamos = await reclamoModel.getAll();
    res.json(reclamos);
  } catch (err) {
    console.error("Error al obtener reclamos:", err);
    res.status(500).json({ error: "Error al obtener reclamos" });
  }
});

// GET reclamo por ID
router.get("/:id", async (req, res) => {
  try {
    const reclamo = await reclamoModel.getById(req.params.id);
    if (!reclamo) return res.status(404).json({ error: "Reclamo no encontrado" });
    res.json(reclamo);
  } catch (err) {
    console.error("Error al obtener reclamo:", err);
    res.status(500).json({ error: "Error al obtener reclamo" });
  }
});

// Crear reclamo
router.post("/", async (req, res) => {
  try {
    await reclamoModel.create(req.body);
    res.json({ message: "Reclamo creado correctamente" });
  } catch (err) {
    console.error("Error al crear reclamo:", err);
    if (err.message === "cliente_id es obligatorio") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Error al crear reclamo" });
  }
});

// Actualizar reclamo
router.put("/:id", async (req, res) => {
  try {
    const result = await reclamoModel.update(req.params.id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }
    res.json({ message: "Reclamo actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar reclamo:", err);
    res.status(500).json({ error: "Error al actualizar reclamo" });
  }
});

// Eliminar reclamo
router.delete("/:id", async (req, res) => {
  try {
    const result = await reclamoModel.remove(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reclamo no encontrado" });
    }
    res.json({ message: "Reclamo eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar reclamo:", err);
    res.status(500).json({ error: "Error al eliminar reclamo" });
  }
});

module.exports = router;
